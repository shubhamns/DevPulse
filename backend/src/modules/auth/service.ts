import { Types } from "mongoose";
import type { Env } from "../../config/env.js";
import type { OrganizationRole } from "../../models/OrganizationMember.js";
import { AppError } from "../../utils/errors.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  tokenHashesMatch,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { AuthRepository } from "./repository.js";
import type { AuthSession, AuthUser } from "./types.js";
import type { LoginInput, RegisterInput } from "./validators.js";

function toUser(user: { _id: Types.ObjectId; email: string; name: string }): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

export class AuthService {
  constructor(
    private readonly env: Env,
    private readonly authRepository = new AuthRepository(),
  ) {}

  async register(input: RegisterInput): Promise<AuthSession> {
    const existing = await this.authRepository.findByEmail(input.email);

    if (existing) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");
    }

    const user = await this.authRepository.create({
      email: input.email,
      passwordHash: await hashPassword(input.password),
      name: input.name,
    });

    return this.issueSession(user._id.toString(), user.email, user.name);
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const user = await this.authRepository.findByEmailWithSecrets(input.email);

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    return this.issueSession(user._id.toString(), user.email, user.name);
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    let payload;

    try {
      payload = verifyRefreshToken(refreshToken, this.env);
    } catch {
      throw new AppError(401, "UNAUTHORIZED", "Invalid refresh token");
    }

    const user = await this.authRepository.findByIdWithRefreshHash(payload.sub);

    if (!user?.refreshTokenHash || !tokenHashesMatch(hashToken(refreshToken), user.refreshTokenHash)) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid refresh token");
    }

    return this.issueSession(user._id.toString(), user.email, user.name);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken, this.env);
      await this.authRepository.clearRefreshTokenHash(payload.sub);
    } catch {
      // Already logged out.
    }
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const memberships = await this.authRepository.findMemberships(userId);

    return {
      user: toUser(user),
      organizations: memberships
        .filter((membership) => membership.organizationId)
        .map((membership) => {
          const organization = membership.organizationId as unknown as {
            _id: Types.ObjectId;
            name: string;
            slug: string;
          };

          return {
            id: organization._id.toString(),
            name: organization.name,
            slug: organization.slug,
            role: membership.role as OrganizationRole,
          };
        }),
    };
  }

  private async issueSession(userId: string, email: string, name: string): Promise<AuthSession> {
    const tokenPayload = { sub: userId, email };
    const accessToken = signAccessToken(tokenPayload, this.env);
    const refreshToken = signRefreshToken(tokenPayload, this.env);

    await this.authRepository.setRefreshTokenHash(userId, hashToken(refreshToken));

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, name },
    };
  }
}

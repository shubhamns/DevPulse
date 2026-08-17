import jwt, { type SignOptions } from "jsonwebtoken";
import type { Env } from "../config/env.js";
import { AppError } from "./errors.js";

type GitHubOAuthStatePayload = {
  purpose: "github_oauth";
  userId: string;
  organizationId: string;
};

export function signGitHubOAuthState(
  userId: string,
  organizationId: string,
  env: Env,
): string {
  return jwt.sign(
    {
      purpose: "github_oauth",
      userId,
      organizationId,
    } satisfies GitHubOAuthStatePayload,
    env.JWT_SECRET,
    { expiresIn: "10m" } as SignOptions,
  );
}

export function verifyGitHubOAuthState(state: string, env: Env): GitHubOAuthStatePayload {
  try {
    const decoded = jwt.verify(state, env.JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null) {
      throw new Error("Invalid state payload");
    }

    const purpose = "purpose" in decoded ? decoded.purpose : undefined;
    const userId = "userId" in decoded ? decoded.userId : undefined;
    const organizationId = "organizationId" in decoded ? decoded.organizationId : undefined;

    if (
      purpose !== "github_oauth" ||
      typeof userId !== "string" ||
      typeof organizationId !== "string"
    ) {
      throw new Error("Invalid state payload");
    }

    return {
      purpose: "github_oauth",
      userId,
      organizationId,
    };
  } catch {
    throw new AppError(400, "INVALID_OAUTH_STATE", "Invalid or expired GitHub OAuth state");
  }
}

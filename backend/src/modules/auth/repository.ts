import { Types } from "mongoose";
import { OrganizationMember } from "../../models/OrganizationMember.js";
import { User } from "../../models/User.js";

export class AuthRepository {
  findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase() });
  }

  findByEmailWithSecrets(email: string) {
    return User.findOne({ email: email.toLowerCase() }).select("+passwordHash +refreshTokenHash");
  }

  findById(id: string) {
    return User.findById(id);
  }

  findByIdWithRefreshHash(id: string) {
    return User.findById(id).select("+refreshTokenHash");
  }

  create(data: { email: string; passwordHash: string; name: string }) {
    return User.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
    });
  }

  setRefreshTokenHash(userId: string, refreshTokenHash: string) {
    return User.findByIdAndUpdate(userId, { refreshTokenHash });
  }

  clearRefreshTokenHash(userId: string) {
    return User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
  }

  findMemberships(userId: string) {
    return OrganizationMember.find({ userId: new Types.ObjectId(userId) })
      .populate("organizationId")
      .lean();
  }
}

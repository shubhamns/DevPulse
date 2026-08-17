import { Types } from "mongoose";
import { ApiKey } from "../../models/ApiKey.js";

export class ApiKeyRepository {
  findActiveByHash(keyHash: string) {
    return ApiKey.findOne({ keyHash, revokedAt: null }).lean();
  }

  findActiveByProject(projectId: string) {
    return ApiKey.find({
      projectId: new Types.ObjectId(projectId),
      revokedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  findById(id: string) {
    return ApiKey.findById(id);
  }

  create(data: {
    projectId: Types.ObjectId;
    organizationId: Types.ObjectId;
    keyHash: string;
    keyPrefix: string;
    lastFour: string;
    label: string;
    createdBy: Types.ObjectId;
  }) {
    return ApiKey.create({
      ...data,
      revokedAt: null,
    });
  }

  revokeAllForProject(projectId: Types.ObjectId) {
    return ApiKey.updateMany(
      { projectId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }
}

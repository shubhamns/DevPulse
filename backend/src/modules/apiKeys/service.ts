import { Types } from "mongoose";
import type { Env } from "../../config/env.js";
import { AppError } from "../../utils/errors.js";
import { generateApiKeyValue, getApiKeyDisplayParts, hashApiKey } from "../../utils/apiKey.js";
import { OrganizationService } from "../organizations/service.js";
import { ProjectRepository } from "../projects/repository.js";
import { ApiKeyRepository } from "./repository.js";
import type { CreateApiKeyInput } from "./validators.js";

function serializeApiKey(
  apiKey: {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    organizationId: Types.ObjectId;
    keyPrefix: string;
    lastFour: string;
    label?: string;
    revokedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
  plainKey?: string,
) {
  return {
    id: apiKey._id.toString(),
    projectId: apiKey.projectId.toString(),
    organizationId: apiKey.organizationId.toString(),
    label: apiKey.label ?? "Default",
    keyPrefix: apiKey.keyPrefix,
    lastFour: apiKey.lastFour,
    maskedKey: `${apiKey.keyPrefix}...${apiKey.lastFour}`,
    revokedAt: apiKey.revokedAt ? apiKey.revokedAt.toISOString() : null,
    createdAt: apiKey.createdAt.toISOString(),
    updatedAt: apiKey.updatedAt.toISOString(),
    ...(plainKey ? { key: plainKey } : {}),
  };
}

export class ApiKeyService {
  constructor(
    private readonly env: Env,
    private readonly organizationService: OrganizationService,
    private readonly apiKeys = new ApiKeyRepository(),
    private readonly projects = new ProjectRepository(),
  ) {}

  async listForProject(userId: string, projectId: string) {
    await this.requireProjectAccess(userId, projectId);
    const keys = await this.apiKeys.findActiveByProject(projectId);
    return keys.map((apiKey) => serializeApiKey(apiKey));
  }

  async createForProject(userId: string, projectId: string, input: CreateApiKeyInput = {}) {
    const project = await this.requireProjectAccess(userId, projectId);
    await this.organizationService.requireWriteAccess(userId, project.organizationId.toString());

    const plainKey = generateApiKeyValue();
    const { keyPrefix, lastFour } = getApiKeyDisplayParts(plainKey);
    const apiKey = await this.apiKeys.create({
      projectId: project._id,
      organizationId: project.organizationId,
      keyHash: hashApiKey(plainKey, this.env.JWT_SECRET),
      keyPrefix,
      lastFour,
      label: input.label ?? "Default",
      createdBy: new Types.ObjectId(userId),
    });

    return serializeApiKey(apiKey, plainKey);
  }

  async revokeForUser(userId: string, apiKeyId: string) {
    if (!Types.ObjectId.isValid(apiKeyId)) {
      throw new AppError(404, "API_KEY_NOT_FOUND", "API key not found");
    }

    const apiKey = await this.apiKeys.findById(apiKeyId);

    if (!apiKey || apiKey.revokedAt) {
      throw new AppError(404, "API_KEY_NOT_FOUND", "API key not found");
    }

    await this.organizationService.requireWriteAccess(userId, apiKey.organizationId.toString());
    apiKey.revokedAt = new Date();
    await apiKey.save();
    return serializeApiKey(apiKey);
  }

  private async requireProjectAccess(userId: string, projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    const project = await this.projects.findByIdLean(projectId);

    if (!project) {
      throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
    }

    await this.organizationService.requireMembership(userId, project.organizationId.toString());
    return project;
  }
}

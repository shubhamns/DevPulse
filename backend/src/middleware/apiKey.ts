import type { NextFunction, Request, Response } from "express";
import type { Env } from "../config/env.js";
import { ApiKeyRepository } from "../modules/apiKeys/repository.js";
import { hashApiKey, isValidApiKeyFormat } from "../utils/apiKey.js";
import { AppError } from "../utils/errors.js";

export type ApiKeyContext = {
  apiKeyId: string;
  projectId: string;
  organizationId: string;
};

export type ApiKeyRequest = Request & {
  apiKeyContext: ApiKeyContext;
};

export function requireApiKey(env: Env) {
  const apiKeys = new ApiKeyRepository();

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization ?? "";
      const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

      if (!token || !isValidApiKeyFormat(token)) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid API key");
      }

      const record = await apiKeys.findActiveByHash(hashApiKey(token, env.JWT_SECRET));

      if (!record) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid API key");
      }

      (req as ApiKeyRequest).apiKeyContext = {
        apiKeyId: record._id.toString(),
        projectId: record.projectId.toString(),
        organizationId: record.organizationId.toString(),
      };
      next();
    } catch (error) {
      next(error instanceof AppError ? error : new AppError(401, "UNAUTHORIZED", "Invalid API key"));
    }
  };
}

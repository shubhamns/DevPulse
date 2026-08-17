import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { routeParam } from "../../utils/asyncHandler.js";
import { parseInput } from "../../utils/validation.js";
import type { ApiKeyService } from "./service.js";
import { createApiKeySchema } from "./validators.js";

export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  listForProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const apiKeys = await this.apiKeyService.listForProject(req.auth.userId, routeParam(req, "id"));
    res.json({ apiKeys });
  };

  createForProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const apiKey = await this.apiKeyService.createForProject(
      req.auth.userId,
      routeParam(req, "id"),
      parseInput(createApiKeySchema, req.body ?? {}),
    );
    res.status(201).json({ apiKey });
  };

  revoke = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const apiKey = await this.apiKeyService.revokeForUser(req.auth.userId, routeParam(req, "id"));
    res.json({ apiKey });
  };
}

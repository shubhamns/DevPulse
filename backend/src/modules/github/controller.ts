import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { parseInput } from "../../utils/validation.js";
import type { GitHubService } from "./service.js";
import {
  githubCallbackQuerySchema,
  githubConnectQuerySchema,
  githubIntegrationQuerySchema,
  githubRepositorySchema,
} from "./validators.js";

export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  connect = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { organizationId } = parseInput(githubConnectQuerySchema, req.query);
    const authorizeUrl = await this.githubService.getConnectUrl(req.auth.userId, organizationId);
    res.json({ authorizeUrl });
  };

  callback = async (req: Request, res: Response): Promise<void> => {
    const { code, state } = parseInput(githubCallbackQuerySchema, req.query);
    res.redirect(await this.githubService.handleCallback(code, state));
  };

  status = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { organizationId } = parseInput(githubIntegrationQuerySchema, req.query);
    const integration = await this.githubService.getIntegration(req.auth.userId, organizationId);
    res.json({
      configured: this.githubService.isConfigured(),
      integration,
    });
  };

  repositories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { organizationId } = parseInput(githubIntegrationQuerySchema, req.query);
    res.json(await this.githubService.listRepositories(req.auth.userId, organizationId));
  };

  setRepository = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { organizationId, owner, repo } = parseInput(githubRepositorySchema, req.body);
    const integration = await this.githubService.setRepository(
      req.auth.userId,
      organizationId,
      owner,
      repo,
    );
    res.json({ integration });
  };
}

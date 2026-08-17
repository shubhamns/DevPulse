import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.js";
import { routeParam } from "../../utils/asyncHandler.js";
import { parseInput } from "../../utils/validation.js";
import type { GitHubService } from "../github/service.js";
import type { AiAnalysisService } from "./aiService.js";
import type { IssueService } from "./service.js";
import { issueListQuerySchema, updateIssueSchema } from "./validators.js";

export class IssueController {
  constructor(
    private readonly issueService: IssueService,
    private readonly aiAnalysisService: AiAnalysisService,
    private readonly githubService: GitHubService,
  ) {}

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const issues = await this.issueService.listForUser(
      req.auth.userId,
      parseInput(issueListQuerySchema, req.query),
    );
    res.json({ issues });
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const issueId = routeParam(req, "id");
    const [issue, analysis] = await Promise.all([
      this.issueService.getByIdForUser(req.auth.userId, issueId),
      this.aiAnalysisService.getForIssue(req.auth.userId, issueId),
    ]);
    res.json({ issue, analysis });
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const issue = await this.issueService.updateForUser(
      req.auth.userId,
      routeParam(req, "id"),
      parseInput(updateIssueSchema, req.body),
    );
    res.json({ issue });
  };

  resolve = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const issue = await this.issueService.resolveForUser(req.auth.userId, routeParam(req, "id"));
    res.json({ issue });
  };

  ignore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const issue = await this.issueService.ignoreForUser(req.auth.userId, routeParam(req, "id"));
    res.json({ issue });
  };

  events = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.issueService.getEventsForUser(req.auth.userId, routeParam(req, "id"));
    res.json(result);
  };

  analyze = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const analysis = await this.aiAnalysisService.analyzeIssue(
      req.auth.userId,
      routeParam(req, "id"),
      true,
    );
    res.json({ analysis });
  };

  createGitHubIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.githubService.createIssueFromDevPulseIssue(
      req.auth.userId,
      routeParam(req, "id"),
    );
    res.status(201).json(result);
  };
}

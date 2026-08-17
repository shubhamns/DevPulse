import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { GitHubService } from "../github/service.js";
import { OrganizationService } from "../organizations/service.js";
import { AiAnalysisService } from "./aiService.js";
import { IssueController } from "./controller.js";
import { IssueService } from "./service.js";

export function createIssuesRouter(env: Env): Router {
  const router = Router();
  const organizationService = new OrganizationService();
  const controller = new IssueController(
    new IssueService(organizationService),
    new AiAnalysisService(env, organizationService),
    new GitHubService(env, organizationService),
  );

  router.use(requireAuth(env));
  router.get("/", asyncHandler(controller.list));
  router.get("/:id/events", asyncHandler(controller.events));
  router.post("/:id/analyze", asyncHandler(controller.analyze));
  router.post("/:id/github-issue", asyncHandler(controller.createGitHubIssue));
  router.get("/:id", asyncHandler(controller.getById));
  router.patch("/:id", asyncHandler(controller.update));
  router.post("/:id/resolve", asyncHandler(controller.resolve));
  router.post("/:id/ignore", asyncHandler(controller.ignore));

  return router;
}

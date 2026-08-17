import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { OrganizationService } from "../organizations/service.js";
import { GitHubController } from "./controller.js";
import { GitHubService } from "./service.js";

export function createGitHubRouter(env: Env): Router {
  const router = Router();
  const service = new GitHubService(env, new OrganizationService());
  const githubController = new GitHubController(service);

  router.get("/callback", asyncHandler(githubController.callback));
  router.use(requireAuth(env));
  router.get("/connect", asyncHandler(githubController.connect));
  router.get("/status", asyncHandler(githubController.status));
  router.get("/repositories", asyncHandler(githubController.repositories));
  router.put("/repository", asyncHandler(githubController.setRepository));

  return router;
}

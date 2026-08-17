import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { OrganizationService } from "../organizations/service.js";
import { ApiKeyController } from "../apiKeys/controller.js";
import { ApiKeyService } from "../apiKeys/service.js";
import { ProjectController } from "./controller.js";
import { ProjectService } from "./service.js";

export function createProjectsRouter(env: Env): Router {
  const router = Router();
  const organizationService = new OrganizationService();
  const projectController = new ProjectController(new ProjectService(organizationService));
  const apiKeyController = new ApiKeyController(new ApiKeyService(env, organizationService));

  router.use(requireAuth(env));
  router.get("/", asyncHandler(projectController.list));
  router.post("/", asyncHandler(projectController.create));
  router.get("/:id/api-keys", asyncHandler(apiKeyController.listForProject));
  router.post("/:id/api-keys", asyncHandler(apiKeyController.createForProject));
  router.get("/:id", asyncHandler(projectController.getById));
  router.patch("/:id", asyncHandler(projectController.update));
  router.delete("/:id", asyncHandler(projectController.remove));

  return router;
}

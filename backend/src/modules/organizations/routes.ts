import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { OrganizationController } from "./controller.js";
import { OrganizationService } from "./service.js";

export function createOrganizationsRouter(env: Env): Router {
  const router = Router();
  const controller = new OrganizationController(new OrganizationService());

  router.use(requireAuth(env));
  router.get("/", asyncHandler(controller.list));
  router.post("/", asyncHandler(controller.create));

  return router;
}

import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { OrganizationService } from "../organizations/service.js";
import { AnalyticsController } from "./controller.js";
import { AnalyticsService } from "./service.js";

export function createAnalyticsRouter(env: Env): Router {
  const router = Router();
  const controller = new AnalyticsController(new AnalyticsService(new OrganizationService()));

  router.use(requireAuth(env));
  router.get("/overview", asyncHandler(controller.overview));

  return router;
}

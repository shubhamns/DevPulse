import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { OrganizationService } from "../organizations/service.js";
import { ApiKeyController } from "./controller.js";
import { ApiKeyService } from "./service.js";

export function createApiKeysRouter(env: Env): Router {
  const router = Router();
  const controller = new ApiKeyController(new ApiKeyService(env, new OrganizationService()));

  router.use(requireAuth(env));
  router.delete("/:id", asyncHandler(controller.revoke));

  return router;
}

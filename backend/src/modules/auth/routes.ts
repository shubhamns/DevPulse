import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { createRateLimiter } from "../../middleware/rateLimit.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthController } from "./controller.js";
import { AuthService } from "./service.js";

export function createAuthRouter(env: Env): Router {
  const router = Router();
  const controller = new AuthController(new AuthService(env));
  const authRateLimiter = createRateLimiter({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    maxRequests: env.AUTH_RATE_LIMIT_MAX,
  });

  router.post("/register", authRateLimiter, asyncHandler(controller.register));
  router.post("/login", authRateLimiter, asyncHandler(controller.login));
  router.post("/refresh", authRateLimiter, asyncHandler(controller.refresh));
  router.post("/logout", asyncHandler(controller.logout));
  router.get("/me", requireAuth(env), asyncHandler(controller.me));

  return router;
}

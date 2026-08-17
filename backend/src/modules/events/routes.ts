import { Router } from "express";
import type { Env } from "../../config/env.js";
import { requireApiKey } from "../../middleware/apiKey.js";
import { createRateLimiter } from "../../middleware/rateLimit.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { EventController } from "./controller.js";
import { EventService } from "./service.js";

export function createEventsRouter(env: Env): Router {
  const router = Router();
  const controller = new EventController(new EventService(env));

  router.post(
    "/",
    requireApiKey(env),
    createRateLimiter({
      windowMs: env.EVENT_RATE_LIMIT_WINDOW_MS,
      maxRequests: env.EVENT_RATE_LIMIT_MAX,
      keyGenerator: (req) => {
        const apiKeyRequest = req as { apiKeyContext?: { apiKeyId: string } };
        return apiKeyRequest.apiKeyContext?.apiKeyId ?? req.ip ?? "unknown";
      },
    }),
    asyncHandler(controller.ingest),
  );

  return router;
}

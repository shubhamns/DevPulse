import express from "express";
import cors from "cors";
import type { Env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { applySecurityMiddleware } from "./middleware/security.js";
import { createAnalyticsRouter } from "./modules/analytics/routes.js";
import { createApiKeysRouter } from "./modules/apiKeys/routes.js";
import { createAuthRouter } from "./modules/auth/routes.js";
import { createEventsRouter } from "./modules/events/routes.js";
import { createGitHubRouter } from "./modules/github/routes.js";
import { healthRouter } from "./modules/health/routes.js";
import { createIssuesRouter } from "./modules/issues/routes.js";
import { createOrganizationsRouter } from "./modules/organizations/routes.js";
import { createProjectsRouter } from "./modules/projects/routes.js";

export function createApp(env: Env) {
  const app = express();

  app.disable("x-powered-by");
  applySecurityMiddleware(app, env);
  app.use(requestLogger);
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", createAuthRouter(env));
  app.use("/api/v1/organizations", createOrganizationsRouter(env));
  app.use("/api/v1/projects", createProjectsRouter(env));
  app.use("/api/v1/api-keys", createApiKeysRouter(env));
  app.use("/api/v1/events", createEventsRouter(env));
  app.use("/api/v1/issues", createIssuesRouter(env));
  app.use("/api/v1/analytics", createAnalyticsRouter(env));
  app.use("/api/v1/github", createGitHubRouter(env));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
  });

  app.use(errorHandler);

  return app;
}

import type { Express } from "express";
import helmet from "helmet";
import type { Env } from "../config/env.js";

export function applySecurityMiddleware(app: Express, env: Env): void {
  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
}

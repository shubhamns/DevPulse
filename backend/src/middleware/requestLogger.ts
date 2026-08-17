import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = randomUUID();
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    if (req.path.endsWith("/health")) {
      return;
    }

    logger.info("HTTP request", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}

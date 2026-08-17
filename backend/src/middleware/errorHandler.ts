import type { NextFunction, Request, Response } from "express";
import { isAppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (isAppError(error)) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  logger.error("Unhandled error", error);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
}

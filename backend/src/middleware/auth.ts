import type { NextFunction, Request, Response } from "express";
import type { Env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/jwt.js";

export type AuthContext = {
  userId: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  auth: AuthContext;
};

export function requireAuth(env: Env) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const header = req.headers.authorization ?? "";
      const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

      if (!token) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required");
      }

      const payload = verifyAccessToken(token, env);
      (req as AuthenticatedRequest).auth = {
        userId: payload.sub,
        email: payload.email,
      };
      next();
    } catch (error) {
      next(error instanceof AppError ? error : new AppError(401, "UNAUTHORIZED", "Invalid authentication token"));
    }
  };
}

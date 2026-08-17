import type { NextFunction, Request, Response } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
};

export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = options.keyGenerator?.(req) ?? req.ip ?? "unknown";
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      next();
      return;
    }

    if (existing.count >= options.maxRequests) {
      res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Too many events. Please retry later.",
        },
      });
      return;
    }

    existing.count += 1;
    next();
  };
}

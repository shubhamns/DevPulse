import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler(
  handler: (req: never, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req as never, res, next).catch(next);
  };
}

export function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  return typeof value === "string" ? value : "";
}

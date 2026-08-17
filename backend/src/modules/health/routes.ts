import { Router } from "express";
import { isDatabaseConnected } from "../../config/db.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const database = isDatabaseConnected() ? "connected" : "disconnected";

  res.status(database === "connected" ? 200 : 503).json({
    service: "devpulse-api",
    status: database === "connected" ? "ok" : "degraded",
    database,
    timestamp: new Date().toISOString(),
  });
});

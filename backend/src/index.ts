import "dotenv/config";
import type { Server } from "node:http";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { loadEnv } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function start(): Promise<Server> {
  const env = loadEnv();
  const app = createApp(env);

  try {
    await connectDatabase(env.MONGODB_URI);
  } catch (error) {
    logger.error("Failed to connect to MongoDB. API will start in degraded mode.", error);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`DevPulse API listening on port ${env.PORT}`, {
      nodeEnv: env.NODE_ENV,
    });
  });

  registerShutdownHandlers(server);
  return server;
}

function registerShutdownHandlers(server: Server): void {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info(`Received ${signal}. Shutting down gracefully.`);

    server.close(async () => {
      try {
        await disconnectDatabase();
        logger.info("Shutdown complete");
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown", error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}

void start().catch((error: unknown) => {
  logger.error("Failed to start DevPulse API", error);
  process.exit(1);
});

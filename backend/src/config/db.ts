import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

let isConnected = false;

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectDatabase(mongoUri: string): Promise<void> {
  if (isDatabaseConnected()) {
    return;
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    isConnected = true;
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (error: unknown) => {
    isConnected = false;
    logger.error("MongoDB connection error", error);
  });

  await mongoose.connect(mongoUri);
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
}

import type { NormalizedError } from "../types/index.js";

function stackFromUnknown(value: unknown): string | undefined {
  if (typeof value === "object" && value !== null && "stack" in value) {
    const stack = (value as { stack?: unknown }).stack;
    return typeof stack === "string" ? stack : undefined;
  }

  return undefined;
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message || "Unknown error",
      ...(error.stack ? { stack: error.stack } : {}),
    };
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    const message =
      typeof record.message === "string"
        ? record.message
        : JSON.stringify(error);

    const name = typeof record.name === "string" ? record.name : "Error";
    const stack = stackFromUnknown(error);

    return {
      name,
      message,
      ...(stack ? { stack } : {}),
    };
  }

  return {
    name: "Error",
    message: String(error),
  };
}

export function normalizeMessage(message: string): string {
  return message.trim() || "Empty message";
}

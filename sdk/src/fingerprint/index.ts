import { createHash } from "node:crypto";
import type { NormalizedError } from "../types/index.js";

export function fingerprintError(error: NormalizedError): string {
  const stackLine = error.stack?.split("\n").find((line) => line.trim().startsWith("at "));

  const normalized = [
    error.name.trim(),
    error.message.trim(),
    stackLine?.trim() ?? "",
  ].join("|");

  return createHash("sha256").update(normalized).digest("hex");
}

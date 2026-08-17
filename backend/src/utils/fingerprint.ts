import { createHash } from "node:crypto";

export type FingerprintInput = {
  errorName?: string | undefined;
  errorMessage: string;
  stackTrace?: string | undefined;
};

function normalizeMessage(message: string): string {
  return message.trim().replace(/\s+/g, " ");
}

function normalizeStackTrace(stackTrace?: string): string {
  if (!stackTrace) {
    return "";
  }

  return stackTrace
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((line) => line.replace(/:\d+:\d+\)?$/, ")"))
    .join("\n");
}

export function buildFingerprint(input: FingerprintInput): string {
  const payload = [
    (input.errorName ?? "Error").trim(),
    normalizeMessage(input.errorMessage),
    normalizeStackTrace(input.stackTrace),
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

export function buildMessageFingerprint(message: string): string {
  const payload = ["message", normalizeMessage(message)].join("|");
  return createHash("sha256").update(payload).digest("hex");
}

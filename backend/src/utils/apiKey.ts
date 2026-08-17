import crypto from "node:crypto";

export const API_KEY_PREFIX = "dp_live_";

export function generateApiKeyValue(): string {
  const randomPart = crypto.randomBytes(24).toString("base64url");
  return `${API_KEY_PREFIX}${randomPart}`;
}

export function hashApiKey(apiKey: string, pepper: string): string {
  return crypto.createHmac("sha256", pepper).update(apiKey).digest("hex");
}

export function getApiKeyDisplayParts(apiKey: string): {
  keyPrefix: string;
  lastFour: string;
  maskedKey: string;
} {
  const lastFour = apiKey.slice(-4);
  const keyPrefix = apiKey.slice(0, API_KEY_PREFIX.length + 4);
  const maskedKey = `${keyPrefix}...${lastFour}`;

  return { keyPrefix, lastFour, maskedKey };
}

export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.startsWith(API_KEY_PREFIX) && apiKey.length > API_KEY_PREFIX.length + 8;
}

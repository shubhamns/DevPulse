import type { DevPulseEventPayload } from "../types/index.js";

export const DEFAULT_ENDPOINT = "/api/v1/events";

export async function sendEvent(
  endpoint: string,
  apiKey: string,
  payload: DevPulseEventPayload,
): Promise<Response | null> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    return response;
  } catch {
    return null;
  }
}

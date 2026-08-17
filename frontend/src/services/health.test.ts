import { afterEach, describe, expect, it, vi } from "vitest";
import { http } from "@/lib/http";
import { getApiHealth } from "@/services/health";

describe("getApiHealth", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses a successful health payload", async () => {
    vi.spyOn(http, "get").mockResolvedValue({
      data: {
        service: "devpulse-api",
        status: "ok",
        database: "connected",
        timestamp: "2026-08-17T00:00:00.000Z",
      },
    } as never);

    const health = await getApiHealth();
    expect(health.status).toBe("ok");
    expect(health.database).toBe("connected");
  });
});

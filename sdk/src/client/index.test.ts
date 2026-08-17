import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { DevPulseClient } from "./index.js";

describe("DevPulseClient", () => {
  it("sends exception payloads with user and context", async () => {
    const fetchMock = mock.fn(async () => new Response("{}", { status: 202 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new DevPulseClient({
      apiKey: "dp_live_test_key",
      environment: "production",
      release: "1.0.0",
      endpoint: "https://api.example.com/api/v1/events",
    });

    client.setUser({ id: "user-1", email: "dev@test.com" });
    client.setContext({ feature: "checkout" });
    client.captureException(new Error("Payment failed"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(fetchMock.mock.calls.length, 1);

    const call = fetchMock.mock.calls[0];
    assert.ok(call);
    const init = call.arguments[1] as RequestInit;
    const payload = JSON.parse(String(init.body)) as {
      type: string;
      message: string;
      environment: string;
      release: string;
      user?: { id: string };
      context?: { feature: string };
      error?: { message: string };
      breadcrumbs?: Array<{ message: string }>;
      sdk: { name: string };
    };

    assert.equal(payload.type, "exception");
    assert.equal(payload.message, "Payment failed");
    assert.equal(payload.environment, "production");
    assert.equal(payload.release, "1.0.0");
    assert.equal(payload.user?.id, "user-1");
    assert.equal(payload.context?.feature, "checkout");
    assert.equal(payload.error?.message, "Payment failed");
    assert.equal(payload.sdk.name, "@devpulse/sdk");
    assert.ok((payload.breadcrumbs?.length ?? 0) >= 2);
  });

  it("sends message payloads", async () => {
    const fetchMock = mock.fn(async () => new Response("{}", { status: 202 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new DevPulseClient({
      apiKey: "dp_live_test_key",
      endpoint: "https://api.example.com/api/v1/events",
    });

    client.captureMessage("Something happened", "warning");

    await new Promise((resolve) => setTimeout(resolve, 0));

    const call = fetchMock.mock.calls[0];
    assert.ok(call);
    const init = call.arguments[1] as RequestInit;
    const payload = JSON.parse(String(init.body)) as {
      type: string;
      message: string;
      level?: string;
    };

    assert.equal(payload.type, "message");
    assert.equal(payload.message, "Something happened");
    assert.equal(payload.level, "warning");
  });

  it("does not send events when uninitialized", async () => {
    const fetchMock = mock.fn(async () => new Response("{}", { status: 202 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new DevPulseClient();
    client.captureMessage("Ignored");

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(fetchMock.mock.calls.length, 0);
  });
});

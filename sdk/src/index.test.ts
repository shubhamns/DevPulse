import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DevPulse, SDK_NAME, SDK_VERSION } from "./index.js";

describe("@devpulse/sdk", () => {
  it("exposes package identity", () => {
    assert.equal(SDK_NAME, "@devpulse/sdk");
    assert.equal(DevPulse.name, SDK_NAME);
    assert.equal(DevPulse.version, SDK_VERSION);
  });

  it("exposes public SDK methods", () => {
    assert.equal(typeof DevPulse.init, "function");
    assert.equal(typeof DevPulse.captureException, "function");
    assert.equal(typeof DevPulse.captureMessage, "function");
    assert.equal(typeof DevPulse.setUser, "function");
    assert.equal(typeof DevPulse.setContext, "function");
  });
});

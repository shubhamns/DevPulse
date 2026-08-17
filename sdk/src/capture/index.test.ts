import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeError, normalizeMessage } from "./index.js";

describe("capture", () => {
  it("normalizes Error objects", () => {
    const error = new Error("Something failed");
    const normalized = normalizeError(error);

    assert.equal(normalized.name, "Error");
    assert.equal(normalized.message, "Something failed");
    assert.ok(normalized.stack);
  });

  it("normalizes string errors", () => {
    const normalized = normalizeError("Broken");
    assert.equal(normalized.message, "Broken");
  });

  it("normalizes message text", () => {
    assert.equal(normalizeMessage(" hello "), "hello");
  });
});

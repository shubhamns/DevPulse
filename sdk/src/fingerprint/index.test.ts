import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fingerprintError } from "./index.js";

describe("fingerprintError", () => {
  it("returns deterministic hashes for the same error", () => {
    const error = {
      name: "TypeError",
      message: "Cannot read property",
      stack: "TypeError: Cannot read property\n    at checkout (app.js:10:5)",
    };

    const first = fingerprintError(error);
    const second = fingerprintError(error);

    assert.equal(first, second);
    assert.match(first, /^[a-f0-9]{64}$/);
  });
});

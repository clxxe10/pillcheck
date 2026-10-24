import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { demoOnlyResponse, isDemoOnly } from "@/lib/demo-mode";

const original = process.env.DEMO_ONLY;

afterEach(() => {
  if (original === undefined) delete process.env.DEMO_ONLY;
  else process.env.DEMO_ONLY = original;
});

describe("demo mode", () => {
  it("stays off unless DEMO_ONLY is exactly true", () => {
    delete process.env.DEMO_ONLY;
    assert.equal(isDemoOnly(), false);
    assert.equal(demoOnlyResponse(), null);

    process.env.DEMO_ONLY = "false";
    assert.equal(isDemoOnly(), false);
    assert.equal(demoOnlyResponse(), null);

    process.env.DEMO_ONLY = "";
    assert.equal(isDemoOnly(), false);
  });

  it("returns demo_only without reading a request", async () => {
    process.env.DEMO_ONLY = "true";
    assert.equal(isDemoOnly(), true);
    const response = demoOnlyResponse();
    assert.ok(response);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), {
      error: "demo_only",
      message: "Live photo reading is paused. The sample photos still work.",
    });
  });
});

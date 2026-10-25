import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VERCEL_BODY_LIMIT,
  codeFromStatus,
  errorDetail,
  isHeic,
  payloadTooLarge,
  presentedExtractCode,
  redactSecrets,
  scanFailKey,
  shouldLogUploadFailure,
  utf8Bytes,
} from "@/lib/upload-error";

describe("upload errors", () => {
  it("recognizes HEIC and HEIF files even when the browser leaves the type empty", () => {
    assert.equal(isHeic({ name: "IMG_2201.HEIC", type: "" }), true);
    assert.equal(isHeic({ name: "side.heif", type: "application/octet-stream" }), true);
    assert.equal(isHeic({ name: "photo.jpg", type: "image/jpeg" }), false);
    assert.equal(isHeic({ name: "photo", type: "image/heic" }), true);
  });

  it("blocks a body over the Vercel limit and allows a 4-photo payload under 4MB", () => {
    assert.equal(payloadTooLarge(VERCEL_BODY_LIMIT), false);
    assert.equal(payloadTooLarge(VERCEL_BODY_LIMIT + 1), true);
    const data = "A".repeat(700_000);
    const json = JSON.stringify({
      images: [0, 1, 2, 3].map((index) => ({
        data,
        mimeType: "image/jpeg",
        clinic: `사진 ${index + 1}`,
      })),
      groups: [[0, 1, 2]],
    });
    const bytes = utf8Bytes(json);
    assert.ok(bytes < 4 * 1024 * 1024);
    assert.equal(payloadTooLarge(bytes), false);
    const huge = JSON.stringify({ images: [{ data: "A".repeat(VERCEL_BODY_LIMIT), mimeType: "image/jpeg", clinic: "" }] });
    assert.equal(payloadTooLarge(utf8Bytes(huge)), true);
  });

  it("maps each failure to its own message", () => {
    assert.equal(presentedExtractCode("bad_request", "The photos are too large."), "too_large");
    assert.equal(presentedExtractCode("bad_request", "Claude does not accept image/heic images."), "unsupported_type");
    assert.equal(presentedExtractCode("not_configured", "ANTHROPIC_API_KEY is not set."), "not_configured");
    assert.equal(presentedExtractCode("provider_error", "model overloaded"), "provider_error");
    assert.equal(presentedExtractCode("timeout"), "timeout");
    assert.equal(presentedExtractCode("network"), "network");
    assert.equal(codeFromStatus(413), "too_large");
    assert.equal(codeFromStatus(500, "not_configured", "missing key"), "not_configured");
    assert.equal(scanFailKey("too_large"), "fail_too_large");
    assert.equal(scanFailKey("unsupported_type"), "fail_unsupported");
    assert.equal(scanFailKey("provider_error"), "fail_provider");
    assert.equal(scanFailKey("network"), "fail_network");
    assert.equal(scanFailKey("bad_request"), "fail_generic");
  });

  it("logs only on localhost and never keeps a key in the message", () => {
    assert.equal(shouldLogUploadFailure("localhost"), true);
    assert.equal(shouldLogUploadFailure("127.0.0.1"), true);
    assert.equal(shouldLogUploadFailure("pillcheck.vercel.app"), false);
    const secret = "sk-ant-api03-secretvalue";
    const safe = redactSecrets(`provider said ${secret} serviceKey=abc123`);
    assert.equal(safe.includes(secret), false);
    assert.equal(safe.includes("abc123"), false);
    assert.match(safe, /provider said \[redacted\]/);
    assert.equal(errorDetail({ code: 2, message: "format not supported" }), "2 format not supported");
  });
});

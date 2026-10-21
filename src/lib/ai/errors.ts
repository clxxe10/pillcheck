import type { ExtractErrorCode } from "@/types";

export class AiError extends Error {
  constructor(
    readonly code: ExtractErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export const errorStatus: Record<ExtractErrorCode, number> = {
  bad_request: 400,
  rate_limited: 429,
  timeout: 504,
  invalid_response: 502,
  not_configured: 500,
  provider_error: 502,
};

export function isAbortError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";
  return name === "AbortError" || /aborted|timed? ?out/i.test(`${name} ${message}`);
}

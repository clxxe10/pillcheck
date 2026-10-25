import type { ExtractErrorCode } from "@/types";

/** Vercel rejects request bodies at about 4.5MB. Check before sending. */
export const VERCEL_BODY_LIMIT = Math.floor(4.5 * 1024 * 1024);

export function utf8Bytes(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function payloadTooLarge(bytes: number) {
  return bytes > VERCEL_BODY_LIMIT;
}

export function isHeic(file: { name: string; type?: string }) {
  const type = (file.type || "").toLowerCase();
  if (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence"
  ) {
    return true;
  }
  return /\.(heic|heif)$/i.test(file.name);
}

/** Strips credential-shaped text so a debug log cannot print an API key. */
export function redactSecrets(message: string) {
  return message
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, "[redacted]")
    .replace(/(serviceKey|api[_-]?key|authorization|bearer)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .slice(0, 300);
}

export function shouldLogUploadFailure(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function errorDetail(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const record = error as { code?: unknown; message?: unknown };
    const text = [record.code, record.message]
      .filter((part) => typeof part === "string" || typeof part === "number")
      .join(" ");
    if (text.trim()) return text.trim();
  }
  return "";
}

export function logUploadFailure(code: string, detail: string) {
  if (typeof window === "undefined") return;
  if (!shouldLogUploadFailure(window.location.hostname)) return;
  const safe = redactSecrets(detail);
  console.error("[pillcheck]", code, safe);
}

const KNOWN = new Set<string>([
  "bad_request",
  "too_large",
  "unsupported_type",
  "rate_limited",
  "quota",
  "timeout",
  "invalid_response",
  "not_configured",
  "provider_error",
  "demo_only",
  "network",
]);

export function presentedExtractCode(code: string, message = ""): ExtractErrorCode | "network" {
  if (code === "bad_request") {
    if (/too large|payload|413|body exceeded|function_payload/i.test(message)) return "too_large";
    if (/unsupported|not accept|heic|heif|mime|format/i.test(message)) return "unsupported_type";
  }
  if (KNOWN.has(code)) return code as ExtractErrorCode | "network";
  return "provider_error";
}

export function codeFromStatus(status: number, error?: string, message?: string): ExtractErrorCode | "network" {
  if (error) return presentedExtractCode(error, message ?? "");
  if (status === 413) return "too_large";
  if (status === 415) return "unsupported_type";
  if (status === 504 || status === 408) return "timeout";
  if (status === 429) return "rate_limited";
  return "provider_error";
}

/** Copy key under scanScreen for a failed upload or reading. */
export function scanFailKey(code: string) {
  switch (code) {
    case "timeout":
      return "fail_timeout";
    case "too_large":
      return "fail_too_large";
    case "unsupported_type":
      return "fail_unsupported";
    case "not_configured":
      return "fail_config";
    case "provider_error":
      return "fail_provider";
    case "network":
      return "fail_network";
    case "invalid_response":
      return "fail_invalid";
    case "demo_only":
      return "demoPaused";
    default:
      return "fail_generic";
  }
}

import type { ExtractErrorCode, ExtractErrorResponse } from "@/types";

/** True only when the deploy is set to sample photos, with no live photo reading. */
export function isDemoOnly() {
  return process.env.DEMO_ONLY?.trim() === "true";
}

const demoOnlyBody: ExtractErrorResponse = {
  error: "demo_only" satisfies ExtractErrorCode,
  message: "Live photo reading is paused. The sample photos still work.",
};

/** Immediate /api/extract response. Null when live reading is on. */
export function demoOnlyResponse() {
  if (!isDemoOnly()) return null;
  return Response.json(demoOnlyBody, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}

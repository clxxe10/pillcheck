"use client";

import { checkSafety } from "@/lib/safety";
import type { Medicine, SafetyAlert } from "@/types";

/** Asks the server so a DUR key can be used, and falls back to the local rules. */
export async function requestSafety(medicines: Medicine[]): Promise<SafetyAlert[]> {
  const local = checkSafety(medicines);
  try {
    const response = await fetch("/api/safety", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ medicines }),
    });
    if (!response.ok) return local;
    const body = (await response.json()) as { warnings?: SafetyAlert[] };
    return Array.isArray(body.warnings) ? body.warnings : local;
  } catch {
    return local;
  }
}

import "server-only";

import { runClaude } from "@/lib/ai/claude";
import { AiError, isAbortError } from "@/lib/ai/errors";
import { runGemini } from "@/lib/ai/gemini";
import { normalizeExtraction, parseModelJson } from "@/lib/ai/normalize";
import { buildExtractPrompt } from "@/lib/ai/prompt";
import type { ExtractImage, ExtractResponse } from "@/types";

export const EXTRACT_TIMEOUT_MS = 45_000;

export type AiProvider = "gemini" | "claude";

export function currentProvider(): AiProvider {
  const value = (process.env.AI_PROVIDER || "gemini").trim().toLowerCase();
  if (value === "gemini" || value === "claude") return value;
  throw new AiError("not_configured", `Unknown AI_PROVIDER "${value}". Use "gemini" or "claude".`);
}

/** Reads medicines from label photos with the configured provider. Nothing is stored. */
export async function extractMedicines(images: ExtractImage[]): Promise<ExtractResponse> {
  const provider = currentProvider();
  const clinics = images.map((image) => image.clinic);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS);
  const request = {
    prompt: buildExtractPrompt(clinics),
    images,
    signal: controller.signal,
    timeoutMs: EXTRACT_TIMEOUT_MS,
  };

  try {
    const text = provider === "claude" ? await runClaude(request) : await runGemini(request);
    return normalizeExtraction(parseModelJson(text), clinics);
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (controller.signal.aborted || isAbortError(error)) {
      throw new AiError("timeout", "The AI provider took too long to respond.");
    }
    throw new AiError("provider_error", error instanceof Error ? error.message : "Unknown AI error.");
  } finally {
    clearTimeout(timer);
  }
}

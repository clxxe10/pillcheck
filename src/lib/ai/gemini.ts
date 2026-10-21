import "server-only";

import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { AiError, isAbortError } from "@/lib/ai/errors";
import { extractSchema } from "@/lib/ai/prompt";
import type { ProviderRequest } from "@/lib/ai/types";

/** Latest Flash model on the Gemini API free tier (GA, Sep 2026). */
const DEFAULT_MODEL = "gemini-3.8-flash";

export async function runGemini({ prompt, images, signal, timeoutMs }: ProviderRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiError("not_configured", "GEMINI_API_KEY is not set.");

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...images.map((image) => ({ inlineData: { mimeType: image.mimeType, data: image.data } })),
          ],
        },
      ],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseJsonSchema: extractSchema,
        abortSignal: signal,
        httpOptions: { timeout: timeoutMs, retryOptions: { attempts: 1 } },
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });
    if (response.promptFeedback?.blockReason) {
      throw new AiError("invalid_response", "The model refused these photos.");
    }
    return response.text ?? "";
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (signal.aborted || isAbortError(error)) {
      throw new AiError("timeout", "Gemini took too long to respond.");
    }
    if (error instanceof ApiError) {
      if (error.status === 429 || error.status === 503) {
        throw new AiError("rate_limited", "Gemini rate limit reached.");
      }
      if (error.status === 401 || error.status === 403) {
        throw new AiError("not_configured", "Gemini rejected the API key.");
      }
      throw new AiError("provider_error", `Gemini error ${error.status}.`);
    }
    throw error;
  }
}

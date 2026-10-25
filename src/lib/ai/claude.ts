import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { AiError, isAbortError } from "@/lib/ai/errors";
import { extractSchema } from "@/lib/ai/prompt";
import type { ProviderRequest } from "@/lib/ai/types";

const DEFAULT_MODEL = "claude-sonnet-5-5";

type ClaudeImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const CLAUDE_IMAGE_TYPES: ClaudeImageType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function safeProviderDetail(error: { message: string; error?: unknown }) {
  const nested = error.error as { error?: { message?: string } } | undefined;
  const detail = nested?.error?.message || error.message;
  return detail
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

export async function runClaude({ prompt, images, signal, timeoutMs }: ProviderRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AiError("not_configured", "ANTHROPIC_API_KEY is not set.");

  for (const image of images) {
    if (!CLAUDE_IMAGE_TYPES.includes(image.mimeType as ClaudeImageType)) {
      throw new AiError("unsupported_type", `Claude does not accept ${image.mimeType} images.`);
    }
  }

  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: timeoutMs });
  try {
    const message = await client.messages.create(
      {
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 4096,
        output_config: {
          format: { type: "json_schema", schema: extractSchema },
        },
        messages: [
          {
            role: "user",
            content: [
              ...images.map((image) => ({
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: image.mimeType as ClaudeImageType,
                  data: image.data,
                },
              })),
              { type: "text" as const, text: prompt },
            ],
          },
        ],
      },
      { signal },
    );
    return message.content.map((block) => (block.type === "text" ? block.text : "")).join("");
  } catch (error) {
    if (signal.aborted || isAbortError(error) || error instanceof Anthropic.APIConnectionTimeoutError) {
      throw new AiError("timeout", "Claude took too long to respond.");
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new AiError("rate_limited", "Claude rate limit reached.");
    }
    if (error instanceof Anthropic.APIError) {
      if (error.status === 529 || error.status === 503) {
        throw new AiError("rate_limited", "Claude is overloaded.");
      }
      if (error.status === 401 || error.status === 403) {
        throw new AiError("not_configured", "Claude rejected the API key.");
      }
      throw new AiError("provider_error", `Claude error ${error.status ?? "unknown"}. ${safeProviderDetail(error)}`);
    }
    throw error;
  }
}

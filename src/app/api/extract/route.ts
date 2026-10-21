import { extractMedicines } from "@/lib/ai";
import { AiError, errorStatus } from "@/lib/ai/errors";
import type { ExtractErrorCode, ExtractErrorResponse, ExtractImage } from "@/types";

export const maxDuration = 60;

/** Photos and results are only held in this request. Nothing is written to disk. */

const MAX_IMAGES = 10;
const MAX_IMAGE_CHARS = 7_000_000;
const MAX_TOTAL_CHARS = 18_000_000;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

const noStore = { "Cache-Control": "no-store" };

function fail(code: ExtractErrorCode, message: string) {
  const body: ExtractErrorResponse = { error: code, message };
  return Response.json(body, { status: errorStatus[code], headers: noStore });
}

function readImages(body: unknown): ExtractImage[] | string {
  if (!body || typeof body !== "object" || !Array.isArray((body as { images?: unknown }).images)) {
    return "Expected { images: [...] }.";
  }
  const list = (body as { images: unknown[] }).images;
  if (list.length === 0) return "Add at least one photo.";
  if (list.length > MAX_IMAGES) return `Send at most ${MAX_IMAGES} photos at a time.`;

  const images: ExtractImage[] = [];
  let total = 0;
  for (const [index, entry] of list.entries()) {
    const item = (entry ?? {}) as Record<string, unknown>;
    const data = typeof item.data === "string" ? item.data.replace(/^data:[^,]*,/, "") : "";
    const mimeType = typeof item.mimeType === "string" ? item.mimeType.toLowerCase() : "";
    if (!data || data.length > MAX_IMAGE_CHARS || !BASE64.test(data)) {
      return `Photo ${index + 1} is missing, too large, or not base64.`;
    }
    if (!IMAGE_TYPES.includes(mimeType)) return `Photo ${index + 1} has an unsupported type.`;
    total += data.length;
    images.push({
      data,
      mimeType,
      clinic: typeof item.clinic === "string" ? item.clinic.trim().slice(0, 80) : "",
    });
  }
  if (total > MAX_TOTAL_CHARS) return "The photos are too large together. Send fewer at once.";
  return images;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("bad_request", "The request body must be JSON.");
  }

  const images = readImages(body);
  if (typeof images === "string") return fail("bad_request", images);

  try {
    const result = await extractMedicines(images);
    return Response.json(result, { headers: noStore });
  } catch (error) {
    const aiError =
      error instanceof AiError ? error : new AiError("provider_error", "Unexpected error while reading photos.");
    console.error(`[api/extract] ${aiError.code}: ${aiError.message}`);
    return fail(aiError.code, aiError.message);
  }
}

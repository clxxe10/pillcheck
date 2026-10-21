"use client";

import type {
  ExtractErrorCode,
  ExtractErrorResponse,
  ExtractImage,
  ExtractResponse,
} from "@/types";

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;
const REQUEST_TIMEOUT_MS = 60_000;

export class ExtractRequestError extends Error {
  constructor(readonly code: ExtractErrorCode | "network") {
    super(code);
    this.name = "ExtractRequestError";
  }
}

function guessMimeType(file: File) {
  if (file.type) return file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "heic" || ext === "heif") return `image/${ext}`;
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function readAsBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Shrinks big phone photos so uploads stay small; falls back to the original file. */
async function encodeImage(file: File): Promise<{ data: string; mimeType: string }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("no canvas");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new Error("encode failed");
    return { data: await readAsBase64(blob), mimeType: "image/jpeg" };
  } catch {
    return { data: await readAsBase64(file), mimeType: guessMimeType(file) };
  }
}

export async function requestExtraction(
  photos: { file: File; clinic: string }[],
): Promise<ExtractResponse> {
  const images: ExtractImage[] = await Promise.all(
    photos.map(async (photo) => ({ ...(await encodeImage(photo.file)), clinic: photo.clinic })),
  );

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    throw new ExtractRequestError(controller.signal.aborted ? "timeout" : "network");
  } finally {
    window.clearTimeout(timer);
  }

  const body = (await response.json().catch(() => null)) as
    | ExtractResponse
    | ExtractErrorResponse
    | null;
  if (!response.ok || !body || "error" in body) {
    if (body && "error" in body) throw new ExtractRequestError(body.error);
    if (response.status === 429) throw new ExtractRequestError("rate_limited");
    if (response.status === 504) throw new ExtractRequestError("timeout");
    throw new ExtractRequestError("provider_error");
  }
  if (!Array.isArray(body.medicines) || !Array.isArray(body.unreadable)) {
    throw new ExtractRequestError("invalid_response");
  }
  return body;
}

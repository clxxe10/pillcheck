"use client";

import { decodeForUpload } from "@/lib/heic-convert";
import {
  codeFromStatus,
  isHeic,
  errorDetail,
  logUploadFailure,
  payloadTooLarge,
  utf8Bytes,
} from "@/lib/upload-error";
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
  constructor(
    readonly code: ExtractErrorCode | "network",
    readonly detail = "",
  ) {
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

function unsupported(error: unknown) {
  return new ExtractRequestError("unsupported_type", errorDetail(error) || "Could not open this photo.");
}

/** Shrinks big phone photos. HEIC is converted first and is never sent as the original file. */
async function encodeImage(file: File): Promise<{ data: string; mimeType: string }> {
  let source = file;
  try {
    source = await decodeForUpload(file);
  } catch (error) {
    throw unsupported(error);
  }
  try {
    const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
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
  } catch (error) {
    if (isHeic(file) || error instanceof ExtractRequestError) throw error instanceof ExtractRequestError ? error : unsupported(error);
    return { data: await readAsBase64(source), mimeType: guessMimeType(source) };
  }
}

export async function requestExtraction(
  photos: { file: File; clinic: string }[],
  extra?: { groups?: number[][]; focus?: { name: string; nameEn: string } },
): Promise<ExtractResponse> {
  let images: ExtractImage[];
  try {
    images = await Promise.all(
      photos.map(async (photo) => ({ ...(await encodeImage(photo.file)), clinic: photo.clinic })),
    );
  } catch (error) {
    const failure = error instanceof ExtractRequestError ? error : unsupported(error);
    logUploadFailure(failure.code, failure.detail);
    throw failure;
  }

  const payload = JSON.stringify({
    images,
    ...(extra?.groups?.length ? { groups: extra.groups } : {}),
    ...(extra?.focus ? { focus: extra.focus } : {}),
  });
  const bytes = utf8Bytes(payload);
  if (payloadTooLarge(bytes)) {
    const failure = new ExtractRequestError("too_large", `payload ${bytes} bytes`);
    logUploadFailure(failure.code, failure.detail);
    throw failure;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    const code = controller.signal.aborted ? "timeout" : "network";
    logUploadFailure(code, "");
    throw new ExtractRequestError(code);
  } finally {
    window.clearTimeout(timer);
  }

  const body = (await response.json().catch(() => null)) as
    | ExtractResponse
    | ExtractErrorResponse
    | null;
  if (!response.ok || !body || "error" in body) {
    const errorBody = body && "error" in body ? body : null;
    const failure = new ExtractRequestError(
      codeFromStatus(response.status, errorBody?.error, errorBody?.message),
      errorBody?.message ?? "",
    );
    logUploadFailure(failure.code, failure.detail);
    throw failure;
  }
  if (!Array.isArray(body.medicines) || !Array.isArray(body.unreadable)) {
    throw new ExtractRequestError("invalid_response");
  }
  return body;
}

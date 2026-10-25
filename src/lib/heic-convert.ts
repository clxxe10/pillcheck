import { isHeic } from "@/lib/upload-error";

/** Converts an HEIC/HEIF photo to a JPEG file. Loads the decoder only when needed. */
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (typeof window === "undefined") throw new Error("HEIC conversion runs in the browser.");
  const loaded = await import("heic2any");
  const heic2any = loaded.default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) throw new Error("HEIC conversion returned nothing.");
  const base = file.name.replace(/\.(heic|heif)$/i, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
}

export async function decodeForUpload(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  return convertHeicToJpeg(file);
}

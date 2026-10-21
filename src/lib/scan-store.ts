"use client";

import { ExtractRequestError, requestExtraction } from "@/lib/extract-client";
import { samplePhotos, sampleResult } from "@/lib/mock";
import type { ResultSource, SessionPhoto } from "@/lib/session";
import type { ExtractErrorCode, Medicine, ScanPhoto, UnreadableReason } from "@/types";
import { useSyncExternalStore } from "react";

/** Photos stay in browser memory only and are dropped on reload. */

export type ScanNotice =
  | { kind: "rate_limited" }
  | { kind: "quota" }
  | { kind: "failed"; code: ExtractErrorCode | "network" };

export type AnalysisOutcome =
  | { type: "success"; source: ResultSource; photos: SessionPhoto[]; medicines: Medicine[] }
  | { type: "unreadable"; photos: { id: string; reason: UnreadableReason }[] }
  | { type: "error"; code: ExtractErrorCode | "network" };

type PendingAnalysis = { photos: ScanPhoto[]; demo: boolean };

type ScanState = {
  photos: ScanPhoto[];
  notice: ScanNotice | null;
  pending: PendingAnalysis | null;
  analyzed: ScanPhoto[];
};

const DEMO_DELAY_MS = 3200;

/** Opening /analyzing without queued photos replays the sample demo. */
const directVisit: PendingAnalysis = { photos: samplePhotos, demo: true };

const initialState: ScanState = {
  photos: samplePhotos,
  notice: null,
  pending: null,
  analyzed: samplePhotos,
};

let state = initialState;
let running: { pending: PendingAnalysis; promise: Promise<AnalysisOutcome> } | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function set(next: Partial<ScanState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function revoke(photo: ScanPhoto) {
  if (!photo.previewUrl?.startsWith("blob:")) return;
  if (state.analyzed.some((item) => item.previewUrl === photo.previewUrl)) return;
  URL.revokeObjectURL(photo.previewUrl);
}

let uploadCount = 0;

function photoFromFile(file: File): ScanPhoto {
  uploadCount += 1;
  const base = file.name.replace(/\.[^.]+$/, "") || `IMG_${String(uploadCount).padStart(4, "0")}`;
  return {
    id: `upload-${Date.now()}-${uploadCount}`,
    filename: base.slice(0, 24),
    clinic: "",
    sample: false,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

/** Loads the saved sample bags. Analyzing them uses the stored result and does not call the API. */
export function loadSamplePhotos() {
  state.photos.forEach(revoke);
  set({ photos: samplePhotos.map((photo) => ({ ...photo })), notice: null });
}

export function addFiles(files: File[]) {
  const images = files.filter((file) => file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name));
  if (images.length === 0) return;
  const keep = state.photos.filter((photo) => !photo.sample);
  set({ photos: [...keep, ...images.map(photoFromFile)], notice: null });
}

export function removePhoto(id: string) {
  const photo = state.photos.find((item) => item.id === id);
  if (photo) revoke(photo);
  set({ photos: state.photos.filter((item) => item.id !== id) });
}

export function replacePhoto(id: string, file: File) {
  set({
    photos: state.photos.map((photo) => {
      if (photo.id !== id) return photo;
      revoke(photo);
      return { ...photoFromFile(file), id: photo.id, clinic: photo.clinic };
    }),
    notice: null,
  });
}

export function setClinic(id: string, clinic: string) {
  set({ photos: state.photos.map((photo) => (photo.id === id ? { ...photo, clinic } : photo)) });
}

/** `?error=1` preview: the third sample bag comes back blurry. */
export function showSampleError() {
  if (state.photos.some((photo) => photo.id === "img-0415" && photo.sample && !photo.unreadable)) {
    set({
      photos: state.photos.map((photo) =>
        photo.id === "img-0415" ? { ...photo, unreadable: "blurry" as const } : photo,
      ),
    });
  }
}

export function clearNotice() {
  set({ notice: null });
}

export function startAnalysis(fallbackClinic: (index: number) => string) {
  const photos = state.photos
    .filter((photo) => !photo.unreadable)
    .map((photo, index) => ({ ...photo, clinic: photo.clinic.trim() || fallbackClinic(index) }));
  if (photos.length === 0) return false;
  set({ pending: { photos, demo: photos.every((photo) => photo.sample) }, notice: null });
  return true;
}

function demoMedicines(photos: ScanPhoto[]) {
  const sample = sampleResult().medicines;
  return sample.flatMap((medicine) => {
    const id = samplePhotos[medicine.sourceImageIndex]?.id;
    const index = photos.findIndex((photo) => photo.id === id);
    return index === -1 ? [] : [{ ...medicine, sourceImageIndex: index }];
  });
}

async function analyze(pending: PendingAnalysis): Promise<AnalysisOutcome> {
  const sessionPhotos = pending.photos.map(({ filename, clinic }) => ({ filename, clinic }));
  if (pending.demo) {
    await new Promise((resolve) => window.setTimeout(resolve, DEMO_DELAY_MS));
    return { type: "success", source: "demo", photos: sessionPhotos, medicines: demoMedicines(pending.photos) };
  }
  if (pending.photos.length > 5) return { type: "error", code: "bad_request" };
  try {
    const result = await requestExtraction(
      pending.photos.flatMap((photo) => (photo.file ? [{ file: photo.file, clinic: photo.clinic }] : [])),
    );
    if (result.medicines.length === 0 || result.unreadable.length > 0) {
      const flagged = result.unreadable.length
        ? result.unreadable
        : pending.photos.map((_, index) => ({ index, reason: "other" as const }));
      return {
        type: "unreadable",
        photos: flagged.flatMap(({ index, reason }) =>
          pending.photos[index] ? [{ id: pending.photos[index].id, reason }] : [],
        ),
      };
    }
    return { type: "success", source: "ai", photos: sessionPhotos, medicines: result.medicines };
  } catch (error) {
    return { type: "error", code: error instanceof ExtractRequestError ? error.code : "network" };
  }
}

/** Starts (or reuses) the analysis for the queued photos, so remounts never send twice. */
export function runPendingAnalysis(): Promise<AnalysisOutcome> {
  const pending = state.pending ?? directVisit;
  if (running?.pending !== pending) running = { pending, promise: analyze(pending) };
  return running.promise;
}

/** Applies a finished outcome to the scan screen and returns where to go next. */
export function finishAnalysis(outcome: AnalysisOutcome): "/results" | "/scan" {
  if (outcome.type === "success") {
    const analyzed = state.pending?.photos ?? samplePhotos;
    state.analyzed.forEach((photo) => {
      const stillUsed = [...state.photos, ...analyzed].some((item) => item.previewUrl === photo.previewUrl);
      if (photo.previewUrl?.startsWith("blob:") && !stillUsed) URL.revokeObjectURL(photo.previewUrl);
    });
    set({ analyzed });
    return "/results";
  }
  if (outcome.type === "unreadable") {
    const reasons = new Map(outcome.photos.map((item) => [item.id, item.reason]));
    set({
      photos: state.photos.map((photo) =>
        reasons.has(photo.id) ? { ...photo, unreadable: reasons.get(photo.id) } : photo,
      ),
    });
    return "/scan";
  }
  set({
    notice:
      outcome.code === "rate_limited"
        ? { kind: "rate_limited" }
        : outcome.code === "quota"
          ? { kind: "quota" }
          : { kind: "failed", code: outcome.code },
  });
  return "/scan";
}

export function useScan() {
  return useSyncExternalStore(subscribe, () => state, () => initialState);
}

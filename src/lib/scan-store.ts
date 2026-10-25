"use client";

import { ExtractRequestError, requestExtraction } from "@/lib/extract-client";
import { convertHeicToJpeg } from "@/lib/heic-convert";
import { samplePhotos, sampleResult } from "@/lib/mock";
import { errorDetail, isHeic, logUploadFailure } from "@/lib/upload-error";
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

type PendingAnalysis = { photos: ScanPhoto[]; demo: boolean; groups: number[][] };

type ScanState = {
  photos: ScanPhoto[];
  notice: ScanNotice | null;
  pending: PendingAnalysis | null;
  analyzed: ScanPhoto[];
};

const DEMO_DELAY_MS = 3200;

/** Opening /analyzing without queued photos replays the sample demo. */
const directVisit: PendingAnalysis = { photos: samplePhotos, demo: true, groups: [] };

const initialState: ScanState = {
  photos: [],
  notice: null,
  pending: null,
  analyzed: [],
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
let convertSerial = 0;
const convertTokens = new Map<string, number>();

function photoFromFile(file: File): ScanPhoto {
  uploadCount += 1;
  const base = file.name.replace(/\.[^.]+$/, "") || `IMG_${String(uploadCount).padStart(4, "0")}`;
  const heic = isHeic(file);
  return {
    id: `upload-${Date.now()}-${uploadCount}`,
    filename: base.slice(0, 24),
    clinic: "",
    sample: false,
    converting: heic,
    file: heic ? undefined : file,
    previewUrl: heic ? undefined : URL.createObjectURL(file),
  };
}

function beginHeic(id: string, file: File) {
  convertSerial += 1;
  const token = convertSerial;
  convertTokens.set(id, token);
  void finishHeic(id, file, token);
}

async function finishHeic(id: string, file: File, token: number) {
  const current = () => convertTokens.get(id) === token && state.photos.some((photo) => photo.id === id);
  try {
    const jpeg = await convertHeicToJpeg(file);
    const previewUrl = URL.createObjectURL(jpeg);
    if (!current()) {
      URL.revokeObjectURL(previewUrl);
      return;
    }
    set({
      photos: state.photos.map((photo) =>
        photo.id === id ? { ...photo, file: jpeg, converting: false, convertFailed: false, previewUrl } : photo,
      ),
    });
  } catch (error) {
    logUploadFailure("unsupported_type", errorDetail(error));
    if (!current()) return;
    set({
      photos: state.photos.map((photo) =>
        photo.id === id ? { ...photo, file: undefined, converting: false, convertFailed: true, previewUrl: undefined } : photo,
      ),
    });
  }
}

/** Drops in-memory photos so a new check starts empty. */
export function resetScan() {
  const blobs = [...state.photos, ...state.analyzed];
  running = null;
  set({ photos: [], notice: null, pending: null, analyzed: [] });
  for (const photo of blobs) {
    if (photo.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(photo.previewUrl);
  }
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
  const added = images.map(photoFromFile);
  set({ photos: [...keep, ...added], notice: null });
  added.forEach((photo, index) => {
    if (photo.converting) beginHeic(photo.id, images[index]);
  });
}

function withWholeGroups(photos: ScanPhoto[]) {
  const counts = new Map<string, number>();
  for (const photo of photos) {
    if (!photo.groupId) continue;
    counts.set(photo.groupId, (counts.get(photo.groupId) ?? 0) + 1);
  }
  return photos.map((photo) =>
    photo.groupId && (counts.get(photo.groupId) ?? 0) < 2 ? { ...photo, groupId: undefined } : photo,
  );
}

export function removePhoto(id: string) {
  const photo = state.photos.find((item) => item.id === id);
  if (photo) revoke(photo);
  set({ photos: withWholeGroups(state.photos.filter((item) => item.id !== id)) });
}

export function groupPhotos(ids: string[]) {
  const chosen = new Set(ids);
  if (chosen.size < 2) return;
  const related = new Set(ids);
  for (const photo of state.photos) {
    if (photo.groupId && state.photos.some((item) => chosen.has(item.id) && item.groupId === photo.groupId)) {
      related.add(photo.id);
    }
  }
  const groupId = state.photos.find((photo) => photo.groupId && related.has(photo.id))?.groupId ?? `group-${Date.now()}`;
  set({
    photos: state.photos.map((photo) => (related.has(photo.id) ? { ...photo, groupId } : photo)),
  });
}

export function ungroupPhotos(groupId: string) {
  set({
    photos: state.photos.map((photo) => (photo.groupId === groupId ? { ...photo, groupId: undefined } : photo)),
  });
}

function groupIndexes(photos: ScanPhoto[]) {
  const map = new Map<string, number[]>();
  photos.forEach((photo, index) => {
    if (!photo.groupId) return;
    const list = map.get(photo.groupId) ?? [];
    list.push(index);
    map.set(photo.groupId, list);
  });
  return [...map.values()].filter((indexes) => indexes.length >= 2);
}

export function replacePhoto(id: string, file: File) {
  const next = photoFromFile(file);
  set({
    photos: state.photos.map((photo) => {
      if (photo.id !== id) return photo;
      revoke(photo);
      return { ...next, id: photo.id, clinic: photo.clinic, groupId: photo.groupId };
    }),
    notice: null,
  });
  if (next.converting) beginHeic(id, file);
}

export function setClinic(id: string, clinic: string) {
  const groupId = state.photos.find((photo) => photo.id === id)?.groupId;
  set({
    photos: state.photos.map((photo) =>
      photo.id === id || (groupId && photo.groupId === groupId) ? { ...photo, clinic } : photo,
    ),
  });
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
  if (state.photos.some((photo) => photo.converting)) return false;
  if (state.photos.some((photo) => photo.convertFailed)) {
    set({ notice: { kind: "failed", code: "unsupported_type" } });
    return false;
  }
  const photos = state.photos
    .filter((photo) => !photo.unreadable && !photo.convertFailed)
    .map((photo, index) => ({ ...photo, clinic: photo.clinic.trim() || fallbackClinic(index) }));
  if (photos.length === 0) return false;
  set({ pending: { photos, demo: photos.every((photo) => photo.sample), groups: groupIndexes(photos) }, notice: null });
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
  if (pending.photos.length > 5) return { type: "error", code: "too_large" };
  try {
    const indexed = pending.photos.flatMap((photo, index) =>
      photo.file ? [{ index, file: photo.file, clinic: photo.clinic }] : [],
    );
    const indexMap = new Map(indexed.map((item, position) => [item.index, position]));
    const groups = pending.groups
      .map((group) => group.flatMap((index) => (indexMap.has(index) ? [indexMap.get(index) as number] : [])))
      .filter((group) => group.length >= 2);
    const result = await requestExtraction(
      indexed.map(({ file, clinic }) => ({ file, clinic })),
      { groups },
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

"use client";

import { samplePhotos, sampleResult } from "@/lib/mock";
import { checkSafety } from "@/lib/safety";
import { requestSafety } from "@/lib/safety-client";
import type { Medicine, SafetyAlert, SourceType } from "@/types";
import { useSyncExternalStore } from "react";

/** Results live only in this tab's sessionStorage; nothing is sent back to the server. */
const STORAGE_KEY = "pillcheck_session";

export type ResultSource = "demo" | "ai";

export type SessionPhoto = { filename: string; clinic: string };

type SessionState = {
  hasResults: boolean;
  source: ResultSource;
  photos: SessionPhoto[];
  medicines: Medicine[];
  alerts: SafetyAlert[];
};

function demoState(hasResults: boolean): SessionState {
  const medicines = sampleResult().medicines;
  return {
    hasResults,
    source: "demo",
    photos: samplePhotos.map(({ filename, clinic }) => ({ filename, clinic })),
    medicines,
    alerts: checkSafety(medicines),
  };
}

const SOURCE_TYPES: SourceType[] = ["prescription_bag", "prescription", "otc_box", "bottle", "blister", "unknown"];

function storedMedicine(item: Medicine): Medicine {
  const sourceType = SOURCE_TYPES.includes(item.sourceType) ? item.sourceType : "prescription_bag";
  const timesPerDay = typeof item.timesPerDay === "number" && item.timesPerDay > 0 ? item.timesPerDay : null;
  const timeSlotsEstimated = item.timeSlotsEstimated === true;
  return {
    ...item,
    sourceType,
    timesPerDay,
    timeSlots: Array.isArray(item.timeSlots) ? item.timeSlots : null,
    timeSlotsEstimated,
    confidence: timeSlotsEstimated ? "low" : item.confidence,
  };
}

const serverState = demoState(false);

function readStored(): SessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    if (!parsed || !Array.isArray(parsed.medicines) || !Array.isArray(parsed.photos)) return null;
    const medicines = (parsed.medicines as Medicine[]).map(storedMedicine);
    const storedAlerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
    const alerts = storedAlerts.every((alert) => alert && typeof alert.kind === "string")
      ? (storedAlerts as SafetyAlert[])
      : checkSafety(medicines);
    return {
      hasResults: Boolean(parsed.hasResults),
      source: parsed.source === "ai" ? "ai" : "demo",
      photos: parsed.photos,
      medicines,
      alerts,
    };
  } catch {
    return null;
  }
}

let state: SessionState = readStored() ?? serverState;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(next: SessionState) {
  state = next;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener());
}

let safetyToken = 0;

function publishMedicines(medicines: Medicine[], patch: Partial<SessionState> = {}) {
  const token = ++safetyToken;
  emit({
    ...state,
    ...patch,
    medicines,
    alerts: checkSafety(medicines),
  });
  void requestSafety(medicines).then((alerts) => {
    if (token !== safetyToken) return;
    emit({ ...state, alerts });
  });
}

export function completeAnalysis(result: {
  source: ResultSource;
  photos: SessionPhoto[];
  medicines: Medicine[];
  alerts: SafetyAlert[];
}) {
  safetyToken += 1;
  emit({
    hasResults: result.medicines.length > 0,
    source: result.source,
    photos: result.photos,
    medicines: result.medicines,
    alerts: result.alerts,
  });
}

export function updateMedicine(medicine: Medicine) {
  publishMedicines(state.medicines.map((item) => (item.id === medicine.id ? medicine : item)));
}

export function clearSession() {
  safetyToken += 1;
  state = { hasResults: false, source: "demo", photos: [], medicines: [], alerts: [] };
  window.sessionStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

export function deleteMedicine(id: string) {
  const medicines = state.medicines.filter((item) => item.id !== id);
  publishMedicines(medicines, { hasResults: medicines.length > 0 && state.hasResults });
}

export function useSession() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => serverState);
  return {
    ...snapshot,
    photoCount: snapshot.photos.length,
    completeAnalysis,
    updateMedicine,
    deleteMedicine,
    clearSession,
  };
}

"use client";

import { sampleAlerts, samplePhotos, sampleResult } from "@/lib/mock";
import type { Medicine, SafetyAlert } from "@/types";
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
  return {
    hasResults,
    source: "demo",
    photos: samplePhotos.map(({ filename, clinic }) => ({ filename, clinic })),
    medicines: sampleResult().medicines,
    alerts: sampleAlerts,
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
    return {
      hasResults: Boolean(parsed.hasResults),
      source: parsed.source === "ai" ? "ai" : "demo",
      photos: parsed.photos,
      medicines: parsed.medicines,
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
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

export function completeAnalysis(result: {
  source: ResultSource;
  photos: SessionPhoto[];
  medicines: Medicine[];
}) {
  emit({
    hasResults: result.medicines.length > 0,
    source: result.source,
    photos: result.photos,
    medicines: result.medicines,
    alerts: result.source === "demo" ? sampleAlerts : [],
  });
}

export function updateMedicine(medicine: Medicine) {
  emit({
    ...state,
    medicines: state.medicines.map((item) => (item.id === medicine.id ? medicine : item)),
  });
}

export function deleteMedicine(id: string) {
  const medicines = state.medicines.filter((item) => item.id !== id);
  emit({
    ...state,
    medicines,
    hasResults: medicines.length > 0 && state.hasResults,
  });
}

export function useSession() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => serverState);
  return {
    ...snapshot,
    photoCount: snapshot.photos.length,
    completeAnalysis,
    updateMedicine,
    deleteMedicine,
  };
}

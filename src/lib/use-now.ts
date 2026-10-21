"use client";

import { useSyncExternalStore } from "react";

/** Cached local time. The snapshot stays the same until the next tick. */
let clock = 0;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  clock = Date.now();
  window.setInterval(() => {
    clock = Date.now();
    for (const listener of listeners) listener();
  }, 30_000);
}

export function useNow() {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => clock,
    () => 0,
  );
}

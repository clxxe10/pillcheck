"use client";

import { createContext, useContext, type ReactNode } from "react";

const DemoModeContext = createContext(false);

export function DemoModeProvider({ demoOnly, children }: { demoOnly: boolean; children: ReactNode }) {
  return <DemoModeContext.Provider value={demoOnly}>{children}</DemoModeContext.Provider>;
}

export function useDemoOnly() {
  return useContext(DemoModeContext);
}

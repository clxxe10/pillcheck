"use client";

import { ScanScreen } from "@/components/scan-screen";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ScanGate() {
  const params = useSearchParams();
  return (
    <ScanScreen
      initialError={params.get("error") === "1"}
      initialSample={params.get("sample") === "1"}
      initialFresh={params.get("fresh") === "1"}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScanGate />
    </Suspense>
  );
}

"use client";

import { ScanScreen } from "@/components/scan-screen";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ScanGate() {
  const error = useSearchParams().get("error") === "1";
  return <ScanScreen initialError={error} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScanGate />
    </Suspense>
  );
}

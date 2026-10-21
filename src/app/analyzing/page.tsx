"use client";

import { AnalyzingScreen } from "@/components/analyzing-screen";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AnalyzingGate() {
  const hold = useSearchParams().get("hold") === "1";
  return <AnalyzingScreen hold={hold} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AnalyzingGate />
    </Suspense>
  );
}

"use client";

import { HomeScreen } from "@/components/home-screen";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeGate() {
  const state = useSearchParams().get("state");
  const view = state === "empty" || state === "filled" ? state : undefined;
  return <HomeScreen view={view} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeGate />
    </Suspense>
  );
}

"use client";

import { Disclaimer, LangToggle, LogoMark, PageFrame } from "@/components/chrome";
import { CheckIcon, LockIcon } from "@/components/icons";
import { PulseOrb, Spinner } from "@/components/orb";
import { foundLabel, readProgressLabel } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { sampleResult } from "@/lib/mock";
import { requestSafety } from "@/lib/safety-client";
import { finishAnalysis, runPendingAnalysis, useScan } from "@/lib/scan-store";
import { completeAnalysis } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const READ_STEP_MS = 1200;

export function AnalyzingScreen({ hold = false }: { hold?: boolean }) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const { pending } = useScan();
  const photoCount = pending?.photos.length ?? 3;
  const count = !pending || pending.demo ? sampleResult().medicines.length : null;
  const [stage, setStage] = useState<"read" | "match" | "safety" | "done">(hold ? "match" : "read");

  useEffect(() => {
    if (hold) return;
    let cancelled = false;
    let leaveTimer = 0;
    const readTimer = window.setTimeout(() => {
      setStage((current) => (current === "read" ? "match" : current));
    }, READ_STEP_MS);
    runPendingAnalysis().then(async (outcome) => {
      if (cancelled) return;
      if (outcome.type !== "success") {
        router.replace(finishAnalysis(outcome));
        return;
      }
      setStage("safety");
      const alerts = await requestSafety(outcome.medicines);
      if (cancelled) return;
      completeAnalysis({ ...outcome, alerts });
      setStage("done");
      leaveTimer = window.setTimeout(() => {
        if (!cancelled) router.replace(finishAnalysis(outcome));
      }, 450);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(readTimer);
      window.clearTimeout(leaveTimer);
    };
  }, [hold, pending, router]);

  const steps = (
    <div className="px-[18px] lg:px-6" style={{ position: "relative", background: "#fff", borderRadius: 24 }}>
      <Step
        done={stage !== "read"}
        spinning={stage === "read"}
        title={t("analyzing.reading")}
        detail={readProgressLabel(stage === "read" ? 0 : photoCount, photoCount, lang)}
        divider
      />
      <Step
        done={stage === "safety" || stage === "done"}
        spinning={stage === "match"}
        pending={stage === "read"}
        title={t("analyzing.matching")}
        detail={count === null ? t("analyzing.matchingSub") : foundLabel(count, lang)}
        divider
      />
      <Step
        done={stage === "done"}
        spinning={stage === "safety"}
        pending={stage === "read" || stage === "match"}
        title={t("analyzing.safety")}
        detail={t("analyzing.safetySub")}
      />
    </div>
  );

  return (
    <PageFrame
      active={null}
      header={
        <>
          <div className="flex items-center justify-between lg:hidden">
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em" }}>
              <LogoMark width={38} height={22} bar={13} />
              PillCheck
            </span>
            <LangToggle />
          </div>
          <div className="hidden justify-end lg:flex">
            <LangToggle wide />
          </div>
        </>
      }
    >
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col lg:mx-auto lg:w-full lg:max-w-[560px]">
          <div className="flex h-[300px] items-center justify-center lg:h-[320px]">
            <span className="lg:hidden">
              <PulseOrb size={200} />
            </span>
            <span className="hidden lg:block">
              <PulseOrb size={240} />
            </span>
          </div>
          <h1
            className="mb-6 text-center text-[32px] leading-[1.15] lg:mb-7 lg:text-[44px] lg:leading-[1.12]"
            style={{ marginTop: 0, fontWeight: 500, letterSpacing: "-0.02em" }}
          >
            {t("analyzing.line1")}
            <br />
            <span style={{ color: "#86868D" }}>{t("analyzing.line2")}</span>
          </h1>
          {steps}
          <p
            style={{
              margin: "16px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontWeight: 400,
              fontSize: 15,
              color: "#6B6B72",
            }}
          >
            <LockIcon />
            {t("analyzing.notStored")}
          </p>
        </div>
        <div className="hidden h-8 lg:block" />
        <Disclaimer className="lg:mx-0 lg:mt-auto" />
        <div className="h-[30px] lg:hidden" />
      </div>
    </PageFrame>
  );
}

function Step({
  title,
  detail,
  done,
  spinning,
  pending,
  divider,
}: {
  title: string;
  detail: string;
  done?: boolean;
  spinning?: boolean;
  pending?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: divider ? "1px solid #EDEDF0" : undefined,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {done ? (
        <span
          style={{
            width: 32,
            height: 32,
            flex: "none",
            borderRadius: 9999,
            background: "#D4FF4F",
            color: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon />
        </span>
      ) : null}
      {spinning ? (
        <span style={{ width: 32, height: 32, flex: "none", display: "flex" }}>
          <Spinner />
        </span>
      ) : null}
      {pending ? (
        <span style={{ width: 32, height: 32, flex: "none", borderRadius: 9999, border: "1.5px solid #C7C7CC" }} />
      ) : null}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontWeight: pending ? 400 : 600, fontSize: 18, color: pending ? "#6B6B72" : "#111" }}>
          {title}
        </span>
        <span style={{ fontWeight: 400, fontSize: 15, color: "#6B6B72" }}>{detail}</span>
      </div>
    </div>
  );
}

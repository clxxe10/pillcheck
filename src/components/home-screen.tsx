"use client";

import {
  BlackBadge,
  Disclaimer,
  LangToggle,
  MobileDock,
  PageFrame,
  SeverityBadge,
  SoftChip,
  TitleBlock,
  Wordmark,
} from "@/components/chrome";
import { CameraIcon, ChevronIcon, InfoIcon, PillIcon, ScanIcon } from "@/components/icons";
import { SummaryOrb } from "@/components/orb";
import {
  alertCopy,
  clinicCountLabel,
  displayName,
  formatClock,
  inHoursLabel,
  issueCountLabel,
  medicineCount,
  slotTimes,
} from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { nextDoseHours } from "@/lib/mock";
import { useSession } from "@/lib/session";
import type { DoseSlot, Medicine, SafetyAlert } from "@/types";
import Link from "next/link";
import type { ReactNode } from "react";

const mobileOrb = { top: -70, right: -60, width: 300, height: 240 };
const desktopOrb = { top: -90, right: -70, width: 420, height: 300 };
const emptyDesktopOrb = { top: -90, right: -80, width: 420, height: 300 };

function uniqueClinics(list: Medicine[]) {
  return new Set(list.map((item) => item.clinic)).size;
}

export function HomeScreen({ view }: { view?: "empty" | "filled" }) {
  const { t } = useTranslation();
  const session = useSession();
  const medicines = session.medicines;
  const hasResults = view ? view === "filled" : session.hasResults;

  return (
    <PageFrame
      active="home"
      header={
        <div className="flex items-center justify-between lg:hidden">
          <Wordmark />
          <LangToggle />
        </div>
      }
      mobileBar={<MobileDock active="home" />}
    >
      <div className="flex flex-1 flex-col pt-[22px] lg:pt-0">
        <div className="flex items-start justify-between gap-6">
          <TitleBlock
            kicker={t("dateHome")}
            line1={t("home.line1")}
            line2={t("home.line2")}
          />
          <div className="hidden lg:block">
            <LangToggle wide />
          </div>
        </div>

        {hasResults && medicines.length > 0 ? (
          <FilledHome medicines={medicines} alerts={session.alerts} />
        ) : (
          <EmptyHome />
        )}

        <div className="hidden h-8 lg:block" />
        <Disclaimer className="lg:mx-0 lg:mt-auto" />
      </div>
    </PageFrame>
  );
}

function EmptyHome() {
  const { t } = useTranslation();
  return (
    <div className="mt-6 max-w-none lg:mt-7 lg:max-w-[620px]">
      <div style={{ position: "relative" }}>
        <SummaryOrb mobile={mobileOrb} desktop={emptyDesktopOrb} />
        <div
          className="px-5 lg:px-7"
          style={{ position: "relative", background: "#fff", borderRadius: 24 }}
        >
          <div
            style={{
              padding: "28px 0 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                background: "#F2F2F4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CameraIcon />
            </span>
            <div style={{ fontWeight: 500, fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              {t("home.emptyTitle")}
            </div>
            <p style={{ margin: 0, fontWeight: 400, fontSize: 17, lineHeight: 1.45, color: "#4A4A50" }}>
              {t("home.emptyBody")}
            </p>
            <div style={{ width: "100%", marginTop: 8 }}>
              <Link
                href="/scan"
                style={{
                  width: "100%",
                  height: 60,
                  border: "1.5px solid #D4FF4F",
                  borderRadius: 9999,
                  background: "#111",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,.16)",
                }}
              >
                <span style={{ color: "#D4FF4F", display: "flex" }}>
                  <ScanIcon />
                </span>
                {t("home.scanBags")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilledHome({ medicines, alerts }: { medicines: Medicine[]; alerts: SafetyAlert[] }) {
  const { t, lang } = useTranslation();
  const evening = medicines.filter((item) => item.timeSlots.includes("evening"));
  const slot: DoseSlot = evening.length > 0 ? "evening" : firstSlot(medicines);
  const doseMeds =
    slot === "evening" ? evening : medicines.filter((item) => item.timeSlots.includes(slot));
  const reviewCount = medicines.filter((item) => item.confidence === "low").length;

  return (
    <>
      <div className="mt-6 lg:mt-7 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-3.5">
        <div style={{ position: "relative" }}>
          <SummaryOrb mobile={mobileOrb} desktop={desktopOrb} />
          <div
            className="px-[18px] lg:px-6"
            style={{ position: "relative", background: "#fff", borderRadius: 24 }}
          >
            <div
              style={{
                padding: "18px 0 14px",
                borderBottom: "1px solid #EDEDF0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 400, fontSize: 15, color: "#6B6B72" }}>{t("home.nextDose")}</span>
              {slot === "evening" ? <BlackBadge>{inHoursLabel(nextDoseHours, lang)}</BlackBadge> : null}
            </div>
            <Link
              href="/results"
              style={{
                padding: "16px 0",
                borderBottom: "1px solid #EDEDF0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                color: "inherit",
              }}
            >
              <div>
                <div
                  className="text-[26px] lg:text-[30px]"
                  style={{ fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.02em" }}
                >
                  {t(`slot.${slot}`)} · {formatClock(slotTimes[slot], lang)}
                </div>
                <div style={{ marginTop: 4, fontWeight: 400, fontSize: 16, color: "#4A4A50" }}>
                  {medicineCount(doseMeds.length, lang)}
                </div>
              </div>
              <ChevronIcon stroke="#6B6B72" />
            </Link>
            <div style={{ padding: "12px 0 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {doseMeds.map((item) => (
                <SoftChip key={item.id}>{displayName(item, lang)}</SoftChip>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5 lg:contents lg:mt-0">
          <StatCard href="/results" icon={<PillIcon />} value={medicines.length} label={t("home.medicines")} />
          <StatCard href="/results" icon={<InfoIcon size={22} />} value={reviewCount} label={t("home.needReview")} />
        </div>
      </div>

      <div style={{ margin: "30px 2px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em" }}>{t("home.safety")}</h2>
      </div>

      <div className="px-[18px] lg:px-6" style={{ position: "relative", background: "#fff", borderRadius: 24 }}>
        <div
          style={{
            padding: "18px 0 14px",
            borderBottom: "1px solid #EDEDF0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 400, fontSize: 15, color: "#6B6B72" }}>
              {clinicCountLabel(uniqueClinics(medicines), lang)}
            </div>
            <div style={{ marginTop: 4, fontWeight: 500, fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {issueCountLabel(alerts.length, lang)}
            </div>
          </div>
          <BlackBadge>{t("home.checkNow")}</BlackBadge>
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-6">
          {alerts.map((alert) => (
            <HomeAlert key={alert.id} alert={alert} />
          ))}
        </div>
        <Link
          href="/results"
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 500,
            fontSize: 17,
            color: "#111",
          }}
        >
          {t("home.seeFull")}
          <ChevronIcon stroke="#111" />
        </Link>
      </div>
    </>
  );
}

function firstSlot(list: Medicine[]): DoseSlot {
  const order: DoseSlot[] = ["morning", "lunch", "evening", "bedtime"];
  return order.find((slot) => list.some((item) => item.timeSlots.includes(slot))) ?? "evening";
}

function StatCard({
  href,
  icon,
  value,
  label,
}: {
  href: string;
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="px-[18px] py-4 lg:h-full lg:p-[22px]"
      style={{
        background: "#fff",
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        color: "inherit",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", color: "#111" }}>
        {icon}
        <ChevronIcon stroke="#6B6B72" />
      </div>
      <div>
        <div style={{ fontWeight: 500, fontSize: 28, lineHeight: 1 }}>{value}</div>
        <div style={{ fontWeight: 400, fontSize: 15, color: "#6B6B72", marginTop: 4 }}>{label}</div>
      </div>
    </Link>
  );
}

function HomeAlert({ alert }: { alert: SafetyAlert }) {
  const { lang, t } = useTranslation();
  const copy = alertCopy(alert, lang, {
    label: t(`alerts.${alert.id}.label`),
    homeTitle: t(`alerts.${alert.id}.homeTitle`),
    title: t(`alerts.${alert.id}.title`),
    body: t(`alerts.${alert.id}.body`),
  });
  return (
    <Link
      href="/results"
      style={{
        position: "relative",
        padding: "14px 0",
        borderBottom: "1px solid #EDEDF0",
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "inherit",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -1,
          left: 0,
          right: 0,
          height: 2,
          borderRadius: 2,
          background: "linear-gradient(90deg,#D4FF4F,#7DF0C6)",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
        <SeverityBadge tone={alert.severity === "danger" ? "danger" : "warning"}>{copy.label}</SeverityBadge>
        <span style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.3 }}>{copy.homeTitle}</span>
      </div>
      <ChevronIcon stroke="#6B6B72" />
    </Link>
  );
}

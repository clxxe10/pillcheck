"use client";

import {
  BlackBadge,
  Disclaimer,
  LangToggle,
  LogoMark,
  MobileDock,
  PageFrame,
  SeverityBadge,
  SoftChip,
} from "@/components/chrome";
import { ChevronIcon, PencilIcon, PinIcon } from "@/components/icons";
import { EditSheet } from "@/components/edit-sheet";
import { LimeRule, SummaryOrb } from "@/components/orb";
import {
  displayName,
  doseAmount,
  doseLine,
  formatClock,
  formatToday,
  issueCountLabel,
  resultsMeta,
  reviewCountLabel,
  shortName,
  slotOrder,
  slotTimes,
  summaryLabel,
  warningCopy,
} from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useNow } from "@/lib/use-now";
import type { DoseSlot, Medicine, SafetyAlert } from "@/types";
import { useState } from "react";

const sourceStyle = { fontWeight: 400, fontSize: 13, lineHeight: 1.3, color: "#6B6B72", textDecoration: "none" };

const mobileOrb = { top: -70, right: -60, width: 300, height: 240 };
const desktopOrb = { top: -90, right: -70, width: 420, height: 300 };

export function ResultsScreen() {
  const { t, lang } = useTranslation();
  const now = useNow();
  const { medicines, alerts, photoCount, updateMedicine, deleteMedicine } = useSession();
  const [slot, setSlot] = useState<DoseSlot | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const editing = medicines.find((item) => item.id === editingId) ?? null;
  const reviewCount = medicines.filter((item) => item.confidence === "low").length;
  const clinics = new Set(medicines.map((item) => item.clinic)).size;

  async function share() {
    const list = medicines
      .map((medicine) => `${displayName(medicine, lang)} — ${medicine.ingredient} — ${doseLine(medicine, lang)} — ${medicine.clinic}`)
      .join("\n");
    const warnings = alerts
      .map((alert) => {
        const copy = warningCopy(alert, medicines, lang, t);
        return `${copy.label}: ${copy.title}\n${copy.body}`;
      })
      .join("\n\n");
    const text = [list, warnings, t("disclaimer")].filter(Boolean).join("\n\n");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "PillCheck", text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <PageFrame
      active="list"
      showLogo={false}
      header={
        <>
          <div className="flex items-center justify-between lg:hidden">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LogoMark width={38} height={22} bar={13} />
              <h1 style={{ margin: 0, fontWeight: 600, fontSize: 34, letterSpacing: "-0.02em" }}>
                {t("results.title")}
              </h1>
            </div>
            <LangToggle />
          </div>
          <div className="hidden items-center justify-between lg:flex">
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12, alignSelf: "center" }}>
                <LogoMark width={44} height={26} bar={17} />
                <h1 style={{ margin: 0, fontWeight: 600, fontSize: 40, letterSpacing: "-0.025em" }}>
                  {t("results.title")}
                </h1>
              </span>
              <span style={{ fontWeight: 400, fontSize: 17, color: "#6B6B72" }}>
                {resultsMeta(photoCount, now ? formatToday(lang, "short", new Date(now)) : "", lang)}
              </span>
            </div>
            <LangToggle wide solid />
          </div>
        </>
      }
      mobileBar={<MobileDock active="list" />}
      overlay={
        <>
        {copied ? (
          <div
            role="status"
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 lg:bottom-8"
            style={{
              height: 44,
              padding: "0 18px",
              borderRadius: 9999,
              background: "#111",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,.18)",
            }}
          >
            {t("results.copied")}
          </div>
        ) : null}
        {editing ? (
          <EditSheet
            key={editing.id}
            medicine={editing}
            onClose={() => setEditingId(null)}
            onSave={updateMedicine}
            onDelete={deleteMedicine}
          />
        ) : null}
        </>
      }
    >
      <div className="flex flex-1 flex-col pt-4 lg:pt-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-x-4">
          <div id="alerts" className="lg:col-start-1 lg:row-start-1">
            <AlertSummary
              meds={medicines.length}
              clinics={clinics}
              medicines={medicines}
              alerts={alerts}
              onShare={share}
            />
          </div>

          <div id="schedule" className="order-3 mt-[30px] lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-0">
            <Schedule medicines={medicines} slot={slot} onSlot={setSlot} />
          </div>

          <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-2">
            <div className="mx-0.5 mt-[30px] mb-3 flex items-center justify-between lg:mt-8">
              <h2 style={{ margin: 0, fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em" }}>
                {t("results.medicines")}
              </h2>
              <span style={{ fontWeight: 400, fontSize: 16, color: "#6B6B72" }}>
                {reviewCountLabel(reviewCount, lang)}
              </span>
            </div>
            <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-3.5 lg:overflow-visible lg:px-0">
              {medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} onEdit={() => setEditingId(medicine.id)} />
              ))}
            </div>
          </div>
        </div>
        <Disclaimer className="lg:mx-0 lg:mt-7" />
      </div>
    </PageFrame>
  );
}

function AlertSummary({
  meds,
  clinics,
  medicines,
  alerts,
  onShare,
}: {
  meds: number;
  clinics: number;
  medicines: Medicine[];
  alerts: SafetyAlert[];
  onShare: () => void;
}) {
  const { t, lang } = useTranslation();
  return (
    <div style={{ position: "relative" }}>
      <SummaryOrb mobile={mobileOrb} desktop={desktopOrb} />
      <div className="px-[18px] lg:px-6" style={{ position: "relative", background: "#fff", borderRadius: 24 }}>
        <div
          className="pt-5 pb-4 lg:pt-[22px] lg:pb-[18px]"
          style={{
            borderBottom: "1px solid #EDEDF0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div className="text-[15px] lg:text-[16px]" style={{ fontWeight: 400, color: "#6B6B72" }}>
              {summaryLabel(meds, clinics, lang)}
            </div>
            <div
              className="text-[30px] lg:text-[36px]"
              style={{ marginTop: 4, fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}
            >
              {issueCountLabel(alerts.length, lang)}
            </div>
          </div>
          <BlackBadge>{t("results.checkNow")}</BlackBadge>
        </div>
        {alerts.map((alert) => (
          <ResultAlert key={alert.id} alert={alert} medicines={medicines} />
        ))}
        <button
          type="button"
          onClick={onShare}
          className="h-14 lg:h-[60px]"
          style={{
            width: "100%",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 500,
            fontSize: 17,
            color: "#111",
          }}
        >
          {t("results.share")}
          <ChevronIcon stroke="#111" />
        </button>
      </div>
    </div>
  );
}

function ResultAlert({ alert, medicines }: { alert: SafetyAlert; medicines: Medicine[] }) {
  const { t, lang } = useTranslation();
  const copy = warningCopy(alert, medicines, lang, t);
  const source = t("alerts.source").replace("{name}", alert.sourceName);
  return (
    <div
      className="py-4 lg:py-[18px]"
      style={{
        position: "relative",
        borderBottom: "1px solid #EDEDF0",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <LimeRule />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SeverityBadge tone={alert.severity === "danger" ? "danger" : "warning"}>{copy.label}</SeverityBadge>
        <ChevronIcon stroke="#6B6B72" />
      </div>
      <div className="text-[19px] lg:text-[20px]" style={{ fontWeight: 600, lineHeight: 1.25 }}>
        {copy.title}
      </div>
      <p className="leading-[1.45] lg:leading-[1.5]" style={{ margin: 0, fontWeight: 400, fontSize: 16, color: "#4A4A50" }}>
        {copy.body}
      </p>
      {alert.sourceUrl ? (
        <a href={alert.sourceUrl} target="_blank" rel="noreferrer" style={sourceStyle}>
          {source}
        </a>
      ) : (
        <span style={sourceStyle}>{source}</span>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
        {alert.medicineIds.map((id) => {
          const medicine = medicines.find((item) => item.id === id);
          if (!medicine) return null;
          return <SoftChip key={id}>{`${shortName(medicine, lang)} · ${medicine.clinic}`}</SoftChip>;
        })}
      </div>
    </div>
  );
}

function MedicineCard({ medicine, onEdit }: { medicine: Medicine; onEdit: () => void }) {
  const { t, lang } = useTranslation();
  return (
    <div className="w-[264px] flex-none rounded-[20px] bg-white px-4 lg:w-auto lg:rounded-[22px] lg:px-5">
      <div
        className="min-h-[62px] pt-4 pb-3 lg:min-h-0 lg:pt-[18px]"
        style={{
          borderBottom: "1px solid #EDEDF0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span className="text-[18px] lg:text-[19px]" style={{ fontWeight: 500, lineHeight: 1.2 }}>
          {displayName(medicine, lang)}
        </span>
        {medicine.confidence === "low" ? (
          <span
            className="h-6 px-[9px] text-[12.5px] lg:h-[26px] lg:px-2.5 lg:text-[13px]"
            style={{
              borderRadius: 9999,
              background: "#4E6075",
              color: "#fff",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              flex: "none",
            }}
          >
            <span className="lg:hidden">{t("results.review")}</span>
            <span className="hidden lg:inline">{t("results.needsReview")}</span>
          </span>
        ) : null}
      </div>
      <div className="pt-3 pb-3.5 lg:flex lg:items-end lg:gap-2.5 lg:pb-4">
        <div className="flex flex-col gap-1 lg:flex-1">
          <span style={{ fontWeight: 400, fontSize: 15, lineHeight: 1.35, color: "#4A4A50" }}>{medicine.ingredient}</span>
          <span style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.35 }}>{doseLine(medicine, lang)}</span>
          <div className="mt-1.5 flex items-center justify-between gap-2 lg:mt-0 lg:block">
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, fontSize: 14, color: "#6B6B72" }}>
              <PinIcon size={15} />
              {medicine.clinic}
            </span>
            <button
              type="button"
              aria-label={t("editLabel")}
              onClick={onEdit}
              className="flex lg:hidden"
              style={editButton}
            >
              <PencilIcon size={18} />
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label={t("editLabel")}
          onClick={onEdit}
          className="hidden lg:flex"
          style={{ ...editButton, alignSelf: "flex-end" }}
        >
          <PencilIcon size={18} />
        </button>
      </div>
    </div>
  );
}

const editButton = {
  width: 44,
  height: 44,
  flex: "none" as const,
  border: "1px solid #E3E3E7",
  borderRadius: 9999,
  background: "#fff",
  color: "#111",
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

function Schedule({
  medicines,
  slot,
  onSlot,
}: {
  medicines: Medicine[];
  slot: DoseSlot | "all";
  onSlot: (slot: DoseSlot | "all") => void;
}) {
  const { t, lang } = useTranslation();
  const rows = (slot === "all" ? slotOrder : [slot])
    .map((id) => ({
      id,
      meds: medicines.filter((item) => item.timeSlots.includes(id)),
    }))
    .filter((row) => slot !== "all" || row.meds.length > 0);

  function chips() {
    return (["all", ...slotOrder] as const).map((id) => {
        const active = slot === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSlot(id)}
            className="h-11 flex-none px-4 text-[16px] lg:flex-initial lg:px-3.5 lg:text-[15px]"
            style={{
              borderRadius: 9999,
              background: active ? "#D4FF4F" : "transparent",
              color: active ? "#111" : "#6B6B72",
              fontWeight: active ? 600 : 500,
            }}
          >
            {t(id === "all" ? "slot.all" : `slot.${id}`)}
        </button>
      );
    });
  }

  return (
    <>
      <div className="lg:hidden">
        <h2 style={{ margin: "0 2px 8px", fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em" }}>
          {t("results.schedule")}
        </h2>
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2.5">{chips()}</div>
        <div className="px-[18px]" style={{ background: "#fff", borderRadius: 24 }}>
          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                display: "grid",
                gridTemplateColumns: "96px 1fr",
                gap: 12,
                padding: "16px 0",
                borderBottom: "1px solid #EDEDF0",
              }}
            >
              <SlotLabel id={row.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {row.meds.map((medicine) => (
                  <div key={medicine.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontWeight: 400, fontSize: 16, lineHeight: 1.3 }}>
                    <span style={{ fontWeight: 500 }}>{shortName(medicine, lang)}</span>
                    <span style={{ color: "#6B6B72" }}>{doseAmount(medicine.dose, lang)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden px-6 lg:block" style={{ background: "#fff", borderRadius: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "16px 0 12px",
            borderBottom: "1px solid #EDEDF0",
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em" }}>{t("results.schedule")}</h2>
          <div style={{ display: "flex", gap: 2 }}>{chips()}</div>
        </div>
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: "130px 1fr",
              gap: 16,
              padding: "16px 0",
              borderBottom: "1px solid #EDEDF0",
            }}
          >
            <SlotLabel id={row.id} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {row.meds.map((medicine) => (
                <span
                  key={medicine.id}
                  style={{
                    minHeight: 36,
                    padding: "6px 14px",
                    borderRadius: 9999,
                    background: "#F2F2F4",
                    fontWeight: 500,
                    fontSize: 15,
                    lineHeight: 1.3,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {shortName(medicine, lang)}
                  <span style={{ fontWeight: 400, color: "#6B6B72" }}>{doseAmount(medicine.dose, lang)}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
        <div style={{ height: 8 }} />
      </div>
    </>
  );
}

function SlotLabel({ id }: { id: DoseSlot }) {
  const { t, lang } = useTranslation();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontWeight: 500, fontSize: 18 }}>{t(`slot.${id}`)}</span>
      <span style={{ fontWeight: 400, fontSize: 14, color: "#6B6B72" }}>{formatClock(slotTimes[id], lang)}</span>
    </div>
  );
}

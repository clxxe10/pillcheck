"use client";

import { BlackBadge, Disclaimer, PageFrame, SeverityBadge, SoftChip } from "@/components/chrome";
import { ChevronIcon, PencilIcon, PinIcon } from "@/components/icons";
import { EditSheet } from "@/components/edit-sheet";
import { LimeRule, SummaryOrb } from "@/components/orb";
import {
  displayName,
  doseAmount,
  doseLine,
  formatClock,
  formatDays,
  formatDose,
  formatTimes,
  formatToday,
  issueCountLabel,
  medicineSlots,
  placeLabel,
  resultsMeta,
  reviewCountLabel,
  shortName,
  sourceKindLabel,
  sourceLine,
  slotOrder,
  slotTimes,
  summaryLabel,
  warningCopy,
} from "@/lib/format";
import { useTranslation, type Lang } from "@/lib/i18n";
import {
  buildShareText,
  createResultsPdf,
  downloadPdf,
  loadPdfFont,
  pdfFile,
  pdfFilename,
  type PdfMedicine,
  type PdfSlot,
  type PdfWarning,
} from "@/lib/results-pdf";
import { resetScan } from "@/lib/scan-store";
import { useSession } from "@/lib/session";
import { useNow } from "@/lib/use-now";
import type { DoseSlot, Medicine, SafetyAlert } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sourceStyle = { fontWeight: 400, fontSize: 13, lineHeight: 1.3, color: "#6B6B72", textDecoration: "none" };

const mobileOrb = { top: -70, right: -60, width: 300, height: 240 };
const desktopOrb = { top: -90, right: -70, width: 420, height: 300 };

export function ResultsScreen() {
  const { t, lang } = useTranslation();
  const now = useNow();
  const router = useRouter();
  const { medicines, alerts, photoCount, hasResults, updateMedicine, deleteMedicine, clearSession } = useSession();
  const [ready, setReady] = useState(false);
  const [slot, setSlot] = useState<DoseSlot | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  useEffect(() => {
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && !hasResults) router.replace("/scan?fresh=1");
  }, [ready, hasResults, router]);
  const editing = medicines.find((item) => item.id === editingId) ?? null;
  const reviewCount = medicines.filter((item) => item.confidence === "low").length;
  const clinics = new Set(medicines.map((item) => item.clinic)).size;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 3200);
  }

  function shareText() {
    const lines = medicines.map((medicine) => {
      const kind = sourceKindLabel(medicine.sourceType, lang);
      const note = medicine.note ? ` — ${medicine.note}` : "";
      const place = placeLabel(medicine.clinic, medicine.sourceImageIndex + 1, lang);
      return `${displayName(medicine, lang)} — ${medicine.ingredient}${note} — ${doseLine(medicine, lang)} — ${place}${kind ? ` — ${kind}` : ""}`;
    });
    const warnings = alerts.map((alert) => {
      const copy = warningCopy(alert, medicines, lang, t);
      const source = sourceLine(alert.sourceName, t);
      return `${copy.label}: ${copy.title}\n${copy.body}\n${source}`;
    });
    return buildShareText({ medicines: lines, warnings, disclaimer: t("disclaimer") });
  }

  async function pdfBytes() {
    const font = await loadPdfFont();
    const date = now ? new Date(now) : new Date();
    return createResultsPdf(font, {
      dateLabel: formatToday(lang, "short", date),
      warningsTitle: t("results.pdfWarnings"),
      medicinesTitle: t("results.medicines"),
      scheduleTitle: t("results.schedule"),
      none: t("results.pdfNone"),
      disclaimer: t("disclaimer"),
      warnings: alerts.map((alert) => pdfWarning(alert, medicines, lang, t)),
      medicines: medicines.map((medicine) => pdfMedicine(medicine, lang, t)),
      slots: pdfSlots(medicines, lang, t),
    });
  }

  async function savePdf() {
    if (saving) return;
    setSaving(true);
    try {
      const date = now ? new Date(now) : new Date();
      downloadPdf(await pdfBytes(), pdfFilename(date));
    } catch {
      showToast(t("results.pdfFailed"));
      window.print();
    } finally {
      setSaving(false);
    }
  }

  async function share() {
    const text = shareText();
    if (typeof navigator.share === "function") {
      try {
        const filename = pdfFilename(now ? new Date(now) : new Date());
        const files = await shareFiles(filename, pdfBytes);
        await navigator.share(files ? { title: "PillCheck", text, files } : { title: "PillCheck", text });
        return;
      } catch (error) {
        if (isAbort(error)) return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast(t("results.copied"));
    } catch {
      setManualCopy(text);
    }
  }

  function startOver() {
    clearSession();
    resetScan();
    router.push("/scan?fresh=1");
  }

  if (!ready || !hasResults) return <PageFrame>{null}</PageFrame>;

  return (
    <PageFrame
      overlay={
        <>
        {toast ? (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 max-w-[min(92vw,440px)] -translate-x-1/2 px-4 text-center"
            style={{
              minHeight: 44,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 9999,
              background: "#111",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              lineHeight: 1.35,
              display: "flex",
              alignItems: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,.18)",
            }}
          >
            {toast}
          </div>
        ) : null}
        {manualCopy ? <CopyDialog text={manualCopy} onClose={() => setManualCopy(null)} /> : null}
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
      <div className="flex flex-1 flex-col gap-5 lg:gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[32px] font-bold tracking-[-0.03em] lg:text-[40px]">{t("results.title")}</h1>
          <div className="flex items-center gap-1.5 text-[13px] text-[rgba(60,60,67,0.7)] lg:text-[14px]">
            <img src="/brand/clock-gray.svg" alt="" width={15} height={15} />
            {t("results.ephemeral")}
          </div>
          <div className="text-[15px] text-[#6B6B72]">
            {resultsMeta(photoCount, now ? formatToday(lang, "short", new Date(now)) : "", lang)}
          </div>
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-x-4">
          <div id="alerts" className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1">
            <AlertSummary
              meds={medicines.length}
              clinics={clinics}
              medicines={medicines}
              alerts={alerts}
              onShare={share}
            />
            <div className="lg:hidden">
              <ResultsActions saving={saving} onSavePdf={savePdf} onPrint={() => window.print()} onShare={share} onStartOver={startOver} />
            </div>
          </div>

          <div id="schedule" className="order-3 mt-[30px] lg:order-none lg:col-start-2 lg:row-start-1 lg:mt-0">
            <Schedule medicines={medicines} slot={slot} onSlot={setSlot} />
          </div>

          <div className="hidden lg:col-span-2 lg:row-start-2 lg:mt-4 lg:block">
            <ResultsActions saving={saving} onSavePdf={savePdf} onPrint={() => window.print()} onShare={share} onStartOver={startOver} />
          </div>

          <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-3">
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
        <ResultsActions saving={saving} onSavePdf={savePdf} onPrint={() => window.print()} onShare={share} onStartOver={startOver} />
        <Disclaimer className="lg:mx-0 lg:mt-2" />
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
          className="no-print h-14 lg:h-[60px]"
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
  const source = sourceLine(alert.sourceName, t);
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
      {copy.lines && copy.lines.length > 1 ? (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {copy.lines.map((line) => (
            <li key={line.label}>
              <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.35, color: "#111" }}>{line.label}</div>
              <p className="leading-[1.45]" style={{ margin: "2px 0 0", fontWeight: 400, fontSize: 16, color: "#4A4A50" }}>
                {line.detail}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="leading-[1.45] lg:leading-[1.5]" style={{ margin: 0, fontWeight: 400, fontSize: 16, color: "#4A4A50" }}>
          {copy.body}
        </p>
      )}
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
          return (
            <SoftChip key={id}>{`${shortName(medicine, lang)} · ${placeLabel(medicine.clinic, medicine.sourceImageIndex + 1, lang)}`}</SoftChip>
          );
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
        <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          {sourceKindLabel(medicine.sourceType, lang) ? (
            <span style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.2, color: "#6B6B72" }}>
              {sourceKindLabel(medicine.sourceType, lang)}
            </span>
          ) : null}
          <span className="text-[18px] lg:text-[19px]" style={{ fontWeight: 500, lineHeight: 1.2 }}>
            {displayName(medicine, lang)}
          </span>
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
          {medicine.note ? (
            <span style={{ fontWeight: 400, fontSize: 13, lineHeight: 1.35, color: "#6B6B72" }}>{medicine.note}</span>
          ) : null}
          <span style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.35 }}>{doseLine(medicine, lang)}</span>
          {medicine.timeSlotsEstimated ? (
            <span style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.3, color: "#6B6B72" }}>{t("results.estimated")}</span>
          ) : null}
          <div className="mt-1.5 flex items-center justify-between gap-2 lg:mt-0 lg:block">
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, fontSize: 14, color: "#6B6B72" }}>
              <PinIcon size={15} />
              {placeLabel(medicine.clinic, medicine.sourceImageIndex + 1, lang)}
            </span>
            <button
              type="button"
              aria-label={t("editLabel")}
              onClick={onEdit}
              className="no-print flex lg:hidden"
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
          className="no-print hidden lg:flex"
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

function ResultsActions({
  saving,
  onSavePdf,
  onPrint,
  onShare,
  onStartOver,
}: {
  saving: boolean;
  onSavePdf: () => void;
  onPrint: () => void;
  onShare: () => void;
  onStartOver: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="no-print grid grid-cols-2 gap-2 lg:flex lg:flex-nowrap">
      <ActionButton icon="download-white" label={saving ? t("results.saving") : t("results.savePdf")} primary busy={saving} onClick={onSavePdf} />
      <ActionButton icon="printer" label={t("results.print")} onClick={onPrint} />
      <ActionButton icon="share" label={t("results.share")} onClick={onShare} />
      <ActionButton icon="restart-gray" label={t("results.startOver")} quiet onClick={onStartOver} />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
  quiet = false,
  busy = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  primary?: boolean;
  quiet?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy || undefined}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-3 py-2.5 text-center text-[14px] leading-snug font-semibold lg:w-auto lg:px-4 lg:text-[15px]"
      style={
        primary
          ? { background: "#000", color: "#fff", border: "1.5px solid #D4FF4F", opacity: busy ? 0.7 : 1 }
          : quiet
            ? { background: "#fff", color: "rgba(60,60,67,0.8)", boxShadow: "inset 0 0 0 0.5px rgba(60,60,67,0.18)" }
            : { background: "#fff", color: "#000", boxShadow: "inset 0 0 0 0.5px rgba(60,60,67,0.25)" }
      }
    >
      {busy ? (
        <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <img src={`/brand/${icon}.svg`} alt="" width={17} height={17} className="shrink-0" />
      )}
      <span>{label}</span>
    </button>
  );
}

function CopyDialog({ text, onClose }: { text: string; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="copy-dialog-title"
        className="w-full max-w-lg rounded-3xl bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="copy-dialog-title" className="text-[20px] font-semibold">{t("results.copyTitle")}</h2>
        <p className="mt-1 text-[14px] text-[#6B6B72]">{t("results.copyHelp")}</p>
        <textarea
          readOnly
          value={text}
          className="mt-3 h-48 w-full resize-none rounded-2xl bg-[#F5F5F7] p-3 text-[14px] leading-snug"
          onFocus={(event) => event.currentTarget.select()}
        />
        <button type="button" onClick={onClose} className="mt-3 h-11 rounded-full bg-black px-5 text-[15px] font-semibold text-white">
          {t("results.copyClose")}
        </button>
      </div>
    </div>
  );
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

async function shareFiles(filename: string, makePdf: () => Promise<Uint8Array>) {
  if (typeof navigator.canShare !== "function") return undefined;
  try {
    const file = pdfFile(await makePdf(), filename);
    return navigator.canShare({ files: [file] }) ? [file] : undefined;
  } catch (error) {
    if (isAbort(error)) throw error;
    return undefined;
  }
}

function pdfWarning(alert: SafetyAlert, medicines: Medicine[], lang: Lang, t: (key: string) => string): PdfWarning {
  const copy = warningCopy(alert, medicines, lang, t);
  return {
    label: copy.label,
    title: copy.title,
    body: copy.body,
    source: sourceLine(alert.sourceName, t),
  };
}

function pdfMedicine(medicine: Medicine, lang: Lang, t: (key: string) => string): PdfMedicine {
  return {
    name: displayName(medicine, lang),
    ingredient: [medicine.ingredient, medicine.note].filter(Boolean).join("\n"),
    dose: formatDoseOrDash(medicine.dose, lang),
    times: medicine.timesPerDay === null ? "—" : formatTimes(medicine.timesPerDay, lang),
    days: formatDays(medicine.days, lang),
    clinic: placeLabel(medicine.clinic, medicine.sourceImageIndex + 1, lang),
    estimated: medicine.timeSlotsEstimated ? t("results.estimated") : "",
  };
}

function pdfSlots(medicines: Medicine[], lang: Lang, t: (key: string) => string): PdfSlot[] {
  return slotOrder
    .map((id) => ({
      label: t(`slot.${id}`),
      time: formatClock(slotTimes[id], lang),
      items: medicines
        .filter((medicine) => medicineSlots(medicine).includes(id))
        .map((medicine) => ({ name: shortName(medicine, lang), dose: doseAmount(medicine.dose, lang) })),
    }))
    .filter((slot) => slot.items.length > 0);
}

function formatDoseOrDash(dose: string, lang: Lang) {
  return formatDose(dose, lang) || "—";
}

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
      meds: medicines.filter((item) => medicineSlots(item).includes(id)),
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

"use client";

import { Disclaimer } from "@/components/chrome";
import {
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { photoStripe } from "@/components/orb";
import {
  displayName,
  formatDays,
  formatDose,
  medicineSlots,
  slotOrder,
  sourcePlaceLabel,
} from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { useScan } from "@/lib/scan-store";
import { useSession } from "@/lib/session";
import type { DoseSlot, Medicine } from "@/types";
import { useEffect, useState } from "react";

const mono = 'ui-monospace, "SF Mono", Menlo, monospace';

export function EditSheet({
  medicine,
  onClose,
  onSave,
  onDelete,
}: {
  medicine: Medicine;
  onClose: () => void;
  onSave: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
}) {
  const { t, lang } = useTranslation();
  const { photos } = useSession();
  const { analyzed } = useScan();
  const sourcePhoto = photos[medicine.sourceImageIndex];
  const preview = analyzed[medicine.sourceImageIndex]?.previewUrl;
  const needsReview = medicine.confidence === "low";
  const [name, setName] = useState(displayName(medicine, lang));
  const [ingredient, setIngredient] = useState(medicine.ingredient);
  const [dose, setDose] = useState(formatDose(medicine.dose, lang));
  const [times, setTimes] = useState<number | null>(medicine.timesPerDay);
  const [days, setDays] = useState<number | null>(medicine.days);
  const [slots, setSlots] = useState<DoseSlot[]>(medicineSlots(medicine));
  const [photoOpen, setPhotoOpen] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function save() {
    const nextName = name.trim();
    const nextDose = dose.trim();
    onSave({
      ...medicine,
      ...(nextName ? (lang === "ko" ? { name: nextName } : { nameEn: nextName }) : {}),
      ingredient: ingredient.trim(),
      dose: nextDose && nextDose !== formatDose(medicine.dose, lang) ? nextDose : medicine.dose,
      timesPerDay: times,
      days,
      timeSlots: slotOrder.filter((slot) => slots.includes(slot)),
      confidence: "high",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40">
      {photoOpen && preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black lg:bg-[rgba(17,17,17,.72)] lg:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={t("edit.view")}
        >
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setPhotoOpen(false)}
            className="absolute top-4 right-4 z-10 lg:top-6 lg:right-6"
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              background: "rgba(255,255,255,.92)",
              color: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview, not a remote asset */}
          <img
            src={preview}
            alt=""
            className="h-full w-full object-contain lg:h-auto lg:max-h-[80vh] lg:w-auto lg:max-w-[860px] lg:rounded-2xl"
          />
        </div>
      ) : null}
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(17,17,17,.38)] lg:bg-[rgba(17,17,17,.32)]"
      />
      <div
        className="absolute inset-x-0 top-[60px] bottom-0 flex flex-col gap-4 overflow-y-auto rounded-t-[38px] bg-white px-[18px] pt-2 pb-[34px] shadow-[0_-2px_30px_rgba(0,0,0,.15)] lg:inset-auto lg:top-3 lg:right-3 lg:bottom-3 lg:w-[460px] lg:rounded-[28px] lg:px-6 lg:py-[22px] lg:shadow-[-8px_0_40px_rgba(0,0,0,.18)]"
      >
        <span
          className="self-center lg:hidden"
          style={{ width: 40, height: 5, borderRadius: 9999, background: "#D1D1D6" }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: 24, letterSpacing: "-0.01em" }}>{t("edit.title")}</h2>
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              background: "#F2F2F4",
              color: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            padding: 16,
            borderRadius: 20,
            background: "#F2F2F4",
          }}
        >
          <div
            style={{
              width: 64,
              height: 84,
              flex: "none",
              borderRadius: 14,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 6,
              fontFamily: mono,
              fontWeight: 600,
              fontSize: 10,
              color: "#6B6B72",
              ...photoStripe(true),
              ...(preview
                ? { backgroundImage: `url("${preview}")`, backgroundSize: "cover", backgroundPosition: "center" }
                : {}),
            }}
          >
            {preview ? null : sourcePhoto?.filename}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontWeight: 400, fontSize: 14, color: "#6B6B72" }}>{t("edit.source")}</span>
            <span style={{ fontWeight: 600, fontSize: 17 }}>
              {sourcePlaceLabel(medicine.clinic, medicine.sourceImageIndex + 1, lang)}
            </span>
            <button
              type="button"
              onClick={() => {
                if (preview) setPhotoOpen(true);
              }}
              style={{
                fontWeight: 500,
                fontSize: 15,
                color: "#111",
                display: "flex",
                alignItems: "center",
                gap: 4,
                width: "fit-content",
                textDecoration: "underline",
              }}
            >
              {t("edit.view")}
              <ChevronIcon size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {needsReview ? (
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "14px 16px",
              borderRadius: 18,
              border: "1px solid #E3E3E7",
              background: "#fff",
            }}
          >
            <span
              style={{
                height: 28,
                padding: "0 12px",
                borderRadius: 9999,
                background: "#4E6075",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                flex: "none",
              }}
            >
              {t("edit.review")}
            </span>
            <span style={{ fontWeight: 400, fontSize: 15, lineHeight: 1.4, color: "#4A4A50" }}>
              {t("edit.reviewNote")}
            </span>
          </div>
        ) : null}

        <Field label={t("edit.name")} value={name} onChange={setName} />
        <Field label={t("edit.ingredient")} value={ingredient} onChange={setIngredient} />
        <Field label={t("edit.dose")} value={dose} onChange={setDose} emphasized={needsReview} />

        <div className="grid grid-cols-2 gap-2.5">
          <Stepper
            label={t("edit.times")}
            value={times === null ? "—" : String(times)}
            onLess={() => setTimes((value) => (value === null ? null : Math.max(1, value - 1)))}
            onMore={() => setTimes((value) => (value === null ? 1 : Math.min(8, value + 1)))}
          />
          <Stepper
            label={t("edit.days")}
            value={days === null ? formatDays(null, lang) : String(days)}
            onLess={() => setDays((value) => (value === null ? null : Math.max(1, value - 1)))}
            onMore={() => setDays((value) => (value === null ? 1 : value + 1))}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 500, fontSize: 15, color: "#4A4A50" }}>{t("edit.when")}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {slotOrder.map((slot) => {
              const on = slots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() =>
                    setSlots((current) =>
                      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot],
                    )
                  }
                  style={{
                    height: 44,
                    padding: "0 16px",
                    border: on ? 0 : "1px solid #E3E3E7",
                    borderRadius: 9999,
                    background: on ? "#D4FF4F" : "#fff",
                    color: on ? "#111" : "#4A4A50",
                    fontWeight: on ? 600 : 500,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {on ? <CheckIcon size={16} /> : null}
                  {t(`slot.${slot}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
          <button
            type="button"
            onClick={save}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 9999,
              background: "#111",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            {t("edit.save")}
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(medicine.id);
              onClose();
            }}
            style={{
              height: 52,
              background: "transparent",
              fontWeight: 500,
              fontSize: 17,
              color: "#4A4A50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <TrashIcon />
            {t("edit.delete")}
          </button>
        </div>
        <Disclaimer className="mt-1 lg:hidden" />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  emphasized = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  emphasized?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontWeight: 500, fontSize: 15, color: "#4A4A50" }}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          height: 52,
          padding: "0 16px",
          border: emphasized ? "1.5px solid #111" : "1px solid #E3E3E7",
          borderRadius: 14,
          background: "#fff",
          fontWeight: 400,
          fontSize: 17,
          color: "#111",
          outline: "none",
          width: "100%",
        }}
      />
    </label>
  );
}

function Stepper({
  label,
  value,
  onLess,
  onMore,
}: {
  label: string;
  value: string;
  onLess: () => void;
  onMore: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontWeight: 500, fontSize: 15, color: "#4A4A50" }}>{label}</span>
      <div
        style={{
          height: 52,
          border: "1px solid #E3E3E7",
          borderRadius: 14,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4px",
        }}
      >
        <button type="button" aria-label={t("less")} onClick={onLess} style={stepButton}>
          <MinusIcon />
        </button>
        <span style={{ fontWeight: 600, fontSize: 18 }}>{value}</span>
        <button type="button" aria-label={t("more")} onClick={onMore} style={stepButton}>
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}

const stepButton = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: "#F2F2F4",
  color: "#111",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

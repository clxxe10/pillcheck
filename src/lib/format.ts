import type { Lang } from "@/lib/i18n";
import { ingredientLabel } from "@/lib/safety";
import type { DoseSlot, Medicine, SafetyAlert, SourceType } from "@/types";

export const slotOrder: DoseSlot[] = ["morning", "lunch", "evening", "bedtime"];

export const slotTimes: Record<DoseSlot, string> = {
  morning: "08:00",
  lunch: "12:30",
  evening: "18:30",
  bedtime: "22:00",
};

export function formatClock(time: string, lang: Lang) {
  const [hourPart, minutePart] = time.split(":");
  const hour = Number(hourPart);
  const minute = minutePart ?? "00";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  if (lang === "ko") {
    const period = hour < 12 ? "오전" : "오후";
    return `${period} ${hour12}:${minute}`;
  }
  const period = hour < 12 ? "AM" : "PM";
  return `${hour12}:${minute} ${period}`;
}

/** EN shows the English name, KO shows the name printed on the label. */
export function displayName(medicine: Pick<Medicine, "name" | "nameEn">, lang: Lang) {
  return (lang === "ko" ? medicine.name : medicine.nameEn) || medicine.name || medicine.nameEn;
}

/** "Tylenol 500 mg" → "Tylenol", "이부프로펜정 400mg" → "이부프로펜정". */
export function shortName(medicine: Pick<Medicine, "name" | "nameEn">, lang: Lang) {
  const full = displayName(medicine, lang);
  const short = full.replace(/\s*\(?\d[\d.,/]*\s*(mg|g|mcg|µg|ml|mL|㎎|㎖|%|iu|IU)\b.*$/i, "").trim();
  return short || full;
}

type DoseUnit = { en: [string, string]; short: [string, string]; ko: string };

const DOSE_UNITS: { pattern: RegExp; unit: DoseUnit }[] = [
  { pattern: /^(정|t|tabs?|tablets?)$/i, unit: { en: ["tablet", "tablets"], short: ["tab", "tabs"], ko: "정" } },
  { pattern: /^(캡슐|c|caps?|capsules?)$/i, unit: { en: ["capsule", "capsules"], short: ["cap", "caps"], ko: "캡슐" } },
  { pattern: /^(포|packets?|sachets?)$/i, unit: { en: ["packet", "packets"], short: ["packet", "packets"], ko: "포" } },
  { pattern: /^(ml|㎖|cc)$/i, unit: { en: ["mL", "mL"], short: ["mL", "mL"], ko: "mL" } },
];

function parseDose(dose: string) {
  const match = dose.trim().match(/^(\d+\/\d+|\d+(?:\.\d+)?)\s*([^\d\s].*)?$/);
  if (!match) return null;
  const amount = match[1];
  const unitText = (match[2] ?? "정").trim();
  const unit = DOSE_UNITS.find((item) => item.pattern.test(unitText))?.unit;
  if (!unit) return null;
  const one = amount.includes("/") || Number(amount) <= 1;
  return { amount, unit, one };
}

/** Printed dose such as "1정" or "2 tablets", shown in the current language. */
export function formatDose(dose: string, lang: Lang) {
  const parsed = parseDose(dose);
  if (!parsed) return dose.trim();
  const { amount, unit, one } = parsed;
  if (lang === "ko") return `${amount}${unit.ko}`;
  return `${amount} ${unit.en[one ? 0 : 1]}`;
}

/** Compact form for the schedule ("1 tab"). */
export function doseAmount(dose: string, lang: Lang) {
  const parsed = parseDose(dose);
  if (!parsed) return dose.trim();
  const { amount, unit, one } = parsed;
  if (lang === "ko") return `${amount}${unit.ko}`;
  return `${amount} ${unit.short[one ? 0 : 1]}`;
}

export function medicineSlots(medicine: Pick<Medicine, "timeSlots">): DoseSlot[] {
  return medicine.timeSlots ?? [];
}

/** Prescription bags and sheets, or a retail box, bottle, or blister. */
export function sourceKindLabel(sourceType: SourceType, lang: Lang) {
  if (sourceType === "prescription_bag" || sourceType === "prescription") {
    return lang === "ko" ? "처방약" : "Prescription";
  }
  if (sourceType === "otc_box" || sourceType === "bottle" || sourceType === "blister") {
    return lang === "ko" ? "일반의약품" : "Over-the-counter";
  }
  return null;
}

export function formatTimes(count: number, lang: Lang) {
  if (lang === "ko") return `하루 ${count}회`;
  return `${count}× a day`;
}

export function formatDays(days: number | null, lang: Lang) {
  if (days === null) return lang === "ko" ? "계속" : "Ongoing";
  if (lang === "ko") return `${days}일`;
  return days === 1 ? "1 day" : `${days} days`;
}

export function doseLine(medicine: Medicine, lang: Lang) {
  const dose = formatDose(medicine.dose, lang);
  if (medicine.timesPerDay === null) {
    if (dose) return dose;
    return lang === "ko" ? "복용 방법을 입력해 주세요" : "Add how you take it";
  }
  return `${dose ? `${dose} · ` : ""}${formatTimes(medicine.timesPerDay, lang)} · ${formatDays(medicine.days, lang)}`;
}

export function medicineCount(count: number, lang: Lang) {
  if (lang === "ko") return `약 ${count}개`;
  return count === 1 ? "1 medicine" : `${count} medicines`;
}

export function photoCountLabel(count: number, lang: Lang) {
  if (lang === "ko") return `사진 ${count}장`;
  return count === 1 ? "1 photo" : `${count} photos`;
}

export function analyzeLabel(count: number, lang: Lang) {
  if (lang === "ko") return `사진 ${count}장 분석`;
  return count === 1 ? "Analyze 1 photo" : `Analyze ${count} photos`;
}

export function clinicCountLabel(count: number, lang: Lang) {
  if (lang === "ko") return `병원 ${count}곳`;
  return count === 1 ? "From 1 clinic" : `From ${count} clinics`;
}

/** Dated MFDS rows use a Korean agency name. Other sources keep the stored label. */
export function sourceLine(sourceName: string, t: (key: string) => string) {
  const dated = sourceName.match(/^MFDS DUR \(data as of (\d{4}-\d{2}-\d{2})\)$/);
  if (dated) return t("alerts.sourceDur").replace("{date}", dated[1]);
  return t("alerts.source").replace("{name}", sourceName);
}

export function issueCountLabel(count: number, lang: Lang) {
  if (lang === "ko") return `문제 ${count}건`;
  return count === 1 ? "1 issue found" : `${count} issues found`;
}

export function summaryLabel(meds: number, clinics: number, lang: Lang) {
  if (lang === "ko") return `약 ${meds}개 · 병원 ${clinics}곳`;
  const medLabel = meds === 1 ? "1 medicine" : `${meds} medicines`;
  const clinicLabel = clinics === 1 ? "1 clinic" : `${clinics} clinics`;
  return `${medLabel} · ${clinicLabel}`;
}

export function reviewCountLabel(count: number, lang: Lang) {
  if (lang === "ko") return `${count}개 확인 필요`;
  return count === 1 ? "1 needs review" : `${count} need review`;
}

export function readProgressLabel(done: number, total: number, lang: Lang) {
  if (lang === "ko") return `사진 ${total}장 중 ${done}장을 읽었어요`;
  const noun = total === 1 ? "photo" : "photos";
  return `${done} of ${total} ${noun} read`;
}

export function foundLabel(count: number, lang: Lang) {
  if (lang === "ko") return `지금까지 약 ${count}개를 찾았어요`;
  const noun = count === 1 ? "medicine" : "medicines";
  return `${count} ${noun} found so far`;
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** Home kicker and the shorter results line. Computed from the viewer's local date. */
export function formatToday(lang: Lang, variant: "home" | "short", now = new Date()) {
  if (lang === "ko") {
    return `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS_KO[now.getDay()]}요일`;
  }
  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const month = now.toLocaleDateString("en-GB", { month: variant === "home" ? "long" : "short" });
  return `${weekday}, ${now.getDate()} ${month}`;
}

/** Next scheduled slot at the default clock times, or the first one tomorrow. */
export function nextDose(medicines: Medicine[], now = new Date()) {
  const slots = slotOrder.filter((slot) => medicines.some((item) => medicineSlots(item).includes(slot)));
  if (slots.length === 0) return null;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const at = (slot: DoseSlot) => {
    const [hour, minute] = slotTimes[slot].split(":").map(Number);
    return hour * 60 + minute;
  };
  const later = slots.find((slot) => at(slot) > minutesNow);
  const slot = later ?? slots[0];
  const delta = later ? at(slot) - minutesNow : 24 * 60 - minutesNow + at(slot);
  return { slot, hours: Math.floor(delta / 60), minutes: delta % 60 };
}

export function nextDoseBadge(hours: number, minutes: number, lang: Lang) {
  if (hours <= 0) {
    const mins = Math.max(minutes, 1);
    return lang === "ko" ? `${mins}분 후` : `In ${mins} min`;
  }
  const rounded = minutes >= 30 ? hours + 1 : hours;
  return lang === "ko" ? `${rounded}시간 후` : `In ${rounded} hr`;
}

const PHOTO_PLACEHOLDER = /^(?:사진|photo)\s+(\d+)$/i;

/** A missing clinic, or a saved "사진 1" / "Photo 1", follows the current language. A typed clinic name stays as entered. */
export function placeLabel(clinic: string, photoIndex: number, lang: Lang) {
  const trimmed = clinic.trim();
  const match = trimmed.match(PHOTO_PLACEHOLDER);
  if (!trimmed || match) {
    const number = match ? Number(match[1]) : photoIndex;
    return lang === "ko" ? `사진 ${number}` : `Photo ${number}`;
  }
  return trimmed;
}

export function photoPlaceLabel(index: number, clinic: string, lang: Lang) {
  if (lang === "ko") return `사진 ${index} · ${clinic}`;
  return `Photo ${index} · ${clinic}`;
}

export function sourcePlaceLabel(clinic: string, index: number, lang: Lang) {
  const place = placeLabel(clinic, index, lang);
  const photo = lang === "ko" ? `사진 ${index}` : `Photo ${index}`;
  if (place === photo) return photo;
  return `${place} · ${photo}`;
}

export function resultsMeta(photoCount: number, date: string, lang: Lang) {
  return `${date} · ${photoCountLabel(photoCount, lang)}`;
}

function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

/** Turns a rule warning into the sentence shown on the card. */
export function warningCopy(alert: SafetyAlert, medicines: Medicine[], lang: Lang, t: (key: string) => string) {
  const names = alert.medicineIds
    .map((id) => medicines.find((item) => item.id === id))
    .filter((item): item is Medicine => Boolean(item))
    .map((item) => shortName(item, lang));
  const ingredient = ingredientLabel(alert.ingredient, lang);
  const a = names[0] ?? ingredient;
  const b = names[1] ?? "";
  const total = (alert.totalMg ?? 0).toLocaleString("en-US");
  const limit = (alert.limitMg ?? 0).toLocaleString("en-US");
  const pct = alert.limitMg ? Math.round(((alert.totalMg ?? 0) / alert.limitMg) * 100) : 0;
  const reason = (lang === "ko" ? alert.reasonKo : alert.reasonEn).trim();
  const pair = a && b ? `${a} + ${b}` : a;

  if (alert.kind === "duplicate") {
    const homeKey = names.length > 2 ? "alerts.duplicate.homeTitleMore" : "alerts.duplicate.homeTitle";
    return {
      label: t("alerts.duplicate.label"),
      homeTitle: fill(t(homeKey), { a, b, n: Math.max(names.length - 1, 0), ingredient }),
      title: fill(t("alerts.duplicate.title"), { ingredient }),
      body: fill(t("alerts.duplicate.body"), { ingredient }),
    };
  }
  if (alert.kind === "daily") {
    const over = alert.severity === "danger";
    return {
      label: t("alerts.daily.label"),
      homeTitle: fill(t("alerts.daily.homeTitle"), { ingredient, total }),
      title: fill(t(over ? "alerts.daily.titleDanger" : "alerts.daily.titleCaution"), { ingredient }),
      body: fill(t(over ? "alerts.daily.bodyDanger" : "alerts.daily.bodyCaution"), { total, limit, pct }),
    };
  }
  const kind = alert.kind === "contraindicated" || alert.kind === "class" ? alert.kind : "caution";
  if (alert.reasons && alert.reasons.length > 1) {
    const lines = alert.reasons.map((item) => {
      const itemKind = item.kind === "contraindicated" || item.kind === "class" ? item.kind : "caution";
      const detail = (lang === "ko" ? item.reasonKo : item.reasonEn).trim();
      const source = item.sourceName.replace(/ \(data as of [^)]+\)$/, "");
      return {
        label: `${t(`alerts.${itemKind}.label`)} (${source})`,
        detail: detail || t(`alerts.${itemKind}.body`),
      };
    });
    return {
      label: t(`alerts.${kind}.label`),
      homeTitle: pair,
      title: pair,
      body: lines.map((line) => `${line.label}\n${line.detail}`).join("\n"),
      lines,
    };
  }
  return {
    label: t(`alerts.${kind}.label`),
    homeTitle: pair,
    title: pair,
    body: reason || t(`alerts.${kind}.body`),
  };
}

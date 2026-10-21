import type { Lang } from "@/lib/i18n";
import type { DoseSlot, Medicine } from "@/types";

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

export function inHoursLabel(hours: number, lang: Lang) {
  if (lang === "ko") return `${hours}시간 후`;
  return `In ${hours} hr`;
}

export function photoPlaceLabel(index: number, clinic: string, lang: Lang) {
  if (lang === "ko") return `사진 ${index} · ${clinic}`;
  return `Photo ${index} · ${clinic}`;
}

export function sourcePlaceLabel(clinic: string, index: number, lang: Lang) {
  if (lang === "ko") return `${clinic} · 사진 ${index}`;
  return `${clinic} · Photo ${index}`;
}

export function resultsMeta(photoCount: number, date: string, lang: Lang) {
  return `${date} · ${photoCountLabel(photoCount, lang)}`;
}

export function alertCopy<T extends { id: string; label: string; homeTitle: string; title: string; body: string }>(
  alert: T,
  lang: Lang,
  translated: { label: string; homeTitle: string; title: string; body: string },
) {
  if (lang === "en") {
    return {
      label: alert.label,
      homeTitle: alert.homeTitle,
      title: alert.title,
      body: alert.body,
    };
  }
  return translated;
}

import { AiError } from "@/lib/ai/errors";
import { unifyIngredient } from "@/lib/safety";
import type {
  Confidence,
  DoseSlot,
  ExtractResponse,
  Medicine,
  SourceType,
  UnreadableImage,
  UnreadableReason,
} from "@/types";

const SLOT_ORDER: DoseSlot[] = ["morning", "lunch", "evening", "bedtime"];
const CONFIDENCE: Confidence[] = ["high", "medium", "low"];
const SOURCE_TYPES: SourceType[] = ["prescription_bag", "prescription", "otc_box", "bottle", "blister", "unknown"];
const REASONS: UnreadableReason[] = ["blurry", "glare", "cropped", "not_medicine", "no_package", "other"];

const PRINTED_STRENGTH = /\d+(?:[.,]\d+)?\s*(?:mcg|μg|µg|㎍|mg|㎎|밀리그램|그램|g)\b/i;

function hasPrintedStrength(...values: string[]) {
  return values.some((value) => PRINTED_STRENGTH.test(value));
}

const DEFAULT_SLOTS: Record<number, DoseSlot[]> = {
  1: ["morning"],
  2: ["morning", "evening"],
  3: ["morning", "lunch", "evening"],
  4: ["morning", "lunch", "evening", "bedtime"],
};

/** Models sometimes wrap JSON in fences or add a sentence; keep only the outer object. */
export function parseModelJson(text: string | undefined | null): unknown {
  if (!text) throw new AiError("invalid_response", "The model returned an empty response.");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new AiError("invalid_response", "The model response did not contain JSON.");
  }
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AiError("invalid_response", "The model response was not valid JSON.");
  }
}

function text(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function int(value: unknown) {
  const number = typeof value === "string" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? Math.round(number) : null;
}

function slots(value: unknown): DoseSlot[] {
  if (!Array.isArray(value)) return [];
  return SLOT_ORDER.filter((slot) => value.includes(slot));
}

export function normalizeExtraction(raw: unknown, clinics: string[]): ExtractResponse {
  if (!raw || typeof raw !== "object") {
    throw new AiError("invalid_response", "The model response had the wrong shape.");
  }
  const { medicines: rawMedicines, unreadable: rawUnreadable } = raw as Record<string, unknown>;
  if (!Array.isArray(rawMedicines)) {
    throw new AiError("invalid_response", "The model response had no medicines list.");
  }
  const imageCount = clinics.length;
  const inRange = (index: number | null): index is number =>
    index !== null && index >= 0 && index < imageCount;

  const medicines: Medicine[] = [];
  const unpackaged = new Set<number>();
  for (const entry of rawMedicines) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const name = text(item.name) || text(item.nameEn);
    const nameEn = text(item.nameEn) || name;
    if (!name) continue;

    const source = int(item.sourceImageIndex);
    const sourceImageIndex = inRange(source) ? source : 0;
    const sourceType = SOURCE_TYPES.includes(item.sourceType as SourceType)
      ? (item.sourceType as SourceType)
      : "prescription_bag";
    if (sourceType === "unknown") {
      unpackaged.add(sourceImageIndex);
      continue;
    }

    const printedSlots = slots(item.timeSlots);
    const times = int(item.timesPerDay);
    const timesGiven = times !== null && times > 0 && times <= 12;
    let timesPerDay: number | null;
    let timeSlots: DoseSlot[] | null;
    let timeSlotsEstimated = item.timeSlotsEstimated === true;
    let scheduleMissing = false;
    if (!timesGiven && printedSlots.length === 0) {
      timesPerDay = null;
      timeSlots = null;
      scheduleMissing = true;
    } else if (timesGiven && printedSlots.length === 0) {
      timesPerDay = times;
      timeSlots = DEFAULT_SLOTS[Math.min(times, 4)] ?? ["morning"];
      timeSlotsEstimated = true;
    } else if (!timesGiven) {
      timeSlots = printedSlots;
      timesPerDay = printedSlots.length;
    } else {
      timesPerDay = times;
      timeSlots = printedSlots;
    }

    const days = int(item.days);
    const ingredient = unifyIngredient(text(item.ingredient, 240));
    const note = text(item.note, 180);
    let confidence = CONFIDENCE.includes(item.confidence as Confidence)
      ? (item.confidence as Confidence)
      : "low";
    if (scheduleMissing || timeSlotsEstimated || !hasPrintedStrength(name, nameEn, ingredient)) confidence = "low";

    medicines.push({
      id: `med-${medicines.length + 1}`,
      name,
      nameEn,
      ingredient,
      dose: text(item.dose, 40),
      ...(note ? { note } : {}),
      timesPerDay,
      days: days && days > 0 ? Math.min(days, 365) : null,
      timeSlots,
      timeSlotsEstimated,
      sourceImageIndex,
      sourceType,
      confidence,
      clinic: clinics[sourceImageIndex]?.trim() ?? "",
    });
  }

  const readImages = new Set(medicines.map((item) => item.sourceImageIndex));
  const unreadable: UnreadableImage[] = [];
  if (Array.isArray(rawUnreadable)) {
    for (const entry of rawUnreadable) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Record<string, unknown>;
      const index = int(item.index);
      if (!inRange(index) || readImages.has(index) || unreadable.some((u) => u.index === index)) continue;
      const reason = REASONS.includes(item.reason as UnreadableReason)
        ? (item.reason as UnreadableReason)
        : "other";
      unreadable.push({ index, reason });
    }
  }
  for (const index of unpackaged) {
    if (readImages.has(index) || unreadable.some((item) => item.index === index)) continue;
    unreadable.push({ index, reason: "no_package" });
  }
  if (medicines.length === 0 && unreadable.length === 0) {
    for (let index = 0; index < imageCount; index += 1) unreadable.push({ index, reason: "other" });
  }

  return { medicines, unreadable };
}

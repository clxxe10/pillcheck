import { AiError } from "@/lib/ai/errors";
import { knownIngredient, unifyIngredient } from "@/lib/safety";
import type {
  Confidence,
  DoseSlot,
  ExtractResponse,
  IngredientStatus,
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

export function normalizeExtraction(raw: unknown, clinics: string[], groups: number[][] = []): ExtractResponse {
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
    const fallbackIndex = inRange(source) ? source : 0;
    const sourceImageIndexes = imageIndexes(item, fallbackIndex, inRange);
    const sourceImageIndex = sourceImageIndexes[0] ?? fallbackIndex;
    let sourceType = SOURCE_TYPES.includes(item.sourceType as SourceType)
      ? (item.sourceType as SourceType)
      : "prescription_bag";
    if (sourceType === "unknown") {
      for (const index of sourceImageIndexes) unpackaged.add(index);
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
    if (sourceType !== "prescription_bag" && sourceType !== "prescription" && markedPrescription(name, nameEn, ingredient, note)) {
      sourceType = "prescription";
    }
    let confidence = CONFIDENCE.includes(item.confidence as Confidence)
      ? (item.confidence as Confidence)
      : "low";
    if (scheduleMissing || timeSlotsEstimated || !hasPrintedStrength(name, nameEn, ingredient)) confidence = "low";

    medicines.push({
      id: `med-${medicines.length + 1}`,
      name,
      nameEn,
      ingredient,
      ingredientStatus: ingredientStatusOf(ingredient),
      nameUncertain: item.nameUncertain === true,
      dose: text(item.dose, 40),
      ...(note ? { note } : {}),
      timesPerDay,
      days: days && days > 0 ? Math.min(days, 365) : null,
      timeSlots,
      timeSlotsEstimated,
      sourceImageIndex,
      sourceImageIndexes,
      sourceType,
      confidence,
      clinic: clinics[sourceImageIndex]?.trim() ?? "",
    });
  }

  const merged = renumber(autoMerge(applyGroups(medicines, groups.filter((group) => group.length >= 2))));
  const readImages = new Set(merged.flatMap((item) => item.sourceImageIndexes ?? [item.sourceImageIndex]));
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
  if (merged.length === 0 && unreadable.length === 0) {
    for (let index = 0; index < imageCount; index += 1) unreadable.push({ index, reason: "other" });
  }

  return { medicines: merged, unreadable };
}

const PACK_TYPES = new Set<SourceType>(["bottle", "otc_box", "blister", "prescription"]);

export function ingredientStatusOf(ingredient: string): IngredientStatus {
  return knownIngredient(ingredient) ? "known" : "unknown";
}

function markedPrescription(...values: string[]) {
  return values.some((value) => /전문\s*의약품/.test(value));
}

function imageIndexes(
  item: Record<string, unknown>,
  fallback: number,
  inRange: (index: number | null) => index is number,
) {
  const raw = Array.isArray(item.sourceImageIndexes) ? item.sourceImageIndexes : [];
  const list = [...new Set(raw.map((value) => int(value)).filter(inRange))].sort((a, b) => a - b);
  return list.length > 0 ? list : [fallback];
}

function foldKey(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC").toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}

function strengthKey(medicine: Medicine) {
  return (
    `${medicine.name} ${medicine.nameEn} ${medicine.ingredient}`
      .match(/\d+(?:[.,]\d+)?\s*(?:mcg|μg|µg|㎍|mg|㎎|밀리그램|그램|g)\b/gi)
      ?.map((part) => part.replace(/\s+/g, "").toLowerCase())
      .sort()
      .join("+") ?? ""
  );
}

function productKey(medicine: Medicine) {
  const name = foldKey(medicine.name || medicine.nameEn);
  if (name.length < 2) return "";
  return `${name}|${foldKey(medicine.ingredient)}|${strengthKey(medicine)}`;
}

function realClinic(clinic: string) {
  const trimmed = clinic.trim();
  if (!trimmed || /^(?:사진|photo)\s+\d+$/i.test(trimmed)) return "";
  return trimmed;
}

function combine(members: Medicine[], extraIndexes: number[] = []): Medicine {
  const indexes = [
    ...new Set([...members.flatMap((item) => item.sourceImageIndexes ?? [item.sourceImageIndex]), ...extraIndexes]),
  ].sort((a, b) => a - b);
  const longest = (read: (item: Medicine) => string) =>
    members
      .map(read)
      .map((value) => value.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] ?? "";
  const scheduled =
    members.find((item) => item.timeSlots && item.timeSlots.length > 0 && !item.timeSlotsEstimated) ??
    members.find((item) => item.timeSlots && item.timeSlots.length > 0);
  const notes = [...new Set(members.map((item) => item.note?.trim()).filter((note): note is string => Boolean(note)))];
  const name = longest((item) => item.name);
  const nameEn = longest((item) => item.nameEn);
  const ingredient = longest((item) => item.ingredient);
  const sourceType = members.some((item) => item.sourceType === "prescription_bag")
    ? "prescription_bag"
    : members.some((item) => item.sourceType === "prescription")
      ? "prescription"
      : members[0].sourceType;
  const next: Medicine = {
    ...members[0],
    name: name || members[0].name,
    nameEn: nameEn || members[0].nameEn,
    ingredient,
    ingredientStatus: ingredientStatusOf(ingredient),
    nameUncertain: members.some((item) => item.nameUncertain),
    dose: members.map((item) => item.dose.trim()).find(Boolean) ?? "",
    timesPerDay: scheduled?.timesPerDay ?? members.find((item) => item.timesPerDay !== null)?.timesPerDay ?? null,
    days: members.find((item) => item.days !== null)?.days ?? null,
    timeSlots: scheduled?.timeSlots ?? null,
    timeSlotsEstimated: Boolean(scheduled?.timeSlotsEstimated),
    sourceImageIndex: indexes[0] ?? members[0].sourceImageIndex,
    sourceImageIndexes: indexes,
    sourceType,
    confidence: members.some((item) => item.confidence === "low")
      ? "low"
      : members.some((item) => item.confidence === "medium")
        ? "medium"
        : "high",
    clinic: members.map((item) => item.clinic).find((clinic) => realClinic(clinic)) ?? members[0].clinic,
  };
  if (notes.length > 0) next.note = notes.join(" ");
  else delete next.note;
  return next;
}

function applyGroups(list: Medicine[], groups: number[][]) {
  let current = list;
  for (const group of groups) {
    const set = new Set(group);
    const members: Medicine[] = [];
    const rest: Medicine[] = [];
    for (const medicine of current) {
      const indexes = medicine.sourceImageIndexes ?? [medicine.sourceImageIndex];
      if (indexes.some((index) => set.has(index))) members.push(medicine);
      else rest.push(medicine);
    }
    if (members.length === 0) continue;
    current = [...rest, combine(members, group)];
  }
  return current;
}

function samePackage(a: Medicine, b: Medicine) {
  if (a.sourceType === "prescription_bag" || b.sourceType === "prescription_bag") return false;
  if (!PACK_TYPES.has(a.sourceType) || !PACK_TYPES.has(b.sourceType)) return false;
  const key = productKey(a);
  if (!key || key !== productKey(b)) return false;
  const clinicA = realClinic(a.clinic);
  const clinicB = realClinic(b.clinic);
  if (clinicA && clinicB && clinicA !== clinicB) return false;
  return true;
}

function autoMerge(list: Medicine[]) {
  const used = new Set<number>();
  const result: Medicine[] = [];
  for (let index = 0; index < list.length; index += 1) {
    if (used.has(index)) continue;
    const members = [list[index]];
    used.add(index);
    for (let other = index + 1; other < list.length; other += 1) {
      if (used.has(other) || !samePackage(members[0], list[other])) continue;
      members.push(list[other]);
      used.add(other);
    }
    result.push(members.length === 1 ? members[0] : combine(members));
  }
  return result;
}

function renumber(list: Medicine[]) {
  return list.map((medicine, index) => ({ ...medicine, id: `med-${index + 1}` }));
}

/** Fills an existing medicine from a follow-up photo of its ingredient panel. */
export function mergeIngredientPhoto(current: Medicine, extra: Medicine | undefined): Medicine {
  if (!extra) return { ...current, ingredientStatus: ingredientStatusOf(current.ingredient) };
  const ingredient = extra.ingredient.trim() || current.ingredient;
  const notes = [current.note, extra.note].map((note) => note?.trim()).filter((note): note is string => Boolean(note));
  const next: Medicine = {
    ...current,
    ingredient,
    dose: current.dose.trim() ? current.dose : extra.dose,
    timesPerDay: current.timesPerDay ?? extra.timesPerDay,
    days: current.days ?? extra.days,
    timeSlots: current.timeSlots && current.timeSlots.length > 0 ? current.timeSlots : extra.timeSlots,
    timeSlotsEstimated: current.timeSlots && current.timeSlots.length > 0 ? current.timeSlotsEstimated : extra.timeSlotsEstimated,
    sourceType:
      current.sourceType === "prescription_bag"
        ? current.sourceType
        : extra.sourceType === "prescription" || current.sourceType === "prescription"
          ? "prescription"
          : current.sourceType,
    ingredientStatus: ingredientStatusOf(ingredient),
    nameUncertain: Boolean(current.nameUncertain) && !current.name.trim() && !current.nameEn.trim(),
  };
  const note = [...new Set(notes)].join(" ");
  if (note) next.note = note;
  return next;
}

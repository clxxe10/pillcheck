/**
 * Prompt and output schema shared by every provider, so Gemini and Claude
 * are asked the same thing and must answer in the same shape.
 */

const SLOTS = ["morning", "lunch", "evening", "bedtime"] as const;
const CONFIDENCE = ["high", "medium", "low"] as const;
const SOURCE_TYPES = ["prescription_bag", "prescription", "otc_box", "bottle", "blister", "unknown"] as const;
const REASONS = ["blurry", "glare", "cropped", "not_medicine", "no_package", "other"] as const;

/** Plain JSON Schema, accepted by Gemini `responseJsonSchema` and Claude `output_config.format`. */
export const extractSchema: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["medicines", "unreadable"],
  properties: {
    medicines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "nameEn",
          "ingredient",
          "dose",
          "timesPerDay",
          "days",
          "timeSlots",
          "timeSlotsEstimated",
          "sourceImageIndex",
          "sourceType",
          "confidence",
        ],
        properties: {
          name: { type: "string" },
          nameEn: { type: "string" },
          ingredient: { type: "string" },
          dose: { type: "string" },
          timesPerDay: { type: "integer" },
          days: { type: "integer" },
          timeSlots: { type: "array", items: { type: "string", enum: [...SLOTS] } },
          timeSlotsEstimated: { type: "boolean" },
          sourceImageIndex: { type: "integer" },
          sourceType: { type: "string", enum: [...SOURCE_TYPES] },
          confidence: { type: "string", enum: [...CONFIDENCE] },
        },
      },
    },
    unreadable: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "reason"],
        properties: {
          index: { type: "integer" },
          reason: { type: "string", enum: [...REASONS] },
        },
      },
    },
  },
};

export function buildExtractPrompt(clinics: string[]) {
  const photoList = clinics
    .map((clinic, index) => `- Image ${index}: ${clinic.trim() || "clinic not given"}`)
    .join("\n");

  return `You read photos of medicines and list every product whose package or label you can see.

The images are attached in this order (0-based index) with the clinic name the user typed for each:
${photoList}

First classify each image, then read it:
- prescription_bag: a Korean pharmacy bag (약 봉투).
- prescription: a prescription sheet (처방전) or medication guide (복약안내문).
- otc_box: a carton or box, usually marked 일반의약품.
- bottle: a bottle, pill container, or 약통.
- blister: a blister card or foil-backed strip.
- unknown: loose tablets or capsules with no package, or a photo where no label text is visible.

How Korean pharmacy labels are laid out:
- 약품명 / 처방 의약품의 명칭: the product name, often with strength (e.g. 타이레놀정500밀리그램).
- 성분 / 주성분: active ingredient and amount.
- 1회 투약량: amount per dose (e.g. 1정, 0.5정, 1캡슐, 1포, 5mL).
- 1일 투여횟수: times per day.
- 총 투약일수: total number of days.
- 용법 / 복용시간: when to take it — 아침, 점심, 저녁, 취침전 (자기 전). Often a grid with marks (●, ✓, 1) under 아침/점심/저녁/자기전, or text like "1일 3회 식후 30분".

Boxes, bottles, and blister packs:
- Read the product name, the active ingredient, and the strength from the package.
- If the package also prints how to take it (1회량, 1일 횟수, 용법·용량), read that too. Do not leave dose or timesPerDay empty when they are printed.
- If times per day, number of days, or time of day are not printed, do not invent them.

For each medicine return:
- name: the name exactly as printed, in the original language (usually Korean). Keep the strength if printed.
- nameEn: English name. Use the known English brand if there is one (타이레놀정500밀리그램 → "Tylenol 500 mg"), otherwise the English generic name plus strength. Write strength with a space before the unit ("500 mg"). Do not translate the dosage form (정, 캡슐, 장용정) into the name: 아스피린장용정 100mg → "Aspirin 100 mg", not "Aspirin enteric-coated 100 mg".
- ingredient: active ingredient(s) in English generic names with strength, comma separated (e.g. "Acetaminophen 325 mg, pseudoephedrine 30 mg"). If the label says 저용량, include it as "low dose": 아스피린 100mg (저용량) → "Aspirin, low dose 100 mg".
- dose: amount per dose exactly as printed, with its unit (e.g. "1정"). Use "" when the package does not say how much to take at one time.
- timesPerDay: times per day as an integer. Use 0 when it is not printed.
- days: number of days as an integer. Use 0 when it is not printed or the medicine is ongoing.
- timeSlots: from a 용법 grid or text, using "morning" (아침), "lunch" (점심), "evening" (저녁), "bedtime" (취침전/자기 전). If only a count is printed and no time of day: 1회 → ["morning"], 2회 → ["morning","evening"], 3회 → ["morning","lunch","evening"], 4회 → all four. If 취침전 is printed, include "bedtime". Use [] when no count and no time of day are printed.
- timeSlotsEstimated: true only when the label does not print a time of day and you filled timeSlots from the daily count. false when the times of day are printed, or when timeSlots is [].
- sourceImageIndex: index of the image the medicine was read from.
- sourceType: the class of that image.
- confidence: "high" if the name, ingredient, strength, and a printed schedule (including the time of day) are clearly legible; "medium" if you inferred something other than the time of day (for example the ingredient from a well-known product name); "low" when timeSlotsEstimated is true, when times per day and time of day are not printed, or any field is partly unreadable. Low confidence is shown as "Needs review". A prescription that is ongoing (days 0) but has a printed daily schedule, including the time of day, can still be "high" or "medium".

Rules:
- One entry per medicine per image. If the same medicine appears in two photos, list it twice with each sourceImageIndex — duplicates across clinics matter.
- Never invent a medicine, a strength, or a schedule. If you cannot read a name, leave it out.
- unknown photos (loose pills, no package or label): return no medicine for that image. Add { "index", "reason": "no_package" } to "unreadable".
- For every other image where you could not read any medicine, add { "index", "reason" } to "unreadable" with reason "blurry", "glare", "cropped", "not_medicine", or "other". If nothing at all is readable, return an empty "medicines" array.
- Ignore patient names, addresses, phone numbers, prices and barcodes. Do not output any personal information.
- Respond with JSON only, matching this shape: {"medicines":[...],"unreadable":[...]}. No markdown, no commentary.`;
}

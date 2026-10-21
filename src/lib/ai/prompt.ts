/**
 * Prompt and output schema shared by every provider, so Gemini and Claude
 * are asked the same thing and must answer in the same shape.
 */

const SLOTS = ["morning", "lunch", "evening", "bedtime"] as const;
const CONFIDENCE = ["high", "medium", "low"] as const;
const REASONS = ["blurry", "glare", "cropped", "not_medicine", "other"] as const;

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
          "sourceImageIndex",
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
          sourceImageIndex: { type: "integer" },
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

  return `You read photos of Korean pharmacy medicine bags (약 봉투), prescriptions (처방전) and medication guides (복약안내문) and list every medicine on them.

The images are attached in this order (0-based index) with the clinic name the user typed for each:
${photoList}

How Korean pharmacy labels are laid out:
- 약품명 / 처방 의약품의 명칭: the product name, often with strength (e.g. 타이레놀정500밀리그램).
- 성분 / 주성분: active ingredient and amount.
- 1회 투약량: amount per dose (e.g. 1정, 0.5정, 1캡슐, 1포, 5mL).
- 1일 투여횟수: times per day.
- 총 투약일수: total number of days.
- 용법 / 복용시간: when to take it — 아침, 점심, 저녁, 취침전 (자기 전). Often a grid with marks (●, ✓, 1) under 아침/점심/저녁/자기전, or text like "1일 3회 식후 30분".

For each medicine return:
- name: the name exactly as printed, in the original language (usually Korean). Keep the strength if printed.
- nameEn: English name. Use the known English brand if there is one (타이레놀정500밀리그램 → "Tylenol 500 mg"), otherwise the English generic name. Write strength with a space before the unit ("500 mg").
- ingredient: active ingredient(s) in English generic names with strength, comma separated (e.g. "Acetaminophen 325 mg, pseudoephedrine 30 mg").
- dose: 1회 투약량 exactly as printed, with its unit (e.g. "1정").
- timesPerDay: 1일 투여횟수 as an integer.
- days: 총 투약일수 as an integer. Use 0 if it is not printed or the medicine is ongoing.
- timeSlots: from the 용법 grid or text, using "morning" (아침), "lunch" (점심), "evening" (저녁), "bedtime" (취침전/자기 전). If only a count is printed: 1회 → ["morning"], 2회 → ["morning","evening"], 3회 → ["morning","lunch","evening"], 4회 → all four. If 취침전 is printed, include "bedtime".
- sourceImageIndex: index of the image the medicine was read from.
- confidence: "high" if every field is printed and clearly legible; "medium" if you inferred something (for example the ingredient from a well-known product name, or time slots from a count); "low" if any field is partly unreadable or guessed. Low confidence is shown to the user as "Needs review", so use it whenever a mistake is possible.

Rules:
- One entry per medicine per image. If the same medicine appears in two photos, list it twice with each sourceImageIndex — duplicates across clinics matter.
- Never invent a medicine. If you cannot read a name, leave it out.
- For every image where you could not read any medicine, add { "index", "reason" } to "unreadable" with reason "blurry", "glare", "cropped", "not_medicine" or "other". If nothing at all is readable, return an empty "medicines" array.
- Ignore patient names, addresses, phone numbers, prices and barcodes. Do not output any personal information.
- Respond with JSON only, matching this shape: {"medicines":[...],"unreadable":[...]}. No markdown, no commentary.`;
}

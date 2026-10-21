import { checkSafety, ingredientNames } from "@/lib/safety";
import { findDurPairs } from "@/lib/safety/dur";
import type { Medicine } from "@/types";

export const maxDuration = 30;

const noStore = { "Cache-Control": "no-store" };

function numberOr(value: unknown, fallback: number) {
  const number = typeof value === "string" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : fallback;
}

function readMedicines(body: unknown): Medicine[] | string {
  if (!body || typeof body !== "object" || !Array.isArray((body as { medicines?: unknown }).medicines)) {
    return "Expected { medicines: [...] }.";
  }
  const list = (body as { medicines: unknown[] }).medicines;
  if (list.length > 30) return "Send at most 30 medicines.";
  const medicines: Medicine[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id.trim().slice(0, 40) : "";
    if (!id) continue;
    const days = numberOr(item.days, 0);
    medicines.push({
      id,
      name: typeof item.name === "string" ? item.name.trim().slice(0, 160) : "",
      nameEn: typeof item.nameEn === "string" ? item.nameEn.trim().slice(0, 160) : "",
      ingredient: typeof item.ingredient === "string" ? item.ingredient.trim().slice(0, 240) : "",
      dose: typeof item.dose === "string" ? item.dose.trim().slice(0, 40) : "",
      timesPerDay: Math.min(Math.max(numberOr(item.timesPerDay, 0), 0), 24),
      days: days > 0 ? Math.min(days, 365) : null,
      timeSlots: [],
      sourceImageIndex: Math.max(0, numberOr(item.sourceImageIndex, 0)),
      confidence: item.confidence === "high" || item.confidence === "medium" ? item.confidence : "low",
      clinic: typeof item.clinic === "string" ? item.clinic.trim().slice(0, 80) : "",
    });
  }
  return medicines;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request", message: "The request body must be JSON." }, { status: 400, headers: noStore });
  }
  const medicines = readMedicines(body);
  if (typeof medicines === "string") {
    return Response.json({ error: "bad_request", message: medicines }, { status: 400, headers: noStore });
  }
  const dur = await findDurPairs(ingredientNames(medicines));
  return Response.json({ warnings: checkSafety(medicines, dur) }, { headers: noStore });
}

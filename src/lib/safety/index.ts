import interactionsJson from "@/lib/safety/interactions.json";
import limitsJson from "@/lib/safety/limits.json";
import type { Medicine, SafetyAlert, WarningKind } from "@/types";

/**
 * Rule-based safety check. Warnings come only from these tables and, when the
 * server has a data.go.kr key, from MFDS DUR combination rows. Nothing is generated.
 */

type LimitRow = {
  name: string;
  maxDailyMg: number;
  sourceName: string;
  sourceUrl: string;
};

type InteractionRow = {
  a: string;
  b: string;
  aspirinMaxMg?: number;
  sourceName: string;
  sourceUrl: string;
  reasonEn: string;
  reasonKo: string;
};

export type DurPair = {
  a: string;
  b: string;
  reasonEn: string;
  reasonKo: string;
};

export type DurClassPair = {
  a: string;
  b: string;
  reasonEn: string;
  reasonKo: string;
};

/** Live DUR rows for this bag. An empty list is a successful lookup with no matching pair. */
export type DurReport = {
  contraindicated: DurPair[];
  sameClass: DurClassPair[];
};

const SALTS = new Set([
  "hydrochloride",
  "hcl",
  "sodium",
  "potassium",
  "calcium",
  "magnesium",
  "sulfate",
  "sulphate",
  "maleate",
  "tartrate",
  "besylate",
  "besilate",
  "mesylate",
  "mesilate",
  "citrate",
  "acetate",
  "phosphate",
  "hyclate",
  "monohydrate",
  "dihydrate",
  "trihydrate",
  "succinate",
  "fumarate",
  "nitrate",
  "bromide",
  "chloride",
  "oxide",
  "valerate",
  "gluconate",
  "lactate",
  "bitartrate",
  "disoproxil",
  "tosylate",
  "camsylate",
  "orotate",
  "hemicalcium",
  "lysine",
  "arginine",
  "hydrate",
  "anhydrous",
  "micronized",
]);

type Component = {
  medicineId: string;
  name: string;
  mg: number | null;
  lowDose: boolean;
  count: number | null;
  timesPerDay: number;
};

const DISPLAY: Record<string, { en: string; ko: string }> = {
  acetaminophen: { en: "acetaminophen", ko: "아세트아미노펜" },
  ibuprofen: { en: "ibuprofen", ko: "이부프로펜" },
  aspirin: { en: "aspirin", ko: "아스피린" },
  pseudoephedrine: { en: "pseudoephedrine", ko: "슈도에페드린" },
  cetirizine: { en: "cetirizine", ko: "세티리진" },
  warfarin: { en: "warfarin", ko: "와파린" },
  simvastatin: { en: "simvastatin", ko: "심바스타틴" },
  itraconazole: { en: "itraconazole", ko: "이트라코나졸" },
};

const STOP = new Set(["dose", "doses", "low", "high", "oral", "tablet", "tablets", "capsule", "daily", "acid"]);

const ALIASES: Record<string, string[]> = {
  acetaminophen: ["acetaminophen", "paracetamol", "아세트아미노펜"],
  ibuprofen: ["ibuprofen", "이부프로펜"],
  aspirin: ["aspirin", "acetylsalicylic acid", "acetylsalicylic", "아스피린"],
  pseudoephedrine: ["pseudoephedrine", "슈도에페드린"],
  cetirizine: ["cetirizine", "세티리진"],
  warfarin: ["warfarin", "와파린"],
  simvastatin: ["simvastatin", "심바스타틴"],
  itraconazole: ["itraconazole", "이트라코나졸"],
};

const limits = limitsJson as { cautionRatio: number; ingredients: LimitRow[] };
const interactions = interactionsJson as { contraindicated: InteractionRow[]; caution: InteractionRow[] };
const limitByName = new Map(limits.ingredients.map((row) => [row.name, row]));

export function ingredientLabel(name: string, lang: "en" | "ko") {
  return DISPLAY[name]?.[lang] ?? name;
}

/** English lowercase ingredient name, or null when the text has no usable name. */
export function canonicalIngredient(raw: string): string | null {
  const text = raw
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]+/g, " ")
    .split(/\s+/)
    .filter((word) => word && !SALTS.has(word) && !STOP.has(word))
    .join(" ");
  if (!text) return null;
  for (const [name, aliases] of Object.entries(ALIASES)) {
    if (aliases.some((alias) => text.includes(alias))) return name;
  }
  const word = text.match(/[a-z]{4,}/)?.[0];
  if (!word || STOP.has(word)) return null;
  return word;
}

/** Korean ingredient names DUR accepts as a filter. English filters are ignored by the live API. */
export function ingredientKoreanNames(canonical: string): string[] {
  return (ALIASES[canonical] ?? []).filter((alias) => /[가-힣]/.test(alias));
}

/** Spellings to try against DUR, most specific official name last. */
export function ingredientSearchNames(canonical: string): string[] {
  const primary = DISPLAY[canonical]?.en ?? canonical;
  const aliases = ALIASES[canonical] ?? [];
  const titled = [primary, ...aliases]
    .filter((alias) => /[a-z]/i.test(alias) && !/[가-힣]/.test(alias))
    .map((alias) =>
      alias
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    );
  return [...new Set(titled)];
}

export function ingredientNames(medicines: Medicine[]): string[] {
  const names = new Set<string>();
  for (const component of componentsOf(medicines)) names.add(component.name);
  return [...names];
}

function doseCount(dose: string): number | null {
  const match = dose.trim().match(/^(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)/);
  if (!match) return null;
  const raw = match[1].replace(/\s/g, "");
  if (raw.includes("/")) {
    const [numerator, denominator] = raw.split("/").map(Number);
    if (!denominator) return null;
    return numerator / denominator;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function strengthMg(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(mcg|μg|µg|㎍|mg|㎎|g)\b/i);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "g") return value * 1000;
  if (unit === "mcg" || unit === "μg" || unit === "µg" || unit === "㎍") return value / 1000;
  return value;
}

function componentsOf(medicines: Medicine[]): Component[] {
  const components: Component[] = [];
  for (const medicine of medicines) {
    const count = doseCount(medicine.dose);
    const timesPerDay = medicine.timesPerDay !== null && medicine.timesPerDay > 0 ? medicine.timesPerDay : 0;
    for (const part of medicine.ingredient.split(",")) {
      const name = canonicalIngredient(part);
      const mg = strengthMg(part);
      const lowDose = /low[\s-]*dose|저용량/i.test(part);
      if (!name) {
        const previous = components.at(-1);
        if (previous?.medicineId === medicine.id) {
          if (previous.mg === null && mg !== null) previous.mg = mg;
          if (lowDose) previous.lowDose = true;
        }
        continue;
      }
      components.push({
        medicineId: medicine.id,
        name,
        mg,
        lowDose,
        count,
        timesPerDay,
      });
    }
  }
  return components;
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join("+");
}

function isLowDoseAspirin(component: Component, maxMg: number | undefined) {
  if (component.name !== "aspirin" || maxMg === undefined) return true;
  if (component.lowDose) return true;
  return component.mg !== null && component.mg <= maxMg;
}

function pushPair(
  alerts: SafetyAlert[],
  kind: Extract<WarningKind, "contraindicated" | "caution" | "class">,
  row: { a: string; b: string; sourceName: string; sourceUrl: string; reasonEn: string; reasonKo: string },
  components: Component[],
  aspirinMaxMg?: number,
) {
  const left = components.filter((item) => item.name === row.a);
  const right = components.filter((item) => item.name === row.b);
  if (left.length === 0 || right.length === 0) return;
  if (kind === "caution" && row.a === "aspirin" && !left.some((item) => isLowDoseAspirin(item, aspirinMaxMg))) return;
  if (kind === "caution" && row.b === "aspirin" && !right.some((item) => isLowDoseAspirin(item, aspirinMaxMg))) return;
  const medicineIds = [...new Set([...left, ...right].map((item) => item.medicineId))];
  alerts.push({
    id: `${kind}:${pairKey(row.a, row.b)}`,
    kind,
    severity: kind === "contraindicated" ? "danger" : "warning",
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    medicineIds,
    ingredient: pairKey(row.a, row.b),
    totalMg: null,
    limitMg: null,
    reasonEn: row.reasonEn,
    reasonKo: row.reasonKo,
  });
}

const DUR_SOURCE = "https://www.data.go.kr/data/15056780/openapi.do";

function asReport(dur: DurReport | DurPair[] | null): DurReport | null {
  if (!dur) return null;
  if (Array.isArray(dur)) return { contraindicated: dur, sameClass: [] };
  return dur;
}

/**
 * `dur` null means the live lookup did not run, so only the local table is used.
 * A report uses DUR pairs first and keeps a local contraindication when DUR has no row for it.
 */
export function checkSafety(medicines: Medicine[], dur: DurReport | DurPair[] | null = null): SafetyAlert[] {
  const components = componentsOf(medicines);
  const alerts: SafetyAlert[] = [];
  const byName = new Map<string, Component[]>();
  for (const component of components) {
    const list = byName.get(component.name) ?? [];
    list.push(component);
    byName.set(component.name, list);
  }

  for (const [name, list] of byName) {
    const medicineIds = [...new Set(list.map((item) => item.medicineId))];
    if (medicineIds.length < 2) continue;
    alerts.push({
      id: `duplicate:${name}`,
      kind: "duplicate",
      severity: "warning",
      sourceName: "Labeled ingredients",
      sourceUrl: "",
      medicineIds,
      ingredient: name,
      totalMg: null,
      limitMg: null,
      reasonEn: "",
      reasonKo: "",
    });
  }

  for (const [name, list] of byName) {
    const limit = limitByName.get(name);
    if (!limit) continue;
    let sum = 0;
    const countedIds: string[] = [];
    for (const component of list) {
      if (component.mg === null || component.count === null || component.timesPerDay <= 0) continue;
      sum += component.count * component.timesPerDay * component.mg;
      countedIds.push(component.medicineId);
    }
    if (countedIds.length === 0) continue;
    const total = Math.round(sum * 100) / 100;
    const ratio = total / limit.maxDailyMg;
    if (ratio < limits.cautionRatio) continue;
    alerts.push({
      id: `daily:${name}`,
      kind: "daily",
      severity: total > limit.maxDailyMg ? "danger" : "warning",
      sourceName: limit.sourceName,
      sourceUrl: limit.sourceUrl,
      medicineIds: [...new Set(countedIds)],
      ingredient: name,
      totalMg: total,
      limitMg: limit.maxDailyMg,
      reasonEn: "",
      reasonKo: "",
    });
  }

  const report = asReport(dur);
  const merged = new Map<string, DurPair & { fromDur: boolean }>();
  const seed = report
    ? report.contraindicated.map((pair) => ({ ...pair, fromDur: true }))
    : interactions.contraindicated.map((row) => ({
        a: row.a,
        b: row.b,
        reasonEn: row.reasonEn,
        reasonKo: row.reasonKo,
        fromDur: false,
      }));
  for (const pair of seed) merged.set(pairKey(pair.a, pair.b), pair);
  if (report) {
    for (const row of interactions.contraindicated) {
      const key = pairKey(row.a, row.b);
      if (merged.has(key)) continue;
      merged.set(key, {
        a: row.a,
        b: row.b,
        reasonEn: row.reasonEn,
        reasonKo: row.reasonKo,
        fromDur: false,
      });
    }
  }
  for (const pair of merged.values()) {
    const local = interactions.contraindicated.find((row) => pairKey(row.a, row.b) === pairKey(pair.a, pair.b));
    pushPair(
      alerts,
      "contraindicated",
      {
        a: pair.a,
        b: pair.b,
        sourceName: "MFDS DUR",
        sourceUrl: local?.sourceUrl || DUR_SOURCE,
        reasonEn: pair.fromDur ? pair.reasonEn : (local?.reasonEn ?? pair.reasonEn),
        reasonKo: pair.fromDur ? pair.reasonKo : (local?.reasonKo ?? pair.reasonKo),
      },
      components,
    );
  }

  const blocked = new Set(
    alerts.filter((alert) => alert.kind === "contraindicated").map((alert) => alert.ingredient),
  );
  if (report) {
    for (const pair of report.sameClass) {
      if (blocked.has(pairKey(pair.a, pair.b))) continue;
      pushPair(
        alerts,
        "class",
        {
          a: pair.a,
          b: pair.b,
          sourceName: "MFDS DUR",
          sourceUrl: DUR_SOURCE,
          reasonEn: pair.reasonEn,
          reasonKo: pair.reasonKo,
        },
        components,
      );
    }
  }
  for (const row of interactions.caution) {
    if (blocked.has(pairKey(row.a, row.b))) continue;
    pushPair(alerts, "caution", row, components, row.aspirinMaxMg);
  }

  const rank: Record<WarningKind, number> = {
    contraindicated: 0,
    class: 1,
    caution: 2,
    daily: 3,
    duplicate: 4,
  };
  return alerts.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "danger" ? -1 : 1;
    if (rank[a.kind] !== rank[b.kind]) return rank[a.kind] - rank[b.kind];
    return (b.totalMg ?? 0) - (a.totalMg ?? 0) || a.id.localeCompare(b.id);
  });
}

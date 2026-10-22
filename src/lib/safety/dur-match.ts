import { canonicalIngredient, type DurClassPair, type DurPair, type DurReport } from "@/lib/safety";

const OWN_NAME = ["INGR_ENG_NAME", "ingrEngName", "INGR_ENG_NAME_FULL", "ingrEngNameFull", "INGR_KOR_NAME", "ingrKorName", "INGR_NAME", "ingrName"];
const OTHER_NAME = [
  "MIXTURE_INGR_ENG_NAME",
  "mixtureIngrEngName",
  "REL_INGR_ENG_NAME",
  "relIngrEngName",
  "MIXTURE_INGR_KOR_NAME",
  "mixtureIngrKorName",
  "MIXTURE_INGR_NAME",
  "mixtureIngrName",
];
const DETAIL = ["PROHBT_CONTENT", "prohbtContent", "REMARK", "remark"];

function active(item: Record<string, unknown>) {
  const flag = text(item, ["DEL_YN", "delYn"]);
  return flag !== "삭제" && flag !== "Y";
}

/** Series name is the efficacy group. Broader class codes also cover unrelated drugs such as acetaminophen. */
function classLabel(item: Record<string, unknown>) {
  return (
    text(item, ["SERS_NAME", "sersName"]) ||
    text(item, ["EFFECT_NAME", "effectName"]) ||
    text(item, ["EFFECT_CODE", "effectCode"]) ||
    text(item, ["CLASS_NAME", "className"])
  )
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function text(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pairId(a: string, b: string) {
  return [a, b].sort().join("+");
}

function named(item: Record<string, unknown>, keys: string[]) {
  const raw = text(item, keys);
  return raw ? canonicalIngredient(raw) : null;
}

/**
 * Turn DUR rows into pairs that are both in `wanted`.
 * Combination rows are ingredient-to-ingredient. Efficacy rows are one ingredient plus a class name.
 */
export function collectDurFindings(
  tabooRows: Record<string, unknown>[],
  classRows: Record<string, unknown>[],
  wanted: Iterable<string>,
): DurReport {
  const need = new Set(wanted);
  const contraindicated = new Map<string, DurPair>();
  for (const row of tabooRows) {
    if (!active(row)) continue;
    const left = named(row, OWN_NAME);
    const right = named(row, OTHER_NAME);
    if (!left || !right || left === right || !need.has(left) || !need.has(right)) continue;
    const id = pairId(left, right);
    if (contraindicated.has(id)) continue;
    const detail = text(row, DETAIL);
    contraindicated.set(id, {
      a: left,
      b: right,
      reasonEn: "MFDS DUR lists this combination as contraindicated.",
      reasonKo: detail || "식약처 DUR 병용금기입니다.",
    });
  }

  const members = new Map<string, { label: string; names: Set<string> }>();
  for (const row of classRows) {
    if (!active(row)) continue;
    const effect = classLabel(row);
    const name = named(row, OWN_NAME) ?? named(row, OTHER_NAME);
    if (!effect || !name || !need.has(name)) continue;
    const key = effect.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
    const group = members.get(key) ?? { label: effect, names: new Set<string>() };
    group.names.add(name);
    members.set(key, group);
  }

  const classNotes = new Map<string, { a: string; b: string; effects: string[] }>();
  for (const group of members.values()) {
    const effect = group.label;
    const names = [...group.names].filter((name) => need.has(name)).sort();
    for (let i = 0; i < names.length; i += 1) {
      for (let j = i + 1; j < names.length; j += 1) {
        const id = pairId(names[i], names[j]);
        const note = classNotes.get(id) ?? { a: names[i], b: names[j], effects: [] };
        if (!note.effects.includes(effect)) note.effects.push(effect);
        classNotes.set(id, note);
      }
    }
  }

  const sameClass: DurClassPair[] = [...classNotes.values()].map((note) => {
    const effect = note.effects.slice(0, 2).join(", ");
    return {
      a: note.a,
      b: note.b,
      reasonEn: `MFDS DUR lists these in the same drug class (${effect}).`,
      reasonKo: `식약처 DUR 효능군 중복입니다. (${effect})`,
    };
  });

  return { contraindicated: [...contraindicated.values()], sameClass };
}

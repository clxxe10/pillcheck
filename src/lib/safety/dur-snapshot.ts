import { canonicalIngredient, type DurClassPair, type DurPair, type DurReport } from "@/lib/safety";
import { collectDurFindings } from "@/lib/safety/dur-match";
import snapshot from "@/lib/safety/dur-snapshot.json";

const NAME_FIELDS = [
  "INGR_ENG_NAME",
  "INGR_KOR_NAME",
  "INGR_NAME",
  "MIXTURE_INGR_ENG_NAME",
  "MIXTURE_INGR_KOR_NAME",
] as const;

type Row = Record<string, string>;

const data = snapshot as { fetchedAt: string; taboo: Row[]; classes: Row[] };

let covered: Set<string> | null = null;

function namesIn(row: Row) {
  const names: string[] = [];
  for (const field of NAME_FIELDS) {
    const value = row[field];
    if (!value) continue;
    const name = canonicalIngredient(value);
    if (name) names.push(name);
  }
  return names;
}

function coveredNames() {
  if (covered) return covered;
  covered = new Set<string>();
  for (const row of [...data.taboo, ...data.classes]) {
    for (const name of namesIn(row)) covered.add(name);
  }
  return covered;
}

export const durSnapshotDate = data.fetchedAt;

export function snapshotCovers(name: string) {
  return coveredNames().has(name);
}

function stamp<T extends DurPair | DurClassPair>(pairs: T[], asOf: string): T[] {
  return pairs.map((pair) => ({ ...pair, asOf }));
}

/** Pairs already contained in the committed DUR lists. */
export function snapshotReport(wanted: Iterable<string>): DurReport {
  const report = collectDurFindings(data.taboo, data.classes, wanted);
  return {
    contraindicated: stamp(report.contraindicated, data.fetchedAt),
    sameClass: stamp(report.sameClass, data.fetchedAt),
  };
}

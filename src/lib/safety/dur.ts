import "server-only";

import { canonicalIngredient, type DurPair } from "@/lib/safety";

/** Ingredient-level combination contraindications. https://www.data.go.kr/data/15056780/openapi.do */
const ENDPOINT = "https://apis.data.go.kr/1471000/DURIrdntInfoService03/getUsjntTabooInfoList02";

type Page = { items: Record<string, unknown>[]; total: number };

const cache = new Map<string, Promise<Record<string, unknown>[]>>();

function serviceKey() {
  const raw = process.env.DATA_GO_KR_KEY?.trim();
  if (!raw) return null;
  try {
    return raw.includes("%") ? decodeURIComponent(raw) : raw;
  } catch {
    return raw;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function pageItems(payload: unknown): Page {
  const root = asRecord(payload);
  const response = asRecord(root?.response) ?? root;
  const header = asRecord(response?.header);
  const code = header?.resultCode;
  if (code !== undefined && String(code) !== "00") {
    throw new Error(`DUR result ${String(code)}`);
  }
  const body = asRecord(response?.body);
  const total = Number(body?.totalCount ?? 0);
  const items = body?.items;
  if (!items || items === "") return { items: [], total };
  if (Array.isArray(items)) return { items: items.filter((item) => asRecord(item)) as Record<string, unknown>[], total };
  const nested = asRecord(items)?.item;
  if (Array.isArray(nested)) return { items: nested.filter((item) => asRecord(item)) as Record<string, unknown>[], total };
  const one = asRecord(nested);
  return { items: one ? [one] : [], total };
}

function text(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

async function fetchPage(name: string, pageNo: number, key: string): Promise<Page> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("type", "json");
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", "100");
  url.searchParams.set("ingrEngName", name);
  const response = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!response.ok) throw new Error(`DUR HTTP ${response.status}`);
  return pageItems(await response.json());
}

async function recordsFor(name: string, key: string) {
  const cached = cache.get(name);
  if (cached) return cached;
  const pending = (async () => {
    const all: Record<string, unknown>[] = [];
    let total = Number.POSITIVE_INFINITY;
    for (let page = 1; page <= 3 && all.length < total; page += 1) {
      const next = await fetchPage(name, page, key);
      total = next.total;
      if (total > 300) throw new Error("DUR filter was ignored.");
      all.push(...next.items);
      if (next.items.length === 0) break;
    }
    return all;
  })();
  cache.set(name, pending);
  try {
    return await pending;
  } catch (error) {
    cache.delete(name);
    throw error;
  }
}

/** Official contraindicated pairs among these ingredients. Null means the caller should use the local table. */
export async function findDurPairs(names: string[]): Promise<DurPair[] | null> {
  const key = serviceKey();
  if (!key || names.length === 0) return null;
  const wanted = new Set(names);
  try {
    const pages = await Promise.all(names.map((name) => recordsFor(name, key)));
    const pairs = new Map<string, DurPair>();
    for (const records of pages) {
      for (const record of records) {
        const left = canonicalIngredient(
          text(record, ["INGR_ENG_NAME", "ingrEngName", "INGR_KOR_NAME", "ingrKorName"]),
        );
        const right = canonicalIngredient(
          text(record, [
            "MIXTURE_INGR_ENG_NAME",
            "mixtureIngrEngName",
            "REL_INGR_ENG_NAME",
            "relIngrEngName",
            "MIXTURE_INGR_KOR_NAME",
            "mixtureIngrKorName",
          ]),
        );
        if (!left || !right || left === right || !wanted.has(left) || !wanted.has(right)) continue;
        const id = [left, right].sort().join("+");
        if (pairs.has(id)) continue;
        const detail = text(record, ["PROHBT_CONTENT", "prohbtContent"]);
        pairs.set(id, {
          a: left,
          b: right,
          reasonEn: "MFDS DUR lists this combination as contraindicated.",
          reasonKo: detail || "식약처 DUR 병용금기입니다.",
        });
      }
    }
    return [...pairs.values()];
  } catch (error) {
    console.error(`[api/safety] DUR lookup failed: ${error instanceof Error ? error.message : "unknown"}`);
    return null;
  }
}

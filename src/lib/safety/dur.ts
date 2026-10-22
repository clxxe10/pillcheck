import "server-only";

import { canonicalIngredient, ingredientKoreanNames, ingredientNames, type DurReport } from "@/lib/safety";
import { collectDurFindings } from "@/lib/safety/dur-match";
import type { Medicine } from "@/types";

/** Ingredient-level DUR. https://www.data.go.kr/data/15056780/openapi.do */
const INGREDIENT = "https://apis.data.go.kr/1471000/DURIrdntInfoService03";
/** Item-level DUR, used when an English ingredient name returns nothing. https://www.data.go.kr/data/15059486/openapi.do */
const PRODUCT = "https://apis.data.go.kr/1471000/DURPrdlstInfoService03";

const TABOO = `${INGREDIENT}/getUsjntTabooInfoList02`;
const SAME_CLASS = `${INGREDIENT}/getEfcyDplctInfoList02`;
const PRODUCT_TABOO = `${PRODUCT}/getUsjntTabooInfoList03`;
const PRODUCT_LIST = `${PRODUCT}/getDurPrdlstInfoList03`;

const TIMEOUT_MS = 5000;
const cache = new Map<string, Promise<Record<string, unknown>[]>>();
let keyPreference: "decoded" | "raw" | null = null;

type Page = { items: Record<string, unknown>[]; total: number };

class DurKeyError extends Error {}

function keyVariants(raw: string) {
  let decoded = raw;
  try {
    if (raw.includes("%")) decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  const order = keyPreference === "raw" ? [raw, decoded] : [decoded, raw];
  return [...new Set(order)];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function pageItems(payload: unknown): Page {
  const root = asRecord(payload);
  const response = asRecord(root?.response) ?? root;
  const header = asRecord(response?.header);
  const code = header?.resultCode;
  if (code !== undefined && String(code) !== "00" && String(code) !== "0") {
    if (String(code) === "30") throw new DurKeyError("DUR result 30");
    throw new Error(`DUR result ${String(code)}`);
  }
  const body = asRecord(response?.body);
  const total = Number(body?.totalCount ?? 0);
  const items = body?.items;
  return { items: unwrapItems(items), total };
}

function unwrapItems(items: unknown): Record<string, unknown>[] {
  if (!items || items === "") return [];
  const wrapped = asRecord(items)?.item;
  const list = Array.isArray(items) ? items : Array.isArray(wrapped) ? wrapped : wrapped ? [wrapped] : [items];
  const rows: Record<string, unknown>[] = [];
  for (const entry of list) {
    const record = asRecord(entry);
    if (!record) continue;
    const inner = record.item;
    if (Array.isArray(inner)) {
      for (const item of inner) {
        const row = asRecord(item);
        if (row) rows.push(row);
      }
      continue;
    }
    const row = asRecord(inner) ?? record;
    rows.push(row);
  }
  return rows;
}

function mentions(items: Record<string, unknown>[], needle: string) {
  if (!needle || items.length === 0) return true;
  const probe = needle.toLowerCase();
  return items.slice(0, 8).some((item) => JSON.stringify(item).toLowerCase().includes(probe));
}

function text(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

async function fetchPage(operation: string, params: Record<string, string>, pageNo: number, key: string): Promise<Page> {
  const url = new URL(operation);
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("type", "json");
  url.searchParams.set("pageNo", String(pageNo));
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!response.ok) throw new Error(`DUR HTTP ${response.status}`);
  return pageItems(await response.json());
}

async function pages(operation: string, params: Record<string, string>, key: string) {
  const all: Record<string, unknown>[] = [];
  let total = Number.POSITIVE_INFINITY;
  const needle = params.ingrKorName || params.ingrName || params.ingrEngName || params.itemName || params.ingrCode || "";
  for (let page = 1; page <= 3 && all.length < total; page += 1) {
    const next = await fetchPage(operation, params, page, key);
    total = next.total;
    if (page === 1 && next.items.length > 0 && !mentions(next.items, needle)) return [];
    const before = all.length;
    all.push(...next.items);
    if (next.items.length === 0 || all.length === before) break;
  }
  return all;
}

async function loadRows(operation: string, params: Record<string, string>, rawKey: string) {
  let last: unknown;
  for (const key of keyVariants(rawKey)) {
    try {
      const rows = await pages(operation, params, key);
      keyPreference = key === rawKey ? "raw" : "decoded";
      return rows;
    } catch (error) {
      last = error;
      if (!(error instanceof DurKeyError)) throw error;
    }
  }
  throw last instanceof Error ? last : new Error("DUR key was rejected");
}

function rowsFor(operation: string, params: Record<string, string>, rawKey: string) {
  const id = `${operation}?${new URLSearchParams(params).toString()}`;
  const cached = cache.get(id);
  if (cached) return cached;
  const pending = loadRows(operation, params, rawKey);
  cache.set(id, pending);
  pending.catch(() => {
    if (cache.get(id) === pending) cache.delete(id);
  });
  return pending;
}

function safeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "unknown";
  return message.replace(/serviceKey=[^&\s]+/gi, "serviceKey=[redacted]").slice(0, 180);
}

async function tabooFor(label: string, rawKey: string) {
  try {
    return { rows: await rowsFor(TABOO, { ingrKorName: label, numOfRows: "100" }, rawKey), failed: false };
  } catch (error) {
    console.error(`[api/safety] DUR lookup failed: ${safeMessage(error)}`);
    return { rows: [], failed: true };
  }
}

async function classTable(rawKey: string) {
  try {
    return await rowsFor(SAME_CLASS, { numOfRows: "500" }, rawKey);
  } catch (error) {
    console.error(`[api/safety] DUR lookup failed: ${safeMessage(error)}`);
    return null;
  }
}

async function koreanFromProduct(itemName: string, target: string, rawKey: string) {
  const settled = await Promise.allSettled([
    rowsFor(PRODUCT_TABOO, { itemName, numOfRows: "5" }, rawKey),
    rowsFor(PRODUCT_LIST, { itemName, numOfRows: "5" }, rawKey),
  ]);
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const row of result.value) {
      const raw = text(row, [
        "INGR_KOR_NAME",
        "ingrKorName",
        "INGR_NAME",
        "ingrName",
        "INGR_ENG_NAME",
        "ingrEngName",
        "MAIN_INGR",
        "mainIngr",
        "MATERIAL_NAME",
        "materialName",
      ]);
      for (const part of raw.split(/[,+/;]/)) {
        if (canonicalIngredient(part) !== target) continue;
        const korean = part.match(/[가-힣]{2,}/)?.[0];
        if (korean) return korean;
      }
    }
  }
  return null;
}

async function rowsForIngredient(
  name: string,
  medicines: Pick<Medicine, "ingredient" | "name" | "nameEn">[],
  rawKey: string,
  known: boolean,
) {
  const labels = [...ingredientKoreanNames(name)];
  let taboo: Record<string, unknown>[] = [];
  let failed = false;
  for (const label of labels) {
    const found = await tabooFor(label, rawKey);
    failed = found.failed;
    if (found.failed || found.rows.length === 0) continue;
    taboo = found.rows;
    break;
  }
  if (taboo.length > 0 || failed || known) return { taboo, failed };

  const products = new Set<string>();
  for (const medicine of medicines) {
    if (!medicine.ingredient.split(",").some((part) => canonicalIngredient(part) === name)) continue;
    for (const field of [medicine.name, medicine.nameEn]) {
      const korean = field.match(/[가-힣]{2,}/)?.[0];
      if (korean) products.add(korean);
    }
  }
  for (const itemName of products) {
    const official = await koreanFromProduct(itemName, name, rawKey);
    if (!official || labels.includes(official)) continue;
    const found = await tabooFor(official, rawKey);
    return { taboo: found.rows, failed: found.failed };
  }
  return { taboo, failed: false };
}

async function mapPool<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await run(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

/** Official DUR pairs among these medicines. Null means every live lookup failed and local rules should stand alone. */
export async function findDurReport(
  medicines: Pick<Medicine, "ingredient" | "name" | "nameEn">[],
): Promise<DurReport | null> {
  const rawKey = process.env.DATA_GO_KR_KEY?.trim();
  const names = ingredientNames(medicines as Medicine[]);
  if (!rawKey || names.length === 0) return null;
  try {
    const classRows = await classTable(rawKey);
    const present = new Set<string>();
    for (const row of classRows ?? []) {
      const name = canonicalIngredient(
        [row.INGR_ENG_NAME, row.INGR_NAME, row.INGR_KOR_NAME].filter((value) => typeof value === "string").join(" "),
      );
      if (name) present.add(name);
    }
    const found = await mapPool(names, 2, async (name) => {
      try {
        return await rowsForIngredient(name, medicines, rawKey, present.has(name));
      } catch (error) {
        console.error(`[api/safety] DUR lookup failed: ${safeMessage(error)}`);
        return { taboo: [], failed: true };
      }
    });
    if (classRows === null && found.every((item) => item.failed)) return null;
    return collectDurFindings(
      found.flatMap((item) => item.taboo),
      classRows ?? [],
      names,
    );
  } catch (error) {
    console.error(`[api/safety] DUR lookup failed: ${safeMessage(error)}`);
    return null;
  }
}

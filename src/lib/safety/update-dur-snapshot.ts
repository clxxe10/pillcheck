import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as {
  loadEnvConfig: (dir: string) => void;
};

loadEnvConfig(process.cwd());

const TABOO = "https://apis.data.go.kr/1471000/DURIrdntInfoService03/getUsjntTabooInfoList02";
const SAME_CLASS = "https://apis.data.go.kr/1471000/DURIrdntInfoService03/getEfcyDplctInfoList02";
const TABOO_FIELDS = [
  "INGR_ENG_NAME",
  "INGR_KOR_NAME",
  "MIXTURE_INGR_ENG_NAME",
  "MIXTURE_INGR_KOR_NAME",
  "PROHBT_CONTENT",
  "DEL_YN",
] as const;
const CLASS_FIELDS = ["INGR_ENG_NAME", "INGR_NAME", "SERS_NAME", "EFFECT_NAME", "EFFECT_CODE", "CLASS_NAME", "DEL_YN"] as const;

function keyVariants(raw: string) {
  let decoded = raw;
  try {
    if (raw.includes("%")) decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  return [...new Set([decoded, raw])];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
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
    rows.push(asRecord(inner) ?? record);
  }
  return rows;
}

async function fetchPage(operation: string, pageNo: number, serviceKey: string) {
  const url = new URL(operation);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("type", "json");
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", "200");
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`DUR HTTP ${response.status}`);
  const payload = (await response.json()) as Record<string, unknown>;
  const root = asRecord(payload);
  const body = asRecord(asRecord(root?.response)?.body ?? root?.body);
  const header = asRecord(asRecord(root?.response)?.header ?? root?.header);
  const code = header?.resultCode;
  if (code !== undefined && String(code) !== "00" && String(code) !== "0") {
    throw new Error(`DUR result ${String(code)}`);
  }
  return { total: Number(body?.totalCount ?? 0), items: unwrapItems(body?.items) };
}

async function allRows(operation: string, serviceKey: string) {
  const all: Record<string, unknown>[] = [];
  let total = Number.POSITIVE_INFINITY;
  for (let page = 1; page <= 40 && all.length < total; page += 1) {
    const next = await fetchPage(operation, page, serviceKey);
    total = next.total;
    all.push(...next.items);
    console.log(`${operation.split("/").pop()} page ${page}: ${all.length}/${total || 0}`);
    if (next.items.length === 0) break;
  }
  if (total > 0 && all.length < total) throw new Error(`DUR snapshot incomplete (${all.length}/${total})`);
  return all;
}

function trim(rows: Record<string, unknown>[], fields: readonly string[]) {
  return rows.map((row) => {
    const item: Record<string, string> = {};
    for (const field of fields) {
      const value = row[field];
      if (typeof value === "string" && value.trim()) item[field] = value.trim();
    }
    return item;
  });
}

async function main() {
  const rawKey = process.env.DATA_GO_KR_KEY?.trim();
  if (!rawKey) {
    console.error("DATA_GO_KR_KEY is missing. Add it to .env.local and run again.");
    process.exit(1);
  }

  let taboo: Record<string, unknown>[] | null = null;
  let classes: Record<string, unknown>[] | null = null;
  let lastError: unknown;
  for (const serviceKey of keyVariants(rawKey)) {
    try {
      taboo = await allRows(TABOO, serviceKey);
      classes = await allRows(SAME_CLASS, serviceKey);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      if (!(error instanceof Error) || !error.message.includes("DUR result 30")) break;
    }
  }
  if (!taboo || !classes) {
    console.error(lastError instanceof Error ? lastError.message : "DUR snapshot failed");
    process.exit(1);
  }

  const fetchedAt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const snapshot = {
    fetchedAt,
    taboo: trim(taboo, TABOO_FIELDS),
    classes: trim(classes, CLASS_FIELDS),
  };

  writeFileSync(new URL("./dur-snapshot.json", import.meta.url), `${JSON.stringify(snapshot)}\n`);
  console.log(`Wrote dur-snapshot.json ${fetchedAt}: taboo ${snapshot.taboo.length}, class ${snapshot.classes.length}`);
}

main();

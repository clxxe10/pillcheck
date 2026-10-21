import "server-only";

/** In-memory caps. On Vercel each instance has its own counters, so this is a best-effort brake. */

const HOUR_MS = 60 * 60 * 1000;
const HOUR_LIMIT = 10;
const IP_DAY_LIMIT = 30;
const DEFAULT_DAILY = 200;

type IpUse = { hourStart: number; hour: number; day: string; dayCount: number };

const ips = new Map<string, IpUse>();
let globalDay = "";
let globalCount = 0;

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function dailyLimit() {
  const parsed = Number(process.env.DAILY_EXTRACT_LIMIT);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_DAILY;
  return Math.floor(parsed);
}

export type ExtractAllowance = "ok" | "rate_limited" | "quota";

/** Reserves one live extraction. `quota` is the shared daily cap; `rate_limited` is this IP. */
export function takeExtractSlot(ip: string): ExtractAllowance {
  const day = utcDay();
  if (globalDay !== day) {
    globalDay = day;
    globalCount = 0;
  }
  if (globalCount >= dailyLimit()) return "quota";

  const now = Date.now();
  const previous = ips.get(ip);
  const sameHour = previous !== undefined && now - previous.hourStart < HOUR_MS;
  const bucket: IpUse = sameHour
    ? {
        hourStart: previous.hourStart,
        hour: previous.hour,
        day,
        dayCount: previous.day === day ? previous.dayCount : 0,
      }
    : {
        hourStart: now,
        hour: 0,
        day,
        dayCount: previous?.day === day ? previous.dayCount : 0,
      };
  if (bucket.hour >= HOUR_LIMIT || bucket.dayCount >= IP_DAY_LIMIT) return "rate_limited";

  bucket.hour += 1;
  bucket.dayCount += 1;
  ips.set(ip, bucket);
  globalCount += 1;

  if (ips.size > 5000) {
    for (const [key, value] of ips) {
      if (value.day !== day && now - value.hourStart >= HOUR_MS) ips.delete(key);
    }
  }
  return "ok";
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  const ip = first || request.headers.get("x-real-ip")?.trim() || "local";
  return ip.slice(0, 64);
}

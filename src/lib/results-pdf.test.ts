import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildShareText, createResultsPdf, pdfFilename } from "./results-pdf";

const font = new Uint8Array(readFileSync(new URL("../../public/fonts/Pretendard-Subset.ttf", import.meta.url)));

test("names the PDF with the local calendar date", () => {
  assert.equal(pdfFilename(new Date(2026, 9, 22, 23, 30)), "pillcheck-2026-10-22.pdf");
});

test("builds a pharmacist summary in the current language", () => {
  const text = buildShareText({
    medicines: ["타이레놀정 500mg — Acetaminophen 500 mg — 1정 · 하루 3회 · 5일 — 서울가정의원"],
    warnings: ["성분 중복: 둘 다 아세트아미노펜\n용량이 합쳐집니다.\n출처: 식약처 DUR"],
    disclaimer: "이 도구는 의사·약사 상담을 대신하지 않습니다.",
  });
  assert.match(text, /타이레놀정 500mg/);
  assert.match(text, /아세트아미노펜/);
  assert.match(text, /의사·약사/);
});

test("embeds Pretendard so Korean survives in the PDF", () => {
  const bytes = createResultsPdf(font, {
    dateLabel: "10월 22일 목요일",
    warningsTitle: "경고",
    medicinesTitle: "약",
    scheduleTitle: "복용 일정",
    none: "없음",
    disclaimer: "이 도구는 의사·약사 상담을 대신하지 않습니다.",
    warnings: [
      {
        label: "성분 중복",
        title: "둘 다 아세트아미노펜",
        body: "아세트아미노펜이 약 두 개에 들어 있어 용량이 합쳐집니다.",
        source: "출처: 식약처 DUR",
      },
    ],
    medicines: [
      {
        name: "타이레놀정 500mg",
        ingredient: "Acetaminophen 500 mg",
        dose: "1정",
        times: "하루 3회",
        days: "5일",
        clinic: "서울가정의원",
        estimated: "",
      },
    ],
    slots: [{ label: "아침", time: "오전 8:00", items: [{ name: "타이레놀정", dose: "1정" }] }],
  });
  const header = Buffer.from(bytes.subarray(0, 5)).toString("ascii");
  const body = Buffer.from(bytes).toString("latin1");
  assert.equal(header, "%PDF-");
  assert.match(body, /Pretendard/);
  assert.ok(bytes.byteLength > 10_000);
});

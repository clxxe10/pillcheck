import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sampleResult } from "@/lib/mock";
import { checkSafety } from "@/lib/safety";
import type { Medicine } from "@/types";

function medicine(partial: Pick<Medicine, "id" | "ingredient" | "dose" | "timesPerDay">): Medicine {
  return {
    name: partial.id,
    nameEn: partial.id,
    days: null,
    timeSlots: [],
    sourceImageIndex: 0,
    confidence: "high",
    clinic: "",
    ...partial,
  };
}

describe("checkSafety", () => {
  it("flags the sample bag the same way every time", () => {
    const alerts = checkSafety(sampleResult().medicines);
    assert.deepEqual(
      alerts.map((alert) => ({
        id: alert.id,
        kind: alert.kind,
        severity: alert.severity,
        ingredient: alert.ingredient,
        medicineIds: alert.medicineIds,
        totalMg: alert.totalMg,
        limitMg: alert.limitMg,
        sourceName: alert.sourceName,
      })),
      [
        {
          id: "caution:aspirin+ibuprofen",
          kind: "caution",
          severity: "warning",
          ingredient: "aspirin+ibuprofen",
          medicineIds: ["med-3", "med-4"],
          totalMg: null,
          limitMg: null,
          sourceName: "FDA",
        },
        {
          id: "daily:acetaminophen",
          kind: "daily",
          severity: "warning",
          ingredient: "acetaminophen",
          medicineIds: ["med-1", "med-2"],
          totalMg: 2800,
          limitMg: 4000,
          sourceName: "FDA",
        },
        {
          id: "duplicate:acetaminophen",
          kind: "duplicate",
          severity: "warning",
          ingredient: "acetaminophen",
          medicineIds: ["med-1", "med-2"],
          totalMg: null,
          limitMg: null,
          sourceName: "Labeled ingredients",
        },
      ],
    );
  });

  it("marks a dose over the published limit as danger", () => {
    const alerts = checkSafety([
      medicine({ id: "med-1", ingredient: "Acetaminophen 1000 mg", dose: "1정", timesPerDay: 5 }),
    ]);
    const daily = alerts.find((alert) => alert.kind === "daily");
    assert.equal(daily?.severity, "danger");
    assert.equal(daily?.totalMg, 5000);
  });

  it("uses the local DUR table when no official pairs are passed", () => {
    const alerts = checkSafety([
      medicine({ id: "med-1", ingredient: "Warfarin 2 mg", dose: "1정", timesPerDay: 1 }),
      medicine({ id: "med-2", ingredient: "Aspirin 100 mg", dose: "1정", timesPerDay: 1 }),
    ]);
    assert.equal(alerts.some((alert) => alert.kind === "contraindicated" && alert.sourceName === "MFDS DUR"), true);
    assert.equal(alerts.some((alert) => alert.kind === "caution"), false);
  });

  it("lets an official DUR pair replace the milder caution for the same medicines", () => {
    const alerts = checkSafety(sampleResult().medicines, [
      {
        a: "ibuprofen",
        b: "aspirin",
        reasonEn: "Listed by MFDS DUR.",
        reasonKo: "식약처 DUR 병용금기입니다.",
      },
    ]);
    assert.equal(alerts.some((alert) => alert.kind === "caution"), false);
    assert.equal(
      alerts.some((alert) => alert.kind === "contraindicated" && alert.severity === "danger"),
      true,
    );
  });
});

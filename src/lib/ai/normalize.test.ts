import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeExtraction } from "@/lib/ai/normalize";

describe("normalizeExtraction", () => {
  it("keeps a printed box schedule and leaves the day count empty", () => {
    const result = normalizeExtraction(
      {
        medicines: [
          {
            name: "타이레놀정 500mg",
            nameEn: "Tylenol 500 mg",
            ingredient: "Acetaminophen 500 mg",
            dose: "1정",
            timesPerDay: 3,
            days: 0,
            timeSlots: [],
            sourceImageIndex: 0,
            sourceType: "otc_box",
            confidence: "medium",
          },
        ],
        unreadable: [],
      },
      ["약국"],
    );
    const medicine = result.medicines[0];
    assert.equal(medicine.sourceType, "otc_box");
    assert.equal(medicine.timesPerDay, 3);
    assert.equal(medicine.days, null);
    assert.deepEqual(medicine.timeSlots, ["morning", "lunch", "evening"]);
    assert.equal(medicine.confidence, "medium");
  });

  it("marks a bottle with no directions as needing review", () => {
    const result = normalizeExtraction(
      {
        medicines: [
          {
            name: "이부프로펜정 400mg",
            nameEn: "Ibuprofen 400 mg",
            ingredient: "Ibuprofen 400 mg",
            dose: "",
            timesPerDay: 0,
            days: 0,
            timeSlots: [],
            sourceImageIndex: 0,
            sourceType: "bottle",
            confidence: "high",
          },
        ],
        unreadable: [],
      },
      ["약국"],
    );
    const medicine = result.medicines[0];
    assert.equal(medicine.timesPerDay, null);
    assert.equal(medicine.days, null);
    assert.equal(medicine.timeSlots, null);
    assert.equal(medicine.confidence, "low");
  });

  it("asks for the package when the photo is loose tablets", () => {
    const result = normalizeExtraction(
      {
        medicines: [
          {
            name: "흰색 알약",
            nameEn: "white tablet",
            ingredient: "",
            dose: "",
            timesPerDay: 0,
            days: 0,
            timeSlots: [],
            sourceImageIndex: 0,
            sourceType: "unknown",
            confidence: "low",
          },
        ],
        unreadable: [],
      },
      ["약국"],
    );
    assert.equal(result.medicines.length, 0);
    assert.deepEqual(result.unreadable, [{ index: 0, reason: "no_package" }]);
  });
});

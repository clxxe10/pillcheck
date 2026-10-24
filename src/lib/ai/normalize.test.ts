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
    assert.equal(medicine.timeSlotsEstimated, true);
    assert.equal(medicine.confidence, "low");
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
    assert.equal(medicine.timeSlotsEstimated, false);
    assert.equal(medicine.confidence, "low");
  });

  it("keeps a printed foreign schedule and the unnamed-ingredient note", () => {
    const result = normalizeExtraction(
      {
        medicines: [
          {
            name: "Tylenol Rhume",
            nameEn: "Tylenol Cold",
            ingredient: "acétaminophène 325 mg, pseudoephedrine 30 mg",
            dose: "1 comprimé",
            timesPerDay: 4,
            days: 0,
            timeSlots: ["morning", "lunch", "evening", "bedtime"],
            timeSlotsEstimated: false,
            sourceImageIndex: 0,
            sourceType: "otc_box",
            confidence: "high",
            note: "et d'autres ingrédients",
          },
        ],
        unreadable: [],
      },
      [""],
    );
    const medicine = result.medicines[0];
    assert.equal(medicine.ingredient, "Acetaminophen 325 mg, pseudoephedrine 30 mg");
    assert.equal(medicine.dose, "1 comprimé");
    assert.equal(medicine.timesPerDay, 4);
    assert.equal(medicine.note, "et d'autres ingrédients");
    assert.equal(medicine.confidence, "high");
  });

  it("does not guess a strength that is not printed", () => {
    const result = normalizeExtraction(
      {
        medicines: [
          {
            name: "Tylenol",
            nameEn: "Tylenol",
            ingredient: "Acetaminophen",
            dose: "",
            timesPerDay: 0,
            days: 0,
            timeSlots: [],
            sourceImageIndex: 0,
            sourceType: "otc_box",
            confidence: "high",
          },
        ],
        unreadable: [],
      },
      [""],
    );
    const medicine = result.medicines[0];
    assert.equal(medicine.ingredient, "Acetaminophen");
    assert.equal(medicine.dose, "");
    assert.equal(medicine.timesPerDay, null);
    assert.equal(medicine.confidence, "low");
    assert.equal(medicine.note, undefined);
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

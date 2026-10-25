import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ingredientStatusOf, mergeIngredientPhoto, normalizeExtraction } from "@/lib/ai/normalize";
import { reviewReasons } from "@/lib/format";

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

  it("merges three grouped photos of one bottle into one medicine", () => {
    const result = normalizeExtraction(
      {
        medicines: [0, 1, 2].map((index) => ({
          name: index === 0 ? "칸데디핀정" : "칸데디핀정 8mg",
          nameEn: "Candesartan 8 mg",
          ingredient: index === 2 ? "Candesartan 8 mg" : "",
          dose: index === 1 ? "1정" : "",
          timesPerDay: 1,
          days: 0,
          timeSlots: ["morning"],
          timeSlotsEstimated: false,
          sourceImageIndex: index,
          sourceImageIndexes: [index],
          sourceType: "bottle",
          confidence: "medium",
          note: index === 0 ? "전문의약품" : "",
          nameUncertain: false,
        })),
        unreadable: [{ index: 2, reason: "other" }],
      },
      ["사진 1", "사진 2", "사진 3"],
      [[0, 1, 2]],
    );
    assert.equal(result.medicines.length, 1);
    const medicine = result.medicines[0];
    assert.deepEqual(medicine.sourceImageIndexes, [0, 1, 2]);
    assert.equal(medicine.sourceType, "prescription");
    assert.equal(medicine.ingredient, "Candesartan 8 mg");
    assert.equal(medicine.dose, "1정");
    assert.equal(result.unreadable.length, 0);
  });

  it("auto-merges the same bottle and keeps separate pharmacy bags", () => {
    const shared = {
      name: "타이레놀정 500mg",
      nameEn: "Tylenol 500 mg",
      ingredient: "Acetaminophen 500 mg",
      dose: "1정",
      timesPerDay: 3,
      days: 0,
      timeSlots: ["morning", "lunch", "evening"],
      timeSlotsEstimated: false,
      confidence: "high",
      note: "",
      nameUncertain: false,
    };
    const bottles = normalizeExtraction(
      {
        medicines: [0, 1].map((index) => ({
          ...shared,
          sourceImageIndex: index,
          sourceImageIndexes: [index],
          sourceType: "otc_box",
        })),
        unreadable: [],
      },
      ["사진 1", "사진 2"],
    );
    assert.equal(bottles.medicines.length, 1);
    assert.deepEqual(bottles.medicines[0].sourceImageIndexes, [0, 1]);

    const bags = normalizeExtraction(
      {
        medicines: [0, 1].map((index) => ({
          ...shared,
          sourceImageIndex: index,
          sourceImageIndexes: [index],
          sourceType: "prescription_bag",
        })),
        unreadable: [],
      },
      ["서울가정의원", "한빛이비인후과"],
    );
    assert.equal(bags.medicines.length, 2);
  });

  it("does not auto-merge the same bottle from two different places or two strengths", () => {
    const base = {
      name: "이부프로펜정",
      nameEn: "Ibuprofen",
      dose: "1정",
      timesPerDay: 3,
      days: 0,
      timeSlots: ["morning", "lunch", "evening"],
      timeSlotsEstimated: false,
      confidence: "high",
      note: "",
      nameUncertain: false,
      sourceType: "bottle",
    };
    const places = normalizeExtraction(
      {
        medicines: ["서울약국", "부산약국"].map((clinic, index) => ({
          ...base,
          ingredient: "Ibuprofen 200 mg",
          sourceImageIndex: index,
          sourceImageIndexes: [index],
        })),
        unreadable: [],
      },
      ["서울약국", "부산약국"],
    );
    assert.equal(places.medicines.length, 2);

    const strengths = normalizeExtraction(
      {
        medicines: ["200 mg", "400 mg"].map((strength, index) => ({
          ...base,
          name: `이부프로펜정 ${strength}`,
          ingredient: `Ibuprofen ${strength}`,
          sourceImageIndex: index,
          sourceImageIndexes: [index],
        })),
        unreadable: [],
      },
      ["사진 1", "사진 2"],
    );
    assert.equal(strengths.medicines.length, 2);
  });

  it("marks a brand with no matching ingredient as unknown and fills it from a panel photo", () => {
    const result = normalizeExtraction(
      {
        medicines: [
          {
            name: "칸데디핀정",
            nameEn: "Candedipine",
            ingredient: "",
            dose: "",
            timesPerDay: 0,
            days: 0,
            timeSlots: [],
            sourceImageIndex: 0,
            sourceType: "bottle",
            confidence: "low",
            note: "전문의약품",
          },
        ],
        unreadable: [],
      },
      ["사진 1"],
    );
    const medicine = result.medicines[0];
    assert.equal(medicine.sourceType, "prescription");
    assert.equal(medicine.ingredientStatus, "unknown");
    assert.ok(reviewReasons(medicine).includes("ingredient"));
    assert.ok(reviewReasons(medicine).includes("directions"));

    const panel = normalizeExtraction(
      {
        medicines: [
          {
            name: "칸데디핀정",
            nameEn: "Candedipine",
            ingredient: "Acetaminophen 500 mg",
            dose: "1정",
            timesPerDay: 1,
            days: 0,
            timeSlots: ["morning"],
            timeSlotsEstimated: false,
            sourceImageIndex: 0,
            sourceType: "bottle",
            confidence: "high",
            note: "",
          },
        ],
        unreadable: [],
      },
      ["성분표"],
    );
    const filled = mergeIngredientPhoto(medicine, panel.medicines[0]);
    assert.equal(filled.id, medicine.id);
    assert.equal(filled.clinic, medicine.clinic);
    assert.equal(filled.ingredient, "Acetaminophen 500 mg");
    assert.equal(filled.ingredientStatus, "known");
    assert.equal(ingredientStatusOf("Acetaminophen 500 mg"), "known");
    assert.equal(ingredientStatusOf("칸데디핀"), "unknown");
  });
});

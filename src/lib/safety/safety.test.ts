import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sampleResult } from "@/lib/mock";
import { canonicalIngredient, checkSafety, ingredientSearchNames, unifyIngredient } from "@/lib/safety";
import { collectDurFindings } from "@/lib/safety/dur-match";
import { durSnapshotDate, snapshotCovers } from "@/lib/safety/dur-snapshot";
import type { Medicine } from "@/types";

function medicine(partial: Pick<Medicine, "id" | "ingredient" | "dose" | "timesPerDay">): Medicine {
  return {
    name: partial.id,
    nameEn: partial.id,
    days: null,
    timeSlots: [],
    timeSlotsEstimated: false,
    sourceImageIndex: 0,
    sourceType: "prescription_bag",
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
          id: "pair:aspirin+ibuprofen",
          kind: "class",
          severity: "warning",
          ingredient: "aspirin+ibuprofen",
          medicineIds: ["med-4", "med-3"],
          totalMg: null,
          limitMg: null,
          sourceName: `MFDS DUR (data as of ${durSnapshotDate})`,
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
    assert.deepEqual(
      alerts[0]?.reasons?.map((reason) => ({ kind: reason.kind, sourceName: reason.sourceName })),
      [
        { kind: "class", sourceName: `MFDS DUR (data as of ${durSnapshotDate})` },
        { kind: "caution", sourceName: "FDA" },
      ],
    );
    assert.equal(alerts.length, 3);
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

  it("keeps duplicate and combination checks when the daily dose is not entered yet", () => {
    const alerts = checkSafety([
      medicine({ id: "rx", ingredient: "Acetaminophen 500 mg", dose: "2정", timesPerDay: 4 }),
      medicine({
        id: "box",
        ingredient: "Acetaminophen 500 mg",
        dose: "",
        timesPerDay: null,
      }),
      medicine({ id: "asa", ingredient: "Aspirin, low dose 100 mg", dose: "1정", timesPerDay: 1 }),
      medicine({ id: "ibu", ingredient: "Ibuprofen 400 mg", dose: "", timesPerDay: null }),
    ]);
    const daily = alerts.find((alert) => alert.kind === "daily");
    assert.deepEqual(daily?.medicineIds, ["rx"]);
    assert.equal(daily?.totalMg, 4000);
    assert.deepEqual(
      alerts.find((alert) => alert.kind === "duplicate")?.medicineIds,
      ["rx", "box"],
    );
    const pair = alerts.find((alert) => alert.ingredient === "aspirin+ibuprofen");
    assert.equal(pair?.reasons?.some((reason) => reason.kind === "caution"), true);
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

  it("keeps the saved contraindication when a live DUR lookup has no row for it", () => {
    const alerts = checkSafety(
      [
        medicine({ id: "med-1", ingredient: "Warfarin sodium 2 mg", dose: "1정", timesPerDay: 1 }),
        medicine({ id: "med-2", ingredient: "Aspirin 100 mg", dose: "1정", timesPerDay: 1 }),
      ],
      { contraindicated: [], sameClass: [] },
    );
    assert.equal(alerts.some((alert) => alert.kind === "contraindicated" && alert.sourceName === "MFDS DUR"), true);
  });

  it("adds an orange same-drug-class warning from DUR and skips it when the pair is already contraindicated", () => {
    const classPair = {
      a: "ibuprofen",
      b: "aspirin",
      reasonEn: "MFDS DUR lists these in the same drug class (NSAIDs).",
      reasonKo: "식약처 DUR 효능군 중복입니다. (해열진통소염제)",
    };
    const added = checkSafety(sampleResult().medicines, { contraindicated: [], sameClass: [classPair] });
    const match = added.find((alert) => alert.ingredient === "aspirin+ibuprofen");
    assert.equal(match?.kind, "class");
    assert.equal(match?.severity, "warning");
    assert.equal(match?.sourceName, "MFDS DUR");
    assert.deepEqual(
      match?.reasons?.map((reason) => reason.kind),
      ["class", "caution"],
    );
    assert.equal(added.filter((alert) => alert.ingredient === "aspirin+ibuprofen").length, 1);

    const blocked = checkSafety(sampleResult().medicines, {
      contraindicated: [
        { a: "ibuprofen", b: "aspirin", reasonEn: "Listed by MFDS DUR.", reasonKo: "식약처 DUR 병용금기입니다." },
      ],
      sameClass: [classPair],
    });
    assert.equal(blocked.some((alert) => alert.kind === "class"), false);
    assert.equal(blocked.some((alert) => alert.kind === "contraindicated"), true);
  });

  it("matches DUR ingredient spellings that differ by case or salt", () => {
    assert.equal(canonicalIngredient("Ibuprofen"), "ibuprofen");
    assert.equal(canonicalIngredient("Cetirizine Hydrochloride"), "cetirizine");
    assert.equal(canonicalIngredient("Warfarin Sodium"), "warfarin");
    assert.equal(canonicalIngredient("Acetylsalicylic Acid"), "aspirin");
    assert.equal(canonicalIngredient("아스피린"), "aspirin");
    assert.equal(canonicalIngredient("아세트아미노펜"), "acetaminophen");
    assert.equal(canonicalIngredient("acétaminophène"), "acetaminophen");
    assert.equal(canonicalIngredient("paracétamol 500 mg"), "acetaminophen");
    assert.equal(canonicalIngredient("Tylenol"), "acetaminophen");
    assert.equal(canonicalIngredient("Panadol"), "acetaminophen");
    assert.equal(canonicalIngredient("Advil 200 mg"), "ibuprofen");
    assert.equal(canonicalIngredient("Nurofen"), "ibuprofen");
    assert.equal(canonicalIngredient("ibuprofène"), "ibuprofen");
    assert.equal(canonicalIngredient("and other ingredients"), null);
    assert.equal(canonicalIngredient("et d'autres ingrédients"), null);
    assert.equal(unifyIngredient("paracetamol 500 mg"), "Acetaminophen 500 mg");
    assert.equal(unifyIngredient("acétaminophène"), "Acetaminophen");
    assert.equal(unifyIngredient("Tylenol 325 mg, pseudoephedrine 30 mg"), "Acetaminophen 325 mg, pseudoephedrine 30 mg");
    assert.equal(unifyIngredient("Advil 200 mg"), "Ibuprofen 200 mg");
    assert.deepEqual(ingredientSearchNames("acetaminophen"), ["Acetaminophen", "Paracetamol"]);
    assert.deepEqual(ingredientSearchNames("aspirin"), ["Aspirin", "Acetylsalicylic Acid", "Acetylsalicylic"]);

    const foreign = checkSafety([
      medicine({ id: "kr", ingredient: "Acetaminophen 500 mg", dose: "1정", timesPerDay: 1 }),
      medicine({ id: "ca", ingredient: "acétaminophène", dose: "1 tablet", timesPerDay: 1 }),
    ]);
    assert.equal(
      foreign.some((alert) => alert.kind === "duplicate" && alert.ingredient === "acetaminophen"),
      true,
    );

    const found = collectDurFindings(
      [
        {
          INGR_ENG_NAME: "Warfarin Sodium",
          MIXTURE_INGR_ENG_NAME: "Aspirin",
          PROHBT_CONTENT: "출혈 위험",
        },
      ],
      [
        { INGR_ENG_NAME: "Ibuprofen", EFFECT_NAME: "해열·진통·소염제" },
        { INGR_NAME: "아스피린", EFFECT_NAME: "해열 진통 소염제" },
      ],
      ["warfarin", "aspirin", "ibuprofen"],
    );
    assert.equal(found.contraindicated.length, 1);
    assert.equal(found.contraindicated[0]?.reasonKo, "출혈 위험");
    assert.equal(found.sameClass.length, 1);
    assert.equal(found.sameClass[0]?.a === "aspirin" || found.sameClass[0]?.b === "aspirin", true);
    assert.equal(snapshotCovers("ibuprofen"), true);
    assert.equal(snapshotCovers("notarealdrug"), false);
  });

  it("treats the DUR series name as the drug class and ignores deleted rows", () => {
    const found = collectDurFindings(
      [],
      [
        {
          INGR_ENG_NAME: "Ibuprofen",
          SERS_NAME: "비스테로이드성 소염제",
          CLASS_NAME: "[01140]해열.진통.소염제",
          DEL_YN: "정상",
        },
        {
          INGR_ENG_NAME: "Aspirin",
          SERS_NAME: "비스테로이드성 소염제",
          CLASS_NAME: "[01140]해열.진통.소염제",
          DEL_YN: "정상",
        },
        {
          INGR_ENG_NAME: "Acetaminophen",
          SERS_NAME: "아닐리드계 해열진통제",
          CLASS_NAME: "[01140]해열.진통.소염제",
          DEL_YN: "정상",
        },
        { INGR_ENG_NAME: "Pseudoephedrine", SERS_NAME: "진해거담제", DEL_YN: "삭제" },
      ],
      ["ibuprofen", "aspirin", "acetaminophen", "pseudoephedrine"],
    );
    assert.deepEqual(
      found.sameClass.map((pair) => [pair.a, pair.b].sort().join("+")),
      ["aspirin+ibuprofen"],
    );
  });
});

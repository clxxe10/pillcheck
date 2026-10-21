import { normalizeExtraction } from "@/lib/ai/normalize";
import sampleExtract from "@/lib/demo/sample-extract.json";
import type { ExtractResponse, SafetyAlert, ScanPhoto } from "@/types";

/** Sample bags shown on the scan screen. Analyzing only these uses the saved result, not the API. */
export const samplePhotos: ScanPhoto[] = [
  { id: "img-0412", filename: "IMG_0412", clinic: "Seoul Family Clinic", sample: true },
  { id: "img-0413", filename: "IMG_0413", clinic: "Hanbit ENT", sample: true },
  { id: "img-0415", filename: "IMG_0415", clinic: "Green Heart Clinic", sample: true },
];

export function sampleResult(): ExtractResponse {
  return normalizeExtraction(
    sampleExtract,
    samplePhotos.map((photo) => photo.clinic),
  );
}

/** Safety alerts for the sample result (ids follow the order in sample-extract.json). */
export const sampleAlerts: SafetyAlert[] = [
  {
    id: "combine",
    severity: "danger",
    label: "Do not combine",
    homeTitle: "Ibuprofen + Aspirin",
    title: "Ibuprofen + Aspirin",
    body: "Taking them together raises the risk of stomach bleeding and can make low-dose aspirin less protective for your heart.",
    medicineIds: ["med-3", "med-4"],
  },
  {
    id: "duplicate",
    severity: "warning",
    label: "Duplicate ingredient",
    homeTitle: "Tylenol and Coldaway Day both contain acetaminophen",
    title: "Both contain acetaminophen",
    body: "Together that is up to 2,800 mg a day, close to the daily limit for many adults.",
    medicineIds: ["med-1", "med-2"],
  },
];

/** Static “next dose” countdown from the home artboard. */
export const nextDoseHours = 2;

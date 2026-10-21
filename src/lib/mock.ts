import { normalizeExtraction } from "@/lib/ai/normalize";
import sampleExtract from "@/lib/demo/sample-extract.json";
import type { ExtractResponse, ScanPhoto } from "@/types";

/** Sample bags shown on the scan screen. Analyzing only these uses the saved result, not the API. */
export const samplePhotos: ScanPhoto[] = [
  {
    id: "img-0412",
    filename: "seoul-family.png",
    clinic: "서울가정의원",
    sample: true,
    previewUrl: "/samples/seoul-family.png",
  },
  {
    id: "img-0413",
    filename: "hanbit-ent.png",
    clinic: "한빛이비인후과",
    sample: true,
    previewUrl: "/samples/hanbit-ent.png",
  },
  {
    id: "img-0415",
    filename: "green-heart.png",
    clinic: "그린하트내과",
    sample: true,
    previewUrl: "/samples/green-heart.png",
  },
];

export function sampleResult(): ExtractResponse {
  return normalizeExtraction(
    sampleExtract,
    samplePhotos.map((photo) => photo.clinic),
  );
}

/** Static “next dose” countdown from the home artboard. */
export const nextDoseHours = 2;

export type DoseSlot = "morning" | "lunch" | "evening" | "bedtime";

export type Confidence = "high" | "medium" | "low";

/** One medicine as returned by /api/extract (and edited in the UI). */
export type Medicine = {
  id: string;
  /** Name exactly as printed on the bag or prescription (usually Korean). */
  name: string;
  /** English name: brand romanized or generic, with strength. */
  nameEn: string;
  /** Active ingredient(s) with strength, in English. */
  ingredient: string;
  /** Amount per dose as printed, e.g. "1정", "2 tablets", "5 mL". */
  dose: string;
  timesPerDay: number;
  /** null = ongoing / not printed. */
  days: number | null;
  timeSlots: DoseSlot[];
  /** 0-based index into the photos sent with the request. */
  sourceImageIndex: number;
  confidence: Confidence;
  /** Clinic name the user entered for the source photo. */
  clinic: string;
};

export type AlertSeverity = "danger" | "warning";

export type WarningKind = "duplicate" | "daily" | "contraindicated" | "caution";

/** A rule-based warning. Copy is rendered from `kind` so it stays in both languages. */
export type SafetyAlert = {
  id: string;
  kind: WarningKind;
  severity: AlertSeverity;
  sourceName: string;
  sourceUrl: string;
  medicineIds: string[];
  /** Canonical ingredient, or a sorted pair (`ibuprofen+aspirin`). */
  ingredient: string;
  totalMg: number | null;
  limitMg: number | null;
  reasonEn: string;
  reasonKo: string;
};

export type UnreadableReason = "blurry" | "glare" | "cropped" | "not_medicine" | "other";

export type UnreadableImage = {
  /** 0-based index into the photos sent with the request. */
  index: number;
  reason: UnreadableReason;
};

export type ExtractImage = {
  /** Base64 without the data: prefix. */
  data: string;
  mimeType: string;
  clinic: string;
};

export type ExtractRequest = {
  images: ExtractImage[];
};

export type ExtractResponse = {
  medicines: Medicine[];
  unreadable: UnreadableImage[];
};

export type ExtractErrorCode =
  | "bad_request"
  | "rate_limited"
  | "quota"
  | "timeout"
  | "invalid_response"
  | "not_configured"
  | "provider_error";

export type ExtractErrorResponse = {
  error: ExtractErrorCode;
  message: string;
};

/** A photo on the scan screen. */
export type ScanPhoto = {
  id: string;
  filename: string;
  clinic: string;
  /** Demo photos have no file; analysis uses the saved sample result. */
  sample: boolean;
  /** Object URL for the thumbnail (real uploads only). */
  previewUrl?: string;
  file?: File;
  unreadable?: UnreadableReason;
};

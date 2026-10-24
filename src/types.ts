export type DoseSlot = "morning" | "lunch" | "evening" | "bedtime";

export type Confidence = "high" | "medium" | "low";

/** What the photo showed. `unknown` is a loose tablet or a shot with no label. */
export type SourceType =
  | "prescription_bag"
  | "prescription"
  | "otc_box"
  | "bottle"
  | "blister"
  | "unknown";

/** One medicine as returned by /api/extract (and edited in the UI). */
export type Medicine = {
  id: string;
  /** Name exactly as printed on the package (usually Korean). */
  name: string;
  /** English name: brand romanized or generic, with strength. */
  nameEn: string;
  /** Active ingredient(s) with strength, in English. */
  ingredient: string;
  /** Amount per dose as printed, e.g. "1정", "2 tablets", "5 mL". Empty when the label has none. */
  dose: string;
  /** null when the label does not say how many times a day. */
  timesPerDay: number | null;
  /** null = ongoing, or not printed. */
  days: number | null;
  /** null when the label does not say when to take it. */
  timeSlots: DoseSlot[] | null;
  /** True when the time of day was not printed and the slots were inferred from a daily count. */
  timeSlotsEstimated: boolean;
  /** 0-based index into the photos sent with the request. */
  sourceImageIndex: number;
  /** Package the medicine was read from. */
  sourceType: SourceType;
  confidence: Confidence;
  /** Clinic name the user entered for the source photo. */
  clinic: string;
};

export type AlertSeverity = "danger" | "warning";

export type WarningKind = "duplicate" | "daily" | "contraindicated" | "class" | "caution";

/** One ground inside a combined pair card. */
export type AlertReason = {
  kind: WarningKind;
  sourceName: string;
  sourceUrl: string;
  reasonEn: string;
  reasonKo: string;
};

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
  /** Present when several rules were folded into this card. Ordered most severe first. */
  reasons?: AlertReason[];
};

export type UnreadableReason = "blurry" | "glare" | "cropped" | "not_medicine" | "no_package" | "other";

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
  | "provider_error"
  | "demo_only";

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

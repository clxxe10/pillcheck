export type DoseSlot = "morning" | "lunch" | "evening" | "bedtime";

export type Confidence = "high" | "medium" | "low";

export type IngredientStatus = "known" | "unknown";

export type ReviewReason = "time" | "directions" | "name" | "ingredient";

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
  /** Unknown when the ingredient is empty or matches neither an alias nor the DUR list. */
  ingredientStatus?: IngredientStatus;
  /** True when the printed name was only partly readable. */
  nameUncertain?: boolean;
  /** Amount per dose as printed, e.g. "1정", "2 tablets", "5 mL". Empty when the label has none. */
  dose: string;
  /** Printed phrase such as "and other ingredients", when unnamed ingredients were left out. */
  note?: string;
  /** null when the label does not say how many times a day. */
  timesPerDay: number | null;
  /** null = ongoing, or not printed. */
  days: number | null;
  /** null when the label does not say when to take it. */
  timeSlots: DoseSlot[] | null;
  /** True when the time of day was not printed and the slots were inferred from a daily count. */
  timeSlotsEstimated: boolean;
  /** 0-based index of the first photo this medicine was read from. */
  sourceImageIndex: number;
  /** Every photo of this medicine, including other sides of the same package. */
  sourceImageIndexes?: number[];
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

export type ExtractFocus = {
  name: string;
  nameEn: string;
};

export type ExtractRequest = {
  images: ExtractImage[];
  /** Each inner list is photo indexes of one product, shot from different sides. */
  groups?: number[][];
  /** Set when the photo is an ingredient panel for a medicine the user already has. */
  focus?: ExtractFocus;
};

export type ExtractResponse = {
  medicines: Medicine[];
  unreadable: UnreadableImage[];
};

export type ExtractErrorCode =
  | "bad_request"
  | "too_large"
  | "unsupported_type"
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
  /** Photos that share a groupId are one medicine. */
  groupId?: string;
  /** HEIC/HEIF is being turned into a JPEG before it can be shown or sent. */
  converting?: boolean;
  /** The browser could not open this file. It is not sent. */
  convertFailed?: boolean;
};

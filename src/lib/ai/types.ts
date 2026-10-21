import type { ExtractImage } from "@/types";

export type ProviderRequest = {
  prompt: string;
  images: ExtractImage[];
  signal: AbortSignal;
  timeoutMs: number;
};

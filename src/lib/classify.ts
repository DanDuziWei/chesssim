import type { Classification } from "./types";

export interface ClassificationMeta {
  label: string;
  /** Badge background tint (hex). */
  bg: string;
  /** Badge text color (hex). */
  fg: string;
  /** Annotation symbol appended to SAN, e.g. "!" / "??". */
  glyph: string;
}

export const CLASSIFICATION_META: Record<Classification, ClassificationMeta> = {
  book: { label: "Book", bg: "#ECEBE6", fg: "#6C6458", glyph: "" },
  best: { label: "Best", bg: "#E3ECF7", fg: "#2F5BA0", glyph: "" },
  excellent: {
    label: "Excellent",
    bg: "#E4F2E9",
    fg: "#2F7D4F",
    glyph: "!",
  },
  good: { label: "Good", bg: "#EEF2E6", fg: "#5C7530", glyph: "" },
  inaccuracy: {
    label: "Inaccuracy",
    bg: "#F6EDD8",
    fg: "#9A6B1F",
    glyph: "?!",
  },
  mistake: { label: "Mistake", bg: "#F8E5D5", fg: "#B0561F", glyph: "?" },
  blunder: { label: "Blunder", bg: "#F8DDDA", fg: "#B02B20", glyph: "??" },
  brilliant: { label: "Brilliant", bg: "#EBE4FA", fg: "#6D3FD1", glyph: "!!" },
};

export const TURNING_POINT_COLOR = "#0E8FA6";
export const SACRIFICE_COLOR = "#6D3FD1";

/**
 * Infer a quality classification from the evaluation swing for the side to move.
 * `delta` is in centipawns from the mover's perspective (positive = the move gained).
 */
export function classifyFromDelta(delta: number): Classification {
  if (delta <= -260) return "blunder";
  if (delta <= -130) return "mistake";
  if (delta <= -60) return "inaccuracy";
  if (delta >= 180) return "brilliant";
  if (delta >= 90) return "excellent";
  if (delta >= 25) return "best";
  return "good";
}

export function evalToProxyCp(cp: number, mate?: number): number {
  if (mate != null) return mate > 0 ? 10000 - mate * 100 : -10000 - mate * 100;
  return cp;
}

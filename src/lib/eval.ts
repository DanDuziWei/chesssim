import type { Evaluation } from "./types";

/** Convert a centipawn evaluation into a win probability in [0, 1] for White. */
export function cpToWinProb(cp: number): number {
  // Standard logistic mapping; 400cp ~= 0.93, 100cp ~= 0.62.
  return 1 / (1 + Math.exp(-cp / 180));
}

export function mateToWinProb(mate: number): number {
  return mate > 0 ? 1 : 0;
}

/** Win probability for White from any evaluation, clamped to [0, 1]. */
export function evalToWinProb(e: Evaluation): number {
  if (e.mate != null) return mateToWinProb(e.mate);
  return cpToWinProb(e.cp);
}

/** Format an evaluation as a human-friendly string, e.g. "+1.42" or "M3". */
export function formatEval(e: Evaluation): string {
  if (e.mate != null) {
    const n = Math.abs(e.mate);
    return `M${n}`;
  }
  const sign = e.cp > 0 ? "+" : "";
  return `${sign}${(e.cp / 100).toFixed(2)}`;
}

/** The side that is better according to an evaluation, or null when dead equal. */
export function betterSide(e: Evaluation): "w" | "b" | null {
  if (e.mate != null) return e.mate > 0 ? "w" : "b";
  if (Math.abs(e.cp) < 10) return null;
  return e.cp > 0 ? "w" : "b";
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

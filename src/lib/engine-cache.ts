"use client";

import type { EngineAnalysis } from "./stockfish";

/** Compact serializable engine result, cached per match slug. */
export interface StoredEngineResult {
  cp: number | null;
  mate: number | null;
  depth: number;
  best: string | null;
}

const CACHE_PREFIX = "chesssim-sf-v3:";

export function toStored(r: EngineAnalysis): StoredEngineResult {
  return { cp: r.cp, mate: r.mate, depth: r.depth, best: r.bestMove };
}

export function fromStored(s: StoredEngineResult): EngineAnalysis {
  return {
    fen: "",
    cp: s.cp,
    mate: s.mate,
    depth: s.depth,
    bestMove: s.best,
  };
}

export function loadEngineCache(
  slug: string,
  expectedLength: number
): (StoredEngineResult | undefined)[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(CACHE_PREFIX + slug);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (StoredEngineResult | null)[];
    if (!Array.isArray(parsed) || parsed.length !== expectedLength) return [];
    return parsed.map((r) => r ?? undefined);
  } catch {
    return [];
  }
}

export function saveEngineCache(
  slug: string,
  results: (StoredEngineResult | undefined)[]
): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CACHE_PREFIX + slug, JSON.stringify(results));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

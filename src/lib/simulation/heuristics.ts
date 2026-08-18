import type { Chess, Move } from "chess.js";

/** Tiny local move heuristics used as offline fallback agents. */

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

function scoreMove(chess: Chess, mv: Move): number {
  let score = 0;
  if (mv.captured) score += (PIECE_VALUES[mv.captured] ?? 100) * 10;
  if (mv.promotion) score += PIECE_VALUES[mv.promotion] ?? 100;
  if (mv.san.includes("+")) score += 40;
  // small bonus for centralizing pawns/knight development early on
  if (mv.piece === "n" || mv.piece === "b") score += 5;
  return score + Math.random() * 10;
}

/** Greedy: prefer captures / checks / promotions, with a little noise. */
export function greedyMove(chess: Chess): Move | null {
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;
  let best: Move = moves[0];
  let bestScore = -Infinity;
  for (const mv of moves) {
    const s = scoreMove(chess, mv);
    if (s > bestScore) {
      bestScore = s;
      best = mv;
    }
  }
  return best;
}

/** Random legal move with a mild bias toward captures. */
export function randomMove(chess: Chess): Move | null {
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;
  const captures = moves.filter((m) => m.captured);
  const pool = captures.length > 0 && Math.random() < 0.7 ? captures : moves;
  return pool[Math.floor(Math.random() * pool.length)];
}

export type Side = "w" | "b";

export type MatchStatus = "live" | "completed";

export type MatchResult = "1-0" | "0-1" | "1/2-1/2" | "*";

export type Classification =
  | "book"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "brilliant";

/** A chess evaluation from White's perspective. */
export interface Evaluation {
  /** Centipawns. Positive favours White, negative favours Black. */
  cp: number;
  /** When present, distance to mate. Positive = White mates, negative = Black mates. */
  mate?: number;
}

export interface Alternative {
  san: string;
  /** Computed squares for the suggested move (when legal in the position). */
  from?: string;
  to?: string;
  evaluation: Evaluation;
  note?: string;
}

export interface Move {
  /** 1-based ply index. */
  ply: number;
  /** Full-move number (1-based). */
  moveNumber: number;
  color: Side;
  san: string;
  from: string;
  to: string;
  /** Resulting position after this move. */
  fen: string;
  capture?: boolean;
  check?: boolean;
  checkmate?: boolean;
  promotion?: string;
  evaluation: Evaluation;
  classification: Classification;
  /** Narrative tags, e.g. ["turning-point", "sacrifice"]. */
  tags: string[];
  commentary: string;
  reasoning?: string;
  alternative?: Alternative;
}

export interface Agent {
  id: string;
  name: string;
  model: string;
  provider: string;
  description: string;
  /** Two-letter monogram used for the abstract avatar. */
  initials: string;
  /** Tailwind-ish accent hue used for the avatar ring. */
  accent: string;
}

export interface Narrative {
  opening: string;
  firstTension: string;
  firstTensionPly: number;
  turningPoint: string;
  turningPointPly: number;
  criticalMistake?: string;
  criticalMistakePly?: number;
  finalSequence: string;
  finalSequencePly: number;
  summary: string;
}

export interface Match {
  id: string;
  slug: string;
  title: string;
  theme: string;
  status: MatchStatus;
  result: MatchResult;
  /** Human readable result, e.g. "1-0" or "White wins". */
  resultLabel: string;
  whiteAgentId: string;
  blackAgentId: string;
  opening: string;
  pgn: string;
  summary: string;
  createdAt: string;
  /** A short "why this match matters" blurb. */
  premise: string;
  moves: Move[];
  /** positions[0] = start FEN, positions[i] = FEN after move i. */
  positions: string[];
  /** Final evaluation for the summary banner. */
  finalEvaluation: Evaluation;
  narrative: Narrative;
  /** Number of plies. */
  moveCount: number;
}

export interface MatchSummary {
  slug: string;
  title: string;
  theme: string;
  status: MatchStatus;
  result: MatchResult;
  resultLabel: string;
  whiteAgentId: string;
  blackAgentId: string;
  opening: string;
  summary: string;
  createdAt: string;
  moveCount: number;
  finalEvaluation: Evaluation;
}

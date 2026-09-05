export type Side = "w" | "b";

export type MatchStatus = "live" | "completed";

export type MatchResult = "1-0" | "0-1" | "1/2-1/2" | "*";

export type MatchProvenance = "demo" | "verified-ai" | "live-fallback";

export interface MatchGeneration {
  provenance: MatchProvenance;
  label: string;
  description: string;
}

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

export type Language = "en" | "zh";

export type MoveImportance = 0 | 1 | 2 | 3 | 4 | 5;

export type NarrativeMomentType =
  | "opening"
  | "routine"
  | "tension"
  | "critical"
  | "sacrifice"
  | "turning-point"
  | "climax"
  | "conclusion";

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
  /** AI story narrative for this move. */
  commentary: string;
  reasoning?: string;
  alternative?: Alternative;
  /** Chinese narrative (generated when absent). */
  zhCommentary: string;
  zhReasoning?: string;
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
  /** AI player profile — playing style. */
  style: string;
  /** AI player profile — core strength. */
  strength: string;
  /** AI player profile — strategic signature. */
  strategy: string;
}

export interface NarrativeChapter {
  id: string;
  title: string;
  zhTitle: string;
  text: string;
  zhText: string;
  /** Ply this chapter points at (optional, e.g. Opening). */
  ply?: number;
}

/** A render-ready story beat tied to one exact board position. */
export interface NarrativeMoment {
  id: string;
  moveNumber: number;
  ply: number;
  fen: string;
  san: string;
  importance: MoveImportance;
  type: NarrativeMomentType;
  chapter: string;
  chapterTitle: string;
  zhChapterTitle: string;
  whatHappened: string;
  zhWhatHappened: string;
  whyItMatters: string;
  zhWhyItMatters: string;
  story: string;
  zhStory: string;
  evaluationBefore: Evaluation;
  evaluationAfter: Evaluation;
  bestMove?: string;
  alternative?: Alternative;
  isTurningPoint: boolean;
  isCritical: boolean;
}

export interface MatchStory {
  title: string;
  zhTitle: string;
  subtitle: string;
  zhSubtitle: string;
  opening: string;
  chapters: NarrativeChapter[];
  moments: NarrativeMoment[];
  climax: string;
  conclusion: string;
  summary: string;
  summaryZh: string;
}

export interface Match {
  id: string;
  slug: string;
  title: string;
  theme: string;
  /** e.g. "Simulation Match #001" */
  simulationNumber: string;
  status: MatchStatus;
  result: MatchResult;
  /** Human readable result, e.g. "1-0" or "White wins". */
  resultLabel: string;
  whiteAgentId: string;
  blackAgentId: string;
  opening: string;
  pgn: string;
  summary: string;
  summaryZh: string;
  createdAt: string;
  /** A short "why this match matters" blurb. */
  premise: string;
  generation: MatchGeneration;
  moves: Move[];
  /** positions[0] = start FEN, positions[i] = FEN after move i. */
  positions: string[];
  /** Final evaluation for the summary banner. */
  finalEvaluation: Evaluation;
  story: MatchStory;
  /** Number of plies. */
  moveCount: number;
}

export interface MatchSummary {
  slug: string;
  title: string;
  theme: string;
  simulationNumber: string;
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
  generation: MatchGeneration;
  storyTitle: string;
  storySubtitle: string;
}

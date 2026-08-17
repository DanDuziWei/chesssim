import type { MatchResult, MatchStatus } from "@/lib/types";
import type { EvalCheckpoint, MoveAnnotationInput } from "@/lib/build";

export interface ChapterSeed {
  id: string;
  title: string;
  zhTitle: string;
  text: string;
  zhText: string;
  /** Ply this chapter points at (optional, e.g. Opening). */
  ply?: number;
}

export interface NarrativeSeed {
  chapters: ChapterSeed[];
  summary: string;
  summaryZh: string;
}

export interface MatchSeed {
  slug: string;
  title: string;
  theme: string;
  simulationNumber: string;
  status: MatchStatus;
  result: MatchResult;
  whiteAgentId: string;
  blackAgentId: string;
  opening: string;
  premise: string;
  summary: string;
  summaryZh: string;
  createdAt: string;
  pgn: string;
  checkpoints: EvalCheckpoint[];
  annotations: Record<string, MoveAnnotationInput>;
  narrative: NarrativeSeed;
}

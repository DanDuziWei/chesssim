import type { MatchResult, MatchStatus } from "@/lib/types";
import type { EvalCheckpoint, MoveAnnotationInput } from "@/lib/build";

export interface NarrativeSeed {
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

export interface MatchSeed {
  slug: string;
  title: string;
  theme: string;
  status: MatchStatus;
  result: MatchResult;
  whiteAgentId: string;
  blackAgentId: string;
  opening: string;
  premise: string;
  summary: string;
  createdAt: string;
  pgn: string;
  checkpoints: EvalCheckpoint[];
  annotations: Record<string, MoveAnnotationInput>;
  narrative: NarrativeSeed;
}

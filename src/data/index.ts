import { expandPgn, resultLabel } from "@/lib/build";
import type { Match, MatchSummary } from "@/lib/types";
import { agents } from "./agents";
import { claudeVsQwen } from "./matches/claude-vs-qwen";
import { deepseekVsClaude } from "./matches/deepseek-vs-claude";
import { deepseekVsGpt } from "./matches/deepseek-vs-gpt";
import type { MatchSeed } from "./seed";

const seeds: MatchSeed[] = [deepseekVsGpt, claudeVsQwen, deepseekVsClaude];

function buildMatch(seed: MatchSeed): Match {
  const white = agents[seed.whiteAgentId];
  const black = agents[seed.blackAgentId];
  if (!white || !black) {
    throw new Error(`Unknown agent referenced in match "${seed.slug}"`);
  }

  const expanded = expandPgn(seed.pgn, {
    annotations: seed.annotations,
    checkpoints: seed.checkpoints,
    whiteName: white.name,
    blackName: black.name,
  });

  return {
    id: seed.slug,
    slug: seed.slug,
    title: seed.title,
    theme: seed.theme,
    simulationNumber: seed.simulationNumber,
    status: seed.status,
    result: seed.result,
    resultLabel: resultLabel(seed.result, white.name, black.name),
    whiteAgentId: seed.whiteAgentId,
    blackAgentId: seed.blackAgentId,
    opening: seed.opening,
    pgn: seed.pgn,
    summary: seed.summary,
    summaryZh: seed.summaryZh,
    createdAt: seed.createdAt,
    premise: seed.premise,
    moves: expanded.moves,
    positions: expanded.positions,
    finalEvaluation: expanded.finalEvaluation,
    narrative: {
      chapters: seed.narrative.chapters.map((c) => ({
        id: c.id,
        title: c.title,
        zhTitle: c.zhTitle,
        text: c.text,
        zhText: c.zhText,
        ply: c.ply,
      })),
      summary: seed.narrative.summary,
      summaryZh: seed.narrative.summaryZh,
    },
    moveCount: expanded.moveCount,
  };
}

export const matches: Match[] = seeds.map(buildMatch);

const matchBySlug: Record<string, Match> = Object.fromEntries(
  matches.map((m) => [m.slug, m])
);

export function getMatch(slug: string): Match | undefined {
  return matchBySlug[slug];
}

export function getAllMatches(): Match[] {
  return matches;
}

export function getFeaturedMatch(): Match {
  return matches[0];
}

export function getAgent(id: string) {
  return agents[id];
}

export function toMatchSummary(m: Match): MatchSummary {
  return {
    slug: m.slug,
    title: m.title,
    theme: m.theme,
    simulationNumber: m.simulationNumber,
    status: m.status,
    result: m.result,
    resultLabel: m.resultLabel,
    whiteAgentId: m.whiteAgentId,
    blackAgentId: m.blackAgentId,
    opening: m.opening,
    summary: m.summary,
    createdAt: m.createdAt,
    moveCount: m.moveCount,
    finalEvaluation: m.finalEvaluation,
  };
}

import type {
  Evaluation,
  MatchStory,
  Move,
  MoveImportance,
  NarrativeChapter,
  NarrativeMoment,
  NarrativeMomentType,
} from "./types";

function importanceFor(move: Move | undefined, chapter: NarrativeChapter, index: number): MoveImportance {
  if (!move) return 0;
  if (move.checkmate) return 5;
  if (chapter.id === "conclusion") return 5;
  if (chapter.id === "finale") return 4;
  if (move.tags.includes("turning-point")) return 4;
  if (move.tags.includes("sacrifice") || move.tags.includes("critical")) return 3;
  if (move.classification === "blunder" || move.classification === "brilliant") return 3;
  if (move.classification === "mistake") return 2;
  return index === 0 ? 0 : 2;
}

function momentType(
  move: Move | undefined,
  chapter: NarrativeChapter,
  importance: MoveImportance,
  index: number,
  chapterCount: number
): NarrativeMomentType {
  if (index === 0) return "opening";
  if (move?.checkmate || importance === 5) return "climax";
  if (move?.tags.includes("turning-point")) return "turning-point";
  if (move?.tags.includes("sacrifice")) return "sacrifice";
  if (index === chapterCount - 1) return "conclusion";
  if (importance >= 3) return "critical";
  return "tension";
}

function previousEvaluation(moves: Move[], ply: number): Evaluation {
  return ply > 1 ? moves[ply - 2].evaluation : { cp: 0 };
}

/**
 * Turns the authored chapter arc into 4–8 board-addressable story moments.
 * Routine moves remain available through Move commentary, but do not become
 * fake climaxes or extra chapters.
 */
export function buildMatchStory(params: {
  title?: string;
  zhTitle?: string;
  subtitle: string;
  zhSubtitle: string;
  opening: string;
  chapters: NarrativeChapter[];
  moves: Move[];
  positions: string[];
  summary: string;
  summaryZh: string;
}): MatchStory {
  const { chapters, moves, positions } = params;

  const moments: NarrativeMoment[] = chapters.map((chapter, index) => {
      const fallbackPly = index === 0 ? 0 : moves.length;
      const ply = Math.max(0, Math.min(moves.length, chapter.ply ?? fallbackPly));
      const move = ply > 0 ? moves[ply - 1] : undefined;
      const importance = importanceFor(move, chapter, index);
      const type = momentType(move, chapter, importance, index, chapters.length);
      const whatHappened = move?.commentary ?? params.opening;
      const zhWhatHappened = move?.zhCommentary ?? params.opening;
      const whyItMatters = move?.reasoning ?? chapter.text;
      const zhWhyItMatters = move?.zhReasoning ?? chapter.zhText;

      return {
        id: chapter.id,
        moveNumber: move?.moveNumber ?? 0,
        ply,
        fen: positions[ply] ?? positions[0],
        san: move?.san ?? "Start",
        importance,
        type,
        chapter: chapter.id,
        chapterTitle: chapter.title,
        zhChapterTitle: chapter.zhTitle,
        whatHappened,
        zhWhatHappened,
        whyItMatters,
        zhWhyItMatters,
        story: chapter.text,
        zhStory: chapter.zhText,
        evaluationBefore: previousEvaluation(moves, ply),
        evaluationAfter: move?.evaluation ?? { cp: 0 },
        bestMove: move?.alternative?.san,
        alternative: move?.alternative,
        isTurningPoint: type === "turning-point",
        isCritical: importance >= 3,
      };
    });

  const climaxMoment = [...moments].reverse().find((moment) => moment.importance >= 4) ?? moments.at(-1);
  const conclusionChapter = chapters.at(-1);

  return {
    title: params.title ?? climaxMoment?.chapterTitle ?? "The match",
    zhTitle: params.zhTitle ?? climaxMoment?.zhChapterTitle ?? "这盘棋的故事",
    subtitle: params.subtitle,
    zhSubtitle: params.zhSubtitle,
    opening: params.opening,
    chapters,
    moments,
    climax: climaxMoment?.story ?? params.summary,
    conclusion: conclusionChapter?.text ?? params.summary,
    summary: params.summary,
    summaryZh: params.summaryZh,
  };
}

export function importanceForMove(move: Move): MoveImportance {
  if (move.checkmate) return 5;
  if (move.tags.includes("turning-point")) return 4;
  if (move.tags.includes("sacrifice") || move.tags.includes("critical")) return 3;
  if (move.classification === "blunder" || move.classification === "brilliant") return 3;
  if (move.classification === "mistake") return 2;
  if (move.classification === "inaccuracy") return 1;
  return 0;
}

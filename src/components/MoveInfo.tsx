import type {
  Agent,
  Classification,
  Evaluation,
  Language,
  MatchStory,
  Move,
  MoveImportance,
} from "@/lib/types";
import { betterSide, formatEval } from "@/lib/eval";
import { CLASSIFICATION_META } from "@/lib/classify";
import { importanceForMove } from "@/lib/narrative";
import type { EngineAnalysis } from "@/lib/stockfish";
import { AgentAvatar } from "./AgentAvatar";
import { ClassificationBadge, TagChip } from "./Badge";

interface MoveInfoProps {
  move: Move | null;
  whiteAgent: Agent;
  blackAgent: Agent;
  opening: string;
  premise: string;
  lang: Language;
  /** Real Stockfish result after the current move. */
  engineAnalysis: EngineAnalysis | null;
  /** Real Stockfish result before the current move, used for best-move truth. */
  engineAnalysisBefore: EngineAnalysis | null;
  engineStatus: "idle" | "loading" | "ready" | "error";
  bestMoveSan: string | null;
  effectiveClassification?: Classification;
  story: MatchStory;
  currentPly: number;
  onJump: (ply: number) => void;
}

function verdictText(
  e: Evaluation,
  whiteName: string,
  blackName: string,
  lang: Language
): string {
  if (e.mate != null) {
    return e.mate > 0
      ? lang === "zh"
        ? `${whiteName} 有强制杀棋`
        : `${whiteName} has a forced mate`
      : lang === "zh"
        ? `${blackName} 有强制杀棋`
        : `${blackName} has a forced mate`;
  }
  const side = betterSide(e);
  if (side === "w") return lang === "zh" ? `${whiteName} 占优` : `${whiteName} is better`;
  if (side === "b") return lang === "zh" ? `${blackName} 占优` : `${blackName} is better`;
  return lang === "zh" ? "局面均势" : "The position is balanced";
}

const IMPORTANCE_LABELS: Record<MoveImportance, { en: string; zh: string }> = {
  0: { en: "Routine move", zh: "常规着法" },
  1: { en: "Interesting move", zh: "值得留意" },
  2: { en: "Important move", zh: "重要着法" },
  3: { en: "Critical moment", zh: "关键时刻" },
  4: { en: "Turning point", zh: "转折点" },
  5: { en: "Climax", zh: "高潮" },
};

export function MoveInfo({
  move,
  whiteAgent,
  blackAgent,
  opening,
  premise,
  lang,
  engineAnalysis,
  engineAnalysisBefore,
  engineStatus,
  bestMoveSan,
  effectiveClassification,
  story,
  currentPly,
  onJump,
}: MoveInfoProps) {
  const zh = lang === "zh";
  const moments = story.moments;
  let activeMomentIndex = 0;
  moments.forEach((moment, index) => {
    if (moment.ply <= currentPly) activeMomentIndex = index;
  });
  const activeMoment = moments[activeMomentIndex];
  const exactMoment = moments.find((moment) => moment.ply === currentPly);
  const chapterIndex = Math.max(
    0,
    story.chapters.findIndex((chapter) => chapter.id === activeMoment?.chapter)
  );
  const chapterTitle = zh ? activeMoment?.zhChapterTitle : activeMoment?.chapterTitle;

  const mover = move ? (move.color === "w" ? whiteAgent : blackAgent) : null;
  const classification = effectiveClassification ?? move?.classification;
  const importance = exactMoment?.importance ??
    (move
      ? importanceForMove({ ...move, classification: classification ?? move.classification })
      : 0);
  const importanceLabel = IMPORTANCE_LABELS[importance][zh ? "zh" : "en"];

  const whatHappened = move
    ? zh
      ? move.zhCommentary
      : move.commentary
    : zh
      ? activeMoment?.zhWhatHappened ?? premise
      : activeMoment?.whatHappened ?? premise;
  const whyItMatters = exactMoment
    ? zh
      ? exactMoment.zhWhyItMatters
      : exactMoment.whyItMatters
    : move
      ? zh
        ? move.zhReasoning ?? move.reasoning
        : move.reasoning
      : premise;
  const storyBeat = zh ? activeMoment?.zhStory : activeMoment?.story;

  const engineEval = engineAnalysis
    ? {
        cp: engineAnalysis.cp ?? 0,
        ...(engineAnalysis.mate != null ? { mate: engineAnalysis.mate } : {}),
      }
    : null;
  const engineBusy = engineStatus === "loading" && !engineEval;
  const engineUnavailable = engineStatus === "idle" || engineStatus === "error";
  const playedIsBest =
    move && engineAnalysisBefore?.bestMove
      ? move.from + move.to + (move.promotion ?? "") === engineAnalysisBefore.bestMove
      : null;
  const meta = classification ? CLASSIFICATION_META[classification] : null;
  const winner = move?.checkmate
    ? move.color === "w"
      ? whiteAgent.name
      : blackAgent.name
    : null;

  const previousMoment = moments[activeMomentIndex - 1];
  const nextMoment = moments[activeMomentIndex + 1];

  return (
    <aside
      className="card overflow-hidden lg:sticky lg:top-20"
      aria-label={zh ? "当前棋局故事" : "Current match story"}
    >
      <div className="border-b border-line bg-paper/70 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">
              {zh ? `第 ${chapterIndex + 1} 章` : `Chapter ${toRoman(chapterIndex + 1)}`}
            </p>
            <h2 className="mt-1 text-balance font-display text-2xl font-semibold tracking-tight">
              {chapterTitle ?? (zh ? "开局" : opening)}
            </h2>
          </div>
          <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {importanceLabel}
          </span>
        </div>

        <div className="mt-4 flex gap-1.5" aria-label={zh ? "故事节点" : "Story moments"}>
          {moments.map((moment, index) => (
            <button
              key={moment.id}
              onClick={() => onJump(moment.ply)}
              aria-label={`${zh ? "跳到" : "Go to"} ${zh ? moment.zhChapterTitle : moment.chapterTitle}`}
              title={zh ? moment.zhChapterTitle : moment.chapterTitle}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index === activeMomentIndex
                  ? "bg-bronze"
                  : index < activeMomentIndex
                    ? "bg-bronze/35"
                    : "bg-lineStrong"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-5 sm:px-6">
        {move && mover ? (
          <div className="flex items-center gap-3 border-b border-line py-4">
            <AgentAvatar agent={mover} size="md" />
            <div className="min-w-0">
              <p className="eyebrow">
                {zh ? "第" : "Move"} {move.moveNumber}{move.color === "b" ? "…" : ""}
              </p>
              <p className="font-display text-2xl font-semibold">
                {move.san}
                {meta?.glyph ? <span className="ml-1" style={{ color: meta.fg }}>{meta.glyph}</span> : null}
              </p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1.5">
              {classification && <ClassificationBadge classification={classification} />}
              {move.tags.map((tag) => <TagChip key={tag} tag={tag} />)}
            </div>
          </div>
        ) : (
          <div className="border-b border-line py-4">
            <p className="eyebrow">{zh ? "开局局面" : "Starting position"}</p>
            <p className="mt-1 font-display text-xl font-semibold">{opening}</p>
          </div>
        )}

        {winner && (
          <p className="border-b border-line py-3 text-sm font-semibold text-bronze">
            {zh ? `将杀——${winner} 获胜` : `Checkmate — ${winner} wins`}
          </p>
        )}

        <StoryLayer label={zh ? "发生了什么" : "What happened"} text={whatHappened} />

        {importance > 0 && whyItMatters ? (
          <StoryLayer
            label={zh ? "为什么重要" : "Why it matters"}
            text={whyItMatters}
            muted
          />
        ) : null}

        {storyBeat ? (
          <div className="border-b border-line py-4">
            <p className="eyebrow mb-2">{zh ? "故事" : "The story"}</p>
            <blockquote className="border-l-2 border-bronze/60 pl-3 font-display text-[17px] leading-relaxed text-ink">
              {storyBeat}
            </blockquote>
          </div>
        ) : null}

        {move && (
          <div className="border-b border-line py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow">{zh ? "棋力真值 · Stockfish" : "Chess truth · Stockfish"}</p>
              {engineEval && (
                <span className="text-lg font-semibold tabular-nums text-ink">
                  {move.checkmate ? (zh ? "将杀" : "Checkmate") : formatEval(engineEval)}
                  {engineAnalysis?.mate === null && (
                    <span className="ml-1 text-xs font-medium text-faint">d{engineAnalysis.depth}</span>
                  )}
                </span>
              )}
            </div>

            {engineBusy && (
              <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-muted">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bronze" />
                {zh ? "Stockfish 正在思考…" : "Stockfish is thinking…"}
              </p>
            )}
            {engineUnavailable && !engineBusy && (
              <p className="mt-1.5 text-sm text-muted">
                {zh ? "Stockfish 引擎尚未可用。" : "Stockfish is not available yet."}
              </p>
            )}
            {engineEval && (
              <div className="mt-1.5 space-y-1 text-sm text-muted">
                <p>{verdictText(engineEval, whiteAgent.name, blackAgent.name, lang)}</p>
                {bestMoveSan && (
                  <p>
                    {zh ? "走子前的引擎首选：" : "Engine choice before the move:"}{" "}
                    <span className="font-semibold text-ink">{bestMoveSan}</span>
                  </p>
                )}
                {playedIsBest === true && (
                  <p className="font-medium text-[#2F7D4F]">
                    {zh ? `${move.san} 与引擎首选一致。` : `${move.san} matches the engine's top choice.`}
                  </p>
                )}
                {playedIsBest === false && bestMoveSan && (
                  <p className="font-medium text-[#9A6B1F]">
                    {zh
                      ? `实战选择 ${move.san}；引擎更偏好 ${bestMoveSan}。`
                      : `The game chose ${move.san}; the engine preferred ${bestMoveSan}.`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {move?.alternative && (
          <div className="border-b border-line py-4">
            <p className="eyebrow mb-2">{zh ? "编辑备选着法" : "Editorial alternative"}</p>
            <p className="text-sm text-muted">
              <span className="font-semibold text-ink">{move.alternative.san}</span>
              {move.alternative.note ? ` — ${move.alternative.note}` : ""}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 py-4">
          <button
            onClick={() => previousMoment && onJump(previousMoment.ply)}
            disabled={!previousMoment}
            className="text-xs font-semibold text-muted transition-colors hover:text-bronze disabled:opacity-30"
          >
            ← {zh ? "上一节" : "Previous moment"}
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-faint">
            {activeMomentIndex + 1} / {moments.length}
          </span>
          <button
            onClick={() => nextMoment && onJump(nextMoment.ply)}
            disabled={!nextMoment}
            className="text-xs font-semibold text-muted transition-colors hover:text-bronze disabled:opacity-30"
          >
            {zh ? "继续故事" : "Continue story"} →
          </button>
        </div>
      </div>
    </aside>
  );
}

function StoryLayer({ label, text, muted = false }: { label: string; text: string; muted?: boolean }) {
  return (
    <div className="border-b border-line py-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className={`text-sm leading-relaxed ${muted ? "text-muted" : "text-ink"}`}>{text}</p>
    </div>
  );
}

function toRoman(value: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][value - 1] ?? String(value);
}

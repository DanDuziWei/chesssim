import type { Agent, Evaluation, Language, Move } from "@/lib/types";
import { betterSide, formatEval } from "@/lib/eval";
import { CLASSIFICATION_META } from "@/lib/classify";
import { describeSwing } from "@/lib/chess-ui";
import type { EngineAnalysis } from "@/lib/stockfish";
import { AgentAvatar } from "./AgentAvatar";
import { ClassificationBadge, TagChip } from "./Badge";

interface MoveInfoProps {
  move: Move | null;
  prevEvaluation: Evaluation | null;
  whiteAgent: Agent;
  blackAgent: Agent;
  opening: string;
  premise: string;
  lang: Language;
  /** Real Stockfish analysis of the CURRENT position (may be in-flight). */
  engineAnalysis: EngineAnalysis | null;
  engineStatus: "idle" | "loading" | "ready" | "error";
  /** Engine best move in SAN, when derivable. */
  bestMoveSan: string | null;
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
  if (side === "w")
    return lang === "zh" ? `${whiteName} 占优` : `${whiteName} is better`;
  if (side === "b")
    return lang === "zh" ? `${blackName} 占优` : `${blackName} is better`;
  return lang === "zh" ? "局面均势" : "The position is balanced";
}

export function MoveInfo({
  move,
  prevEvaluation,
  whiteAgent,
  blackAgent,
  opening,
  premise,
  lang,
  engineAnalysis,
  engineStatus,
  bestMoveSan,
}: MoveInfoProps) {
  const zh = lang === "zh";

  if (!move) {
    return (
      <aside className="card flex h-full flex-col justify-between p-6">
        <div>
          <p className="eyebrow">{zh ? "开局局面" : "Starting Position"}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">{opening}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{premise}</p>
        </div>
        <div className="mt-6 rounded-lg border border-line bg-paper px-4 py-3 text-sm text-muted">
          {zh ? (
            <>
              点击 <span className="font-semibold text-ink">播放</span> 观看对局展开，
              或用 <span className="font-semibold text-ink">←</span> /{" "}
              <span className="font-semibold text-ink">→</span> 逐步复盘。
            </>
          ) : (
            <>
              Press <span className="font-semibold text-ink">play</span> to watch the
              match unfold, or use <span className="font-semibold text-ink">←</span> /{" "}
              <span className="font-semibold text-ink">→</span> to step through the moves.
            </>
          )}
        </div>
      </aside>
    );
  }

  const mover = move.color === "w" ? whiteAgent : blackAgent;
  const meta = CLASSIFICATION_META[move.classification];
  const winner = move.checkmate
    ? move.color === "w"
      ? whiteAgent.name
      : blackAgent.name
    : null;

  const story = zh ? move.zhCommentary : move.commentary;
  const reasoning = zh ? (move.zhReasoning ?? move.reasoning) : move.reasoning;

  /* engine block */
  const engineBusy = engineStatus === "loading";
  const engineUnavailable = engineStatus === "idle" || engineStatus === "error";
  const engineEval = engineAnalysis
    ? {
        cp: engineAnalysis.cp ?? 0,
        ...(engineAnalysis.mate != null ? { mate: engineAnalysis.mate } : {}),
      }
    : null;
  const playedIsBest =
    engineAnalysis && bestMoveSan
      ? move.from + move.to + (move.promotion ?? "") === engineAnalysis.bestMove
      : null;

  return (
    <aside className="card flex flex-col p-6">
      {/* Move header */}
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="eyebrow">
            {zh ? "第" : "Move"} {move.moveNumber}
            {move.color === "b" ? "…" : ""} {zh ? "步" : ""}
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {move.san}
            {meta.glyph && (
              <span className="ml-1" style={{ color: meta.fg }}>
                {meta.glyph}
              </span>
            )}
          </h2>
          {winner && (
            <p className="mt-1 text-sm font-semibold text-bronze">
              {zh ? `将杀 —— ${winner} 获胜` : `Checkmate — ${winner} wins`}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {move.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
      </div>

      {/* Who played */}
      <div className="flex items-center gap-3 border-b border-line py-4">
        <AgentAvatar agent={mover} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{mover.name}</p>
          <p className="truncate text-xs text-muted">
            {mover.model} · {mover.provider}
          </p>
        </div>
        <div className="ml-auto">
          <ClassificationBadge classification={move.classification} />
        </div>
      </div>

      {/* AI Match Story */}
      <div className="border-b border-line py-4">
        <p className="eyebrow mb-2">{zh ? "AI 棋局故事" : "AI Match Story"}</p>
        <blockquote className="border-l-2 border-bronze/60 pl-3 text-[15px] leading-relaxed text-ink">
          {story}
        </blockquote>
      </div>

      {/* Why this move matters */}
      <div className="border-b border-line py-4">
        <p className="eyebrow mb-2">{zh ? "为什么这步棋重要" : "Why this move matters"}</p>
        <p className="text-sm leading-relaxed text-muted">
          {reasoning ??
            (prevEvaluation
              ? describeSwing(
                  prevEvaluation,
                  move.evaluation,
                  move.color,
                  whiteAgent.name,
                  blackAgent.name
                )
              : story)}
        </p>
      </div>

      {/* Engine Analysis (real Stockfish) */}
      <div className="border-b border-line py-4">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">{zh ? "引擎分析 · Stockfish" : "Engine Analysis · Stockfish"}</p>
          {engineEval && (
            <span className="text-lg font-semibold tabular-nums text-ink">
              {move.checkmate ? (zh ? "将杀" : "Checkmate") : formatEval(engineEval)}
              {engineAnalysis && engineAnalysis.mate === null && (
                <span className="ml-1 text-xs font-medium text-faint">
                  d{engineAnalysis.depth}
                </span>
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
            {zh
              ? "Stockfish 引擎未加载——点击棋盘下方的“引擎分析”进行整局分析。"
              : "Stockfish is not loaded — run the full-game analysis to see engine truth here."}
          </p>
        )}

        {engineEval && !engineBusy && (
          <div className="mt-1.5 space-y-1 text-sm text-muted">
            <p>{verdictText(engineEval, whiteAgent.name, blackAgent.name, lang)}</p>
            {bestMoveSan && (
              <p>
                {zh ? "最佳着法：" : "Best move:"}{" "}
                <span className="font-semibold text-ink">{bestMoveSan}</span>
              </p>
            )}
            {playedIsBest === true && (
              <p className="font-medium text-[#2F7D4F]">
                {zh
                  ? `${move.san} 正是引擎的首选着法。`
                  : `${move.san} is exactly the engine's top choice.`}
              </p>
            )}
            {playedIsBest === false && bestMoveSan && (
              <p className="font-medium text-[#9A6B1F]">
                {zh
                  ? `实战选择了 ${move.san}，而引擎更偏好 ${bestMoveSan}。`
                  : `The game move ${move.san} was played; the engine preferred ${bestMoveSan}.`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Alternative */}
      {move.alternative && (
        <div className="py-4">
          <p className="eyebrow mb-2">{zh ? "引擎建议" : "Stockfish Suggests"}</p>
          <div className="rounded-lg border border-line bg-paper px-4 py-3">
            <p className="text-sm font-semibold">
              {move.alternative.san}{" "}
              <span className="ml-1 tabular-nums text-bronze">
                {formatEval(move.alternative.evaluation)}
              </span>
            </p>
            {move.alternative.note && (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {move.alternative.note}
              </p>
            )}
            {move.alternative.from && move.alternative.to && (
              <p className="mt-1 text-[11px] uppercase tracking-wider text-faint">
                {zh ? "棋盘上以箭头显示" : "Shown as an arrow on the board"}
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

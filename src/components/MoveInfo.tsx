import type { Agent, Evaluation, Move } from "@/lib/types";
import { betterSide, formatEval } from "@/lib/eval";
import { CLASSIFICATION_META } from "@/lib/classify";
import { describeSwing } from "@/lib/chess-ui";
import { AgentAvatar } from "./AgentAvatar";
import { ClassificationBadge, TagChip } from "./Badge";

interface MoveInfoProps {
  move: Move | null;
  prevEvaluation: Evaluation | null;
  whiteAgent: Agent;
  blackAgent: Agent;
  opening: string;
  premise: string;
}

function verdictText(e: Evaluation, whiteName: string, blackName: string): string {
  if (e.mate != null) {
    return e.mate > 0 ? `${whiteName} has a forced mate` : `${blackName} has a forced mate`;
  }
  const side = betterSide(e);
  if (side === "w") return `${whiteName} is better`;
  if (side === "b") return `${blackName} is better`;
  return "The position is balanced";
}

export function MoveInfo({
  move,
  prevEvaluation,
  whiteAgent,
  blackAgent,
  opening,
  premise,
}: MoveInfoProps) {
  if (!move) {
    return (
      <aside className="card flex h-full flex-col justify-between p-6">
        <div>
          <p className="eyebrow">Starting Position</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">{opening}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{premise}</p>
        </div>
        <div className="mt-6 rounded-lg border border-line bg-paper px-4 py-3 text-sm text-muted">
          Press <span className="font-semibold text-ink">play</span> to watch the
          match unfold, or use <span className="font-semibold text-ink">←</span> /{" "}
          <span className="font-semibold text-ink">→</span> to step through the moves.
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

  return (
    <aside className="card flex flex-col p-6">
      {/* Move header */}
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="eyebrow">
            Move {move.moveNumber}
            {move.color === "b" ? "…" : ""}
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {move.san}
            {meta.glyph && <span className="ml-1" style={{ color: meta.fg }}>{meta.glyph}</span>}
          </h2>
          {winner && (
            <p className="mt-1 text-sm font-semibold text-bronze">
              Checkmate — {winner} wins
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

      {/* AI Commentary */}
      <div className="border-b border-line py-4">
        <p className="eyebrow mb-2">AI Commentary</p>
        <blockquote className="border-l-2 border-bronze/60 pl-3 text-[15px] leading-relaxed text-ink">
          {move.commentary}
        </blockquote>
      </div>

      {/* Engine evaluation */}
      <div className="border-b border-line py-4">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Engine Evaluation</p>
          <span className="text-lg font-semibold tabular-nums text-ink">
            {move.checkmate ? "Checkmate" : formatEval(move.evaluation)}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          {move.checkmate
            ? `The game ends here.`
            : verdictText(move.evaluation, whiteAgent.name, blackAgent.name)}
        </p>
      </div>

      {/* Why this matters */}
      <div className="border-b border-line py-4">
        <p className="eyebrow mb-2">Why this matters</p>
        <p className="text-sm leading-relaxed text-muted">
          {move.reasoning ??
            (prevEvaluation
              ? describeSwing(
                  prevEvaluation,
                  move.evaluation,
                  move.color,
                  whiteAgent.name,
                  blackAgent.name
                )
              : move.commentary)}
        </p>
      </div>

      {/* Alternative */}
      {move.alternative && (
        <div className="py-4">
          <p className="eyebrow mb-2">Stockfish Suggests</p>
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
                Shown as an arrow on the board
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

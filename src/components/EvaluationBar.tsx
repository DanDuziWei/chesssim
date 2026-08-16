import type { Evaluation } from "@/lib/types";
import { evalToWinProb, formatEval } from "@/lib/eval";

interface EvaluationBarProps {
  evaluation: Evaluation;
  className?: string;
  /** Hide the numeric label (used inside tight layouts). */
  showLabel?: boolean;
}

/**
 * Vertical evaluation bar, lichess-style: white share rises from the bottom.
 * Height is driven by the parent (use flex items-stretch next to the board).
 */
export function EvaluationBar({
  evaluation,
  className = "",
  showLabel = true,
}: EvaluationBarProps) {
  const whitePct = Math.round(evalToWinProb(evaluation) * 100);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {showLabel && (
        <span
          className={`text-xs font-semibold tabular-nums ${
            evaluation.mate != null ? "text-bronze" : "text-ink"
          }`}
        >
          {formatEval(evaluation)}
        </span>
      )}
      <div className="relative min-h-24 w-3.5 flex-1 overflow-hidden rounded-full border border-lineStrong bg-[#322C23]">
        <div
          className="absolute bottom-0 left-0 right-0 bg-surface transition-[height] duration-500 ease-out"
          style={{ height: `${whitePct}%` }}
        />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[#322C23]/70" />
      </div>
    </div>
  );
}

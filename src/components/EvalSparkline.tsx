import type { Evaluation, Move } from "@/lib/types";
import { clamp, evalToWinProb } from "@/lib/eval";

interface EvalSparklineProps {
  moves: Move[];
  currentPly: number; // 0..moves.length
  onSelect?: (ply: number) => void;
  /** Real engine evaluations (may be partial); index i = after ply i+1. */
  realEvals?: (Evaluation | undefined)[];
}

/**
 * A small SVG sparkline of White's win probability across the whole game,
 * with a marker for the current ply. Click to jump. Prefers real engine
 * evaluations when available and falls back to the curated curve.
 */
export function EvalSparkline({ moves, currentPly, onSelect, realEvals }: EvalSparklineProps) {
  const W = 480;
  const H = 56;
  const PAD = 4;

  const evals = moves.map((m, i) => realEvals?.[i] ?? m.evaluation);
  const points: [number, number][] = evals.map((e, i) => {
    const x = PAD + (i / Math.max(1, evals.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - clamp(evalToWinProb(e), 0, 1)) * (H - PAD * 2);
    return [x, y];
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const markerX = currentPly > 0 && points.length > 0
    ? points[Math.min(currentPly - 1, points.length - 1)][0]
    : PAD;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-14 w-full"
        role="img"
        aria-label="Evaluation across the game"
      >
        {/* center line */}
        <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} stroke="#D7CFBF" strokeWidth="1" strokeDasharray="3 4" />
        {/* area fill */}
        <path d={`${path} L${W - PAD},${H / 2} L${PAD},${H / 2} Z`} fill="#8A6A3B14" stroke="none" />
        {/* curve */}
        <path d={path} fill="none" stroke="#8A6A3B" strokeWidth="1.5" strokeLinejoin="round" />
        {points.length > 0 && (
          <circle cx={markerX} cy={points[Math.min(Math.max(currentPly - 1, 0), points.length - 1)][1]} r="3.5" fill="#17140F" />
        )}
      </svg>
      {/* invisible click targets per ply */}
      {onSelect &&
        points.map(([x], i) => (
          <button
            key={i}
            aria-label={`Jump to move ${i + 1}`}
            className="absolute top-0 h-full cursor-pointer"
            style={{ left: `${(x / W) * 100}%`, width: `${W / Math.max(1, points.length) / W * 100}%` }}
            onClick={() => onSelect(i + 1)}
          />
        ))}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between text-[10px] font-medium uppercase tracking-wider text-faint">
        <span>White</span>
        <span>Black</span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { Classification, Evaluation, Language, Move } from "@/lib/types";
import { CLASSIFICATION_META } from "@/lib/classify";
import { TAG_COLORS } from "./Badge";
import { EvalSparkline } from "./EvalSparkline";

interface MoveTimelineProps {
  moves: Move[];
  ply: number;
  onSelect: (ply: number) => void;
  lang: Language;
  /** Real-engine classification overrides; index i = after ply i+1. */
  engineClassifications?: (Classification | undefined)[];
  /** Real engine evals for the sparkline (partial). */
  realEvals?: (Evaluation | undefined)[];
  /** Full-game analysis progress, when a sweep is running. */
  analysisProgress?: { done: number; total: number } | null;
}

function MoveCell({
  move,
  isActive,
  onSelect,
  classificationOverride,
}: {
  move?: Move;
  isActive: boolean;
  onSelect: (ply: number) => void;
  classificationOverride?: Classification;
}) {
  if (!move) {
    return <span className="px-3 py-1.5 text-sm text-faint">…</span>;
  }
  const classification = classificationOverride ?? move.classification;
  const meta = CLASSIFICATION_META[classification];
  const significant =
    classification !== "good" && classification !== "book" && classification !== "best";
  const tagColor = move.tags[0] ? TAG_COLORS[move.tags[0]] : undefined;
  const fromEngine = classificationOverride != null;

  return (
    <button
      onClick={() => onSelect(move.ply)}
      className={`flex w-full items-center justify-between gap-1 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
        isActive ? "bg-ink text-paper" : "text-ink hover:bg-line/50"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={`font-medium tabular-nums ${significant ? "font-semibold" : ""}`}
          style={significant && !isActive ? { color: meta.fg } : undefined}
        >
          {move.san}
        </span>
        {meta.glyph && (
          <span className="text-xs" style={{ color: isActive ? "#F6F4EF" : meta.fg }}>
            {meta.glyph}
          </span>
        )}
      </span>
      <span className="flex items-center gap-1">
        {fromEngine && (
          <span
            className="text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: isActive ? "#D7CFBF" : "#9B9386" }}
            title="Classified by Stockfish"
          >
            SF
          </span>
        )}
        {tagColor && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: isActive ? "#F6F4EF" : tagColor }}
          />
        )}
      </span>
    </button>
  );
}

export function MoveTimeline({
  moves,
  ply,
  onSelect,
  lang,
  engineClassifications,
  realEvals,
  analysisProgress,
}: MoveTimelineProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    const el = buttons[ply];
    if (!el) return;
    const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [ply]);

  const rows: { w?: Move; b?: Move }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({ w: moves[i], b: moves[i + 1] });
  }

  const t = {
    timeline: lang === "zh" ? "时间轴" : "Timeline",
    plies: lang === "zh" ? "着法" : "plies",
    jump: lang === "zh" ? "点击着法跳转" : "click a move to jump",
    start: lang === "zh" ? "开局局面" : "Start position",
    analyzing: lang === "zh" ? "引擎分析中" : "Stockfish analyzing",
  };

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 pb-3 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">{t.timeline}</p>
          <div className="flex items-center gap-3 text-xs text-faint">
            {analysisProgress ? (
              <span className="inline-flex items-center gap-1.5 text-bronze">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bronze" />
                {t.analyzing} {analysisProgress.done}/{analysisProgress.total}
              </span>
            ) : (
              <span>
                {moves.length} {t.plies} · {t.jump}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3">
          <EvalSparkline moves={moves} currentPly={ply} onSelect={onSelect} realEvals={realEvals} />
        </div>
      </div>

      <div
        ref={listRef}
        className="chesssim-scroll relative max-h-72 overflow-y-auto px-3 py-2"
      >
        <button
          onClick={() => onSelect(0)}
          className={`mb-1 flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors ${
            ply === 0 ? "bg-ink text-paper" : "text-muted hover:bg-line/50 hover:text-ink"
          }`}
        >
          {t.start}
        </button>

        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[2.75rem_1fr_1fr] items-center gap-1 py-0.5"
          >
            <span className="pl-2 text-xs tabular-nums text-faint">{i + 1}.</span>
            <MoveCell
              move={row.w}
              isActive={row.w?.ply === ply}
              onSelect={onSelect}
              classificationOverride={row.w ? engineClassifications?.[row.w.ply - 1] : undefined}
            />
            <MoveCell
              move={row.b}
              isActive={row.b?.ply === ply}
              onSelect={onSelect}
              classificationOverride={row.b ? engineClassifications?.[row.b.ply - 1] : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

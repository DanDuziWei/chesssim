"use client";

import { useEffect, useRef } from "react";
import type { Move } from "@/lib/types";
import { CLASSIFICATION_META } from "@/lib/classify";
import { TAG_COLORS } from "./Badge";
import { EvalSparkline } from "./EvalSparkline";

interface MoveTimelineProps {
  moves: Move[];
  ply: number;
  onSelect: (ply: number) => void;
}

function MoveCell({
  move,
  isActive,
  onSelect,
}: {
  move?: Move;
  isActive: boolean;
  onSelect: (ply: number) => void;
}) {
  if (!move) {
    return <span className="px-3 py-1.5 text-sm text-faint">…</span>;
  }
  const meta = CLASSIFICATION_META[move.classification];
  const significant =
    move.classification !== "good" &&
    move.classification !== "book" &&
    move.classification !== "best";
  const tagColor = move.tags[0] ? TAG_COLORS[move.tags[0]] : undefined;

  return (
    <button
      onClick={() => onSelect(move.ply)}
      className={`flex w-full items-center justify-between gap-1 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
        isActive
          ? "bg-ink text-paper"
          : "text-ink hover:bg-line/50"
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
          <span
            className="text-xs"
            style={{ color: isActive ? "#F6F4EF" : meta.fg }}
          >
            {meta.glyph}
          </span>
        )}
      </span>
      {tagColor && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: isActive ? "#F6F4EF" : tagColor }}
        />
      )}
    </button>
  );
}

export function MoveTimeline({ moves, ply, onSelect }: MoveTimelineProps) {
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

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 pb-3 pt-4">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Timeline</p>
          <p className="text-xs text-faint">
            {moves.length} plies · click a move to jump
          </p>
        </div>
        <div className="mt-3">
          <EvalSparkline moves={moves} currentPly={ply} onSelect={onSelect} />
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
          Start position
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
            />
            <MoveCell
              move={row.b}
              isActive={row.b?.ply === ply}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

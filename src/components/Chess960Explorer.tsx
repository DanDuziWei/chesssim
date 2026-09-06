"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getChess960Position,
  randomChess960Position,
} from "@/lib/chess960";

const Chessboard = dynamic(
  () => import("react-chessboard").then((module) => module.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-xl bg-line/70" />
    ),
  }
);

export function Chess960Explorer() {
  // A stable first render avoids a server/client mismatch; Shuffle is random.
  const [number, setNumber] = useState(314);
  const position = useMemo(() => getChess960Position(number), [number]);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="card p-4 sm:p-6">
        <Chessboard
          id="chess960-preview-board"
          position={position.fen}
          arePiecesDraggable={false}
          areArrowsAllowed={false}
          animationDuration={220}
          customBoardStyle={{ borderRadius: "10px", overflow: "hidden" }}
          customDarkSquareStyle={{ backgroundColor: "#8E7B5C" }}
          customLightSquareStyle={{ backgroundColor: "#EBE1CB" }}
          customNotationStyle={{ fontSize: "10px", fontWeight: 600, opacity: 0.85 }}
        />
      </div>

      <aside className="card p-6 sm:p-7">
        <p className="eyebrow">Starting position</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl font-semibold">{position.label}</p>
            <p className="mt-1 font-mono text-xs tracking-[0.18em] text-muted">
              {position.backRank}
            </p>
          </div>
          <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
            0–959
          </span>
        </div>

        <button
          type="button"
          onClick={() => setNumber(randomChess960Position().number)}
          className="mt-6 w-full rounded-full border border-lineStrong bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-bronze hover:text-bronze"
        >
          Shuffle a new position
        </button>
        <Link
          href={`/arena?variant=chess960&position=${number}`}
          className="mt-3 block w-full rounded-full bg-ink px-5 py-2.5 text-center text-sm font-semibold text-paper transition-colors hover:bg-bronze"
        >
          Simulate this position →
        </Link>

        <div className="mt-7 border-t border-line pt-6">
          <p className="text-sm font-semibold">What stays the same?</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Pawns, move rules and the goal of checkmate are unchanged. Bishops
            start on opposite colours, and the king always begins between the
            two rooks.
          </p>
          <p className="mt-4 text-sm font-semibold">What changes?</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The back rank is one of 960 legal arrangements. Castling remains
            legal and ends with the king and rook on their familiar castled
            squares, even when they started elsewhere.
          </p>
        </div>
      </aside>
    </div>
  );
}

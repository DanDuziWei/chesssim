"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Arrow } from "react-chessboard/dist/chessboard/types";
import type { Agent, Evaluation, Match } from "@/lib/types";
import { kingSquareFromFen } from "@/lib/chess-ui";
import { EvaluationBar } from "./EvaluationBar";
import { MoveInfo } from "./MoveInfo";
import { MoveTimeline } from "./MoveTimeline";
import { StoryMode } from "./StoryMode";

const Chessboard = dynamic(
  () => import("react-chessboard").then((m) => m.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-xl bg-line/70" />
    ),
  }
);

/* ---------- tiny inline icons (no icon dependency) ---------- */

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  first: "M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z",
  prev: "M6 6h2v12H6zm3.5 6l8.5 6V6z",
  play: "M8 5v14l11-7z",
  pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  next: "M6 18l8.5-6L6 6v12zM16 6h2v12h-2z",
  last: "M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z",
  flip: "M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z",
};

/* ---------- replay ---------- */

const AUTOPLAY_MS = 1250;

interface BoardReplayProps {
  match: Match;
  whiteAgent: Agent;
  blackAgent: Agent;
}

export function BoardReplay({ match, whiteAgent, blackAgent }: BoardReplayProps) {
  const moveCount = match.moveCount;
  const [ply, setPly] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const seek = useCallback(
    (p: number) => {
      setAutoPlay(false);
      setPly(Math.max(0, Math.min(moveCount, p)));
    },
    [moveCount]
  );

  const togglePlay = useCallback(() => {
    if (ply >= moveCount) {
      setPly(0);
      setAutoPlay(true);
      return;
    }
    setAutoPlay((v) => !v);
  }, [ply, moveCount]);

  /* autoplay */
  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(
      () => setPly((p) => Math.min(p + 1, moveCount)),
      AUTOPLAY_MS
    );
    return () => clearInterval(t);
  }, [autoPlay, moveCount]);

  useEffect(() => {
    if (ply >= moveCount && autoPlay) setAutoPlay(false);
  }, [ply, moveCount, autoPlay]);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : "";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          seek(ply - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(ply + 1);
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "Home":
          e.preventDefault();
          seek(0);
          break;
        case "End":
          e.preventDefault();
          seek(moveCount);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ply, moveCount, seek, togglePlay]);

  const move = ply > 0 ? match.moves[ply - 1] : null;
  const prevEvaluation: Evaluation | null =
    ply > 1 ? match.moves[ply - 2].evaluation : null;
  const currentEval: Evaluation = move ? move.evaluation : { cp: 0 };
  const fen = match.positions[ply];

  /* board decoration */
  const { squareStyles, arrows } = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const arr: Arrow[] = [];
    if (move) {
      styles[move.from] = { backgroundColor: "rgba(176,136,69,0.30)" };
      styles[move.to] = { backgroundColor: "rgba(176,136,69,0.45)" };
      if (move.check && !move.checkmate) {
        const king = kingSquareFromFen(move.fen, move.color === "w" ? "b" : "w");
        if (king) {
          styles[king] = {
            backgroundColor: "rgba(190,62,44,0.38)",
            borderRadius: "4px",
          };
        }
      }
      if (move.alternative?.from && move.alternative.to) {
        arr.push([
          move.alternative.from,
          move.alternative.to,
          "rgba(43,90,180,0.8)",
        ] as Arrow);
      }
    }
    return { squareStyles: styles, arrows: arr };
  }, [move]);

  const sideToMove = fen.split(" ")[1] === "w" ? whiteAgent.name : blackAgent.name;
  const statusLine = move?.checkmate
    ? `Checkmate — ${
        fen.split(" ")[1] === "w" ? blackAgent.name : whiteAgent.name
      } wins`
    : `${sideToMove} to move`;

  return (
    <div>
      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Board column */}
        <div className="card p-4 sm:p-6">
          <div className="mx-auto flex max-w-[600px] items-stretch gap-3 sm:gap-4">
            <EvaluationBar evaluation={currentEval} className="w-10" />
            <div className="min-w-0 flex-1">
              <Chessboard
                id="chesssim-replay"
                position={fen}
                boardOrientation={orientation}
                arePiecesDraggable={false}
                areArrowsAllowed={false}
                animationDuration={220}
                customBoardStyle={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow:
                    "0 1px 2px rgba(23,20,15,0.10), 0 10px 28px rgba(23,20,15,0.10)",
                }}
                customDarkSquareStyle={{ backgroundColor: "#8E7B5C" }}
                customLightSquareStyle={{ backgroundColor: "#EBE1CB" }}
                customNotationStyle={{ fontSize: "10px", fontWeight: 600, opacity: 0.85 }}
                customSquareStyles={squareStyles}
                customArrows={arrows}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            <ControlButton
              onClick={() => seek(0)}
              disabled={ply === 0}
              label="Jump to start"
            >
              <Icon d={ICONS.first} />
            </ControlButton>
            <ControlButton
              onClick={() => seek(ply - 1)}
              disabled={ply === 0}
              label="Previous move"
            >
              <Icon d={ICONS.prev} />
            </ControlButton>
            <button
              onClick={togglePlay}
              aria-label={autoPlay ? "Pause" : "Play"}
              className="flex h-10 w-12 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-bronze"
            >
              <Icon d={autoPlay ? ICONS.pause : ICONS.play} className="h-5 w-5" />
            </button>
            <ControlButton
              onClick={() => seek(ply + 1)}
              disabled={ply >= moveCount}
              label="Next move"
            >
              <Icon d={ICONS.next} />
            </ControlButton>
            <ControlButton
              onClick={() => seek(moveCount)}
              disabled={ply >= moveCount}
              label="Jump to end"
            >
              <Icon d={ICONS.last} />
            </ControlButton>
            <span className="mx-1 h-6 w-px bg-line" />
            <ControlButton
              onClick={() =>
                setOrientation((o) => (o === "white" ? "black" : "white"))
              }
              label="Flip board"
            >
              <Icon d={ICONS.flip} />
            </ControlButton>
          </div>

          <div className="mt-3 flex flex-col items-center gap-1 text-xs text-faint">
            <p className="font-medium tabular-nums">
              Move {ply} / {moveCount} · {statusLine}
            </p>
            <p className="hidden sm:block">
              <span className="font-semibold">←</span> /{" "}
              <span className="font-semibold">→</span> step ·{" "}
              <span className="font-semibold">space</span> play ·{" "}
              <span className="font-semibold">home</span> /{" "}
              <span className="font-semibold">end</span> jump
            </p>
          </div>
        </div>

        {/* Commentary column */}
        <MoveInfo
          move={move}
          prevEvaluation={prevEvaluation}
          whiteAgent={whiteAgent}
          blackAgent={blackAgent}
          opening={match.opening}
          premise={match.premise}
        />
      </section>

      <div className="mt-6">
        <MoveTimeline moves={match.moves} ply={ply} onSelect={seek} />
      </div>

      <div className="mt-14">
        <StoryMode
          narrative={match.narrative}
          currentPly={ply}
          onJump={seek}
          moveCount={moveCount}
        />
      </div>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-lineStrong hover:bg-paper disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

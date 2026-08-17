"use client";

import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Arrow } from "react-chessboard/dist/chessboard/types";
import type { Agent, Classification, Evaluation, Language, Match } from "@/lib/types";
import { kingSquareFromFen } from "@/lib/chess-ui";
import { classifyFromDelta, evalToProxyCp } from "@/lib/classify";
import { formatEval } from "@/lib/eval";
import type { EngineAnalysis } from "@/lib/stockfish";
import { useStockfish } from "@/hooks/useStockfish";
import {
  loadEngineCache,
  saveEngineCache,
  toStored,
  type StoredEngineResult,
} from "@/lib/engine-cache";
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

/* ---------- helpers ---------- */

function uciToSan(fen: string, uci: string): string | null {
  try {
    const chess = new Chess(fen);
    const mv = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    return mv.san;
  } catch {
    return null;
  }
}

/* ---------- replay ---------- */

const AUTOPLAY_MS = 1250;
const CURRENT_DEPTH = 13;
const SWEEP_DEPTH = 11;

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
  const [lang, setLang] = useState<Language>("en");

  /* ---- Stockfish state ---- */
  const { analyze, status: engineStatus } = useStockfish();
  const [engineResults, setEngineResults] = useState<(StoredEngineResult | undefined)[]>(() =>
    loadEngineCache(match.slug, moveCount + 1)
  );
  const engineResultsRef = useRef(engineResults);
  engineResultsRef.current = engineResults;
  const [sweepRunning, setSweepRunning] = useState(false);
  const [sweepProgress, setSweepProgress] = useState<{ done: number; total: number } | null>(null);
  const sweepRef = useRef(false);

  const persist = useCallback(
    (results: (StoredEngineResult | undefined)[]) => {
      saveEngineCache(match.slug, results);
    },
    [match.slug]
  );

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
    const t = setInterval(() => setPly((p) => Math.min(p + 1, moveCount)), AUTOPLAY_MS);
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

  /* current-position analysis (paused while a sweep runs) */
  useEffect(() => {
    if (sweepRunning) return;
    let cancelled = false;
    const fen = match.positions[ply];
    const existing = engineResultsRef.current[ply];
    if (existing && existing.best && existing.depth >= CURRENT_DEPTH) {
      return; // already analyzed well enough
    }
    analyze(fen, CURRENT_DEPTH).then((r) => {
      if (cancelled || !r || !r.bestMove) return;
      const stored = toStored(r);
      const next = [...engineResultsRef.current];
      const prev = next[ply];
      if (!prev || (prev.depth ?? 0) < stored.depth) {
        next[ply] = stored;
        engineResultsRef.current = next;
        setEngineResults(next);
        persist(next);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ply, sweepRunning, match.positions, analyze, persist]);

  /* full-game sweep */
  const runSweep = useCallback(async () => {
    if (sweepRef.current) return;
    sweepRef.current = true;
    setSweepRunning(true);
    setSweepProgress({ done: 0, total: moveCount + 1 });
    const results = [...engineResultsRef.current];
    for (let i = 0; i <= moveCount; i++) {
      if (!sweepRef.current) break;
      const existing = results[i];
      if (!existing || existing.depth < SWEEP_DEPTH) {
        const r = await analyze(match.positions[i], SWEEP_DEPTH);
        if (r && r.bestMove) {
          results[i] = toStored(r);
          engineResultsRef.current = results;
          setEngineResults([...results]);
          persist(results);
        }
      }
      setSweepProgress({ done: i + 1, total: moveCount + 1 });
    }
    sweepRef.current = false;
    setSweepRunning(false);
    setSweepProgress(null);
  }, [moveCount, match.positions, analyze, persist]);

  const cancelSweep = useCallback(() => {
    sweepRef.current = false;
    setSweepRunning(false);
    setSweepProgress(null);
  }, []);

  /* ---- derived ---- */
  const move = ply > 0 ? match.moves[ply - 1] : null;
  const prevEvaluation: Evaluation | null = ply > 1 ? match.moves[ply - 2].evaluation : null;
  const fen = match.positions[ply];

  const positionResult = engineResults[ply];
  const engineAnalysis: EngineAnalysis | null = positionResult
    ? {
        fen,
        cp: positionResult.cp,
        mate: positionResult.mate,
        depth: positionResult.depth,
        bestMove: positionResult.best,
      }
    : null;

  const bestMoveSan = useMemo(
    () => (engineAnalysis?.bestMove ? uciToSan(fen, engineAnalysis.bestMove) : null),
    [engineAnalysis, fen]
  );

  /* real evals for sparkline */
  const realEvals = useMemo<Evaluation[]>(
    () =>
      engineResults.slice(1).map((r) =>
        r && (r.cp !== null || r.mate !== null)
          ? { cp: r.cp ?? 0, ...(r.mate != null ? { mate: r.mate } : {}) }
          : (undefined as unknown as Evaluation)
      ),
    [engineResults]
  );

  const currentEval: Evaluation = useMemo(() => {
    if (positionResult && (positionResult.cp !== null || positionResult.mate !== null)) {
      return {
        cp: positionResult.cp ?? 0,
        ...(positionResult.mate != null ? { mate: positionResult.mate } : {}),
      };
    }
    return move ? move.evaluation : { cp: 0 };
  }, [positionResult, move]);

  /* engine-driven classifications */
  const engineClassifications = useMemo<(Classification | undefined)[]>(() => {
    const arr: (Classification | undefined)[] = [];
    for (let j = 0; j < moveCount; j++) {
      const m = match.moves[j];
      const before = engineResults[j];
      const after = engineResults[j + 1];
      if (
        !before ||
        !after ||
        (before.cp === null && before.mate === null) ||
        (after.cp === null && after.mate === null)
      ) {
        arr.push(undefined);
        continue;
      }
      if (m.moveNumber <= 6) {
        arr.push("book");
        continue;
      }
      const b = evalToProxyCp(before.cp ?? 0, before.mate ?? undefined);
      const a = evalToProxyCp(after.cp ?? 0, after.mate ?? undefined);
      const sign = m.color === "w" ? 1 : -1;
      arr.push(classifyFromDelta((a - b) * sign));
    }
    return arr;
  }, [engineResults, match.moves, moveCount]);

  const effectiveClassification: Classification | undefined =
    ply > 0
      ? (engineClassifications[ply - 1] ?? match.moves[ply - 1].classification)
      : undefined;

  /* board decoration */
  const { squareStyles, arrows } = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const arr: Arrow[] = [];
    if (move) {
      const critical =
        move.tags.includes("turning-point") || effectiveClassification === "brilliant";
      const ring = critical ? "inset 0 0 0 3px rgba(109,63,209,0.55)" : undefined;
      styles[move.from] = {
        backgroundColor: "rgba(176,136,69,0.30)",
        ...(ring ? { boxShadow: ring } : {}),
      };
      styles[move.to] = {
        backgroundColor: "rgba(176,136,69,0.45)",
        ...(ring ? { boxShadow: ring } : {}),
      };
      if (move.check && !move.checkmate) {
        const king = kingSquareFromFen(move.fen, move.color === "w" ? "b" : "w");
        if (king) {
          styles[king] = { backgroundColor: "rgba(190,62,44,0.38)", borderRadius: "4px" };
        }
      }
      if (move.alternative?.from && move.alternative.to) {
        arr.push([move.alternative.from, move.alternative.to, "rgba(43,90,180,0.8)"] as Arrow);
      }
    }
    return { squareStyles: styles, arrows: arr };
  }, [move, effectiveClassification]);

  const sideToMove = fen.split(" ")[1] === "w" ? whiteAgent.name : blackAgent.name;
  const statusLine = move?.checkmate
    ? `Checkmate — ${fen.split(" ")[1] === "w" ? blackAgent.name : whiteAgent.name} wins`
    : `${sideToMove} to move`;

  const zh = lang === "zh";

  return (
    <div>
      {/* Language switch */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-faint">
          {zh ? "AI 对局回放" : "AI Match Replay"}
        </p>
        <div className="flex rounded-full border border-line bg-surface p-0.5 text-xs font-semibold">
          <button
            onClick={() => setLang("en")}
            className={`rounded-full px-3 py-1 transition-colors ${lang === "en" ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("zh")}
            className={`rounded-full px-3 py-1 transition-colors ${lang === "zh" ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
          >
            中文
          </button>
        </div>
      </div>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Board column */}
        <div className="card p-4 sm:p-6">
          <div className="mx-auto flex max-w-[600px] items-stretch gap-3 sm:gap-4">
            <EvaluationBar
              evaluation={currentEval}
              className="w-10"
              note={
                positionResult && positionResult.mate === null
                  ? `d${positionResult.depth}`
                  : undefined
              }
            />
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

          {/* Move readout */}
          <div className="mt-4 text-center">
            {ply === 0 ? (
              <p className="text-sm font-medium text-muted">
                {zh ? "开局局面" : "Start position"}
              </p>
            ) : (
              <p className="text-sm text-ink">
                {zh ? "第" : "Move"} {move!.moveNumber}
                {move!.color === "b" ? "…" : ""} ·{" "}
                <span className="font-display text-lg font-semibold">{move!.san}</span>
                {effectiveClassification && (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-bronze">
                    {effectiveClassification}
                  </span>
                )}
                <span className="ml-2 text-xs tabular-nums text-muted">
                  {formatEval(currentEval)}
                </span>
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <ControlButton onClick={() => seek(0)} disabled={ply === 0} label="Jump to start">
              <Icon d={ICONS.first} />
            </ControlButton>
            <ControlButton onClick={() => seek(ply - 1)} disabled={ply === 0} label="Previous move">
              <Icon d={ICONS.prev} />
            </ControlButton>
            <button
              onClick={togglePlay}
              aria-label={autoPlay ? "Pause" : "Play"}
              className="flex h-10 w-12 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-bronze"
            >
              <Icon d={autoPlay ? ICONS.pause : ICONS.play} className="h-5 w-5" />
            </button>
            <ControlButton onClick={() => seek(ply + 1)} disabled={ply >= moveCount} label="Next move">
              <Icon d={ICONS.next} />
            </ControlButton>
            <ControlButton onClick={() => seek(moveCount)} disabled={ply >= moveCount} label="Jump to end">
              <Icon d={ICONS.last} />
            </ControlButton>
            <span className="mx-1 h-6 w-px bg-line" />
            <ControlButton
              onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
              label="Flip board"
            >
              <Icon d={ICONS.flip} />
            </ControlButton>
          </div>

          {/* Stockfish full-game analysis */}
          <div className="mt-3 flex justify-center">
            {sweepRunning ? (
              <button
                onClick={cancelSweep}
                className="inline-flex items-center gap-2 rounded-full border border-bronze/60 px-4 py-1.5 text-xs font-semibold text-bronze transition-colors hover:bg-bronze/10"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bronze" />
                {zh ? "停止引擎分析" : "Stop engine analysis"}
                {sweepProgress && (
                  <span className="tabular-nums">
                    {sweepProgress.done}/{sweepProgress.total}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={runSweep}
                disabled={engineStatus === "loading"}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-bronze hover:text-bronze disabled:opacity-50"
              >
                <span aria-hidden>⚙</span>
                {zh ? "Stockfish 分析整盘棋" : "Analyze full game with Stockfish"}
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-col items-center gap-1 text-xs text-faint">
            <p className="font-medium tabular-nums">
              {zh ? `第 ${ply} / ${moveCount} 步` : `Move ${ply} / ${moveCount}`} · {statusLine}
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

        {/* AI Narrative panel */}
        <MoveInfo
          move={move}
          prevEvaluation={prevEvaluation}
          whiteAgent={whiteAgent}
          blackAgent={blackAgent}
          opening={match.opening}
          premise={match.premise}
          lang={lang}
          engineAnalysis={engineAnalysis}
          engineStatus={engineStatus}
          bestMoveSan={bestMoveSan}
        />
      </section>

      <div className="mt-6">
        <MoveTimeline
          moves={match.moves}
          ply={ply}
          onSelect={seek}
          lang={lang}
          engineClassifications={engineClassifications}
          realEvals={realEvals}
          analysisProgress={sweepProgress}
        />
      </div>

      <div className="mt-14">
        <StoryMode narrative={match.narrative} currentPly={ply} onJump={seek} lang={lang} />
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

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Match } from "@/lib/types";
import { formatEval } from "@/lib/eval";
import { CLASSIFICATION_META } from "@/lib/classify";
import { useStockfish } from "@/hooks/useStockfish";
import { useSimulation } from "@/hooks/useSimulation";
import { SIM_AGENTS, type SimAgent } from "@/lib/simulation/agents";
import {
  buildMatchFromLiveGame,
  simAgentToAgent,
} from "@/lib/simulation/build-match";
import { AgentAvatar } from "./AgentAvatar";
import { BoardReplay } from "./BoardReplay";
import { ClassificationBadge } from "./Badge";

const Chessboard = dynamic(
  () => import("react-chessboard").then((m) => m.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-xl bg-line/70" />
    ),
  }
);

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

interface AgentsInfo {
  agents: SimAgent[];
  configured: Record<string, boolean>;
}

const SPEEDS = [
  { id: "fast", label: "Fast", ms: 500 },
  { id: "normal", label: "Normal", ms: 1200 },
  { id: "slow", label: "Slow", ms: 2600 },
];

export function ArenaSim() {
  const [info, setInfo] = useState<AgentsInfo | null>(null);
  const [whiteId, setWhiteId] = useState("stockfish-4");
  const [blackId, setBlackId] = useState("greedy");
  const [speedId, setSpeedId] = useState("normal");
  const [view, setView] = useState<"setup" | "live" | "replay">("setup");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [replayMatch, setReplayMatch] = useState<Match | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d: AgentsInfo) => setInfo(d))
      .catch(() => setInfo({ agents: SIM_AGENTS, configured: {} }));
  }, []);

  const { analyze, status: engineStatus } = useStockfish();

  const white = useMemo(() => SIM_AGENTS.find((a) => a.id === whiteId) ?? SIM_AGENTS[0], [whiteId]);
  const black = useMemo(() => SIM_AGENTS.find((a) => a.id === blackId) ?? SIM_AGENTS[1], [blackId]);
  const speed = SPEEDS.find((s) => s.id === speedId) ?? SPEEDS[1];

  const configured = info?.configured ?? {};

  const offlineWhite = white.kind === "llm" && !configured[white.id];
  const offlineBlack = black.kind === "llm" && !configured[black.id];

  const sim = useSimulation({
    white,
    black,
    analyze,
    moveDelayMs: speed.ms,
    configured,
    allowOfflineFallback: true,
  });

  const { state } = sim;

  const startGame = useCallback(() => {
    setView("live");
    setReplayMatch(null);
    sim.start();
  }, [sim]);

  const showReplay = useCallback(() => {
    if (!state.result || state.moves.length === 0) return;
    const match = buildMatchFromLiveGame({
      slug: `live-${Date.now()}`,
      title: `${white.name} vs ${black.name}`,
      white,
      black,
      moves: state.moves,
      startFen: START_FEN,
      result: state.result,
      lang: "en",
    });
    setReplayMatch(match);
    setView("replay");
  }, [state.result, state.moves, white, black]);

  const exportPgn = useCallback(() => {
    if (!state.result) return;
    const blob = new Blob([state.result.pgn], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chesssim-${white.id}-vs-${black.id}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.result, white.id, black.id]);

  const copyPgn = useCallback(async () => {
    if (!state.result) return;
    try {
      await navigator.clipboard.writeText(state.result.pgn);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }, [state.result]);

  /* ---------------- setup view ---------------- */
  if (view === "setup") {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">New Simulation</p>
            <span className="text-xs text-faint">
              Stockfish engine: {engineStatus === "ready" ? "ready ✓" : engineStatus === "loading" ? "loading…" : "idle"}
            </span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <AgentPicker
              label="White"
              value={whiteId}
              onChange={setWhiteId}
              configured={configured}
            />
            <AgentPicker
              label="Black"
              value={blackId}
              onChange={setBlackId}
              configured={configured}
            />
          </div>

          {(offlineWhite || offlineBlack) && (
            <div className="mt-5 rounded-lg border border-[#F8E5D5] bg-[#FDF6EE] px-4 py-3 text-sm leading-relaxed text-[#B0561F]">
              ⚠️{" "}
              {(offlineWhite ? white.name : black.name)} 的 API key 尚未配置，
              开赛后将以 <span className="font-semibold">本地启发式（离线模式）</span>{" "}
              代替走子。在 Vercel 环境变量里配置对应 key 后即恢复真实 LLM 对战。
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                Pace
              </span>
              <div className="flex rounded-full border border-line bg-paper p-0.5">
                {SPEEDS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSpeedId(s.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      speedId === s.id ? "bg-ink text-paper" : "text-muted hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={startGame}
              disabled={engineStatus === "error" && (white.kind === "engine" || black.kind === "engine")}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-bronze disabled:opacity-50"
            >
              Start Simulation
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Real engine ground truth",
              d: "Every evaluation, classification and best-move comparison is computed by the real Stockfish engine in your browser.",
            },
            {
              t: "LLM agents when keys exist",
              d: "DeepSeek, GPT, Claude, Qwen and Gemini play through the ChessSim API. No key? Honest offline fallback — never fake.",
            },
            {
              t: "Watch, then replay",
              d: "The finished game becomes a full match page with story mode, commentary and PGN export.",
            },
          ].map((c) => (
            <div key={c.t} className="card p-5">
              <p className="font-display text-base font-semibold">{c.t}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- replay view ---------------- */
  if (view === "replay" && replayMatch) {
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setView("live")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-bronze"
          >
            ← {state.phase === "finished" ? "Back to result" : "Back to arena"}
          </button>
          <button
            onClick={() => setView("setup")}
            className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-bronze hover:text-bronze"
          >
            New simulation
          </button>
        </div>
        <BoardReplay
          match={replayMatch}
          whiteAgent={simAgentToAgent(white)}
          blackAgent={simAgentToAgent(black)}
        />
      </div>
    );
  }

  /* ---------------- live view ---------------- */
  const lastMove = state.moves[state.moves.length - 1];
  const currentEval = state.lastEval
    ? { cp: state.lastEval.cp, ...(state.lastEval.mate != null ? { mate: state.lastEval.mate } : {}) }
    : { cp: 0 };

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (state.lastMove) {
    squareStyles[state.lastMove.from] = { backgroundColor: "rgba(176,136,69,0.30)" };
    squareStyles[state.lastMove.to] = { backgroundColor: "rgba(176,136,69,0.45)" };
  }

  const finished = state.phase === "finished" && state.result;

  return (
    <div>
      {/* offline banner during play */}
      {state.offlineAgents.length > 0 && state.phase !== "idle" && (
        <div className="mb-5 rounded-lg border border-[#F8E5D5] bg-[#FDF6EE] px-4 py-2.5 text-xs text-[#B0561F]">
          ⚠️ 离线模式：{" "}
          {state.offlineAgents
            .map((id) => SIM_AGENTS.find((a) => a.id === id)?.name)
            .filter(Boolean)
            .join("、")}{" "}
          未配置 API key，当前由本地启发式代替走子。
        </div>
      )}

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* board column */}
        <div className="card p-4 sm:p-6">
          <div className="mx-auto flex max-w-[560px] items-stretch gap-3 sm:gap-4">
            <div className="flex w-10 flex-col items-center gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-faint">White</span>
              <span className="text-xs font-semibold tabular-nums">
                {state.lastEval ? formatEval(currentEval) : "—"}
                {state.lastEval && state.lastEval.mate === null && (
                  <span className="ml-0.5 text-[10px] text-faint">d{state.lastEval.depth}</span>
                )}
              </span>
              <div className="relative min-h-24 w-3.5 flex-1 overflow-hidden rounded-full border border-lineStrong bg-[#322C23]">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-surface transition-[height] duration-500"
                  style={{
                    height: `${Math.round(
                      (state.lastEval
                        ? state.lastEval.mate != null
                          ? state.lastEval.mate > 0
                            ? 100
                            : 0
                          : (1 / (1 + Math.exp(-state.lastEval.cp / 180))) * 100
                        : 50)
                    )}%`,
                  }}
                />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-[#322C23]/70" />
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-faint">Black</span>
            </div>
            <div className="min-w-0 flex-1">
              <Chessboard
                id="arena-live-board"
                position={state.fen}
                boardOrientation={orientation}
                arePiecesDraggable={false}
                areArrowsAllowed={false}
                animationDuration={200}
                customBoardStyle={{ borderRadius: "10px", overflow: "hidden" }}
                customDarkSquareStyle={{ backgroundColor: "#8E7B5C" }}
                customLightSquareStyle={{ backgroundColor: "#EBE1CB" }}
                customNotationStyle={{ fontSize: "10px", fontWeight: 600, opacity: 0.85 }}
                customSquareStyles={squareStyles}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => (state.phase === "paused" ? sim.resume() : sim.pause())}
              disabled={state.phase !== "running" && state.phase !== "paused"}
              className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-lineStrong disabled:opacity-40"
            >
              {state.phase === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
              className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-lineStrong"
            >
              Flip board
            </button>
            {state.phase === "running" || state.phase === "paused" ? (
              <button
                onClick={() => {
                  sim.stop();
                  setView("setup");
                }}
                className="rounded-full border border-[#F8DDDA] px-4 py-1.5 text-xs font-semibold text-[#B02B20] transition-colors hover:bg-[#F8DDDA]"
              >
                Abandon game
              </button>
            ) : null}
          </div>
        </div>

        {/* live commentary column */}
        <aside className="card flex flex-col p-5">
          <p className="eyebrow">Live Commentary</p>

          {state.thinking ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-paper px-4 py-3">
              <span className="relative">
                <AgentAvatar agent={simAgentToAgent(state.thinking)} size="md" />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-bronze" />
              </span>
              <div>
                <p className="text-sm font-semibold">{state.thinking.name} is thinking…</p>
                <p className="text-xs text-muted">
                  {state.thinking.kind === "engine"
                    ? "Stockfish search in progress"
                    : state.thinking.kind === "llm"
                      ? "Consulting the language model"
                      : "Running the heuristic"}
                </p>
              </div>
            </div>
          ) : lastMove ? (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <AgentAvatar agent={simAgentToAgent(lastMove.color === "w" ? white : black)} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    Move {lastMove.moveNumber}
                    {lastMove.color === "b" ? "…" : ""} · {lastMove.san}
                  </p>
                  <p className="text-xs text-muted">
                    {(lastMove.color === "w" ? white : black).name}
                    {lastMove.fallback && (
                      <span className="ml-1.5 text-[#B0561F]">· offline fallback</span>
                    )}
                    {lastMove.fromLlm && (
                      <span className="ml-1.5 text-[#2F5BA0]">· LLM move</span>
                    )}
                  </p>
                </div>
                <ClassificationBadge classification={lastMove.classification} />
              </div>
              <p className="mt-3 border-l-2 border-bronze/60 pl-3 text-sm leading-relaxed text-ink">
                {lastMove.comment}
              </p>
              {state.lastEval && (
                <p className="mt-2 text-xs tabular-nums text-muted">
                  Stockfish: {formatEval(currentEval)} (depth {state.lastEval.depth})
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Waiting for the first move…</p>
          )}

          {finished && (
            <div className="mt-5 rounded-xl border border-bronze/40 bg-bronze/10 p-4">
              <p className="font-display text-2xl font-semibold">{state.result!.result}</p>
              <p className="mt-0.5 text-sm text-muted">
                {state.result!.reason} · {state.moves.length} plies
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={showReplay}
                  className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-bronze"
                >
                  Watch Replay →
                </button>
                <button
                  onClick={exportPgn}
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-bronze hover:text-bronze"
                >
                  Export PGN
                </button>
                <button
                  onClick={copyPgn}
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-bronze hover:text-bronze"
                >
                  {copied ? "Copied ✓" : "Copy PGN"}
                </button>
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* move list */}
      {state.moves.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
            <p className="eyebrow">Moves</p>
            <p className="text-xs text-faint">{state.moves.length} plies</p>
          </div>
          <div className="chesssim-scroll max-h-56 overflow-y-auto px-3 py-2">
            {Array.from({ length: Math.ceil(state.moves.length / 2) }).map((_, i) => {
              const wMove = state.moves[i * 2];
              const bMove = state.moves[i * 2 + 1];
              return (
                <div key={i} className="grid grid-cols-[2.75rem_1fr_1fr] items-center gap-1 py-0.5">
                  <span className="pl-2 text-xs tabular-nums text-faint">{i + 1}.</span>
                  <LiveMoveCell move={wMove} isLast={wMove?.ply === state.moves.length} />
                  <LiveMoveCell move={bMove} isLast={bMove?.ply === state.moves.length} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveMoveCell({
  move,
  isLast,
}: {
  move?: NonNullable<ReturnType<typeof useSimulation>["state"]["moves"]>[number];
  isLast: boolean;
}) {
  if (!move) return <span className="px-3 py-1.5 text-sm text-faint">…</span>;
  const meta = CLASSIFICATION_META[move.classification];
  return (
    <div
      className={`flex items-center justify-between gap-1 rounded-md px-3 py-1.5 text-sm ${
        isLast ? "bg-ink text-paper" : "text-ink"
      }`}
    >
      <span className="font-medium tabular-nums">
        {move.san}
        {meta.glyph && (
          <span className="ml-1 text-xs" style={{ color: isLast ? "#F6F4EF" : meta.fg }}>
            {meta.glyph}
          </span>
        )}
      </span>
      {move.evalCp !== null && (
        <span className={`text-[10px] tabular-nums ${isLast ? "text-[#D7CFBF]" : "text-faint"}`}>
          {move.evalCp > 0 ? "+" : ""}
          {(move.evalCp / 100).toFixed(1)}
        </span>
      )}
    </div>
  );
}

function AgentPicker({
  label,
  value,
  onChange,
  configured,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  configured: Record<string, boolean>;
}) {
  const groups = [
    { kind: "llm" as const, title: "Language models (LLM)" },
    { kind: "engine" as const, title: "Stockfish engine" },
    { kind: "heuristic" as const, title: "Baseline bots" },
  ];

  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-bronze"
        >
          {groups.map((g) => (
            <optgroup key={g.kind} label={g.title}>
              {SIM_AGENTS.filter((a) => a.kind === g.kind).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.kind === "llm" && !configured[a.id] ? "  (needs API key)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <p className="mt-1.5 min-h-[2rem] text-[11px] leading-relaxed text-faint">
        {SIM_AGENTS.find((a) => a.id === value)?.description}
      </p>
    </label>
  );
}

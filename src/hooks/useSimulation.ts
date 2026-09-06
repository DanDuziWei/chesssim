"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Classification } from "@/lib/types";
import { classifyFromDelta, evalToProxyCp } from "@/lib/classify";
import { defaultCommentary, defaultCommentaryZh } from "@/lib/build";
import type { EngineAnalysis } from "@/lib/stockfish";
import { SIM_AGENTS, type SimAgent } from "@/lib/simulation/agents";
import { greedyMove, randomMove } from "@/lib/simulation/heuristics";
import type { LiveGameResult, LiveMove } from "@/lib/simulation/build-match";
import { SimulationGame, type GameMove } from "@/lib/simulation/game";
import {
  STANDARD_START_FEN,
  type ChessVariant,
} from "@/lib/chess960";

export type SimulationPhase = "idle" | "running" | "paused" | "finished" | "error";

export interface LlmMoveReply {
  move: string;
  san: string;
  comment: string | null;
  fallback: boolean;
}

export interface SimulationOptions {
  white: SimAgent;
  black: SimAgent;
  analyze: (
    fen: string,
    depth: number,
    variant?: ChessVariant
  ) => Promise<EngineAnalysis | null>;
  /** ms between moves (watchability pacing). */
  moveDelayMs: number;
  /** Which LLM agents are actually configured server-side. */
  configured: Record<string, boolean>;
  /** Allow unconfigured LLM agents to play with the offline heuristic. */
  allowOfflineFallback: boolean;
  /** Explicit opt-in for additional paid LLM narrative calls. */
  enhanceNarrative: boolean;
  variant: ChessVariant;
  startFen: string;
}

export interface SimulationState {
  phase: SimulationPhase;
  fen: string;
  moves: LiveMove[];
  thinking: SimAgent | null;
  lastMove: { from: string; to: string } | null;
  lastEval: { cp: number; mate: number | null; depth: number } | null;
  result: LiveGameResult | null;
  error: string | null;
  offlineAgents: string[];
  storyBeats: LiveStoryBeat[];
}

export interface LiveStoryBeat {
  id: string;
  ply: number;
  title: string;
  story: string;
  storyZh: string;
  status: "instant" | "enhancing" | "enhanced";
}

const ANALYSIS_DEPTH = 10;
const MAX_PLIES = 240;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function templateComment(
  agent: SimAgent,
  san: string,
  color: "w" | "b",
  classification: Classification,
  evalCp: number | null,
  mate: number | null,
  whiteName: string,
  blackName: string
): { en: string; zh: string } {
  const evalObj = {
    cp: evalCp ?? 0,
    ...(mate != null ? { mate } : {}),
  };
  return {
    en: defaultCommentary(color, san, classification, evalObj, whiteName, blackName),
    zh: defaultCommentaryZh(color, san, classification, evalObj, whiteName, blackName),
  };
}

function storyTitle(move: LiveMove): string {
  if (move.checkmate) return "Checkmate";
  if (move.check) return "The king is under fire";
  if (move.classification === "brilliant") return "A brilliant idea";
  if (move.classification === "blunder" || move.classification === "mistake") {
    return "The position turns";
  }
  if (move.capture) return "The battle sharpens";
  if (move.ply <= 12) return "The opening takes shape";
  return "Pressure builds";
}

function deservesLlmNarration(move: LiveMove): boolean {
  return Boolean(
    move.checkmate ||
      move.check ||
      move.ply % 12 === 0 ||
      ["brilliant", "mistake", "blunder"].includes(move.classification)
  );
}

export function useSimulation(opts: SimulationOptions) {
  const {
    white,
    black,
    analyze,
    moveDelayMs,
    configured,
    allowOfflineFallback,
    variant,
    startFen,
  } = opts;

  const [state, setState] = useState<SimulationState>({
    phase: "idle",
    fen: startFen,
    moves: [],
    thinking: null,
    lastMove: null,
    lastEval: null,
    result: null,
    error: null,
    offlineAgents: [],
    storyBeats: [],
  });

  const cancelledRef = useRef(false);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const generationRef = useRef(0);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const pickMove = useCallback(
    async (
      chess: SimulationGame,
      agent: SimAgent
    ): Promise<(GameMove & { comment: string | null; fromLlm: boolean; fallback: boolean }) | null> => {
      if (agent.kind === "heuristic") {
        const mv =
          agent.heuristic === "greedy" ? greedyMove(chess) : randomMove(chess);
        return mv
          ? { ...mv, comment: null, fromLlm: false, fallback: false }
          : null;
      }

      if (agent.kind === "engine") {
        const r = await analyze(chess.fen(), agent.depth ?? 8, chess.variant);
        if (r?.bestMove) {
          const mv = chess.legalMoves().find(
            (move) => move.uci.toLowerCase() === r.bestMove!.toLowerCase()
          );
          if (mv) return { ...mv, comment: null, fromLlm: false, fallback: false };
        }
        const mv = greedyMove(chess);
        return mv
          ? { ...mv, comment: null, fromLlm: false, fallback: true }
          : null;
      }

      /* llm agent */
      if (!configured[agent.id]) {
        if (!allowOfflineFallback) return null;
        const mv = greedyMove(chess);
        return mv
          ? { ...mv, comment: null, fromLlm: false, fallback: true }
          : null;
      }

      try {
        const res = await fetch("/api/llm/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: agent.id,
            fen: chess.fen(),
            history: chess.history(),
            opponentName: agent === optsRef.current.white ? optsRef.current.black.name : optsRef.current.white.name,
            variant: chess.variant,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.error === "no-key") {
            const mv = greedyMove(chess);
            return mv
              ? { ...mv, comment: null, fromLlm: false, fallback: true }
              : null;
          }
          throw new Error(data?.message ?? `LLM move failed (${res.status})`);
        }
        const data: LlmMoveReply = await res.json();
        const mv = chess.legalMoves().find(
          (move) => move.uci.toLowerCase() === data.move.toLowerCase()
        );
        if (mv) return { ...mv, comment: data.comment, fromLlm: true, fallback: data.fallback };
        const fallback = greedyMove(chess);
        return fallback
          ? { ...fallback, comment: null, fromLlm: false, fallback: true }
          : null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setState((s) => ({ ...s, error: msg }));
        const mv = greedyMove(chess);
        return mv
          ? { ...mv, comment: null, fromLlm: false, fallback: true }
          : null;
      }
    },
    [analyze, configured, allowOfflineFallback]
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    cancelledRef.current = false;
    pausedRef.current = false;
    runningRef.current = true;
    const generation = ++generationRef.current;
    const storyPrefix = `${Date.now().toString(36)}-${generation}`;

    const chess = new SimulationGame(variant, startFen);
    const moves: LiveMove[] = [];
    const offline: string[] = [];

    for (const a of [white, black]) {
      if (a.kind === "llm" && !configured[a.id]) offline.push(a.id);
    }

    setState({
      phase: "running",
      fen: chess.fen(),
      moves: [],
      thinking: null,
      lastMove: null,
      lastEval: null,
      result: null,
      error: null,
      offlineAgents: allowOfflineFallback ? offline : [],
      storyBeats: [],
    });

    (async () => {
      let prevCp = 0;
      let prevMate: number | null = null;

      while (!cancelledRef.current && !chess.isGameOver() && moves.length < MAX_PLIES) {
        while (pausedRef.current && !cancelledRef.current) {
          await sleep(150);
        }
        if (cancelledRef.current) break;

        const color = chess.turn();
        const agent = color === "w" ? optsRef.current.white : optsRef.current.black;
        setState((s) => ({ ...s, thinking: agent }));

        await sleep(Math.max(150, moveDelayMs));

        const picked = await pickMove(chess, agent);
        if (!picked || cancelledRef.current) break;

        const mv = chess.move(picked.uci);
        if (!mv) throw new Error(`Rules engine rejected selected move ${picked.uci}`);
        const fen = chess.fen();
        const ply = moves.length + 1;
        const terminal = chess.isGameOver();

        /* Never ask an engine to search a terminal position. A few Stockfish
           worker builds do not answer that request with `bestmove`. */
        let ev: EngineAnalysis | null = null;
        if (!terminal) {
          try {
            ev = await analyze(fen, ANALYSIS_DEPTH, variant);
          } catch {
            ev = null;
          }
        }

        const evalCp = ev?.cp ?? null;
        const evalMate = mv.san.includes("#")
          ? color === "w"
            ? 1
            : -1
          : ev?.mate ?? null;

        /* engine-based classification from the swing */
        let classification: Classification = "good";
        if (mv.san.includes("#")) {
          classification = "best";
        } else if (ev && (evalCp !== null || evalMate !== null)) {
          if (Math.ceil(ply / 2) <= 6) {
            classification = "book";
          } else {
            const moverSign = color === "w" ? 1 : -1;
            const delta =
              (evalToProxyCp(evalCp ?? 0, evalMate ?? undefined) -
                evalToProxyCp(prevCp, prevMate ?? undefined)) *
              moverSign;
            classification = classifyFromDelta(delta);
          }
          prevCp = evalCp ?? prevCp;
          prevMate = evalMate ?? prevMate;
        }

        const template = templateComment(
          agent,
          mv.san,
          color,
          classification,
          evalCp,
          evalMate,
          optsRef.current.white.name,
          optsRef.current.black.name
        );
        const comment = picked.comment ?? template.en;
        const commentZh = template.zh;

        const record: LiveMove = {
          ply,
          moveNumber: Math.ceil(ply / 2),
          color,
          san: mv.san,
          from: mv.from,
          to: mv.to,
          fen,
          capture: !!mv.captured,
          check: mv.san.includes("+"),
          checkmate: mv.san.includes("#"),
          promotion: mv.promotion,
          evalCp,
          mate: evalMate,
          depth: ev?.depth ?? 0,
          classification,
          comment,
          commentZh,
          fromLlm: picked.fromLlm,
          fallback: picked.fallback,
        };
        moves.push(record);

        const narrator = optsRef.current.enhanceNarrative
          ? SIM_AGENTS.find(
              (candidate) => candidate.kind === "llm" && configured[candidate.id]
            )
          : undefined;
        const enhance = Boolean(narrator && deservesLlmNarration(record));
        const beat: LiveStoryBeat = {
          id: `${storyPrefix}-${ply}`,
          ply,
          title: storyTitle(record),
          story: comment,
          storyZh: commentZh,
          status: enhance ? "enhancing" : "instant",
        };

        setState((s) => ({
          ...s,
          fen,
          moves: [...moves],
          thinking: null,
          lastMove: { from: mv.from, to: mv.to },
          lastEval: ev
            ? { cp: evalCp ?? 0, mate: evalMate, depth: ev.depth }
            : evalMate != null
              ? { cp: 0, mate: evalMate, depth: 0 }
              : s.lastEval,
          storyBeats: [...s.storyBeats, beat],
        }));

        if (enhance && narrator) {
          void fetch("/api/llm/narrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agentId: narrator.id,
              playerId: agent.id,
              fen,
              moveSan: mv.san,
              evalCp,
              mate: evalMate,
              language: "en",
              historySummary: moves
                .slice(-10)
                .map((move) => move.san)
                .join(" "),
            }),
          })
            .then(async (response) => {
              if (!response.ok) throw new Error(`Narration failed (${response.status})`);
              return response.json() as Promise<{ story?: string }>;
            })
            .then((reply) => {
              if (generationRef.current !== generation || !reply.story) return;
              setState((current) => ({
                ...current,
                storyBeats: current.storyBeats.map((item) =>
                  item.id === beat.id
                    ? { ...item, story: reply.story!, status: "enhanced" }
                    : item
                ),
              }));
            })
            .catch(() => {
              if (generationRef.current !== generation) return;
              setState((current) => ({
                ...current,
                storyBeats: current.storyBeats.map((item) =>
                  item.id === beat.id ? { ...item, status: "instant" } : item
                ),
              }));
            });
        }
      }

      if (cancelledRef.current) {
        runningRef.current = false;
        setState((s) => ({ ...s, phase: "idle", thinking: null }));
        return;
      }

      const result = deriveResult(chess, white, black, moves.length >= MAX_PLIES);
      runningRef.current = false;
      setState((s) => ({ ...s, phase: "finished", result, thinking: null }));
    })().catch((err) => {
      runningRef.current = false;
      setState((s) => ({
        ...s,
        phase: "error",
        error: err instanceof Error ? err.message : String(err),
        thinking: null,
      }));
    });
  }, [white, black, configured, allowOfflineFallback, moveDelayMs, pickMove, analyze, variant, startFen]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setState((s) => ({ ...s, phase: "paused" }));
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setState((s) => ({ ...s, phase: "running" }));
  }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    pausedRef.current = false;
    generationRef.current++;
  }, []);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      generationRef.current++;
    };
  }, []);

  return { state, start, pause, resume, stop };
}

function deriveResult(
  chess: SimulationGame,
  white: SimAgent,
  black: SimAgent,
  reachedMoveLimit = false
): LiveGameResult {
  let result: LiveGameResult;
  if (chess.isCheckmate()) {
    const winnerIsWhite = chess.turn() === "b";
    result = {
      result: winnerIsWhite ? "1-0" : "0-1",
      winnerId: winnerIsWhite ? white.id : black.id,
      reason: "Checkmate",
      pgn: chess.pgn(winnerIsWhite ? "1-0" : "0-1"),
    };
  } else if (chess.isStalemate()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Stalemate", pgn: chess.pgn() };
  } else if (chess.isThreefoldRepetition()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Threefold repetition", pgn: chess.pgn() };
  } else if (chess.isInsufficientMaterial()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Insufficient material", pgn: chess.pgn() };
  } else if (reachedMoveLimit) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Simulation move limit", pgn: chess.pgn() };
  } else if (chess.isDraw()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Draw (50-move rule)", pgn: chess.pgn() };
  } else {
    result = { result: "1/2-1/2", winnerId: null, reason: "Game ended", pgn: chess.pgn() };
  }
  return result;
}

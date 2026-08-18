"use client";

import { Chess } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Classification } from "@/lib/types";
import { classifyFromDelta, evalToProxyCp } from "@/lib/classify";
import { defaultCommentary, defaultCommentaryZh } from "@/lib/build";
import type { EngineAnalysis } from "@/lib/stockfish";
import type { SimAgent } from "@/lib/simulation/agents";
import { greedyMove, randomMove } from "@/lib/simulation/heuristics";
import type { LiveGameResult, LiveMove } from "@/lib/simulation/build-match";

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
  analyze: (fen: string, depth: number) => Promise<EngineAnalysis | null>;
  /** ms between moves (watchability pacing). */
  moveDelayMs: number;
  /** Which LLM agents are actually configured server-side. */
  configured: Record<string, boolean>;
  /** Allow unconfigured LLM agents to play with the offline heuristic. */
  allowOfflineFallback: boolean;
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
}

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const ANALYSIS_DEPTH = 10;

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

export function useSimulation(opts: SimulationOptions) {
  const { white, black, analyze, moveDelayMs, configured, allowOfflineFallback } = opts;

  const [state, setState] = useState<SimulationState>({
    phase: "idle",
    fen: START_FEN,
    moves: [],
    thinking: null,
    lastMove: null,
    lastEval: null,
    result: null,
    error: null,
    offlineAgents: [],
  });

  const cancelledRef = useRef(false);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const chessRef = useRef<Chess | null>(null);
  if (chessRef.current === null) {
    chessRef.current = new Chess();
  }

  const pickMove = useCallback(
    async (
      chess: Chess,
      agent: SimAgent
    ): Promise<{ from: string; to: string; promotion?: string; san: string; comment: string | null; fromLlm: boolean; fallback: boolean } | null> => {
      if (agent.kind === "heuristic") {
        const mv =
          agent.heuristic === "greedy" ? greedyMove(chess) : randomMove(chess);
        return mv
          ? { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: null, fromLlm: false, fallback: false }
          : null;
      }

      if (agent.kind === "engine") {
        const r = await analyze(chess.fen(), agent.depth ?? 8);
        if (r?.bestMove) {
          try {
            const mv = chess.move({
              from: r.bestMove.slice(0, 2),
              to: r.bestMove.slice(2, 4),
              promotion: r.bestMove[4] as "q" | "r" | "n" | "b" | undefined,
            });
            return { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: null, fromLlm: false, fallback: false };
          } catch {
            /* fall through to heuristic */
          }
        }
        const mv = greedyMove(chess);
        return mv
          ? { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: null, fromLlm: false, fallback: true }
          : null;
      }

      /* llm agent */
      if (!configured[agent.id]) {
        if (!allowOfflineFallback) return null;
        const mv = greedyMove(chess);
        return mv
          ? { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: null, fromLlm: false, fallback: true }
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
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.error === "no-key") {
            const mv = greedyMove(chess);
            return mv
              ? { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: null, fromLlm: false, fallback: true }
              : null;
          }
          throw new Error(data?.message ?? `LLM move failed (${res.status})`);
        }
        const data: LlmMoveReply = await res.json();
        try {
          const mv = chess.move({
            from: data.move.slice(0, 2),
            to: data.move.slice(2, 4),
            promotion: data.move[4] as "q" | "r" | "n" | "b" | undefined,
          });
          return { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: data.comment, fromLlm: true, fallback: data.fallback };
        } catch {
          const mv = greedyMove(chess);
          return mv
            ? { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: null, fromLlm: false, fallback: true }
            : null;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setState((s) => ({ ...s, error: msg }));
        const mv = greedyMove(chess);
        return mv
          ? { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san, comment: null, fromLlm: false, fallback: true }
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

    const chess = new Chess();
    chessRef.current = chess;
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
    });

    (async () => {
      let prevCp = 0;
      let prevMate: number | null = null;

      while (!cancelledRef.current && !chess.isGameOver()) {
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

        const mv = chess.move({
          from: picked.from,
          to: picked.to,
          promotion: picked.promotion,
        });
        const fen = chess.fen();
        const ply = moves.length + 1;

        /* real engine evaluation of the new position */
        let ev: EngineAnalysis | null = null;
        try {
          ev = await analyze(fen, ANALYSIS_DEPTH);
        } catch {
          ev = null;
        }

        const evalCp = ev?.cp ?? null;
        const evalMate = ev?.mate ?? null;

        /* engine-based classification from the swing */
        let classification: Classification = "good";
        if (ev && (evalCp !== null || evalMate !== null)) {
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

        setState((s) => ({
          ...s,
          fen,
          moves: [...moves],
          thinking: null,
          lastMove: { from: mv.from, to: mv.to },
          lastEval: ev
            ? { cp: evalCp ?? 0, mate: evalMate, depth: ev.depth }
            : null,
        }));
      }

      if (cancelledRef.current) {
        runningRef.current = false;
        setState((s) => ({ ...s, phase: "idle", thinking: null }));
        return;
      }

      const result = deriveResult(chess, white, black);
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
  }, [white, black, configured, allowOfflineFallback, moveDelayMs, pickMove, analyze]);

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
  }, []);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return { state, start, pause, resume, stop };
}

function deriveResult(
  chess: Chess,
  white: SimAgent,
  black: SimAgent
): LiveGameResult {
  let result: LiveGameResult;
  if (chess.isCheckmate()) {
    const winnerIsWhite = chess.turn() === "b";
    result = {
      result: winnerIsWhite ? "1-0" : "0-1",
      winnerId: winnerIsWhite ? white.id : black.id,
      reason: "Checkmate",
      pgn: chess.pgn(),
    };
  } else if (chess.isStalemate()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Stalemate", pgn: chess.pgn() };
  } else if (chess.isThreefoldRepetition()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Threefold repetition", pgn: chess.pgn() };
  } else if (chess.isInsufficientMaterial()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Insufficient material", pgn: chess.pgn() };
  } else if (chess.isDraw()) {
    result = { result: "1/2-1/2", winnerId: null, reason: "Draw (50-move rule)", pgn: chess.pgn() };
  } else {
    result = { result: "1/2-1/2", winnerId: null, reason: "Game ended", pgn: chess.pgn() };
  }
  return result;
}

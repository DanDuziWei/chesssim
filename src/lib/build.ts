import { Chess } from "chess.js";
import type {
  Alternative,
  Classification,
  Evaluation,
  MatchResult,
  Move,
  Side,
} from "./types";
import { classifyFromDelta, evalToProxyCp } from "./classify";

export interface MoveAnnotationInput {
  classification?: Classification;
  commentary?: string;
  reasoning?: string;
  alternative?: {
    san: string;
    cp: number;
    mate?: number;
    note?: string;
  };
  tags?: string[];
  /** Optional Chinese narrative; generated from a template when absent. */
  zh?: {
    story?: string;
    reasoning?: string;
  };
}

export interface EvalCheckpoint {
  /** Ply after which this evaluation holds. 0 = start position. */
  ply: number;
  cp: number;
  mate?: number;
}

export interface ExpandedPgn {
  moves: Move[];
  positions: string[];
  moveCount: number;
  finalEvaluation: Evaluation;
  whiteName: string;
  blackName: string;
}

function moveNumberAndColor(ply: number): { moveNumber: number; color: Side } {
  return {
    moveNumber: Math.ceil(ply / 2),
    color: ply % 2 === 1 ? "w" : "b",
  };
}

/** Strip a leading move-number prefix ("12.Nf3", "12...Nf6") down to the bare SAN. */
function stripMoveNumber(san: string): string {
  return san.replace(/^\d+\.(\.\.)?\s*/, "");
}

/** Build a linear interpolation of evaluations across all plies from sparse checkpoints. */
function buildEvaluations(
  checkpoints: EvalCheckpoint[],
  moveCount: number
): Evaluation[] {
  // evaluations[i] = evaluation after ply i (i from 0..moveCount).
  const sorted = [...checkpoints].sort((a, b) => a.ply - b.ply);
  if (sorted.length === 0) sorted.push({ ply: 0, cp: 0 });
  if (sorted[0].ply !== 0) sorted.unshift({ ply: 0, cp: 0 });

  const evals: Evaluation[] = [];
  for (let i = 0; i <= moveCount; i++) {
    // find surrounding checkpoints
    let lo = sorted[0];
    let hi = sorted[sorted.length - 1];
    for (let k = 0; k < sorted.length - 1; k++) {
      if (sorted[k].ply <= i && sorted[k + 1].ply >= i) {
        lo = sorted[k];
        hi = sorted[k + 1];
        break;
      }
    }
    if (lo.ply === hi.ply) {
      evals.push({ cp: lo.cp, ...(lo.mate != null ? { mate: lo.mate } : {}) });
      continue;
    }
    const t = (i - lo.ply) / (hi.ply - lo.ply);
    const cp = lo.cp + (hi.cp - lo.cp) * t;
    evals.push({ cp });
  }
  return evals;
}

function defaultCommentary(
  color: Side,
  san: string,
  classification: Classification,
  evalAfter: Evaluation,
  whiteName: string,
  blackName: string
): string {
  const who = color === "w" ? whiteName : blackName;
  const sign = evalAfter.cp > 0 ? "+" : "";
  const ev = `${sign}${(evalAfter.cp / 100).toFixed(1)}`;

  switch (classification) {
    case "book":
      return `${who} follows established opening theory with ${san}, developing naturally toward the middlegame.`;
    case "brilliant":
      return `${who} uncorks ${san} — a move that redefines the position and is hard to find even for strong engines.`;
    case "excellent":
      return `${who} plays the precise ${san}, tightening control and gaining a durable edge (${ev}).`;
    case "best":
      return `${who} selects ${san}, the engine's top choice, keeping the pressure high.`;
    case "good":
      return `${who} continues with a sound ${san}, holding the balance at ${ev}.`;
    case "inaccuracy":
      return `${who} plays ${san}, slightly imprecise and letting some advantage slip (${ev}).`;
    case "mistake":
      return `${who} errs with ${san}, a genuine mistake that shifts the evaluation to ${ev}.`;
    case "blunder":
      return `${who} blunders with ${san}, and the position turns sharply (${ev}).`;
    default:
      return `${who} plays ${san}.`;
  }
}

function defaultCommentaryZh(
  color: Side,
  san: string,
  classification: Classification,
  evalAfter: Evaluation,
  whiteName: string,
  blackName: string
): string {
  const who = color === "w" ? whiteName : blackName;
  const sign = evalAfter.cp > 0 ? "+" : "";
  const ev = `${sign}${(evalAfter.cp / 100).toFixed(1)}`;

  switch (classification) {
    case "book":
      return `${who} 走出开局理论着法 ${san}，自然地向中局过渡。`;
    case "brilliant":
      return `${who} 下出 ${san}——一步重新定义局面的妙手，即便是强引擎也难以发现。`;
    case "excellent":
      return `${who} 走出精准的 ${san}，进一步收紧控制，获得持久的优势（${ev}）。`;
    case "best":
      return `${who} 选择 ${san}，正是引擎的首选着法，持续施压。`;
    case "good":
      return `${who} 稳健地走出 ${san}，局面维持在 ${ev}。`;
    case "inaccuracy":
      return `${who} 走出 ${san}，略显不够精确，优势有所流失（${ev}）。`;
    case "mistake":
      return `${who} 的 ${san} 是一步真正的失误，评估来到 ${ev}。`;
    case "blunder":
      return `${who} 走出败着 ${san}，局面急转直下（${ev}）。`;
    default:
      return `${who} 走出 ${san}。`;
  }
}

/**
 * Expand a PGN into a fully annotated move list.
 * - Throws with a descriptive message if the PGN is illegal.
 * - `annotations` is keyed by "<moveNumber><color>", e.g. "17b".
 * - `checkpoints` provides the evaluation curve (White perspective).
 */
export function expandPgn(
  pgn: string,
  opts: {
    annotations?: Record<string, MoveAnnotationInput>;
    checkpoints?: EvalCheckpoint[];
    whiteName: string;
    blackName: string;
  }
): ExpandedPgn {
  const probe = new Chess();
  try {
    probe.loadPgn(pgn, { strict: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid PGN: ${msg}`);
  }
  const sans = probe.history();

  const chess = new Chess();
  const annotations = opts.annotations ?? {};
  const positions: string[] = [chess.fen()];
  const alternatives: (Alternative | undefined)[] = [];
  const raw: {
    san: string;
    from: string;
    to: string;
    color: Side;
    fen: string;
    capture: boolean;
    promotion?: string;
    check: boolean;
    checkmate: boolean;
  }[] = [];

  for (let i = 0; i < sans.length; i++) {
    const san = sans[i];
    const { moveNumber, color } = moveNumberAndColor(i + 1);
    const ann = annotations[`${moveNumber}${color}`];

    // Resolve the suggested alternative against the position before this move.
    if (ann?.alternative) {
      const clone = new Chess(chess.fen());
      try {
        const altMv = clone.move(stripMoveNumber(ann.alternative.san));
        alternatives.push({
          san: ann.alternative.san,
          from: altMv.from,
          to: altMv.to,
          evaluation: {
            cp: ann.alternative.cp,
            ...(ann.alternative.mate != null
              ? { mate: ann.alternative.mate }
              : {}),
          },
          note: ann.alternative.note,
        });
      } catch {
        alternatives.push({
          san: ann.alternative.san,
          evaluation: { cp: ann.alternative.cp },
          note: ann.alternative.note,
        });
      }
    } else {
      alternatives.push(undefined);
    }

    let mv;
    try {
      mv = chess.move(san);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Illegal move "${san}" at ply ${i + 1}: ${msg}`);
    }
    raw.push({
      san: san.replace(/[+#!?]/g, ""),
      from: mv.from,
      to: mv.to,
      color: mv.color as Side,
      fen: chess.fen(),
      capture: !!mv.captured,
      promotion: mv.promotion,
      check: /\+/.test(san) || /#/.test(san),
      checkmate: /#/.test(san),
    });
    positions.push(chess.fen());
  }

  const moveCount = raw.length;
  const evals = buildEvaluations(opts.checkpoints ?? [], moveCount);

  const moves: Move[] = raw.map((r, idx) => {
    const ply = idx + 1;
    const { moveNumber, color } = moveNumberAndColor(ply);
    const key = `${moveNumber}${color}`;
    const ann = annotations[key];

    const evalBefore = evals[idx];
    const evalAfter = evals[ply];
    const moverSign = color === "w" ? 1 : -1;
    const delta =
      (evalToProxyCp(evalAfter.cp, evalAfter.mate) -
        evalToProxyCp(evalBefore.cp, evalBefore.mate)) *
      moverSign;

    const classification = ann?.classification ?? classifyFromDelta(delta);
    const commentary =
      ann?.commentary ??
      defaultCommentary(
        color,
        r.san,
        classification,
        evalAfter,
        opts.whiteName,
        opts.blackName
      );

    const zhCommentary =
      ann?.zh?.story ??
      defaultCommentaryZh(
        color,
        r.san,
        classification,
        evalAfter,
        opts.whiteName,
        opts.blackName
      );

    const alternative = alternatives[idx];

    return {
      ply,
      moveNumber,
      color,
      san: r.san,
      from: r.from,
      to: r.to,
      fen: r.fen,
      capture: r.capture,
      check: r.check,
      checkmate: r.checkmate,
      promotion: r.promotion,
      evaluation: evalAfter,
      classification,
      tags: ann?.tags ?? [],
      commentary,
      reasoning: ann?.reasoning,
      alternative,
      zhCommentary,
      zhReasoning: ann?.zh?.reasoning,
    };
  });

  return {
    moves,
    positions,
    moveCount,
    finalEvaluation: evals[moveCount],
    whiteName: opts.whiteName,
    blackName: opts.blackName,
  };
}

export function resultLabel(result: MatchResult, whiteName: string, blackName: string): string {
  switch (result) {
    case "1-0":
      return `${whiteName} wins`;
    case "0-1":
      return `${blackName} wins`;
    case "1/2-1/2":
      return "Draw";
    default:
      return "In progress";
  }
}

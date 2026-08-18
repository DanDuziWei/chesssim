import type {
  Agent,
  Classification,
  Evaluation,
  Language,
  Match,
  Move,
  NarrativeChapter,
} from "@/lib/types";
import type { SimAgent } from "./agents";
import { defaultCommentary, defaultCommentaryZh } from "@/lib/build";

/** One move recorded during a live simulation. */
export interface LiveMove {
  ply: number;
  moveNumber: number;
  color: "w" | "b";
  san: string;
  from: string;
  to: string;
  fen: string;
  capture?: boolean;
  check?: boolean;
  checkmate?: boolean;
  promotion?: string;
  evalCp: number | null;
  mate: number | null;
  depth: number;
  classification: Classification;
  comment: string;
  commentZh: string;
  fromLlm: boolean;
  fallback: boolean;
}

export interface LiveGameResult {
  result: "1-0" | "0-1" | "1/2-1/2";
  winnerId: string | null;
  reason: string;
  pgn: string;
}

/** Convert a SimAgent into the full Agent shape used by the replay UI. */
export function simAgentToAgent(a: SimAgent): Agent {
  return {
    id: a.id,
    name: a.name,
    model: a.model ?? (a.kind === "engine" ? "Stockfish WASM" : "Local heuristic"),
    provider:
      a.provider ??
      (a.kind === "engine" ? "In-browser engine" : "ChessSim baseline"),
    description: a.description,
    initials: a.initials,
    accent: a.accent,
    style: a.style,
    strength: a.strength,
    strategy: a.strategy,
  };
}

function evalOf(lm: LiveMove): Evaluation {
  return {
    cp: lm.evalCp ?? 0,
    ...(lm.mate != null ? { mate: lm.mate } : {}),
  };
}

function fmtEvalText(e: Evaluation): string {
  if (e.mate != null) return `forced mate in ${Math.abs(e.mate)}`;
  const v = e.cp / 100;
  if (Math.abs(v) < 0.3) return "a roughly level position";
  const side = v > 0 ? "White" : "Black";
  return `a ${side} advantage of ${Math.abs(v).toFixed(1)}`;
}

/**
 * Find the move by `side` with the biggest winner-relative evaluation swing:
 * `best = true` → the side's strongest move, `best = false` → its worst.
 */
function biggestSwing(
  moves: LiveMove[],
  side: "w" | "b",
  best: boolean
): LiveMove | null {
  const sideSign = side === "w" ? 1 : -1;
  let sel: LiveMove | null = null;
  let selVal = best ? -Infinity : Infinity;
  for (let i = 1; i < moves.length; i++) {
    const prev = moves[i - 1];
    const cur = moves[i];
    if (cur.color !== side) continue;
    const moverSign = cur.color === "w" ? 1 : -1;
    const delta =
      ((cur.evalCp ?? 0) - (prev.evalCp ?? 0)) * moverSign * sideSign;
    if (best ? delta > selVal : delta < selVal) {
      selVal = delta;
      sel = cur;
    }
  }
  return sel;
}

/**
 * Build a fully replayable Match object from a live simulation, including an
 * auto-generated six-chapter narrative, so the finished game can be watched
 * with the exact same replay experience as the curated matches.
 */
export function buildMatchFromLiveGame(params: {
  slug: string;
  title: string;
  white: SimAgent;
  black: SimAgent;
  moves: LiveMove[];
  startFen: string;
  result: LiveGameResult;
  lang: Language;
}): Match {
  const { white, black, moves, startFen, result, lang } = params;
  const whiteA = simAgentToAgent(white);
  const blackA = simAgentToAgent(black);
  const zh = lang === "zh";

  const positions = [startFen, ...moves.map((m) => m.fen)];

  const moveObjs: Move[] = moves.map((lm) => ({
    ply: lm.ply,
    moveNumber: lm.moveNumber,
    color: lm.color,
    san: lm.san,
    from: lm.from,
    to: lm.to,
    fen: lm.fen,
    capture: lm.capture,
    check: lm.check,
    checkmate: lm.checkmate,
    promotion: lm.promotion,
    evaluation: evalOf(lm),
    classification: lm.classification,
    tags: [],
    commentary: lm.comment,
    reasoning: undefined,
    alternative: undefined,
    zhCommentary: lm.commentZh,
    zhReasoning: undefined,
  }));

  const winnerName = result.winnerId
    ? (result.winnerId === white.id ? white.name : black.name)
    : null;

  const winnerSide: "w" | "b" =
    result.winnerId === black.id ? "b" : "w";
  const loserSide: "w" | "b" = winnerSide === "w" ? "b" : "w";

  const bestForWinner = biggestSwing(moves, winnerSide, true);
  const worstForLoser = biggestSwing(moves, loserSide, false);

  const firstSans = moves.slice(0, 6).map((m) => m.san).join(" ");
  const lastPly = moves.length > 0 ? moves[moves.length - 1].ply : 0;

  const chapters: NarrativeChapter[] = [
    {
      id: "opening",
      title: "Opening",
      zhTitle: "开局",
      text: `The game began ${firstSans}. ${white.name} and ${black.name} developed their forces and staked claims in the centre.`,
      zhText: `对局以 ${firstSans} 开场。${white.name} 与 ${black.name} 各自展开子力，争夺中心。`,
    },
    {
      id: "battle",
      title: "The Battle Begins",
      zhTitle: "战火点燃",
      text:
        moves.length > 8
          ? `By move ${Math.ceil(moves[8].ply / 2)}, the position left pure theory — ${moves[8].color === "w" ? white.name : black.name} struck first with ${moves[8].san}, and the real fight began.`
          : `The game developed quickly and the first skirmishes began.`,
      zhText:
        moves.length > 8
          ? `到第 ${Math.ceil(moves[8].ply / 2)} 回合，局面已经离开理论范畴——${moves[8].color === "w" ? white.name : black.name} 以 ${moves[8].san} 率先出手，真正的战斗开始了。`
          : `对局迅速展开，最初的摩擦开始了。`,
      ply: moves.length > 8 ? moves[8].ply : undefined,
    },
    {
      id: "critical",
      title: "Critical Moment",
      zhTitle: "关键一刻",
      text: worstForLoser
        ? `${worstForLoser.color === "w" ? white.name : black.name}'s ${worstForLoser.san} (move ${Math.ceil(worstForLoser.ply / 2)}) shifted the evaluation to ${fmtEvalText(evalOf(worstForLoser))} — the moment that decided the game's direction.`
        : `The middle game was tense, with both sides probing for weaknesses.`,
      zhText: worstForLoser
        ? `${worstForLoser.color === "w" ? white.name : black.name} 的 ${worstForLoser.san}（第 ${Math.ceil(worstForLoser.ply / 2)} 回合）把评估推向了 ${fmtEvalText(evalOf(worstForLoser))}——正是这一步决定了棋局的走向。`
        : `中局紧张激烈，双方都在试探对方的弱点。`,
      ply: worstForLoser?.ply,
    },
    {
      id: "turning",
      title: "Turning Point",
      zhTitle: "转折点",
      text: bestForWinner
        ? `${bestForWinner.color === "w" ? white.name : black.name} seized control with ${bestForWinner.san} (move ${Math.ceil(bestForWinner.ply / 2)}), converting into ${fmtEvalText(evalOf(bestForWinner))}.`
        : `The position remained balanced deep into the game.`,
      zhText: bestForWinner
        ? `${bestForWinner.color === "w" ? white.name : black.name} 以 ${bestForWinner.san}（第 ${Math.ceil(bestForWinner.ply / 2)} 回合）夺取主动权，局面来到 ${fmtEvalText(evalOf(bestForWinner))}。`
        : `局面直到后段依然保持均衡。`,
      ply: bestForWinner?.ply,
    },
    {
      id: "finale",
      title: "Final Attack",
      zhTitle: "最后总攻",
      text:
        lastPly > 0
          ? `${moves[moves.length - 1].color === "w" ? white.name : black.name} closed the game with ${moves[moves.length - 1].san}. ${result.reason}.`
          : `The game ended early — ${result.reason}.`,
      zhText:
        lastPly > 0
          ? `${moves[moves.length - 1].color === "w" ? white.name : black.name} 以 ${moves[moves.length - 1].san} 结束了战斗。${result.reason}。`
          : `对局提前结束——${result.reason}。`,
      ply: lastPly > 0 ? lastPly : undefined,
    },
    {
      id: "conclusion",
      title: "Conclusion",
      zhTitle: "终局",
      text: winnerName
        ? `${winnerName} won in ${moves.length} plies (${result.reason}). A live simulation generated move by move — every evaluation in this replay was computed by the real Stockfish engine.`
        : `The game ended in a draw after ${moves.length} plies (${result.reason}). A live simulation generated move by move in the ChessSim arena.`,
      zhText: winnerName
        ? `${winnerName} 在 ${moves.length} 个回合内取胜（${result.reason}）。这是一场逐着生成的实时模拟——回放中的每一个评估都由真实 Stockfish 引擎计算。`
        : `对局在 ${moves.length} 个回合后以和棋收场（${result.reason}）。这是一场在 ChessSim 竞技场中逐着生成的实时模拟。`,
    },
  ];

  const summary = winnerName
    ? `${winnerName} defeated ${winnerName === white.name ? black.name : white.name} in ${moves.length} plies — ${result.reason}. The decisive swing came around move ${bestForWinner ? Math.ceil(bestForWinner.ply / 2) : "—"}, and the game was decided by ${fmtEvalText(moves.length ? evalOf(moves[moves.length - 1]) : { cp: 0 })}.`
    : `The match ended in a draw after ${moves.length} plies — ${result.reason}.`;
  const summaryZh = winnerName
    ? `${winnerName} 在 ${moves.length} 个回合内击败 ${winnerName === white.name ? black.name : white.name}——${result.reason}。决定性的一击出现在第 ${bestForWinner ? Math.ceil(bestForWinner.ply / 2) : "—"} 回合附近，棋局最终定格在 ${fmtEvalText(moves.length ? evalOf(moves[moves.length - 1]) : { cp: 0 })}。`
    : `对局在 ${moves.length} 个回合后以和棋收场——${result.reason}。`;

  const theme = `${white.name} vs ${black.name}`;

  return {
    id: params.slug,
    slug: params.slug,
    title: params.title,
    theme,
    simulationNumber: "Live Simulation",
    status: "completed",
    result: result.result,
    resultLabel:
      result.result === "1/2-1/2"
        ? "Draw"
        : `${result.winnerId === white.id ? white.name : black.name} wins`,
    whiteAgentId: white.id,
    blackAgentId: black.id,
    opening: "Live simulation",
    pgn: result.pgn,
    summary,
    summaryZh,
    createdAt: new Date().toISOString(),
    premise: `${white.name} and ${black.name} played a live, move-by-move simulation in the ChessSim arena. Every evaluation was computed by the real Stockfish engine.`,
    moves: moveObjs,
    positions,
    finalEvaluation: moves.length ? evalOf(moves[moves.length - 1]) : { cp: 0 },
    narrative: { chapters, summary, summaryZh },
    moveCount: moves.length,
  };
}

export { defaultCommentary, defaultCommentaryZh };

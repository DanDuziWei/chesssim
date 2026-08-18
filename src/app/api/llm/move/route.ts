import { NextResponse } from "next/server";
import { Chess } from "chess.js";
import { getSimAgent } from "@/lib/simulation/agents";
import { chat, providerAvailable } from "@/lib/llm/providers";
import {
  buildMoveSystemPrompt,
  buildMoveUserPrompt,
  legalMovesAsUci,
  parseMoveResponse,
  resolveLegalMove,
} from "@/lib/llm/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MoveRequestBody {
  agentId: string;
  fen: string;
  history: string[];
  opponentName: string;
}

/**
 * POST /api/llm/move
 * Ask an LLM agent to play one move in the given position.
 * Returns 503 { error: "no-key" } when the provider is not configured,
 * and falls back to a random legal move if the model keeps replying illegally.
 */
export async function POST(req: Request) {
  let body: MoveRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const agent = getSimAgent(body.agentId);
  if (!agent || agent.kind !== "llm" || !agent.provider || !agent.model) {
    return NextResponse.json({ error: "unknown-agent" }, { status: 404 });
  }

  if (!providerAvailable(agent.provider)) {
    return NextResponse.json(
      { error: "no-key", message: `${agent.name} is not configured on the server.` },
      { status: 503 }
    );
  }

  let chess: Chess;
  try {
    chess = new Chess(body.fen);
  } catch {
    return NextResponse.json({ error: "invalid-fen" }, { status: 400 });
  }

  const legalMoves = legalMovesAsUci(chess);
  if (legalMoves.length === 0) {
    return NextResponse.json({ error: "game-over" }, { status: 409 });
  }

  const colorLabel = chess.turn() === "w" ? "White" : "Black";
  const system = buildMoveSystemPrompt({
    agentName: agent.name,
    opponentName: body.opponentName ?? "the opponent",
    fen: body.fen,
    history: body.history ?? [],
    legalMoves: legalMoves,
    colorLabel,
  });
  const user = buildMoveUserPrompt({
    agentName: agent.name,
    opponentName: body.opponentName ?? "the opponent",
    fen: body.fen,
    history: body.history ?? [],
    legalMoves: legalMoves,
    colorLabel,
  });

  const ATTEMPTS = 2;
  let lastError = "";
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const raw = await chat(agent.provider, agent.model, system, user, {
        maxTokens: 220,
        temperature: 0.6,
      });
      const parsed = parseMoveResponse(raw);
      if (parsed.move) {
        const legal = resolveLegalMove(chess, parsed.move);
        if (legal) {
          return NextResponse.json({
            move: `${legal.from}${legal.to}${legal.promotion ?? ""}`,
            san: legal.san,
            comment: parsed.comment,
            fallback: false,
          });
        }
        lastError = `illegal move "${parsed.move}"`;
      } else {
        lastError = "no move found in response";
      }
      user + `\n\nYour previous answer was invalid (${lastError}). Reply again with MOVE: and COMMENT: lines using only legal moves.`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      break; // network/provider error — do not retry
    }
  }

  // Honest fallback: a random legal move so the game can continue.
  const fallback = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  const legal = resolveLegalMove(chess, fallback);
  return NextResponse.json({
    move: `${legal?.from}${legal?.to}${legal?.promotion ?? ""}`,
    san: legal?.san ?? fallback,
    comment: `${agent.name} failed to produce a legal move (${lastError}) and fell back to a random legal move.`,
    fallback: true,
  });
}

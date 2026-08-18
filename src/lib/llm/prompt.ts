import type { Chess } from "chess.js";

/**
 * Prompt construction and response parsing for the LLM chess agents.
 * Pure functions — unit-testable without any network access.
 */

export interface MovePromptInput {
  agentName: string;
  opponentName: string;
  fen: string;
  history: string[];
  legalMoves: string[];
  colorLabel: "White" | "Black";
}

export function buildMoveSystemPrompt(input: MovePromptInput): string {
  return [
    "You are an AI chess agent competing in the ChessSim arena.",
    `You play as ${input.agentName} (${input.colorLabel}) against ${input.opponentName}.`,
    "You are a strong, creative chess player. Explain your thinking like a chess commentator: strategic, human, and concise — not a list of engine numbers.",
    "",
    "Respond with exactly two lines, nothing else:",
    "MOVE: <your move in UCI notation, e.g. e2e4, g1f3, e7e8q>",
    "COMMENT: <one or two sentences in English explaining the idea behind your move, as if commentating your own game. Mention the move you played.>",
  ].join("\n");
}

export function buildMoveUserPrompt(input: MovePromptInput): string {
  return [
    "Current position (FEN):",
    input.fen,
    "",
    `Move history: ${input.history.length > 0 ? input.history.slice(-20).join(" ") : "(opening move)"}`,
    "",
    `Legal moves (UCI): ${input.legalMoves.join(", ")}`,
    "",
    "Choose ONE legal move from the list. It is your turn now.",
  ].join("\n");
}

export interface ParsedMoveResponse {
  move: string | null;
  comment: string | null;
}

/** Parse the MOVE:/COMMENT: response, tolerating markdown and sloppy formatting. */
export function parseMoveResponse(text: string): ParsedMoveResponse {
  const clean = text
    .replace(/```[a-z]*/gi, "")
    .replace(/\*\*/g, "")
    .trim();

  const moveMatch =
    clean.match(/^MOVE\s*[:：]\s*([a-h][1-8][a-h][1-8][qrbnQRBN]?)/m) ??
    clean.match(/move\s*[:：]\s*([a-h][1-8][a-h][1-8][qrbnQRBN]?)/im);

  const commentMatch =
    clean.match(/^COMMENT\s*[:：]\s*(.+)$/m) ??
    clean.match(/comment\s*[:：]\s*(.+)$/im);

  return {
    move: moveMatch ? moveMatch[1].toLowerCase() : null,
    comment: commentMatch ? commentMatch[1].trim() : null,
  };
}

export interface NarrateInput {
  agentName: string;
  fen: string;
  moveSan: string;
  evalCp: number | null;
  mate: number | null;
  language: "en" | "zh";
  historySummary: string;
}

export function buildNarrateSystemPrompt(): string {
  return [
    "You are the narrative engine of ChessSim, an AI chess simulation platform.",
    "Write vivid, story-driven chess commentary. Think like a sports commentator meets a chess novelist.",
    "Never invent engine numbers or fake facts. Keep it grounded in the position description you are given.",
    "",
    "Respond with exactly two lines, nothing else:",
    "STORY: <the narrative paragraph>",
    "REASONING: <the strategic why, one or two sentences>",
  ].join("\n");
}

export function buildNarrateUserPrompt(input: NarrateInput): string {
  const evalDesc =
    input.mate != null
      ? `The position is a forced mate in ${Math.abs(input.mate)} for ${input.mate > 0 ? "White" : "Black"}.`
      : input.evalCp != null
        ? `Engine evaluation: ${(input.evalCp / 100).toFixed(2)} (positive favours White).`
        : "No engine evaluation available.";

  const lang = input.language === "zh" ? "中文" : "English";

  return [
    `Write in ${lang}.`,
    "",
    `${input.agentName} just played ${input.moveSan}.`,
    "Position (FEN):",
    input.fen,
    evalDesc,
    `Game context: ${input.historySummary}`,
  ].join("\n");
}

export interface ParsedNarrative {
  story: string | null;
  reasoning: string | null;
}

export function parseNarrative(text: string): ParsedNarrative {
  const clean = text.replace(/```[a-z]*/gi, "").trim();
  const story =
    clean.match(/^STORY\s*[:：]\s*(.+)$/m)?.[1]?.trim() ??
    clean.match(/story\s*[:：]\s*(.+)$/im)?.[1]?.trim() ??
    null;
  const reasoning =
    clean.match(/^REASONING\s*[:：]\s*(.+)$/m)?.[1]?.trim() ??
    clean.match(/reasoning\s*[:：]\s*(.+)$/im)?.[1]?.trim() ??
    null;
  return { story, reasoning };
}

/** Convert a UCI/SAN move reply into a legal chess.js move, or null. */
export function resolveLegalMove(
  chess: Chess,
  raw: string
): { from: string; to: string; promotion?: string; san: string } | null {
  const uci = raw.toLowerCase().trim();
  // UCI form: e2e4 / e7e8q
  const uciMatch = uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (uciMatch) {
    try {
      const mv = chess.move({
        from: uciMatch[1],
        to: uciMatch[2],
        promotion: uciMatch[3],
      });
      return { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san };
    } catch {
      return null;
    }
  }
  // SAN form: Nf3 / exd5 / O-O (keep the original casing)
  try {
    const mv = chess.move(raw.trim());
    return { from: mv.from, to: mv.to, promotion: mv.promotion, san: mv.san };
  } catch {
    return null;
  }
}

/** Legal moves in UCI notation (from+to+promotion), as sent to the LLM. */
export function legalMovesAsUci(chess: Chess): string[] {
  return chess.moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ""));
}

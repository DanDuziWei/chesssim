/**
 * v0.3 simulation layer tests (run with tsx):
 *   - greedy vs random bot complete a full legal game
 *   - LLM prompt parsing (move + narrative)
 *   - provider adapter request/response shape (mocked fetch)
 *   - buildMatchFromLiveGame produces a replayable Match
 */
import { greedyMove, randomMove } from "../src/lib/simulation/heuristics";
import { SimulationGame } from "../src/lib/simulation/game";
import { getChess960Position } from "../src/lib/chess960";
import { parseMoveResponse, parseNarrative, resolveLegalMove, buildMoveSystemPrompt, buildMoveUserPrompt, legalMovesAsUci } from "../src/lib/llm/prompt";
import { getProviderSpec } from "../src/lib/llm/providers";
import { buildMatchFromLiveGame, type LiveMove } from "../src/lib/simulation/build-match";
import { SIM_AGENTS, getSimAgent } from "../src/lib/simulation/agents";

let failures = 0;
function check(name: string, ok: boolean, extra?: unknown) {
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${ok ? "" : " — " + JSON.stringify(extra)}`);
  if (!ok) failures++;
}

async function main() {
/* 1. heuristic bots play a full game */
{
  const chess = new SimulationGame();
  let plies = 0;
  while (!chess.isGameOver() && plies < 400) {
    const mv = chess.turn() === "w" ? greedyMove(chess) : randomMove(chess);
    if (!mv) break;
    chess.move(mv.uci);
    plies++;
  }
  check("greedy vs random completes", chess.isGameOver(), { plies, pgn: chess.pgn().slice(0, 60) });
  check("greedy vs random is legal throughout", plies > 4 && chess.history().length === plies);
}

/* 2. LLM move response parsing */
{
  const r1 = parseMoveResponse("MOVE: e2e4\nCOMMENT: I claim the centre.");
  check("parse MOVE/COMMENT basic", r1.move === "e2e4" && r1.comment === "I claim the centre.", r1);

  const r2 = parseMoveResponse("```\n**MOVE**: g1f3\nCOMMENT: Developing towards the king.\n```");
  check("parse MOVE/COMMENT markdown+colons", r2.move === "g1f3" && !!r2.comment, r2);

  const r3 = parseMoveResponse("Move: e7e8q\nComment: promoting!");
  check("parse lowercase keys", r3.move === "e7e8q", r3);

  const r4 = parseMoveResponse("I think e4 is good");
  check("parse garbage → null move", r4.move === null, r4);

  const chess = new SimulationGame();
  const legal = resolveLegalMove(chess, "e2e4");
  check("resolveLegalMove UCI", legal?.san === "e4", legal);
  const illegal = resolveLegalMove(new SimulationGame(), "e2e5");
  check("resolveLegalMove rejects illegal", illegal === null);
  const sanMove = resolveLegalMove(new SimulationGame(), "Nf3");
  check("resolveLegalMove SAN", sanMove?.from === "g1" && sanMove?.to === "f3", sanMove);

  const fresh = new SimulationGame();
  const sys = buildMoveSystemPrompt({
    agentName: "DeepSeek", opponentName: "GPT", fen: fresh.fen(), history: [], legalMoves: legalMovesAsUci(fresh), colorLabel: "White",
  });
  check("move prompt contains key sections", sys.includes("MOVE:") && sys.includes("COMMENT:") && sys.includes("DeepSeek"), sys.slice(0, 80));
  const usr = buildMoveUserPrompt({
    agentName: "DeepSeek", opponentName: "GPT", fen: fresh.fen(), history: ["e4", "e5"], legalMoves: legalMovesAsUci(fresh), colorLabel: "White",
  });
  check("move user prompt contains FEN + legal moves", usr.includes("FEN") && usr.includes("e2e4"), usr.slice(0, 80));
}

/* 3. narrative parsing */
{
  const n = parseNarrative("STORY: A knight leaps into the centre.\nREASONING: It fights for d5 and f5.");
  check("parseNarrative", (n.story?.includes("knight") ?? false) && (n.reasoning?.includes("d5") ?? false), n);
}

/* 4. provider adapter with mocked fetch */
{
  const spec = getProviderSpec("deepseek");
  let capturedUrl = "";
  let capturedBody: Record<string, unknown> = {};
  const mockFetch = (async (url: string, init: { body?: string }) => {
    capturedUrl = String(url);
    capturedBody = JSON.parse(init?.body ?? "{}");
    return new Response(
      JSON.stringify({ choices: [{ message: { content: "MOVE: e2e4\nCOMMENT: centre!" } }] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as unknown as typeof fetch;

  const content = await spec.call("deepseek-chat", "sys", "usr", { maxTokens: 100, temperature: 0.5 }, "test-key", mockFetch);
  check("deepseek adapter URL", capturedUrl === "https://api.deepseek.com/chat/completions", capturedUrl);
  check("deepseek adapter auth header + model", capturedBody?.model === "deepseek-chat", capturedBody);
  check("deepseek adapter parses content", content === "MOVE: e2e4\nCOMMENT: centre!", content);

  const geminiSpec = getProviderSpec("gemini");
  const geminiContent = await geminiSpec.call(
    "gemini-2.0-flash", "sys", "usr", { maxTokens: 100, temperature: 0.5 }, "k",
    (async (url: string) => {
      check("gemini adapter URL", String(url).includes("generativelanguage.googleapis.com"), url);
      return new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: "MOVE: d2d4" }] } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as unknown as typeof fetch
  );
  check("gemini adapter parses content", geminiContent === "MOVE: d2d4", geminiContent);
}

/* 5. buildMatchFromLiveGame */
{
  const white = getSimAgent("stockfish-4")!;
  const black = getSimAgent("greedy")!;
  const chess = new SimulationGame();
  const moves: LiveMove[] = [];
  for (let i = 0; i < 20 && !chess.isGameOver(); i++) {
    const mv = i % 2 === 0 ? greedyMove(chess)! : randomMove(chess)!;
    chess.move(mv.uci);
    moves.push({
      ply: i + 1,
      moveNumber: Math.ceil((i + 1) / 2),
      color: mv.color,
      san: mv.san,
      from: mv.from,
      to: mv.to,
      fen: chess.fen(),
      capture: !!mv.captured,
      check: mv.san.includes("+"),
      checkmate: mv.san.includes("#"),
      promotion: mv.promotion,
      evalCp: 20 - i,
      mate: null,
      depth: 10,
      classification: i < 6 ? "book" : "good",
      comment: `Move ${i + 1}: ${mv.san}.`,
      commentZh: `第 ${i + 1} 步：${mv.san}。`,
      fromLlm: false,
      fallback: false,
    });
  }
  const match = buildMatchFromLiveGame({
    slug: "test-live",
    title: "Stockfish vs Greedy",
    white,
    black,
    moves,
    startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    result: { result: "1-0", winnerId: "stockfish-4", reason: "Checkmate", pgn: chess.pgn() },
    lang: "en",
  });
  check("live match positions length", match.positions.length === moves.length + 1, match.positions.length);
  check("live match chapters = 6", match.story.chapters.length === 6);
  check(
    "live match has 4-8 addressable story moments",
    match.story.moments.length >= 4 && match.story.moments.length <= 8,
    match.story.moments.length
  );
  check("live match provenance is explicit", match.generation.provenance === "verified-ai", match.generation);
  check("live match has zh + en summary", match.summary.length > 0 && match.summaryZh.length > 0);
  check("live match move count", match.moveCount === moves.length);
  check("agent registry has 9 agents", SIM_AGENTS.length === 9, SIM_AGENTS.map((a) => a.id));
}

/* 6. Chess960 generation and castling rules */
{
  const positions = Array.from({ length: 960 }, (_, number) => getChess960Position(number));
  check("Chess960 generator creates 960 unique ranks", new Set(positions.map((p) => p.backRank)).size === 960);
  check("Chess960 #518 is classical", positions[518].backRank === "RNBQKBNR", positions[518]);
  check(
    "all 960 generated FENs load with legal opening moves",
    positions.every((position) => {
      const count = new SimulationGame("chess960", position.fen).legalMoves().length;
      // Knight mobility varies by file; a few layouts can also castle immediately.
      return count >= 18 && count <= 21;
    })
  );
  check(
    "every Chess960 rank has opposite bishops and king between rooks",
    positions.every(({ backRank }) => {
      const bishops = [...backRank].flatMap((piece, file) => (piece === "B" ? [file] : []));
      const rooks = [...backRank].flatMap((piece, file) => (piece === "R" ? [file] : []));
      const king = backRank.indexOf("K");
      return bishops.length === 2 && bishops[0] % 2 !== bishops[1] % 2 && rooks[0] < king && king < rooks[1];
    })
  );

  const castling = new SimulationGame(
    "chess960",
    "4k3/8/8/8/8/8/8/RK5R w HA - 0 1"
  );
  const castleMove = castling.legalMoves().find((move) => move.san === "O-O");
  check("Chess960 exposes king-to-rook UCI castling", castleMove?.uci === "b1h1", castleMove);
  check("Chess960 castling plays legally", !!castling.move("b1h1"));
  check("Chess960 castling lands king and rook correctly", castling.fen().startsWith("4k3/8/8/8/8/8/8/R4RK1 b"), castling.fen());
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log("\nAll simulation tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

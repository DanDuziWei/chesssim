/**
 * Stockfish smoke test (Node).
 * Runs the vendored asm.js build inside a vm sandbox that emulates a classic
 * Web Worker scope, then drives it through src/lib/stockfish.ts.
 *
 * Usage: node scripts/test-stockfish.mjs
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const enginePath = path.join(__dirname, "..", "public", "engine", "stockfish.asm.js");
const code = readFileSync(enginePath, "utf8");

// --- build the worker-like sandbox ---
const out = [];
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  crypto: webcrypto,
  location: { href: "https://example.com/engine/stockfish.asm.js" },
  postMessage: (m) => {
    out.push(String(m));
  },
  close: () => {},
  onmessage: null,
};
sandbox.self = sandbox;

vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: "stockfish.asm.js" });

if (typeof sandbox.onmessage !== "function") {
  console.error("FAIL: engine did not register a global onmessage");
  process.exit(1);
}

// --- drive it with the real client ---
const { createEngineClient, parseInfoLine, toWhitePerspective } = await import(
  path.join(__dirname, "..", "src", "lib", "stockfish.ts")
);

// 1. parser sanity
const parsed = parseInfoLine("info depth 12 seldepth 18 multipv 1 score cp 42 nodes 100000 nps 500000 pv e2e4 e7e5");
if (!parsed || parsed.cp !== 42 || parsed.depth !== 12) {
  console.error("FAIL: parseInfoLine", parsed);
  process.exit(1);
}
const parsedMate = parseInfoLine("info depth 8 score mate -3 pv g1f3");
if (!parsedMate || parsedMate.mate !== -3) {
  console.error("FAIL: parseInfoLine mate", parsedMate);
  process.exit(1);
}
console.log("OK   parseInfoLine");

const blackToMove = toWhitePerspective(
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  { cp: 35, mate: null }
);
if (blackToMove.cp !== -35) {
  console.error("FAIL: black-to-move score was not normalized to White POV", blackToMove);
  process.exit(1);
}
console.log("OK   normalize UCI score to White perspective");

// 2. cancellation race: a stale bestmove must be drained before the newest
// position starts, and superseded queued requests must never start a search.
const fakePort = { onmessage: null, commands: [] };
fakePort.postMessage = (command) => fakePort.commands.push(command);
const raceClient = createEngineClient(fakePort);
const FEN_A = "8/8/8/8/8/8/8/K6k w - - 0 1";
const FEN_B = "8/8/8/8/8/8/8/K6k b - - 0 1";
const FEN_C = "8/8/8/8/8/8/K7/7k w - - 0 1";
const aPromise = raceClient.analyze(FEN_A, { depth: 4 });
await Promise.resolve();
const bPromise = raceClient.analyze(FEN_B, { depth: 4 });
const cPromise = raceClient.analyze(FEN_C, { depth: 4 });
fakePort.onmessage({ data: "info depth 4 score cp 999 pv a1a2" });
fakePort.onmessage({ data: "bestmove a1a2" });
await Promise.resolve();
await Promise.resolve();

const searchedPositions = fakePort.commands.filter((command) => command.startsWith("position fen "));
if (
  searchedPositions.length !== 2 ||
  searchedPositions[0] !== `position fen ${FEN_A}` ||
  searchedPositions[1] !== `position fen ${FEN_C}`
) {
  console.error("FAIL: latest-request-wins search queue", fakePort.commands);
  process.exit(1);
}
fakePort.onmessage({ data: "info depth 4 score cp 25 pv a2a3" });
fakePort.onmessage({ data: "bestmove a2a3" });
const [, bResult, cResult] = await Promise.all([aPromise, bPromise, cPromise]);
if (bResult.bestMove !== null || cResult.bestMove !== "a2a3" || cResult.cp !== 25) {
  console.error("FAIL: cancellation result isolation", { bResult, cResult });
  process.exit(1);
}
raceClient.destroy();
console.log("OK   rapid navigation keeps only the newest engine search");

// 3. engine handshake + real analysis
// The engine posts raw strings via global postMessage; forward them into the
// client through a Worker-like `port` object.
const port = { postMessage: null, onmessage: null };
port.postMessage = (m) => {
  queueMicrotask(() => sandbox.onmessage({ data: m }));
};
sandbox.postMessage = (m) => {
  port.onmessage?.({ data: m });
};

const client = createEngineClient(port);
await client.ready();
console.log("OK   engine ready (uciok + readyok)");

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const r1 = await client.analyze(START, { depth: 12 });
console.log(
  `OK   startpos depth ${r1.depth}: cp=${r1.cp} mate=${r1.mate} bestmove=${r1.bestMove}`
);
if (r1.bestMove === null) {
  console.error("FAIL: no bestmove for startpos");
  process.exit(1);
}

const MATE_FEN = "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1";
const r2 = await client.analyze(MATE_FEN, { depth: 12 });
console.log(
  `OK   mate-in-1: cp=${r2.cp} mate=${r2.mate} bestmove=${r2.bestMove}`
);
if (r2.mate === null || r2.bestMove === null) {
  console.error("FAIL: engine did not find the mate");
  process.exit(1);
}

const OPERA_SACRIFICE_FEN =
  "rn2kb1r/p3qppp/2p2n2/1N2p1B1/2B1P3/1Q6/PPP2PPP/R3K2R b KQkq - 0 10";
const r3 = await client.analyze(OPERA_SACRIFICE_FEN, { depth: 18 });
console.log(
  `OK   Opera sacrifice depth ${r3.depth}: cp=${r3.cp} mate=${r3.mate} bestmove=${r3.bestMove}`
);
if (r3.cp === null || r3.cp < 100 || r3.bestMove !== "e7b4") {
  console.error("FAIL: Opera sacrifice score was not normalized to White POV", r3);
  process.exit(1);
}

const CHESS960_START =
  "bbqnnrkr/pppppppp/8/8/8/8/PPPPPPPP/BBQNNRKR w HFhf - 0 1";
const r960 = await client.analyze(CHESS960_START, { depth: 10, chess960: true });
console.log(
  `OK   Chess960 depth ${r960.depth}: cp=${r960.cp} mate=${r960.mate} bestmove=${r960.bestMove}`
);
if (r960.bestMove === null) {
  console.error("FAIL: engine did not analyze the Chess960 position", r960);
  process.exit(1);
}

client.destroy();
console.log("\nStockfish smoke test passed.");

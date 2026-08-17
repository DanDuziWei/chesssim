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
const { createEngineClient, parseInfoLine } = await import(
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

// 2. engine handshake + real analysis
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

client.destroy();
console.log("\nStockfish smoke test passed.");

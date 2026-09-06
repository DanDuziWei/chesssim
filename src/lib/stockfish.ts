/**
 * Minimal UCI client for a Stockfish worker (stockfish.js / WASM build).
 * Works with any `port` exposing the Worker postMessage/onmessage shape,
 * which also lets us smoke-test it in Node with a small shim.
 */

export interface EnginePort {
  postMessage(message: string): void;
  onmessage?: ((event: MessageEvent) => void) | null;
  addEventListener?(type: string, listener: (event: MessageEvent) => void): void;
  terminate?(): void;
}

export interface EngineAnalysis {
  fen: string;
  /** Centipawns from White's perspective (null if mate score). */
  cp: number | null;
  /** Signed moves-to-mate (null when no mate found). */
  mate: number | null;
  depth: number;
  /** Best move in UCI notation, e.g. "e2e4" / "e7e8q". */
  bestMove: string | null;
}

export interface AnalyzeOptions {
  depth?: number;
  /** Enables Stockfish's Chess960 castling/UCI interpretation. */
  chess960?: boolean;
  /** Search time cap in ms. A short grace period is allowed after `stop`. */
  movetime?: number;
}

/** UCI scores are relative to the side to move; ChessSim stores White POV. */
export function toWhitePerspective(
  fen: string,
  score: { cp: number | null; mate: number | null }
): { cp: number | null; mate: number | null } {
  const sideToMove = fen.split(" ")[1];
  const sign = sideToMove === "b" ? -1 : 1;
  return {
    cp: score.cp == null ? null : score.cp * sign,
    mate: score.mate == null ? null : score.mate * sign,
  };
}

/** Parse an `info ...` UCI line into a partial evaluation. */
export function parseInfoLine(line: string): { depth: number; cp: number | null; mate: number | null } | null {
  if (!line.startsWith("info ")) return null;
  let depth = 0;
  let cp: number | null = null;
  let mate: number | null = null;
  const parts = line.split(" ");
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] === "depth" && parts[i + 1]) depth = parseInt(parts[i + 1], 10);
    if (parts[i] === "score" && parts[i + 1] === "cp" && parts[i + 2]) {
      cp = parseInt(parts[i + 2], 10);
    }
    if (parts[i] === "score" && parts[i + 1] === "mate" && parts[i + 2]) {
      mate = parseInt(parts[i + 2], 10);
    }
  }
  if (!line.includes(" score ")) return null;
  return { depth, cp, mate };
}

const READY_TIMEOUT_MS = 15000;
const STOP_GRACE_MS = 400;

export function createEngineClient(port: EnginePort) {
  let uciOkResolve: (() => void) | null = null;
  let readyResolve: (() => void) | null = null;

  let currentAnalyze: {
    fen: string;
    resolve: (r: EngineAnalysis) => void;
    reject: (e: Error) => void;
    lastInfo: { depth: number; cp: number | null; mate: number | null };
    timeout: ReturnType<typeof setTimeout>;
    hardTimeout: ReturnType<typeof setTimeout> | null;
  } | null = null;

  /** Set when a search was interrupted: the next `bestmove` is stale and ignored. */
  let ignoreNextBestmove = false;
  let drainPromise: Promise<void> = Promise.resolve();
  let drainResolve: (() => void) | null = null;
  let analyzeGeneration = 0;
  let destroyed = false;

  const handleLine = (raw: unknown) => {
    const line = String(raw);
    if (line === "uciok") {
      uciOkResolve?.();
      uciOkResolve = null;
      return;
    }
    if (line === "readyok") {
      readyResolve?.();
      readyResolve = null;
      return;
    }
    if (line.startsWith("info ")) {
      const parsed = parseInfoLine(line);
      if (parsed && currentAnalyze) currentAnalyze.lastInfo = parsed;
      return;
    }
    if (line.startsWith("bestmove ")) {
      if (ignoreNextBestmove) {
        // Stale bestmove from a cancelled search.
        ignoreNextBestmove = false;
        drainResolve?.();
        drainResolve = null;
        return;
      }
      const a = currentAnalyze;
      if (!a) return;
      currentAnalyze = null;
      clearTimeout(a.timeout);
      if (a.hardTimeout) clearTimeout(a.hardTimeout);
      const best = line.split(" ")[1];
      const whiteScore = toWhitePerspective(a.fen, a.lastInfo);
      a.resolve({
        fen: a.fen,
        cp: whiteScore.cp,
        mate: whiteScore.mate,
        depth: a.lastInfo.depth,
        bestMove: best && best !== "(none)" ? best : null,
      });
    }
  };

  const onMessage = (event: MessageEvent) => handleLine(event.data);

  if (port.onmessage !== undefined) {
    port.onmessage = onMessage;
  } else {
    port.addEventListener?.("message", onMessage);
  }

  function send(cmd: string) {
    if (destroyed) throw new Error("Engine client destroyed");
    port.postMessage(cmd);
  }

  /** Send uci/isready handshake; resolves when the engine is ready. */
  function ready(): Promise<void> {
    if (destroyed) return Promise.reject(new Error("Engine client destroyed"));

    const readyPromise = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        readyResolve = null;
        reject(new Error("Stockfish ready timeout"));
      }, READY_TIMEOUT_MS);
      readyResolve = () => {
        clearTimeout(timer);
        resolve();
      };
    });

    const uciPromise = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        uciOkResolve = null;
        reject(new Error("Stockfish uci timeout"));
      }, READY_TIMEOUT_MS);
      uciOkResolve = () => {
        clearTimeout(timer);
        resolve();
      };
    });

    // NOTE: this WASM build is already single-threaded (Threads 1, fixed Hash),
    // and it deadlocks on `setoption name Threads ...` — so we skip setoption
    // entirely and just handshake.
    send("uci");
    send("isready");

    return Promise.all([uciPromise, readyPromise]).then(() => undefined);
  }

  function emptyAnalysis(fen: string): EngineAnalysis {
    return { fen, cp: null, mate: null, depth: 0, bestMove: null };
  }

  /**
   * Interrupt an in-flight search and wait for its stale `bestmove` before a
   * new `position` command is sent. UCI engines finish `stop` asynchronously;
   * without this drain, rapid story navigation can attach old `info` lines to
   * the newly selected position.
   */
  function interruptCurrentSearch(): Promise<void> {
    if (!currentAnalyze) return drainPromise;

    const a = currentAnalyze;
    currentAnalyze = null;
    clearTimeout(a.timeout);
    if (a.hardTimeout) clearTimeout(a.hardTimeout);
    ignoreNextBestmove = true;
    drainPromise = new Promise<void>((resolve) => {
      drainResolve = resolve;
    });
    send("stop");
    a.resolve({
      fen: a.fen,
      ...toWhitePerspective(a.fen, a.lastInfo),
      depth: a.lastInfo.depth,
      bestMove: null,
    });
    return drainPromise;
  }

  /** Analyze a FEN. Latest request wins after any previous search is drained. */
  async function analyze(fen: string, opts: AnalyzeOptions = {}): Promise<EngineAnalysis> {
    if (destroyed) return Promise.reject(new Error("Engine client destroyed"));
    const requestGeneration = ++analyzeGeneration;
    await interruptCurrentSearch();

    if (destroyed) throw new Error("Engine client destroyed");
    if (requestGeneration !== analyzeGeneration) return emptyAnalysis(fen);

    const depth = opts.depth ?? 14;

    return new Promise<EngineAnalysis>((resolve, reject) => {
      let analysis: NonNullable<typeof currentAnalyze>;
      const timeout = setTimeout(() => {
        if (currentAnalyze !== analysis) return;

        // Ask Stockfish for its current best move, but never wait forever. Some
        // builds do not emit `bestmove` for terminal/malformed searches.
        send("stop");
        analysis.hardTimeout = setTimeout(() => {
          if (currentAnalyze !== analysis) return;
          currentAnalyze = null;
          destroyed = true;
          port.terminate?.();
          reject(new Error("Stockfish analysis timeout"));
        }, STOP_GRACE_MS);
      }, Math.max(800, opts.movetime ?? 8000));

      analysis = {
        fen,
        resolve,
        reject,
        lastInfo: { depth: 0, cp: null, mate: null },
        timeout,
        hardTimeout: null,
      };
      currentAnalyze = analysis;
      send(`setoption name UCI_Chess960 value ${opts.chess960 ? "true" : "false"}`);
      send(`position fen ${fen}`);
      if (opts.movetime) {
        send(`go movetime ${opts.movetime}`);
      } else {
        send(`go depth ${depth}`);
      }
    }).catch((err) => {
      currentAnalyze = null;
      throw err;
    });
  }

  /** Interrupt any in-flight search (the engine replies with a stale bestmove we drop). */
  function stop() {
    analyzeGeneration++;
    void interruptCurrentSearch();
  }

  function destroy() {
    if (destroyed) return;
    stop();
    destroyed = true;
    port.terminate?.();
  }

  return { ready, analyze, stop, destroy };
}

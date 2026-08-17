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
  /** Hard time cap in ms (soft cap; Stockfish finishes the current iteration). */
  movetime?: number;
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

export function createEngineClient(port: EnginePort) {
  let uciOkResolve: (() => void) | null = null;
  let readyResolve: (() => void) | null = null;

  let currentAnalyze: {
    fen: string;
    resolve: (r: EngineAnalysis) => void;
    reject: (e: Error) => void;
    lastInfo: { depth: number; cp: number | null; mate: number | null };
    timeout: ReturnType<typeof setTimeout>;
  } | null = null;

  /** Set when a search was interrupted: the next `bestmove` is stale and ignored. */
  let ignoreNextBestmove = false;
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
        return;
      }
      const a = currentAnalyze;
      if (!a) return;
      currentAnalyze = null;
      clearTimeout(a.timeout);
      const best = line.split(" ")[1];
      a.resolve({
        fen: a.fen,
        cp: a.lastInfo.cp,
        mate: a.lastInfo.mate,
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

  /** Analyze a FEN. Stops any in-flight search first. */
  function analyze(fen: string, opts: AnalyzeOptions = {}): Promise<EngineAnalysis> {
    if (destroyed) return Promise.reject(new Error("Engine client destroyed"));
    stop();

    const depth = opts.depth ?? 14;

    return new Promise<EngineAnalysis>((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Soft cap: ask for bestmove now; Stockfish returns the current iteration.
        if (currentAnalyze) {
          send("stop");
        } else {
          resolve({
            fen,
            cp: null,
            mate: null,
            depth: 0,
            bestMove: null,
          });
        }
      }, Math.max(800, opts.movetime ?? 8000));

      currentAnalyze = {
        fen,
        resolve,
        reject,
        lastInfo: { depth: 0, cp: null, mate: null },
        timeout,
      };
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
    if (currentAnalyze) {
      const a = currentAnalyze;
      currentAnalyze = null;
      clearTimeout(a.timeout);
      ignoreNextBestmove = true;
      send("stop");
      a.resolve({
        fen: a.fen,
        cp: a.lastInfo.cp,
        mate: a.lastInfo.mate,
        depth: a.lastInfo.depth,
        bestMove: null,
      });
    }
  }

  function destroy() {
    destroyed = true;
    stop();
    port.terminate?.();
  }

  return { ready, analyze, stop, destroy };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createEngineClient, type EngineAnalysis } from "@/lib/stockfish";

export type EngineStatus = "idle" | "loading" | "ready" | "error";

const ENGINE_WORKER_PATH = "/engine/stockfish.wasm.js";

/**
 * Lazy client-side Stockfish hook.
 * Spawns the WASM engine in a Web Worker on first use and exposes `analyze`.
 */
export function useStockfish() {
  const clientRef = useRef<ReturnType<typeof createEngineClient> | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<EngineStatus>("idle");

  const ensure = useCallback(async () => {
    if (clientRef.current) return clientRef.current;

    setStatus("loading");
    try {
      const worker = new Worker(ENGINE_WORKER_PATH);
      workerRef.current = worker;
      const client = createEngineClient(worker);
      await client.ready();
      clientRef.current = client;
      setStatus("ready");
      return client;
    } catch (err) {
      console.error("Stockfish failed to start:", err);
      setStatus("error");
      throw err;
    }
  }, []);

  const analyze = useCallback(
    async (fen: string, depth = 14): Promise<EngineAnalysis | null> => {
      try {
        const client = await ensure();
        return await client.analyze(fen, { depth });
      } catch (err) {
        console.error("Stockfish analysis failed:", err);
        setStatus("error");
        return null;
      }
    },
    [ensure]
  );

  /* Cleanup on unmount. */
  useEffect(() => {
    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { analyze, status };
}

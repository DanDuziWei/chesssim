import type { Metadata } from "next";
import { ArenaSim } from "@/components/ArenaSim";

export const metadata: Metadata = {
  title: "Arena",
  description:
    "Start a live AI vs AI chess simulation — LLM models and the real Stockfish engine play move by move in your browser.",
  alternates: { canonical: "/arena" },
};

export default function ArenaPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">AI Chess Arena</p>
        <h1 className="mt-2 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Watch two intelligences fight — live
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Pick two agents and start a real, move-by-move simulation. The
          Stockfish engine runs in your browser and calls the shots — or the
          language models do, when their API keys are configured. Every
          evaluation you see is computed live by the real engine.
        </p>
      </div>

      <ArenaSim />

      <div className="mt-14 grid gap-4 text-sm text-muted sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <span className="font-semibold text-bronze">Simulate</span> — the game
          is played for real, move by move, in your browser.
        </div>
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <span className="font-semibold text-bronze">Explain</span> — every
          move gets engine truth plus commentary; LLM moves carry the model's
          own reasoning.
        </div>
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <span className="font-semibold text-bronze">Render & Share</span> —
          the finished game becomes a full replay with story mode, and the PGN
          can be exported or copied.
        </div>
      </div>
    </div>
  );
}

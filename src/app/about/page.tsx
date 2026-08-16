import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "ChessSim is an AI-powered chess simulation & entertainment platform. Watch intelligence play.",
  alternates: { canonical: "/about" },
};

const LOOP = [
  {
    step: "Simulate",
    text: "Two AI agents sit across the board and play a full game of chess — model against model, strategy against strategy.",
  },
  {
    step: "Explain",
    text: "Every move is annotated: what changed, why the model chose it, what the engine thinks, and what was missed.",
  },
  {
    step: "Render",
    text: "The same data becomes an interactive replay — board, evaluation bar, timeline, commentary and story mode.",
  },
  {
    step: "Share",
    text: "Each match lives on a permanent page of its own, ready to be shared anywhere.",
  },
];

const DIRECTION = [
  "AI Agent competition & benchmarks",
  "Simulation environments beyond chess",
  "AI-generated sports and entertainment content",
  "Automated video generation from matches",
  "Leaderboards across models and prompts",
];

const NOT_NOW = [
  "Real-time human vs human play",
  "Heavy community features",
  "Complex account systems",
  "A database backend — v0.1 runs entirely on local data",
];

export default function AboutPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">About</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          ChessSim explores how artificial intelligence behaves under rules,
          competition and strategy.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
          ChessSim is not another chess-playing website. It is an AI-powered
          simulation and entertainment platform built around a single idea:{" "}
          <span className="font-medium text-ink">
            watch intelligence play.
          </span>{" "}
          Two AI models sit across the board, compete, reason — and the game is
          rendered as a story anyone can follow, whether or not they can play
          chess.
        </p>
      </div>

      {/* Product loop */}
      <section className="mt-16">
        <p className="eyebrow">The Product Loop</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {LOOP.map((item, i) => (
            <div key={item.step} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-paper">
                  {i + 1}
                </span>
                <h2 className="font-display text-xl font-semibold">{item.step}</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Current stage */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Current Stage</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            v0.1 — Prototype
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The first version is deliberately small: three annotated simulation
            demos, a full replay experience and a story mode. All data is local
            — no database, no accounts, no backend. The goal is to prove the
            core experience: a page where anyone immediately understands that
            this is a place to watch AI play chess, and understand how it
            thinks.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Simple beats perfect. Demo beats architecture. A working prototype
            beats feature completeness.
          </p>
        </div>

        <div>
          <p className="eyebrow">Deliberately Not Here (Yet)</p>
          <ul className="mt-3 space-y-2.5">
            {NOT_NOW.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <span aria-hidden className="mt-0.5 text-faint">
                  ✕
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Long-term direction */}
      <section className="mt-16 rounded-xl border border-line bg-surface p-6 sm:p-8">
        <p className="eyebrow">Long-term Direction</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          Beyond the board
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          ChessSim may eventually expand into a broader platform for watching
          and benchmarking artificial intelligence. For now, the focus stays
          strictly on chess.
        </p>
        <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {DIRECTION.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
              <span aria-hidden className="mt-0.5 text-bronze">
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Tech */}
      <section className="mt-16">
        <p className="eyebrow">Built With</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {[
            "Next.js",
            "TypeScript",
            "Tailwind CSS",
            "chess.js",
            "react-chessboard",
            "Vercel-ready",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Questions or ideas?{" "}
          <Link
            href="/matches"
            className="font-medium text-bronze transition-colors hover:text-ink"
          >
            Watch a match first
          </Link>{" "}
          — the product is the pitch.
        </p>
      </section>
    </div>
  );
}

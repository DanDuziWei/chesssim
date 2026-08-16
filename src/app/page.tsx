import Link from "next/link";
import type { Metadata } from "next";
import { getAgent, getFeaturedMatch } from "@/data";
import { MatchCard } from "@/components/MatchCard";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const WHY = [
  {
    title: "AI vs AI",
    text: "Watch leading AI models compete on equal terms — same board, same rules, different minds.",
  },
  {
    title: "Explainable Games",
    text: "Understand why each move matters. Every move comes with commentary, evaluation and reasoning.",
  },
  {
    title: "Simulation as Entertainment",
    text: "Turn machine reasoning into something worth watching — matches told as stories, not spreadsheets.",
  },
];

const LOOP = ["Simulate", "Explain", "Render", "Share"];

export default function HomePage() {
  const featured = getFeaturedMatch();
  const white = getAgent(featured.whiteAgentId);
  const black = getAgent(featured.blackAgentId);

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-line">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 select-none font-display text-[22rem] leading-none text-ink/[0.04] sm:text-[30rem]"
        >
          ♞
        </span>

        <div className="container-page relative flex flex-col items-center py-24 text-center sm:py-32">
          <p className="eyebrow">AI-powered chess simulation &amp; entertainment</p>
          <h1 className="mt-6 font-display text-6xl font-semibold tracking-tightest sm:text-8xl">
            Chess<span className="text-bronze">Sim</span>
          </h1>
          <p className="mt-5 text-balance font-display text-2xl font-medium text-muted sm:text-3xl">
            Watch intelligence play.
          </p>
          <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg">
            AI models compete, reason and reveal how intelligence behaves on
            the chessboard.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/match/${featured.slug}`}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-bronze"
            >
              Watch a Match
            </Link>
            <Link
              href="/matches"
              className="rounded-full border border-lineStrong bg-surface px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-bronze hover:text-bronze"
            >
              Browse Matches
            </Link>
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-faint">
            Simulate → Explain → Render → Share
          </p>
        </div>
      </section>

      {/* ---------------- Featured match ---------------- */}
      <section className="container-page py-16 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Featured Match</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {featured.title}
            </h2>
          </div>
          <Link
            href="/matches"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-bronze sm:block"
          >
            All matches →
          </Link>
        </div>

        <MatchCard match={featured} whiteAgent={white} blackAgent={black} featured />

        <p className="mt-4 text-xs text-faint">
          Simulation Demo — this match uses a legal example game to demonstrate
          the ChessSim experience.
        </p>
      </section>

      {/* ---------------- Why ChessSim ---------------- */}
      <section className="border-y border-line bg-surface">
        <div className="container-page py-16 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">Why ChessSim?</p>
            <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Chess is the cleanest window into machine reasoning
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((item, i) => (
              <div key={item.title} className="card card-hover p-6 sm:p-7">
                <span className="font-display text-sm font-semibold text-bronze">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Product loop */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {LOOP.map((step, i) => (
              <div key={step} className="flex items-center gap-2 sm:gap-3">
                <span className="rounded-full border border-line bg-paper px-4 py-1.5 text-sm font-medium text-ink">
                  {step}
                </span>
                {i < LOOP.length - 1 && (
                  <span aria-hidden className="text-faint">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Bottom CTA ---------------- */}
      <section className="container-page py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          The board is the same. The minds are not.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
          Three simulation demos are live. Watch how different models attack,
          defend and reason — move by move.
        </p>
        <div className="mt-7 flex justify-center">
          <Link
            href="/matches"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-bronze"
          >
            Watch the Matches
          </Link>
        </div>
      </section>
    </div>
  );
}

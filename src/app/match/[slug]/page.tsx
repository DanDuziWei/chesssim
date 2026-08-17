import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllMatches, getAgent, getMatch } from "@/data";
import type { Agent } from "@/lib/types";
import { AgentAvatar } from "@/components/AgentAvatar";
import { BoardReplay } from "@/components/BoardReplay";
import { MatchCard } from "@/components/MatchCard";
import { StatusBadge } from "@/components/Badge";
import { formatEval } from "@/lib/eval";
import { formatDate } from "@/lib/format";

interface MatchPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllMatches().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: MatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = getMatch(slug);
  if (!match) return { title: "Match not found" };
  return {
    title: `${match.title} — ${match.theme}`,
    description: match.summary,
    alternates: { canonical: `/match/${match.slug}` },
    openGraph: {
      title: `${match.title} — ${match.theme}`,
      description: match.summary,
      url: `/match/${match.slug}`,
      type: "article",
    },
  };
}

function PlayerProfileCard({ agent, side }: { agent: Agent; side: "White" | "Black" }) {
  const rows = [
    { label: "Playing Style", value: agent.style },
    { label: "Strength", value: agent.strength },
    { label: "Strategy", value: agent.strategy },
  ];
  return (
    <div className="card card-hover p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <AgentAvatar agent={agent} size="lg" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-faint">
            {side}
          </p>
          <p className="font-display text-xl font-semibold">{agent.name}</p>
          <p className="text-xs text-muted">
            {agent.model} · {agent.provider}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{agent.description}</p>
      <dl className="mt-4 space-y-2 border-t border-line pt-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-faint">
              {r.label}
            </dt>
            <dd className="text-right text-sm font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { slug } = await params;
  const match = getMatch(slug);
  if (!match) notFound();

  const white = getAgent(match.whiteAgentId);
  const black = getAgent(match.blackAgentId);
  const others = getAllMatches().filter((m) => m.slug !== match.slug);

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="text-sm text-faint">
        <Link href="/matches" className="transition-colors hover:text-bronze">
          Matches
        </Link>
        <span className="mx-2">/</span>
        <span className="text-muted">{match.title}</span>
      </nav>

      {/* Header */}
      <header className="mt-6 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={match.status} />
          <span className="eyebrow">{match.theme}</span>
          <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {match.simulationNumber}
          </span>
          <span className="rounded-full border border-bronze/40 bg-bronze/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-bronze">
            Simulation Demo
          </span>
        </div>

        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {match.title}
        </h1>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Players */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <AgentAvatar agent={white} size="lg" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-faint">
                  White
                </p>
                <p className="font-display text-xl font-semibold">{white.name}</p>
                <p className="text-xs text-muted">{white.model}</p>
              </div>
            </div>
            <span className="font-display text-xl text-faint">vs</span>
            <div className="flex items-center gap-3">
              <AgentAvatar agent={black} size="lg" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-faint">
                  Black
                </p>
                <p className="font-display text-xl font-semibold">{black.name}</p>
                <p className="text-xs text-muted">{black.model}</p>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="lg:text-right">
            <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {match.result}
            </p>
            <p className="mt-0.5 text-sm text-muted">{match.resultLabel}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-faint">
          <span className="uppercase tracking-wider">{match.opening}</span>
          <span className="tabular-nums">{match.moveCount} plies</span>
          <span>{formatDate(match.createdAt)}</span>
          <span className="tabular-nums">
            {match.moves[match.moveCount - 1].checkmate
              ? "Checkmate"
              : `Final eval ${formatEval(match.finalEvaluation)}`}
          </span>
        </div>
      </header>

      {/* Replay */}
      <div className="mt-8">
        <BoardReplay match={match} whiteAgent={white} blackAgent={black} />
      </div>

      {/* AI Player Profiles */}
      <section className="mt-14">
        <p className="eyebrow">The Players</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Two intelligences, two styles
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <PlayerProfileCard agent={white} side="White" />
          <PlayerProfileCard agent={black} side="Black" />
        </div>
      </section>

      {/* Disclaimer */}
      <p className="mt-10 rounded-lg border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
        <span className="font-semibold text-bronze">Simulation Demo</span> — this
        match uses a legal example game to demonstrate the ChessSim experience.
        The match narrative is authored content; evaluations, best moves and
        move classifications are computed by the real Stockfish engine in your
        browser. In later versions, real model-vs-model games will be simulated
        here.
      </p>

      {/* More matches */}
      {others.length > 0 && (
        <section className="mt-16">
          <p className="eyebrow">More Matches</p>
          <div className="mt-5 grid gap-5">
            {others.map((m) => (
              <MatchCard
                key={m.slug}
                match={m}
                whiteAgent={getAgent(m.whiteAgentId)}
                blackAgent={getAgent(m.blackAgentId)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

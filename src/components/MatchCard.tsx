import Link from "next/link";
import type { Agent, Match } from "@/lib/types";
import { formatEval } from "@/lib/eval";
import { formatDate } from "@/lib/format";
import { AgentAvatar } from "./AgentAvatar";
import { StatusBadge } from "./Badge";
import { BoardThumbnail } from "./BoardThumbnail";

interface MatchCardProps {
  match: Match;
  whiteAgent: Agent;
  blackAgent: Agent;
  featured?: boolean;
}

export function MatchCard({ match, whiteAgent, blackAgent, featured = false }: MatchCardProps) {
  const href = `/match/${match.slug}`;

  if (featured) {
    return (
      <Link
        href={href}
        className="card card-hover group grid overflow-hidden transition-shadow hover:shadow-[0_16px_40px_rgba(23,20,15,0.08)] lg:grid-cols-[minmax(0,400px)_1fr]"
      >
        <div className="border-b border-line bg-paper/70 p-6 lg:border-b-0 lg:border-r sm:p-8">
          <div className="mx-auto max-w-[340px]">
            <BoardThumbnail fen={match.positions[match.moveCount]} />
          </div>
          <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-widest text-faint">
            Final position
          </p>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={match.status} />
            <span className="eyebrow">{match.theme}</span>
          </div>

          <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {match.title}
          </h3>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <AgentAvatar agent={whiteAgent} size="md" />
              <div>
                <p className="text-sm font-semibold">{whiteAgent.name}</p>
                <p className="text-xs text-faint">{whiteAgent.model}</p>
              </div>
            </div>
            <span className="font-display text-lg text-faint">vs</span>
            <div className="flex items-center gap-2.5">
              <AgentAvatar agent={blackAgent} size="md" />
              <div>
                <p className="text-sm font-semibold">{blackAgent.name}</p>
                <p className="text-xs text-faint">{blackAgent.model}</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="font-display text-xl font-semibold">{match.result}</p>
              <p className="text-[11px] uppercase tracking-wider text-faint">
                {match.status === "live" ? "in progress" : "final"}
              </p>
              <p className="mt-1 text-xs tabular-nums text-muted">
                {match.moves[match.moveCount - 1].checkmate
                  ? "checkmate"
                  : `eval ${formatEval(match.finalEvaluation)}`}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">{match.summary}</p>

          <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
            <div className="flex gap-5 text-xs text-faint">
              <span className="uppercase tracking-wider">{match.opening}</span>
              <span className="tabular-nums">{match.moveCount} plies</span>
              <span>{formatDate(match.createdAt)}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-colors group-hover:bg-bronze">
              Watch Replay
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="card card-hover group flex flex-col gap-5 p-5 transition-shadow hover:shadow-[0_12px_32px_rgba(23,20,15,0.07)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <AgentAvatar agent={whiteAgent} size="md" />
            <AgentAvatar agent={blackAgent} size="md" className="-ml-2 border-2 border-surface" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">
              {match.title}
            </p>
            <p className="text-xs text-muted">{match.theme}</p>
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted">{match.summary}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex gap-4 text-xs text-faint">
          <span className="uppercase tracking-wider">{match.opening}</span>
          <span className="tabular-nums">{match.moveCount} plies</span>
          <span>{formatDate(match.createdAt)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs tabular-nums text-muted">
            {match.moves[match.moveCount - 1].checkmate
              ? "mate"
              : `eval ${formatEval(match.finalEvaluation)}`}
          </span>
          <span className="font-display text-lg font-semibold">{match.result}</span>
          <span
            aria-hidden
            className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-bronze"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

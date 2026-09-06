import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardReplay } from "@/components/BoardReplay";
import { getSavedMatch } from "@/lib/match-store";
import { getSimAgent } from "@/lib/simulation/agents";
import { simAgentToAgent } from "@/lib/simulation/build-match";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ shareId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const match = await getSavedMatch(shareId);
  return match
    ? { title: match.title, description: match.summary }
    : { title: "Saved match" };
}

export default async function SavedMatchPage({ params }: PageProps) {
  const { shareId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(shareId)) notFound();

  const match = await getSavedMatch(shareId);
  if (!match) notFound();
  const white = getSimAgent(match.whiteAgentId);
  const black = getSimAgent(match.blackAgentId);
  if (!white || !black) notFound();

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-6">
        <p className="eyebrow">Saved Arena Match</p>
        <p className="mt-2 text-sm text-muted">
          This permanent replay includes the recorded moves, evaluations and story.
        </p>
      </div>
      <BoardReplay
        match={match}
        whiteAgent={simAgentToAgent(white)}
        blackAgent={simAgentToAgent(black)}
      />
    </div>
  );
}

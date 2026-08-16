"use client";

import type { Narrative } from "@/lib/types";

interface StoryModeProps {
  narrative: Narrative;
  currentPly: number;
  onJump: (ply: number) => void;
  moveCount: number;
}

interface Chapter {
  id: string;
  title: string;
  text: string;
  ply?: number;
}

export function StoryMode({ narrative, currentPly, onJump, moveCount }: StoryModeProps) {
  const chapters: Chapter[] = [
    { id: "opening", title: "Opening", text: narrative.opening },
    {
      id: "tension",
      title: "First Tension",
      text: narrative.firstTension,
      ply: narrative.firstTensionPly,
    },
    {
      id: "turning",
      title: "Turning Point",
      text: narrative.turningPoint,
      ply: narrative.turningPointPly,
    },
    ...(narrative.criticalMistake
      ? [
          {
            id: "mistake",
            title: "Critical Mistake",
            text: narrative.criticalMistake,
            ply: narrative.criticalMistakePly,
          },
        ]
      : []),
    {
      id: "finale",
      title: "Final Sequence",
      text: narrative.finalSequence,
      ply: narrative.finalSequencePly,
    },
  ];

  const activeId = [...chapters]
    .reverse()
    .find((c) => c.ply != null && currentPly >= c.ply)?.id;

  return (
    <section aria-label="Story mode">
      <div className="mb-8">
        <p className="eyebrow">Story Mode</p>
        <h2 className="mt-2 max-w-xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          The match, told as a story
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Chess engines see numbers. A match has a shape — an opening idea, a
          moment of tension, a turn, a collapse. Here is the arc of this game.
        </p>
      </div>

      <div className="relative border-l border-lineStrong pl-8 sm:pl-10">
        {chapters.map((chapter, i) => {
          const active = chapter.id === activeId;
          const jumpPly = chapter.ply;
          return (
            <div key={chapter.id} className="relative pb-10 last:pb-0">
              <span
                className={`absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[10px] font-semibold sm:-left-[49px] ${
                  active
                    ? "border-bronze bg-bronze text-paper"
                    : "border-lineStrong bg-surface text-muted"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div
                className={`card card-hover p-5 transition-colors sm:p-6 ${
                  active ? "border-bronze/50" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">
                    {chapter.title}
                  </h3>
                  {jumpPly != null && (
                    <button
                      onClick={() => onJump(jumpPly)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-bronze hover:text-bronze"
                    >
                      Go to move {jumpPly}
                      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[15px]">
                  {chapter.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-10 border-l-2 border-l-bronze bg-surface p-6 sm:p-8">
        <p className="eyebrow">Match Summary</p>
        <blockquote className="mt-3 font-display text-xl leading-relaxed text-ink sm:text-2xl">
          “{narrative.summary}”
        </blockquote>
      </div>
    </section>
  );
}

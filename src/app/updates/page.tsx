import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Updates",
  description: "ChessSim changelog — what has shipped and what is coming next.",
  alternates: { canonical: "/updates" },
};

export default function UpdatesPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">Updates</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Changelog
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          What has shipped so far on the road from prototype to platform.
        </p>
      </div>

      <div className="relative mt-12 border-l border-lineStrong pl-8 sm:pl-10">
        {/* v0.1 */}
        <article className="relative pb-14">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-bronze bg-bronze text-[10px] font-semibold text-paper sm:-left-[49px]">
            01
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">v0.1</h2>
            <span className="rounded-full bg-[#ECEBE6] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Initial prototype
            </span>
          </div>
          <p className="mt-2 text-sm text-faint">Current release · June 2025</p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            The first complete prototype of the ChessSim experience: watch AI
            models play chess, and understand every move.
          </p>

          <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {[
              "Homepage with featured match",
              "Match replay with interactive board",
              "Move-by-move AI commentary",
              "Engine evaluation & eval bar",
              "Evaluation sparkline & timeline",
              "Story mode for every match",
              "Three annotated simulation demos",
              "Match list, about & updates pages",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                <span aria-hidden className="mt-0.5 text-bronze">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </article>

        {/* Next */}
        <article className="relative pb-4">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-lineStrong bg-surface text-[10px] font-semibold text-muted sm:-left-[49px]">
            02
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold text-muted">
              v0.2
            </h2>
            <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
              Planned
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Real model-vs-model simulation — plugging in actual LLM APIs for
            move selection, plus engine-generated commentary. Details will be
            recorded here when they ship.
          </p>
        </article>
      </div>
    </div>
  );
}

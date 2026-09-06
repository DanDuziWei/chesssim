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
        {/* v0.5.1 */}
        <article className="relative pb-14">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-bronze bg-bronze text-[10px] font-semibold text-paper sm:-left-[49px]">
            01
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">v0.5.1</h2>
            <span className="rounded-full bg-[#E4F2E9] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2F7D4F]">
              Current release
            </span>
          </div>
          <p className="mt-2 text-sm text-faint">September 6, 2026</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Live games now finish reliably, tell their story while the pieces
            are still moving and can persist as permanent replays when the
            optional database connection is enabled.
          </p>
          <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {[
              "Immediate checkmate and terminal-state completion",
              "Hard timeout and automatic Stockfish worker recovery",
              "Instant story beat for every move",
              "Opt-in, non-blocking LLM refinement for important moments",
              "Rate-limited server-side match persistence API",
              "Permanent saved replay route",
              "RLS-enabled Supabase migration",
              "No database secret shipped to the browser",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                <span aria-hidden className="mt-0.5 text-bronze">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </article>

        {/* v0.5 */}
        <article className="relative pb-14">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-bronze bg-bronze text-[10px] font-semibold text-paper sm:-left-[49px]">
            02
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">v0.5</h2>
            <span className="rounded-full bg-[#E4F2E9] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2F7D4F]">
              Chess960
            </span>
          </div>
          <p className="mt-2 text-sm text-faint">September 6, 2026</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Chess960 breaks the fixed opening position while keeping the full
            ChessSim experience. Generate any legal starting position, send it
            to the Arena and watch agents solve unfamiliar chess live.
          </p>
          <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {[
              "Dedicated Chess960 generator and explainer",
              "All 960 standard numbered starting positions",
              "Standard / Chess960 ruleset selector in Arena",
              "Complete Chess960 castling legality",
              "Stockfish UCI_Chess960 analysis mode",
              "Chess960-aware LLM legal-move prompts",
              "Variant-aware narrative replay",
              "SetUp, Variant and FEN headers in PGN export",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                <span aria-hidden className="mt-0.5 text-bronze">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </article>

        {/* v0.4 */}
        <article className="relative pb-14">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-bronze bg-bronze text-[10px] font-semibold text-paper sm:-left-[49px]">
            03
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">v0.4</h2>
            <span className="rounded-full bg-[#E4F2E9] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2F7D4F]">
              Narrative Experience 2.0
            </span>
          </div>
          <p className="mt-2 text-sm text-faint">September 2026</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Narrative Experience 2.0 keeps the chessboard and the story in one
            synchronized experience. Important moves become chapters; routine
            moves stay quiet enough for the tension to breathe.
          </p>
          <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {[
              "True board-left / story-right match experience",
              "What happened / why it matters / the story layers",
              "Move importance levels 0–5",
              "Board-to-story and story-to-board navigation",
              "Dynamic chapter titles and story hooks",
              "Demo Story / Verified AI Match provenance",
              "White-perspective Stockfish evaluation fix",
              "Mobile board-first reading flow",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                <span aria-hidden className="mt-0.5 text-bronze">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </article>

        {/* v0.3 */}
        <article className="relative pb-14">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-bronze bg-bronze text-[10px] font-semibold text-paper sm:-left-[49px]">
            04
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">v0.3</h2>
            <span className="rounded-full bg-[#E4F2E9] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2F7D4F]">
              AI Chess Arena
            </span>
          </div>
          <p className="mt-2 text-sm text-faint">August 18, 2026</p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            The simulation loop becomes real: the AI Chess Arena runs live,
            move-by-move games in the browser — LLM models when their API keys
            are configured, the real Stockfish engine and baseline bots always.
          </p>

          <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {[
              "AI Chess Arena (/arena): pick two agents, watch live",
              "LLM agents: DeepSeek, GPT, Claude, Qwen, Gemini",
              "Move + narrative LLM APIs (DeepSeek/OpenAI/Anthropic/Gemini/DashScope)",
              "Stockfish agents at configurable depth",
              "Greedy & random baseline bots",
              "Honest offline fallback when API keys are missing",
              "Live Stockfish evaluation & brilliant/mistake detection during play",
              "Finished games become full replays with Story Mode",
              "PGN export & copy for sharing",
              "Pause / resume / pace control / abandon",
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

        {/* v0.2 */}
        <article className="relative pb-14">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-lineStrong bg-surface text-[10px] font-semibold text-muted sm:-left-[49px]">
            05
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">v0.2</h2>
            <span className="rounded-full bg-[#ECEBE6] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Narrative engine
            </span>
          </div>
          <p className="mt-2 text-sm text-faint">August 17, 2026</p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            ChessSim becomes a true AI-native simulation and storytelling
            platform: a real chess engine now runs in every visitor's browser,
            and every match is narrated like a chess novel.
          </p>

          <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
            {[
              "AI Narrative Engine",
              "Stockfish Integration",
              "AI Match Demo",
              "Story Mode",
              "Real Stockfish engine (WASM, in-browser)",
              "Engine evaluation, best moves & mistake detection",
              "Brilliant / blunder classification by Stockfish",
              "Full-game engine analysis with progress & caching",
              "AI Match Demo: /match/deepseek-vs-gpt (#001)",
              "AI Player Profiles (style, strength, strategy)",
              "Bilingual narrative (EN / 中文) on match pages",
              "Critical-move highlighting on the board",
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

        {/* v0.1 */}
        <article className="relative pb-14">
          <span className="absolute -left-[41px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-lineStrong bg-surface text-[10px] font-semibold text-muted sm:-left-[49px]">
            06
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold text-muted">v0.1</h2>
            <span className="rounded-full bg-[#ECEBE6] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Initial prototype
            </span>
          </div>
          <p className="mt-2 text-sm text-faint">August 17, 2026</p>

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
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <span aria-hidden className="mt-0.5 text-faint">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </article>

      </div>
    </div>
  );
}

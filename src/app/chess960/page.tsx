import type { Metadata } from "next";
import { Chess960Explorer } from "@/components/Chess960Explorer";

export const metadata: Metadata = {
  title: "Chess960",
  description:
    "Generate any of the 960 legal Chess960 starting positions, then watch AI agents play it live in the ChessSim Arena.",
  alternates: { canonical: "/chess960" },
};

export default function Chess960Page() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-9 max-w-3xl">
        <p className="eyebrow">Chess960 · Fischer Random</p>
        <h1 className="mt-2 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Same pieces. No memorized opening.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Generate a legal randomized back rank, then send that exact position
          into the AI Arena. ChessSim preserves full Chess960 legality —
          including its special castling rules — through simulation, analysis,
          replay and PGN export.
        </p>
      </div>

      <Chess960Explorer />

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["960 positions", "Every setup has bishops on opposite colours and the king between both rooks."],
          ["Less opening memory", "Agents must understand unfamiliar structures instead of replaying one fixed starting book."],
          ["One ChessSim experience", "The same Arena, Stockfish evaluation, narrative replay and honest provenance still apply."],
        ].map(([title, text]) => (
          <div key={title} className="card p-5">
            <p className="font-display text-lg font-semibold">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

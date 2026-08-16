import { Chess } from "chess.js";
import { matches } from "../src/data/index";

let failed = false;

for (const m of matches) {
  const probe = new Chess();
  try {
    probe.loadPgn(m.pgn, { strict: false });
    const plies = probe.history().length;
    const ok =
      m.moves.length === plies && m.positions.length === plies + 1;

    console.log(
      `${ok ? "OK  " : "WARN"} ${m.slug}: ${plies} plies | moves=${m.moves.length} positions=${m.positions.length} | result=${m.result}`
    );

    if (!ok) {
      failed = true;
      continue;
    }

    // Verify each move's FEN matches an independent replay of the SAN list.
    const replay = new Chess();
    for (let i = 0; i < m.moves.length; i++) {
      const mv = m.moves[i];
      replay.move(mv.san);
      if (replay.fen() !== mv.fen) {
        console.log(
          `  MISMATCH at ply ${mv.ply} (${mv.san}): fen diverges from replay`
        );
        failed = true;
      }
    }

    // Verify annotation keys point at real plies.
    const legend: string[] = [];
    for (const mv of m.moves) {
      if (mv.tags.length || mv.reasoning) {
        legend.push(`${mv.moveNumber}${mv.color === "w" ? "." : "..."}${mv.san}`);
      }
    }
    if (legend.length) {
      console.log(`  annotated: ${legend.join("  ")}`);
    }
  } catch (err) {
    console.log(`FAIL ${m.slug}: ${err instanceof Error ? err.message : err}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nValidation failed.");
  process.exit(1);
}
console.log("\nAll PGNs are legal and consistent.");

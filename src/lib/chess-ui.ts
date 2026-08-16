import type { Evaluation, Side } from "./types";
import { evalToProxyCp } from "./classify";
import { formatEval } from "./eval";

/** Extract the king square of `color` from a FEN string, or null. */
export function kingSquareFromFen(fen: string, color: Side): string | null {
  const board = fen.split(" ")[0];
  const target = color === "w" ? "K" : "k";
  const files = "abcdefgh";
  const rows = board.split("/");
  for (let r = 0; r < 8; r++) {
    let file = 0;
    for (const ch of rows[r]) {
      if (/[1-8]/.test(ch)) {
        file += Number(ch);
        continue;
      }
      if (ch === target) return files[file] + String(8 - r);
      file += 1;
    }
  }
  return null;
}

/** A human sentence describing how the evaluation moved after a given move. */
export function describeSwing(
  before: Evaluation,
  after: Evaluation,
  color: Side,
  whiteName: string,
  blackName: string
): string {
  const mover = color === "w" ? whiteName : blackName;
  const opponent = color === "w" ? blackName : whiteName;
  const sign = color === "w" ? 1 : -1;
  const delta =
    (evalToProxyCp(after.cp, after.mate) - evalToProxyCp(before.cp, before.mate)) *
    sign;
  const abs = Math.abs(delta);

  if (abs < 20) {
    return `The evaluation barely moves — ${mover} holds the position together.`;
  }

  const amount =
    abs >= 1000
      ? "decisive ground"
      : abs >= 300
        ? "a large amount of ground"
        : abs >= 120
          ? "significant ground"
          : "some ground";

  const toward = delta > 0 ? mover : opponent;
  return `${mover} ${delta > 0 ? "gains" : "loses"} ${amount} here (${formatEval(before)} → ${formatEval(after)}), shifting the balance toward ${toward}.`;
}

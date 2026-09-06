export type ChessVariant = "standard" | "chess960";

export const STANDARD_START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const FILES = "abcdefgh";
const KNIGHT_COMBINATIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 3],
  [2, 4],
  [3, 4],
];

export interface Chess960Position {
  /** Standard Scharnagl position number, 0–959. Position 518 is classical chess. */
  number: number;
  label: string;
  backRank: string;
  fen: string;
}

function normalizePositionNumber(value: number): number {
  if (!Number.isFinite(value)) return 518;
  return Math.min(959, Math.max(0, Math.trunc(value)));
}

/** Decode the standard Chess960 (Scharnagl) position number. */
export function getChess960Position(value: number): Chess960Position {
  const number = normalizePositionNumber(value);
  let code = number;
  const rank = Array<string>(8).fill("");

  // Bishops are placed on opposite-coloured squares.
  rank[(code % 4) * 2 + 1] = "B";
  code = Math.floor(code / 4);
  rank[(code % 4) * 2] = "B";
  code = Math.floor(code / 4);

  let empty = rank
    .map((piece, file) => (piece ? -1 : file))
    .filter((file) => file >= 0);
  rank[empty[code % 6]] = "Q";
  code = Math.floor(code / 6);

  empty = rank
    .map((piece, file) => (piece ? -1 : file))
    .filter((file) => file >= 0);
  const knights = KNIGHT_COMBINATIONS[code];
  rank[empty[knights[0]]] = "N";
  rank[empty[knights[1]]] = "N";

  empty = rank
    .map((piece, file) => (piece ? -1 : file))
    .filter((file) => file >= 0);
  rank[empty[0]] = "R";
  rank[empty[1]] = "K";
  rank[empty[2]] = "R";

  const backRank = rank.join("");
  const kingFile = rank.indexOf("K");
  const rookFiles = rank
    .map((piece, file) => (piece === "R" ? file : -1))
    .filter((file) => file >= 0);
  const queenSideRook = rookFiles.find((file) => file < kingFile)!;
  const kingSideRook = rookFiles.find((file) => file > kingFile)!;

  // Shredder-FEN names the original rook files, which preserves Chess960
  // castling rights without pretending the rooks began on a/h.
  const castling =
    FILES[kingSideRook].toUpperCase() +
    FILES[queenSideRook].toUpperCase() +
    FILES[kingSideRook] +
    FILES[queenSideRook];

  return {
    number,
    label: `Position #${String(number).padStart(3, "0")}`,
    backRank,
    fen: `${backRank.toLowerCase()}/pppppppp/8/8/8/8/PPPPPPPP/${backRank} w ${castling} - 0 1`,
  };
}

export function randomChess960Position(): Chess960Position {
  return getChess960Position(Math.floor(Math.random() * 960));
}

export function isChessVariant(value: unknown): value is ChessVariant {
  return value === "standard" || value === "chess960";
}

import { Chess as StandardChess, type Move as StandardMove } from "chess.js";
import { Chess as OpsChess, castlingSide } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { makeSan, parseSan } from "chessops/san";
import type { Move as OpsMove, Role } from "chessops/types";
import {
  kingCastlesTo,
  makeSquare,
  makeUci,
  roleToChar,
} from "chessops/util";
import {
  STANDARD_START_FEN,
  type ChessVariant,
} from "@/lib/chess960";

export interface GameMove {
  /** UCI used by the rules engine. Chess960 castling is king-to-rook. */
  uci: string;
  /** Squares used for board highlighting. */
  from: string;
  to: string;
  promotion?: string;
  san: string;
  captured?: string;
  piece: string;
  color: "w" | "b";
}

const PROMOTIONS: Role[] = ["queen", "rook", "bishop", "knight"];

function positionKey(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

function makeChess960Move(pos: OpsChess, move: OpsMove): GameMove {
  if (!("from" in move)) throw new Error("Drops are not valid in Chess960");
  const moving = pos.board.get(move.from);
  if (!moving) throw new Error("No piece on the move origin");
  const side = castlingSide(pos, move);
  const target = side ? kingCastlesTo(pos.turn, side) : move.to;
  const captured = side
    ? undefined
    : pos.board.get(move.to)?.role ??
      (moving.role === "pawn" && move.to === pos.epSquare ? "pawn" : undefined);

  return {
    uci: makeUci(move),
    from: makeSquare(move.from),
    to: makeSquare(target),
    ...(move.promotion ? { promotion: roleToChar(move.promotion) } : {}),
    san: makeSan(pos, move),
    ...(captured ? { captured: roleToChar(captured) } : {}),
    piece: roleToChar(moving.role),
    color: pos.turn === "white" ? "w" : "b",
  };
}

function opsPosition(fen: string): OpsChess {
  return OpsChess.fromSetup(parseFen(fen).unwrap()).unwrap();
}

/**
 * Small common rules surface used by Arena agents. Standard chess keeps its
 * proven chess.js path; Chess960 gets complete move/castling legality via chessops.
 */
export class SimulationGame {
  readonly variant: ChessVariant;
  readonly startFen: string;
  private standard: StandardChess | null;
  private chess960: OpsChess | null;
  private sans: string[] = [];
  private repetitions = new Map<string, number>();

  constructor(variant: ChessVariant = "standard", fen?: string) {
    this.variant = variant;
    this.startFen = fen ?? STANDARD_START_FEN;
    if (variant === "standard") {
      this.standard = new StandardChess(this.startFen);
      this.chess960 = null;
    } else {
      this.standard = null;
      this.chess960 = opsPosition(this.startFen);
      this.repetitions.set(positionKey(this.fen()), 1);
    }
  }

  fen(): string {
    return this.standard?.fen() ?? makeFen(this.chess960!.toSetup());
  }

  turn(): "w" | "b" {
    if (this.standard) return this.standard.turn();
    return this.chess960!.turn === "white" ? "w" : "b";
  }

  history(): string[] {
    return this.standard?.history() ?? [...this.sans];
  }

  legalMoves(): GameMove[] {
    if (this.standard) {
      return (this.standard.moves({ verbose: true }) as StandardMove[]).map((move) => ({
        uci: move.from + move.to + (move.promotion ?? ""),
        from: move.from,
        to: move.to,
        ...(move.promotion ? { promotion: move.promotion } : {}),
        san: move.san,
        ...(move.captured ? { captured: move.captured } : {}),
        piece: move.piece,
        color: move.color,
      }));
    }

    const pos = this.chess960!;
    const moves: GameMove[] = [];
    for (const [from, destinations] of pos.allDests()) {
      const piece = pos.board.get(from);
      for (const to of destinations) {
        if (piece?.role === "pawn" && (to < 8 || to >= 56)) {
          for (const promotion of PROMOTIONS) {
            moves.push(makeChess960Move(pos, { from, to, promotion }));
          }
        } else {
          moves.push(makeChess960Move(pos, { from, to }));
        }
      }
    }
    return moves;
  }

  move(raw: string): GameMove | null {
    const input = raw.trim();
    if (this.standard) {
      try {
        const uci = input.toLowerCase().match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
        const move = uci
          ? this.standard.move({ from: uci[1], to: uci[2], promotion: uci[3] })
          : this.standard.move(input);
        return {
          uci: move.from + move.to + (move.promotion ?? ""),
          from: move.from,
          to: move.to,
          ...(move.promotion ? { promotion: move.promotion } : {}),
          san: move.san,
          ...(move.captured ? { captured: move.captured } : {}),
          piece: move.piece,
          color: move.color,
        };
      } catch {
        return null;
      }
    }

    const pos = this.chess960!;
    let candidate = this.legalMoves().find(
      (move) => move.uci.toLowerCase() === input.toLowerCase()
    );
    let opsMove: OpsMove | undefined;
    if (candidate) {
      const from = candidate.uci.slice(0, 2);
      const to = candidate.uci.slice(2, 4);
      const promotion = candidate.uci[4];
      opsMove = parseSan(pos, candidate.san);
      // parseSan is authoritative for castling; regular UCI can be matched by SAN too.
      if (!opsMove) {
        candidate = this.legalMoves().find(
          (move) =>
            move.uci.startsWith(from + to) &&
            (!promotion || move.promotion === promotion)
        );
        if (candidate) opsMove = parseSan(pos, candidate.san);
      }
    } else {
      opsMove = parseSan(pos, input);
      if (opsMove) candidate = makeChess960Move(pos, opsMove);
    }
    if (!candidate || !opsMove || !pos.isLegal(opsMove)) return null;

    pos.play(opsMove);
    this.sans.push(candidate.san);
    const key = positionKey(this.fen());
    this.repetitions.set(key, (this.repetitions.get(key) ?? 0) + 1);
    return candidate;
  }

  isCheckmate(): boolean {
    return this.standard?.isCheckmate() ?? this.chess960!.isCheckmate();
  }

  isStalemate(): boolean {
    return this.standard?.isStalemate() ?? this.chess960!.isStalemate();
  }

  isThreefoldRepetition(): boolean {
    if (this.standard) return this.standard.isThreefoldRepetition();
    return [...this.repetitions.values()].some((count) => count >= 3);
  }

  isInsufficientMaterial(): boolean {
    return this.standard?.isInsufficientMaterial() ?? this.chess960!.isInsufficientMaterial();
  }

  isDraw(): boolean {
    if (this.standard) return this.standard.isDraw();
    return (
      this.isStalemate() ||
      this.isThreefoldRepetition() ||
      this.isInsufficientMaterial() ||
      this.chess960!.halfmoves >= 100
    );
  }

  isGameOver(): boolean {
    return this.standard?.isGameOver() ?? (this.chess960!.isEnd() || this.isDraw());
  }

  pgn(result: "1-0" | "0-1" | "1/2-1/2" = "1/2-1/2"): string {
    if (this.standard) return this.standard.pgn();
    const headers = [
      '[Event "ChessSim Live Simulation"]',
      '[Variant "Chess960"]',
      '[SetUp "1"]',
      `[FEN "${this.startFen}"]`,
      `[Result "${result}"]`,
    ];
    const body: string[] = [];
    for (let i = 0; i < this.sans.length; i += 2) {
      body.push(`${i / 2 + 1}. ${this.sans[i]}${this.sans[i + 1] ? ` ${this.sans[i + 1]}` : ""}`);
    }
    return `${headers.join("\n")}\n\n${body.join(" ")} ${result}`;
  }
}

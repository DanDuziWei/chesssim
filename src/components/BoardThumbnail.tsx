"use client";

import dynamic from "next/dynamic";

const Chessboard = dynamic(
  () => import("react-chessboard").then((m) => m.Chessboard),
  {
    ssr: true,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-lg bg-line/70" />
    ),
  }
);

/** A static, non-interactive board used as a visual thumbnail. */
export function BoardThumbnail({ fen }: { fen: string }) {
  return (
    <div className="pointer-events-none w-full select-none" aria-hidden>
      <Chessboard
        id={`thumb-${fen.slice(0, 8)}`}
        position={fen}
        arePiecesDraggable={false}
        areArrowsAllowed={false}
        showBoardNotation={false}
        customBoardStyle={{ borderRadius: "8px", overflow: "hidden" }}
        customDarkSquareStyle={{ backgroundColor: "#8E7B5C" }}
        customLightSquareStyle={{ backgroundColor: "#EBE1CB" }}
      />
    </div>
  );
}

import type { MatchSeed } from "../seed";

export const claudeVsQwen: MatchSeed = {
  slug: "claude-vs-qwen-001",
  title: "Claude vs Qwen",
  theme: "Positional Play",
  status: "completed",
  result: "0-1",
  whiteAgentId: "claude",
  blackAgentId: "qwen",
  opening: "Queen's Indian Defence",
  premise:
    "No sacrifices, no drama — just patient, constricting positional play. Qwen demonstrates why the quietest moves are often the most brutal.",
  summary:
    "Qwen never allowed a single tactical outburst; it constricted Claude move by move until the position suffocated itself, ending in the immortal zugzwang.",
  createdAt: "2025-06-14T09:30:00Z",
  pgn: `1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Bb7 5. Bg2 Be7 6. Nc3 O-O 7. O-O d5 8. Ne5 c6 9. cxd5 cxd5 10. Bf4 a6 11. Rc1 b5 12. Qb3 Nc6 13. Nxc6 Bxc6 14. h3 Qd7 15. Kh2 Nh5 16. Bd2 f5 17. Qd1 b4 18. Nb1 Bb5 19. Rg1 Bd6 20. e4 fxe4 21. Qxh5 Rxf2 22. Qg5 Raf8 23. Kh1 R8f5 24. Qe3 Bd3 25. Rce1 h6 0-1`,
  checkpoints: [
    { ply: 0, cp: 0 },
    { ply: 14, cp: 5 },
    { ply: 18, cp: 3 },
    { ply: 22, cp: 0 },
    { ply: 26, cp: -8 },
    { ply: 30, cp: -15 },
    { ply: 32, cp: -20 },
    { ply: 36, cp: -30 },
    { ply: 40, cp: -60 },
    { ply: 42, cp: -80 },
    { ply: 46, cp: -120 },
    { ply: 48, cp: -150 },
    { ply: 50, cp: -200 },
  ],
  annotations: {
    "8w": {
      classification: "good",
      commentary:
        "Claude plants a knight on e5, occupying the outpost — but the advance is committal, and it hands Qwen a long-term target to chip away at.",
    },
    "11b": {
      classification: "best",
      commentary:
        "Qwen seizes queenside space with ...b5, the first concrete claim in a game that will be decided by slow pressure rather than fireworks.",
    },
    "15b": {
      classification: "excellent",
      tags: ["turning-point"],
      commentary:
        "Qwen reroutes the knight toward f4, probing the light squares Claude has left weak. The bind begins with a quiet move.",
      reasoning:
        "The knight on h5 is heading to f4, where it will eye d3, e2 and the king. Claude's position is cramped but still solid — for now.",
    },
    "16b": {
      classification: "excellent",
      commentary:
        "...f5 clamps down on e4 and fixes the centre. Claude's pieces have nowhere to expand, and Qwen's space advantage becomes permanent.",
    },
    "20w": {
      classification: "mistake",
      commentary:
        "Claude lashes out with e4, but the break only opens the position for Qwen's better-placed pieces. In a closed game, patience was the only move.",
      reasoning:
        "The centre break hands Black the f-file and the light squares. A waiting move such as Rc2 would have kept the bind merely annoying instead of fatal.",
      alternative: {
        san: "20.Rc2",
        cp: -18,
        note: "Keeping the position closed was essential; the break invites the invasion.",
      },
    },
    "21b": {
      classification: "excellent",
      tags: ["turning-point"],
      commentary:
        "Qwen's rook storms onto f2, and the bind that had been building for twenty moves finally bites. White's king position cracks open.",
    },
    "23b": {
      classification: "best",
      commentary:
        "The second rook comes to f5, harassing the queen and completing the invasion. Every white piece is now tied down.",
    },
    "24b": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "Qwen's bishop sinks onto d3, paralysing White's entire army. This is the move that creates the immortal zugzwang.",
      reasoning:
        "The bishop on d3 dominates: it attacks b1, c2 and e2, while every other black piece stands on the perfect square. White has no constructive move left.",
    },
    "25b": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "A quiet pawn move — and Claude resigns. In the immortal zugzwang, every legal move loses material, so the most patient move was the killing blow.",
    },
  },
  narrative: {
    opening:
      "Claude builds a broad centre and fianchettoes, while Qwen counters with a hypermodern queen's-side setup. From the very first moves, it is space against flexibility.",
    firstTension:
      "Qwen stakes a claim on the queenside with ...b5, the first sign that this game will be decided by slow pressure rather than fireworks.",
    firstTensionPly: 22,
    turningPoint:
      "Qwen's rook storms onto f2, and the bind that had been building for twenty moves finally bites.",
    turningPointPly: 42,
    criticalMistake:
      "Claude's impatient 20.e4 cracked open its own king; in a closed position it had to wait, but the centre break handed Qwen the open lines.",
    criticalMistakePly: 39,
    finalSequence:
      "Qwen's bishop lands on d3 and White falls into the immortal zugzwang — a position where every single legal move loses.",
    finalSequencePly: 48,
    summary:
      "Qwen never allowed a single tactical outburst; it constricted Claude move by move until the position suffocated itself. The final zugzwang is a positional chess textbook in miniature.",
  },
};

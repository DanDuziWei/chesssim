import type { MatchSeed } from "../seed";

export const deepseekVsClaude: MatchSeed = {
  slug: "deepseek-vs-claude-001",
  title: "DeepSeek vs Claude",
  theme: "Long-horizon Strategy",
  status: "completed",
  result: "0-1",
  whiteAgentId: "deepseek",
  blackAgentId: "claude",
  opening: "King's Indian Defence",
  premise:
    "One premature centre push, and the game becomes a lesson in long-term calculation: Claude sacrifices the queen to launch a combination that never lets DeepSeek breathe.",
  summary:
    "Claude's long-horizon combination — launched with a queen sacrifice and sustained through a windmill of checks — turned a quiet opening into one of the most celebrated attacks ever played.",
  createdAt: "2025-06-16T20:15:00Z",
  pgn: `1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`,
  checkpoints: [
    { ply: 0, cp: 0 },
    { ply: 8, cp: 12 },
    { ply: 18, cp: 22 },
    { ply: 24, cp: 5 },
    { ply: 26, cp: -10 },
    { ply: 30, cp: -15 },
    { ply: 34, cp: -30 },
    { ply: 44, cp: -100 },
    { ply: 50, cp: -160 },
    { ply: 56, cp: -240 },
    { ply: 66, cp: -300 },
    { ply: 76, cp: -500 },
    { ply: 80, cp: -800 },
    { ply: 82, cp: -800, mate: -1 },
  ],
  annotations: {
    "8w": {
      classification: "mistake",
      commentary:
        "DeepSeek's ambitious 8.e4 grabs space but leaves the d4-pawn and the e4-square chronically weak. Every one of Claude's later blows flows from this over-extension.",
      reasoning:
        "The pawn on e4 is a target and the square e4 becomes an outpost. A quieter setup (8.Be2) would have kept the centre firm.",
      alternative: {
        san: "8.e3",
        cp: 8,
        note: "A quieter centre keeps the d4-pawn protected; the ambitious e4 push leaves it a permanent target.",
      },
    },
    "13b": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "Claude regains the pawn with 13...Nxe4 — the opening shot of the combination. Suddenly every one of DeepSeek's central pieces feels loose.",
    },
    "14b": {
      classification: "good",
      commentary:
        "The queen steps to b6, hitting b2 and f2 and joining the attack on White's over-extended centre.",
    },
    "17b": {
      classification: "brilliant",
      tags: ["sacrifice", "turning-point"],
      commentary:
        "Claude offers the queen with 17...Be6! The position explodes into one of the most famous combinations ever played.",
      reasoning:
        "The bishop calmly ignores the attacked queen and cuts off the White queen's retreat, setting a trap: taking the queen walks into a windmill of checks.",
    },
    "19b": {
      classification: "excellent",
      commentary:
        "The knight begins its windmill, delivering check after check while the queen is quietly regathered. DeepSeek's king is dragged into the open.",
    },
    "23b": {
      classification: "good",
      commentary:
        "The a-pawn recaptures the bishop, and material is restored — except that Black now owns the open a-file and a raging initiative.",
    },
    "27b": {
      classification: "excellent",
      commentary:
        "The knight lands on f2, and DeepSeek's position falls apart. Claude's pieces coordinate like a single machine.",
    },
    "41b": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "Rc2# — the rook delivers mate after a twelve-move forcing sequence. The queen was never captured, only offered; the game was over the moment it was declined.",
    },
  },
  narrative: {
    opening:
      "DeepSeek plays the Réti-style 1.Nf3 and builds a broad centre, while Claude fianchettoes and waits. The stage is set for a long, patient struggle.",
    firstTension:
      "Claude regains the pawn with 13...Nxe4, and suddenly every one of DeepSeek's central pieces feels loose.",
    firstTensionPly: 26,
    turningPoint:
      "Claude offers the queen with 17...Be6, and the position explodes into a combination that will be studied for decades.",
    turningPointPly: 34,
    criticalMistake:
      "DeepSeek's ambitious 8.e4 left the d4-pawn and the e4-square weak for the rest of the game; Claude's entire attack flowed from that one over-extension.",
    criticalMistakePly: 15,
    finalSequence:
      "A windmill of checks forces the white king across the board until Claude's rook delivers mate on c2.",
    finalSequencePly: 80,
    summary:
      "Claude's long-horizon combination — launched with a queen sacrifice and sustained through a twelve-move sequence of forcing checks — turned a quiet opening into the most celebrated attacking game ever played. DeepSeek's early central aggression simply handed Claude the levers it needed.",
  },
};

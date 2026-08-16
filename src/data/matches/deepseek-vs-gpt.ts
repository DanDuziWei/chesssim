import type { MatchSeed } from "../seed";

export const deepseekVsGpt: MatchSeed = {
  slug: "deepseek-vs-gpt-001",
  title: "DeepSeek vs GPT",
  theme: "Aggression vs Adaptation",
  status: "completed",
  result: "1-0",
  whiteAgentId: "deepseek",
  blackAgentId: "gpt",
  opening: "Philidor Defence",
  premise:
    "A study in two styles: DeepSeek hunts the enemy king from move one, while GPT tries to trade down and weather the storm.",
  summary:
    "DeepSeek committed to a sacrificial attack and never relented. GPT defended resourcefully, but one queenside lunge left the king permanently exposed.",
  createdAt: "2025-06-12T10:00:00Z",
  pgn: `1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  checkpoints: [
    { ply: 0, cp: 0 },
    { ply: 2, cp: 15 },
    { ply: 4, cp: 25 },
    { ply: 6, cp: 20 },
    { ply: 8, cp: 30 },
    { ply: 10, cp: 35 },
    { ply: 12, cp: 18 },
    { ply: 14, cp: 30 },
    { ply: 16, cp: 25 },
    { ply: 18, cp: 10 },
    { ply: 20, cp: 85 },
    { ply: 22, cp: 90 },
    { ply: 24, cp: 110 },
    { ply: 26, cp: 140 },
    { ply: 28, cp: 160 },
    { ply: 30, cp: 180 },
    { ply: 32, cp: 240 },
    { ply: 33, cp: 240, mate: 1 },
  ],
  annotations: {
    "2b": {
      classification: "inaccuracy",
      commentary:
        "GPT plays the Philidor Defence — solid but a touch passive. The pawn on d6 blocks the dark-squared bishop and concedes the centre.",
      reasoning:
        "The Philidor is objectively playable but gives White a comfortable space advantage without much counterplay; modern engines prefer the flexible 2...Nc6.",
      alternative: {
        san: "2...Nc6",
        cp: 12,
        note: "2...Nc6 keeps the centre fluid; the Philidor concedes space early.",
      },
    },
    "4b": {
      classification: "inaccuracy",
      commentary:
        "GPT trades its bishop for the knight, handing DeepSeek the bishop pair. The capture accelerates White's development for nothing.",
      reasoning:
        "Exchanging Bxf3 gives away a good bishop and lets White recapture with the queen, developing it with tempo toward the kingside.",
    },
    "9w": {
      classification: "best",
      commentary:
        "DeepSeek pins the f6-knight, tightening the grip on a king that still sits in the centre. The pressure is already uncomfortable.",
    },
    "9b": {
      classification: "mistake",
      commentary:
        "GPT lashes out with ...b5, trying to trade off the tension — but the lunge weakens the queenside and walks straight into a combination.",
      reasoning:
        "A classic case of attacking where you are weak. The b5-pawn is a target, and every black piece on the queenside is suddenly loose.",
      alternative: {
        san: "9...h6",
        cp: 8,
        note: "Challenging the pin first was safer; the queenside lunge creates targets White can sacrifice into.",
      },
    },
    "10w": {
      classification: "brilliant",
      tags: ["sacrifice", "turning-point"],
      commentary:
        "DeepSeek sacrifices the knight on b5, ripping open the queenside to reach the exposed black king. Material is given away, but the initiative is everything.",
      reasoning:
        "After ...cxb5, the b-file opens and the c4-bishop rakes toward f7. White gets two pawns, a raging initiative and a king that can never castle.",
    },
    "13w": {
      classification: "brilliant",
      tags: ["sacrifice"],
      commentary:
        "DeepSeek trades a rook for a knight to remove the last defender and keep the black king pinned in the middle of the board.",
      reasoning:
        "Rxd7 wins a piece because ...Rxd7 is met by Rd1, when the d7-rook is overworked and the e-file is about to open.",
    },
    "14b": {
      classification: "good",
      commentary:
        "GPT finds the only defence, swinging the queen to e6 to hold the d7-rook and cover the king's flight squares.",
    },
    "15w": {
      classification: "excellent",
      commentary:
        "DeepSeek removes the rook with check, dragging the knight away from its defensive post. The net around the black king is nearly complete.",
    },
    "16w": {
      classification: "brilliant",
      tags: ["sacrifice"],
      commentary:
        "DeepSeek offers the queen. If GPT accepts with ...Nxb8, the rook slides to d8 and it is checkmate.",
      reasoning:
        "Qb8+ is a deflection in its purest form: the knight on d7 is the only piece covering d8, so forcing it to b8 vacates the mating square.",
    },
    "16b": {
      classification: "good",
      commentary: "GPT has no choice but to capture — every other move loses instantly.",
    },
    "17w": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "Rd8# — the point of it all. A back-rank mate delivered with a rook, a bishop and a queen that was never meant to survive.",
    },
  },
  narrative: {
    opening:
      "DeepSeek opens with the King's Pawn and GPT answers with the solid Philidor Defence — an early signal of the evening's dynamic: White will attack, Black will try to contain.",
    firstTension:
      "DeepSeek pins the f6-knight with 9.Bg5, and the pressure on GPT's uncastled king begins to build.",
    firstTensionPly: 17,
    turningPoint:
      "DeepSeek sacrifices a knight on b5, opening lines toward the black monarch and converting material into a relentless initiative.",
    turningPointPly: 19,
    criticalMistake:
      "GPT's queenside lunge 9...b5 — the moment the game turned — weakened its king and handed DeepSeek the exact lever it needed.",
    criticalMistakePly: 18,
    finalSequence:
      "A final queen sacrifice on b8 deflects the defender, and the rook delivers a back-rank mate on d8.",
    finalSequencePly: 31,
    summary:
      "DeepSeek committed to a sacrificial kingside attack and never relented. GPT defended resourcefully but its early queenside lunge left the king permanently exposed, and a final queen sacrifice closed the game with a back-rank mate.",
  },
};

import type { MatchSeed } from "../seed";

export const deepseekVsClaude: MatchSeed = {
  slug: "deepseek-vs-claude",
  title: "DeepSeek vs Claude",
  theme: "Long-horizon Strategy",
  simulationNumber: "Simulation Match #003",
  status: "completed",
  result: "0-1",
  whiteAgentId: "deepseek",
  blackAgentId: "claude",
  opening: "King's Indian Defence",
  premise:
    "One premature centre push, and the game becomes a lesson in long-term calculation: Claude sacrifices the queen to launch a combination that never lets DeepSeek breathe.",
  summary:
    "Claude's long-horizon combination — launched with a queen sacrifice and sustained through a windmill of checks — turned a quiet opening into one of the most celebrated attacks ever played.",
  summaryZh:
    "Claude 的长线组合——以弃后开局、以风车将军推进——把一盘安静的开局变成了史上最著名的进攻之一。DeepSeek 过早的中心扩张，恰好递上了 Claude 需要的全部杠杆。",
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
        "The pawn on e4 is a target and the square e4 becomes an outpost. A quieter setup (8.e3) would have kept the centre firm.",
      zh: {
        story:
          "DeepSeek 雄心勃勃的 8.e4 抢占了空间，却让 d4 兵和 e4 格从此变得脆弱。Claude 之后所有的重拳，都源于这次过度扩张。",
        reasoning:
          "e4 兵成了靶子，e4 格成了前哨。更稳的 8.e3 本可以保住中心的完整。",
      },
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
      zh: {
        story:
          "Claude 用 13...Nxe4 夺回兵——这是整套组合的第一枪。一瞬间，DeepSeek 中心的所有棋子都开始松动。",
      },
    },
    "14b": {
      classification: "good",
      commentary:
        "The queen steps to b6, hitting b2 and f2 and joining the attack on White's over-extended centre.",
      zh: {
        story:
          "黑后走到 b6，同时瞄着 b2 和 f2，加入到对白方过度扩张中心的围攻之中。",
      },
    },
    "17b": {
      classification: "brilliant",
      tags: ["sacrifice", "turning-point"],
      commentary:
        "Claude offers the queen with 17...Be6! The position explodes into one of the most famous combinations ever played.",
      reasoning:
        "The bishop calmly ignores the attacked queen and cuts off the White queen's retreat, setting a trap: taking the queen walks into a windmill of checks.",
      zh: {
        story:
          "Claude 以 17...Be6 献出皇后！局面瞬间爆炸，展开国际象棋史上最著名的组合之一。",
        reasoning:
          "这步象冷静地无视了被攻击的皇后，同时切断白后的退路并设下陷阱：吃掉皇后，就会陷入风车将军的漩涡。",
      },
    },
    "19b": {
      classification: "excellent",
      commentary:
        "The knight begins its windmill, delivering check after check while the queen is quietly regathered. DeepSeek's king is dragged into the open.",
      zh: {
        story:
          "黑马启动风车：将军、再将军，一边回收着皇后。DeepSeek 的王被一步步拖进开阔地。",
      },
    },
    "23b": {
      classification: "good",
      commentary:
        "The a-pawn recaptures the bishop, and material is restored — except that Black now owns the open a-file and a raging initiative.",
      zh: {
        story:
          "a 兵吃回黑格象，物质看似恢复——只是黑方如今拥有开放的 a 线和汹涌的主动权。",
      },
    },
    "27b": {
      classification: "excellent",
      commentary:
        "The knight lands on f2, and DeepSeek's position falls apart. Claude's pieces coordinate like a single machine.",
      zh: {
        story:
          "黑马落在 f2，DeepSeek 的阵地土崩瓦解。Claude 的子力像一台精密的机器般协同作战。",
      },
    },
    "41b": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "Rc2# — the rook delivers mate after a twelve-move forcing sequence. The queen was never captured, only offered; the game was over the moment it was declined.",
      zh: {
        story:
          "Rc2# ——经过十二回合的强制序列，车完成将杀。皇后从未被吃，只是被献上；当对手拒绝这份礼物时，棋局其实已经结束。",
      },
    },
  },
  narrative: {
    chapters: [
      {
        id: "opening",
        title: "Opening",
        zhTitle: "开局",
        text: "DeepSeek plays the Réti-style 1.Nf3 and builds a broad centre, while Claude fianchettoes and waits. The stage is set for a long, patient struggle.",
        zhText:
          "DeepSeek 以列蒂式的 1.Nf3 开局并构筑宽阔中心，Claude 则侧翼出象静静等待。一场漫长而耐心的较量拉开序幕。",
      },
      {
        id: "battle",
        title: "The Battle Begins",
        zhTitle: "战火点燃",
        text: "Claude regains the pawn with 13...Nxe4, and suddenly every one of DeepSeek's central pieces feels loose.",
        zhText:
          "Claude 用 13...Nxe4 夺回兵——刹那间，DeepSeek 中心的所有棋子都开始松动。",
        ply: 26,
      },
      {
        id: "critical",
        title: "Critical Moment",
        zhTitle: "关键一刻",
        text: "Claude offers the queen with 17...Be6, and the position explodes into a combination that will be studied for decades.",
        zhText:
          "Claude 以 17...Be6 献出皇后，局面瞬间爆炸——一套将被后世研究数十年的组合就此展开。",
        ply: 34,
      },
      {
        id: "turning",
        title: "Turning Point",
        zhTitle: "转折点",
        text: "DeepSeek takes the offered queen, and the trap snaps shut: a windmill of knight checks begins, and the white king is dragged across the board.",
        zhText:
          "DeepSeek 吃下献上的皇后，陷阱随即合拢：黑马开始风车将军，白王被一路拖拽穿过整个棋盘。",
        ply: 35,
      },
      {
        id: "finale",
        title: "Final Attack",
        zhTitle: "最后总攻",
        text: "A windmill of checks forces the white king across the board until Claude's rook delivers mate on c2.",
        zhText:
          "风车将军把白王逼过整个棋盘，直到 Claude 的车在 c2 完成将杀。",
        ply: 80,
      },
      {
        id: "conclusion",
        title: "Conclusion",
        zhTitle: "终局",
        text: "The game lasted 41 moves, but it was decided on move 17. Claude saw the entire forcing sequence before offering the queen — long-horizon strategy in its purest, most beautiful form.",
        zhText:
          "棋局持续了 41 回合，但早在第 17 回合就已定局。Claude 在献后之前便算清了整个强制序列——这是长线战略最纯粹、最美丽的形态。",
      },
    ],
    summary:
      "Claude's long-horizon combination — launched with a queen sacrifice and sustained through a twelve-move sequence of forcing checks — turned a quiet opening into the most celebrated attacking game ever played. DeepSeek's early central aggression simply handed Claude the levers it needed.",
    summaryZh:
      "Claude 的长线组合——以弃后开局、以十二回合的风车将军推进——把一盘安静的开局变成了史上最著名的进攻棋局之一。DeepSeek 过早的中心扩张，恰好递上了 Claude 需要的全部杠杆。",
  },
};

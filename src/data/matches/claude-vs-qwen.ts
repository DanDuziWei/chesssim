import type { MatchSeed } from "../seed";

export const claudeVsQwen: MatchSeed = {
  slug: "claude-vs-qwen",
  title: "Claude vs Qwen",
  theme: "Positional Play",
  simulationNumber: "Simulation Match #002",
  status: "completed",
  result: "0-1",
  whiteAgentId: "claude",
  blackAgentId: "qwen",
  opening: "Queen's Indian Defence",
  premise:
    "No sacrifices, no drama — just patient, constricting positional play. Qwen demonstrates why the quietest moves are often the most brutal.",
  summary:
    "Qwen never allowed a single tactical outburst; it constricted Claude move by move until the position suffocated itself, ending in the immortal zugzwang.",
  summaryZh:
    "Qwen 全程没有给任何战术爆发留下机会，只是步步收紧，让 Claude 的棋局逐渐窒息，最终走向不朽的楚茨文克（zugzwang）——每一步都在输。",
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
      zh: {
        story:
          "Claude 把马钉在 e5 前哨——但这步棋投入过早，反而给了 Qwen 一个可以慢慢蚕食的长期目标。",
      },
    },
    "11b": {
      classification: "best",
      commentary:
        "Qwen seizes queenside space with ...b5, the first concrete claim in a game that will be decided by slow pressure rather than fireworks.",
      zh: {
        story:
          "Qwen 用 ...b5 抢占后翼空间——这是本局第一个实质性主张：这盘棋将由缓慢的压力决定，而不是烟花般的战术。",
      },
    },
    "15b": {
      classification: "excellent",
      tags: ["turning-point"],
      commentary:
        "Qwen reroutes the knight toward f4, probing the light squares Claude has left weak. The bind begins with a quiet move.",
      reasoning:
        "The knight on h5 is heading to f4, where it will eye d3, e2 and the king. Claude's position is cramped but still solid — for now.",
      zh: {
        story:
          "Qwen 把马转向 f4，开始试探 Claude 留下的浅格弱点。束缚，从一步安静的调动开始。",
        reasoning:
          "h5 马的目标是 f4，那里可以俯瞰 d3、e2 和王翼。Claude 的局面已经局促，但暂时仍然稳固。",
      },
    },
    "16b": {
      classification: "excellent",
      commentary:
        "...f5 clamps down on e4 and fixes the centre. Claude's pieces have nowhere to expand, and Qwen's space advantage becomes permanent.",
      zh: {
        story:
          "...f5 死死压住 e4，中心被彻底冻结。Claude 的子力无处伸展，Qwen 的空间优势从此成为永久。",
      },
    },
    "20w": {
      classification: "mistake",
      commentary:
        "Claude lashes out with e4, but the break only opens the position for Qwen's better-placed pieces. In a closed game, patience was the only move.",
      reasoning:
        "The centre break hands Black the f-file and the light squares. A waiting move such as Rc2 would have kept the bind merely annoying instead of fatal.",
      zh: {
        story:
          "Claude 用 e4 强行突围，但这步中心突破恰恰为 Qwen 位置更好的子力打开了局面。封闭局面里，耐心才是唯一的出路。",
        reasoning:
          "中心突破把 f 线和浅格拱手送黑。像 Rc2 这样的等待着法，还能让束缚只是恼人，而非致命。",
      },
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
      zh: {
        story:
          "Qwen 的车冲上 f2！二十回合以来慢慢收紧的束缚终于发力，白方的王前阵地被撕开。",
      },
    },
    "23b": {
      classification: "best",
      commentary:
        "The second rook comes to f5, harassing the queen and completing the invasion. Every white piece is now tied down.",
      zh: {
        story:
          "第二只车开到 f5 骚扰白后，入侵宣告完成——白方的每一颗棋子都被钉死。",
      },
    },
    "24b": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "Qwen's bishop sinks onto d3, paralysing White's entire army. This is the move that creates the immortal zugzwang.",
      reasoning:
        "The bishop on d3 dominates: it attacks b1, c2 and e2, while every other black piece stands on the perfect square. White has no constructive move left.",
      zh: {
        story:
          "Qwen 的象深深嵌入 d3，白方全军瘫痪。就是这一步，造就了不朽的楚茨文克。",
        reasoning:
          "d3 象统治全局：它同时攻击 b1、c2 和 e2，而黑方其余棋子都站在最佳位置。白方已没有任何建设性的着法。",
      },
    },
    "25b": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "A quiet pawn move — and Claude resigns. In the immortal zugzwang, every legal move loses material, so the most patient move was the killing blow.",
      zh: {
        story:
          "一步安静的挺兵——Claude 认输。在不朽的楚茨文克中，每一步合法着法都在输棋；最耐心的那一步，正是致命一击。",
      },
    },
  },
  narrative: {
    chapters: [
      {
        id: "opening",
        title: "Opening",
        zhTitle: "开局",
        text: "Claude builds a broad centre and fianchettoes, while Qwen counters with a hypermodern queen's-side setup. From the very first moves, it is space against flexibility.",
        zhText:
          "Claude 构筑宽阔中心并侧翼出象，Qwen 则以超现代的布局应对。从第一步起，这就是空间与弹性之争。",
      },
      {
        id: "battle",
        title: "The Battle Begins",
        zhTitle: "战火点燃",
        text: "Qwen stakes a claim on the queenside with ...b5, the first sign that this game will be decided by slow pressure rather than fireworks.",
        zhText:
          "Qwen 以 ...b5 在后翼宣告主权——第一个信号表明：这盘棋将由缓慢的压力而非烟花般的战术决定。",
        ply: 22,
      },
      {
        id: "critical",
        title: "Critical Moment",
        zhTitle: "关键一刻",
        text: "Claude's impatient 20.e4 cracked open its own king; in a closed position it had to wait, but the centre break handed Qwen the open lines.",
        zhText:
          "Claude 急躁的 20.e4 亲手打开了己方的王前阵地。封闭局面本该等待，这步中心突破却把开放线路送给了 Qwen。",
        ply: 39,
      },
      {
        id: "turning",
        title: "Turning Point",
        zhTitle: "转折点",
        text: "Qwen's rook storms onto f2, and the bind that had been building for twenty moves finally bites.",
        zhText:
          "Qwen 的车冲上 f2——酝酿了二十回合的束缚终于合拢咬合。",
        ply: 42,
      },
      {
        id: "finale",
        title: "Final Attack",
        zhTitle: "最后总攻",
        text: "Qwen's bishop lands on d3 and White falls into the immortal zugzwang — a position where every single legal move loses.",
        zhText:
          "Qwen 的象落在 d3，白方坠入不朽的楚茨文克——一个每一步合法着法都会输棋的局面。",
        ply: 48,
      },
      {
        id: "conclusion",
        title: "Conclusion",
        zhTitle: "终局",
        text: "There were no sacrifices and no brilliancies — only twenty-five moves of quiet constriction. Qwen proved that in chess, the most brutal attack is sometimes the one that never comes.",
        zhText:
          "没有弃子，没有妙手——只有二十五个回合安静的绞杀。Qwen 证明了：在国际象棋里，最凶残的进攻，有时恰恰是那场从未发动的进攻。",
      },
    ],
    summary:
      "Qwen never allowed a single tactical outburst; it constricted Claude move by move until the position suffocated itself. The final zugzwang is a positional chess textbook in miniature.",
    summaryZh:
      "Qwen 全程没有给任何战术爆发留下机会，只是步步收紧，让 Claude 的棋局逐渐窒息，最终走向不朽的楚茨文克（zugzwang）——每一步都在输棋。",
  },
};

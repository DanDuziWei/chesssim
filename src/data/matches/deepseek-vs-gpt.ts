import type { MatchSeed } from "../seed";

export const deepseekVsGpt: MatchSeed = {
  slug: "deepseek-vs-gpt",
  title: "DeepSeek vs GPT",
  theme: "Aggression vs Adaptation",
  simulationNumber: "Simulation Match #001",
  status: "completed",
  result: "1-0",
  whiteAgentId: "deepseek",
  blackAgentId: "gpt",
  opening: "Philidor Defence",
  premise:
    "A study in two styles: DeepSeek hunts the enemy king from move one, while GPT tries to trade down and weather the storm.",
  summary:
    "DeepSeek committed to a sacrificial attack and never relented. GPT defended resourcefully, but one queenside lunge left the king permanently exposed.",
  summaryZh:
    "DeepSeek 从第一步起就发动了以弃子为代价的攻王之战，全程没有松手。GPT 的防守一度顽强，但一次后翼的冒进让国王永久暴露，最终被后弃引离、底线将杀。",
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
      zh: {
        story:
          "GPT 选择了菲立道尔防御——稳固，但略显被动。d6 兵挡住了黑格象，也把中心拱手相让。",
        reasoning:
          "菲立道尔防御本身可以下，但它让白方舒服地掌控空间而缺少反击；现代引擎更偏爱灵活的 2...Nc6。",
      },
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
      zh: {
        story:
          "GPT 用象换马，把双象优势交给了 DeepSeek——这次交换白白加速了白方的出子。",
        reasoning:
          "象换马送掉了一只好象，还让白方用后吃回，顺手把后调动到了王翼。",
      },
    },
    "9w": {
      classification: "best",
      commentary:
        "DeepSeek pins the f6-knight, tightening the grip on a king that still sits in the centre. The pressure is already uncomfortable.",
      zh: {
        story:
          "DeepSeek 用象牵制 f6 马，收紧了对仍未易位的黑王的包围圈——压力已经让人喘不过气。",
      },
    },
    "9b": {
      classification: "mistake",
      commentary:
        "GPT lashes out with ...b5, trying to trade off the tension — but the lunge weakens the queenside and walks straight into a combination.",
      reasoning:
        "A classic case of attacking where you are weak. The b5-pawn is a target, and every black piece on the queenside is suddenly loose.",
      zh: {
        story:
          "GPT 用 ...b5 主动出击，试图化解紧张——但这步后翼的冒进削弱了自己的阵地，正好撞进一套组合拳。",
        reasoning:
          "在自己薄弱的地方动手是兵家大忌：b5 兵成了靶子，后翼的黑子瞬间全部松动。",
      },
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
      zh: {
        story:
          "DeepSeek 在 b5 弃马！撕开后翼，直指暴露的黑王。子力可以送，主动权才是全部。",
        reasoning:
          "...cxb5 之后 b 线洞开，c4 象直瞄 f7。白方得到两兵、澎湃的攻势，以及一个永远无法易位的黑王。",
      },
    },
    "13w": {
      classification: "brilliant",
      tags: ["sacrifice"],
      commentary:
        "DeepSeek trades a rook for a knight to remove the last defender and keep the black king pinned in the middle of the board.",
      reasoning:
        "Rxd7 wins a piece because ...Rxd7 is met by Rd1, when the d7-rook is overworked and the e-file is about to open.",
      zh: {
        story:
          "DeepSeek 用车换马，清除最后一个防守者，把黑王继续钉在棋盘中央。",
        reasoning:
          "Rxd7 赚得子力：...Rxd7 之后 Rd1 跟进，d7 车超负荷防守，e 线即将打开。",
      },
    },
    "14b": {
      classification: "good",
      commentary:
        "GPT finds the only defence, swinging the queen to e6 to hold the d7-rook and cover the king's flight squares.",
      zh: {
        story:
          "GPT 找到唯一防守，把后调到 e6，保护 d7 车并封住国王的逃生格。",
      },
    },
    "15w": {
      classification: "excellent",
      commentary:
        "DeepSeek removes the rook with check, dragging the knight away from its defensive post. The net around the black king is nearly complete.",
      zh: {
        story:
          "DeepSeek 带将吃掉车，把防守马从岗位上拖走——围住黑王的网即将收口。",
      },
    },
    "16w": {
      classification: "brilliant",
      tags: ["sacrifice"],
      commentary:
        "DeepSeek offers the queen. If GPT accepts with ...Nxb8, the rook slides to d8 and it is checkmate.",
      reasoning:
        "Qb8+ is a deflection in its purest form: the knight on d7 is the only piece covering d8, so forcing it to b8 vacates the mating square.",
      zh: {
        story:
          "DeepSeek 献出皇后！如果 GPT 用 ...Nxb8 接受，车滑到 d8 就是绝杀。",
        reasoning:
          "Qb8+ 是最纯粹的引离：d7 马是唯一守住 d8 的棋子，把它逼到 b8，杀格就空了出来。",
      },
    },
    "16b": {
      classification: "good",
      commentary: "GPT has no choice but to capture — every other move loses instantly.",
      zh: {
        story: "GPT 别无选择只能吃后——任何其他着法都会立刻输棋。",
      },
    },
    "17w": {
      classification: "brilliant",
      tags: ["turning-point"],
      commentary:
        "Rd8# — the point of it all. A back-rank mate delivered with a rook, a bishop and a queen that was never meant to survive.",
      zh: {
        story:
          "Rd8# ——一切的目的地。车、象，加上一个本就注定牺牲的皇后，联手完成底线将杀。",
      },
    },
  },
  narrative: {
    chapters: [
      {
        id: "opening",
        title: "Opening",
        zhTitle: "开局",
        text: "DeepSeek opens with the King's Pawn and GPT answers with the solid Philidor Defence — an early signal of the evening's dynamic: White will attack, Black will try to contain.",
        zhText:
          "DeepSeek 以王兵开局，GPT 应以稳重的菲立道尔防御——这已经预示了整盘棋的基调：白方进攻，黑方防守。",
      },
      {
        id: "battle",
        title: "The Battle Begins",
        zhTitle: "战火点燃",
        text: "DeepSeek pins the f6-knight with 9.Bg5, and the pressure on GPT's uncastled king begins to build. The battle has left the opening and entered the middlegame.",
        zhText:
          "DeepSeek 以 9.Bg5 牵制 f6 马，对尚未易位的黑王步步施压。战斗正式离开开局，进入中局。",
        ply: 17,
      },
      {
        id: "critical",
        title: "Critical Moment",
        zhTitle: "关键一刻",
        text: "GPT's queenside lunge 9...b5 — the moment the game turned — weakened its king and handed DeepSeek the exact lever it needed.",
        zhText:
          "GPT 的后翼冒进 9...b5 是整盘棋的转折时刻：它削弱了自己的防线，也把 DeepSeek 需要的撬棍递了过去。",
        ply: 18,
      },
      {
        id: "turning",
        title: "Turning Point",
        zhTitle: "转折点",
        text: "DeepSeek sacrifices a knight on b5, opening lines toward the black monarch and converting material into a relentless initiative.",
        zhText:
          "DeepSeek 在 b5 弃马，撕开通向黑王的线路，把物质转化为永不停歇的攻势。",
        ply: 19,
      },
      {
        id: "finale",
        title: "Final Attack",
        zhTitle: "最后总攻",
        text: "A final queen sacrifice on b8 deflects the defender, and the rook delivers a back-rank mate on d8.",
        zhText:
          "最后的皇后献祭落在 b8，引开唯一守将——车随即在 d8 完成底线将杀。",
        ply: 31,
      },
      {
        id: "conclusion",
        title: "Conclusion",
        zhTitle: "终局",
        text: "In seventeen moves, DeepSeek never once traded attack for material. The game is a pure expression of the platform's thesis: two intelligences, one board, and a story you can follow without knowing a single opening line.",
        zhText:
          "十七个回合里，DeepSeek 从未用攻势去换物质。这盘棋完美诠释了 ChessSim 的理念：两个智能，一张棋盘，一段无需任何棋理储备就能看懂的故事。",
      },
    ],
    summary:
      "DeepSeek committed to a sacrificial kingside attack and never relented. GPT defended resourcefully but its early queenside lunge left the king permanently exposed, and a final queen sacrifice closed the game with a back-rank mate.",
    summaryZh:
      "DeepSeek 从第一步起就发动了以弃子为代价的攻王之战，全程没有松手。GPT 的防守一度顽强，但一次后翼的冒进让国王永久暴露，最终被后弃引离、底线将杀。",
  },
};

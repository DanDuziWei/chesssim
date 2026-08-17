# ChessSim

> **Watch intelligence play.**

ChessSim is an **AI-powered chess simulation & entertainment platform**. It is
not another chess-playing site, not a Chess.com / Lichess clone. Two AI agents
sit across the board, compete and reason — and ChessSim turns their game into
something worth watching and understanding.

---

## Vision

ChessSim explores how artificial intelligence behaves under rules, competition
and strategy. Chess is the cleanest window into machine reasoning: a finite
board, perfect information, and an endless supply of decisions that can be
explained, evaluated and narrated.

## Current Stage

**v0.2 — AI-native simulation & storytelling.** Three Simulation Demo matches,
a real chess engine in the browser, and a narrative engine:

- Three annotated **Simulation Demo** matches (legal example games),
  `/match/deepseek-vs-gpt` (#001), `/match/claude-vs-qwen` (#002),
  `/match/deepseek-vs-claude` (#003)
- **Real Stockfish** (WASM, runs in a Web Worker): live evaluation, best move,
  mistake / brilliant-move detection, full-game analysis with progress and
  localStorage caching. Stockfish = truth; narrative = explanation.
- Interactive replay: board, evaluation bar, evaluation sparkline, move
  timeline, critical-move highlighting
- **AI Narrative Engine**: every move has a story, a "why this move matters"
  strategic note and live engine analysis — bilingual (EN / 中文)
- **Story Mode**: each match told as a six-chapter chess novel — Opening, The
  Battle Begins, Critical Moment, Turning Point, Final Attack, Conclusion
- **AI Player Profiles**: playing style, strength and strategy for every agent
- Homepage, match list, match pages, about and updates

No database. No accounts. No backend. All data lives in TypeScript files; the
LLM layer is not connected yet (commentary is authored content).

## Product Loop

```
Simulate → Explain → Render → Share
```

1. **Simulate** — two AI agents play a full game of chess (model vs model,
   strategy vs strategy).
2. **Explain** — every move is annotated: what changed, why the model chose it,
   the engine evaluation, better candidates, key mistakes.
3. **Render** — the same data becomes an interactive replay: board, eval bar,
   timeline, narrative panel, story mode. (Later: GIF / short video / Bilibili /
   YouTube.)
4. **Share** — every match has a permanent page, e.g. `/match/deepseek-vs-gpt`.

## Long-term Direction

ChessSim may eventually expand into:

- AI Agent competition
- AI benchmarks
- Simulation environments
- AI-generated sports and entertainment content

For now, the focus stays **strictly on chess**.

---

## Getting Started

Requirements: Node.js 18.18+ (tested on Node 24).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build           # production build
npm run start           # serve the production build
npm run validate:pgn    # verify all demo PGNs are legal & annotations align
npm run test:stockfish  # Node smoke test of the vendored Stockfish engine
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # /  homepage
│   ├── matches/page.tsx    # /matches
│   ├── match/[slug]/page.tsx  # /match/<slug>  replay
│   ├── about/page.tsx      # /about
│   ├── updates/page.tsx    # /updates
│   ├── layout.tsx          # root layout (nav + footer)
│   └── globals.css         # Tailwind + design tokens
├── components/             # UI components
│   ├── BoardReplay.tsx     # replay orchestrator (board, engine, panels, lang)
│   ├── BoardThumbnail.tsx  # static mini board
│   ├── EvaluationBar.tsx   # vertical eval bar with White/Black labels
│   ├── EvalSparkline.tsx   # evaluation curve across the whole game
│   ├── MoveInfo.tsx        # AI Narrative panel (story / why / engine analysis)
│   ├── MoveTimeline.tsx    # move list with engine classifications
│   ├── StoryMode.tsx       # six-chapter story mode (bilingual)
│   ├── MatchCard.tsx       # featured + compact match cards
│   ├── Navbar.tsx / Footer.tsx / AgentAvatar.tsx / Badge.tsx
├── hooks/
│   └── useStockfish.ts     # lazy WASM Stockfish worker hook
├── data/                   # the "database" for v0.2 (local TypeScript)
│   ├── agents.ts           # player/agent registry + AI profiles
│   ├── matches/*.ts        # one seed per match (PGN + annotations + narrative)
│   └── index.ts            # builds Match objects, lookup helpers
├── lib/
│   ├── types.ts            # Match / Move / Agent / Evaluation data model
│   ├── build.ts            # PGN expansion + annotation merge + eval curve
│   ├── stockfish.ts        # UCI protocol client (worker-agnostic, testable)
│   ├── engine-cache.ts     # localStorage cache for engine results
│   ├── classify.ts         # move classifications (brilliant, blunder, …)
│   ├── eval.ts             # evaluation formatting & win-probability math
│   └── chess-ui.ts         # board helpers (king square, swing descriptions)
└── public/engine/          # vendored Stockfish (WASM + asm.js fallback)

scripts/
├── validate-pgn.ts         # PGN legality + annotation alignment check
└── test-stockfish.mjs      # engine smoke test (Node, vm-based worker shim)
```

## Data Model

- **Match** — id, slug, title, theme, simulation number, white/black players,
  status, result, PGN, summary (EN/ZH), narrative (six chapters), positions
  (FEN per ply), moves.
- **Move** — ply, moveNumber, SAN, from/to, resulting FEN, evaluation (cp or
  mate), classification (book → brilliant), commentary (EN/ZH), reasoning,
  alternative, narrative tags (turning-point, sacrifice, …).
- **Agent** — id, name, model, provider, description, avatar accent, plus an
  AI player profile: playing style, strength, strategy.

Matches are authored as *seeds*: a legal PGN plus sparse checkpoints
(evaluation curve) and move annotations keyed by `"<moveNumber><color>"`
(e.g. `"17b"`). `src/lib/build.ts` expands the PGN with chess.js, validates
legality, interpolates the evaluation curve and merges annotations — throwing
a descriptive error if any move is illegal.

At runtime, the browser loads Stockfish (WASM) in a Web Worker via
`src/lib/stockfish.ts`. The engine provides ground truth (evaluation, best
move, mistake/brilliant classification); the authored narrative explains it.

## Design Principles

- Lightweight — minimal dependencies, no backend, no database
- Content first — the game and its story are the interface
- Simple over perfect; working prototype over feature completeness
- Editorial, high-end, chess-native aesthetic (black / white / grey / warm
  paper; low-saturation wooden board)

## Tech Stack

Next.js (App Router) · TypeScript · Tailwind CSS · chess.js · react-chessboard
· ready to deploy on Vercel.

## Disclaimer

All v0.1 matches are **Simulation Demos**: they use legal example games to
demonstrate the experience and were not generated by the named models.

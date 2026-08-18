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

**v0.3 — AI Chess Arena.** The simulation loop is now real: live, move-by-move
AI-vs-AI games run in the browser, with a real chess engine as ground truth.

- **`/arena` — AI Chess Arena**: pick two agents, watch them fight live with
  engine evaluation, commentary, pause/pace control and PGN export
- **LLM agents** (DeepSeek, GPT, Claude, Qwen, Gemini) play through the
  ChessSim API when their keys are configured; without a key they honestly
  fall back to a local heuristic (clearly labelled — never fake)
- **Stockfish agents** at configurable depth + greedy / random baseline bots
- Finished games become **full replays** (Story Mode, bilingual narrative,
  engine analysis) built on the fly
- Three curated **Simulation Demo** matches:
  `/match/deepseek-vs-gpt` (#001), `/match/claude-vs-qwen` (#002),
  `/match/deepseek-vs-claude` (#003)
- Real Stockfish (WASM, Web Worker): live evaluation, best move,
  mistake / brilliant-move detection, full-game analysis with caching
- AI Narrative Engine (story + strategy + engine truth, EN / 中文),
  six-chapter Story Mode, AI Player Profiles

No database. No accounts. LLM commentary requires provider API keys
(see below); everything else runs with zero configuration.

## Product Loop

```
Simulate → Explain → Render → Share
```

1. **Simulate** — the Arena runs real games: LLM models (with API keys) and
   the actual Stockfish engine play move by move in the browser.
2. **Explain** — every move is annotated: what changed, why the model chose it,
   the engine evaluation, better candidates, key mistakes.
3. **Render** — the same data becomes an interactive replay: board, eval bar,
   timeline, narrative panel, story mode. (Later: GIF / short video / Bilibili /
   YouTube.)
4. **Share** — curated matches have permanent pages (e.g.
   `/match/deepseek-vs-gpt`); arena games export to PGN.

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
npm run test:simulation # arena layer tests (heuristics, LLM parsing, builders)
```

## LLM API Keys (optional)

The Arena works fully **without any keys** (Stockfish + baseline bots). To let
real language models play, set the provider keys as environment variables —
locally in `.env.local`, or in Vercel under *Settings → Environment Variables*:

```bash
DEEPSEEK_API_KEY=sk-...     # DeepSeek   → deepseek-chat
OPENAI_API_KEY=sk-...       # OpenAI     → gpt-4o
ANTHROPIC_API_KEY=sk-...    # Anthropic  → claude-3-7-sonnet-latest
GEMINI_API_KEY=...          # Google     → gemini-2.0-flash
DASHSCOPE_API_KEY=sk-...    # Alibaba    → qwen-max
```

Agents without a configured key are clearly labelled in the Arena and fall
back to the local heuristic — the platform never fakes an LLM move.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # /  homepage
│   ├── matches/page.tsx    # /matches
│   ├── arena/page.tsx      # /arena  live simulation
│   ├── match/[slug]/page.tsx  # /match/<slug>  replay
│   ├── about/page.tsx      # /about
│   ├── updates/page.tsx    # /updates
│   ├── api/agents/route.ts # agent registry + key status
│   ├── api/llm/move/route.ts      # LLM move selection (server proxy)
│   ├── api/llm/narrate/route.ts   # LLM narrative generation
│   ├── layout.tsx          # root layout (nav + footer)
│   └── globals.css         # Tailwind + design tokens
├── components/             # UI components
│   ├── ArenaSim.tsx        # arena: setup, live game, result, replay, PGN
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
│   ├── useStockfish.ts     # lazy WASM Stockfish worker hook
│   └── useSimulation.ts    # arena game loop (LLM / engine / heuristic moves)
├── data/                   # curated matches (local TypeScript)
│   ├── agents.ts           # player/agent registry + AI profiles
│   ├── matches/*.ts        # one seed per match (PGN + annotations + narrative)
│   └── index.ts            # builds Match objects, lookup helpers
├── lib/
│   ├── llm/                # server-side LLM layer
│   │   ├── providers.ts    # DeepSeek / OpenAI / Anthropic / Gemini / DashScope
│   │   └── prompt.ts       # move & narrative prompts + parsing (pure, tested)
│   ├── simulation/         # arena layer (client + server safe)
│   │   ├── agents.ts       # agent registry (LLM / engine / heuristic)
│   │   ├── heuristics.ts   # greedy + random baseline bots
│   │   └── build-match.ts  # live game → replayable Match + auto narrative
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
├── test-stockfish.mjs      # engine smoke test (Node, vm-based worker shim)
└── test-simulation.ts      # arena tests (heuristics, LLM parsing, builders)
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

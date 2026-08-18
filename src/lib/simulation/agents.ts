/**
 * Shared registry of simulation agents (client + server safe).
 *
 * kind "llm"      → plays via the /api/llm/move proxy (needs a provider key)
 * kind "engine"   → plays via the in-browser Stockfish engine (no key needed)
 * kind "heuristic"→ plays via a tiny local heuristic (no key needed)
 */

export type LlmProviderName =
  | "deepseek"
  | "openai"
  | "anthropic"
  | "gemini"
  | "dashscope";

export type SimAgentKind = "llm" | "engine" | "heuristic";

export interface SimAgent {
  id: string;
  name: string;
  kind: SimAgentKind;
  /** LLM provider + model (llm agents only). */
  provider?: LlmProviderName;
  model?: string;
  /** Engine search depth (engine agents only). */
  depth?: number;
  /** Heuristic selector (heuristic agents only). */
  heuristic?: "greedy" | "random";
  description: string;
  initials: string;
  accent: string;
  /* AI player profile (reused by the replay experience). */
  style: string;
  strength: string;
  strategy: string;
}

export const SIM_AGENTS: SimAgent[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    kind: "llm",
    provider: "deepseek",
    model: "deepseek-chat",
    description:
      "An aggressive, tactically sharp reasoner that thrives in open, imbalanced positions.",
    initials: "DS",
    accent: "#C2410C",
    style: "Aggressive",
    strength: "Calculation",
    strategy: "Long-term planning",
  },
  {
    id: "gpt",
    name: "GPT",
    kind: "llm",
    provider: "openai",
    model: "gpt-4o",
    description:
      "An adaptive generalist that defends resourcefully and trades into simpler positions.",
    initials: "GP",
    accent: "#10A37F",
    style: "Adaptive",
    strength: "Defense",
    strategy: "Simplification & counterplay",
  },
  {
    id: "claude",
    name: "Claude",
    kind: "llm",
    provider: "anthropic",
    model: "claude-3-7-sonnet-latest",
    description:
      "A patient, positional player that builds long-term plans and calculates deeply.",
    initials: "CL",
    accent: "#D97757",
    style: "Positional",
    strength: "Deep calculation",
    strategy: "Structural pressure & patience",
  },
  {
    id: "qwen",
    name: "Qwen",
    kind: "llm",
    provider: "dashscope",
    model: "qwen-max",
    description:
      "A precise, methodical player that squeezes the smallest advantages into full points.",
    initials: "QW",
    accent: "#5B5BD6",
    style: "Methodical",
    strength: "Precision",
    strategy: "Squeezing small advantages",
  },
  {
    id: "gemini",
    name: "Gemini",
    kind: "llm",
    provider: "gemini",
    model: "gemini-2.0-flash",
    description:
      "A fast, pattern-driven generalist that mixes solid play with sharp tactics.",
    initials: "GM",
    accent: "#2F6FE4",
    style: "Dynamic",
    strength: "Pattern recognition",
    strategy: "Flexible imbalance",
  },
  {
    id: "stockfish-4",
    name: "Stockfish · Casual",
    kind: "engine",
    depth: 4,
    description:
      "The real Stockfish engine running at a shallow depth — strong, but beatable.",
    initials: "SF",
    accent: "#4E6B3E",
    style: "Engine-solid",
    strength: "Tactics",
    strategy: "Depth 4 search",
  },
  {
    id: "stockfish-10",
    name: "Stockfish · Strong",
    kind: "engine",
    depth: 10,
    description:
      "The real Stockfish engine searching deeply — essentially unbeatable by the other agents.",
    initials: "SF",
    accent: "#2E4B1E",
    style: "Engine-brutal",
    strength: "Near-perfect tactics",
    strategy: "Depth 10 search",
  },
  {
    id: "greedy",
    name: "Greedy Bot",
    kind: "heuristic",
    heuristic: "greedy",
    description:
      "A simple baseline agent that grabs material and gives checks whenever it can.",
    initials: "GR",
    accent: "#8A6A3B",
    style: "Materialistic",
    strength: "Nothing",
    strategy: "Take free stuff",
  },
  {
    id: "random",
    name: "Random Bot",
    kind: "heuristic",
    heuristic: "random",
    description:
      "Pure chaos — picks a random legal move. The control group of the arena.",
    initials: "RD",
    accent: "#9B9386",
    style: "Random",
    strength: "Surprise",
    strategy: "No strategy",
  },
];

export function getSimAgent(id: string): SimAgent | undefined {
  return SIM_AGENTS.find((a) => a.id === id);
}

export function simAgentsByKind(): Record<SimAgentKind, SimAgent[]> {
  const out: Record<SimAgentKind, SimAgent[]> = { llm: [], engine: [], heuristic: [] };
  for (const a of SIM_AGENTS) out[a.kind].push(a);
  return out;
}

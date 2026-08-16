import type { Agent } from "@/lib/types";

export const agents: Record<string, Agent> = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    model: "DeepSeek-R1",
    provider: "DeepSeek",
    description:
      "An aggressive, tactically sharp reasoner that thrives in open, imbalanced positions and hunts the enemy king.",
    initials: "DS",
    accent: "#C2410C",
  },
  gpt: {
    id: "gpt",
    name: "GPT",
    model: "GPT-4o",
    provider: "OpenAI",
    description:
      "An adaptive generalist that defends resourcefully, absorbs pressure and trades down into simpler positions.",
    initials: "GP",
    accent: "#10A37F",
  },
  claude: {
    id: "claude",
    name: "Claude",
    model: "Claude Sonnet 4",
    provider: "Anthropic",
    description:
      "A patient, positional player that builds long-term plans, calculates deeply and prizes structure over flash.",
    initials: "CL",
    accent: "#D97757",
  },
  qwen: {
    id: "qwen",
    name: "Qwen",
    model: "Qwen3-Max",
    provider: "Alibaba",
    description:
      "A precise, methodical player that squeezes the smallest advantages into full points without ever overreaching.",
    initials: "QW",
    accent: "#5B5BD6",
  },
};

import { NextResponse } from "next/server";
import { SIM_AGENTS } from "@/lib/simulation/agents";
import { providerAvailable } from "@/lib/llm/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/agents
 * Lists simulation agents and which LLM providers have API keys configured.
 */
export async function GET() {
  const configured: Record<string, boolean> = {};
  for (const a of SIM_AGENTS) {
    if (a.kind === "llm" && a.provider) {
      configured[a.id] = providerAvailable(a.provider);
    }
  }
  return NextResponse.json({
    agents: SIM_AGENTS.map(({ id, name, kind, description, initials, accent, style, strength, strategy, depth, heuristic }) => ({
      id,
      name,
      kind,
      description,
      initials,
      accent,
      style,
      strength,
      strategy,
      depth,
      heuristic,
    })),
    configured,
    engines: true,
  });
}

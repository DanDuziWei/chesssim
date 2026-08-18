import { NextResponse } from "next/server";
import { getSimAgent } from "@/lib/simulation/agents";
import { chat, providerAvailable } from "@/lib/llm/providers";
import {
  buildNarrateSystemPrompt,
  buildNarrateUserPrompt,
  parseNarrative,
} from "@/lib/llm/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface NarrateRequestBody {
  agentId: string;
  fen: string;
  moveSan: string;
  evalCp: number | null;
  mate: number | null;
  language: "en" | "zh";
  historySummary: string;
}

/**
 * POST /api/llm/narrate
 * Generate a story paragraph + strategic reasoning for one move.
 * Returns 503 { error: "no-key" } when the provider is not configured.
 */
export async function POST(req: Request) {
  let body: NarrateRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const agent = getSimAgent(body.agentId);
  if (!agent || agent.kind !== "llm" || !agent.provider || !agent.model) {
    return NextResponse.json({ error: "unknown-agent" }, { status: 404 });
  }

  if (!providerAvailable(agent.provider)) {
    return NextResponse.json(
      { error: "no-key", message: `${agent.name} is not configured on the server.` },
      { status: 503 }
    );
  }

  try {
    const raw = await chat(
      agent.provider,
      agent.model,
      buildNarrateSystemPrompt(),
      buildNarrateUserPrompt({
        agentName: agent.name,
        fen: body.fen,
        moveSan: body.moveSan,
        evalCp: body.evalCp,
        mate: body.mate,
        language: body.language === "zh" ? "zh" : "en",
        historySummary: body.historySummary ?? "No additional context.",
      }),
      { maxTokens: 320, temperature: 0.8 }
    );
    const parsed = parseNarrative(raw);
    return NextResponse.json({
      story: parsed.story,
      reasoning: parsed.reasoning,
      fallback: !parsed.story,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "provider-error", message }, { status: 502 });
  }
}

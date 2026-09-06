import { NextResponse } from "next/server";
import { getSimAgent } from "@/lib/simulation/agents";
import { isMatchStoreConfigured, saveMatch } from "@/lib/match-store";
import type { Match } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SAVES_PER_WINDOW = 6;
const MAX_BODY_BYTES = 700_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientAddress(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function rateLimited(address: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(address);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(address, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_SAVES_PER_WINDOW;
}

function isValidMatch(value: unknown): value is Match {
  if (!value || typeof value !== "object") return false;
  const match = value as Partial<Match>;
  const variant = match.variant ?? "standard";
  return Boolean(
    match.status === "completed" &&
      (variant === "standard" || variant === "chess960") &&
      getSimAgent(match.whiteAgentId ?? "") &&
      getSimAgent(match.blackAgentId ?? "") &&
      ["1-0", "0-1", "1/2-1/2"].includes(match.result ?? "") &&
      typeof match.pgn === "string" &&
      match.pgn.length <= 60_000 &&
      Number.isInteger(match.moveCount) &&
      (match.moveCount ?? 0) > 0 &&
      (match.moveCount ?? 0) <= 240 &&
      Array.isArray(match.moves) &&
      match.moves.length === match.moveCount &&
      Array.isArray(match.positions) &&
      match.positions.length === (match.moveCount ?? 0) + 1 &&
      Boolean(match.story && Array.isArray(match.story.moments))
  );
}

export async function POST(request: Request) {
  if (!isMatchStoreConfigured()) {
    return NextResponse.json({ persisted: false, reason: "not-configured" });
  }
  if (rateLimited(clientAddress(request))) {
    return NextResponse.json(
      { persisted: false, reason: "rate-limited" },
      { status: 429 }
    );
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload-too-large" }, { status: 413 });
  }

  let body: { match?: unknown };
  try {
    body = JSON.parse(text) as { match?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }
  if (!isValidMatch(body.match)) {
    return NextResponse.json({ error: "invalid-match" }, { status: 400 });
  }

  try {
    const stored = await saveMatch(body.match);
    return NextResponse.json({
      persisted: true,
      shareId: stored.slug,
      url: `/saved/${stored.slug}`,
    });
  } catch (error) {
    console.error("Failed to persist match", error);
    return NextResponse.json({ error: "save-failed" }, { status: 502 });
  }
}

import "server-only";

import type { Match } from "@/lib/types";

const TABLE = "chesssim_matches";

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = secretKey ?? legacyKey;
  return url && key ? { url, key, legacy: !secretKey && Boolean(legacyKey) } : null;
}

export function isMatchStoreConfigured(): boolean {
  return config() !== null;
}

function headers(key: string, legacy: boolean): HeadersInit {
  const result: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };
  // Opaque sb_secret_* keys are not JWTs. The platform gateway translates
  // them from `apikey`; only the legacy service_role JWT is a Bearer token.
  if (legacy) result.Authorization = `Bearer ${key}`;
  return result;
}

export async function saveMatch(match: Match): Promise<Match> {
  const database = config();
  if (!database) throw new Error("match-store-not-configured");

  const shareId = crypto.randomUUID();
  const stored: Match = { ...match, id: shareId, slug: shareId };
  const response = await fetch(`${database.url}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: {
      ...headers(database.key, database.legacy),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      share_id: shareId,
      variant: stored.variant ?? "standard",
      chess960_position: stored.chess960Position ?? null,
      white_agent_id: stored.whiteAgentId,
      black_agent_id: stored.blackAgentId,
      result: stored.result,
      move_count: stored.moveCount,
      match_data: stored,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`match-store-insert-failed:${response.status}:${detail.slice(0, 240)}`);
  }
  return stored;
}

export async function getSavedMatch(shareId: string): Promise<Match | null> {
  const database = config();
  if (!database) return null;

  const params = new URLSearchParams({
    share_id: `eq.${shareId}`,
    select: "match_data",
    limit: "1",
  });
  const response = await fetch(
    `${database.url}/rest/v1/${TABLE}?${params.toString()}`,
    {
      headers: headers(database.key, database.legacy),
      cache: "no-store",
    }
  );
  if (!response.ok) return null;

  const rows = (await response.json()) as Array<{ match_data?: Match }>;
  return rows[0]?.match_data ?? null;
}

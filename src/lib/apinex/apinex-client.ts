// ═══════════════════════════════════════════════════════════
// APInex — Client serveur (NE JAMAIS importer côté client)
// Base URL: https://api.apinex.bond — clé Bearer sk-apx…
// ═══════════════════════════════════════════════════════════

export const APINEX_BASE_URL =
  process.env.APINEX_BASE_URL?.replace(/\/+$/, "") || "https://api.apinex.bond";

export function getApinexApiKey(): string | null {
  const key = process.env.APINEX_API_KEY;
  return key && key.startsWith("sk-") ? key : null;
}

// ── Types catalogue public ─────────────────────────────────

export interface ApinexPublicModel {
  id: string;
  provider: string;
  name: string;
  contextWindow: string;
  weight: number;
  dollarsPer1M: number;
  tags: string[];
  health: string;
}

export interface ApinexBalance {
  object: string;
  balance_usd: number;
  reserved_usd: number;
  api_key: {
    id: string;
    spend_limit_usd: number | null;
    spent_usd: number;
    reserved_usd: number;
    remaining_usd: number | null;
    limit_reached: boolean;
  };
}

// ── Cache mémoire (catalogue public, 5 min) ────────────────

let modelsCache: { data: ApinexPublicModel[]; ts: number } | null = null;
const MODELS_TTL_MS = 5 * 60 * 1000;

export async function fetchApinexModels(): Promise<ApinexPublicModel[]> {
  if (modelsCache && Date.now() - modelsCache.ts < MODELS_TTL_MS) {
    return modelsCache.data;
  }
  const res = await fetch(`${APINEX_BASE_URL}/api/public/models`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`APInex models HTTP ${res.status}`);
  const json = (await res.json()) as { models: ApinexPublicModel[] };
  const models = Array.isArray(json.models) ? json.models : [];
  modelsCache = { data: models, ts: Date.now() };
  return models;
}

export async function fetchApinexBalance(
  apiKey: string
): Promise<ApinexBalance> {
  const res = await fetch(`${APINEX_BASE_URL}/v1/balance`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`APInex balance HTTP ${res.status}`);
  return (await res.json()) as ApinexBalance;
}

// ── Extraction d'erreur APInex (format OpenAI-compatible) ──

export function extractApinexError(payload: unknown): {
  message: string;
  type: string;
} {
  const err =
    typeof payload === "object" && payload !== null && "error" in payload
      ? (payload as { error?: { message?: string; type?: string } }).error
      : undefined;
  return {
    message: err?.message || "Erreur APInex inconnue",
    type: err?.type || "unknown_error",
  };
}

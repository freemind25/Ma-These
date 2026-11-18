// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Configuration Datalab (server-side only)
// Clé API du fournisseur documentaire datalab.to stockée dans un
// cookie httpOnly (jamais exposée au JS client) — même pattern que
// src/lib/ai/config-cookie.ts. Fallback : variable d'environnement
// DATALAB_API_KEY (machine utilisateur, cf. .env.example).
// ═══════════════════════════════════════════════════════════════

import { getCookieOptions } from "@/lib/ai/config-cookie";

export const DATALAB_CONFIG_COOKIE_NAME = "thesisframe-datalab-config";

/** Configuration Datalab stockée côté serveur uniquement. */
export interface DatalabConfig {
  apiKey: string;
}

/** Parse la config depuis la valeur du cookie (JSON base64). */
export function parseDatalabConfigCookie(cookieValue: string | undefined): DatalabConfig | null {
  if (!cookieValue) return null;
  try {
    const json = Buffer.from(cookieValue, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as { apiKey?: string };
    if (parsed.apiKey) return { apiKey: parsed.apiKey };
  } catch {
    // Cookie corrompu — ignoré
  }
  return null;
}

/** Sérialise la config en valeur de cookie base64. */
export function serializeDatalabConfigCookie(config: DatalabConfig): string {
  return Buffer.from(JSON.stringify(config), "utf-8").toString("base64");
}

/** Masque la clé pour l'affichage client (jamais de clé en clair). */
export function stripDatalabApiKey(config: DatalabConfig): { hasApiKey: boolean; maskedKey: string } {
  const key = config.apiKey;
  const maskedKey = key.length > 10 ? `${key.slice(0, 6)}…${key.slice(-4)}` : "••••••";
  return { hasApiKey: true, maskedKey };
}

/** Lit le cookie Datalab depuis un Request. */
export function getDatalabConfigFromRequest(request: Request): DatalabConfig | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${DATALAB_CONFIG_COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.substring(DATALAB_CONFIG_COOKIE_NAME.length + 1);
  return parseDatalabConfigCookie(decodeURIComponent(value));
}

/**
 * Résout la clé API Datalab pour une requête :
 * cookie httpOnly prioritaire → variable d'environnement DATALAB_API_KEY.
 */
export function resolveDatalabApiKey(request: Request): string | null {
  const cookieConfig = getDatalabConfigFromRequest(request);
  if (cookieConfig?.apiKey) return cookieConfig.apiKey;
  const envKey = process.env.DATALAB_API_KEY?.trim();
  if (envKey) return envKey;
  return null;
}

/** Options de cookie réexportées (sémantique Tauri http). */
export const datalabCookieOptions = getCookieOptions;

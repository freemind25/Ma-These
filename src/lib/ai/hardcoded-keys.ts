// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Hardcoded API Keys (SERVER-SIDE ONLY)
// ⚠️ Ce fichier est uniquement importé côté serveur.
// ⚠️ Les clés ne sont jamais exposées au client.
// ⚠️ App non destinée à la distribution.
// ═══════════════════════════════════════════════════════════════

import type { AiProviderId } from "./ai-types";

/**
 * Hardcoded API keys for testing.
 * Used as fallback when no env var or user-provided key is available.
 */
export const HARDCODED_KEYS: Partial<Record<AiProviderId, string>> = {
  // Google Gemini
  google: "REDACTED_GOOGLE_KEY",

  // GitHub Models (uses PAT token)
  github: "REDACTED_GITHUB_TOKEN",

  // OpenAI
  openai:
    "REDACTED_OPENAI_KEY",

  // OpenRouter (clé 1 — principale)
  openrouter: "REDACTED_OPENROUTER_KEY",

  // Groq
  groq: "REDACTED_GROQ_KEY",
};

/**
 * Backup OpenRouter key (failover if primary is rate-limited)
 */
export const OPENROUTER_BACKUP_KEY =
  "REDACTED_OPENROUTER_BACKUP_KEY";

/**
 * Get a hardcoded key for a provider (if available).
 * Returns undefined if no key is hardcoded for this provider.
 */
export function getHardcodedKey(provider: AiProviderId): string | undefined {
  return HARDCODED_KEYS[provider];
}

/**
 * Check if a provider has a hardcoded key available.
 * Used by the /api/ai-keys endpoint to show status in the UI.
 */
export function hasHardcodedKey(provider: AiProviderId): boolean {
  return !!HARDCODED_KEYS[provider];
}

/**
 * Get all providers that have hardcoded keys (for UI display).
 * Returns provider IDs only — never the actual keys.
 */
export function getHardcodedProviderIds(): AiProviderId[] {
  return Object.keys(HARDCODED_KEYS) as AiProviderId[];
}

/**
 * Mask an API key for safe display: show first 8 and last 4 chars.
 * e.g. "sk-XXXXX...XXXX"
 */
export function maskKey(key: string): string {
  if (key.length <= 14) return "••••••••";
  const start = key.slice(0, 8);
  const end = key.slice(-4);
  return `${start}...${end}`;
}

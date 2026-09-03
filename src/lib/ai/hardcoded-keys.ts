// ═══════════════════════════════════════════════════
// Ma Thèse — Hardcoded API Keys (SERVER-SIDE ONLY)
// ⚠️ Ce fichier est uniquement importé côté serveur.
// ⚠️ Les clés ne sont jamais exposées au client.
// ⚠️ Remplacez les placeholders par vos propres clés.
// ═══════════════════════════════════════════════════

import type { AiProviderId } from "./ai-types";

/**
 * Hardcoded API keys for testing.
 * Used as fallback when no env var or user-provided key is available.
 * ⚠️ Replace placeholders with your own keys before deploying.
 */
export const HARDCODED_KEYS: Partial<Record<AiProviderId, string>> = {
  // Google Gemini
  google: process.env.GOOGLE_API_KEY || undefined,

  // OpenAI
  openai: process.env.OPENAI_API_KEY || undefined,

  // Anthropic (Claude)
  anthropic: process.env.ANTHROPIC_API_KEY || undefined,

  // Groq (ultra-rapide, gratuit)
  groq: process.env.GROQ_API_KEY || undefined,

  // OpenRouter — clé principale
  openrouter: process.env.OPENROUTER_API_KEY || undefined,

  // RoutesMe (multi-modèles)
  routesme: process.env.ROUTESME_API_KEY || undefined,

  // KiraAI Vietnam (7 gratuits + 50 payants)
  kiraai: process.env.KIRA_API_KEY || undefined,
};

/**
 * Backup OpenRouter key (failover if primary is rate-limited)
 */
export const OPENROUTER_BACKUP_KEY =
  process.env.OPENROUTER_BACKUP_KEY || undefined;

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
  if (!key || key.length <= 14) return "••••••••";
  const start = key.slice(0, 8);
  const end = key.slice(-4);
  return `${start}...${end}`;
}

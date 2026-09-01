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
  // Google Gemini — replace with your GCP API key
  google: process.env.GOOGLE_API_KEY || undefined,

  // GitHub Models — replace with your GitHub PAT
  github: process.env.GITHUB_TOKEN || undefined,

  // OpenAI — replace with your OpenAI API key
  openai: process.env.OPENAI_API_KEY || undefined,

  // OpenRouter — replace with your OpenRouter key
  openrouter: process.env.OPENROUTER_API_KEY || undefined,

  // Groq — replace with your Groq API key
  groq: process.env.GROQ_API_KEY || undefined,

  // TokenRouter — replace with your TokenRouter API key (gratuit)
  tokenrouter: process.env.TOKENROUTER_API_KEY || undefined,
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

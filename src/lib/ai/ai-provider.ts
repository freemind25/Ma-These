// ═══════════════════════════════════════════════════════════════
// Ma Thèse — AI Provider (server-side only)
// Uses require("fs") / require("os") for sandbox detection
// Client components MUST import from ai-types.ts instead
// ═══════════════════════════════════════════════════════════════

// Re-export everything from client-safe types file
export {
  type AiProviderId,
  type AiProviderConfig,
  type AiFallbackConfig,
  PROVIDER_BASE_URLS,
  PROVIDER_MODELS,
  DYNAMIC_MODEL_PROVIDERS,
  KEYLESS_PROVIDERS,
  PROVIDER_CATEGORIES,
  ALL_PROVIDER_IDS,
  getProviderLabel,
  getProviderFields,
  providerNeedsKey,
} from "./ai-types";

import { type AiProviderId, PROVIDER_BASE_URLS, KEYLESS_PROVIDERS } from "./ai-types";

/**
 * Check if the current environment supports z.ai SDK (sandbox).
 * Detection: /etc/.z-ai-config exists (mounted by z.ai sandbox)
 * In production (Vercel), z.ai SDK won't work → fall back to OpenAI-compatible API.
 */
let _fsExistsSync: ((path: string) => boolean) | null = null;
let _homedir: (() => string) | null = null;
let _triedInit = false;

function initFs(): void {
  if (_triedInit || typeof window !== "undefined") return;
  _triedInit = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fsMod = require("fs");
    _fsExistsSync = fsMod.existsSync;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const osMod = require("os");
    _homedir = osMod.homedir;
  } catch {
    // not available
  }
}

export function detectBackend(provider: AiProviderId): "zai" | "api" {
  if (provider !== "zai") return "api";
  initFs();
  if (_fsExistsSync) {
    if (_fsExistsSync("/etc/.z-ai-config")) return "zai";
    if (_fsExistsSync(".z-ai-config")) return "zai";
    if (_homedir && _fsExistsSync(_homedir() + "/.z-ai-config")) return "zai";
  }
  return "api";
}

/**
 * Get the base URL for a given provider
 */
export function getBaseUrl(provider: AiProviderId, customBaseUrl?: string): string {
  if (provider === "zai") return "";
  return customBaseUrl || PROVIDER_BASE_URLS[provider] || "";
}

/**
 * Check if a provider is keyless (no API key needed)
 */
export function isKeylessProvider(provider: AiProviderId): boolean {
  return KEYLESS_PROVIDERS.includes(provider);
}

/**
 * Whether an HTTP error is retryable (rate limit, server error, timeout)
 * Inspired by freellmapi's failover logic
 */
export function isRetryableError(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/**
 * Whether an HTTP error suggests the key is invalid (not retryable with same key)
 */
export function isAuthError(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * Extra headers needed for specific providers
 * Inspired by freellmapi provider configs
 */
export function getProviderExtraHeaders(provider: AiProviderId): Record<string, string> {
  switch (provider) {
    case "openrouter":
      return {
        "HTTP-Referer": "https://mathese.app",
        "X-Title": "Ma Thèse",
      };
    case "routeway":
      return { "User-Agent": "Mozilla/5.0 MaThese/1.4" };
    case "kilo":
      // Kilo is keyless — no auth header
      return {};
    case "pollinations":
      // Pollinations is keyless
      return {};
    default:
      return {};
  }
}

/**
 * Whether a provider uses Anthropic wire format instead of OpenAI
 */
export function isAnthropicFormat(provider: AiProviderId): boolean {
  return provider === "anthropic";
}

/**
 * Whether a provider supports parallel tool calls (some don't)
 * From freellmapi: NVIDIA NIM rejects parallel tool calls
 */
export function supportsParallelToolCalls(provider: AiProviderId): boolean {
  return provider !== "nvidia";
}

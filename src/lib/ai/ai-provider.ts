// ═══════════════════════════════════════
// ThesisFrame — AI Provider (server-side only)
// Uses require("fs") / require("os") for sandbox detection
// Client components MUST import from ai-types.ts instead
// ═══════════════════════════════════════

// Re-export everything from client-safe types file
export {
  type AiProviderId,
  type AiProviderConfig,
  PROVIDER_BASE_URLS,
  PROVIDER_MODELS,
  getProviderLabel,
  getProviderFields,
} from "./ai-types";

import { type AiProviderId, PROVIDER_BASE_URLS } from "./ai-types";

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
  // If provider is explicitly NOT zai, always use API
  if (provider !== "zai") return "api";

  // Check if z.ai config file exists (sandbox detection)
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

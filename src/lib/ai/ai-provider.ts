// ═══════════════════════════════════════
// ThesisFrame — AI Provider Configuration
// Centralized provider detection & config
// ═══════════════════════════════════════

export type AiProviderId = "zai" | "openai" | "anthropic" | "mistral" | "custom";

export interface AiProviderConfig {
  provider: AiProviderId;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

// Default base URLs for known providers
const PROVIDER_BASE_URLS: Record<AiProviderId, string> = {
  zai: "",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  mistral: "https://api.mistral.ai/v1",
  custom: "",
};

/**
 * Check if the current environment supports z.ai SDK (sandbox).
 * Detection: /etc/.z-ai-config exists (mounted by z.ai sandbox)
 * In production (Vercel), z.ai SDK won't work → fall back to OpenAI-compatible API.
 */
// Server-side detection helpers (lazy dynamic import to avoid browser issues)
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

/**
 * Get a human-readable label for a provider
 */
export function getProviderLabel(provider: AiProviderId): string {
  const labels: Record<AiProviderId, string> = {
    zai: "Z.ai (SDK natif)",
    openai: "OpenAI",
    anthropic: "Anthropic (Claude)",
    mistral: "Mistral AI",
    custom: "Personnalisé (API compatible)",
  };
  return labels[provider] || provider;
}

/**
 * Default models for each provider
 */
export const PROVIDER_MODELS: Record<AiProviderId, string[]> = {
  zai: ["default"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini", "o3-mini"],
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
  mistral: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest"],
  custom: [],
};

/**
 * Which fields to show in the config form for each provider
 */
export function getProviderFields(provider: AiProviderId): {
  showApiKey: boolean;
  showModel: boolean;
  showBaseUrl: boolean;
} {
  if (provider === "zai") {
    return { showApiKey: false, showModel: false, showBaseUrl: false };
  }
  return { showApiKey: true, showModel: true, showBaseUrl: provider === "custom" };
}

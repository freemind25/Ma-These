// ═══════════════════════════════════════
// ThesisFrame — AI Types & Constants (client-safe)
// Pure types and constants — NO server-side imports (fs, os, z-ai-web-dev-sdk)
// This file is safe to import from "use client" components
// ═══════════════════════════════════════

export type AiProviderId = "zai" | "openai" | "anthropic" | "mistral" | "routesme" | "custom";

export interface AiProviderConfig {
  provider: AiProviderId;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

// ═══════════════════════════════════════
// Client-safe constants and helpers
// ═══════════════════════════════════════

/**
 * Default base URLs for known providers
 */
export const PROVIDER_BASE_URLS: Record<AiProviderId, string> = {
  zai: "",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  mistral: "https://api.mistral.ai/v1",
  routesme: "https://routesme.online/v1",
  custom: "",
};

/**
 * Default models for each provider
 */
export const PROVIDER_MODELS: Record<AiProviderId, string[]> = {
  zai: ["default"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini", "o3-mini"],
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
  mistral: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest"],
  routesme: [],
  custom: [],
};

/**
 * Providers whose model list should be fetched dynamically from their /models endpoint.
 */
export const DYNAMIC_MODEL_PROVIDERS: AiProviderId[] = ["mistral", "routesme", "custom"];

/**
 * Get a human-readable label for a provider
 */
export function getProviderLabel(provider: AiProviderId): string {
  const labels: Record<AiProviderId, string> = {
    zai: "Z.ai (SDK natif)",
    openai: "OpenAI",
    anthropic: "Anthropic (Claude)",
    mistral: "Mistral AI",
    routesme: "RoutesMe (multi-modèles)",
    custom: "Personnalisé (API compatible)",
  };
  return labels[provider] || provider;
}

/**
 * Which fields to show in the config form for each provider
 */
export function getProviderFields(provider: AiProviderId): {
  showApiKey: boolean;
  showModel: boolean;
  showBaseUrl: boolean;
  dynamicModels: boolean;
} {
  if (provider === "zai") {
    return {
      showApiKey: false,
      showModel: false,
      showBaseUrl: false,
      dynamicModels: false,
    };
  }
  return {
    showApiKey: true,
    showModel: true,
    showBaseUrl: provider === "custom",
    dynamicModels: provider === "mistral" || provider === "routesme" || provider === "custom",
  };
}

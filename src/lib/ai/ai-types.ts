// ═══════════════════════════════════════════════════════════════
// Ma Thèse — AI Types & Constants (client-safe)
// Pure types and constants — NO server-side imports (fs, os, z-ai-web-dev-sdk)
// This file is safe to import from "use client" components
// Fournisseurs gratuits inspirés de freellmapi (34 providers, ~7.4B tokens/mois)
// ═══════════════════════════════════════════════════════════════

export type AiProviderId =
  // --- Natif / premium ---
  | "zai"
  | "openai"
  | "anthropic"
  | "mistral"
  | "routesme"
  // --- Fournisseurs gratuits majeurs ---
  | "google"       // Google Gemini (gratuit, excellent)
  | "groq"         // Groq (ultra-rapide, Llama/Mixtral/Gemma)
  | "cerebras"     // Cerebras (ultra-rapide, Llama)
  | "openrouter"   // OpenRouter (agrégateur, modèles :free)
  | "github"       // GitHub Models (GPT-4.1-mini gratuit)
  | "cloudflare"   // Cloudflare Workers AI
  | "huggingface"  // HuggingFace Router
  | "nvidia"       // NVIDIA NIM (modèles gratuits)
  | "cohere"       // Cohere (Command R gratuit)
  | "siliconflow"  // SiliconFlow (FLUX image, CosyVoice TTS, chat)
  // --- Agrégateurs gratuits ---
  | "pollinations" // Pollinations (sans clé)
  | "kilo"         // Kilo Gateway (sans clé)
  | "routeway"     // Routeway (modèles :free)
  | "ainative"     // AINative Studio (~10M tokens/mois gratuit)
  | "aion"         // Aion Labs (gratuit)
  | "requesty"     // Requesty (router gratuit)
  | "sealion"      // SEA-LION (AI Singapore, 10 RPM)
  // --- Vietnam ---
  | "kiraai"      // KiraAI Vietnam (GLM-5.3, OpenAI-compatible)
  // --- Personnalisé ---
  | "custom";

export interface AiProviderConfig {
  provider: AiProviderId;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Fallback chain: if primary provider fails, try these in order.
 * Stored separately so the primary config stays clean.
 */
export interface AiFallbackConfig {
  enabled: boolean;
  providers: Array<{
    provider: AiProviderId;
    model?: string;
    baseUrl?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// Client-safe constants and helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Default base URLs for known providers
 * Sources: freellmapi (tashfeenahmed/freellmapi), provider docs
 */
export const PROVIDER_BASE_URLS: Record<AiProviderId, string> = {
  // Natif / premium
  zai: "",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  mistral: "https://api.mistral.ai/v1",
  routesme: "https://routesme.online/v1",
  // Fournisseurs gratuits majeurs
  google: "https://generativelanguage.googleapis.com/v1beta/openai",
  groq: "https://api.groq.com/openai/v1",
  cerebras: "https://api.cerebras.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  github: "https://models.github.ai/inference",
  cloudflare: "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/v1",
  huggingface: "https://router.huggingface.co/v1",
  nvidia: "https://integrate.api.nvidia.com/v1",
  cohere: "https://api.cohere.com/v2",
  siliconflow: "https://api.siliconflow.com/v1",
  // Agrégateurs gratuits
  pollinations: "https://text.pollinations.ai/openai",  // Nouveau: enter.pollinations.ai
  kilo: "https://api.kilo.ai/api/gateway/v1",
  routeway: "https://api.routeway.ai/v1",
  ainative: "https://api.ainative.studio/api/v1",
  aion: "https://api.aionlabs.ai/v1",
  requesty: "https://router.requesty.ai/v1",
  sealion: "https://api.sea-lion.ai/v1",
  // Vietnam
  kiraai: "https://kiraai.vn/v1",
  // Personnalisé
  custom: "",
};

/**
 * Known free models per provider
 */
export const PROVIDER_MODELS: Record<AiProviderId, string[]> = {
  zai: ["default"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini", "o3-mini"],
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
  mistral: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest", "mistral-tiny"],
  routesme: [],
  // Fournisseurs gratuits majeurs
  google: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemma-3-27b-it"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
  cerebras: ["llama-3.3-70b", "llama-3.1-8b"],
  openrouter: ["meta-llama/llama-4-maverick:free", "google/gemma-3-27b-it:free", "deepseek/deepseek-chat-v3-0324:free", "qwen/qwen3-235b-a22b:free"],
  github: ["openai/gpt-4.1-mini", "openai/gpt-4.1-nano", "meta-llama/llama-3.3-70b-instruct"],
  cloudflare: [],
  huggingface: [],
  nvidia: ["meta/llama-3.3-70b-instruct", "nvidia/llama-3.1-nemotron-70b-instruct", "deepseek-ai/deepseek-r1"],
  cohere: ["command-r-plus", "command-r", "command-light"],
  siliconflow: ["Qwen/Qwen3-8B", "deepseek-ai/DeepSeek-V3"],
  // Agrégateurs gratuits
  pollinations: ["openai-large", "openai", "mistral-large-latest"],
  kilo: [],
  routeway: ["auto:free"],
  ainative: [],
  aion: [],
  requesty: [],
  sealion: [],
  // Vietnam
  kiraai: [
    // ══ GRATUITS (tokens gratuits KiraAI) ══
    "kira-3.5-flash",
    "kira-3.5-pro",
    "kira-2.5-pro",
    "kira-2.5-flash",
    "kira-2.0-image",
    "kira-3.0-image",
    "hy3",
    // ══ PAYANTS (nécessitent solde VND) ══
    // Claude
    "claude-sonnet-5",
    // DeepSeek
    "deepseek-v4-flash", "deepseek-v4-flash-0731", "deepseek-v4-flash-free",
    "deepseek-v4-flash-vision-exp", "deepseek-v4-pro",
    // Dots
    "dots-3-note-preview",
    // Gemini
    "gemini-2.5-flash-image", "gemini-2.5-flash-lite", "gemini-2.5-flash-tts",
    "gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview",
    "gemini-3.1-flash-tts-preview", "gemini-3.5-flash", "gemini-3.5-flash-lite",
    "gemini-3.6-flash", "gemini-3.7-flash",
    // GLM
    "glm-5.2", "glm-5.3", "glm-5.3-flash",
    // GPT
    "gpt-4o-mini", "gpt-5-nano", "gpt-5.4", "gpt-5.4-mini",
    "gpt-5.6-luna", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-oss-120b",
    // Grok
    "grok-4.5", "grok-4.6",
    // HY
    "hy4",
    // Kimi
    "kimi-k3",
    // Kira (TTS / vidéo / hors service)
    "kira-2.0", "kira-2.0-flash-tts",
    "kira-3.0-flash-tts", "kira-3.0-video", "kira-3.0-video-flash",
    "kira-mini-1.0",
    // Mimo / MiniMax
    "mimo-v2.5", "mimo-v2.5-pro", "minimax-m2.7", "minimax-m3",
    // OX
    "ox-alpha",
    // Qwen
    "qwen3.5-flash", "qwen3.5-omni-plus", "qwen3.6-flash",
    "qwen3.7-max", "qwen3.7-plus", "qwen3.8-flash", "qwen3.8-max",
  ],
  // Personnalisé
  custom: [],
};

/**
 * Providers whose model list should be fetched dynamically from their /models endpoint.
 */
export const DYNAMIC_MODEL_PROVIDERS: AiProviderId[] = [
  "mistral", "routesme", "custom", "openrouter", "groq", "cerebras",
  "huggingface", "nvidia", "cloudflare", "github", "siliconflow",
  "routeway", "ainative", "aion", "requesty", "sealion", "google", "cohere",
];

/**
 * Providers that don't require an API key (keyless / anonymous access)
 */
// NOTE: Plus aucun fournisseur n'est véritablement keyless en 2025.
// Pollinations et Kilo nécessitent maintenant un compte gratuit.
// Mais leur clé s'obtient gratuitement sans carte bancaire.
export const KEYLESS_PROVIDERS: AiProviderId[] = [];

/**
 * Provider categories for the UI
 */
export type ProviderCategory = "natif" | "premium" | "gratuit" | "agregateur" | "custom";

export const PROVIDER_CATEGORIES: Record<ProviderCategory, { label: string; description: string; providers: AiProviderId[] }> = {
  natif: {
    label: "SDK Natif",
    description: "Intégré directement, aucune clé requise",
    providers: ["zai"],
  },
  premium: {
    label: "Premium",
    description: "Fournisseurs payants (clé API requise)",
    providers: ["openai", "anthropic", "mistral", "routesme", "kiraai"],
  },
  gratuit: {
    label: "Gratuit",
    description: "Fournisseurs avec tier gratuit généreux",
    providers: ["google", "groq", "cerebras", "github", "huggingface", "nvidia", "cohere", "siliconflow", "cloudflare"],
  },
  agregateur: {
    label: "Agrégateurs gratuits",
    description: "Proxies multi-fournisseurs avec modèles gratuits",
    providers: ["openrouter", "pollinations", "kilo", "routeway", "ainative", "aion", "requesty", "sealion"],
  },
  custom: {
    label: "Personnalisé",
    description: "Pointez vers n'importe quel endpoint OpenAI-compatible",
    providers: ["custom"],
  },
};

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
    google: "Google Gemini (gratuit)",
    groq: "Groq (ultra-rapide, gratuit)",
    cerebras: "Cerebras (gratuit)",
    openrouter: "OpenRouter (agrégateur gratuit)",
    github: "GitHub Models (gratuit)",
    cloudflare: "Cloudflare Workers AI",
    huggingface: "HuggingFace Router (gratuit)",
    nvidia: "NVIDIA NIM (gratuit)",
    cohere: "Cohere (Command R)",
    siliconflow: "SiliconFlow (gratuit)",
    pollinations: "Pollinations (sans clé)",
    kilo: "Kilo Gateway (sans clé)",
    routeway: "Routeway (gratuit)",
    ainative: "AINative Studio (gratuit)",
    aion: "Aion Labs (gratuit)",
    requesty: "Requesty (gratuit)",
    sealion: "SEA-LION (gratuit)",
    kiraai: "KiraAI Vietnam (7 gratuits + 50 payants)",
    custom: "Personnalisé (API compatible)",
  };
  return labels[provider] || provider;
}

/**
 * Whether a provider needs an API key
 */
export function providerNeedsKey(provider: AiProviderId): boolean {
  if (provider === "zai") return false;
  if (KEYLESS_PROVIDERS.includes(provider)) return false;
  return true;
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
    return { showApiKey: false, showModel: false, showBaseUrl: false, dynamicModels: false };
  }
  if (KEYLESS_PROVIDERS.includes(provider)) {
    return { showApiKey: false, showModel: true, showBaseUrl: false, dynamicModels: false };
  }
  return {
    showApiKey: true,
    showModel: true,
    showBaseUrl: provider === "custom",
    dynamicModels: DYNAMIC_MODEL_PROVIDERS.includes(provider),
  };
}

/**
 * All provider IDs (useful for iterating)
 */
export const ALL_PROVIDER_IDS: AiProviderId[] = [
  "zai", "openai", "anthropic", "mistral", "routesme",
  "google", "groq", "cerebras", "openrouter", "github",
  "cloudflare", "huggingface", "nvidia", "cohere", "siliconflow",
  "pollinations", "kilo", "routeway", "ainative", "aion", "requesty", "sealion",
  "kiraai",
  "custom",
];

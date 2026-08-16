// ═══════════════════════════════════════
// ThesisFrame — AI Client (dual-backend)
// z.ai SDK (sandbox) OR OpenAI-compatible API
// ═══════════════════════════════════════

import AiSDK from "z-ai-web-dev-sdk";
import {
  type AiProviderId,
  type AiProviderConfig,
  detectBackend,
  getBaseUrl,
} from "@/lib/ai/ai-provider";

let aiClientPromise: Promise<AiSDK> | null = null;

function getClient(): Promise<AiSDK> {
  if (!aiClientPromise) {
    aiClientPromise = AiSDK.create();
  }
  return aiClientPromise;
}

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionOptions {
  messages: AiMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Override provider config (passed from client via request body _aiConfig) */
  providerConfig?: AiProviderConfig;
}

export interface AiCompletionResult {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ═══════════════════════════════════════
// z.ai SDK path (sandbox private IP)
// ═══════════════════════════════════════

async function generateWithSDK(
  options: AiCompletionOptions
): Promise<AiCompletionResult> {
  const client = await getClient();
  const formattedMessages = options.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await client.chat.completions.create({
    messages: formattedMessages,
    model: options.model || "default",
    temperature: options.temperature ?? 0.7,
  });

  const content =
    typeof response === "string"
      ? response
      : (response as Record<string, unknown>).content
        ? String((response as Record<string, unknown>).content)
        : String(response);

  return {
    content: content.trim(),
    model: options.model || "default",
    provider: "zai",
  };
}

// ═══════════════════════════════════════
// OpenAI-compatible API path
// ═══════════════════════════════════════

async function generateWithAPI(
  options: AiCompletionOptions,
  config: AiProviderConfig
): Promise<AiCompletionResult> {
  const baseUrl = getBaseUrl(config.provider, config.baseUrl);

  if (!baseUrl) {
    throw new Error(
      `Aucune URL de base configurée pour le fournisseur "${config.provider}". ` +
      `Veuillez configurer le fournisseur IA dans Paramètres → Fournisseur IA.`
    );
  }

  const model = options.model || config.model || "gpt-4o-mini";

  const url = `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.apiKey) {
    if (config.provider === "anthropic") {
      headers["x-api-key"] = config.apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    } else {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
  }

  const systemMessage = options.messages.find((m) => m.role === "system");
  const nonSystemMessages = options.messages.filter((m) => m.role !== "system");

  let body: Record<string, unknown>;
  if (config.provider === "anthropic" && systemMessage) {
    body = {
      model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      system: systemMessage.content,
      messages: nonSystemMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };
  } else {
    body = {
      model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as Record<string, unknown>;
  const choices = data.choices as Array<Record<string, unknown>> | undefined;
  const firstChoice = choices?.[0];
  const message = firstChoice?.message as Record<string, unknown> | undefined;
  const content = String(message?.content || "");

  const usage = data.usage as Record<string, number> | undefined;

  return {
    content: content.trim(),
    model,
    provider: config.provider,
    usage: usage
      ? {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        }
      : undefined,
  };
}

// ═══════════════════════════════════════
// Main entry point — auto-detects backend
// ═══════════════════════════════════════

/**
 * Generate a completion using the appropriate backend.
 * Priority:
 *  1. If providerConfig is passed (from client), use it
 *  2. If env vars define a provider, use them
 *  3. Default: try z.ai SDK
 */
export async function generateCompletion(
  options: AiCompletionOptions
): Promise<AiCompletionResult> {
  const config = options.providerConfig || getDefaultConfig();
  const backend = detectBackend(config.provider);

  // If backend is "api" but no URL available → error with clear message
  if (backend === "api") {
    const url = getBaseUrl(config.provider, config.baseUrl);
    if (!url) {
      throw new Error(
        `Aucun fournisseur IA configuré. Veuillez aller dans ⚙ Paramètres → Fournisseur IA ` +
        `pour configurer OpenAI, Anthropic, ou Mistral avec votre clé API.`
      );
    }
    // API backend with valid URL — proceed with fetch
    const maxRetries = 2;
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await generateWithAPI(options, config);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[AI] API attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error(`AI API failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
  }

  // z.ai SDK backend (sandbox with /etc/.z-ai-config)
  const maxRetries = 2;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateWithSDK(options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[AI] SDK attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error(`AI SDK failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

/**
 * Simple streaming-friendly generation (returns full text)
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: AiMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const result = await generateCompletion({ messages });
  return result.content;
}

/**
 * Read provider config from environment / defaults.
 */
function getDefaultConfig(): AiProviderConfig {
  const provider = (process.env.AI_PROVIDER || "zai") as AiProviderId;

  // Base URL: prefer AI_BASE_URL, fallback to OPENAI_BASE_URL (Vercel convention)
  const baseUrl = process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL || "";

  // Select API key based on provider
  let apiKey = "";
  let model = process.env.AI_MODEL || "gpt-4o-mini";

  switch (provider) {
    case "openai":
      apiKey = process.env.OPENAI_API_KEY || "";
      model = process.env.AI_MODEL || "gpt-4o-mini";
      break;
    case "anthropic":
      apiKey = process.env.ANTHROPIC_API_KEY || "";
      model = process.env.AI_MODEL || "claude-3-haiku-20240307";
      break;
    case "mistral":
      apiKey = process.env.MISTRAL_API_KEY || "";
      model = process.env.AI_MODEL || "mistral-small-latest";
      break;
    case "routesme":
      apiKey = process.env.ROUTESME_API_KEY || process.env.OPENAI_API_KEY || "";
      model = process.env.AI_MODEL || "GLM5.2-free";
      break;
    case "custom":
      apiKey = process.env.OPENAI_API_KEY || "";
      model = process.env.AI_MODEL || "gpt-4o-mini";
      break;
    default: // zai
      apiKey = "";
      model = "default";
  }

  return {
    provider,
    apiKey: apiKey || undefined,
    model,
    baseUrl: baseUrl || undefined,
  };
}

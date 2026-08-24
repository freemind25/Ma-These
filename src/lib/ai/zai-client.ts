// ═══════════════════════════════════════════════════════════════
// Ma Thèse — AI Client (dual-backend + failover)
// z.ai SDK (sandbox) OR OpenAI-compatible API
// Failover automatique inspiré de freellmapi
// ═══════════════════════════════════════════════════════════════

import AiSDK from "z-ai-web-dev-sdk";
import {
  type AiProviderId,
  type AiProviderConfig,
  type AiFallbackConfig,
  detectBackend,
  getBaseUrl,
  isKeylessProvider,
  isRetryableError,
  isAuthError,
  getProviderExtraHeaders,
  isAnthropicFormat,
} from "./ai-provider";

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
  /** Fallback chain configuration */
  fallbackConfig?: AiFallbackConfig;
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
  /** Which provider actually served the request */
  routedVia?: string;
}

// ═══════════════════════════════════════════════════════════════
// z.ai SDK path (sandbox private IP)
// ═══════════════════════════════════════════════════════════════

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

  let content = "";
  if (typeof response === "string") {
    content = response;
  } else if (response && typeof response === "object") {
    const resp = response as Record<string, unknown>;
    if (typeof resp.content === "string") {
      content = resp.content;
    } else if (resp.content != null && typeof resp.content === "object") {
      content = JSON.stringify(resp.content);
    }
    if (!content && Array.isArray(resp.choices)) {
      const firstChoice = resp.choices[0] as Record<string, unknown> | undefined;
      const message = firstChoice?.message as Record<string, unknown> | undefined;
      if (typeof message?.content === "string") {
        content = message.content;
      }
    }
    if (!content) {
      console.warn("[zai-client] Unexpected SDK response format:", typeof response);
      content = "";
    }
  }

  return {
    content: content.trim(),
    model: options.model || "default",
    provider: "zai",
  };
}

// ═══════════════════════════════════════════════════════════════
// OpenAI-compatible API path
// ═══════════════════════════════════════════════════════════════

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

  // Auth: keyless providers skip Authorization header
  if (isKeylessProvider(config.provider)) {
    // No auth needed
  } else if (config.apiKey) {
    if (isAnthropicFormat(config.provider)) {
      headers["x-api-key"] = config.apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    } else {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
  }

  // Provider-specific extra headers (from freellmapi pattern)
  const extraHeaders = getProviderExtraHeaders(config.provider);
  Object.assign(headers, extraHeaders);

  const systemMessage = options.messages.find((m) => m.role === "system");
  const nonSystemMessages = options.messages.filter((m) => m.role !== "system");

  let body: Record<string, unknown>;
  if (isAnthropicFormat(config.provider) && systemMessage) {
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
    const err = await buildApiError(response, model);
    throw err;
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
    routedVia: `${config.provider}/${model}`,
    usage: usage
      ? {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        }
      : undefined,
  };
}

/**
 * Build a structured error from an API response.
 * Returns an error with a `status` property for failover logic.
 */
async function buildApiError(response: Response, model: string): Promise<Error & { status: number; retryable: boolean; authError: boolean }> {
  let errorText = await response.text();

  try {
    const errJson = JSON.parse(errorText) as {
      error?: { type?: string; message?: string };
      message?: string;
      code?: string;
      detail?: string;
      type?: string;
      model?: string;
    };
    const errType = errJson.error?.type || errJson.type || errJson.code || "";
    const errMsg = errJson.error?.message || errJson.message || errJson.detail || "";

    if (errType === "all_keys_failed" || response.status === 503) {
      errorText = `Service temporairement indisponible. Modèle "${errJson.model || model}" surchargé. Réessayez dans quelques instants ou changez de modèle.`;
    } else if (errType === "rate_limit_exceeded" || response.status === 429) {
      errorText = `Limite de requêtes atteinte. ${errMsg || "Attendez quelques secondes."}`;
    } else if (
      errType === "invalid_api_key" ||
      errType === "invalid_request_error" ||
      errJson.code === "invalid_api_key" ||
      response.status === 401
    ) {
      errorText = `Clé API invalide. ${errMsg || "Vérifiez votre configuration."}`;
    } else if (response.status === 404) {
      errorText = `Modèle "${model}" introuvable. Vérifiez le nom du modèle.`;
    } else if (errMsg) {
      errorText = errMsg;
    }
  } catch {
    // keep raw errorText
  }

  const error = new Error(`Erreur IA (${response.status}): ${errorText.slice(0, 300)}`) as Error & {
    status: number;
    retryable: boolean;
    authError: boolean;
  };
  error.status = response.status;
  error.retryable = isRetryableError(response.status);
  error.authError = isAuthError(response.status);
  return error;
}

// ═══════════════════════════════════════════════════════════════
// Failover logic (inspired by freellmapi)
// ═══════════════════════════════════════════════════════════════

/**
 * Try a single provider config, returns result or throws.
 */
async function tryProvider(
  options: AiCompletionOptions,
  config: AiProviderConfig
): Promise<AiCompletionResult> {
  const backend = detectBackend(config.provider);
  if (backend === "zai") {
    return generateWithSDK(options);
  }
  return generateWithAPI(options, config);
}

/**
 * Attempt generation with a single provider, with retries.
 * Returns the result or throws the last error.
 */
async function attemptWithRetries(
  options: AiCompletionOptions,
  config: AiProviderConfig,
  maxRetries: number = 2
): Promise<AiCompletionResult> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await tryProvider(options, config);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const status = (lastError as Error & { status?: number }).status;

      // Don't retry auth errors (invalid key)
      if (status && isAuthError(status)) throw lastError;

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `[AI] ${config.provider} attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
          lastError.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ═══════════════════════════════════════════════════════════════
// Main entry point — auto-detects backend + failover
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a completion using the appropriate backend with failover.
 *
 * Priority:
 *  1. If providerConfig is passed (from client), use it
 *  2. If env vars define a provider, use them
 *  3. Default: try z.ai SDK
 *
 * Failover (inspired by freellmapi):
 *  - On retryable errors (429, 5xx), tries fallback providers in order
 *  - On auth errors (401, 403), immediately fails (no fallback)
 */
export async function generateCompletion(
  options: AiCompletionOptions
): Promise<AiCompletionResult> {
  const config = options.providerConfig || getDefaultConfig();
  const fallbackConfig = options.fallbackConfig;

  // Build the chain: primary + fallbacks
  const chain: AiProviderConfig[] = [config];
  if (fallbackConfig?.enabled && fallbackConfig.providers.length > 0) {
    for (const fb of fallbackConfig.providers) {
      chain.push({
        provider: fb.provider,
        model: fb.model || config.model,
        baseUrl: fb.baseUrl,
      });
    }
  }

  let lastError: Error | null = null;

  for (let i = 0; i < chain.length; i++) {
    const providerConfig = chain[i];
    try {
      const result = await attemptWithRetries(options, providerConfig, 2);
      if (i > 0) {
        console.log(`[AI] Failover: primary failed, served by ${providerConfig.provider}`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const status = (lastError as Error & { status?: number }).status;

      // Auth errors are terminal — don't try fallbacks
      if (status && isAuthError(status)) throw lastError;

      // Retryable or unknown error → try next in chain
      if (i < chain.length - 1) {
        console.warn(
          `[AI] Provider ${providerConfig.provider} failed (status=${status ?? "unknown"}), trying fallback ${i + 2}/${chain.length}...`
        );
      }
    }
  }

  // All providers exhausted
  throw new Error(
    `Tous les fournisseurs IA ont échoué (chaîne de ${chain.length} fournisseurs). ` +
    `Dernière erreur: ${lastError?.message}`
  );
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

  const baseUrl = process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL || "";

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
    case "google":
      apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
      model = process.env.AI_MODEL || "gemini-2.5-flash";
      break;
    case "groq":
      apiKey = process.env.GROQ_API_KEY || "";
      model = process.env.AI_MODEL || "llama-3.3-70b-versatile";
      break;
    case "cerebras":
      apiKey = process.env.CEREBRAS_API_KEY || "";
      model = process.env.AI_MODEL || "llama-3.3-70b";
      break;
    case "openrouter":
      apiKey = process.env.OPENROUTER_API_KEY || "";
      model = process.env.AI_MODEL || "meta-llama/llama-4-maverick:free";
      break;
    case "github":
      apiKey = process.env.GITHUB_TOKEN || process.env.GITHUB_MODELS_TOKEN || "";
      model = process.env.AI_MODEL || "openai/gpt-4.1-mini";
      break;
    case "nvidia":
      apiKey = process.env.NVIDIA_API_KEY || "";
      model = process.env.AI_MODEL || "meta/llama-3.3-70b-instruct";
      break;
    case "cohere":
      apiKey = process.env.COHERE_API_KEY || "";
      model = process.env.AI_MODEL || "command-r";
      break;
    case "huggingface":
      apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";
      break;
    case "siliconflow":
      apiKey = process.env.SILICONFLOW_API_KEY || "";
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

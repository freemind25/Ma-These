// ═══════════════════════════════════════════════════════════════
// Ma Thèse — AI Client (dual-backend + failover + circuit breaker)
// z.ai SDK (sandbox) OR OpenAI-compatible API
// Failover automatique inspiré de freellmapi
// Circuit breaker: évite de répéter les appels vers un provider en panne
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
import { getHardcodedKey } from "./hardcoded-keys";

// ═══════════════════════════════════════════════════════════════
// Circuit Breaker — per-provider state
// ═══════════════════════════════════════════════════════════════

type CircuitState = "closed" | "open" | "half-open";

interface ProviderCircuit {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number; // epoch ms
  successCount: number;  // in half-open, successes needed to close
}

const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_TIMEOUT_MS = 30_000; // 30s cooldown before half-open
const CIRCUIT_HALF_OPEN_SUCCESS_NEEDED = 1;
const REQUEST_TIMEOUT_MS = 60_000; // 60s global timeout

// In-memory circuit state (persists for the lifetime of the server process)
const circuitBreaker = new Map<string, ProviderCircuit>();

function getCircuit(provider: string): ProviderCircuit {
  let c = circuitBreaker.get(provider);
  if (!c) {
    c = { state: "closed", failureCount: 0, lastFailureTime: 0, successCount: 0 };
    circuitBreaker.set(provider, c);
  }
  return c;
}

/**
 * Check if a provider's circuit allows requests.
 * If open, check if cooldown has elapsed → transition to half-open.
 */
function canRequest(provider: string): boolean {
  const c = getCircuit(provider);
  if (c.state === "closed") return true;
  if (c.state === "half-open") return true;
  // Open — check cooldown
  if (Date.now() - c.lastFailureTime >= CIRCUIT_RESET_TIMEOUT_MS) {
    c.state = "half-open";
    c.successCount = 0;
    return true;
  }
  return false;
}

/** Record a successful request */
function recordSuccess(provider: string) {
  const c = getCircuit(provider);
  if (c.state === "half-open") {
    c.successCount++;
    if (c.successCount >= CIRCUIT_HALF_OPEN_SUCCESS_NEEDED) {
      c.state = "closed";
      c.failureCount = 0;
      console.log(`[Circuit] ${provider}: closed (recovered)`);
    }
  } else {
    c.failureCount = 0;
  }
}

/** Record a failed request */
function recordFailure(provider: string) {
  const c = getCircuit(provider);
  c.failureCount++;
  c.lastFailureTime = Date.now();
  if (c.state === "half-open") {
    // Failed test → back to open
    c.state = "open";
    console.warn(`[Circuit] ${provider}: half-open test failed → open`);
  } else if (c.failureCount >= CIRCUIT_FAILURE_THRESHOLD) {
    c.state = "open";
    console.warn(
      `[Circuit] ${provider}: opened after ${c.failureCount} consecutive failures (cooldown ${CIRCUIT_RESET_TIMEOUT_MS / 1000}s)`
    );
  }
}

/**
 * Get circuit breaker status for UI display
 */
export function getCircuitBreakerStatus(): Record<string, { state: CircuitState; failureCount: number; lastFailureTime: number }> {
 const result: Record<string, { state: CircuitState; failureCount: number; lastFailureTime: number }> = {};
  for (const [provider, c] of circuitBreaker) {
 result[provider] = { state: c.state, failureCount: c.failureCount, lastFailureTime: c.lastFailureTime };
  }
  return result;
}

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
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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

  // Inject hardcoded key if config has no apiKey
  function enrichWithHardcodedKey(c: AiProviderConfig): AiProviderConfig {
    if (!c.apiKey && c.provider !== "zai") {
      const hardcoded = getHardcodedKey(c.provider);
      if (hardcoded) {
        return { ...c, apiKey: hardcoded };
      }
    }
    return c;
  }

  // Build the chain: primary + fallbacks
  const chain: AiProviderConfig[] = [enrichWithHardcodedKey(config)];
  if (fallbackConfig?.enabled && fallbackConfig.providers.length > 0) {
    for (const fb of fallbackConfig.providers) {
      chain.push(enrichWithHardcodedKey({
        provider: fb.provider,
        model: fb.model || config.model,
        baseUrl: fb.baseUrl,
      }));
    }
  }

  let lastError: Error | null = null;

  for (let i = 0; i < chain.length; i++) {
    const providerConfig = chain[i];
    const pid = providerConfig.provider;

    // Circuit breaker check
    if (!canRequest(pid)) {
      console.warn(`[Circuit] Skipping ${pid} — circuit open (cooldown ${CIRCUIT_RESET_TIMEOUT_MS / 1000}s)`);
      if (i === chain.length - 1) {
        lastError = new Error(
          `Fournisseur IA "${pid}" temporairement indisponible (trop d'échecs consécutifs). ` +
          `Réessayez dans ${Math.ceil((CIRCUIT_RESET_TIMEOUT_MS - (Date.now() - getCircuit(pid).lastFailureTime)) / 1000)}s ou changez de fournisseur.`
        );
      }
      continue;
    }

    try {
      const result = await attemptWithRetries(options, providerConfig, 2);
      recordSuccess(pid);
      if (i > 0) {
        console.log(`[AI] Failover: primary failed, served by ${pid}`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const status = (lastError as Error & { status?: number }).status;

      recordFailure(pid);

      // Auth errors are terminal — don't try fallbacks
      if (status && isAuthError(status)) throw lastError;

      // Retryable or unknown error → try next in chain
      if (i < chain.length - 1) {
        console.warn(
          `[AI] Provider ${pid} failed (status=${status ?? "unknown"}), trying fallback ${i + 2}/${chain.length}...`
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

// ═══════════════════════════════════════════════════════════════
// Streaming generation — SSE-compatible ReadableStream
// ═══════════════════════════════════════════════════════════════

export interface StreamChunk {
  type: "chunk" | "done" | "error";
  content?: string;
  error?: string;
  provider?: string;
  model?: string;
}

function formatSSE(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * Stream a completion using the appropriate backend with circuit breaker + failover.
 * Returns a Response with SSE content type.
 */
export async function generateCompletionStream(
  options: AiCompletionOptions
): Promise<Response> {
  const config = options.providerConfig || getDefaultConfig();
  const fallbackConfig = options.fallbackConfig;

  function enrichWithHardcodedKey(c: AiProviderConfig): AiProviderConfig {
    if (!c.apiKey && c.provider !== "zai") {
      const hardcoded = getHardcodedKey(c.provider);
      if (hardcoded) return { ...c, apiKey: hardcoded };
    }
    return c;
  }

  const chain: AiProviderConfig[] = [enrichWithHardcodedKey(config)];
  if (fallbackConfig?.enabled && fallbackConfig.providers.length > 0) {
    for (const fb of fallbackConfig.providers) {
      chain.push(enrichWithHardcodedKey({
        provider: fb.provider,
        model: fb.model || config.model,
        baseUrl: fb.baseUrl,
      }));
    }
  }

  // Try providers in chain with circuit breaker
  for (let i = 0; i < chain.length; i++) {
    const providerConfig = chain[i];
    const pid = providerConfig.provider;

    if (!canRequest(pid)) {
      console.warn(`[Circuit/Stream] Skipping ${pid} — circuit open`);
      if (i === chain.length - 1) {
        return new Response(
          formatSSE({ type: "error", error: `Fournisseur "${pid}" temporairement indisponible. Réessayez dans quelques secondes.` }),
          { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
        );
      }
      continue;
    }

    try {
      const response = await streamWithProvider(options, providerConfig);
      recordSuccess(pid);
      if (i > 0) {
        console.log(`[AI/Stream] Failover: served by ${pid}`);
      }
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      recordFailure(pid);
      const status = (err as Error & { status?: number }).status;

      if (status && isAuthError(status)) {
        return new Response(
          formatSSE({ type: "error", error: err.message }),
          { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
        );
      }

      if (i < chain.length - 1) {
        console.warn(`[AI/Stream] ${pid} failed, trying fallback ${i + 2}/${chain.length}...`);
      }
    }
  }

  return new Response(
    formatSSE({ type: "error", error: "Tous les fournisseurs IA ont échoué." }),
    { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
  );
}

/**
 * Stream from a single provider (OpenAI SSE format)
 */
async function streamWithProvider(
  options: AiCompletionOptions,
  config: AiProviderConfig
): Promise<Response> {
  const backend = detectBackend(config.provider);

  // zai SDK doesn't support streaming natively — fall back to non-streaming
  if (backend === "zai") {
    const result = await generateWithSDK(options);
    // Convert single response to a single-chunk stream
    return new Response(
      formatSSE({ type: "chunk", content: result.content, provider: result.provider, model: result.model }) +
      formatSSE({ type: "done", provider: result.provider, model: result.model }),
      { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
    );
  }

  const baseUrl = getBaseUrl(config.provider, config.baseUrl);
  if (!baseUrl) throw new Error(`Aucune URL de base pour "${config.provider}".`);

  const model = options.model || config.model || "gpt-4o-mini";
  const url = `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (!isKeylessProvider(config.provider) && config.apiKey) {
    if (isAnthropicFormat(config.provider)) {
      headers["x-api-key"] = config.apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    } else {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
  }

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
      stream: true,
      system: systemMessage.content,
      messages: nonSystemMessages.map((m) => ({ role: m.role, content: m.content })),
    };
  } else {
    body = {
      model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true,
      messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
    };
  }

  // Create a TransformStream to convert SSE chunks into our format
  const { readable, writable } = new TransformStream<StreamChunk, string>({
    transform(chunk, controller) {
      controller.enqueue(formatSSE(chunk));
    },
  });

  // Start fetching and parsing in the background
  (async () => {
    try {
      const fetchResponse = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!fetchResponse.ok) {
        const apiErr = await buildApiError(fetchResponse, model);
        const writer = writable.getWriter();
        await writer.write({ type: "error", error: apiErr.message });
        await writer.close();
        return;
      }

      const reader = fetchResponse.body?.getReader();
      if (!reader) {
        const writer = writable.getWriter();
        await writer.write({ type: "error", error: "Réponse vide du fournisseur." });
        await writer.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      const writer = writable.getWriter();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as Record<string, unknown>;
              const choices = parsed.choices as Array<Record<string, unknown>> | undefined;
              const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
              const content = String(delta?.content || "");
              if (content) {
                await writer.write({
                  type: "chunk",
                  content,
                  provider: config.provider,
                  model,
                });
              }
            } catch {
              // Skip malformed SSE data
            }
          }
        }

        await writer.write({ type: "done", provider: config.provider, model });
      } finally {
        await writer.close();
      }
    } catch (error) {
      const writer = writable.getWriter();
      const msg = error instanceof Error ? error.message : "Erreur de streaming";
      await writer.write({ type: "error", error: msg });
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
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

  // Fallback: if no env var, try hardcoded key
  if (!apiKey && provider !== "zai") {
    const hardcoded = getHardcodedKey(provider);
    if (hardcoded) {
      apiKey = hardcoded;
      console.log(`[AI] Using hardcoded key for ${provider}`);
    }
  }

  return {
    provider,
    apiKey: apiKey || undefined,
    model,
    baseUrl: baseUrl || undefined,
  };
}

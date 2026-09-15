// ═══════════════════════════════════════
// ThesisFrame — Embedding Service
// Calls /v1/embeddings on the configured AI provider
// ═══════════════════════════════════════

import { getBaseUrl, getProviderExtraHeaders, isAnthropicFormat, detectBackend } from "@/lib/ai/ai-provider";
import { getHardcodedKey } from "@/lib/ai/hardcoded-keys";
import type { AiProviderConfig, AiProviderId } from "@/lib/ai/ai-types";

// ───────────────────────────────────────
// Constants
// ───────────────────────────────────────

const EMBEDDING_TIMEOUT_MS = 30_000;
const BATCH_SIZE = 20; // Max texts per embedding call (OpenAI limit)

/**
 * Default embedding model per provider.
 * These can be overridden by the caller.
 */
const DEFAULT_EMBEDDING_MODELS: Partial<Record<AiProviderId, string>> = {
  openai: "text-embedding-3-small",
  mistral: "mistral-embed",
  google: "text-embedding-004",
  groq: "text-embedding-3-small", // Groq proxies OpenAI
  openrouter: "text-embedding-3-small",
  github: "text-embedding-3-small",
  nvidia: "nvidia/nv-embed-v1",
  routesme: "text-embedding-3-small",
};

/** Providers that do NOT support /v1/embeddings */
const UNSUPPORTED_PROVIDERS: AiProviderId[] = [
  "zai", "anthropic", "cohere", "pollinations", "kilo", "routeway",
  "ainative", "aion", "requesty", "sealion", "cerebras", "cloudflare",
  "huggingface", "siliconflow",
];

// ───────────────────────────────────────
// Types
// ───────────────────────────────────────

export interface EmbeddingResult {
  /** JSON-stringified float array */
  embedding: string;
  /** Model used */
  model: string;
  /** Dimension of the embedding vector */
  dimension: number;
}

export interface EmbeddingServiceInfo {
  supported: boolean;
  model: string;
  provider: AiProviderId;
}

// ───────────────────────────────────────
// Public API
// ───────────────────────────────────────

/**
 * Check if the given provider config supports embeddings.
 */
export function getEmbeddingInfo(config: AiProviderConfig): EmbeddingServiceInfo {
  const provider = config.provider;
  const model = config.model || DEFAULT_EMBEDDING_MODELS[provider] || "text-embedding-3-small";
  return {
    supported: !UNSUPPORTED_PROVIDERS.includes(provider),
    model,
    provider,
  };
}

/**
 * Generate embedding for a single text.
 * Returns null if unsupported or on error.
 */
export async function generateEmbedding(
  text: string,
  config: AiProviderConfig
): Promise<EmbeddingResult | null> {
  const results = await generateEmbeddings([text], config);
  return results[0] ?? null;
}

/**
 * Generate embeddings for multiple texts (batched).
 * Returns array of EmbeddingResult | null (same length as input).
 */
export async function generateEmbeddings(
  texts: string[],
  config: AiProviderConfig
): Promise<(EmbeddingResult | null)[]> {
  const info = getEmbeddingInfo(config);
  if (!info.supported) {
    return texts.map(() => null);
  }

  const results: (EmbeddingResult | null)[] = new Array(texts.length).fill(null);

  // Process in batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchResults = await callEmbeddingApi(batch, info.model, config);

    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j];
    }
  }

  return results;
}

// ───────────────────────────────────────
// Cosine similarity
// ───────────────────────────────────────

/**
 * Parse a JSON-stringified embedding back to float array.
 */
export function parseEmbedding(jsonStr: string): number[] {
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ───────────────────────────────────────
// Internal: API call
// ───────────────────────────────────────

async function callEmbeddingApi(
  texts: string[],
  model: string,
  config: AiProviderConfig
): Promise<(EmbeddingResult | null)[]> {
  const baseUrl = getBaseUrl(config.provider, config.baseUrl);
  const apiKey = config.apiKey || getHardcodedKey(config.provider);

  if (!baseUrl || !apiKey) {
    return texts.map(() => null);
  }

  const backend = detectBackend(config.provider);
  if (backend === "zai") {
    return texts.map(() => null); // z-ai SDK has no embedding endpoint
  }

  const url = `${baseUrl}/embeddings`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    ...getProviderExtraHeaders(config.provider),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        input: texts,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `[Embedding] ${config.provider} returned ${response.status}: ${response.statusText}`
      );
      return texts.map(() => null);
    }

    const data = (await response.json()) as {
      data?: Array<{ embedding: number[]; index: number }>;
      model?: string;
      error?: { message: string };
    };

    if (data.error) {
      console.error(`[Embedding] API error: ${data.error.message}`);
      return texts.map(() => null);
    }

    if (!data.data || !Array.isArray(data.data)) {
      return texts.map(() => null);
    }

    // Sort by index to ensure correct ordering
    const sorted = [...data.data].sort((a, b) => a.index - b.index);

    return sorted.map((item) => {
      if (!item.embedding || !Array.isArray(item.embedding)) return null;
      return {
        embedding: JSON.stringify(item.embedding),
        model: data.model || model,
        dimension: item.embedding.length,
      };
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("[Embedding] Request timed out");
    } else {
      console.error("[Embedding] Error:", error);
    }
    return texts.map(() => null);
  }
}

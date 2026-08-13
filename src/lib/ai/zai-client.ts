// ═══════════════════════════════════════
// ThesisFrame — z-ai-web-dev-sdk Wrapper
// Server-side only — encapsulates AI calls with retry logic
// ═══════════════════════════════════════

import ZAI from "z-ai-web-dev-sdk";

let aiClientPromise: Promise<ZAI> | null = null;

async function getClient(): Promise<ZAI> {
  if (!aiClientPromise) {
    aiClientPromise = ZAI.create();
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
}

export interface AiCompletionResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Generate a completion using z-ai-web-dev-sdk
 * Retry up to 2 times with exponential backoff
 */
export async function generateCompletion(
  options: AiCompletionOptions
): Promise<AiCompletionResult> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const client = await getClient();

      const response = await client.chat.completions.create({
        messages: options.messages,
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
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `[AI] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
          lastError.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `AI generation failed after ${maxRetries + 1} attempts: ${lastError?.message}`
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

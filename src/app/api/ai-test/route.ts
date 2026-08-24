import { NextRequest, NextResponse } from "next/server";
import {
  type AiProviderConfig,
  detectBackend,
  getBaseUrl,
  isKeylessProvider,
  getProviderExtraHeaders,
  isAnthropicFormat,
} from "@/lib/ai/ai-provider";
import AiSDK from "z-ai-web-dev-sdk";

// ═════════════════════════════════════════
// POST /api/ai-test — Test AI provider connection
// Server-side only — supports keyless providers (Pollinations, Kilo)
// ═════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AiProviderConfig>;
    const provider = (body.provider || "zai") as AiProviderConfig["provider"];
    const backend = detectBackend(provider);

    if (backend === "zai") {
      const client = await AiSDK.create();
      const response = await client.chat.completions.create({
        messages: [{ role: "user", content: "ping" }],
        model: "default",
        maxTokens: 5,
      });
      const content =
        typeof response === "string"
          ? response
          : String((response as Record<string, unknown>).content ?? response);
      return NextResponse.json({ ok: true, response: content.slice(0, 50) });
    }

    // Test OpenAI-compatible API
    const baseUrl = getBaseUrl(provider, body.baseUrl);
    const apiKey = body.apiKey;
    const model = body.model || getDefaultModel(provider);

    // Keyless providers: no API key required
    if (!isKeylessProvider(provider) && !apiKey) {
      return NextResponse.json(
        { ok: false, error: `Clé API requise pour ${provider}` },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (isAnthropicFormat(provider) && apiKey) {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
    } else if (apiKey && !isKeylessProvider(provider)) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    // Provider-specific extra headers
    const extra = getProviderExtraHeaders(provider);
    Object.assign(headers, extra);

    const url = `${baseUrl}/chat/completions`;
    const requestBody = {
      model,
      max_tokens: 10,
      messages: [{ role: "user", content: "Réponds juste 'OK' en français." }],
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      let errorText = await res.text().catch(() => "Unknown error");
      try {
        const errJson = JSON.parse(errorText) as Record<string, unknown>;
        const errObj = errJson.error as Record<string, string> | undefined;
        errorText = errObj?.message || (errJson.message as string) || errorText;
      } catch {}
      return NextResponse.json(
        { ok: false, error: `(${res.status}) ${errorText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as Record<string, unknown>;
    const choices = data.choices as Array<Record<string, unknown>> | undefined;
    const msg = choices?.[0]?.message as Record<string, unknown> | undefined;
    const content = String(msg?.content || "");

    return NextResponse.json({
      ok: true,
      provider,
      model,
      response: content.slice(0, 100),
      usage: data.usage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

function getDefaultModel(provider: string): string {
  const defaults: Record<string, string> = {
    anthropic: "claude-3-haiku-20240307",
    google: "gemini-2.0-flash",
    groq: "llama-3.3-70b-versatile",
    cerebras: "llama-3.3-70b",
    openrouter: "meta-llama/llama-4-maverick:free",
    github: "openai/gpt-4.1-mini",
    nvidia: "meta/llama-3.3-70b-instruct",
    cohere: "command-r",
    pollinations: "openai",
    kilo: "auto",
    routeway: "auto:free",
  };
  return defaults[provider] || "gpt-4o-mini";
}

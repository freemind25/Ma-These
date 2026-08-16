import { NextRequest, NextResponse } from "next/server";
import {
  type AiProviderConfig,
  detectBackend,
  getBaseUrl,
} from "@/lib/ai/ai-provider";
import AiSDK from "z-ai-web-dev-sdk";

// ═══════════════════════════════════════
// POST /api/ai-test — Test AI provider connection
// Server-side only (safe for z-ai-web-dev-sdk / fs)
// ═══════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AiProviderConfig>;
    const provider = (body.provider || "zai") as AiProviderConfig["provider"];
    const backend = detectBackend(provider);

    if (backend === "zai") {
      // Test z.ai SDK
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
    const model =
      body.model ||
      (provider === "anthropic"
        ? "claude-3-haiku-20240307"
        : "gpt-4o-mini");

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Clé API requise" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (provider === "anthropic") {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const url =
      provider === "anthropic"
        ? `${baseUrl}/messages`
        : `${baseUrl}/chat/completions`;

    const requestBody =
      provider === "anthropic"
        ? { model, max_tokens: 10, messages: [{ role: "user", content: "ping" }] }
        : { model, max_tokens: 10, messages: [{ role: "user", content: "ping" }] };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      let errorText = await res.text().catch(() => "Unknown error");

      // Parse known error types for friendlier messages
      try {
        const errJson = JSON.parse(errorText) as { error?: { type?: string; message?: string }; model?: string };
        const errType = errJson.error?.type;
        const errMsg = errJson.error?.message || "";

        if (errType === "all_keys_failed" || res.status === 503) {
          errorText = `Service temporairement indisponible (${res.status}). Le modèle "${errJson.model || model}" est peut-être surchargé. Réessayez dans quelques instants ou choisissez un autre modèle.`;
        } else if (errType === "rate_limit_exceeded" || res.status === 429) {
          errorText = `Limite de requêtes atteinte (${res.status}). ${errMsg || "Attendez quelques secondes avant de réessayer."}`;
        } else if (errType === "invalid_api_key" || res.status === 401) {
          errorText = `Clé API invalide (${res.status}). Vérifiez votre clé et réessayez.`;
        } else if (errMsg) {
          errorText = `${errMsg} (modèle: ${errJson.model || model})`;
        }
      } catch {
        // keep raw errorText
      }

      return NextResponse.json(
        { ok: false, error: errorText.slice(0, 300) },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, provider, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

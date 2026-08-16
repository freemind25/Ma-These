// ═══════════════════════════════════════
// ThesisFrame — GET /api/ai-models
// Fetch available models from an OpenAI-compatible /models endpoint
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

// In-memory cache (5 min TTL)
const modelCache = new Map<string, { models: string[]; fetchedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const baseUrl = request.nextUrl.searchParams.get("baseUrl");
    const apiKey = request.nextUrl.searchParams.get("apiKey");

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Paramètre baseUrl requis" },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${baseUrl}:${apiKey ? "auth" : "public"}`;
    const cached = modelCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ models: cached.models, cached: true });
    }

    // Fetch models from the provider's /models endpoint
    const url = baseUrl.replace(/\/+$/, "") + "/models";
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      let errorText = await res.text().catch(() => "Unknown error");
      // Parse error for friendlier messages (Mistral uses {detail: ...} or {message: ...})
      try {
        const errJson = JSON.parse(errorText) as {
          detail?: string;
          message?: string;
          error?: { message?: string };
        };
        const errMsg = errJson.detail || errJson.message || errJson.error?.message || "";
        if (res.status === 401) {
          errorText = `Clé API invalide (${res.status}). ${errMsg || "Vérifiez votre clé API."}`;
        } else if (errMsg) {
          errorText = `${errMsg} (${res.status})`;
        } else {
          errorText = `Impossible de récupérer les modèles (${res.status}): ${errorText.slice(0, 100)}`;
        }
      } catch {
        errorText = `Impossible de récupérer les modèles (${res.status}): ${errorText.slice(0, 100)}`;
      }
      return NextResponse.json(
        { error: errorText },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      data?: Array<{ id: string; object?: string }>;
    };

    // Extract model IDs from OpenAI-compatible response
    // Priority keywords: prefer chat-capable models at the top
    const TOP_MODELS = [
      // Mistral chat models (cheapest/most practical first)
      "mistral-small-latest",
      "mistral-medium-latest",
      "mistral-large-latest",
      // Other popular chat models
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4",
      "claude-3-haiku-20240307",
      "claude-sonnet-4-20250514",
      "deepseek-chat",
      "deepseek-reasoner",
      "glm-5-2",
      "glm-5-2-free",
    ];

    const CHAT_KEYWORDS = [
      "mistral-small",
      "mistral-medium",
      "mistral-large",
      "gpt-4o",
      "gpt-4",
      "gpt-3.5",
      "claude",
      "deepseek",
      "glm",
      "gemini",
      "llama",
    ];

    const allModels: string[] = (data.data || [])
      .filter((m) => m.object === "model" || !m.object)
      .map((m) => m.id);

    // Split into three tiers: top models, other chat models, utility models
    const topTier: string[] = [];
    const chatModels: string[] = [];
    const otherModels: string[] = [];

    for (const model of allModels) {
      const lower = model.toLowerCase();

      // Check if it's a top-tier model
      const topIdx = TOP_MODELS.findIndex((tm) => lower === tm || lower === tm.toLowerCase());
      if (topIdx !== -1) {
        topTier.push(model);
        continue;
      }

      // Skip utility models (embed, moderation, ocr, tts, transcription, fim, etc.)
      if (
        lower.includes("embed") ||
        lower.includes("moderation") ||
        lower.includes("ocr") ||
        lower.includes("-tts") ||
        lower.includes("transcribe") ||
        lower.includes("-fim") ||
        lower.includes("voxtral") ||
        lower.includes("vibe-cli") ||
        lower.includes("code-fim") ||
        lower.includes("code-agent")
      ) {
        otherModels.push(model);
        continue;
      }

      // Check if it's a chat model
      const isChat = CHAT_KEYWORDS.some((kw) => lower.includes(kw));
      if (isChat) {
        chatModels.push(model);
      } else {
        otherModels.push(model);
      }
    }

    // Sort top tier by priority order, others alphabetically
    const models = [
      ...topTier.sort((a, b) => {
        const ai = TOP_MODELS.findIndex((tm) => a.toLowerCase() === tm);
        const bi = TOP_MODELS.findIndex((tm) => b.toLowerCase() === tm);
        return ai - bi;
      }),
      ...chatModels.sort(),
      ...otherModels.sort(),
    ];

    if (models.length === 0) {
      return NextResponse.json({ models: [], message: "Aucun modèle trouvé" });
    }

    // Cache result
    modelCache.set(cacheKey, { models, fetchedAt: Date.now() });

    return NextResponse.json({ models, cached: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

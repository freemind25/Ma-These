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
      const errorText = await res.text().catch(() => "Unknown error");
      return NextResponse.json(
        {
          error: `Impossible de récupérer les modèles (${res.status}): ${errorText.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      data?: Array<{ id: string; object?: string }>;
    };

    // Extract model IDs from OpenAI-compatible response
    const models: string[] = (data.data || [])
      .filter((m) => m.object === "model" || !m.object)
      .map((m) => m.id)
      .sort();

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

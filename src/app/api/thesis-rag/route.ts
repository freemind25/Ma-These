// ═══════════════════════════════════════
// ThesisFrame — RAG API Route v2
// POST /api/thesis-rag
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { indexThesisContent, generateRagResponse } from "@/lib/rag/rag-service";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action?: string;
      thesisId?: string;
      query?: string;
      _aiConfig?: unknown;
    };

    const { action, thesisId, query, _aiConfig } = body;
    const providerConfig = resolveAiConfig(request, _aiConfig);

    if (!action || !thesisId) {
      return NextResponse.json(
        { error: "Paramètres manquants : action et thesisId sont requis." },
        { status: 400 }
      );
    }

    // ── Action: index ──
    if (action === "index") {
      const stats = await indexThesisContent(thesisId, providerConfig);
      return NextResponse.json({ success: true, stats });
    }

    // ── Action: query ──
    if (action === "query") {
      if (!query || !query.trim()) {
        return NextResponse.json(
          { error: "Le paramètre 'query' est requis pour l'action 'query'." },
          { status: 400 }
        );
      }

      const result = await generateRagResponse(query, thesisId, providerConfig);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { error: `Action inconnue : "${action}". Utilisez "index" ou "query".` },
      { status: 400 }
    );
  } catch (error) {
    console.error("[RAG API] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

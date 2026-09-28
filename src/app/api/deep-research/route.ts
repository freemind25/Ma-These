// ═══════════════════════════════════════════════════════════════
// POST /api/deep-research — wrapper mince autour du pipeline
// Le pipeline complet vit dans src/lib/research/deep-research-pipeline.ts
// afin d'être exécutable aussi par le worker de la file de tâches (A.8).
// v1.9.3 : ajout mode "academic" (OpenAlex + curation déterministe)
// A.2 : repli automatique CrossRef + HAL avec triangulation
// A.3 : rapport web robuste (continuation + section Sources garantie)
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";
import { runDeepResearch } from "@/lib/research/deep-research-pipeline";

// ── Validation ──────────────────────────────────────────────────
const schema = z.object({
  prompt: z.string().min(10, "La question doit contenir au moins 10 caractères").max(50_000, "Le prompt ne doit pas dépasser 50 000 caractères"),
  context: z.string().max(100_000, "Le contexte ne doit pas dépasser 100 000 caractères").optional(),
  sourceMode: z.enum(["web", "academic"]).optional().default("web"),
  _aiConfig: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    const providerConfig = resolveAiConfig(request, validated._aiConfig);

    const result = await runDeepResearch({
      prompt: validated.prompt,
      context: validated.context,
      sourceMode: validated.sourceMode,
      providerConfig,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("[POST /api/deep-research] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la recherche";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

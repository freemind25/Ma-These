import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { assembleArticleSources } from "@/lib/articles/sources-server";
import { analyzeSources, fragmentationRisk } from "@/lib/articles/analysis";

export const runtime = "nodejs";

// ═══════════════════════════════════════════════════════════════
// POST /api/articles/analyze — rapport d'analyse des sources (pur)
// ═══════════════════════════════════════════════════════════════

const schema = z.object({
  sources: z.object({
    thesisId: z.string().nullish(),
    includeChapters: z.boolean().optional(),
    includeCadrage: z.boolean().optional(),
    includeNotebook: z.boolean().optional(),
    includeReferences: z.boolean().optional(),
    includeExperiments: z.boolean().optional(),
    importedDocIds: z.array(z.string()).optional(),
    maxChapters: z.number().int().min(1).max(30).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps de la requête JSON invalide" }, { status: 400 });
    }
    const validated = schema.parse(body);
    const blocks = await assembleArticleSources(validated.sources);
    if (blocks.length === 0) {
      return NextResponse.json(
        { error: "Aucune source sélectionnée à analyser." },
        { status: 400 }
      );
    }
    const analysis = analyzeSources(blocks);
    const risk = fragmentationRisk({
      studiesCount: analysis.studies.length,
      anglesCount: analysis.studies.length >= 2 ? 2 : 1,
    });
    return NextResponse.json({ data: { analysis, fragmentation: risk } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/articles/analyze] Error:", error);
    return NextResponse.json({ error: "Erreur d'analyse des sources." }, { status: 500 });
  }
}

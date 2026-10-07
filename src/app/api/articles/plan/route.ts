import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateText } from "@/lib/ai/zai-client";
import { assembleArticleSources } from "@/lib/articles/sources-server";
import { buildArticleSystemPrompt, buildPlanPrompt, parsePlanResponse } from "@/lib/articles/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

// ═══════════════════════════════════════════════════════════════
// POST /api/articles/plan — proposition de plan (étape 4)
// Le plan est une PROPOSITION : modifiable avant génération (CA-4).
// ═══════════════════════════════════════════════════════════════

const planSchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    articleType: z.string().min(1),
    discipline: z.string().nullish(),
    targetLang: z.string().min(1),
    targetWords: z.number().int().min(500).max(30000),
    biblioStyle: z.string().min(1),
    targetJournal: z.string().nullish(),
    journalGuide: z.string().nullish(),
    authors: z.string().nullish(),
    angle: z.string().nullish(),
  }),
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
    const validated = planSchema.parse(body);

    const blocks = await assembleArticleSources(validated.sources);
    if (blocks.length === 0) {
      return NextResponse.json(
        {
          error:
            "Aucune source sélectionnée : choisissez au moins un élément du projet (chapitres, cadrage, références…) ou importez un document.",
        },
        { status: 400 }
      );
    }

    const prompt = buildPlanPrompt(validated.meta, blocks);
    const raw = await generateText(prompt, buildArticleSystemPrompt());
    const plan = parsePlanResponse(raw);

    return NextResponse.json({ data: { plan, sourcesCount: blocks.length } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/articles/plan] Error:", error);
    return NextResponse.json(
      {
        error:
          "La proposition de plan a échoué : " +
          (error instanceof Error ? error.message : "erreur inconnue") +
          ". Vous pouvez réessayer ou rédiger le plan manuellement.",
      },
      { status: 502 }
    );
  }
}

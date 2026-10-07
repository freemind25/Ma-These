import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateText } from "@/lib/ai/zai-client";
import { assembleArticleSources } from "@/lib/articles/sources-server";
import { buildArticleSystemPrompt, buildAnglesPrompt, parseAnglesResponse } from "@/lib/articles/prompts";
import { fragmentationRisk } from "@/lib/articles/analysis";

export const runtime = "nodejs";
export const maxDuration = 300;

// ═══════════════════════════════════════════════════════════════
// POST /api/articles/angles — propositions d'angles (IA)
// Le choix reste OBLIGATOIREMENT à l'utilisateur (jamais automatique).
// ═══════════════════════════════════════════════════════════════

const schema = z.object({
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
    const validated = schema.parse(body);
    const blocks = await assembleArticleSources(validated.sources);
    if (blocks.length === 0) {
      return NextResponse.json({ error: "Aucune source sélectionnée." }, { status: 400 });
    }

    const raw = await generateText(buildAnglesPrompt(validated.meta, blocks), buildArticleSystemPrompt());
    const angles = parseAnglesResponse(raw);
    const studiesCount = blocks.filter((b) => b.kind === "experiment").length;
    const fragmentation = fragmentationRisk({ studiesCount, anglesCount: angles.length });

    return NextResponse.json({ data: { angles, fragmentation, studiesCount } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/articles/angles] Error:", error);
    return NextResponse.json(
      {
        error:
          "La proposition d'angles a échoué : " +
          (error instanceof Error ? error.message : "erreur inconnue") +
          ". Vous pouvez saisir l'angle manuellement.",
      },
      { status: 502 }
    );
  }
}

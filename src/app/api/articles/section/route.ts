import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateText } from "@/lib/ai/zai-client";
import { assembleArticleSources } from "@/lib/articles/sources-server";
import {
  buildArticleSystemPrompt,
  buildSectionPrompt,
  parseUsedSources,
} from "@/lib/articles/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

// ═══════════════════════════════════════════════════════════════
// POST /api/articles/section — génération d'UNE section (étape 5)
// Le reste du brouillon n'est pas touché (CA-5). Les sources
// utilisées sont retournées pour la traçabilité (CA-7).
// ═══════════════════════════════════════════════════════════════

const sectionSchema = z.object({
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
  plan: z.array(z.object({ id: z.string(), heading: z.string(), brief: z.string().nullish() })).min(1),
  sectionId: z.string().min(1),
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
    const validated = sectionSchema.parse(body);

    const blocks = await assembleArticleSources(validated.sources);
    if (blocks.length === 0) {
      return NextResponse.json(
        { error: "Aucune source disponible pour générer cette section." },
        { status: 400 }
      );
    }

    const prompt = buildSectionPrompt({
      meta: validated.meta,
      plan: validated.plan,
      sectionId: validated.sectionId,
      blocks,
    });
    const raw = await generateText(prompt, buildArticleSystemPrompt());
    const { content, usedSources } = parseUsedSources(raw);

    if (!content.trim()) {
      return NextResponse.json(
        { error: "La génération a renvoyé une section vide — réessayez." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      data: {
        sectionId: validated.sectionId,
        content,
        usedSources,
        // Rappel affiché côté client (règle d'intégrité n°11)
        disclaimer:
          "Brouillon d'aide à la rédaction — à vérifier par les auteurs. Aucune garantie d'acceptation par une revue ni d'absence de similitudes textuelles.",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/articles/section] Error:", error);
    return NextResponse.json(
      {
        error:
          "La génération de la section a échoué : " +
          (error instanceof Error ? error.message : "erreur inconnue") +
          ". Les autres sections ne sont pas affectées — réessayez cette section.",
      },
      { status: 502 }
    );
  }
}

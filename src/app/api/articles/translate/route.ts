import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateText } from "@/lib/ai/zai-client";
import { buildArticleSystemPrompt, buildTranslationPrompt } from "@/lib/articles/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

// ═══════════════════════════════════════════════════════════════
// POST /api/articles/translate — traduction DISTINCTE (option C)
// Renvoie une COPIE traduite : l'original n'est JAMAIS modifié ici ;
// l'utilisateur enregistre la copie (version ou nouvel article).
// ═══════════════════════════════════════════════════════════════

const schema = z.object({
  title: z.string().min(1),
  targetLang: z.string().min(2).max(30),
  content: z.string().min(10, "Rien à traduire."),
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

    const raw = await generateText(
      buildTranslationPrompt(validated),
      buildArticleSystemPrompt()
    );
    const translated = raw.trim();
    if (!translated) {
      return NextResponse.json({ error: "La traduction a renvoyé un texte vide — réessayez." }, { status: 502 });
    }

    return NextResponse.json({
      data: {
        translated,
        targetLang: validated.targetLang,
        disclaimer:
          "Traduction d'un brouillon — sens, données et citations préservés, aucun contenu ajouté. À vérifier par les auteurs.",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/articles/translate] Error:", error);
    return NextResponse.json(
      { error: "La traduction a échoué : " + (error instanceof Error ? error.message : "erreur inconnue") },
      { status: 502 }
    );
  }
}

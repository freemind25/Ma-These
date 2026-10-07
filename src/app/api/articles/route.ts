import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/articles — liste (légère, sans sections)
// POST /api/articles — créer un brouillon d'article
// DELETE /api/articles?id=xxx
// ═══════════════════════════════════════

export async function GET() {
  try {
    const rows = await db.article.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, thesisId: true, title: true, articleType: true, discipline: true,
        targetLang: true, targetWords: true, biblioStyle: true, targetJournal: true,
        status: true, sections: true, createdAt: true, updatedAt: true,
      },
    });
    const data = rows.map((r) => {
      let sectionsCount = 0;
      let toComplete = 0;
      try {
        const secs = JSON.parse(r.sections || "[]") as { content?: string }[];
        sectionsCount = secs.length;
        toComplete = secs.reduce(
          (acc, s) => (s.content?.match(/\[À compléter par l'auteur\]|\[[^\]]*à vérifier[^\]]*\]|\[Information non précisée[^\]]*\]/gi) || []).length + acc,
          0
        );
      } catch {
        /* sections malformées — compteurs à 0 */
      }
      const { sections: _s, ...rest } = r;
      void _s;
      return { ...rest, sectionsCount, toComplete };
    });
    return NextResponse.json({ data, meta: { count: data.length } });
  } catch (error) {
    console.error("[GET /api/articles] Error:", error);
    return NextResponse.json({ error: "Erreur de lecture des articles." }, { status: 500 });
  }
}

const createSchema = z.object({
  thesisId: z.string().nullish(),
  title: z.string().min(3, "Le titre est requis (3 caractères minimum)"),
  articleType: z.enum(["empirique", "qualitatif", "quantitatif", "theorique", "revue", "cas"]).default("empirique"),
  discipline: z.string().max(200).nullish(),
  targetLang: z.string().max(10).default("fr"),
  targetWords: z.number().int().min(500).max(30000).default(6000),
  biblioStyle: z.enum(["APA", "IEEE", "Vancouver", "Chicago"]).default("APA"),
  targetJournal: z.string().max(300).nullish(),
  journalGuide: z.string().max(20000).nullish(),
  authors: z.string().max(1000).nullish(),
  angle: z.string().max(2000).nullish(),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps de la requête JSON invalide" }, { status: 400 });
    }
    const validated = createSchema.parse(body);
    const article = await db.article.create({ data: validated });
    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.flatten() }, { status: 400 });
    }
    console.error("[POST /api/articles] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'article." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Fournissez ?id=xxx" }, { status: 400 });
    await db.article.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/articles] Error:", error);
    return NextResponse.json({ error: "Article non trouvé ou suppression impossible." }, { status: 404 });
  }
}

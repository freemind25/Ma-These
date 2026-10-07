import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/articles/[id] — article complet
// PUT /api/articles/[id] — méta / plan / sections (+ version)
// DELETE /api/articles/[id]
// ═══════════════════════════════════════

const sectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  content: z.string().default(""),
  sources: z
    .array(
      z.object({
        label: z.string(),
        kind: z.string(),
        location: z.string().nullish(),
      })
    )
    .default([]),
});

const putSchema = z.object({
  title: z.string().min(3).optional(),
  articleType: z.enum(["empirique", "qualitatif", "quantitatif", "theorique", "revue", "cas"]).optional(),
  discipline: z.string().max(200).nullish(),
  targetLang: z.string().max(10).optional(),
  targetWords: z.number().int().min(500).max(30000).optional(),
  biblioStyle: z.enum(["APA", "IEEE", "Vancouver", "Chicago"]).optional(),
  targetJournal: z.string().max(300).nullish(),
  journalGuide: z.string().max(20000).nullish(),
  authors: z.string().max(1000).nullish(),
  angle: z.string().max(2000).nullish(),
  status: z.enum(["draft", "plan", "generated", "revised"]).optional(),
  plan: z
    .array(z.object({ id: z.string(), heading: z.string(), brief: z.string().nullish() }))
    .nullish(),
  sections: z.array(sectionSchema).nullish(),
  /** Enregistrer une version datée du contenu actuel (avant modification). */
  snapshotVersion: z.boolean().optional(),
  versionLabel: z.string().max(200).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          select: { id: true, label: true, createdAt: true, sections: true },
          take: 30,
        },
      },
    });
    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }
    return NextResponse.json({ data: article });
  } catch (error) {
    console.error("[GET /api/articles/[id]] Error:", error);
    return NextResponse.json({ error: "Erreur de lecture de l'article." }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps de la requête JSON invalide" }, { status: 400 });
    }
    const validated = putSchema.parse(body);
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    // Version datée du contenu ACTUEL avant modification (CA-5)
    if (validated.snapshotVersion && existing.sections !== "[]") {
      await db.articleVersion.create({
        data: {
          articleId: id,
          label: validated.versionLabel ?? null,
          sections: existing.sections,
        },
      });
    }

    const { snapshotVersion, versionLabel, plan, sections, ...meta } = validated;
    void snapshotVersion;
    void versionLabel;
    const article = await db.article.update({
      where: { id },
      data: {
        ...meta,
        ...(plan !== undefined && { plan: JSON.stringify(plan) }),
        ...(sections !== undefined && { sections: JSON.stringify(sections) }),
      },
    });
    return NextResponse.json({ data: article });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.flatten() }, { status: 400 });
    }
    console.error("[PUT /api/articles/[id]] Error:", error);
    return NextResponse.json({ error: "Erreur de mise à jour de l'article." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.article.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/articles/[id]] Error:", error);
    return NextResponse.json({ error: "Article non trouvé ou suppression impossible." }, { status: 404 });
  }
}

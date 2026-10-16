import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateChapterSchema } from "@/lib/api-schemas";
import { dbErrorResponse } from "@/lib/api/db-errors";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/chapters/[id] — Update a chapter
// A.4 (annexe technique) : chaque sauvegarde qui MODIFIE le contenu crée
// une entrée d'historique (ChapterVersion) — même schéma que les versions
// du cadrage (ThesisCadrageVersion). Les sauvegardes sans changement de
// contenu (statut, feedback directeur…) ne polluent pas l'historique.
// ═══════════════════════════════════════


// ═══════════════════════════════════════
// GET /api/chapters/[id] — État courant léger (id + stamp de provenance).
// Utilisé par l'historique du chapitre pour afficher la provenance des
// savoirs du contenu ACTUEL (specs/sceau-provenance-savoirs).
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapter = await db.chapter.findUnique({
      where: { id },
      select: { id: true, stamp: true },
    });
    if (!chapter) {
      return NextResponse.json({ error: "Chapitre introuvable" }, { status: 404 });
    }
    return NextResponse.json({ data: chapter });
  } catch (error) {
    console.error("[GET /api/chapters/[id]] Error:", error);
    return dbErrorResponse(error, "Erreur lors de la récupération du chapitre");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateChapterSchema.parse(body);

    // A.4 : l'historique n'a de sens que si le contenu change réellement.
    const contentWillChange =
      typeof validated.content === "string" &&
      (await db.chapter.findUnique({
        where: { id },
        select: { content: true },
      }))?.content !== validated.content;

    // Provenance des savoirs : le stamp ne suit que le contenu.
    // Présent = génération IA ; absent/null = « saisie manuelle ».
    // Sans changement de contenu, le stamp courant n'est pas altéré.
    const nextStamp = validated.stamp ?? null;
    const chapterData = { ...validated };
    delete chapterData.stamp;

    const chapter = await db.chapter.update({
      where: { id },
      data: contentWillChange ? { ...chapterData, stamp: nextStamp } : chapterData,
    });

    let versionId: string | null = null;
    if (contentWillChange) {
      const version = await db.chapterVersion.create({
        data: {
          chapterId: id,
          content: chapter.content,
          plainText: chapter.plainText,
          wordCount: chapter.wordCount,
          author: "doctorant",
          stamp: nextStamp, // provenance du contenu snapshoté
        },
      });
      versionId = version.id;
    }

    return NextResponse.json({ data: chapter, versionId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/chapters/[id]] Error:", error);
    return dbErrorResponse(error, "Erreur lors de la mise à jour du chapitre");
  }
}

// ═══════════════════════════════════════
// DELETE /api/chapters/[id] — Delete a chapter
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.chapter.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/chapters/[id]] Error:", error);
    return dbErrorResponse(error, "Erreur lors de la suppression du chapitre");
  }
}

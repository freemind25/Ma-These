import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/chapters/[id]/versions — Historique du chapitre (A.4)
// Retourne les versions (la plus récente d'abord) avec le contenu,
// pour le calcul du diff mot à mot côté client.
// ═══════════════════════════════════════

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const versions = await db.chapterVersion.findMany({
      where: { chapterId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        content: true,
        plainText: true,
        wordCount: true,
        author: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: versions });
  } catch (error) {
    console.error("[GET /api/chapters/[id]/versions] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}

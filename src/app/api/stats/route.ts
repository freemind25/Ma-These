import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/stats — Dashboard aggregated statistics
// ═══════════════════════════════════════
export async function GET() {
  try {
    const [theses, chapters, references, sources, sprints] = await Promise.all([
      db.thesis.count(),
      db.chapter.count(),
      db.reference.count(),
      db.researchSource.count(),
      db.agileSprint.count({ where: { status: "active" } }),
    ]);

    const wordCount = await db.chapter.aggregate({
      _sum: { wordCount: true },
    });

    const completed = await db.chapter.count({
      where: { status: "completed" },
    });

    return NextResponse.json({
      data: {
        totalTheses: theses,
        totalChapters: chapters,
        totalWords: wordCount._sum.wordCount || 0,
        totalReferences: references,
        totalSources: sources,
        completedChapters: completed,
        activeSprints: sprints,
        progressPercent:
          chapters > 0 ? Math.round((completed / chapters) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("[GET /api/stats] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

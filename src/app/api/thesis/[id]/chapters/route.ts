import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createChapterSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/thesis/[id]/chapters — List chapters
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapters = await db.chapter.findMany({
      where: { thesisId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      data: chapters,
      meta: { count: chapters.length },
    });
  } catch (error) {
    console.error("[GET /api/thesis/[id]/chapters] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des chapitres" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/thesis/[id]/chapters — Create chapter
// ═══════════════════════════════════════


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createChapterSchema.parse(body);

    // Determine next chapter number
    const existingCount = await db.chapter.count({ where: { thesisId: id } });
    const nextNumber = existingCount + 1;

    const chapter = await db.chapter.create({
      data: {
        thesisId: id,
        number: nextNumber,
        title: validated.title,
        romanNumeral: validated.romanNumeral,
        parentId: validated.parentId,
        sortOrder: validated.sortOrder ?? existingCount,
        status: "not_started",
      },
    });

    return NextResponse.json({ data: chapter }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/thesis/[id]/chapters] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du chapitre" },
      { status: 500 }
    );
  }
}

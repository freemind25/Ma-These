import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/chapters/[id] — Update a chapter
// ═══════════════════════════════════════
const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  plainText: z.string().optional(),
  wordCount: z.number().optional(),
  targetWordCount: z.number().optional(),
  status: z.string().optional(),
  directorFeedback: z.string().optional(),
  sortOrder: z.number().optional(),
  romanNumeral: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateChapterSchema.parse(body);

    const chapter = await db.chapter.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data: chapter });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/chapters/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du chapitre" },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: "Erreur lors de la suppression du chapitre" },
      { status: 500 }
    );
  }
}

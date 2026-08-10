import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/references/[id] — Update reference
// ═══════════════════════════════════════
const updateRefSchema = z.object({
  type: z.string().optional(),
  authors: z.string().optional(),
  title: z.string().optional(),
  year: z.number().optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  doi: z.string().optional(),
  isbn: z.string().optional(),
  url: z.string().optional(),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  notes: z.string().optional(),
  bibtexKey: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateRefSchema.parse(body);

    const reference = await db.reference.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data: reference });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/references/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/references/[id] — Delete reference
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.reference.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/references/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

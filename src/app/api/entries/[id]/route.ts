import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateNotebookEntrySchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/entries/[id] — Update notebook entry
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateNotebookEntrySchema.parse(body);

    const entry = await db.notebookEntry.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data: entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/entries/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la note" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/entries/[id] — Delete notebook entry
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.notebookEntry.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/entries/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la note" },
      { status: 500 }
    );
  }
}

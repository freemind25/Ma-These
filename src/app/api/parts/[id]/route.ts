import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updatePartSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/parts/[id] — Update a part
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updatePartSchema.parse(body);

    const part = await db.part.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data: part });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/parts/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la partie" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/parts/[id] — Delete a part
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.part.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/parts/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la partie" },
      { status: 500 }
    );
  }
}

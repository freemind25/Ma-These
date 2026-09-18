import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateCadrageSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/cadrages/[id] — Update cadrage label/isActive
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateCadrageSchema.parse(body);

    const existing = await db.thesisCadrage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Cadrage introuvable" },
        { status: 404 }
      );
    }

    // If activating this cadrage, deactivate others for the same thesis
    if (validated.isActive === true && !existing.isActive) {
      await db.$transaction(async (tx) => {
        await tx.thesisCadrage.updateMany({
          where: { thesisId: existing.thesisId, isActive: true, id: { not: id } },
          data: { isActive: false },
        });
        await tx.thesisCadrage.update({
          where: { id },
          data: validated,
        });
      });
    } else {
      await db.thesisCadrage.update({
        where: { id },
        data: validated,
      });
    }

    const updated = await db.thesisCadrage.findUnique({
      where: { id },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/cadrages/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du cadrage" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/cadrages/[id] — Delete cadrage
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.thesisCadrage.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/cadrages/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du cadrage" },
      { status: 500 }
    );
  }
}

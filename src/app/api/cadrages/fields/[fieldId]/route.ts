import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateCadrageFieldSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/cadrages/fields/[fieldId] — Update a field
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  try {
    const { fieldId } = await params;
    const body = await request.json();
    const validated = updateCadrageFieldSchema.parse(body);

    const field = await db.thesisCadrageField.update({
      where: { id: fieldId },
      data: validated,
    });

    return NextResponse.json({ data: field });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/cadrages/fields/[fieldId]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du champ" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/cadrages/fields/[fieldId] — Delete a field
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  try {
    const { fieldId } = await params;
    await db.thesisCadrageField.delete({ where: { id: fieldId } });
    return NextResponse.json({ data: { id: fieldId } });
  } catch (error) {
    console.error("[DELETE /api/cadrages/fields/[fieldId]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du champ" },
      { status: 500 }
    );
  }
}

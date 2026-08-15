import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateReferenceSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/references/[id] — Update reference
// ═══════════════════════════════════════


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateReferenceSchema.parse(body);

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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCadrageFieldSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/cadrages/[id]/fields — List fields for a cadrage
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const fields = await db.thesisCadrageField.findMany({
      where: { cadrageId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      data: fields,
      meta: { count: fields.length },
    });
  } catch (error) {
    console.error("[GET /api/cadrages/[id]/fields] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des champs" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/cadrages/[id]/fields — Add a field
// ═══════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createCadrageFieldSchema.parse(body);

    // Determine next sort order
    const existingCount = await db.thesisCadrageField.count({
      where: { cadrageId: id },
    });

    const field = await db.thesisCadrageField.create({
      data: {
        cadrageId: id,
        fieldKey: validated.fieldKey,
        label: validated.label,
        value: validated.value,
        aiSuggestion: validated.aiSuggestion,
        isLocked: validated.isLocked ?? false,
        sortOrder: validated.sortOrder ?? existingCount,
      },
    });

    return NextResponse.json({ data: field }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/cadrages/[id]/fields] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du champ" },
      { status: 500 }
    );
  }
}

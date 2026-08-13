import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCadrageSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/thesis/[id]/cadrages — List cadrages for a thesis
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cadrages = await db.thesisCadrage.findMany({
      where: { thesisId: id },
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: cadrages,
      meta: { count: cadrages.length },
    });
  } catch (error) {
    console.error("[GET /api/thesis/[id]/cadrages] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des cadrages" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/thesis/[id]/cadrages — Create cadrage with initial fields
// ═══════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createCadrageSchema.parse(body);

    // Ensure thesisId in body matches route param
    if (validated.thesisId !== id) {
      return NextResponse.json(
        { error: "L'identifiant de thèse ne correspond pas" },
        { status: 400 }
      );
    }

    // Deactivate other cadrages for this thesis if this one is active (default)
    const existingActive = await db.thesisCadrage.findMany({
      where: { thesisId: id, isActive: true },
    });

    const cadrage = await db.$transaction(async (tx) => {
      // Deactivate existing active cadrages
      if (existingActive.length > 0) {
        await tx.thesisCadrage.updateMany({
          where: { thesisId: id, isActive: true },
          data: { isActive: false },
        });
      }

      // Create cadrage with fields
      return tx.thesisCadrage.create({
        data: {
          thesisId: id,
          label: validated.label,
          fields: validated.fields
            ? {
                create: validated.fields.map((field, index) => ({
                  fieldKey: field.fieldKey,
                  label: field.label,
                  value: field.value,
                  sortOrder: field.sortOrder ?? index,
                })),
              }
            : undefined,
        },
        include: {
          fields: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json({ data: cadrage }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/thesis/[id]/cadrages] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du cadrage" },
      { status: 500 }
    );
  }
}

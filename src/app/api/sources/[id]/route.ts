import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateResearchSourceSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/sources/[id] — Get single research source
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const source = await db.researchSource.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!source) {
      return NextResponse.json(
        { error: "Source de recherche introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: source });
  } catch (error) {
    console.error("[GET /api/sources/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la source de recherche" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/sources/[id] — Update research source
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateResearchSourceSchema.parse(body);

    const source = await db.researchSource.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data: source });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/sources/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la source de recherche" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/sources/[id] — Delete research source
// Entries linked via SetNull will have sourceId cleared
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.researchSource.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/sources/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la source de recherche" },
      { status: 500 }
    );
  }
}

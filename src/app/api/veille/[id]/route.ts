import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// VEILLE ACADÉMIQUE — item
// PATCH  /api/veille/[id] — renommer (CA-1.1 : libellé éditable)
// DELETE /api/veille/[id] — supprimer (CA-1.2, cascade résultats)
// ═══════════════════════════════════════

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const label = typeof body.label === "string" ? body.label.trim() : "";

    if (!label) {
      return NextResponse.json(
        { error: "Le libellé est requis" },
        { status: 400 }
      );
    }
    const existing = await db.savedSearch.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }

    const veille = await db.savedSearch.update({
      where: { id },
      data: { label },
    });
    return NextResponse.json({ data: veille });
  } catch (error) {
    console.error("[PATCH /api/veille/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la veille" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.savedSearch.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }

    await db.savedSearch.delete({ where: { id } });
    // La cascade (onDelete: Cascade, prisma/schema.prisma) supprime les
    // résultats ; le compteur ci-dessous en apporte la preuve en sortie.
    const remainingResults = await db.savedSearchResult.count({
      where: { savedSearchId: id },
    });
    return NextResponse.json({
      data: { deleted: true, remainingResults },
    });
  } catch (error) {
    console.error("[DELETE /api/veille/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la veille" },
      { status: 500 }
    );
  }
}

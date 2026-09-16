import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/research-tabs/[id] — Get a single research tab
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tab = await db.researchTab.findUnique({ where: { id } });

    if (!tab) {
      return NextResponse.json(
        { error: "Onglet de recherche introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: tab });
  } catch (error) {
    console.error("[GET /api/research-tabs/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'onglet" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/research-tabs/[id] — Update a research tab
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.researchTab.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Onglet de recherche introuvable" },
        { status: 404 }
      );
    }

    const tab = await db.researchTab.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.pinned !== undefined && { pinned: body.pinned }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.links !== undefined && {
          links: typeof body.links === "string" ? body.links : JSON.stringify(body.links),
        }),
        ...(body.quotes !== undefined && {
          quotes: typeof body.quotes === "string" ? body.quotes : JSON.stringify(body.quotes),
        }),
        ...(body.todos !== undefined && {
          todos: typeof body.todos === "string" ? body.todos : JSON.stringify(body.todos),
        }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ data: tab });
  } catch (error) {
    console.error("[PUT /api/research-tabs/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'onglet" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/research-tabs/[id] — Delete a research tab
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.researchTab.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/research-tabs/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'onglet" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/thesis/[id]/research-tabs — List research tabs for a thesis
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tabs = await db.researchTab.findMany({
      where: { thesisId: id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      data: tabs,
      meta: { count: tabs.length },
    });
  } catch (error) {
    console.error("[GET /api/thesis/[id]/research-tabs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des onglets de recherche" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/thesis/[id]/research-tabs — Create a research tab
// ═══════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 }
      );
    }

    // Get next sortOrder
    const maxSort = await db.researchTab.aggregate({
      where: { thesisId: id },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    const tab = await db.researchTab.create({
      data: {
        thesisId: id,
        title: body.title.trim(),
        pinned: body.pinned ?? false,
        notes: body.notes || "",
        links: typeof body.links === "string" ? body.links : JSON.stringify(body.links || []),
        quotes: typeof body.quotes === "string" ? body.quotes : JSON.stringify(body.quotes || []),
        todos: typeof body.todos === "string" ? body.todos : JSON.stringify(body.todos || []),
        sortOrder: body.sortOrder ?? nextSort,
      },
    });

    return NextResponse.json({ data: tab }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/thesis/[id]/research-tabs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'onglet de recherche" },
      { status: 500 }
    );
  }
}

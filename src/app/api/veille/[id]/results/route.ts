import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════════════════════════════
// /api/veille/[id]/results — résultats d'une veille
// GET : liste (non vus d'abord, puis firstSeenAt desc)
// PATCH : marquage « vu » — { ids: [...] } ou { all: true } (CA-3.1)
// specs/veille-academique — T6
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// GET /api/veille/[id]/results
// ═══════════════════════════════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const search = await db.savedSearch.findUnique({ where: { id } });
    if (!search) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }

    const results = await db.savedSearchResult.findMany({
      where: { savedSearchId: id },
      orderBy: [{ seen: "asc" }, { firstSeenAt: "desc" }],
    });

    return NextResponse.json({
      data: results,
      meta: {
        count: results.length,
        unreadCount: results.filter((r) => !r.seen).length,
      },
    });
  } catch (error) {
    console.error("[GET /api/veille/[id]/results] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des résultats" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PATCH /api/veille/[id]/results — marquage « vu » (CA-3.1)
// Corps : { ids: ["…"] } (partiel) ou { all: true } (global)
// ═══════════════════════════════════════════════════════════════
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const search = await db.savedSearch.findUnique({ where: { id } });
    if (!search) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: 'Fournir { ids: [...] } ou { all: true }' },
        { status: 400 }
      );
    }

    if (body.all === true) {
      const updated = await db.savedSearchResult.updateMany({
        where: { savedSearchId: id, seen: false },
        data: { seen: true },
      });
      return NextResponse.json({ data: { updated: updated.count, scope: "all" } });
    }

    if (Array.isArray(body.ids)) {
      const ids = body.ids.filter((v: unknown): v is string => typeof v === "string" && v.trim() !== "");
      if (ids.length === 0) {
        return NextResponse.json(
          { error: "La liste d'identifiants est vide" },
          { status: 400 }
        );
      }
      const updated = await db.savedSearchResult.updateMany({
        where: { savedSearchId: id, id: { in: ids } },
        data: { seen: true },
      });
      return NextResponse.json({ data: { updated: updated.count, scope: "ids" } });
    }

    return NextResponse.json(
      { error: 'Fournir { ids: [...] } ou { all: true }' },
      { status: 400 }
    );
  } catch (error) {
    console.error("[PATCH /api/veille/[id]/results] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du marquage des résultats" },
      { status: 500 }
    );
  }
}

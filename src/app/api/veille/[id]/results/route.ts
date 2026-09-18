import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// VEILLE ACADÉMIQUE — résultats d'une veille
// GET   /api/veille/[id]/results — non vus d'abord (CA-3.2), puis récents
// PATCH /api/veille/[id]/results — marquage « vu » (CA-3.1) :
//         { ids: [...] } par résultat, ou { all: true } global
// ═══════════════════════════════════════

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const veille = await db.savedSearch.findUnique({
      where: { id },
      select: { id: true, label: true, source: true, lastCheckedAt: true },
    });
    if (!veille) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }

    const results = await db.savedSearchResult.findMany({
      where: { savedSearchId: id },
      orderBy: [{ seen: "asc" }, { firstSeenAt: "desc" }],
    });
    const unseenCount = results.filter((r) => !r.seen).length;

    return NextResponse.json({
      data: results,
      meta: { count: results.length, unseenCount, veille },
    });
  } catch (error) {
    console.error("[GET /api/veille/[id]/results] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des résultats" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await db.savedSearch.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }

    if (body.all === true) {
      const r = await db.savedSearchResult.updateMany({
        where: { savedSearchId: id, seen: false },
        data: { seen: true },
      });
      return NextResponse.json({ data: { markedSeen: r.count } });
    }

    const ids = Array.isArray(body.ids)
      ? body.ids.filter((x: unknown): x is string => typeof x === "string")
      : [];
    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Fournir « ids » (liste de résultats) ou « all: true »" },
        { status: 400 }
      );
    }

    const r = await db.savedSearchResult.updateMany({
      where: { id: { in: ids }, savedSearchId: id },
      data: { seen: true },
    });
    return NextResponse.json({ data: { markedSeen: r.count } });
  } catch (error) {
    console.error("[PATCH /api/veille/[id]/results] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du marquage des résultats" },
      { status: 500 }
    );
  }
}

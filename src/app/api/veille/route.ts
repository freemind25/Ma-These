import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// VEILLE ACADÉMIQUE — collection
// GET  /api/veille — liste des veilles avec compteurs (CA-3.2)
// POST /api/veille — créer une veille depuis une recherche (CA-1.1)
// ═══════════════════════════════════════

function safeParse(json: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const veilles = await db.savedSearch.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { results: true } } },
    });
    const unseen = await db.savedSearchResult.groupBy({
      by: ["savedSearchId"],
      where: { seen: false },
      _count: { _all: true },
    });
    const unseenByVeille = new Map(
      unseen.map((u) => [u.savedSearchId, u._count._all])
    );
    const data = veilles.map((v) => ({
      id: v.id,
      label: v.label,
      source: v.source,
      query: v.query,
      filters: safeParse(v.filters),
      lastCheckedAt: v.lastCheckedAt,
      createdAt: v.createdAt,
      totalResults: v._count.results,
      unseenCount: unseenByVeille.get(v.id) ?? 0,
    }));
    return NextResponse.json({ data, meta: { count: data.length } });
  } catch (error) {
    console.error("[GET /api/veille] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des veilles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const label = typeof body.label === "string" ? body.label.trim() : "";
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const source = body.source;

    if (!label) {
      return NextResponse.json(
        { error: "Le libellé est requis" },
        { status: 400 }
      );
    }
    if (source !== "hal" && source !== "arxiv") {
      return NextResponse.json(
        { error: "Source invalide — « hal » ou « arxiv » attendu" },
        { status: 400 }
      );
    }
    if (!query) {
      return NextResponse.json(
        { error: "La requête de recherche est requise" },
        { status: 400 }
      );
    }

    const veille = await db.savedSearch.create({
      data: {
        label,
        source,
        query,
        filters:
          typeof body.filters === "string"
            ? body.filters
            : JSON.stringify(body.filters ?? {}),
      },
    });
    return NextResponse.json({ data: veille }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/veille] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la veille" },
      { status: 500 }
    );
  }
}

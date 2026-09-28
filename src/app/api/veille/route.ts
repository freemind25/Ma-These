import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseFiltersJson } from "@/lib/veille/check-core";

// ═══════════════════════════════════════════════════════════════
// /api/veille — recherches suivies (veille académique)
// specs/veille-academique — T3
// ═══════════════════════════════════════════════════════════════

const SOURCES = ["hal", "arxiv"] as const;
type Source = (typeof SOURCES)[number];

// ═══════════════════════════════════════════════════════════════
// GET /api/veille — liste des veilles + compteur de non-vus (CA-3.2)
// ═══════════════════════════════════════════════════════════════
export async function GET() {
  try {
    const searches = await db.savedSearch.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { results: true } } },
    });
    const unreadGroups = await db.savedSearchResult.groupBy({
      by: ["savedSearchId"],
      where: { seen: false },
      _count: { _all: true },
    });
    const unreadBySearch = new Map(
      unreadGroups.map((group) => [group.savedSearchId, group._count._all])
    );

    const data = searches.map((search) => ({
      id: search.id,
      label: search.label,
      source: search.source,
      query: search.query,
      filters: parseFiltersJson(search.filters),
      autoCheck: search.autoCheck,
      lastCheckedAt: search.lastCheckedAt,
      createdAt: search.createdAt,
      updatedAt: search.updatedAt,
      totalResults: search._count.results,
      unreadCount: unreadBySearch.get(search.id) ?? 0,
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

// ═══════════════════════════════════════════════════════════════
// POST /api/veille — création d'une veille
// (label, source "hal"|"arxiv", query, filters optionnels)
// ═══════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const label = typeof body.label === "string" ? body.label.trim() : "";
    const source = typeof body.source === "string" ? body.source.trim() : "";
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!label) {
      return NextResponse.json(
        { error: "Le libellé de la veille est requis" },
        { status: 400 }
      );
    }
    if (!(SOURCES as readonly string[]).includes(source)) {
      return NextResponse.json(
        { error: 'Source invalide (attendu : "hal" ou "arxiv")' },
        { status: 400 }
      );
    }
    if (!query) {
      return NextResponse.json(
        { error: "La requête de recherche est requise" },
        { status: 400 }
      );
    }

    // filters : objet → JSON ; string → validé puis normalisé ; autre → {}
    let filters = "{}";
    if (typeof body.filters === "string" && body.filters.trim()) {
      try {
        filters = JSON.stringify(JSON.parse(body.filters));
      } catch {
        return NextResponse.json(
          { error: "Filtres invalides (JSON malformé)" },
          { status: 400 }
        );
      }
    } else if (body.filters && typeof body.filters === "object" && !Array.isArray(body.filters)) {
      filters = JSON.stringify(body.filters);
    }

    const search = await db.savedSearch.create({
      data: {
        label,
        source: source as Source,
        query,
        filters,
      },
    });

    return NextResponse.json(
      { data: { ...search, filters: parseFiltersJson(search.filters) } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/veille] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la veille" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  applyRetention,
  dedupeByExternalId,
  diffResults,
  type FetchedItem,
} from "@/lib/veille/check-core";

// ═══════════════════════════════════════
// POST /api/veille/[id]/check — vérification manuelle d'une veille
// (déclenchement 100 % manuel — décision de clarification n°3)
//
// La recherche stockée est re-jouée en auto-fetch contre les ROUTES DE
// RECHERCHE EXISTANTES (jamais modifiées) : l'encodage HAL fragile
// (annexe A.1, épinglé par route.test.ts) reste porté par la route seule.
// ═══════════════════════════════════════

const RETENTION_LIMIT = 200; // décision de clarification n°4
const SOURCE_TIMEOUT_MS = 20_000; // plan : timeout ≤ 20 s
const HAL_ROWS = 50; // une page HAL à chaque vérification
const ARXIV_MAX = 30; // plafond de la route arXiv (l.183)

interface HalSearchPayload {
  theses?: Array<{
    id: string;
    title: string;
    titleEn: string;
    authors: string[];
    year: number;
    abstract: string;
    abstractEn: string;
    url: string;
  }>;
  error?: string;
}

interface ArxivSearchPayload {
  entries?: Array<{
    arxivId: string;
    title: string;
    authors: string[];
    abstract: string;
    published: string;
    url: string;
  }>;
  error?: string;
}

interface Filters {
  domain?: string;
  yearMin?: string | number;
  yearMax?: string | number;
  sort?: string;
}

function itemsFromHal(payload: HalSearchPayload): FetchedItem[] {
  return (payload.theses ?? []).map((t) => ({
    externalId: String(t.id ?? "").trim(),
    title: t.title || t.titleEn || "",
    authors: Array.isArray(t.authors) ? t.authors.join("; ") : "",
    year: typeof t.year === "number" && t.year > 0 ? t.year : null,
    url: t.url || "",
    abstract: t.abstract || t.abstractEn || null,
  }));
}

function itemsFromArxiv(payload: ArxivSearchPayload): FetchedItem[] {
  return (payload.entries ?? []).map((e) => ({
    externalId: String(e.arxivId ?? "").trim(),
    title: e.title || "",
    authors: Array.isArray(e.authors) ? e.authors.join("; ") : "",
    year: Number(String(e.published || "").slice(0, 4)) || null,
    url: e.url || "",
    abstract: e.abstract || null,
  }));
}

/** Re-joue EXACTEMENT la recherche stockée (tri inclus) ; défauts sûrs :
 * HAL « publicationDateY_i desc » (défaut de la route, l.59),
 * arXiv « submittedDate » (les nouveautés remontent en tête). */
function buildSourceUrl(
  source: string,
  query: string,
  filters: Filters
): string {
  if (source === "hal") {
    const p = new URLSearchParams({ q: query, rows: String(HAL_ROWS) });
    if (filters.domain) p.set("domain", String(filters.domain));
    if (filters.yearMin) p.set("yearMin", String(filters.yearMin));
    if (filters.yearMax) p.set("yearMax", String(filters.yearMax));
    p.set(
      "sort",
      filters.sort ? String(filters.sort) : "publicationDateY_i desc"
    );
    return `/api/theses-en-ligne/search?${p.toString()}`;
  }
  const p = new URLSearchParams({ q: query, max: String(ARXIV_MAX) });
  p.set("sort", filters.sort === "relevance" ? "relevance" : "submittedDate");
  return `/api/arxiv/search?${p.toString()}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const veille = await db.savedSearch.findUnique({
      where: { id },
      include: { results: { select: { externalId: true } } },
    });
    if (!veille) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }

    let filters: Filters = {};
    try {
      const parsed = JSON.parse(veille.filters || "{}");
      if (parsed && typeof parsed === "object") filters = parsed;
    } catch {
      filters = {};
    }

    const sourceUrl = buildSourceUrl(veille.source, veille.query, filters);
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}${sourceUrl}`, {
      headers: { "User-Agent": "ThesisFrame-Veille/1.0" },
      signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Source ${veille.source} indisponible (HTTP ${res.status})` },
        { status: 502 }
      );
    }
    const payload = await res.json();
    if (payload && payload.error) {
      return NextResponse.json(
        { error: `Source ${veille.source} : ${payload.error}` },
        { status: 502 }
      );
    }

    const fetched =
      veille.source === "hal"
        ? itemsFromHal(payload as HalSearchPayload)
        : itemsFromArxiv(payload as ArxivSearchPayload);

    const storedIds = veille.results.map((r) => r.externalId);
    const { isFirstCheck, newItems } = diffResults(storedIds, fetched);

    if (isFirstCheck) {
      // CA-2.1 : base de référence — insérée « vue » afin qu'aucun résultat
      // existant n'apparaisse comme nouveauté (compteur CA-3.2 à zéro).
      const base = dedupeByExternalId(fetched);
      if (base.length) {
        await db.savedSearchResult.createMany({
          data: base.map((item) => ({
            savedSearchId: veille.id,
            externalId: item.externalId,
            title: item.title,
            authors: item.authors,
            year: item.year,
            url: item.url,
            abstract: item.abstract,
            seen: true,
          })),
        });
      }
    } else if (newItems.length) {
      // CA-2.2 : seuls les inconnus sont insérés, marqués non vus
      // (nouveautés non consultées — compteur CA-3.2). Dédupliqués en amont :
      // skipDuplicates n'est pas supporté par Prisma sur SQLite.
      const fresh = dedupeByExternalId(newItems);
      if (fresh.length) {
        await db.savedSearchResult.createMany({
          data: fresh.map((item) => ({
            savedSearchId: veille.id,
            externalId: item.externalId,
            title: item.title,
            authors: item.authors,
            year: item.year,
            url: item.url,
            abstract: item.abstract,
            seen: false,
          })),
        });
      }
    }

    // Rétention : fenêtre glissante des plus récents (décision n°4).
    const all = await db.savedSearchResult.findMany({
      where: { savedSearchId: veille.id },
      select: { id: true, firstSeenAt: true },
    });
    const keepIds = new Set(
      applyRetention(all, RETENTION_LIMIT).map((r) => r.id)
    );
    const evictedIds = all.filter((r) => !keepIds.has(r.id)).map((r) => r.id);
    if (evictedIds.length) {
      await db.savedSearchResult.deleteMany({
        where: { id: { in: evictedIds } },
      });
    }

    await db.savedSearch.update({
      where: { id: veille.id },
      data: { lastCheckedAt: new Date() },
    });

    const storedTotal = await db.savedSearchResult.count({
      where: { savedSearchId: veille.id },
    });

    return NextResponse.json({
      data: {
        isFirstCheck,
        fetchedCount: fetched.length,
        newCount: isFirstCheck ? 0 : newItems.length,
        evictedCount: evictedIds.length,
        storedTotal,
      },
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    console.error("[POST /api/veille/[id]/check] Error:", error);
    return NextResponse.json(
      {
        error: isTimeout
          ? "Délai dépassé lors de la vérification — réessayez"
          : "Erreur lors de la vérification de la veille",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}

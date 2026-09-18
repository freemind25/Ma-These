// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Exécution d'une vérification de veille
// specs/veille-check-auto — T2 (extrait de /api/veille/[id]/check)
//
// Réutilisable hors requête HTTP : la route de check manuel ET le
// worker de la file de tâches (handler "veille-check") appellent
// cette même séquence — les vérifications automatiques se comportent
// exactement comme les manuelles (CA-2.1 de specs/veille-check-auto).
//
// Auto-fetch de la route de source EXISTANTE (jamais modifiée,
// épinglée par non-régression) : /api/theses-en-ligne/search (rows=50)
// ou /api/arxiv/search (max=30). Diff pur via check-core.
// ═══════════════════════════════════════════════════════════════

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  applyRetention,
  diffResults,
  parseFiltersJson,
  type FetchedItem,
} from "@/lib/veille/check-core";

const CHECK_TIMEOUT_MS = 20_000; // exigence plan : timeout ≤ 20 s
const HAL_ROWS = "50";
const ARXIV_MAX = "30";
const RETENTION_LIMIT = 200; // décision n°4 (specs/veille-academique)

/** La veille demandée n'existe pas — la route répond 404, le worker échoue le job. */
export class VeilleNotFoundError extends Error {
  constructor(id: string) {
    super(`Veille introuvable : ${id}`);
    this.name = "VeilleNotFoundError";
  }
}

/** La source est injoignable ou en erreur — la route répond 502, le worker échoue le job. */
export class SourceFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceFetchError";
  }
}

export interface RunCheckResult {
  isFirstCheck: boolean;
  checkedAt: Date;
  fetchedCount: number;
  added: number;
  newCount: number;
  removedByRetention: number;
  totalResults: number;
  unreadCount: number;
}

/** Construit l'URL interne de la route de source à partir des filtres stockés. */
function buildSourceUrl(
  source: string,
  query: string,
  filters: Record<string, string>,
  origin: string
): string {
  const params = new URLSearchParams({ q: query });
  if (source === "hal") {
    params.set("rows", HAL_ROWS);
    if (filters.domain) params.set("domain", filters.domain);
    if (filters.yearMin) params.set("yearMin", filters.yearMin);
    if (filters.yearMax) params.set("yearMax", filters.yearMax);
    if (filters.sort) params.set("sort", filters.sort);
    return `${origin}/api/theses-en-ligne/search?${params.toString()}`;
  }
  params.set("max", ARXIV_MAX);
  if (filters.sort === "submittedDate" || filters.sort === "relevance") {
    params.set("sort", filters.sort);
  }
  return `${origin}/api/arxiv/search?${params.toString()}`;
}

/** Normalise la réponse de la source vers les FetchedItem purs. */
function normalizeFetched(source: string, payload: unknown): FetchedItem[] {
  const items: FetchedItem[] = [];
  if (!payload || typeof payload !== "object") return items;

  if (source === "hal") {
    const theses = (payload as { theses?: unknown[] }).theses ?? [];
    for (const raw of theses) {
      if (!raw || typeof raw !== "object") continue;
      const t = raw as {
        id?: unknown;
        title?: unknown;
        titleEn?: unknown;
        authors?: unknown;
        year?: unknown;
        url?: unknown;
        abstract?: unknown;
        abstractEn?: unknown;
      };
      const year =
        typeof t.year === "number" && Number.isFinite(t.year) && t.year > 0 ? t.year : null;
      items.push({
        externalId: typeof t.id === "string" ? t.id : String(t.id ?? ""),
        title:
          typeof t.title === "string" && t.title
            ? t.title
            : typeof t.titleEn === "string"
              ? t.titleEn
              : "",
        authors: Array.isArray(t.authors)
          ? t.authors.filter((a) => typeof a === "string").join(" ; ")
          : "",
        year,
        url: typeof t.url === "string" ? t.url : "",
        abstract:
          (typeof t.abstract === "string" && t.abstract) ||
          (typeof t.abstractEn === "string" && t.abstractEn) ||
          null,
      });
    }
    return items;
  }

  const entries = (payload as { entries?: unknown[] }).entries ?? [];
  for (const raw of entries) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as {
      arxivId?: unknown;
      title?: unknown;
      authors?: unknown;
      url?: unknown;
      abstract?: unknown;
      published?: unknown;
    };
    const publishedYear =
      typeof e.published === "string" ? new Date(e.published).getFullYear() : NaN;
    items.push({
      externalId: typeof e.arxivId === "string" ? e.arxivId : String(e.arxivId ?? ""),
      title: typeof e.title === "string" ? e.title : "",
      authors: Array.isArray(e.authors)
        ? e.authors.filter((a) => typeof a === "string").join(" ; ")
        : "",
      year: Number.isFinite(publishedYear) ? publishedYear : null,
      url: typeof e.url === "string" ? e.url : "",
      abstract: typeof e.abstract === "string" && e.abstract ? e.abstract : null,
    });
  }
  return items;
}

// ═══════════════════════════════════════════════════════════════
// runCheckForSavedSearch — séquence complète de vérification :
// 1. charge la veille ; 2. auto-fetch source ; 3. diff pur ;
// 4. insertion (premier contrôle = base de référence sans « nouveau »
//    CA-2.1, sinon inconnus marqués non-vus CA-2.2) ;
// 5. rétention 200 ; 6. lastCheckedAt (CA-2.4).
// Lève VeilleNotFoundError (404) et SourceFetchError (502).
// ═══════════════════════════════════════════════════════════════
export async function runCheckForSavedSearch(
  id: string,
  origin: string
): Promise<RunCheckResult> {
  const search = await db.savedSearch.findUnique({ where: { id } });
  if (!search) throw new VeilleNotFoundError(id);

  // ── Auto-fetch de la route de source existante ──
  const filters = parseFiltersJson(search.filters);
  const sourceUrl = buildSourceUrl(search.source, search.query, filters, origin);

  let response: Response;
  try {
    response = await fetch(sourceUrl, {
      headers: { "User-Agent": "ThesisFrame-Veille/1.0" },
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    console.error("[run-check] source fetch failed:", err);
    throw new SourceFetchError(
      timedOut
        ? `La source ${search.source.toUpperCase()} n'a pas répondu dans le délai imparti (${CHECK_TIMEOUT_MS / 1000} s)`
        : `La source ${search.source.toUpperCase()} est injoignable`
    );
  }

  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new SourceFetchError(
      `Erreur de la source ${search.source.toUpperCase()} (HTTP ${response.status})${detail?.error ? ` : ${detail.error}` : ""}`
    );
  }

  const payload = (await response.json()) as unknown;
  const fetched = normalizeFetched(search.source, payload).filter(
    (item) => item.externalId.trim() !== ""
  );

  // ── Diff pur contre la base stockée ──
  const stored = await db.savedSearchResult.findMany({
    where: { savedSearchId: id },
    select: { externalId: true, seen: true },
  });
  const { isFirstCheck, newItems } = diffResults(stored, fetched);

  // Premier contrôle : TOUT est inséré comme base de référence (seen=true,
  // aucun « nouveau » — CA-2.1). Contrôles suivants : seuls les inconnus,
  // marqués non-vus (CA-2.2).
  const toInsert = isFirstCheck
    ? fetched.map((item) => ({ ...item, seen: true }))
    : newItems.map((item) => ({ ...item, seen: false }));

  let added = 0;
  if (toInsert.length > 0) {
    try {
      const created = await db.savedSearchResult.createMany({
        data: toInsert.map((item) => ({
          savedSearchId: id,
          externalId: item.externalId,
          title: item.title,
          authors: item.authors,
          year: item.year,
          url: item.url,
          abstract: item.abstract,
          seen: item.seen,
        })),
      });
      added = created.count;
    } catch (err) {
      // Course concurrente improbable : P2002 (unicité par veille) →
      // insertion ligne à ligne en ignorant les doublons.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        for (const item of toInsert) {
          const existing = await db.savedSearchResult.findUnique({
            where: {
              savedSearchId_externalId: {
                savedSearchId: id,
                externalId: item.externalId,
              },
            },
            select: { id: true },
          });
          if (existing) continue;
          await db.savedSearchResult.create({
            data: {
              savedSearchId: id,
              externalId: item.externalId,
              title: item.title,
              authors: item.authors,
              year: item.year,
              url: item.url,
              abstract: item.abstract,
              seen: item.seen,
            },
          });
          added += 1;
        }
      } else {
        throw err;
      }
    }
  }

  // ── Rétention : fenêtre glissante 200 (décision n°4) ──
  const allResults = await db.savedSearchResult.findMany({
    where: { savedSearchId: id },
    select: { id: true, firstSeenAt: true },
  });
  const { removed } = applyRetention(allResults, RETENTION_LIMIT);
  if (removed.length > 0) {
    await db.savedSearchResult.deleteMany({
      where: { id: { in: removed.map((r) => r.id) } },
    });
  }

  // ── Horodatage du contrôle (CA-2.4) ──
  // T1b (prod-readiness-audit) : lastCheckedAt est Date | null côté Prisma ; on
  // capture l'horodatage une fois, on l'écrit et on le retourne — mêmes valeurs.
  const checkedAt = new Date();
  await db.savedSearch.update({
    where: { id },
    data: { lastCheckedAt: checkedAt },
  });

  const [totalResults, unreadCount] = await Promise.all([
    db.savedSearchResult.count({ where: { savedSearchId: id } }),
    db.savedSearchResult.count({ where: { savedSearchId: id, seen: false } }),
  ]);

  return {
    isFirstCheck,
    checkedAt,
    fetchedCount: fetched.length,
    added,
    newCount: newItems.length,
    removedByRetention: removed.length,
    totalResults,
    unreadCount,
  };
}

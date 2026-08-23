// ═══════════════════════════════════════════════════════════════
// CORE.ac.uk API v3 Client
// API d'accès aux articles de recherche en open access
// ═══════════════════════════════════════════════════════════════

const CORE_BASE = "https://api.core.ac.uk/v3";
const CORE_API_KEY = process.env.CORE_API_KEY || "";

// ── Types ───────────────────────────────────────────────────────

export interface CoreAuthor {
  name: string;
}

export interface CoreDataProvider {
  id: number;
  name: string;
  url: string;
  logo?: string;
}

export interface CoreIdentifier {
  identifier: string;
  type: string;
}

export interface CoreLink {
  type: string;
  url: string;
}

export interface CoreWork {
  id: number;
  title: string;
  abstract?: string;
  authors: CoreAuthor[];
  yearPublished?: number;
  publishedDate?: string;
  doi?: string;
  downloadUrl?: string;
  fieldOfStudy?: string;
  documentType?: string;
  citationCount: number;
  sourceFulltextUrls: string[];
  fullText?: string;
  dataProviders: CoreDataProvider[];
  identifiers: CoreIdentifier[];
  links: CoreLink[];
  journals: Array<{
    title?: string;
    volume?: string;
    pages?: string;
  }>;
}

export interface CoreSearchResponse {
  totalHits: number;
  limit: number;
  offset: number;
  results: CoreWork[];
}

export interface CoreSearchParams {
  q: string;
  limit?: number;
  offset?: number;
  entities?: boolean;
}

// ── Helper ───────────────────────────────────────────────────────

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (CORE_API_KEY) {
    h["Authorization"] = `Bearer ${CORE_API_KEY}`;
  }
  return h;
}

// ── API Methods ──────────────────────────────────────────────────

/**
 * Search works on CORE (open access research papers).
 * API docs: https://api.core.ac.uk/docs/v3
 *
 * @param query - Search query string
 * @param limit - Max results (1-100, default 10)
 * @param offset - Pagination offset (default 0)
 * @returns Search response with results array
 */
export async function searchWorks(
  query: string,
  limit = 10,
  offset = 0,
): Promise<CoreSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    offset: String(offset),
  });

  // NOTE: CORE API requires trailing slash on search endpoint
  const res = await fetch(`${CORE_BASE}/search/works/?${params}`, {
    headers: headers(),
    next: { revalidate: 300 }, // 5 min cache
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `CORE API error ${res.status}: ${text || res.statusText}`,
    );
  }

  return res.json() as Promise<CoreSearchResponse>;
}

/**
 * Get a single work by its CORE ID.
 */
export async function getWorkById(id: number): Promise<CoreWork> {
  const res = await fetch(`${CORE_BASE}/works/${id}`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `CORE API error ${res.status}: ${text || res.statusText}`,
    );
  }

  return res.json() as Promise<CoreWork>;
}

/**
 * Get the raw PDF text of a work (if fullText is available).
 */
export async function getWorkFullText(id: number): Promise<string> {
  const work = await getWorkById(id);
  return work.fullText || "";
}

/**
 * Get multiple works by their IDs in a single request.
 */
export async function getWorksByIds(
  ids: number[],
): Promise<CoreWork[]> {
  if (ids.length === 0) return [];

  // Batch: up to 50 IDs per request (CORE limit)
  const batchSize = 50;
  const allWorks: CoreWork[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const idParams = batch.join(",");

    const res = await fetch(`${CORE_BASE}/works/${idParams}`, {
      headers: headers(),
    });

    if (res.ok) {
      const data = (await res.json()) as CoreWork[];
      allWorks.push(...data);
    }
  }

  return allWorks;
}

// ── Convenience: format a CoreWork for citation ──────────────────

export function formatCoreWorkCitation(work: CoreWork): string {
  const authors = work.authors.map((a) => a.name).join(", ");
  const year = work.yearPublished || "s.d.";
  const title = work.title || "Sans titre";
  const doi = work.doi ? ` \nDOI: ${work.doi}` : "";
  const url = `https://core.ac.uk/works/${work.id}`;
  const journal = work.journals?.[0]?.title || "";
  const venue = journal ? ` — ${journal}` : "";

  return `${authors} (${year}). ${title}${venue}.${doi}\nURL: ${url}`;
}

/**
 * Extract a compact summary from a CoreWork for AI context.
 */
export function coreWorkToSummary(work: CoreWork): {
  title: string;
  authors: string;
  year: string;
  abstract: string;
  doi: string;
  url: string;
  citations: number;
} {
  return {
    title: work.title || "",
    authors: work.authors.map((a) => a.name).join(", "),
    year: String(work.yearPublished || ""),
    abstract: (work.abstract || "").substring(0, 2000),
    doi: work.doi || "",
    url: `https://core.ac.uk/works/${work.id}`,
    citations: work.citationCount || 0,
  };
}

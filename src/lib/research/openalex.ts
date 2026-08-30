// ═══════════════════════════════════════════════════════════════
// ThesisFrame — OpenAlex API Client
// Inspiration : pattern retriever académique de gpt-researcher (Apache 2.0)
// Aucun code copié — architecture inspirée, implémentation originale
// Licence gpt-researcher : Apache 2.0 (attribution obligatoire si copie de code)
// Règle #11 : ressource externe = inspiration format/pattern, pas contenu
// ═══════════════════════════════════════════════════════════════

const OPENALEX_BASE = "https://api.openalex.org";

// Politesse : OpenAlex recommande un paramètre mailto dans User-Agent
const POLITE_MAILTO = "thesisframe@research-tool.dev";

// Timeout & retry configuration
const OPENALEX_TIMEOUT_MS = 15_000;
const OPENALEX_MAX_RETRIES = 2;
const OPENALEX_RETRY_BASE_MS = 1_000;

// ── Types ───────────────────────────────────────────────────────

export interface OpenAlexInstitution {
  id: string;
  display_name: string;
  country_code?: string;
  type?: string;
}

export interface OpenAlexAuthor {
  id?: string;
  name?: string;
  display_name?: string;
  orcid?: string;
  institution?: OpenAlexInstitution;
}

export interface OpenAlexAuthorship {
  author: OpenAlexAuthor;
  institutions?: OpenAlexInstitution[];
}

export interface OpenAlexVenue {
  id?: string;
  display_name?: string;
  publisher?: string;
  issn?: string[];
  is_oa?: boolean;
  type?: string;
}

export interface OpenAlexConcept {
  id: string;
  display_name: string;
  score: number;
}

export interface OpenAlexTopic {
  id: string;
  display_name: string;
  score: number;
  subfield?: { display_name: string };
  field?: { display_name: string };
  domain?: { display_name: string };
}

export interface OpenAlexPrimaryLocation {
  source?: OpenAlexVenue;
  pdf_url?: string;
  landing_page_url?: string;
}

export interface OpenAlexKeyword {
  display_name: string;
}

export interface OpenAlexWork {
  id: string; // "https://openalex.org/W1234567890"
  doi?: string; // "https://doi.org/10.xxxx/xxxxx"
  title?: string;
  display_name?: string;
  publication_date?: string; // "2023-05-15"
  publication_year?: number;
  type?: string; // "journal-article", "proceedings", etc.
  cited_by_count?: number;
  is_retracted?: boolean;
  is_paratext?: boolean;
  open_access?: {
    is_oa: boolean;
    oa_status?: string; // "gold", "green", "bronze", "closed"
    oa_url?: string;
  };
  authorships?: OpenAlexAuthorship[];
  primary_location?: OpenAlexPrimaryLocation;
  concepts?: OpenAlexConcept[];
  abstract_inverted_index?: Record<string, number[]>;
  referenced_works_count?: number;
  keywords?: OpenAlexKeyword[]; // Déprécié mais encore retourné
  topics?: OpenAlexTopic[];
}

export interface OpenAlexGroupBy {
  key: string;
  key_display_name: string;
  count: number;
}

export interface OpenAlexSearchResult {
  meta: {
    count: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  results: OpenAlexWork[];
  group_by?: OpenAlexGroupBy[];
}

export interface OpenAlexSearchParams {
  query?: string;
  filter?: Record<string, string | string[]>;
  sort?: string; // "cited_by_count:desc", "publication_date:desc"
  limit?: number; // 1-200 (default 25)
  offset?: number;
  sample?: number;
  select?: string[];
}

export interface CuratedWork {
  id: string;
  doi: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  citedByCount: number;
  openAccessUrl: string;
  abstract: string;
  oaStatus: string;
  type: string;
  concepts: string[];
  openalexId: string;
  // Curation scores
  curationScore: number;
  curationDetails: CurationDetails;
}

export interface CurationDetails {
  hasDoi: boolean;
  isPeerReviewed: boolean;
  venueIdentified: boolean;
  citationScore: number;
  recencyScore: number;
  oaScore: number;
  typeScore: number;
}

// ── Helper : User-Agent poli ──────────────────────────────────────

function headers(): Record<string, string> {
  return {
    "User-Agent": `ThesisFrame/1.0 (mailto:${POLITE_MAILTO})`,
    Accept: "application/json",
  };
}

// ── Abstract reconstruction ──────────────────────────────────────

/**
 * OpenAlex retourne l'abstract sous forme d'index inversé :
 * { "Word": [position1, position2], "another": [position3] }
 * Cette fonction le reconstruit en texte lisible.
 */
function reconstructAbstract(
  invertedIndex: Record<string, number[]> | undefined,
): string {
  if (!invertedIndex || Object.keys(invertedIndex).length === 0) {
    return "";
  }

  const wordPositions: Array<{ word: string; pos: number }> = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordPositions.push({ word, pos });
    }
  }

  wordPositions.sort((a, b) => a.pos - b.pos);

  return wordPositions.map((wp) => wp.word).join(" ");
}

// ── Fetch with timeout & retry ─────────────────────────────────

/**
 * Fetch wrapper with AbortSignal.timeout and exponential backoff retry.
 * Retries on network errors and 429/5xx responses.
 * Backoff: 1s, 2s (OPENALEX_RETRY_BASE_MS * 2^attempt).
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retryCount = OPENALEX_MAX_RETRIES,
): Promise<Response> {
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(OPENALEX_TIMEOUT_MS),
      });

      // Retry on 429 (rate limit) or 5xx (server error)
      if (res.status === 429 || res.status >= 500) {
        if (attempt < retryCount) {
          const delay = OPENALEX_RETRY_BASE_MS * Math.pow(2, attempt);
          console.warn(`[OpenAlex] ${res.status} — retry ${attempt + 1}/${retryCount} in ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }

      return res;
    } catch (err) {
      // TimeoutError (DOMException with name "TimeoutError") or network errors
      const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
      if (attempt < retryCount && (isTimeout || err instanceof TypeError)) {
        const delay = OPENALEX_RETRY_BASE_MS * Math.pow(2, attempt);
        console.warn(`[OpenAlex] ${isTimeout ? "timeout" : "network error"} — retry ${attempt + 1}/${retryCount} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("[OpenAlex] Épuisement des tentatives");
}

// ── API Methods ──────────────────────────────────────────────────

/**
 * Recherche de travaux académiques sur OpenAlex.
 * API : https://docs.openalex.org/
 *
 * @param params - Paramètres de recherche
 * @returns Résultats avec métadonnées
 */
export async function searchWorks(
  params: OpenAlexSearchParams,
): Promise<OpenAlexSearchResult> {
  const url = new URL(`${OPENALEX_BASE}/works`);

  if (params.query) {
    url.searchParams.set("search", params.query);
  }

  // Filtres OpenAlex : filter=type:journal-article,from_publication_date:2020-01-01
  if (params.filter && Object.keys(params.filter).length > 0) {
    const filterStr = Object.entries(params.filter)
      .map(([key, val]) => {
        if (Array.isArray(val)) return val.map((v) => `${key}:${v}`).join(",");
        return `${key}:${val}`;
      })
      .join(",");
    url.searchParams.set("filter", filterStr);
  }

  if (params.sort) {
    url.searchParams.set("sort", params.sort);
  }

  url.searchParams.set("per_page", String(Math.min(params.limit || 25, 200)));
  url.searchParams.set("offset", String(params.offset || 0));

  if (params.sample) {
    url.searchParams.set("sample", String(params.sample));
  }

  if (params.select && params.select.length > 0) {
    url.searchParams.set("select", params.select.join(","));
  }

  // Pool poli OpenAlex : le paramètre mailto donne un quota plus élevé
  url.searchParams.set("mailto", POLITE_MAILTO);

  const res = await fetchWithRetry(url.toString(), {
    headers: headers(),
    next: { revalidate: 300 }, // 5 min cache
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenAlex API erreur ${res.status}: ${text || res.statusText}`,
    );
  }

  return res.json() as Promise<OpenAlexSearchResult>;
}

/**
 * Récupère les travaux liés à un travail donné (snowballing citationnel).
 * Endpoint : /works/{id}/related
 *
 * GARDE-FOU COÛT : plafonné à max(200) résultats.
 * Ce n'est PAS une récursion — un seul appel par invocation.
 * Pour une récursion multi-niveaux (non implémenté),
 * il faudrait un budget d'appels et un circuit breaker.
 */
export async function getRelatedWorks(
  openalexId: string,
  limit = 10,
): Promise<OpenAlexSearchResult> {
  // L'ID peut être complet (https://openalex.org/W123) ou court (W123)
  const shortId = openalexId.replace("https://openalex.org/", "");
  const url = `${OPENALEX_BASE}/works/${shortId}/related`;
  const params = new URLSearchParams({
    per_page: String(Math.min(limit, 200)),
  });

  const res = await fetchWithRetry(`${url}?${params}`, {
    headers: headers(),
    next: { revalidate: 600 }, // 10 min cache
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenAlex related works erreur ${res.status}: ${text || res.statusText}`,
    );
  }

  return res.json() as Promise<OpenAlexSearchResult>;
}

/**
 * Recherche académique préconfigurée pour ThesisFrame.
 * Filtres par défaut : journal-article ou proceedings, pas de paratexte.
 *
 * @param query - Requête en anglais (recommandé) ou français
 * @param options - Options supplémentaires
 * @returns Liste de travaux bruts OpenAlex
 */
export async function searchAcademicWorks(
  query: string,
  options?: {
    limit?: number;
    sort?: string;
    fromYear?: number;
    toYear?: number;
  },
): Promise<OpenAlexWork[]> {
  const filter: Record<string, string | string[]> = {
    type: ["journal-article", "proceedings-article"],
    is_paratext: "false",
  };

  if (options?.fromYear) {
    filter.from_publication_date = `${options.fromYear}-01-01`;
  }
  if (options?.toYear) {
    filter.to_publication_date = `${options.toYear}-12-31`;
  }

  const result = await searchWorks({
    query,
    filter,
    sort: options?.sort || "cited_by_count:desc",
    limit: options?.limit || 20,
  });

  return result.results;
}

// ── Formatage pour citation / contexte IA ────────────────────────

/**
 * Convertit un OpenAlexWork en objet formaté pour le contexte IA.
 */
export function openAlexWorkToFormatted(work: OpenAlexWork): {
  id: string;
  title: string;
  doi: string;
  authors: string;
  year: number;
  venue: string;
  citedByCount: number;
  openAccessUrl: string;
  abstract: string;
  oaStatus: string;
  type: string;
  concepts: string[];
  openalexId: string;
} {
  const authors = (work.authorships || [])
    .map((a) => a.author?.display_name || a.author?.name || "")
    .filter(Boolean)
    .join(", ");

  const venue = work.primary_location?.source?.display_name || "";
  const oaUrl =
    work.open_access?.oa_url ||
    work.primary_location?.pdf_url ||
    "";

  const concepts = (work.topics || work.concepts || [])
    .slice(0, 5)
    .map((c) => c.display_name);

  return {
    id: work.id,
    title: work.title || work.display_name || "",
    doi: work.doi || "",
    authors,
    year: work.publication_year ||
    (work.publication_date ? parseInt(work.publication_date.substring(0, 4), 10) : 0),
    venue,
    citedByCount: work.cited_by_count || 0,
    openAccessUrl: oaUrl,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    oaStatus: work.open_access?.oa_status || "closed",
    type: work.type || "",
    concepts,
    openalexId: work.id,
  };
}

/**
 * Formate une liste de travaux pour injection dans un prompt.
 * Format compact avec toutes les métadonnées utiles.
 */
export function formatWorksForPrompt(works: CuratedWork[]): string {
  return works
    .map((w, i) => {
      const parts = [
        `[${i + 1}] ${w.authors} (${w.year}). ${w.title}`,
      ];
      if (w.venue) parts.push(`   Venue : ${w.venue}`);
      if (w.doi) parts.push(`   DOI : ${w.doi}`);
      if (w.citedByCount > 0) parts.push(`   Citations : ${w.citedByCount}`);
      if (w.oaStatus !== "closed") parts.push(`   OA : ${w.oaStatus}`);
      if (w.openAccessUrl) parts.push(`   URL : ${w.openAccessUrl}`);
      if (w.abstract) parts.push(`   Résumé : ${w.abstract.substring(0, 1500)}`);
      return parts.join("\n");
    })
    .join("\n\n");
}

/**
 * Formate une liste de travaux pour la liste de références.
 */
export function formatWorksAsReferences(works: CuratedWork[]): string {
  return works
    .map(
      (w, i) =>
        `[${i + 1}] ${w.authors} (${w.year}). ${w.title}.${w.venue ? ` ${w.venue}.` : ""}${w.doi ? ` ${w.doi}` : ""}`,
    )
    .join("\n");
}

// ── Re-exports pour compatibilité avec curation ──────────────────

export { reconstructAbstract };

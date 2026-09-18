// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Repli académique automatique (A.2, annexe technique)
// OpenAlex indisponible (429 / budget épuisé) → bascule automatique
// vers CrossRef + HAL avec triangulation des DOI, puis curation
// déterministe identique (curateWorks).
// Les deux registres sont publics et sans clé API.
// ═══════════════════════════════════════════════════════════════

import {
  curateWorks,
  curationSummary,
  CURATION_THRESHOLD_ACCEPTABLE,
} from "./curation";
import type { OpenAlexWork, CuratedWork } from "./openalex";

const CROSSREF_BASE = "https://api.crossref.org/works";
const HAL_BASE = "https://api.archives-ouvertes.fr/search/";
const FALLBACK_MAILTO = "thesisframe@research-tool.dev";
const FALLBACK_TIMEOUT_MS = 15_000;

// ── Types internes ───────────────────────────────────────────────

interface CrossRefItem {
  DOI?: string;
  title?: string[];
  author?: Array<{ given?: string; family?: string; name?: string }>;
  issued?: { "date-parts"?: Array<Array<number | null>> };
  "container-title"?: string[];
  "is-referenced-by-count"?: number;
  type?: string;
  abstract?: string;
}

export interface FallbackSearchOutcome {
  works: CuratedWork[];
  /** Nombre de DOI retrouvés dans les DEUX registres (triangulation) */
  corroboratedDois: number;
  /** Répartition brute par registre, pour la traçabilité */
  crossRefHits: number;
  halHits: number;
  errors: string[];
}

// ── Helpers ──────────────────────────────────────────────────────

/** Reconstruit un index inversé façon OpenAlex à partir d'un texte simple,
 *  afin de réutiliser la curation existante sans duplication. */
function textToInvertedIndex(text: string): Record<string, number[]> {
  const index: Record<string, number[]> = {};
  const words = text
    .replace(/<[^>]+>/g, " ") // dépouille le JATS/XML éventuel de CrossRef
    .split(/\s+/)
    .filter(Boolean);
  words.forEach((word, position) => {
    (index[word] ||= []).push(position);
  });
  return index;
}

/** Normalise un DOI pour la déduplication et la triangulation. */
function normalizeDoi(doi: string | undefined): string {
  if (!doi) return "";
  return doi
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "")
    .trim();
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": `ThesisFrame/1.0 (mailto:${FALLBACK_MAILTO})`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(FALLBACK_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} sur ${new URL(url).host}`);
  }
  return res.json();
}

// ── Garde HAL ────────────────────────────────────────────────────────
// Comportement constaté en conditions réelles (preuve A.2) : HAL répond
// 200 + numFound:0 — SANS erreur — lorsque des requêtes arrivent trop
// rapprochées depuis la même IP (cadence < ~4 s). Correction à la racine :
// (1) sérialisation des appels HAL (porte d'exclusion),
// (2) cadence minimale entre débuts d'appels,
// (3) reprise unique après backoff si le résultat est vide.
let halGate: Promise<unknown> = Promise.resolve();
const HAL_MIN_INTERVAL_MS = 4_000;
let halLastStart = 0;

function withHalGate<T>(task: () => Promise<T>): Promise<T> {
  const run = halGate.then(task, task);
  halGate = run.catch(() => undefined);
  return run;
}

async function searchHalWithGuard(query: string, limit: number): Promise<OpenAlexWork[]> {
  return withHalGate(async () => {
    // Respecte la cadence minimale depuis le dernier appel HAL lancé
    const wait = Math.max(0, halLastStart + HAL_MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    halLastStart = Date.now();

    const first = await searchHal(query, limit);
    if (first.length > 0) return first;

    // Résultat vide : possiblement un étranglement HAL — reprise unique espacée
    await new Promise((r) => setTimeout(r, HAL_MIN_INTERVAL_MS));
    halLastStart = Date.now();
    return searchHal(query, limit);
  });
}

// ── CrossRef ─────────────────────────────────────────────────────

async function searchCrossRef(query: string, limit: number): Promise<OpenAlexWork[]> {
  const url = new URL(CROSSREF_BASE);
  url.searchParams.set("query", query);
  url.searchParams.set("rows", String(Math.min(limit, 25)));
  url.searchParams.set(
    "select",
    "DOI,title,author,issued,container-title,is-referenced-by-count,type,abstract"
  );
  url.searchParams.set("mailto", FALLBACK_MAILTO);

  const data = (await fetchJson(url.toString())) as {
    message?: { items?: CrossRefItem[] };
  };
  const items = data.message?.items || [];

  return items
    .filter((item) => item.title && item.title.length > 0)
    .map((item) => {
      const year = item.issued?.["date-parts"]?.[0]?.[0];
      const authors = (item.author || [])
        .map((a) =>
          a.name || [a.given, a.family].filter(Boolean).join(" ")
        )
        .filter(Boolean);

      const work: OpenAlexWork = {
        id: `crossref-${(item.DOI || "").toLowerCase()}`,
        doi: item.DOI ? `https://doi.org/${item.DOI}` : undefined,
        display_name: item.title?.[0] || "",
        publication_year: year || undefined,
        type: item.type || "article",
        cited_by_count: item["is-referenced-by-count"] || 0,
        authorships: authors.map((name) => ({ author: { display_name: name } })),
        primary_location: {
          source: item["container-title"]?.[0]
            ? { display_name: item["container-title"][0] }
            : undefined,
        },
        abstract_inverted_index: item.abstract
          ? textToInvertedIndex(item.abstract)
          : undefined,
      };
      return work;
    });
}

// ── HAL ──────────────────────────────────────────────────────────

// Même construction d'URL corrigée que la route A.1 : fq répétés via
// append(), tri avec espace encodé %20.
async function searchHal(query: string, limit: number): Promise<OpenAlexWork[]> {
  const params = new URLSearchParams({
    q: query,
    rows: String(Math.min(limit, 25)),
    fl: [
      "docid",
      "title_s",
      "authFullName_s",
      "publicationDateY_i",
      "doiId_s",
      "uri_s",
      "abstract_s",
      "docType_s",
    ].join(","),
    wt: "json",
  });
  params.append("fq", "docType_s:THESE OR docType_s:ART OR docType_s:COMM OR docType_s:COUV");
  params.set("sort", "score desc");

  const url = `${HAL_BASE}?${params.toString().replace(/\+/g, "%20")}`;

  interface HalDoc {
    docid?: string;
    title_s?: string[];
    authFullName_s?: string[];
    publicationDateY_i?: number;
    doiId_s?: string;
    uri_s?: string;
    abstract_s?: string[];
    docType_s?: string[];
  }

  const data = (await fetchJson(url)) as { response?: { docs?: HalDoc[] } };
  const docs = data.response?.docs || [];

  const typeMap: Record<string, string> = {
    THESE: "dissertation",
    ART: "journal-article",
    COMM: "proceedings-article",
    COUV: "book-chapter",
  };

  return docs
    .filter((doc) => doc.title_s && doc.title_s.length > 0)
    .map((doc) => {
      const halType = (doc.docType_s || [])[0] || "";
      return {
        id: `hal-${doc.docid || crypto.randomUUID()}`,
        doi: doc.doiId_s ? `https://doi.org/${doc.doiId_s}` : undefined,
        display_name: doc.title_s?.[0] || "",
        publication_year: doc.publicationDateY_i || undefined,
        type: typeMap[halType] || "article",
        cited_by_count: 0, // HAL n'expose pas de compteur de citations
        authorships: (doc.authFullName_s || []).map((name) => ({
          author: { display_name: name },
        })),
        primary_location: {
          source: doc.uri_s
            ? { display_name: "HAL archives-ouvertes" }
            : undefined,
          pdf_url: doc.uri_s,
        },
        open_access: { is_oa: true, oa_status: "green" },
        abstract_inverted_index: doc.abstract_s?.[0]
          ? textToInvertedIndex(doc.abstract_s[0])
          : undefined,
      } satisfies OpenAlexWork;
    });
}

// ── Triangulation + curation ─────────────────────────────────────

/**
 * Recherche de repli : interroge CrossRef ET HAL pour chaque sous-requête,
 * déduplique par DOI normalisé, triangule (DOI présents dans les deux
 * registres) puis applique la curation déterministe identique à OpenAlex.
 */
export async function fallbackAcademicSearch(
  subQueries: Array<{ query: string }>,
  options?: { limitPerQuery?: number }
): Promise<FallbackSearchOutcome> {
  const limitPerQuery = options?.limitPerQuery || 15;
  const errors: string[] = [];

  const perQuery = subQueries.slice(0, 4).map(async (sq) => {
    const [crossRefRes, halRes] = await Promise.allSettled([
      searchCrossRef(sq.query, limitPerQuery),
      // A.2 : HAL est sérialisé + repris si vide (comportement 200/numFound:0 constaté)
      searchHalWithGuard(sq.query, limitPerQuery),
    ]);

    const crossRefWorks = crossRefRes.status === "fulfilled" ? crossRefRes.value : [];
    const halWorks = halRes.status === "fulfilled" ? halRes.value : [];

    if (crossRefRes.status === "rejected") {
      errors.push(`CrossRef: ${String(crossRefRes.reason?.message || crossRefRes.reason)}`);
    }
    if (halRes.status === "rejected") {
      errors.push(`HAL: ${String(halRes.reason?.message || halRes.reason)}`);
    }

    // Déduplication intra-requête par DOI (et par titre normalisé en secours)
    const byDoi = new Map<string, OpenAlexWork>();
    const byTitle = new Set<string>();

    for (const work of [...crossRefWorks, ...halWorks]) {
      const doi = normalizeDoi(work.doi);
      const titleKey = (work.display_name || "").toLowerCase().replace(/\s+/g, " ").trim();
      if (doi) {
        if (!byDoi.has(doi)) byDoi.set(doi, work);
      } else if (titleKey && !byTitle.has(titleKey)) {
        byTitle.add(titleKey);
        byDoi.set(`no-doi-${byDoi.size}`, work);
      }
    }
    return [...byDoi.values()];
  });

  const perQueryResults = await Promise.all(perQuery);

  // Déduplication inter-requêtes
  const allWorks: OpenAlexWork[] = [];
  const seenDois = new Set<string>();
  const seenTitles = new Set<string>();
  for (const works of perQueryResults) {
    for (const work of works) {
      const doi = normalizeDoi(work.doi);
      const titleKey = (work.display_name || "").toLowerCase().replace(/\s+/g, " ").trim();
      if (doi) {
        if (seenDois.has(doi)) continue;
        seenDois.add(doi);
      } else {
        if (seenTitles.has(titleKey)) continue;
        seenTitles.add(titleKey);
      }
      allWorks.push(work);
    }
  }

  // Triangulation : DOI corroborés par les deux registres (préfixes d'id distincts)
  const doiSources = new Map<string, Set<string>>();
  for (const works of perQueryResults) {
    for (const work of works) {
      const doi = normalizeDoi(work.doi);
      if (!doi) continue;
      const registry = work.id.startsWith("crossref-") ? "crossref" : "hal";
      let registries = doiSources.get(doi);
      if (!registries) {
        registries = new Set<string>();
        doiSources.set(doi, registries);
      }
      registries.add(registry);
    }
  }
  let corroboratedDois = 0;
  for (const registries of doiSources.values()) {
    if (registries.has("crossref") && registries.has("hal")) corroboratedDois++;
  }

  // Curation déterministe — le même pipeline qu'OpenAlex
  const curated = curateWorks(allWorks, {
    maxResults: 15,
    minScore: CURATION_THRESHOLD_ACCEPTABLE,
  });

  return {
    works: curated,
    corroboratedDois,
    crossRefHits: allWorks.filter((w) => w.id.startsWith("crossref-")).length,
    halHits: allWorks.filter((w) => w.id.startsWith("hal-")).length,
    errors,
  };
}

/** Résumé compact pour les logs et la réponse API. */
export function fallbackSummary(outcome: FallbackSearchOutcome): string {
  const s = curationSummary(outcome.works);
  return `repli CrossRef+HAL : ${s.total} sources curées (${outcome.crossRefHits} CrossRef, ${outcome.halHits} HAL), ${outcome.corroboratedDois} DOI corroborés, score moyen ${s.avgScore}`;
}

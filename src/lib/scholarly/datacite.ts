// ═══════════════════════════════════════════════════════════════
// Ma Thèse — DataCite (v1.10.16)
// DOI de jeux de données, logiciels, prépublications (Zenodo, figshare,
// Mendeley Data, GBIF, OSF…) — Crossref ne couvre PAS ces DOI.
// API : https://support.datacite.org/docs/rest-api — sans clé.
// Sondé le 2026-10-31 : HTTP 200 via Node fetch (undici), CORS n/a (côté serveur).
// ═══════════════════════════════════════════════════════════════

import { normalizeDoi, scholarlyJsonFetch } from "./http";

const DATACITE_BASE = "https://api.datacite.org";

export interface DataciteWork {
  doi: string;
  title?: string;
  authors: string[];
  year?: number;
  publisher?: string;
  /** resourceTypeGeneral DataCite : Dataset, Software, Text, Image… */
  resourceType?: string;
  url?: string;
}

// ── Réponses API (JSON:API) ──

interface DataciteCreator {
  name?: string;
  givenName?: string;
  familyName?: string;
  nameType?: string;
}

interface DataciteAttributes {
  doi?: string;
  titles?: Array<{ title?: string }>;
  creators?: DataciteCreator[];
  publicationYear?: number;
  publisher?: string;
  types?: { resourceTypeGeneral?: string; resourceType?: string };
  url?: string;
}

interface DataciteDoiResponse {
  data?: { id?: string; attributes?: DataciteAttributes };
}

interface DataciteSearchResponse {
  data?: Array<{ id?: string; attributes?: DataciteAttributes }>;
}

// ── Normalisation ──

function formatCreator(c: DataciteCreator): string {
  if (c.familyName || c.givenName) {
    return [c.familyName, c.givenName].filter(Boolean).join(", ");
  }
  return c.name ?? "";
}

function toWork(attrs: DataciteAttributes, fallbackDoi: string): DataciteWork {
  return {
    doi: attrs.doi ?? fallbackDoi,
    title: attrs.titles?.[0]?.title,
    authors: (attrs.creators ?? [])
      .map(formatCreator)
      .filter((a) => a.length > 0)
      .slice(0, 8),
    year: attrs.publicationYear,
    publisher: attrs.publisher,
    resourceType: attrs.types?.resourceTypeGeneral ?? attrs.types?.resourceType,
    url: attrs.url ?? undefined,
  };
}

// ── API publique ──

/** Recherche un DOI dans DataCite — null si absent (404) ou réseau indisponible */
export async function lookupDataciteByDoi(doi: string): Promise<DataciteWork | null> {
  const d = normalizeDoi(doi);
  if (!/^10\.\d{4,}\//.test(d)) return null;
  const data = await scholarlyJsonFetch<DataciteDoiResponse>(
    `${DATACITE_BASE}/dois/${encodeURIComponent(d)}`
  );
  const attrs = data?.data?.attributes;
  if (!attrs) return null;
  return toWork(attrs, d);
}

/** Recherche par titre dans DataCite — tableau (0..n) */
export async function searchDataciteByTitle(title: string, limit = 3): Promise<DataciteWork[]> {
  const q = title.trim();
  if (q.length < 5) return [];
  const data = await scholarlyJsonFetch<DataciteSearchResponse>(
    `${DATACITE_BASE}/dois?query=${encodeURIComponent(q)}&page[size]=${limit}`
  );
  return (data?.data ?? [])
    .filter((item) => item.attributes?.doi)
    .map((item) => toWork(item.attributes as DataciteAttributes, item.id ?? ""));
}

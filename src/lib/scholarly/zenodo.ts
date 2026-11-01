// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Zenodo (v1.10.18)
// Dépôt open science du CERN : jeux de données, prépublications,
// rapports, thèses, logiciels — chaque dépôt reçoit un DOI DataCite.
// Complète DataCite avec la recherche plein-texte et les métadonnées riches.
// API : https://zenodo.org/api/records — lecture sans clé.
// Sondé le 2026-11-01 : HTTP 200 via Node fetch (undici) ;
// recherche par DOI : q=doi:"10.5281/…" (DOI brut seul → HTTP 500).
// ═══════════════════════════════════════════════════════════════

import { normalizeDoi, scholarlyJsonFetch } from "./http";

const ZENODO_BASE = "https://zenodo.org/api/records";

export interface ZenodoRecord {
  doi?: string;
  title?: string;
  authors: string[];
  year?: number;
  resourceType?: string;
  url?: string;
}

// ── Réponses API ──

interface ZenodoHit {
  doi?: string;
  metadata?: {
    title?: string;
    publication_date?: string;
    resource_type?: { title?: string; type?: string };
    creators?: Array<{ name?: string }>;
  };
  links?: { self_html?: string };
  doi_url?: string;
}

interface ZenodoSearchResponse {
  hits?: { total?: number; hits?: ZenodoHit[] };
}

// ── Normalisation ──

function toRecord(hit: ZenodoHit): ZenodoRecord {
  const year = hit.metadata?.publication_date?.match(/\d{4}/)?.[0];
  return {
    doi: hit.doi,
    title: hit.metadata?.title,
    authors: (hit.metadata?.creators ?? [])
      .map((c) => c.name ?? "")
      .filter((n) => n.length > 0)
      .slice(0, 8),
    year: year ? parseInt(year) : undefined,
    resourceType: hit.metadata?.resource_type?.title ?? hit.metadata?.resource_type?.type,
    url: hit.links?.self_html ?? hit.doi_url ?? (hit.doi ? `https://doi.org/${hit.doi}` : undefined),
  };
}

// ── API publique ──

/** Recherche un DOI Zenodo — null si absent (pas un DOI Zenodo) ou réseau indisponible */
export async function lookupZenodoByDoi(doi: string): Promise<ZenodoRecord | null> {
  const d = normalizeDoi(doi);
  if (!/^10\.5281\//.test(d)) return null; // préfixe DataCite/Zenodo uniquement
  const data = await scholarlyJsonFetch<ZenodoSearchResponse>(
    `${ZENODO_BASE}?q=${encodeURIComponent(`doi:"${d}"`)}&size=1`
  );
  const hit = data?.hits?.hits?.[0];
  return hit ? toRecord(hit) : null;
}

/** Recherche par titre dans Zenodo — tableau (0..n) */
export async function searchZenodoByTitle(title: string, limit = 1): Promise<ZenodoRecord[]> {
  const q = title.replace(/["\\]/g, " ").trim();
  if (q.length < 5) return [];
  const data = await scholarlyJsonFetch<ZenodoSearchResponse>(
    `${ZENODO_BASE}?q=${encodeURIComponent(`title:"${q}"`)}&size=${limit}`
  );
  return (data?.hits?.hits ?? []).map(toRecord);
}

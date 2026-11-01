// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Europe PMC (v1.10.18)
// Littérature biomédicale et des sciences de la vie (EBI) :
// sur-ensemble de PubMed (PMID) + prépublications + textes intégraux
// (PMC) + comptes de citations et statut OA natifs.
// API : https://europepmc.org/restful_api — sans clé.
// Sondé le 2026-11-01 : HTTP 200 via Node fetch (undici), JSON propre ;
// resultType=core → isOpenAccess (« Y »/« N »), citedByCount, pmid/pmcid.
// ═══════════════════════════════════════════════════════════════

import { normalizeDoi, scholarlyJsonFetch } from "./http";

const EPMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

export interface EpmcRecord {
  doi?: string;
  title?: string;
  authors: string[];
  year?: number;
  journal?: string;
  pmid?: string;
  pmcid?: string;
  isOpenAccess?: boolean;
  citedByCount?: number;
  url?: string;
}

// ── Réponses API ──

interface EpmcResult {
  title?: string;
  authorString?: string;
  pubYear?: string;
  journalTitle?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  isOpenAccess?: string;
  citedByCount?: number;
}

interface EpmcSearchResponse {
  hitCount?: number;
  resultList?: { result?: EpmcResult[] };
}

// ── Normalisation ──

function toRecord(r: EpmcResult): EpmcRecord {
  return {
    doi: r.doi,
    title: r.title?.replace(/\.$/, ""),
    authors: (r.authorString ?? "")
      .split(",")
      .map((a) => a.trim().replace(/\.$/, ""))
      .filter((a) => a.length > 0)
      .slice(0, 8),
    year: r.pubYear ? parseInt(r.pubYear) : undefined,
    journal: r.journalTitle,
    pmid: r.pmid,
    pmcid: r.pmcid,
    isOpenAccess: r.isOpenAccess === "Y",
    citedByCount: r.citedByCount,
    url: r.pmcid
      ? `https://europepmc.org/article/PMC/${r.pmcid}`
      : r.pmid
        ? `https://europepmc.org/article/MED/${r.pmid}`
        : undefined,
  };
}

/** Échappe une valeur pour une clause entre guillemets */
function quoted(value: string): string {
  return value.replace(/["\\]/g, " ").replace(/\s+/g, " ").trim();
}

// ── API publique ──

/**
 * Recherche un DOI dans Europe PMC — null si absent ou réseau indisponible.
 * Champ exact : DOI:"10.1038/nature12373".
 */
export async function lookupEuropePmcByDoi(doi: string): Promise<EpmcRecord | null> {
  const d = normalizeDoi(doi);
  if (!/^10\.\d{4,}\//.test(d)) return null;
  const data = await scholarlyJsonFetch<EpmcSearchResponse>(
    `${EPMC_BASE}?query=${encodeURIComponent(`DOI:"${quoted(d)}"`)}&format=json&pageSize=1&resultType=core`
  );
  const hit = data?.resultList?.result?.[0];
  return hit ? toRecord(hit) : null;
}

/** Recherche par titre (champ TITLE exact) — tableau (0..n) */
export async function searchEuropePmcByTitle(title: string, limit = 1): Promise<EpmcRecord[]> {
  const q = quoted(title);
  if (q.length < 5) return [];
  const data = await scholarlyJsonFetch<EpmcSearchResponse>(
    `${EPMC_BASE}?query=${encodeURIComponent(`TITLE:"${q}"`)}&format=json&pageSize=${limit}&resultType=core`
  );
  return (data?.resultList?.result ?? []).map(toRecord);
}

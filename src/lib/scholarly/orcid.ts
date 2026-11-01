// ═══════════════════════════════════════════════════════════════
// Ma Thèse — ORCID Public API v3 (v1.10.16)
// Fiches auteurs : identité, biographie, mots-clés, affiliations, travaux.
// Lecture publique SANS authentification (API publique ORCID).
// Docs : https://info.orcid.org/documentation/integration-and-api/
// Sondé le 2026-10-31 : HTTP 200 via Node fetch (undici) sur
// personal-details, biography, keywords, employments, works, expanded-search.
// ═══════════════════════════════════════════════════════════════

import { looksLikeOrcidId, scholarlyJsonFetch } from "./http";

const ORCID_API = "https://pub.orcid.org/v3.0";

export interface OrcidAuthorCard {
  orcidId: string;
  givenNames?: string;
  familyName?: string;
  creditName?: string;
  biography?: string;
  keywords: string[];
  /** Affiliations professionnelles (organisation + rôle) */
  affiliations: string[];
}

export interface OrcidWorkSummary {
  doi?: string;
  title?: string;
  year?: number;
  /** Type ORCID brut (JOURNAL_ARTICLE, PREPRINT, DATASET…) */
  type?: string;
}

export interface OrcidSearchResult {
  orcidId: string;
  name: string;
  institutions: string[];
}

// ── Réponses API ──

interface OrcidNameValue {
  value?: string;
}

interface OrcidPersonalDetails {
  name?: {
    "given-names"?: OrcidNameValue;
    "family-name"?: OrcidNameValue;
    "credit-name"?: OrcidNameValue | null;
  } | null;
}

interface OrcidBiography {
  biography?: { value?: string } | null;
}

interface OrcidKeywords {
  keyword?: Array<{ content?: string }>;
}

interface OrcidEmployments {
  "affiliation-group"?: Array<{
    summaries?: Array<{
      "employment-summary"?: {
        organization?: { name?: string };
        "role-title"?: string | null;
      };
    }>;
  }>;
}

interface OrcidWorks {
  group?: Array<{
    "work-summary"?: Array<{
      title?: { title?: OrcidNameValue };
      "external-ids"?: {
        "external-id"?: Array<{
          "external-id-type"?: string;
          "external-id-value"?: string;
        }>;
      };
      "publication-date"?: { year?: OrcidNameValue };
      type?: string;
    }>;
  }>;
}

interface OrcidExpandedSearch {
  "num-found"?: number;
  "expanded-result"?: Array<{
    "orcid-id"?: string;
    "given-names"?: string;
    "family-names"?: string;
    "credit-name"?: string | null;
    "institution-name"?: string[];
  }>;
}

// ── Helpers ──

function cleanOrcidId(id: string): string {
  return id.trim().toUpperCase();
}

function joinName(given?: string, family?: string): string {
  return [given, family].filter(Boolean).join(" ").trim();
}

// ── API publique ──

/**
 * Fiche auteur complète (identité + bio + mots-clés + affiliations).
 * Retourne null si l'iD n'existe pas ou réseau indisponible.
 */
export async function getOrcidAuthorCard(orcidId: string): Promise<OrcidAuthorCard | null> {
  const id = cleanOrcidId(orcidId);
  if (!looksLikeOrcidId(id)) return null;

  const [personal, bio, keywords, employments] = await Promise.all([
    scholarlyJsonFetch<OrcidPersonalDetails>(`${ORCID_API}/${id}/personal-details`),
    scholarlyJsonFetch<OrcidBiography>(`${ORCID_API}/${id}/biography`),
    scholarlyJsonFetch<OrcidKeywords>(`${ORCID_API}/${id}/keywords`),
    scholarlyJsonFetch<OrcidEmployments>(`${ORCID_API}/${id}/employments`),
  ]);

  // personal-details est le seul obligatoire — il confirme l'existence du compte
  if (!personal) return null;

  const affiliations: string[] = [];
  for (const group of employments?.["affiliation-group"] ?? []) {
    for (const summary of group.summaries ?? []) {
      const emp = summary["employment-summary"];
      const org = emp?.organization?.name;
      if (org) {
        affiliations.push(emp?.["role-title"] ? `${org} — ${emp["role-title"]}` : org);
      }
    }
  }

  return {
    orcidId: id,
    givenNames: personal.name?.["given-names"]?.value,
    familyName: personal.name?.["family-name"]?.value,
    creditName: personal.name?.["credit-name"]?.value ?? undefined,
    biography: bio?.biography?.value ?? undefined,
    keywords: (keywords?.keyword ?? [])
      .map((k) => k.content ?? "")
      .filter((k) => k.length > 0)
      .slice(0, 10),
    affiliations: affiliations.slice(0, 8),
  };
}

/** Travaux publics d'un auteur (DOI, titre, année, type) — triés par année décroissante */
export async function getOrcidWorks(orcidId: string, limit = 15): Promise<OrcidWorkSummary[]> {
  const id = cleanOrcidId(orcidId);
  if (!looksLikeOrcidId(id)) return [];
  const data = await scholarlyJsonFetch<OrcidWorks>(`${ORCID_API}/${id}/works`);
  const works: OrcidWorkSummary[] = [];
  for (const group of data?.group ?? []) {
    const ws = group["work-summary"]?.[0];
    if (!ws) continue;
    const doi = ws["external-ids"]?.["external-id"]?.find(
      (e) => e["external-id-type"]?.toLowerCase() === "doi"
    )?.["external-id-value"];
    works.push({
      doi,
      title: ws.title?.title?.value,
      year: ws["publication-date"]?.year?.value
        ? parseInt(ws["publication-date"].year.value, 10)
        : undefined,
      type: ws.type,
    });
  }
  works.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  return works.slice(0, limit);
}

/**
 * Recherche d'auteurs par nom (syntaxe ORCID libre : « Canguilhem », 
 * « family-name:Carberry AND given-names:Josiah », « ringgold-id:… »).
 */
export async function searchOrcidAuthors(
  query: string,
  limit = 5
): Promise<{ numFound: number; results: OrcidSearchResult[] }> {
  const q = query.trim();
  if (q.length < 2) return { numFound: 0, results: [] };
  const data = await scholarlyJsonFetch<OrcidExpandedSearch>(
    `${ORCID_API}/expanded-search/?q=${encodeURIComponent(q)}&rows=${limit}`
  );
  const results = (data?.["expanded-result"] ?? [])
    .filter((r) => r["orcid-id"])
    .map((r) => ({
      orcidId: r["orcid-id"] as string,
      name:
        r["credit-name"] ||
        joinName(r["given-names"], r["family-names"]) ||
        (r["orcid-id"] as string),
      institutions: r["institution-name"] ?? [],
    }));
  return { numFound: data?.["num-found"] ?? results.length, results };
}

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Citation Check API
// Vérifie les citations contre 9 registres : Crossref, OpenAlex,
// Semantic Scholar, DOAJ, PubMed, DataCite (v1.10.16 — DOI de jeux de
// données), BnF (v1.10.18 — catalogue national français : livres,
// thèses, périodiques), Zenodo (v1.10.18 — dépôts open science) et
// Europe PMC (v1.10.18 — biomédical, sur-ensemble de PubMed) ; enrichit
// les citations avec DOI d'un statut d'accès ouvert Unpaywall (lien légal plein-texte).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { lookupDataciteByDoi, searchDataciteByTitle } from "@/lib/scholarly/datacite";
import { getOpenAccessStatus } from "@/lib/scholarly/unpaywall";
import { searchBnf } from "@/lib/scholarly/bnf";
import { lookupZenodoByDoi, searchZenodoByTitle } from "@/lib/scholarly/zenodo";
import { lookupEuropePmcByDoi, searchEuropePmcByTitle } from "@/lib/scholarly/europepmc";

// ── Types ──

interface ParsedCitation {
  raw: string;
  doi?: string;
  title?: string;
  authors?: string[];
  year?: number;
  journal?: string;
}

interface RegistryResult {
 registry: string;
 found: boolean;
 title?: string;
 authors?: string[];
  year?: number;
  doi?: string;
 journal?: string;
 isRetracted?: boolean;
 retractionNotice?: string;
 openAccess?: boolean;
 citationCount?: number;
 url?: string;
 rawResponse?: string;
 error?: string;
 latencyMs: number;
}

interface CitationCheckResult {
 citation: ParsedCitation;
 results: RegistryResult[];
 /** Enrichissement Unpaywall (v1.10.16) — présent si la citation porte un DOI */
 oa?: {
   isOa: boolean;
   oaStatus?: string;
   bestOaUrl?: string;
   bestOaUrlForPdf?: string;
   journal?: string;
 };
 verdict: "verified" | "unverified" | "retracted" | "mismatch" | "error";
 summary: string;
}

// ── Citation Parsing ──

/** Extract DOI from text */
function extractDoi(text: string): string | undefined {
  const patterns = [
    /(?:doi[:\s]*|https?:\/\/doi\.org\/)(10\.\d{4,}\/[^\s,;]+)/i,
    /\b(10\.\d{4,}\/[^\s,;]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].replace(/\.$/, "");
  }
  return undefined;
}

/** Parse a single citation line */
function parseCitation(line: string): ParsedCitation {
  const raw = line.trim();
  if (!raw) return { raw };

  const doi = extractDoi(raw);

  // Extract year (4 digits in parentheses or standing alone)
  const yearMatch = raw.match(/(?:\(|,|\.)\s*(\d{4})\s*(?:\)|\.|,|$)/);
  const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

  // Extract quoted title (between quotes or after first period-like separator)
  let title: string | undefined;
  const quotedTitle = raw.match(/["“"]([^"""\n]{10,250})["""\n]/);
  if (quotedTitle) {
    title = quotedTitle[1].trim();
  } else {
    // Heuristic: text between first "(" and last ")" often contains title
    const parenMatch = raw.match(/^[^()]*\(([^()]+?)\)/);
    if (parenMatch && parenMatch[1].length > 15 && parenMatch[1].length < 300) {
      title = parenMatch[1].trim();
    } else {
      // Fallback: take the longest segment
      const segments = raw.split(/[.;,]\s/).filter(s => s.length > 20);
      if (segments.length > 0) {
        title = segments.reduce((a, b) => a.length > b.length ? a : b).trim();
        if (title.length > 300) title = title.slice(0, 300);
      }
    }
  }

  // Extract authors (text before first year or parenthetical)
  const authorPart = raw.split(/(?:\(\d{4})|(?:\s*\d{4})/)[0] || "";
  const authors = authorPart
    .replace(/^[A-Z][a-z]+\s*,?/, "") // remove trailing word
    .split(/[,;]/)
    .map(a => a.replace(/^\s*[&.]\s*/, "").trim())
    .filter(a => a.length > 2 && a.length < 60);

  return { raw, doi, title, authors: authors.slice(0, 5), year };
}

/** Parse multiple citations (one per line or BibTeX entries) */
function parseCitations(input: string): ParsedCitation[] {
  const lines = input.split(/\n/).filter(l => l.trim().length > 5);
  return lines.map(parseCitation);
}

// ── Registry Checkers ──

async function checkCrossref(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    let url: string;
    if (citation.doi) {
      url = `https://api.crossref.org/works/${encodeURIComponent(citation.doi)}`;
    } else if (citation.title) {
      url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(citation.title)}&rows=3&mailto=mathese.app`;
    } else {
      return { registry: "Crossref", found: false, error: "No title or DOI", latencyMs: 0 };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "MaThese/1.0 (mailto:mathese.app)" } });
    clearTimeout(timeout);

    if (!res.ok) return { registry: "Crossref", found: false, error: `HTTP ${res.status}`, latencyMs: Date.now() - start };

    const data = await res.json();
    const items = citation.doi ? [data.message] : (data.message?.items || []);
    if (items.length === 0) return { registry: "Crossref", found: false, error: "Aucun résultat", latencyMs: Date.now() - start };

    const best = items[0];
    const isRetracted = best.is_retracted || best.update_to?.length > 0;
    return {
      registry: "Crossref",
      found: true,
      title: best.title?.[0],
      authors: best.author?.map((a: { given?: string; family?: string }) => [a.given, a.family].filter(Boolean).join(" "))?.slice(0, 5),
      year: best.published?.["date-parts"]?.[0]?.[0] || best.created?.["date-parts"]?.[0]?.[0],
      doi: best.DOI,
      journal: best["container-title"]?.[0],
      isRetracted,
      retractionNotice: isRetracted ? "Rétracté selon Crossref" : undefined,
      citationCount: best["is-referenced-by-count"],
      url: `https://doi.org/${best.DOI}`,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "Crossref", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkOpenAlex(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    let url: string;
    if (citation.doi) {
      url = `https://api.openalex.org/works/doi:${encodeURIComponent(citation.doi)}`;
    } else if (citation.title) {
      url = `https://api.openalex.org/works?search=${encodeURIComponent(citation.title)}&per_page=3`;
    } else {
      return { registry: "OpenAlex", found: false, error: "No title or DOI", latencyMs: 0 };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "MaThese/1.0", "mailto": "mathese.app" },
    });
    clearTimeout(timeout);

    if (!res.ok) return { registry: "OpenAlex", found: false, error: `HTTP ${res.status}`, latencyMs: Date.now() - start };

    const data = await res.json();
    const items = citation.doi ? [data] : (data.results || []);
    if (items.length === 0) return { registry: "OpenAlex", found: false, error: "Aucun résultat", latencyMs: Date.now() - start };

    const best = items[0];
    return {
      registry: "OpenAlex",
      found: true,
      title: best.title,
      authors: best.authorships?.slice(0, 5).map((a: { author: { display_name?: string } }) => a.author?.display_name).filter(Boolean),
      year: best.publication_year,
      doi: best.doi,
      journal: best.primary_location?.source?.display_name,
      isRetracted: best.is_retracted,
      retractionNotice: best.is_retracted ? "Rétracté selon OpenAlex" : undefined,
      openAccess: best.open_access?.is_oa,
      citationCount: best.cited_by_count,
      url: best.doi ? `https://doi.org/${best.doi}` : best.id,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "OpenAlex", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkSemanticScholar(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    let url: string;
    if (citation.doi) {
      url = `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(citation.doi)}?fields=title,authors,year,journal,isRetracted,citationCount,externalIds,openAccessPdf`;
    } else if (citation.title) {
      url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(citation.title)}&limit=3&fields=title,authors,year,journal,isRetracted,citationCount,externalIds,openAccessPdf`;
    } else {
      return { registry: "Semantic Scholar", found: false, error: "No title or DOI", latencyMs: 0 };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "MaThese/1.0" },
    });
    clearTimeout(timeout);

    if (!res.ok) return { registry: "Semantic Scholar", found: false, error: `HTTP ${res.status}`, latencyMs: Date.now() - start };

    const data = await res.json();
    const items = citation.doi ? [data] : (data.data || []);
    if (items.length === 0) return { registry: "Semantic Scholar", found: false, error: "Aucun résultat", latencyMs: Date.now() - start };

    const best = items[0];
    return {
      registry: "Semantic Scholar",
      found: true,
      title: best.title,
      authors: best.authors?.slice(0, 5).map((a: { name?: string }) => a.name).filter(Boolean),
      year: best.year,
      doi: best.externalIds?.DOI,
      journal: best.journal?.name,
      isRetracted: best.isRetracted,
      retractionNotice: best.isRetracted ? "Rétracté selon Semantic Scholar" : undefined,
      citationCount: best.citationCount,
      url: best.externalIds?.DOI ? `https://doi.org/${best.externalIds.DOI}` : undefined,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "Semantic Scholar", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkDoaj(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    if (!citation.doi && !citation.title) {
      return { registry: "DOAJ", found: false, error: "No title or DOI", latencyMs: 0 };
    }

    const query = citation.doi ? `bibjson.doi:"${citation.doi}"` : citation.title || "";
    const url = `https://api.doaj.org/api/v1/search/articles/${encodeURIComponent(query)}?pageSize=3`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { registry: "DOAJ", found: false, error: `HTTP ${res.status}`, latencyMs: Date.now() - start };

    const data = await res.json();
    const items = data.results || [];
    if (items.length === 0) {
      return { registry: "DOAJ", found: false, error: "Non indexé dans DOAJ", latencyMs: Date.now() - start };
    }

    const best = items[0].bibjson;
    return {
      registry: "DOAJ",
      found: true,
      title: best.title,
      authors: best.author?.slice(0, 5).map((a: { name?: string }) => a.name).filter(Boolean),
      year: best.year,
      doi: best.doi,
      journal: best.journal?.title,
      openAccess: true,
      url: best.doi ? `https://doi.org/${best.doi}` : undefined,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "DOAJ", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkPubMed(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    if (!citation.title && !citation.doi) {
      return { registry: "PubMed", found: false, error: "No title or DOI", latencyMs: 0 };
    }

    const query = citation.doi ? `${citation.doi}[doi]` : `${citation.title}[title]`;
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { registry: "PubMed", found: false, error: `HTTP ${res.status}`, latencyMs: Date.now() - start };

    const searchData = await res.json();
 const ids = searchData.esearchresult?.idlist;
    if (!ids || ids.length === 0) {
      return { registry: "PubMed", found: false, error: "Non trouvé dans PubMed", latencyMs: Date.now() - start };
    }

    // Fetch details
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids[0]}&retmode=json`;
    const sumRes = await fetch(summaryUrl, { signal: controller.signal });
    const sumData = await sumRes.json();
    const item = sumData.result?.[ids[0]];

    return {
      registry: "PubMed",
      found: true,
      title: item?.title,
      authors: item?.authors?.slice(0, 5).map((a: { name?: string }) => a.name).filter(Boolean),
      year: item?.pubdate ? parseInt(item.pubdate) : undefined,
      doi: item?.elocationid?.match(/10\.\d+/)?.[0] || citation.doi,
      journal: item?.fulljournalname,
      url: ids[0] ? `https://pubmed.ncbi.nlm.nih.gov/${ids[0]}/` : undefined,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "PubMed", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkDatacite(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    if (!citation.doi && !citation.title) {
      return { registry: "DataCite", found: false, error: "No title or DOI", latencyMs: 0 };
    }

    // DOI d'abord (cas le plus précis), titre ensuite
    let work = citation.doi ? await lookupDataciteByDoi(citation.doi) : null;
    if (!work && citation.title) {
      const candidates = await searchDataciteByTitle(citation.title, 1);
      work = candidates[0] ?? null;
    }

    if (!work) {
      return { registry: "DataCite", found: false, error: "Non indexé dans DataCite", latencyMs: Date.now() - start };
    }

    return {
      registry: "DataCite",
      found: true,
      title: work.title,
      authors: work.authors,
      year: work.year,
      doi: work.doi,
      journal: work.publisher ? `${work.resourceType ?? "Objet"} — ${work.publisher}` : work.resourceType,
      url: `https://doi.org/${work.doi}`,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "DataCite", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkBnf(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    // BnF : catalogue de notices bibliographiques — recherche par titre (+ auteur), pas de DOI
    if (!citation.title) {
      return { registry: "BnF", found: false, error: "Pas de titre (BnF : recherche par titre)", latencyMs: 0 };
    }
    const records = await searchBnf(citation.title, citation.authors?.[0], 1);
    if (records.length === 0) {
      return { registry: "BnF", found: false, error: "Non indexé dans le catalogue BnF", latencyMs: Date.now() - start };
    }
    const rec = records[0];
    return {
      registry: "BnF",
      found: true,
      title: rec.title,
      authors: rec.authors,
      year: rec.year,
      journal: [rec.type, rec.publisher].filter(Boolean).join(" — ") || undefined,
      url: rec.url,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "BnF", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkZenodo(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    if (!citation.doi && !citation.title) {
      return { registry: "Zenodo", found: false, error: "No title or DOI", latencyMs: 0 };
    }
    let work = citation.doi ? await lookupZenodoByDoi(citation.doi) : null;
    if (!work && citation.title) {
      work = (await searchZenodoByTitle(citation.title, 1))[0] ?? null;
    }
    if (!work) {
      return { registry: "Zenodo", found: false, error: "Non déposé sur Zenodo", latencyMs: Date.now() - start };
    }
    return {
      registry: "Zenodo",
      found: true,
      title: work.title,
      authors: work.authors,
      year: work.year,
      doi: work.doi,
      journal: work.resourceType,
      url: work.url,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "Zenodo", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

async function checkEuropePmc(citation: ParsedCitation): Promise<RegistryResult> {
  const start = Date.now();
  try {
    if (!citation.doi && !citation.title) {
      return { registry: "Europe PMC", found: false, error: "No title or DOI", latencyMs: 0 };
    }
    let work = citation.doi ? await lookupEuropePmcByDoi(citation.doi) : null;
    if (!work && citation.title) {
      work = (await searchEuropePmcByTitle(citation.title, 1))[0] ?? null;
    }
    if (!work) {
      return { registry: "Europe PMC", found: false, error: "Non indexé dans Europe PMC", latencyMs: Date.now() - start };
    }
    return {
      registry: "Europe PMC",
      found: true,
      title: work.title,
      authors: work.authors,
      year: work.year,
      doi: work.doi,
      journal: work.journal,
      openAccess: work.isOpenAccess,
      citationCount: work.citedByCount,
      url: work.url,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { registry: "Europe PMC", found: false, error: err instanceof Error ? err.message : "Erreur", latencyMs: Date.now() - start };
  }
}

// ── Verdict Logic ──

function computeVerdict(citation: ParsedCitation, results: RegistryResult[]): CitationCheckResult["verdict"] {
  const anyRetracted = results.some(r => r.isRetracted);
  if (anyRetracted) return "retracted";

  const foundCount = results.filter(r => r.found).length;
  if (foundCount === 0) return "unverified";

  // Check title mismatch across registries
  if (citation.title && foundCount >= 2) {
    const titles = results.filter(r => r.title).map(r => r.title!.toLowerCase().slice(0, 60));
    const uniqueTitles = new Set(titles);
    if (uniqueTitles.size > 1) return "mismatch";
  }

  return "verified";
}

function computeSummary(citation: ParsedCitation, results: RegistryResult[]): string {
  const found = results.filter(r => r.found);
  const retracted = results.filter(r => r.isRetracted);

  if (retracted.length > 0) {
    return `⚠️ RÉTRACTÉ — détecté par ${retracted.map(r => r.registry).join(", ")}`;
  }
  if (found.length === 0) {
    return `❌ Non trouvé dans aucun registre`;
  }
  if (found.length < results.length) {
    return `✅ Trouvé dans ${found.length}/${results.length} registres`;
  }
  return `✅ Vérifié dans les ${found.length} registres`;
}

// ── Route ──

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, registries = ["crossref", "openalex", "semantic-scholar", "doaj", "pubmed", "datacite", "bnf", "zenodo", "europepmc"] } = body;

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json({ error: "Texte requis (minimum 5 caractères)" }, { status: 400 });
    }

    const citations = parseCitations(text);
    if (citations.length === 0) {
      return NextResponse.json({ error: "Aucune citation détectée" }, { status: 400 });
    }

    if (citations.length > 50) {
      return NextResponse.json({ error: "Maximum 50 citations par requête" }, { status: 400 });
    }

    const checkers: Record<string, (c: ParsedCitation) => Promise<RegistryResult>> = {
      crossref: checkCrossref,
      openalex: checkOpenAlex,
      "semantic-scholar": checkSemanticScholar,
      doaj: checkDoaj,
      pubmed: checkPubMed,
      datacite: checkDatacite,
      bnf: checkBnf,
      zenodo: checkZenodo,
      europepmc: checkEuropePmc,
    };

    const selectedCheckers = registries
      .filter((r: string) => checkers[r])
      .map((r: string) => checkers[r]);

    // Check all citations (max 3 concurrent to respect rate limits)
    const results: CitationCheckResult[] = [];

    for (let i = 0; i < citations.length; i += 3) {
      const batch = citations.slice(i, i + 3);
      const batchResults = await Promise.all(
        batch.map(async (citation) => {
          const [registryResults, oa] = await Promise.all([
            Promise.all(
              selectedCheckers.map((checker: (c: ParsedCitation) => Promise<RegistryResult>) => checker(citation))
            ),
            citation.doi
              ? getOpenAccessStatus(citation.doi)
              : Promise.resolve(null),
          ]);
          return {
            citation,
            results: registryResults,
            oa: oa
              ? {
                  isOa: oa.isOa,
                  oaStatus: oa.oaStatus,
                  bestOaUrl: oa.bestOaUrl,
                  bestOaUrlForPdf: oa.bestOaUrlForPdf,
                  journal: oa.journal,
                }
              : undefined,
            verdict: computeVerdict(citation, registryResults),
            summary: computeSummary(citation, registryResults),
          };
        })
      );
      results.push(...batchResults);
    }

    const verified = results.filter(r => r.verdict === "verified").length;
    const unverified = results.filter(r => r.verdict === "unverified").length;
    const retracted = results.filter(r => r.verdict === "retracted").length;
    const mismatch = results.filter(r => r.verdict === "mismatch").length;

    return NextResponse.json({
      total: results.length,
      verified,
      unverified,
      retracted,
      mismatch,
      results,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

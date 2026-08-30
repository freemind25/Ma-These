import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════
// Normalized journal type
// ═══════════════════════════════════════
export interface JournalResult {
  id: string;
  name: string;
  publisher: string;
  issn: string;
  subjects: string[];
  oaType: string;
  country: string;
  source: "openalex" | "doaj";
  homepageUrl?: string;
  apc?: string;
  relevanceScore: number;
}

// ═══════════════════════════════════════
// OpenAlex response types
// ═══════════════════════════════════════
interface OpenAlexJournal {
  id: string;
  display_name: string;
  publisher?: string;
  issn?: string[];
  topics?: { display_name: string; subfield?: { display_name: string } }[];
  country_code?: string;
  homepage_url?: string;
  is_oa?: boolean;
  oa_status?: string;
  apc_prices?: { price?: number; currency?: string }[];
  works_count?: number;
  cited_by_count?: number;
}

interface OpenAlexResponse {
  results: OpenAlexJournal[];
  meta?: { count: number };
}

// ═══════════════════════════════════════
// DOAJ response types
// ═══════════════════════════════════════
interface DoajBibjson {
  title?: string;
  publisher?: { name?: string };
  identifier?: { type: string; id: string }[];
  subject?: { scheme: string; term: string }[];
  link?: { url: string; type: string; content_type?: string }[];
  deposit_policy?: {
    name?: string;
    url?: string;
  }[];
  apc?: { max_price?: { currency: string; price: number }[] };
  country?: string;
  oa_start?: string;
}

interface DoajJournal {
  id: string;
  bibjson?: DoajBibjson;
  created_date?: string;
  total_articles?: number;
}

interface DoajResponse {
  total: number;
  page: number;
  pageSize: number;
  results: DoajJournal[];
}

// ═══════════════════════════════════════
// Country code mapping
// ═══════════════════════════════════════
const COUNTRY_CODES: Record<string, string> = {
  FR: "France",
  US: "États-Unis",
  GB: "Royaume-Uni",
  DE: "Allemagne",
  CH: "Suisse",
  BE: "Belgique",
  CA: "Canada",
  IT: "Italie",
  ES: "Espagne",
  NL: "Pays-Bas",
  AU: "Australie",
  JP: "Japon",
  CN: "Chine",
  BR: "Brésil",
  IN: "Inde",
  KR: "Corée du Sud",
  SE: "Suède",
  NO: "Norvège",
  DK: "Danemark",
  PL: "Pologne",
  PT: "Portugal",
  IE: "Irlande",
  AT: "Autriche",
  NZ: "Nouvelle-Zélande",
  SG: "Singapour",
  MX: "Mexique",
  AR: "Argentine",
  ZA: "Afrique du Sud",
  TR: "Turquie",
  IL: "Israël",
  RU: "Russie",
  TW: "Taïwan",
  HK: "Hong Kong",
};

// ═══════════════════════════════════════
// Normalize OA type labels (French)
// ═══════════════════════════════════════
function normalizeOaType(status?: string): string {
  if (!status) return "Non spécifié";
  const s = status.toLowerCase();
  if (s.includes("diamond")) return "Diamant";
  if (s.includes("gold")) return "Or";
  if (s.includes("hybrid")) return "Hybride";
  if (s.includes("bronze")) return "Bronze";
  if (s.includes("green")) return "Vert";
  return "Or";
}

// ═══════════════════════════════════════
// Fetch from OpenAlex
// ═══════════════════════════════════════
async function fetchOpenAlex(query: string, subject?: string): Promise<JournalResult[]> {
  const params = new URLSearchParams({
    search: query,
    per_page: "20",
    select: "id,display_name,publisher,issn,topics,country_code,homepage_url,is_oa,oa_status,apc_prices,works_count,cited_by_count",
  });
  if (subject && subject !== "all") {
    params.set("filter", `topics.subfield.display_name.search:${subject}`);
  }

  const url = `https://api.openalex.org/journals?${params.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "ThesisFrame/1.0 (research-tool)" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`OpenAlex erreur ${res.status}`);

  const data: OpenAlexResponse = await res.json();

  return data.results.map((j, idx) => ({
    id: j.id ?? `oa-${idx}`,
    name: j.display_name ?? "Sans titre",
    publisher: j.publisher ?? "Éditeur inconnu",
    issn: j.issn?.join(", ") ?? "",
    subjects: j.topics?.map((t) => t.subfield?.display_name ?? t.display_name).slice(0, 3) ?? [],
    oaType: normalizeOaType(j.oa_status ?? (j.is_oa ? "gold" : undefined)),
    country: COUNTRY_CODES[j.country_code ?? ""] ?? j.country_code ?? "International",
    source: "openalex" as const,
    homepageUrl: j.homepage_url,
    apc: j.apc_prices?.[0]
      ? `${j.apc_prices[0].price ?? ""} ${j.apc_prices[0].currency ?? ""}`.trim()
      : undefined,
    relevanceScore: (j.cited_by_count ?? 0) + (j.works_count ?? 0) * 0.1,
  }));
}

// ═══════════════════════════════════════
// Fetch from DOAJ
// ═══════════════════════════════════════
async function fetchDoaj(query: string, _subject?: string): Promise<JournalResult[]> {
  const url = `https://api.doaj.org/api/v1/search/journals/${encodeURIComponent(query)}?pageSize=20`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ThesisFrame/1.0 (research-tool)",
      Accept: "application/json",
    },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`DOAJ erreur ${res.status}`);

  const data: DoajResponse = await res.json();

  return data.results.map((j, idx) => {
    const bib = j.bibjson;
    const issnList =
      bib?.identifier
        ?.filter((i) => i.type === "pissn" || i.type === "eissn")
        .map((i) => i.id) ?? [];
    const homepage =
      bib?.link?.find((l) => l.type === "homepage")?.url ??
      bib?.link?.find((l) => l.content_type === "homepage")?.url;

    return {
      id: j.id ?? `doaj-${idx}`,
      name: bib?.title ?? "Sans titre",
      publisher: bib?.publisher?.name ?? "Éditeur inconnu",
      issn: issnList.join(", "),
      subjects:
        bib?.subject?.map((s) => s.term).filter(Boolean).slice(0, 3) ?? [],
      oaType: "Or",
      country: COUNTRY_CODES[bib?.country ?? ""] ?? bib?.country ?? "International",
      source: "doaj" as const,
      homepageUrl: homepage,
      apc: bib?.apc?.max_price?.[0]
        ? `${bib.apc.max_price[0].price} ${bib.apc.max_price[0].currency}`
        : undefined,
      relevanceScore: (j.total_articles ?? 0) * 2,
    };
  });
}

// ═══════════════════════════════════════
// GET /api/journaux-oa — Search journals
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const source = searchParams.get("source") ?? "both";
  const subject = searchParams.get("subject") ?? "all";

  if (!q || q.length < 2) {
    return NextResponse.json({
      data: [],
      meta: { total: 0, source, query: q },
    });
  }

  try {
    const results: JournalResult[] = [];
    const errors: string[] = [];

    if (source === "openalex" || source === "both") {
      try {
        const oaResults = await fetchOpenAlex(q, subject);
        results.push(...oaResults);
      } catch (err) {
        errors.push(`OpenAlex: ${err instanceof Error ? err.message : "Erreur"}`);
      }
    }

    if (source === "doaj" || source === "both") {
      try {
        const doajResults = await fetchDoaj(q, subject);
        results.push(...doajResults);
      } catch (err) {
        errors.push(`DOAJ: ${err instanceof Error ? err.message : "Erreur"}`);
      }
    }

    // Sort by relevance score descending
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      data: results,
      meta: {
        total: results.length,
        source,
        query: q,
        ...(errors.length > 0 ? { warnings: errors } : {}),
      },
    });
  } catch (error) {
    console.error("[GET /api/journaux-oa] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de journaux" },
      { status: 500 }
    );
  }
}

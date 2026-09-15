import { NextRequest, NextResponse } from "next/server";

// ══════════════════════════════════════════════════════════════════════
// Thèses en ligne — HAL API proxy
// ══════════════════════════════════════════════════════════════════════

const HAL_API = "https://api.archives-ouvertes.fr/search/";

const DOMAINS: Record<string, string> = {
  shs: "Sciences humaines et sociales",
  sci: "Sciences",
  sdv: "Sciences du vivant",
  sde: "Sciences de l'ingénieur",
  sm: "Sciences mathématiques",
  phys: "Physique",
  chimie: "Chimie",
  info: "Informatique",
  stat: "Statistiques",
  cca: "Sciences cognitives",
};

export interface ThesisResult {
  id: string;
  title: string;
  titleEn: string;
  authors: string[];
  year: number;
  abstract: string;
  abstractEn: string;
  url: string;
  domains: string[];
  keywords: string[];
  source: "hal";
}

interface SearchParams {
  q: string;
  domain?: string;
  yearMin?: string;
  yearMax?: string;
  sort?: string;
  page?: string;
  rows?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") || "";
    const domain = searchParams.get("domain") || "";
    const yearMin = searchParams.get("yearMin") || "";
    const yearMax = searchParams.get("yearMax") || "";
    const sort = searchParams.get("sort") || "publicationDateY_i+desc";
    const page = searchParams.get("page") || "0";
    const rows = searchParams.get("rows") || "15";

    if (!q.trim()) {
      return NextResponse.json(
        { error: "La requête de recherche est vide" },
        { status: 400 }
      );
    }

    // Build Solr query
    const fq: string[] = ["docType_s:THESE"];
    if (domain && DOMAINS[domain]) {
      fq.push(`domain_s:${domain}`);
    }
    if (yearMin) {
      fq.push(`publicationDateY_i:[${yearMin} TO *]`);
    }
    if (yearMax) {
      fq.push(`publicationDateY_i:[* TO ${yearMax}]`);
    }

    const params = new URLSearchParams({
      q: q,
      rows: rows,
      start: String(Number(page) * Number(rows)),
      fl: [
        "docid",
        "title_s",
        "authFullName_s",
        "publicationDateY_i",
        "abstract_s",
        "uri_s",
        "domain_s",
        "keyword_s",
        "submittedDate_s",
      ].join(","),
      fq: fq.join("&fq="),
      sort: sort,
      wt: "json",
    });

    const url = `${HAL_API}?${params.toString()}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MaThese-App/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erreur HAL : ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const response = data.response;

    const theses: ThesisResult[] = (response.docs || []).map(
      (doc: Record<string, unknown>) => {
        const titles = (doc.title_s as string[]) || [];
        const abstracts = (doc.abstract_s as string[]) || [];
        const domains = (doc.domain_s as string[]) || [];
        const keywords = (doc.keyword_s as string[]) || [];
        const authors = (doc.authFullName_s as string[]) || [];

        // Separate French and English titles/abstracts
        const titleFr = titles[0] || "";
        const titleEn = titles[1] || "";
        const abstractFr = abstracts[0] || "";
        const abstractEn = abstracts[1] || "";

        // Clean keywords (remove duplicates, limit)
        const cleanKeywords = [...new Set(keywords)].slice(0, 10);

        // Map domain codes to labels
        const domainLabels = domains.map(
          (d: string) => DOMAINS[d] || d.replace(/^\d+\./, "")
        );

        return {
          id: doc.docid as string,
          title: titleFr,
          titleEn,
          authors,
          year: (doc.publicationDateY_i as number) || 0,
          abstract: abstractFr,
          abstractEn,
          url: (doc.uri_s as string) || "",
          domains: domainLabels,
          keywords: cleanKeywords,
          source: "hal" as const,
        };
      }
    );

    return NextResponse.json({
      theses,
      total: response.numFound || 0,
      page: Number(page),
      rows: Number(rows),
      totalPages: Math.ceil(
        (response.numFound || 0) / Number(rows)
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

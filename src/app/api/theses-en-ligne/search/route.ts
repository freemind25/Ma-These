import { NextRequest, NextResponse } from "next/server";

// ══════════════════════════════════════════════════════════════════════
// Thèses en ligne — HAL API proxy
// ══════════════════════════════════════════════════════════════════════

const HAL_API = "https://api.archives-ouvertes.fr/search/";

// ── A.1 (annexe technique) : codes de domaine corrigés à la racine ──
// Les thèses HAL indexent leurs domaines de niveau 0 dans le champ
// `level0_domain_s` avec les codes réels de la taxonomie HAL (vérifié par
// facette sur docType_s:THESE : shs, sdv, spi, info, phys, chim, sdu, math,
// sde, scco). Les anciens codes (sci, sm, chimie, stat, cca) n'existent
// pas chez HAL — le filtre ne retournait jamais aucun résultat.
const DOMAINS: Record<string, string> = {
  shs: "Sciences humaines et sociales",
  sdv: "Sciences du vivant",
  spi: "Sciences de l'ingénieur",
  info: "Informatique",
  phys: "Physique",
  chim: "Chimie",
  sdu: "Planète et Univers",
  math: "Mathématiques",
  sde: "Sciences de l'environnement",
  scco: "Sciences cognitives",
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
    const sort = searchParams.get("sort") || "publicationDateY_i desc";
    const page = searchParams.get("page") || "0";
    const rows = searchParams.get("rows") || "15";

    if (!q.trim()) {
      return NextResponse.json(
        { error: "La requête de recherche est vide" },
        { status: 400 }
      );
    }

    // Build Solr query
    // A.1 : filtre de domaine sur `level0_domain_s` (champ réel des thèses HAL)
    const fq: string[] = ["docType_s:THESE"];
    if (domain && DOMAINS[domain]) {
      fq.push(`level0_domain_s:${domain}`);
    }
    if (yearMin) {
      fq.push(`publicationDateY_i:[${yearMin} TO *]`);
    }
    if (yearMax) {
      fq.push(`publicationDateY_i:[* TO ${yearMax}]`);
    }

    // ── A.1 (annexe technique) : construction d'URL corrigée à la racine ──
    // Bug historique : `fq.join("&fq=")` passé comme VALEUR d'un seul paramètre `fq`
    // — URLSearchParams encodait le `&` interne au lieu de créer des paramètres répétés.
    // Correction : un append() par filtre → plusieurs paramètres fq natifs.
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
        "level0_domain_s",
        "domain_s",
        "keyword_s",
        "submittedDate_s",
      ].join(","),
      wt: "json",
    });
    for (const filter of fq) {
      params.append("fq", filter);
    }

    // ── A.1 (suite) : le tri ──
    // Solr exige `champ ordre` séparé par un ESPACE ; la forme `champ+ordre`
    // était encodée %2B (plus littéral) et rejetée par l'API HAL.
    // On normalise tout séparateur (+ ou %2B) en espace, avec défaut sûr.
    const sortNormalized =
      sort.replace(/%2B/gi, " ").replace(/\+/g, " ").trim() ||
      "publicationDateY_i desc";
    params.set("sort", sortNormalized);

    // Encodage final : les espaces deviennent %20 (forme acceptée par Solr/HAL),
    // jamais le `+` form-urlencoded que HAL interprète mal sur ce champ.
    const queryString = params.toString().replace(/\+/g, "%20");
    const url = `${HAL_API}?${queryString}`;
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
        const level0Domains = (doc.level0_domain_s as string[]) || [];
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

        // Map domain codes to labels — niveau 0 d'abord (A.1), puis sous-domaines nettoyés
        const domainLabels = [
          ...new Set([
            ...level0Domains.map((d: string) => DOMAINS[d] || d),
            ...domains
              .filter((d: string) => !level0Domains.includes(d.replace(/^\d+\./, "")))
              .map((d: string) => DOMAINS[d] || d.replace(/^\d+\./, "")),
          ]),
        ];

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

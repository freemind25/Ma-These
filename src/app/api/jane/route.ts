import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════
// Types normalisés (sortie API)
// ═══════════════════════════════════════
export interface JaneJournal {
  name: string;
  confidence: number; // % (similarité estimée par Jane)
  openAccess: boolean;
  openAccessLabel?: string; // ex. « High-quality open access »
  medlineIndexed: boolean;
  pmc: boolean;
  articleInfluence?: number;
  influencePercentile?: number; // % de journaux avec un score inférieur
}

export interface JaneAuthor {
  name: string;
  confidence: number; // %
  pmids: string[];
}

export interface JanePaper {
  pmid: string;
  authors: string;
  title: string;
  journal: string;
  year: string;
  similarity: number; // %
}

export type JaneMode = "journals" | "authors" | "papers";

export interface JaneResponse {
  mode: JaneMode;
  journals?: JaneJournal[];
  authors?: JaneAuthor[];
  papers?: JanePaper[];
}

// ═══════════════════════════════════════
// Filtres autorisés (d'après le formulaire officiel de Jane)
// ═══════════════════════════════════════
const JANE_LANGUAGES = ["eng", "fre", "ger", "ita", "jpn", "rus", "spa"] as const;
const JANE_LANGUAGE_COUNT = String(JANE_LANGUAGES.length);

const JANE_PUBLICATION_TYPES = [
  "Case Reports",
  "Classical Article",
  "Clinical Trial",
  "Clinical Trial, Phase I",
  "Clinical Trial, Phase II",
  "Clinical Trial, Phase III",
  "Clinical Trial, Phase IV",
  "Comparative Study",
  "Controlled Clinical Trial",
  "Evaluation Studies",
  "In Vitro",
  "Journal Article",
  "Letter",
  "Meta-Analysis",
  "Multicenter Study",
  "Randomized Controlled Trial",
  "Review",
  "Twin Study",
  "Validation Studies",
] as const;
const JANE_TYPE_COUNT = String(JANE_PUBLICATION_TYPES.length);

const JANE_SUGGESTIONS_URL = "https://jane.biosemantics.org/suggestions.php";
const MAX_TEXT_LENGTH = 5_000;

// ═══════════════════════════════════════
// Helpers de parsing HTML (structure stable de Jane : bars bluebar/orangebar,
// champs cachés authorName/authorPMIDs, checkbox PMID_*)
// ═══════════════════════════════════════
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrait les <tr> contenant une barre de confiance « bluebar ».
 * Les lignes de détail (« The confidence score for … is based on these
 * articles ») sont identifiées par la checkbox Wrap_PMID_* et écartées
 * séparément selon le mode.
 */
function splitBlueBarRows(html: string): string[] {
  const rows: string[] = [];
  for (const m of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    if (m[1].includes('id="bluebar"')) rows.push(m[1]);
  }
  return rows;
}

function parseJournals(html: string): JaneJournal[] {
  const journals: JaneJournal[] = [];
  const seen = new Set<string>();
  for (const row of splitBlueBarRows(html)) {
    // Lignes de référence / checkbox d'articles : jamais un journal
    if (row.includes("Wrap_PMID_") || row.includes("The confidence score for"))
      continue;
    if (!row.includes('<td width="100%">')) continue;

    const confM = row.match(/title="Confidence is (\d+)%"/);
    const nameM = row.match(/<td width="100%">([\s\S]*?)(?:<div id=|<\/td>)/);
    if (!confM || !nameM) continue;

    const name = decodeEntities(nameM[1].replace(/<[^>]+>/g, " "));
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const aiM = row.match(/Article Influence = (-?\d+(?:\.\d+)?)/);
    const pctM = row.match(/(\d+)% has a lower Article Influence/);
    const oaM = row.match(/<div id="openaccess"[^>]*>([\s\S]*?)<\/div>/);

    journals.push({
      name,
      confidence: Number(confM[1]),
      openAccess: row.includes('id="openaccess"'),
      openAccessLabel: oaM ? decodeEntities(oaM[1].replace(/<[^>]+>/g, " ")) : undefined,
      medlineIndexed: row.includes('id="medlineindexed"'),
      pmc: row.includes('id="pubmedcentral"'),
      articleInfluence: aiM ? Number(aiM[1]) : undefined,
      influencePercentile: pctM ? Number(pctM[1]) : undefined,
    });
  }
  return journals;
}

function parseAuthors(html: string): JaneAuthor[] {
  const authors: JaneAuthor[] = [];
  const seen = new Set<string>();
  for (const row of splitBlueBarRows(html)) {
    if (row.includes("The confidence score for")) continue;
    const nameM = row.match(/name="authorName\d+" value="([^"]*)"/);
    if (!nameM) continue;
    const name = decodeEntities(nameM[1]);
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const pmidsM = row.match(/name="authorPMIDs\d+" value="([^"]*)"/);
    const confM = row.match(/title="Confidence is (\d+)%"/);

    authors.push({
      name,
      confidence: confM ? Number(confM[1]) : 0,
      pmids: pmidsM ? pmidsM[1].split(";").map((p) => p.trim()).filter(Boolean) : [],
    });
  }
  return authors;
}

function parsePapers(html: string): JanePaper[] {
  const papers: JanePaper[] = [];
  const seen = new Set<string>();
  for (const row of splitBlueBarRows(html)) {
    const pmidM = row.match(/name="PMID_(\d+)"/);
    if (!pmidM) continue;
    const pmid = pmidM[1];
    if (seen.has(pmid)) continue;
    seen.add(pmid);

    const simM = row.match(/Similarity to your query is (\d+)%/);
    const linkM = row.match(
      /<a href="https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)"[^>]*>([\s\S]*?)<\/a>/
    );
    const titleM = row.match(/<strong>([\s\S]*?)<\/strong>/);

    let journal = "";
    let year = "";
    const strongEnd = row.indexOf("</strong>");
    if (strongEnd !== -1) {
      const after = row.slice(strongEnd + "</strong>".length);
      const txt = decodeEntities(after.replace(/<[^>]+>/g, " "));
      // Format Jane : « Public health reviews. 2024 »
      const jm = txt.match(/^(.*?)\.?\s*(\d{4})\s*$/);
      if (jm) {
        journal = jm[1].trim();
        year = jm[2];
      } else {
        journal = txt;
      }
    }

    papers.push({
      pmid,
      authors: linkM ? decodeEntities(linkM[2].replace(/<[^>]+>/g, " ")) : "",
      title: titleM ? decodeEntities(titleM[1].replace(/<[^>]+>/g, " ")) : "",
      journal,
      year,
      similarity: simM ? Number(simM[1]) : 0,
    });
  }
  return papers;
}

// ═══════════════════════════════════════
// POST /api/jane — Proxy vers Jane (suggestions.php)
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  let body: {
    text?: string;
    mode?: string;
    languages?: string[];
    publicationTypes?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  const mode = body.mode;

  if (!text || text.length < 3) {
    return NextResponse.json(
      { error: "Veuillez coller le titre et/ou le résumé du manuscrit (3 caractères minimum)." },
      { status: 400 }
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Texte trop long (max ${MAX_TEXT_LENGTH} caractères : titre et/ou résumé).` },
      { status: 400 }
    );
  }
  if (mode !== "journals" && mode !== "authors" && mode !== "papers") {
    return NextResponse.json(
      { error: "Mode invalide (journals | authors | papers)." },
      { status: 400 }
    );
  }

  const languages = (body.languages ?? []).filter((l): l is (typeof JANE_LANGUAGES)[number] =>
    (JANE_LANGUAGES as readonly string[]).includes(l)
  );
  const publicationTypes = (
    body.publicationTypes ?? []
  ).filter((t): t is (typeof JANE_PUBLICATION_TYPES)[number] =>
    (JANE_PUBLICATION_TYPES as readonly string[]).includes(t)
  );

  // Construction du POST form-urlencoded vers Jane
  const form = new URLSearchParams();
  form.set("text", text);
  if (mode === "journals") form.set("findJournals", "Find journals");
  if (mode === "authors") form.set("findAuthors", "Find authors");
  if (mode === "papers") form.set("findPapers", "Find articles");
  // Filtres transmis uniquement lorsqu'actifs (comportement natif Jane sinon)
  languages.forEach((lang, i) => form.set(`language${i}`, lang));
  if (languages.length > 0) form.set("languageCount", JANE_LANGUAGE_COUNT);
  publicationTypes.forEach((t, i) => form.set(`type${i}`, t));
  if (publicationTypes.length > 0) form.set("typeCount", JANE_TYPE_COUNT);

  try {
    const res = await fetch(JANE_SUGGESTIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ThesisFrame/1.0 (research-tool)",
      },
      body: form.toString(),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Jane a répondu avec l'erreur ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const response: JaneResponse = { mode };

    if (mode === "journals") response.journals = parseJournals(html);
    if (mode === "authors") response.authors = parseAuthors(html);
    if (mode === "papers") response.papers = parsePapers(html);

    return NextResponse.json(response);
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    console.error("[POST /api/jane] Error:", err);
    return NextResponse.json(
      {
        error: isTimeout
          ? "Jane n'a pas répondu dans le délai imparti (60 s) — réessayez plus tard."
          : "Impossible de joindre Jane (jane.biosemantics.org). Vérifiez votre connexion ou réessayez.",
      },
      { status: 502 }
    );
  }
}

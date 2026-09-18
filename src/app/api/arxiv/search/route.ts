import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════
// arXiv — Recherche native (API Atom export.arxiv.org)
// Retourne des entrées normalisées + BibTeX prêt à l'emploi
// ═══════════════════════════════════════════════════════════

const ARXIV_API = "https://export.arxiv.org/api/query";

interface ArxivEntry {
  arxivId: string;
  url: string;
  pdfUrl: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  updated: string;
  primaryCategory: string;
  categories: string[];
  doi?: string;
  journalRef?: string;
  bibtex: string;
}

// ── Throttle + cache mémoire (courtoisie API arXiv : ~1 req/s) ──
let lastCall = 0;
const MIN_INTERVAL_MS = 1200;
const cache = new Map<string, { ts: number; data: unknown }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function collapse(s: string): string {
  return decodeXml(s).replace(/\s+/g, " ").trim();
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Construit une clé BibTeX type `dupont2019smart`. */
function makeBibtexKey(firstAuthor: string, year: string, title: string): string {
  const last = stripAccents(firstAuthor.split(/\s+/).pop() || "anonyme")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const firstWord =
    stripAccents(title)
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)[0] || "untitled";
  return `${last}${year}${firstWord.toLowerCase()}`;
}

function makeBibtex(entry: {
  key: string;
  title: string;
  authors: string[];
  year: string;
  arxivId: string;
  url: string;
  doi?: string;
  journalRef?: string;
}): string {
  const lines = [
    `@article{${entry.key},`,
    `  title = {${entry.title}},`,
    `  author = {${entry.authors.join(" and ")}},`,
    `  journal = {arXiv preprint arXiv:${entry.arxivId}},`,
    `  year = {${entry.year}},`,
    `  eprint = {${entry.arxivId}},`,
    `  archivePrefix = {arXiv},`,
    `  url = {${entry.url}},`,
  ];
  if (entry.doi) lines.push(`  doi = {${entry.doi}},`);
  if (entry.journalRef) lines.push(`  note = {${entry.journalRef}},`);
  lines.push(`}`);
  return lines.join("\n");
}

/** Parse le flux Atom arXiv en entrées normalisées. */
function parseAtomFeed(xml: string): { total: number; entries: ArxivEntry[] } {
  const totalMatch = xml.match(
    /<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/
  );
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;

  const entries: ArxivEntry[] = [];
  const entryBlocks = xml.split(/<entry>/).slice(1);

  for (const block of entryBlocks) {
    const end = block.indexOf("</entry>");
    if (end === -1) continue;
    const b = block.slice(0, end);

    const get = (tag: string): string => {
      const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? collapse(m[1]) : "";
    };

    const idUrl = get("id");
    const idMatch = idUrl.match(/arxiv\.org\/abs\/([^\s]+)/);
    if (!idMatch) continue;
    const withVersion = idMatch[1];
    const arxivId = withVersion.replace(/v\d+$/, "");
    const url = `https://arxiv.org/abs/${withVersion}`;

    const pdfMatch = b.match(
      /<link[^>]*href="(https:\/\/arxiv\.org\/pdf\/[^"]+)"[^>]*>/
    );
    const pdfUrl = pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${withVersion}`;

    const title = get("title");
    const authors = [...b.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) =>
      collapse(m[1])
    );
    const abstract = get("summary");
    const published = get("published");
    const updated = get("updated") || published;
    const year = published.slice(0, 4);

    const categories = [...b.matchAll(/<category[^>]*term="([^"]+)"/g)].map(
      (m) => m[1]
    );
    const primaryMatch = b.match(
      /<arxiv:primary_category[^>]*term="([^"]+)"/
    );
    const primaryCategory = primaryMatch ? primaryMatch[1] : categories[0] || "";

    const doiMatch = b.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/);
    const journalRefMatch = b.match(
      /<arxiv:journal_ref[^>]*>([\s\S]*?)<\/arxiv:journal_ref>/
    );
    const doi = doiMatch ? collapse(doiMatch[1]) : undefined;
    const journalRef = journalRefMatch ? collapse(journalRefMatch[1]) : undefined;

    const key = makeBibtexKey(authors[0] || "anonyme", year, title);
    const bibtex = makeBibtex({
      key,
      title,
      authors: authors.length ? authors : ["anonyme"],
      year,
      arxivId,
      url,
      doi,
      journalRef,
    });

    entries.push({
      arxivId,
      url,
      pdfUrl,
      title,
      authors,
      abstract,
      published,
      updated,
      primaryCategory,
      categories,
      doi,
      journalRef,
      bibtex,
    });
  }

  return { total, entries };
}

/** GET /api/arxiv/search?q=…&start=0&max=15&sort=relevance|submittedDate */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const start = Math.max(0, parseInt(searchParams.get("start") || "0", 10) || 0);
  const max = Math.min(30, Math.max(1, parseInt(searchParams.get("max") || "15", 10) || 15));
  const sort =
    searchParams.get("sort") === "submittedDate" ? "submittedDate" : "relevance";

  if (q.length < 2) {
    return NextResponse.json(
      { error: "Requête trop courte (2 caractères minimum)" },
      { status: 400 }
    );
  }

  // Construction de la requête arXiv : les guillemets → phrase exacte,
  // sinon chaque terme est joint par AND.
  let searchQuery: string;
  const phrase = q.match(/"([^"]+)"/);
  if (phrase) {
    searchQuery = `all:"${phrase[1].replace(/"/g, "")}"`;
  } else {
    searchQuery = q
      .split(/\s+/)
      .slice(0, 8)
      .map((t) => `all:${t.replace(/[^\w\-.]/g, "")}`)
      .filter(Boolean)
      .join("+AND+");
  }

  const cacheKey = `${searchQuery}|${start}|${max}|${sort}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ok: true, cached: true, ...(cached.data as object) });
  }

  // Courtoisie : espace minimal entre deux appels sortants
  const now = Date.now();
  const wait = lastCall + MIN_INTERVAL_MS - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();

  try {
    const url = `${ARXIV_API}?search_query=${encodeURIComponent(searchQuery).replace(/%2B/g, "+")}&start=${start}&max_results=${max}&sortBy=${sort}&sortOrder=descending`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ThesisFrame/1.0 (academic-search)" },
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `API arXiv indisponible (HTTP ${res.status})` },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const { total, entries } = parseAtomFeed(xml);
    const data = { total, start, max, entries };

    cache.set(cacheKey, { ts: Date.now(), data });
    // Éviter une croissance illimitée du cache
    if (cache.size > 200) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      if (oldest) cache.delete(oldest[0]);
    }

    return NextResponse.json({ ok: true, cached: false, ...data });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error && err.name === "TimeoutError"
            ? "Délai dépassé — réessayez"
            : "arXiv injoignable",
      },
      { status: 502 }
    );
  }
}

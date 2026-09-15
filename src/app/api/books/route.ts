// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Book Search API
// Unified book search across OpenLibrary, Gutenberg, StandardEbooks
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  subject?: string[];
  isbn?: string[];
  cover_i?: number;
  edition_count?: number;
  ebook_count?: number;
  has_fulltext?: boolean;
  language?: string[];
}

interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  subjects?: string[];
  bookshelves?: string[];
  languages?: string[];
  download_count: number;
  media_type: string;
  formats?: Record<string, string>;
}

/** Normalize search query */
function normalizeQuery(q: string): string {
  return q.trim().replace(/\s+/g, "+");
}

/** Search OpenLibrary (covers, editions, ebook availability) */
async function searchOpenLibrary(query: string, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,publisher,subject,isbn,cover_i,edition_count,ebook_count,has_fulltext,language&lang=fr,en,de,es,it`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const docs: OpenLibraryDoc[] = data.docs || [];

    return docs.map((doc) => ({
      source: "openlibrary" as const,
      id: doc.key || "",
      title: doc.title || "Sans titre",
      authors: doc.author_name || [],
      year: doc.first_publish_year || null,
      publishers: doc.publisher || [],
      subjects: (doc.subject || []).slice(0, 5),
      isbn: (doc.isbn || []).slice(0, 3),
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
      editions: doc.edition_count || 0,
      hasEbook: (doc.ebook_count || 0) > 0,
      hasFulltext: doc.has_fulltext || false,
      url: doc.key ? `https://openlibrary.org${doc.key}` : `https://openlibrary.org/search?q=${encodeURIComponent(query)}`,
      languages: doc.language || [],
    }));
  } catch {
    return [];
  }
}

/** Search Project Gutenberg (public domain books) */
async function searchGutenberg(query: string, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const url = `https://gutendex.com/books?search=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const books: GutenbergBook[] = data.results || [];

    return books.map((book) => ({
      source: "gutenberg" as const,
      id: String(book.id),
      title: book.title || "Sans titre",
      authors: book.authors?.map((a) => a.name) || [],
      year: book.authors?.[0]?.birth_year || null,
      subjects: (book.subjects || []).slice(0, 5),
      bookshelves: (book.bookshelves || []).slice(0, 5),
      languages: book.languages || [],
      downloadCount: book.download_count || 0,
      formats: book.formats || {},
      coverUrl: book.formats?.["image/jpeg"] || null,
      url: `https://www.gutenberg.org/ebooks/${book.id}`,
      readOnline: book.formats?.["text/html"] || null,
      downloadPdf: book.formats?.["application/pdf"] || null,
      downloadEpub: book.formats?.["application/epub+zip"] || null,
    }));
  } catch {
    return [];
  }
}

/** Search StandardEbooks (public domain, beautifully typeset) */
async function searchStandardEbooks(query: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const url = `https://standardebooks.org/search?q=${encodeURIComponent(query)}&format=json`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const books: Array<{
      title: string;
      authors: Array<{ name: string }>; 
      url: string;
      cover_url: string;
    }> = data.results || data.books || [];

    return books.slice(0, 10).map((book) => ({
      source: "standardebooks" as const,
      id: book.url || "",
      title: book.title || "Sans titre",
      authors: book.authors?.map((a) => a.name) || [],
      year: null,
      coverUrl: book.cover_url || null,
      url: book.url ? `https://standardebooks.org${book.url}` : "https://standardebooks.org",
    }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const sources = searchParams.get("sources") || "all";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 20);

  if (!query.trim()) {
    return NextResponse.json({ error: "Requête vide" }, { status: 400 });
  }

  const nq = normalizeQuery(query);
  const results: Record<string, unknown[]> = {};

  // Determine which sources to query
  const wantOpenLibrary = sources === "all" || sources.includes("openlibrary");
  const wantGutenberg = sources === "all" || sources.includes("gutenberg");
  const wantStandardEbooks = sources === "all" || sources.includes("standardebooks");

  // Run queries in parallel
  const [olResults, gutResults, seResults] = await Promise.all([
    wantOpenLibrary ? searchOpenLibrary(nq, limit) : Promise.resolve([]),
    wantGutenberg ? searchGutenberg(nq, limit) : Promise.resolve([]),
    wantStandardEbooks ? searchStandardEbooks(nq) : Promise.resolve([]),
  ]);

  if (wantOpenLibrary) results.openlibrary = olResults;
  if (wantGutenberg) results.gutenberg = gutResults;
  if (wantStandardEbooks) results.standardebooks = seResults;

  return NextResponse.json({
    query,
    totalResults: olResults.length + gutResults.length + seResults.length,
    results,
  });
}

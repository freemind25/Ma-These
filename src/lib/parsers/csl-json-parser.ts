// ═══════════════════════════════════════
// ThesisFrame — CSL-JSON Parser
// Parses CSL-JSON (.json) files exported from Zotero, Mendeley, etc.
// ═══════════════════════════════════════

import { type ParsedReference } from "./bibtex-parser";

interface CslAuthor {
  family?: string;
  given?: string;
  literal?: string;
}

interface CslRecord {
  type: string;
  id?: string;
  title?: string;
  author?: CslAuthor[];
  editor?: CslAuthor[];
  issued?: { "date-parts"?: number[][] };
  "container-title"?: string;
  volume?: string;
  issue?: string;
  page?: string;
  publisher?: string;
  DOI?: string;
  ISBN?: string;
  URL?: string;
  abstract?: string;
  keyword?: string | string[];
  note?: string;
  "collection-title"?: string;
  "number-of-pages"?: string;
}

/**
 * Parse CSL-JSON content into an array of references.
 * CSL-JSON is either a single object or an array of objects.
 */
export function parseCSLJSON(content: string): ParsedReference[] {
  let records: CslRecord[];

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      records = parsed;
    } else if (typeof parsed === "object" && parsed.type) {
      records = [parsed];
    } else {
      return [];
    }
  } catch {
    return [];
  }

  return records
    .filter((r) => r.type)
    .map(mapCslToInternal);
}

function mapCslToInternal(record: CslRecord): ParsedReference {
  const year = record.issued?.["date-parts"]?.[0]?.[0];
  const authors = record.author
    ? record.author.map(formatAuthor).join("; ")
    : undefined;

  const keywords = record.keyword
    ? Array.isArray(record.keyword)
      ? record.keyword.join(", ")
      : record.keyword
    : undefined;

  return {
    type: mapCslTypeToInternal(record.type),
    authors,
    title: record.title,
    year,
    journal: record["container-title"],
    volume: record.volume,
    issue: record.issue,
    pages: record.page,
    publisher: record.publisher,
    doi: record.DOI,
    isbn: record.ISBN,
    url: record.URL,
    abstract: record.abstract,
    keywords,
    notes: record.note,
  };
}

function formatAuthor(author: CslAuthor): string {
  if (author.literal) return author.literal;
  const parts: string[] = [];
  if (author.family) parts.push(author.family);
  if (author.given) parts.push(author.given);
  return parts.join(", ");
}

function mapCslTypeToInternal(cslType: string): string {
  const type = cslType.toLowerCase();
  const mapping: Record<string, string> = {
    "article-journal": "article",
    "article-magazine": "article",
    "article-newspaper": "article",
    "article": "article",
    book: "book",
    chapter: "book",
    "chapter": "book",
    thesis: "thesis",
    "phd-thesis": "thesis",
    "master-thesis": "thesis",
    "paper-conference": "conference",
    "proceedings": "conference",
    "speech": "conference",
    report: "report",
    "techreport": "report",
    webpage: "web",
    "web-post": "web",
    "post-weblog": "web",
    "post": "web",
    "entry-dictionary": "other",
    "entry-encyclopedia": "other",
    "entry": "other",
    manuscript: "other",
    "preprint": "article",
    dataset: "other",
    interview: "other",
    patent: "other",
    legislation: "other",
    legal_case: "other",
    treaty: "other",
    musical_score: "other",
    review: "article",
    "review-book": "article",
  };
  return mapping[type] || "other";
}

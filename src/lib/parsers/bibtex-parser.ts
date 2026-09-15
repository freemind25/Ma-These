// ═══════════════════════════════════════
// ThesisFrame — BibTeX Parser
// Parses .bib files exported from Mendeley, Zotero, etc.
// ═══════════════════════════════════════

export interface ParsedReference {
  type: string;
  bibtexKey?: string;
  authors?: string;
  title?: string;
  year?: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  abstract?: string;
  keywords?: string;
  notes?: string;
}

/**
 * Parse a BibTeX (.bib) file content into an array of references.
 * Supports common entry types: @article, @book, @inproceedings, @phdthesis,
 * @mastersthesis, @misc, @techreport, @incollection, @online
 */
export function parseBibTex(content: string): ParsedReference[] {
  const results: ParsedReference[] = [];

  // Remove comments (% lines and @comment blocks)
  const cleaned = content
    .split("\n")
    .filter((line) => !line.trim().startsWith("%"))
    .join("\n")
    .replace(/@comment\{[^}]*\}/gi, "");

  // Match @type{key, ... } blocks
  const entryRegex = /@(\w+)\s*\{(?:\s*([^,\s]+)\s*,)?\s*([\s\S]*?)\n\s*\}/gi;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(cleaned)) !== null) {
    const entryType = match[1].toLowerCase();
    const citationKey = match[2]?.trim() || undefined;
    const fieldsRaw = match[3];

    // Skip string definitions and other non-entry types
    if (["string", "comment", "preamble"].includes(entryType)) continue;

    const fields = parseBibFields(fieldsRaw);
    const type = mapBibTypeToInternal(entryType);

    results.push({
      type,
      bibtexKey: citationKey,
      authors: joinAuthors(fields.author),
      title: cleanBibString(fields.title),
      year: parseYear(fields.year),
      journal: cleanBibString(fields.journal),
      volume: cleanBibString(fields.volume),
      issue: cleanBibString(fields.number),
      pages: cleanBibString(fields.pages),
      publisher: cleanBibString(fields.publisher),
      doi: cleanBibString(fields.doi),
      isbn: cleanBibString(fields.isbn),
      url: cleanBibString(fields.url || fields.howpublished),
      abstract: cleanBibString(fields.abstract),
      keywords: cleanBibString(fields.keywords),
      notes: cleanBibString(fields.note || fields.annote),
    });
  }

  return results;
}

function parseBibFields(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};
  // Match field = {value} or field = "value" or field = number
  const fieldRegex = /(\w+)\s*=\s*(\{[\s\S]*?\}|"[^"]*"|\d+)/g;
  let m: RegExpExecArray | null;

  while ((m = fieldRegex.exec(raw)) !== null) {
    const key = m[1].toLowerCase();
    let value = m[2].trim();
    // Strip outer braces or quotes
    if (value.startsWith("{") && value.endsWith("}")) {
      value = value.slice(1, -1);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }

  return fields;
}

function cleanBibString(value?: string): string | undefined {
  if (!value) return undefined;
  // Remove LaTeX commands and extra braces
  return value
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1") // \textbf{word} → word
    .replace(/\{([^}]*)\}/g, "$1") // {word} → word
    .replace(/~/g, " ") // ~ → space
    .replace(/\s+/g, " ")
    .trim() || undefined;
}

function parseYear(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : undefined;
}

function joinAuthors(authors?: string): string | undefined {
  if (!authors) return undefined;
  // Normalize "and" separator to semicolon
  return cleanBibString(authors)
    ?.replace(/\s+and\s+/gi, "; ")
    .trim() || undefined;
}

function mapBibTypeToInternal(bibType: string): string {
  // Keep original BibTeX types for precision; only remap aliases
  const mapping: Record<string, string> = {
    conference: "inproceedings",
    mastersthesis: "phdthesis",
    electronic: "online",
    thesis: "phdthesis",
  };
  return mapping[bibType] || bibType;
}

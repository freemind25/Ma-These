// ═══════════════════════════════════════
// ThesisFrame — RIS Parser
// Parses .ris files exported from Mendeley, Zotero, EndNote, etc.
// ═══════════════════════════════════════

import { type ParsedReference } from "./bibtex-parser";

/**
 * Parse a RIS (.ris) file content into an array of references.
 *
 * RIS format:
 *   TY  - Type (e.g. JOUR, BOOK, THES)
 *   AU  - Author (can repeat)
 *   TI  - Title
 *   PY  - Year
 *   ... more fields
 *   ER  - End of record
 */
export function parseRIS(content: string): ParsedReference[] {
  const results: ParsedReference[] = [];

  // Split into records by "ER  -" lines
  const recordBlocks = content.split(/\n\s*ER\s*-\s*/).filter((b) => b.trim());

  for (const block of recordBlocks) {
    const fields = parseRisFields(block);
    if (!fields.TY) continue; // Skip malformed records

    results.push({
      type: mapRisTypeToInternal(fields.TY),
      authors: joinRisAuthors(fields.AU),
      title: fields.TI || fields.T1,
      year: parseRisYear(fields.PY || fields.Y1),
      journal: fields.JO || fields.JF || fields.T2,
      volume: fields.VL,
      issue: fields.IS,
      pages: fields.SP,
      publisher: fields.PB,
      doi: fields.DO,
      isbn: fields.SN,
      url: fields.UR,
      abstract: fields.AB || fields.N2,
      keywords: fields.KW,
      notes: fields.N1,
    });
  }

  return results;
}

function parseRisFields(block: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = block.split("\n");

  // Some RIS files use continuation lines (line starting with spaces/tabs)
  let currentTag = "";
  let currentValue = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for tag line: "TAG  - value" or "TAG  -"
    const tagMatch = trimmed.match(/^([A-Z0-9]{2})\s*-\s*(.*)/);
    if (tagMatch) {
      // Save previous tag
      if (currentTag) {
        if (fields[currentTag]) {
          // Multi-value field (e.g., multiple AU lines)
          fields[currentTag] = fields[currentTag] + ";" + currentValue;
        } else {
          fields[currentTag] = currentValue;
        }
      }
      currentTag = tagMatch[1];
      currentValue = tagMatch[2].trim();
    } else if (currentTag && trimmed) {
      // Continuation line
      currentValue += " " + trimmed;
    }
  }

  // Don't forget the last tag
  if (currentTag) {
    if (fields[currentTag]) {
      fields[currentTag] = fields[currentTag] + ";" + currentValue;
    } else {
      fields[currentTag] = currentValue;
    }
  }

  return fields;
}

function parseRisYear(value?: string): number | undefined {
  if (!value) return undefined;
  // RIS years can be "2024" or "2024//2024" or "2024/2024"
  const match = value.match(/(\d{4})/);
  return match ? parseInt(match[0], 10) : undefined;
}

function joinRisAuthors(authors?: string): string | undefined {
  if (!authors) return undefined;
  // RIS separates multiple authors with semicolons already
  return authors
    .split(";")
    .map((a) => a.trim())
    .filter(Boolean)
    .join("; ") || undefined;
}

function mapRisTypeToInternal(risType: string): string {
  const type = risType.trim().toUpperCase();
  const mapping: Record<string, string> = {
    JOUR: "article",
    JFULL: "article",
    BOOK: "book",
    CHAP: "book",
    THES: "thesis",
    DISS: "thesis",
    CONF: "conference",
    CPAPER: "conference",
    RPRT: "report",
    TB: "report",
    ELEC: "web",
    EBOOK: "web",
    WEB: "web",
    GENERIC: "other",
    ART: "other",
    BLOG: "web",
    MPCT: "conference",
    HEAR: "conference",
    PAMP: "other",
    SER: "other",
    PAT: "other",
    CASE: "other",
    UNPB: "other",
  };
  return mapping[type] || "other";
}

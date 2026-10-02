// ═══════════════════════════════════════════════════════════════
// citations — détection de citations académiques et appariement
// aux références de la bibliothèque (fonctions pures).
//
// Adapté de src/app/api/alignement-preuves/route.ts l.78-353, module
// non retouché (décision n°1 de la spec export-notes-bas-page :
// extraction documentée dans une bibliothèque partagée, sans refactor
// du module d'origine).
//
// Consommateurs :
// - src/app/api/export-docx/route.ts (notes de bas de page DOCX)
// - src/modules/export-pdf/export-pdf-page.tsx (exposants + section Notes)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type CitationKind = 'parenthetical' | 'narrative';

/** Une occurrence littérale de la citation dans la source, avec sa forme. */
export interface CitationOccurrence {
  /** Texte littéral exact présent dans la source (parenthétique avec parenthèses). */
  raw: string;
  kind: CitationKind;
}

export interface ExtractedCitation {
  /** Forme littérale principale de la citation dans la source (parenthétique avec parenthèses). */
  raw: string;
  /** Toutes les formes littérales distinctes repérées pour cette citation (occurrences multiples). */
  occurrences: CitationOccurrence[];
  /** Auteur tel qu'écrit dans le texte (ex. « Smith et al. »). */
  author: string;
  /** Clé auteur normalisée pour l'appariement aux références. */
  authorKey: string;
  year: number;
  /** Clé de déduplication affichable (ex. « Smith et al. (2020) »). */
  display: string;
  kind: CitationKind;
}

/** Sous-ensemble du modèle Prisma Reference nécessaire à l'appariement. */
export interface CitationReference {
  id: string;
  authors: string;
  title: string;
  year: number | null;
  type: string;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  doi: string | null;
  url: string | null;
}

export interface ReferenceMatchData {
  id: string;
  authorKey: string;
  year: number | null;
  displayTitle: string;
}

/**
 * Une note de bas de page : une référence unique (CA-1.5) partagée par
 * toutes ses citations, numérotée dans l'ordre de première apparition.
 */
export interface FootnoteEntry {
  /** Identifiant de note, débute à 1 (les ids -1/0 sont les séparateurs Word). */
  id: number;
  reference: CitationReference;
  /** Nom du premier auteur de la référence (ex. « Smith »). */
  firstAuthor: string;
  year: number | null;
  /** Citations rattachées à cette note (remplacement HTML et injection DOCX). */
  citations: ExtractedCitation[];
}

/** Information de renvoi associée à une forme littérale de citation. */
export interface FootnoteRawInfo {
  id: number;
  /** Narrative : conserver le nom d'auteur devant l'exposant (« Smith¹ »). */
  keepAuthor: boolean;
}

/** Fragment de texte découpé aux positions des citations. */
export interface TextSegment {
  text: string;
  footnoteId: number | null;
}

const MAX_CITATIONS_PER_TEXT = 100;

// ═══════════════════════════════════════════════════════════════
// Helpers — Text sanitization
// ═══════════════════════════════════════════════════════════════

/** Strip HTML tags, returning plain text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Échappe les caractères spéciaux d'une chaîne pour un usage dans RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ═══════════════════════════════════════════════════════════════
// Helpers — Author key normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Build a normalized author key from a surname string.
 * e.g. "Smith" → "smith", "van der Berg" → "berg"
 *
 * For citations with initials, the first initial letter is appended:
 * e.g. "A. Smith" → "smith_a"
 */
export function buildAuthorKey(surname: string, initialLetter?: string): string {
  const parts = surname.trim().split(/\s+/);
  const key = parts[parts.length - 1].toLowerCase();
  if (initialLetter) {
    return `${key}_${initialLetter.toLowerCase()}`;
  }
  return key;
}

/**
 * Extract the surname (and optional first initial) from an author name string
 * in Reference.authors format (e.g. "Smith, J." or "van der Berg, A." or "Smith J.").
 */
function extractReferenceAuthorKey(authorStr: string): string {
  const trimmed = authorStr.trim();
  // Format: "Surname, A. B." or "Surname, A."
  const commaMatch = trimmed.match(/^(.+?),\s*([A-Z])\.?/i);
  if (commaMatch) {
    const surname = commaMatch[1].trim();
    const initial = commaMatch[2];
    return buildAuthorKey(surname, initial);
  }
  // Format: "A. B. Surname" or "Surname"
  const parts = trimmed.split(/\s+/);
  if (parts.length > 1 && /^[A-Z]\.?$/i.test(parts[0])) {
    const initial = parts[0].charAt(0);
    const surname = parts[parts.length - 1];
    return buildAuthorKey(surname, initial);
  }
  return buildAuthorKey(trimmed);
}

// ═══════════════════════════════════════════════════════════════
// Helpers — Citation extraction
// ═══════════════════════════════════════════════════════════════

/**
 * Parse a single author-year pair from a citation fragment.
 * Returns { raw, occurrences, author, authorKey, year, display, kind } or null.
 */
function parseSingleAuthorYear(
  authorPart: string,
  yearPart: string,
  kind: CitationKind,
  raw: string,
): ExtractedCitation | null {
  const yearMatch = yearPart.match(/(19|20)\d{2}/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[1] + yearMatch[0].slice(-2), 10);

  const a = authorPart.trim();
  if (!a) return null;

  const occurrence: CitationOccurrence = { raw, kind };

  // Check for "Surname et al." or "Surname et" (French)
  const etAlMatch = a.match(/^(.+?)\s+et\s+al\.?$/i);
  if (etAlMatch) {
    const surname = etAlMatch[1].trim();
    return {
      raw,
      occurrences: [occurrence],
      author: a,
      authorKey: buildAuthorKey(surname),
      year,
      display: `${surname} et al. (${year})`,
      kind,
    };
  }

  // Check for "Surname & Surname" or "Surname &" (French)
  const ampMatch = a.match(/^(.+?)\s+&\s*(.*)$/i);
  if (ampMatch) {
    const firstSurname = ampMatch[1].trim();
    const secondSurname = ampMatch[2].trim();
    if (secondSurname) {
      return {
        raw,
        occurrences: [occurrence],
        author: a,
        authorKey: buildAuthorKey(firstSurname),
        year,
        display: `${firstSurname} & ${secondSurname} (${year})`,
        kind,
      };
    }
    return {
      raw,
      occurrences: [occurrence],
      author: a,
      authorKey: buildAuthorKey(firstSurname),
      year,
      display: `${firstSurname} (${year})`,
      kind,
    };
  }

  // Check for initials + surname: "A. Smith", "A. B. Smith", "Smith, A."
  // Pattern: optional initials then surname, or "Surname, A."
  const initialSurname = a.match(/^(?:([A-Z])\.?\s+)+(\S+)$/i);
  if (initialSurname) {
    const initial = initialSurname[1];
    const surname = initialSurname[2];
    return {
      raw,
      occurrences: [occurrence],
      author: a,
      authorKey: buildAuthorKey(surname, initial),
      year,
      display: `${a} (${year})`,
      kind,
    };
  }

  // Simple surname
  const surname = a.replace(/[^a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s'-]/g, '').trim();
  if (!surname) return null;

  return {
    raw,
    occurrences: [occurrence],
    author: a,
    authorKey: buildAuthorKey(surname),
    year,
    display: `${surname} (${year})`,
    kind,
  };
}

/**
 * Extract all citations from a plain-text string, in order of first
 * appearance (parenthetical first for identical displays — its literal
 * form with parentheses is the better replacement target), deduplicated.
 * Capped at MAX_CITATIONS_PER_TEXT.
 */
export function extractCitationsFromText(text: string): ExtractedCitation[] {
  interface Found {
    citation: ExtractedCitation;
    index: number;
  }
  const found: Found[] = [];

  // 1. Parenthetical: (Author, Year) or (Author et al., Year) or (Author & Author, Year)
  //    Also handles multiple: (Author, Year; Author, Year)
  const parenPattern = /\(([^)]+?(?:19|20)\d{2}[^)]*?)\)/g;
  let match: RegExpExecArray | null;

  while ((match = parenPattern.exec(text)) !== null) {
    if (found.length >= MAX_CITATIONS_PER_TEXT) break;
    const inner = match[1].trim();

    // Split by semicolons for multiple citations
    const parts = inner.split(';');
    for (const part of parts) {
      if (found.length >= MAX_CITATIONS_PER_TEXT) break;
      const p = part.trim();
      // Match: <author part>, <year part>
      // Year is the last 4-digit number
      const citMatch = p.match(/^(.+?),\s*((?:19|20)\d{2})\b/);
      if (citMatch) {
        // Groupe à citation unique : la forme littérale inclut les parenthèses ;
        // groupe multiple : chaque citation vise son propre texte (sans les parens).
        const raw = parts.length === 1 ? match[0] : p;
        const parsed = parseSingleAuthorYear(citMatch[1], citMatch[2], 'parenthetical', raw);
        if (parsed) found.push({ citation: parsed, index: match.index });
      }
    }
  }

  // 2. Narrative: Author (Year) at word boundary start
  //    e.g. "Smith (2021)" or "Smith et al. (2021)"
  const narrativePattern = /(?:^|(?<=[.!?\s(\[{]))((?:[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ'-]*)(?:\s+(?:et\s+al\.?|&\s*[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ'-]*))?)\s*\(((?:19|20)\d{2})\)/g;

  while ((match = narrativePattern.exec(text)) !== null) {
    if (found.length >= MAX_CITATIONS_PER_TEXT) break;
    const parsed = parseSingleAuthorYear(match[1].trim(), match[2], 'narrative', match[0]);
    if (parsed) found.push({ citation: parsed, index: match.index });
  }

  // 3. Ordre de première apparition (sort stable : parenthétique d'abord à index égal),
  //    déduplication par display — les formes littérales distinctes sont cumulées.
  found.sort((a, b) => a.index - b.index);

  const result: ExtractedCitation[] = [];
  const byDisplay = new Map<string, ExtractedCitation>();
  for (const { citation } of found) {
    const existing = byDisplay.get(citation.display);
    if (existing) {
      // Priorité parenthétique : la forme principale avec parenthèses est la
      // meilleure cible de remplacement (le kind de CHAQUE occurrence reste
      // toutefois attaché à sa propre forme littérale).
      if (citation.kind === 'parenthetical' && existing.kind === 'narrative') {
        existing.raw = citation.raw;
        existing.kind = 'parenthetical';
      }
      if (!existing.occurrences.some((o) => o.raw === citation.raw)) {
        existing.occurrences.push(...citation.occurrences);
      }
      continue;
    }
    byDisplay.set(citation.display, citation);
    result.push(citation);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Helpers — Reference matching
// ═══════════════════════════════════════════════════════════════

/**
 * Build an index of all references for fast lookup.
 * For each reference, we extract multiple possible author keys (one per author)
 * to increase match probability.
 */
export function buildReferenceIndex(
  references: Pick<CitationReference, 'id' | 'authors' | 'title' | 'year'>[],
): Map<string, ReferenceMatchData[]> {
  const index = new Map<string, ReferenceMatchData[]>();

  for (const ref of references) {
    const authorStrings = ref.authors.split(';').map((a) => a.trim()).filter(Boolean);
    const keys: string[] = [];

    for (const authorStr of authorStrings) {
      keys.push(extractReferenceAuthorKey(authorStr));
    }

    const displayTitle = ref.authors.split(';')[0]?.trim().replace(/,.*$/, '') ?? '';
    const yearSuffix = ref.year ? ` (${ref.year})` : '';
    const data: ReferenceMatchData = {
      id: ref.id,
      authorKey: keys[0] ?? '',
      year: ref.year,
      displayTitle: `${displayTitle}${yearSuffix} — ${ref.title.slice(0, 60)}`,
    };

    for (const key of keys) {
      if (!key) continue;
      const existing = index.get(key) ?? [];
      existing.push(data);
      index.set(key, existing);
    }
  }

  return index;
}

/** Try to find a matching reference for a citation. Exact year first, then author only. */
export function findMatchingReference(
  citation: ExtractedCitation,
  refIndex: Map<string, ReferenceMatchData[]>,
): ReferenceMatchData | null {
  // Numeric bracket citations can't match by author
  if (citation.authorKey.startsWith('[')) return null;

  const candidates = refIndex.get(citation.authorKey);
  if (!candidates || candidates.length === 0) return null;

  // Prefer exact year match
  const exactYear = candidates.find((r) => r.year === citation.year);
  if (exactYear) return exactYear;

  // If no year match, return the first candidate (author matched)
  return candidates[0];
}

// ═══════════════════════════════════════════════════════════════
// Footnotes — collecte et remplacement
// ═══════════════════════════════════════════════════════════════

/**
 * Collecte les notes de bas de page à partir des textes bruts des chapitres.
 * - numérotation continue (id débute à 1) dans l'ordre de première apparition ;
 * - UNE note unique par référence, partagée par toutes ses citations (CA-1.5) ;
 * - citations sans correspondance dans la bibliothèque ignorées (CA-1.3).
 */
export function collectFootnotes(
  chaptersPlainText: string[],
  references: CitationReference[],
): FootnoteEntry[] {
  const refIndex = buildReferenceIndex(references);
  const entries: FootnoteEntry[] = [];
  const byRefId = new Map<string, FootnoteEntry>();

  for (const text of chaptersPlainText) {
    if (!text) continue;
    for (const citation of extractCitationsFromText(text)) {
      const matched = findMatchingReference(citation, refIndex);
      if (!matched) continue;
      const reference = references.find((r) => r.id === matched.id);
      if (!reference) continue;

      const existing = byRefId.get(matched.id);
      if (existing) {
        existing.citations.push(citation);
        continue;
      }

      const firstAuthor =
        reference.authors.split(';')[0]?.trim().replace(/,.*$/, '').trim() || citation.author;
      const entry: FootnoteEntry = {
        id: entries.length + 1,
        reference,
        firstAuthor,
        year: reference.year,
        citations: [citation],
      };
      byRefId.set(matched.id, entry);
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Associe chaque forme littérale de citation à son identifiant de note.
 * (usage interne partagé : remplacement HTML et injection DOCX)
 */
export function buildFootnoteRawMap(entries: FootnoteEntry[]): Map<string, FootnoteRawInfo> {
  const map = new Map<string, FootnoteRawInfo>();
  for (const entry of entries) {
    for (const citation of entry.citations) {
      for (const occurrence of citation.occurrences) {
        map.set(occurrence.raw, {
          id: entry.id,
          keepAuthor: occurrence.kind === 'narrative',
        });
      }
    }
  }
  return map;
}

/**
 * Découpe un texte aux positions des citations reconnues.
 * Chaque occurrence (première comme suivantes) porte l'identifiant de sa
 * note ; les citations inconnues restent dans des segments sans note.
 * Les formes littérales les plus longues sont traitées en premier.
 */
export function splitTextAtCitations(
  text: string,
  rawMap: Map<string, FootnoteRawInfo>,
): TextSegment[] {
  if (!text || rawMap.size === 0) return [{ text, footnoteId: null }];

  const targets = [...rawMap.keys()].sort((a, b) => b.length - a.length);
  interface Occurrence {
    start: number;
    end: number;
    info: FootnoteRawInfo;
  }
  const occurrences: Occurrence[] = [];
  for (const raw of targets) {
    const info = rawMap.get(raw);
    if (!info) continue;
    const re = new RegExp(escapeRegExp(raw), 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      occurrences.push({ start: m.index, end: m.index + m[0].length, info });
    }
  }
  if (occurrences.length === 0) return [{ text, footnoteId: null }];

  occurrences.sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const occ of occurrences) {
    // Chevauchement avec une occurrence déjà traitée : ignorer.
    if (occ.start < cursor) continue;
    if (occ.start > cursor) {
      segments.push({ text: text.slice(cursor, occ.start), footnoteId: null });
    }
    const matched = text.slice(occ.start, occ.end);
    if (occ.info.keepAuthor) {
      // Narrative : conserver le nom d'auteur, remplacer « (année) » par le renvoi.
      const author = matched.replace(/\s*\((?:19|20)\d{2}\)\s*$/, '');
      if (author) segments.push({ text: author, footnoteId: null });
    }
    segments.push({ text: '', footnoteId: occ.info.id });
    cursor = occ.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), footnoteId: null });
  }
  return segments.length > 0 ? segments : [{ text, footnoteId: null }];
}

/**
 * Remplace, dans le HTML, chaque citation reconnue par son exposant de renvoi
 * `<sup class="footnote-ref" id="fn-ref-N">N</sup>` — première occurrence et
 * occurrences suivantes toutes marquées du même numéro. Les remplacements ne
 * s'appliquent qu'au texte (jamais aux balises ni à leurs attributs) ; les
 * citations sans correspondance restent intactes.
 *
 * Limites documentées : une citation fractionnée par des balises inline
 * (ex. « (Smith, <strong>2020</strong>) ») n'est pas marquée.
 */
export function replaceCitationsWithMarks(html: string, entries: FootnoteEntry[]): string {
  if (!html || entries.length === 0) return html;
  const rawMap = buildFootnoteRawMap(entries);
  if (rawMap.size === 0) return html;

  const mark = (id: number) => `<sup class="footnote-ref" id="fn-ref-${id}">${id}</sup>`;

  // Découpe balise / texte : les remplacements ne touchent que les segments de texte.
  return html
    .split(/(<[^>]+>)/g)
    .map((segment) => {
      if (segment.startsWith('<')) return segment;
      return splitTextAtCitations(segment, rawMap)
        .map((part) => (part.footnoteId != null ? `${part.text}${mark(part.footnoteId)}` : part.text))
        .join('');
    })
    .join('');
}

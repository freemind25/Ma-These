import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface AlignementRequest {
  thesisId: string;
}

interface ExtractedCitation {
  raw: string;
  authorKey: string;
  year: number;
  display: string;
}

interface ChapterIssue {
  type: 'low_density' | 'zero_citations';
  message: string;
}

interface ChapterResult {
  id: string;
  number: number;
  title: string;
  wordCount: number;
  citationCount: number;
  evidenceDensity: number;
  score: number;
  severity: 'good' | 'warning' | 'critical';
  citationsFound: string[];
  issues: ChapterIssue[];
}

interface UnreferencedCitation {
  citation: string;
  foundInChapters: number[];
}

interface UnusedReference {
  id: string;
  authors: string;
  title: string;
  year: number | null;
}

interface RoutingEntry {
  referenceTitle: string;
  citedIn: number[];
}

interface AlignementResponse {
  thesisId: string;
  thesisTitle: string;
  globalScore: number;
  totalCitations: number;
  totalReferences: number;
  matchedReferences: number;
  chapters: ChapterResult[];
  unreferencedCitations: UnreferencedCitation[];
  unusedReferences: UnusedReference[];
  routing: RoutingEntry[];
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const MAX_CITATIONS_PER_CHAPTER = 100;

// ═══════════════════════════════════════════════════════════════
// Helpers — Text sanitization
// ═══════════════════════════════════════════════════════════════

/** Strip HTML tags, returning plain text. */
function stripHtml(html: string): string {
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

/** Sanitize a string for safe inclusion in responses. */
function sanitize(s: string): string {
  return s
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // control chars except tab/newline
    .trim();
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
function buildAuthorKey(surname: string, initialLetter?: string): string {
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
 * Returns { authorKey, display } or null.
 */
function parseSingleAuthorYear(
  authorPart: string,
  yearPart: string,
): ExtractedCitation | null {
  const yearMatch = yearPart.match(/(19|20)\d{2}/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[1] + yearMatch[0].slice(-2), 10);

  const a = authorPart.trim();
  if (!a) return null;

  // Check for "Surname et al." or "Surname et" (French)
  const etAlMatch = a.match(/^(.+?)\s+et\s+al\.?$/i);
  if (etAlMatch) {
    const surname = etAlMatch[1].trim();
    return {
      raw: `${a}, ${year}`,
      authorKey: buildAuthorKey(surname),
      year,
      display: `${surname} et al. (${year})`,
    };
  }

  // Check for "Surname & Surname" or "Surname &" (French)
  const ampMatch = a.match(/^(.+?)\s+&\s*(.*)$/i);
  if (ampMatch) {
    const firstSurname = ampMatch[1].trim();
    const secondSurname = ampMatch[2].trim();
    if (secondSurname) {
      return {
        raw: `${a}, ${year}`,
        authorKey: buildAuthorKey(firstSurname),
        year,
        display: `${firstSurname} & ${secondSurname} (${year})`,
      };
    }
    return {
      raw: `${a}, ${year}`,
      authorKey: buildAuthorKey(firstSurname),
      year,
      display: `${firstSurname} (${year})`,
    };
  }

  // Check for initials + surname: "A. Smith", "A. B. Smith", "Smith, A."
  // Pattern: optional initials then surname, or "Surname, A."
  const initialSurname = a.match(/^(?:([A-Z])\.?\s+)+(\S+)$/i);
  if (initialSurname) {
    const initial = initialSurname[1];
    const surname = initialSurname[2];
    return {
      raw: `${a}, ${year}`,
      authorKey: buildAuthorKey(surname, initial),
      year,
      display: `${a} (${year})`,
    };
  }

  // Simple surname
  const surname = a.replace(/[^a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s'-]/g, '').trim();
  if (!surname) return null;

  return {
    raw: `${a}, ${year}`,
    authorKey: buildAuthorKey(surname),
    year,
    display: `${surname} (${year})`,
  };
}

/** Extract all citations from a plain-text string. Capped at MAX_CITATIONS_PER_CHAPTER. */
function extractCitations(text: string): ExtractedCitation[] {
  const citations: ExtractedCitation[] = [];
  const seen = new Set<string>();

  // 1. Parenthetical: (Author, Year) or (Author et al., Year) or (Author & Author, Year)
  //    Also handles multiple: (Author, Year; Author, Year)
  const parenPattern = /\(([^)]+?(?:19|20)\d{2}[^)]*?)\)/g;
  let match: RegExpExecArray | null;

  while ((match = parenPattern.exec(text)) !== null) {
    if (citations.length >= MAX_CITATIONS_PER_CHAPTER) break;
    const inner = match[1].trim();

    // Split by semicolons for multiple citations
    const parts = inner.split(';');
    for (const part of parts) {
      if (citations.length >= MAX_CITATIONS_PER_CHAPTER) break;
      const p = part.trim();
      // Match: <author part>, <year part>
      // Year is the last 4-digit number
      const citMatch = p.match(/^(.+?),\s*((?:19|20)\d{2})\b/);
      if (citMatch) {
        const parsed = parseSingleAuthorYear(citMatch[1], citMatch[2]);
        if (parsed && !seen.has(parsed.display)) {
          seen.add(parsed.display);
          citations.push(parsed);
        }
      }
    }
  }

  // 2. Narrative: Author (Year) at word boundary start
  //    e.g. "Smith (2021)" or "Smith et al. (2021)"
  const narrativePattern = /(?:^|(?<=[.!?\s(\[{]))((?:[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ'-]*)(?:\s+(?:et\s+al\.?|&\s*[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ'-]*))?)\s*\(((?:19|20)\d{2})\)/g;

  while ((match = narrativePattern.exec(text)) !== null) {
    if (citations.length >= MAX_CITATIONS_PER_CHAPTER) break;
    const authorPart = match[1].trim();
    const yearStr = match[2];
    const parsed = parseSingleAuthorYear(authorPart, yearStr);
    if (parsed && !seen.has(parsed.display)) {
      seen.add(parsed.display);
      citations.push(parsed);
    }
  }

  // 3. Brackets: [1], [2], etc. — store as numeric citations
  const bracketPattern = /\[(\d+)\]/g;
  while ((match = bracketPattern.exec(text)) !== null) {
    if (citations.length >= MAX_CITATIONS_PER_CHAPTER) break;
    const num = match[1];
    const display = `[${num}]`;
    if (!seen.has(display)) {
      seen.add(display);
      citations.push({
        raw: match[0],
        authorKey: `[${num}]`,
        year: 0,
        display,
      });
    }
  }

  return citations;
}

// ═══════════════════════════════════════════════════════════════
// Helpers — Reference matching
// ═══════════════════════════════════════════════════════════════

interface ReferenceMatchData {
  id: string;
  authorKey: string;
  year: number | null;
  displayTitle: string;
}

/**
 * Build an index of all references for fast lookup.
 * For each reference, we extract multiple possible author keys (one per author)
 * to increase match probability.
 */
function buildReferenceIndex(
  references: { id: string; authors: string; title: string; year: number | null }[],
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

/** Try to find a matching reference for a citation. */
function findMatchingReference(
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
// Helpers — Scoring
// ═══════════════════════════════════════════════════════════════

function computeChapterScore(
  evidenceDensity: number,
): { score: number; severity: 'good' | 'warning' | 'critical' } {
  if (evidenceDensity >= 5.0) return { score: 100, severity: 'good' };
  if (evidenceDensity >= 3.0) return { score: 85, severity: 'good' };
  if (evidenceDensity >= 1.5) return { score: 65, severity: 'warning' };
  if (evidenceDensity >= 0.5) return { score: 40, severity: 'warning' };
  if (evidenceDensity > 0) return { score: 20, severity: 'critical' };
  return { score: 0, severity: 'critical' };
}

function computeGlobalScore(
  hasUnreferenced: boolean,
  hasUnused: boolean,
  chapterDensities: number[],
  zeroCitationChapters: number,
): number {
  let score = 50;

  // +10 if all citations have matching references
  if (!hasUnreferenced) score += 10;

  // +10 if no unused references
  if (!hasUnused) score += 10;

  // +10 per chapter with density >= 3.0 (max +30)
  const highDensityCount = chapterDensities.filter((d) => d >= 3.0).length;
  score += Math.min(highDensityCount * 10, 30);

  // -10 per chapter with density < 1.0 (min -30)
  const lowDensityCount = chapterDensities.filter((d) => d < 1.0).length;
  score -= Math.min(lowDensityCount * 10, 30);

  // -5 per chapter with 0 citations
  score -= zeroCitationChapters * 5;

  return Math.max(0, Math.min(100, score));
}

function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════
// POST Handler
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // --- Parse request ---
    let body: AlignementRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Corps de requête JSON invalide.' },
        { status: 400 },
      );
    }

    const { thesisId } = body;
    if (!thesisId || typeof thesisId !== 'string') {
      return NextResponse.json(
        { error: 'Paramètre thesisId requis.' },
        { status: 400 },
      );
    }

    // --- Fetch thesis ---
    const thesis = await db.thesis.findUnique({
      where: { id: thesisId },
    });

    if (!thesis) {
      return NextResponse.json(
        { error: 'Thèse introuvable.' },
        { status: 404 },
      );
    }

    // --- Fetch chapters ---
    const chapters = await db.chapter.findMany({
      where: { thesisId },
      orderBy: [{ sortOrder: 'asc' }, { number: 'asc' }],
    });

    if (chapters.length === 0) {
      return NextResponse.json(
        { error: 'Aucun chapitre trouvé pour cette thèse.' },
        { status: 400 },
      );
    }

    // --- Fetch all global references ---
    const references = await db.reference.findMany({
      select: {
        id: true,
        authors: true,
        title: true,
        year: true,
      },
    });

    // --- Build reference index ---
    const refIndex = buildReferenceIndex(references);

    // --- Process each chapter ---
    const chapterResults: ChapterResult[] = [];
    const chapterDensities: number[] = [];
    let zeroCitationChapters = 0;

    // Track which references are cited (by ref id)
    const citedReferenceIds = new Set<string>();
    // Track routing: ref id → set of chapter numbers
    const routingMap = new Map<string, Set<number>>();
    // Track unreferenced citations: authorKey+year → { display, chapters }
    const unreferencedMap = new Map<string, { display: string; chapters: number[] }>();

    for (const chapter of chapters) {
      // Get plain text
      let plainText = chapter.plainText;
      if (!plainText && chapter.content) {
        plainText = stripHtml(chapter.content);
      }
      plainText = sanitize(plainText);

      const wordCount = chapter.wordCount > 0 ? chapter.wordCount : (plainText ? plainText.split(/\s+/).length : 0);
      const citations = extractCitations(plainText);
      const citationCount = citations.length;

      // Filter out bracket citations for evidence density (they're numbered, not author-year)
      const authorYearCitations = citations.filter((c) => !c.authorKey.startsWith('['));
      const evidenceDensity = wordCount > 0
        ? roundTo2((authorYearCitations.length / wordCount) * 1000)
        : 0;

      chapterDensities.push(evidenceDensity);
      if (citationCount === 0) zeroCitationChapters++;

      const { score, severity } = computeChapterScore(evidenceDensity);

      const issues: ChapterIssue[] = [];
      if (citationCount === 0) {
        issues.push({
          type: 'zero_citations',
          message: 'Aucune citation trouvée dans ce chapitre.',
        });
      } else if (evidenceDensity < 1.5) {
        issues.push({
          type: 'low_density',
          message: `Densité de preuves faible (${evidenceDensity} citations/1000 mots)`,
        });
      }

      const citationsFound: string[] = [];

      for (const citation of citations) {
        citationsFound.push(sanitize(citation.display));

        // Skip bracket citations for matching
        if (citation.authorKey.startsWith('[')) continue;

        const matched = findMatchingReference(citation, refIndex);
        if (matched) {
          citedReferenceIds.add(matched.id);
          const chapters = routingMap.get(matched.id) ?? new Set();
          chapters.add(chapter.number);
          routingMap.set(matched.id, chapters);
        } else {
          // Track unreferenced citation
          const mapKey = `${citation.authorKey}:${citation.year}`;
          const existing = unreferencedMap.get(mapKey);
          if (existing) {
            if (!existing.chapters.includes(chapter.number)) {
              existing.chapters.push(chapter.number);
            }
          } else {
            unreferencedMap.set(mapKey, {
              display: sanitize(citation.display),
              chapters: [chapter.number],
            });
          }
        }
      }

      chapterResults.push({
        id: chapter.id,
        number: chapter.number,
        title: sanitize(chapter.title),
        wordCount,
        citationCount,
        evidenceDensity,
        score,
        severity,
        citationsFound,
        issues,
      });
    }

    // --- Compute global score ---
    const hasUnreferenced = unreferencedMap.size > 0;
    const unusedRefs = references.filter((r: { id: string }) => !citedReferenceIds.has(r.id));
    const hasUnused = unusedRefs.length > 0;
    const globalScore = computeGlobalScore(
      hasUnreferenced,
      hasUnused,
      chapterDensities,
      zeroCitationChapters,
    );

    // --- Build unreferencedCitations array ---
    const unreferencedCitations: UnreferencedCitation[] = Array.from(
      unreferencedMap.values(),
    ).map((v) => ({
      citation: v.display,
      foundInChapters: v.chapters,
    }));

    // --- Build unusedReferences array ---
    const unusedReferences: UnusedReference[] = unusedRefs.map((r: { id: string; authors: string; title: string; year: number | null }) => ({
      id: r.id,
      authors: sanitize(r.authors.split(';')[0]?.trim() ?? ''),
      title: sanitize(r.title.slice(0, 80)),
      year: r.year,
    }));

    // --- Build routing array ---
    const routing: RoutingEntry[] = [];
    const refIdToDisplay = new Map<string, string>();
    for (const ref of references) {
      const firstAuthor = ref.authors.split(';')[0]?.trim().replace(/,.*$/, '') ?? '';
      const yearSuffix = ref.year ? ` (${ref.year})` : '';
      refIdToDisplay.set(
        ref.id,
        `${firstAuthor}${yearSuffix} — ${ref.title.slice(0, 60)}`,
      );
    }
    for (const [refId, chapterNums] of Array.from(routingMap.entries())) {
      const display = refIdToDisplay.get(refId);
      if (display) {
        routing.push({
          referenceTitle: display,
          citedIn: Array.from(chapterNums).sort((a: number, b: number) => a - b),
        });
      }
    }

    // --- Count totals ---
    const totalCitations = chapterResults.reduce((sum, c) => sum + c.citationCount, 0);

    // --- Build response ---
    const response: AlignementResponse = {
      thesisId,
      thesisTitle: sanitize(thesis.title),
      globalScore,
      totalCitations,
      totalReferences: references.length,
      matchedReferences: citedReferenceIds.size,
      chapters: chapterResults,
      unreferencedCitations,
      unusedReferences,
      routing,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[alignement-preuves] Erreur interne :', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 },
    );
  }
}

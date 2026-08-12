/**
 * Citation Extractor — Extract and track citations from AI responses.
 * Inspired by SurfSense's citation panel with source references.
 *
 * Extracts patterns like:
 * - (Author, Year)
 * - [Author, Year]
 * - (Author et al., Year)
 * - APA-style references
 * - Bracketed numbered refs [1], [2]
 */

import { db } from '@/lib/db'

// ── Types ──

export interface ExtractedCitation {
  text: string          // The raw citation text (e.g. "(Smith, 2023)")
  authors: string       // Extracted authors
  year: string | number // Extracted year
  style: 'apa' | 'mla' | 'chicago' | 'ieee' | 'numbered' | 'unknown'
  position: number      // Position in the original text
  context: string       // Surrounding text for reference
}

// ── Citation Patterns ──

const CITATION_PATTERNS: Array<{
  pattern: RegExp
  style: ExtractedCitation['style']
  extractors: (match: RegExpMatchArray) => { authors: string; year: string | number }
}> = [
  // APA: (Author, Year) or (Author et al., Year)
  {
    pattern: /\(([A-Z][a-zA-ZÀ-ÿ\s\-']+)(?:\s*(?:et\s+al\.?|&|and)\s*[A-Z][a-zA-ZÀ-ÿ\s\-']+)*,?\s*(?:\(?\s*(?:19|20)\d{2}[a-z]?\s*\)?)\)/g,
    style: 'apa',
    extractors: (match) => {
      const text = match[0]
      const yearMatch = text.match(/((?:19|20)\d{2}[a-z]?)/)
      const authors = text.replace(/\([^)]+\)/, '').replace(/[(),]/g, '').trim()
      return { authors, year: yearMatch?.[1] || '' }
    },
  },
  // MLA: [Author Page]
  {
    pattern: /\[([A-Z][a-zA-ZÀ-ÿ\s\-']+)(?:\s+\d+)?\]/g,
    style: 'mla',
    extractors: (match) => ({
      authors: match[1].trim(),
      year: '',
    }),
  },
  // Numbered: [1], [2], etc.
  {
    pattern: /\[(\d+)\]/g,
    style: 'numbered',
    extractors: (match) => ({
      authors: `[${match[1]}]`,
      year: '',
    }),
  },
]

// ── Main Extraction ──

export function extractCitations(text: string): ExtractedCitation[] {
  const citations: ExtractedCitation[] = []

  for (const { pattern, style, extractors } of CITATION_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const { authors, year } = extractors(match)
      const position = match.index
      const contextStart = Math.max(0, position - 80)
      const contextEnd = Math.min(text.length, position + match[0].length + 80)
      const context = text.slice(contextStart, contextEnd).trim()

      citations.push({
        text: match[0],
        authors,
        year,
        style,
        position,
        context,
      })
    }
  }

  // Deduplicate by position
  const seen = new Set<number>()
  return citations.filter(c => {
    if (seen.has(c.position)) return false
    seen.add(c.position)
    return true
  })
}

// ── Persist citations ──

export async function saveCitations(params: {
  citations: ExtractedCitation[]
  sessionId?: string
  chapterId?: string
  documentId?: string
}): Promise<number> {
  let saved = 0

  for (const citation of params.citations) {
    try {
      await db.citation.create({
        data: {
          documentId: params.documentId,
          chapterId: params.chapterId,
          quotedText: citation.text,
          context: citation.context,
          citationStyle: citation.style,
          referenceText: `${citation.authors}${citation.year ? `, ${citation.year}` : ''}`,
          sessionId: params.sessionId,
        },
      })
      saved++
    } catch {
      // Skip duplicates or errors silently
    }
  }

  return saved
}

// ── Get citations for a session ──

export async function getSessionCitations(sessionId: string) {
  return await db.citation.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    include: {
      document: {
        select: { id: true, title: true, sourceType: true },
      },
    },
  })
}

// ── Get citation stats ──

export async function getCitationStats() {
  const total = await db.citation.count()
  const byStyle = await db.citation.groupBy({
    by: ['citationStyle'],
    _count: true,
  })

  return {
    total,
    byStyle: Object.fromEntries(byStyle.map(g => [g.citationStyle, g._count])),
  }
}

// ── Format citations for display ──

export function formatCitationsForDisplay(citations: ExtractedCitation[]): string {
  if (citations.length === 0) return ''

  return citations.map((c, i) => {
    const ref = c.year ? `${c.authors}, ${c.year}` : c.authors
    return `[${i + 1}] ${ref}`
  }).join('  |  ')
}

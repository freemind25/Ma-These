import { NextRequest, NextResponse } from 'next/server'
import { searchCache, fetchWithRetry } from '@/lib/search-cache'

const UA = { 'User-Agent': 'ThesisFrame/1.0 (academic research tool)' }

// ─── Resolve a single paper by DOI, arXiv ID, or URL ─────────

async function resolveByCrossref(doi: string): Promise<Record<string, unknown> | null> {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`
  const res = await fetchWithRetry(url, { headers: { ...UA, 'User-Agent': 'ThesisFrame/1.0 (mailto:thesisframe@example.com)' } })
  if (!res.ok) return null
  const data = await res.json()
  return data?.message || null
}

async function resolveByOpenAlex(doi: string): Promise<Record<string, unknown> | null> {
  const url = `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}`
  const res = await fetchWithRetry(url, { headers: UA })
  if (!res.ok) return null
  return await res.json()
}

async function resolveBySemanticScholar(doi: string): Promise<Record<string, unknown> | null> {
  const url = `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=title,authors,year,abstract,citationCount,externalIds,journal,openAccessPdf,isOpenAccess`
  const res = await fetchWithRetry(url, { headers: UA })
  if (!res.ok) return null
  return await res.json()
}

async function resolveByArxiv(arxivId: string): Promise<Record<string, unknown> | null> {
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`
  const res = await fetchWithRetry(url, { headers: UA }, 2, 3000)
  if (!res.ok) return null
  const text = await res.text()
  const entry = text.split('<entry>').slice(1)[0]
  if (!entry) return null
  return { _raw: entry }
}

function parseCrossref(item: Record<string, unknown>) {
  const authors = ((item.author as Record<string, unknown>[]) || []).map(
    a => `${a.given || ''} ${a.family || ''}`.trim()
  ).join(', ')
  const year = ((item['published-print'] as Record<string, unknown>)?.date_parts as number[][])?.[0]?.[0]
    || ((item['published-online'] as Record<string, unknown>)?.date_parts as number[][])?.[0]?.[0]
    || ((item.created as Record<string, unknown>)?.date_parts as number[][])?.[0]?.[0]
  return {
    title: ((item.title as string[]) || [''])[0],
    authors,
    year: String(year || ''),
    abstract: (item.abstract as string)?.replace(/<[^>]*>/g, '') || undefined,
    source: 'Crossref',
    doi: (item.DOI as string) || undefined,
    url: (item.DOI as string) ? `https://doi.org/${item.DOI}` : undefined,
    journal: ((item['container-title'] as string[]) || [''])[0] || undefined,
    volume: (item.volume as string) || undefined,
    pages: (item.page as string) || undefined,
    issn: ((item.ISSN as string[]) || [])[0] || undefined,
    publisher: (item.publisher as string) || undefined,
    type: (item.type as string) || undefined,
  }
}

function parseOpenAlex(data: Record<string, unknown>) {
  const authorships = (data.authorships as Record<string, unknown>[]) || []
  const authors = authorships.map(a => (a.author as Record<string, string>).display_name).join(', ')
  const loc = (data.primary_location as Record<string, unknown>) || {}
  const src = (loc.source as Record<string, string>) || {}
  const oa = (data.open_access as Record<string, string>) || {}
  const doi = (data.doi as string)?.replace('https://doi.org/', '') || undefined
  return {
    title: (data.title as string) || '',
    authors,
    year: String(data.publication_year || ''),
    abstract: (data.abstract_inverted_index ? reconstructAbstract(data.abstract_inverted_index as Record<string, number[][]>) : undefined),
    source: 'OpenAlex',
    doi,
    url: oa.oa_url || (data.doi as string) || undefined,
    journal: src.display_name || undefined,
    citationCount: (data.cited_by_count as number) || 0,
    type: (data.type as string) || undefined,
  }
}

function parseSemanticScholar(data: Record<string, unknown>) {
  const authors = ((data.authors as Record<string, string>[]) || []).map(a => a.name).join(', ')
  const extIds = (data.externalIds as Record<string, string>) || {}
  const oaPdf = (data.openAccessPdf as Record<string, string>) || {}
  return {
    title: (data.title as string) || '',
    authors,
    year: String(data.year || ''),
    abstract: (data.abstract as string) || undefined,
    source: 'Semantic Scholar',
    doi: extIds.DOI || undefined,
    url: oaPdf.url || extIds.URL || undefined,
    citationCount: (data.citationCount as number) || 0,
    journal: ((data.journal as Record<string, string>) || {}).name || undefined,
    isOpenAccess: data.isOpenAccess || false,
  }
}

function parseArxiv(raw: Record<string, unknown>) {
  const entry = raw._raw as string
  const title = (entry.match(/<title>[\s\S]*?<\/title>/)?.[1] || '').replace(/\s+/g, ' ').trim()
  const authors = [...entry.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1].trim()).join(', ')
  const year = (entry.match(/<published>(\d{4})/)?.[1]) || ''
  const summary = (entry.match(/<summary>[\s\S]*?<\/summary>/)?.[1] || '').replace(/\s+/g, ' ').trim()
  const id = (entry.match(/<id>(.*?)<\/id>/)?.[1]) || ''
  const doi = (entry.match(/<doi>(.*?)<\/doi>/)?.[1]) || undefined
  const arxivId = (entry.match(/(\d{4}\.\d{4,5})/)?.[1]) || undefined
  return {
    title,
    authors,
    year,
    abstract: summary || undefined,
    source: 'arXiv',
    doi,
    url: id || undefined,
    arxivId,
    isPreprint: true,
  }
}

// Reconstruct abstract from OpenAlex inverted index
function reconstructAbstract(idx: Record<string, number[][]>): string {
  const words: { word: string; pos: number }[] = []
  for (const [word, positions] of Object.entries(idx)) {
    for (const pos of positions) {
      words.push({ word, pos: pos[0] })
    }
  }
  words.sort((a, b) => a.pos - b.pos)
  return words.map(w => w.word).join(' ')
}

// ─── Main Route ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { doi, arxivId, url } = await request.json()

    // Normalize input
    let normalizedDoi = doi || ''
    let normalizedArxivId = arxivId || ''

    // Extract DOI or arXiv ID from URL if provided
    if (url) {
      const doiMatch = url.match(/10\.\d{4,}\/[^\s]+/)
      if (doiMatch) normalizedDoi = doiMatch[0]
      const arxivMatch = url.match(/(\d{4}\.\d{4,5})/)
      if (!normalizedDoi && arxivMatch) normalizedArxivId = arxivMatch[1]
      // Handle arxiv.org/abs/XXXX.XXXXX format
      if (!normalizedDoi && !normalizedArxivId) {
        const absMatch = url.match(/abs\/(\d{4}\.\d{4,5})/)
        if (absMatch) normalizedArxivId = absMatch[1]
      }
    }

    if (!normalizedDoi && !normalizedArxivId) {
      return NextResponse.json({ error: 'DOI, arXiv ID, or URL is required' }, { status: 400 })
    }

    // Check cache first
    const cached = searchCache.getByIdentifier(normalizedDoi || undefined, normalizedArxivId || undefined)
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }

    // Resolve from multiple sources in parallel
    const results: Record<string, unknown>[] = []
    const sources: string[] = []

    if (normalizedDoi) {
      // Query Crossref + OpenAlex + Semantic Scholar in parallel
      const [cr, oa, ss] = await Promise.allSettled([
        resolveByCrossref(normalizedDoi),
        resolveByOpenAlex(normalizedDoi),
        resolveBySemanticScholar(normalizedDoi),
      ])
      if (cr.status === 'fulfilled' && cr.value) { results.push(cr.value); sources.push('Crossref') }
      if (oa.status === 'fulfilled' && oa.value) { results.push(oa.value); sources.push('OpenAlex') }
      if (ss.status === 'fulfilled' && ss.value) { results.push(ss.value); sources.push('Semantic Scholar') }
    }

    if (normalizedArxivId) {
      const ax = await resolveByArxiv(normalizedArxivId)
      if (ax) { results.push(ax); sources.push('arXiv') }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: 'Paper not found in any database' }, { status: 404 })
    }

    // Merge into a single rich result (pick best data from each source)
    let best: Record<string, unknown> = {}
    for (const r of results) {
      const source = (r.source as string) || sources[results.indexOf(r)]
      if (source === 'Crossref') {
        best = { ...parseCrossref(r) }
      } else if (source === 'OpenAlex') {
        const parsed = parseOpenAlex(r)
        if (!best.title) {
          best = parsed as unknown as Record<string, unknown>
        } else {
          if (!best.abstract && parsed.abstract) best.abstract = parsed.abstract
          if (!best.citationCount && parsed.citationCount) best.citationCount = parsed.citationCount
          if ((parsed as Record<string, unknown>).isOpenAccess && !best.url) best.url = parsed.url
        }
      } else if (source === 'Semantic Scholar') {
        const parsed = parseSemanticScholar(r)
        if (!best.title) {
          best = parsed as unknown as Record<string, unknown>
        } else {
          if (!best.abstract && parsed.abstract) best.abstract = parsed.abstract
          if (!best.citationCount && parsed.citationCount) best.citationCount = parsed.citationCount
          if (parsed.isOpenAccess && !best.url) best.url = parsed.url
        }
      } else if (source === 'arXiv') {
        best = { ...parseArxiv(r) }
      }
    }

    // Cache the result
    const finalDoi = (best.doi as string) || normalizedDoi || undefined
    const finalArxivId = (best.arxivId as string) || normalizedArxivId || undefined
    if (finalDoi) searchCache.setByDoi(best as unknown as Parameters<typeof searchCache.setByDoi>[0])
    if (finalArxivId && best.title) searchCache.setByArxiv(best as unknown as Parameters<typeof searchCache.setByArxiv>[0], finalArxivId)

    // Remove internal fields
    const { _sources, ...paper } = best
    return NextResponse.json({ ...paper, resolvedFrom: sources })
  } catch (error) {
    console.error('[POST /api/literature-search/doi-lookup] Error:', error)
    return NextResponse.json({ error: 'DOI lookup failed' }, { status: 500 })
  }
}

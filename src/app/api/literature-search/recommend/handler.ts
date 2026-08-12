import { NextRequest, NextResponse } from 'next/server'
import { cacheSearchResult } from '@/lib/search-cache'

const UA = { 'User-Agent': 'ThesisFrame/1.0 (academic research tool)' }

// ─── Types ──────────────────────────────────────────────────
interface RecommendedPaper {
  title: string
  authors: string
  year: string
  abstract?: string
  source: string
  doi?: string
  url?: string
  citationCount?: number
  journal?: string
  isPreprint?: boolean
  intent?: string[] // S2: why this paper was recommended
}

// ─── POST /api/literature-search/recommend ──────────────────
// Uses Semantic Scholar Recommendations API
// https://api.semanticscholar.org/recommendations/v1/
//
// Body: { positivePaperIds?: string[], negativePaperIds?: string[], doi?: string, limit?: number, s2ApiKey?: string }
//
// positivePaperIds: S2 paper IDs (CorpusId:xxx, DOI:xxx, ArXiv:xxx, PMCID:xxx)
// negativePaperIds: papers to exclude from recommendations
// doi: convenience — auto-resolved to DOI:xxx format
export async function POST(request: NextRequest) {
  try {
    const { positivePaperIds, negativePaperIds, doi, limit = 10, s2ApiKey }: { positivePaperIds?: string[]; negativePaperIds?: string[]; doi?: string; limit?: number; s2ApiKey?: string } = await request.json()

    // Build positive IDs from explicit list or single DOI
    let positive: string[] = positivePaperIds || []
    if (doi && positive.length === 0) {
      positive = [`DOI:${doi}`]
    }
    if (positive.length === 0) {
      return NextResponse.json({ error: 'Provide positivePaperIds or doi' }, { status: 400 })
    }

    // S2 Recommendations API: POST /papers/recommendations
    const url = 'https://api.semanticscholar.org/recommendations/v1/papers/recommendations'
    const headers: Record<string, string> = {
      ...UA,
      'Content-Type': 'application/json',
    }
    if (s2ApiKey) headers['x-api-key'] = s2ApiKey

    const body = {
      positivePaperIds: positive.slice(0, 10), // max 10 positive
      negativePaperIds: (negativePaperIds || []).slice(0, 100),
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return NextResponse.json(
        { error: `S2 Recommendations API returned ${res.status}`, details: errText.slice(0, 500) },
        { status: res.status },
      )
    }

    const data = await res.json()
    const recommendations: RecommendedPaper[] = (data.recommendedPapers || []).map(
      (p: Record<string, unknown>) => {
        const authors = ((p.authors as Record<string, string>[]) || []).map(a => a.name).join(', ')
        const extIds = (p.externalIds as Record<string, string>) || {}
        const oaPdf = (p.openAccessPdf as Record<string, string>) || {}
        const intent = (p.intent as string[]) || []
        const r: RecommendedPaper = {
          title: String(p.title || ''),
          authors,
          year: String(p.year || ''),
          abstract: (p.abstract as string) || undefined,
          source: 'S2 Recommendations',
          doi: extIds.DOI || undefined,
          url: oaPdf.url || extIds.URL || undefined,
          citationCount: (p.citationCount as number) || 0,
          journal: ((p.journal as Record<string, string>) || {}).name || undefined,
          isPreprint: (p.publicationTypes as string[])?.includes('Preprint') || false,
          intent,
        }
        cacheSearchResult(r)
        return r
      },
    ).slice(0, limit)

    return NextResponse.json({
      query: `recommendations for ${positive.slice(0, 3).join(', ')}`,
      totalResults: recommendations.length,
      results: recommendations,
    })
  } catch (error) {
    console.error('[POST /api/literature-search/recommend] Error:', error)
    return NextResponse.json({ error: 'Recommendation failed' }, { status: 500 })
  }
}

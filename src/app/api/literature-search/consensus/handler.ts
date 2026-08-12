import { NextRequest, NextResponse } from 'next/server'

const CONSENSUS_API = 'https://api.consensus.app'

interface ConsensusPaper {
  id?: string
  title?: string
  authors?: { name: string }[]
  year?: number
  abstract?: string
  doi?: string
  url?: string
  citation_count?: number
  journal?: { name?: string }
  tldr?: string
  consensus?: {
    score?: number
    label?: string
  }
}

interface ConsensusResponse {
 results?: {
    papers?: ConsensusPaper[]
    synthesized_answer?: string
    consensus_answer?: string
    answer?: string
  }
  error?: string
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, apiKey, limit = 10 } = body

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query requise' }, { status: 400 })
    }

    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: 'Clé API Consensus requise. Obtenez-en une gratuite sur consensus.app' },
        { status: 400 }
      )
    }

    // Call Consensus AI API
    const response = await fetch(`${CONSENSUS_API}/v1/quick_search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        num_results: Math.min(limit, 20),
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      if (response.status === 401) {
        return NextResponse.json({ error: 'Clé API Consensus invalide' }, { status: 401 })
      }
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit atteint. Réessayez dans quelques secondes.' }, { status: 429 })
      }
      return NextResponse.json(
        { error: `Erreur Consensus API (${response.status}): ${errText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const data: ConsensusResponse = await response.json()

    // Extract the synthesized answer
    const answer = data.results?.synthesized_answer
      || data.results?.consensus_answer
      || data.results?.answer
      || ''

    // Map papers to our SearchResult format
    const papers = (data.results?.papers || []).slice(0, limit).map((p: ConsensusPaper, i: number) => ({
      title: p.title || 'Sans titre',
      authors: p.authors?.map(a => a.name).join(', ') || '',
      year: String(p.year || ''),
      abstract: p.abstract || p.tldr || undefined,
      source: 'Consensus AI',
      doi: p.doi || undefined,
      url: p.url || (p.doi ? `https://doi.org/${p.doi}` : undefined),
      citationCount: p.citation_count || undefined,
      journal: p.journal?.name || undefined,
      consensusScore: p.consensus?.score || undefined,
      consensusLabel: p.consensus?.label || undefined,
      tldr: p.tldr || undefined,
      _idx: i,
    }))

    return NextResponse.json({
      answer,
      papers,
      totalPapers: data.results?.papers?.length || 0,
    })
  } catch (err) {
    console.error('[Consensus API Error]', err)
    return NextResponse.json({ error: 'Erreur interne lors de la requête Consensus' }, { status: 500 })
  }
}

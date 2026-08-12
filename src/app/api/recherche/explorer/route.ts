import { NextRequest, NextResponse } from 'next/server'

/**
 * Explorer — recherche documentaire externe via OpenAlex (gratuit, sans clé)
 * + CrossRef pour métadonnées DOI
 * + HAL pour publications francophones
 *
 * Ne renvoie que des métadonnées factuelles — jamais de résumé généré.
 */

interface OpenAlexWork {
  id: string
  title: string
  display_name?: string
  publication_year?: number
  doi?: string
  type?: string
  cited_by_count?: number
  primary_location?: {
    source?: { display_name?: string; issn_l?: string }
    pdf_url?: string
  }
  authorships?: Array<{
    author?: { display_name?: string }
    institutions?: Array<{ display_name?: string }>
  }>
  abstract_inverted_index?: Record<string, number[][]>
  topics?: Array<{ display_name?: string }>
}

interface CrossRefWork {
  title?: string[]
  author?: Array<{ given?: string; family?: string }>
  published?: { date_parts?: number[][] }
  DOI?: string
  type?: string
  'container-title'?: string[]
  volume?: string
  page?: string
  'is-referenced-by-count'?: number
  abstract?: string
}

interface HalDoc {
  docid: number
  title_s?: string[]
  author_s?: string[]
  producedDate_s?: string[]
  doi_s?: string[]
  abstract_s?: string[]
  instStruct_s?: Array<{ name_s?: string[] }>
  journalTitle_s?: string[]
  uri_s?: string[]
  submitType_s?: string[]
}

function authorsToString(authors: Array<{ display_name?: string; given?: string; family?: string }> | undefined): string {
  if (!authors) return ''
  return authors.map(a => a.display_name || `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean).join(', ')
}

function reconstructAbstract(index: Record<string, number[][]> | undefined): string | null {
  if (!index) return null
  const pairs: Array<[string, number]> = []
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) {
      pairs.push([word, pos[0]])
    }
  }
  pairs.sort((a, b) => a[1] - b[1])
  return pairs.map(p => p[0]).join(' ')
}

async function searchOpenAlex(query: string, filters: Record<string, string>): Promise<Array<Record<string, unknown>>> {
  const params = new URLSearchParams({ search: query, per_page: '15', mailto: 'thesisframe@example.com' })
  if (filters.from_year) params.set('filter:from_publication_date', filters.from_year + '-01-01')
  if (filters.to_year) params.set('filter:to_publication_date', filters.to_year + '-12-31')
  if (filters.type) params.set('filter:type', filters.type)
  if (filters.language) params.set('filter:language', filters.language)

  const res = await fetch(`https://api.openalex.org/works?${params}`, {
    headers: { 'User-Agent': 'ThesisFrame/1.0 (mailto:thesisframe@example.com)' },
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json()
  const works: OpenAlexWork[] = data.results || []

  return works.map(w => ({
    titre: w.display_name || w.title || '',
    auteurs: authorsToString(w.authorships?.map(a => ({ display_name: a.author?.display_name, given: a.author?.display_name?.split(' ')[0], family: a.author?.display_name?.split(' ').slice(-1)[0] }))),
    annee: w.publication_year || null,
    doi: w.doi?.replace('https://doi.org/', '') || null,
    type: w.type || 'article',
    journal: w.primary_location?.source?.display_name || null,
    citationCount: w.cited_by_count || 0,
    abstract: reconstructAbstract(w.abstract_inverted_index),
    url: w.doi || w.primary_location?.pdf_url || null,
    sourceApi: 'openalex',
    topics: w.topics?.map(t => t.display_name).filter(Boolean).slice(0, 3) || [],
  }))
}

async function searchCrossRef(query: string, filters: Record<string, string>): Promise<Array<Record<string, unknown>>> {
  const params = new URLSearchParams({ q: query, rows: '10' })
  if (filters.from_year) params.set('from_pub_date', filters.from_year)
  if (filters.to_year) params.set('until_pub_date', filters.to_year)
  if (filters.type) params.set('filter', `type:${filters.type}`)

  const res = await fetch(`https://api.crossref.org/works?${params}`, {
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json()
  const items: CrossRefWork[] = data.message?.items || []

  return items.map(w => ({
    titre: (w.title || []).join(' '),
    auteurs: (w.author || []).map(a => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean).join(', '),
    annee: w.published?.date_parts?.[0]?.[0] || null,
    doi: w.DOI || null,
    type: w.type || 'article',
    journal: (w['container-title'] || []).join(', '),
    volume: w.volume || null,
    pages: w.page || null,
    citationCount: w['is-referenced-by-count'] || 0,
    abstract: w.abstract || null,
    url: w.DOI ? `https://doi.org/${w.DOI}` : null,
    sourceApi: 'crossref',
  }))
}

async function searchHal(query: string, _filters: Record<string, string>): Promise<Array<Record<string, unknown>>> {
  const params = new URLSearchParams({ q: query, rows: '10' })
  const res = await fetch(`https://api.archives-ouvertes.fr/search/?${params}`, {
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json()
  const docs: HalDoc[] = data.response?.docs || []

  return docs.map(d => ({
    titre: (d.title_s || [])[0] || '',
    auteurs: (d.author_s || []).join(', '),
    annee: d.producedDate_s?.[0] ? parseInt(d.producedDate_s[0].substring(0, 4), 10) || null : null,
    doi: (d.doi_s || [])[0] || null,
    type: (d.submitType_s || [])[0] || 'article',
    journal: (d.journalTitle_s || [])[0] || null,
    abstract: (d.abstract_s || [])[0] || null,
    url: (d.uri_s || [])[0] || null,
    sourceApi: 'hal',
    institutions: (d.instStruct_s || []).map(i => (i.name_s || [])[0]).filter(Boolean).slice(0, 2),
  }))
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const sources = (searchParams.get('sources') || 'openalex,crossref,hal').split(',')
    const from_year = searchParams.get('from_year') || ''
    const to_year = searchParams.get('to_year') || ''
    const type = searchParams.get('type') || ''
    const language = searchParams.get('language') || ''

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [], error: 'Requête trop courte (min 2 caractères)' })
    }

    const filters = { from_year, to_year, type, language }
    const allResults: Array<Record<string, unknown>> = []
    const errors: string[] = []

    const promises = sources.map(async (source) => {
    try {
      let results: Array<Record<string, unknown>> = []
      switch (source.trim()) {
        case 'openalex':
          results = await searchOpenAlex(query, filters)
          break
        case 'crossref':
          results = await searchCrossRef(query, filters)
          break
        case 'hal':
          results = await searchHal(query, filters)
          break
        default:
          return
      }
      allResults.push(...results)
    } catch (e) {
      errors.push(`${source}: ${e instanceof Error ? e.message : 'erreur'}`)
    }
    })

    await Promise.allSettled(promises)

    // Deduplicate by DOI or title
    const seen = new Set<string>()
    const deduped = allResults.filter(r => {
      const key = (r.doi as string) || (r.titre as string)?.toLowerCase().slice(0, 80)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json({ results: deduped, errors: errors.length > 0 ? errors : undefined, total: deduped.length })
  } catch (error) {
    console.error('[recherche/explorer]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

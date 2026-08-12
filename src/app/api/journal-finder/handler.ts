// ─── Open Access Journal Finder API ──────────────────────────
// Searches OpenAlex + DOAJ for OA journals matching a manuscript field/query.
// Uses LLM to rank by relevance. Inspired by SciSpace's OA Journal Finder.

import { NextRequest, NextResponse } from 'next/server'
import { fetchWithRetry } from '@/lib/search-cache'

// ─── Types ────────────────────────────────────────────────────
interface JournalResult {
  id: string
  name: string
  issn: string | null
  homepageUrl: string | null
  publisher: string | null
  countryCode: string | null
  countryName: string | null
  apc: number | null
  apcCurrency: string | null
  isDoaj: boolean
  isScopus: boolean
  license: string | null
  reviewProcess: string | null
  subjects: string[]
  topics: string[]
  worksCount: number
  citedByCount: number
  firstPublicationYear: number | null
  submissionUrl: string | null
  relevanceScore?: number
  source: 'openalex' | 'doaj' | 'both'
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'États-Unis', GB: 'Royaume-Uni', DE: 'Allemagne', FR: 'France',
  NL: 'Pays-Bas', CH: 'Suisse', CN: 'Chine', JP: 'Japon', KR: 'Corée du Sud',
  IN: 'Inde', BR: 'Brésil', AU: 'Australie', CA: 'Canada', IT: 'Italie',
  ES: 'Espagne', SE: 'Suède', DK: 'Danemark', NO: 'Norvège', FI: 'Finlande',
  PL: 'Pologne', AT: 'Autriche', BE: 'Belgique', PT: 'Portugal', IE: 'Irlande',
  SG: 'Singapour', TW: 'Taïwan', MY: 'Malaisie', TR: 'Turquie', IR: 'Iran',
  SA: 'Arabie Saoudite', AE: 'Émirats Arabes Unis', ZA: 'Afrique du Sud',
  EG: 'Égypte', NG: 'Nigéria', KE: 'Kenya', MX: 'Mexique', AR: 'Argentine',
  CL: 'Chili', CO: 'Colombie', CZ: 'Tchéquie', HU: 'Hongrie', RO: 'Roumanie',
  RU: 'Russie', UA: 'Ukraine', IL: 'Israël', NZ: 'Nouvelle-Zélande',
  TH: 'Thaïlande', VN: 'Viêt Nam', ID: 'Indonésie', PH: 'Philippines',
  PK: 'Pakistan', BD: 'Bangladesh', LK: 'Sri Lanka', NP: 'Népal',
}

// ─── OpenAlex Journal Search ─────────────────────────────────
async function searchOpenAlexJournals(
  query: string,
  filters: { maxApc?: number; doajOnly?: boolean; freeOnly?: boolean }
): Promise<JournalResult[]> {
  let filterStr = 'is_oa:true'
  if (filters.doajOnly) filterStr = 'is_oa:true,is_in_doaj:true'
  if (filters.freeOnly) {
    filterStr = filters.doajOnly
      ? 'is_oa:true,is_in_doaj:true,apc_usd:0'
      : 'is_oa:true,apc_usd:0'
  }

  const params = new URLSearchParams({
    filter: filterStr,
    search: query,
    per_page: '50',
    sort: 'relevance_score:desc',
    select: 'id,display_name,issn_l,homepage_url,host_organization_name,apc_prices,is_oa,country_code,works_count,cited_by_count,topics,is_in_doaj,is_indexed_in_scopus,first_publication_year,type',
  })

  const url = `https://api.openalex.org/journals?${params.toString()}`
  const resp = await fetchWithRetry(url, { headers: { 'User-Agent': 'ThesisFrame/1.0' } })
  if (!resp.ok) return []
  const data = await resp.json()

  return (data.results || []).map((j: Record<string, unknown>) => {
    const apcPrices = j.apc_prices as Array<{ price: number; currency: string }> | null
    const apcUsd = apcPrices?.find((p: { currency: string }) => p.currency === 'USD')?.price ?? null
    const topics = ((j.topics as Array<{ display_name: string }>) || []).map(t => t.display_name)

    return {
      id: j.id as string,
      name: j.display_name as string,
      issn: (j.issn_l as string) || null,
      homepageUrl: (j.homepage_url as string) || null,
      publisher: (j.host_organization_name as string) || null,
      countryCode: (j.country_code as string) || null,
      countryName: COUNTRY_NAMES[(j.country_code as string)] || (j.country_code as string) || null,
      apc: apcUsd,
      apcCurrency: 'USD',
      isDoaj: (j.is_in_doaj as boolean) || false,
      isScopus: (j.is_indexed_in_scopus as boolean) || false,
      license: null,
      reviewProcess: null,
      subjects: [],
      topics: topics.slice(0, 5),
      worksCount: (j.works_count as number) || 0,
      citedByCount: (j.cited_by_count as number) || 0,
      firstPublicationYear: (j.first_publication_year as number) || null,
      submissionUrl: (j.homepage_url as string) || null,
      source: 'openalex' as const,
    }
  })
}

// ─── DOAJ Journal Search ─────────────────────────────────────
async function searchDoajJournals(
  query: string,
  filters: { maxApc?: number; doajOnly?: boolean; freeOnly?: boolean }
): Promise<JournalResult[]> {
  // DOAJ API uses path-based search: /api/search/journals/{query}?pageSize=N
  const encodedQuery = encodeURIComponent(query)
  const url = `https://doaj.org/api/search/journals/${encodedQuery}?pageSize=50`
  let resp: Response
  try {
    resp = await fetchWithRetry(url, { headers: { 'User-Agent': 'ThesisFrame/1.0' } })
  } catch (e) {
    console.error('DOAJ fetch error:', e)
    return []
  }
  if (!resp.ok) {
    console.error('DOAJ status:', resp.status, resp.statusText)
    return []
  }
  const data = await resp.json()

  const results: JournalResult[] = []
  for (const r of (data.results || []) as Array<Record<string, unknown>>) {
    const bibjson = r.bibjson as Record<string, unknown>
    const apc = bibjson.apc as Record<string, unknown> | null
    const hasApc = apc?.has_apc as boolean | undefined
    const apcMax = apc?.max as Array<{ price: number; currency: string }> | undefined
    const apcPrice = apcMax?.[0]?.price ?? null
    const license = ((bibjson.license as Array<{ type: string }>) || [])[0]?.type || null
    const subjects = ((bibjson.subject as Array<{ term: string }>) || []).map(s => s.term)
    const publisher = bibjson.publisher as Record<string, string> | null
    const editorial = bibjson.editorial as Record<string, unknown> | null
    const reviewProcess = ((editorial?.review_process as string[]) || [])[0] || null
    const refs = bibjson.ref as Record<string, string> | null

    if (filters.freeOnly && hasApc) continue
    if (filters.maxApc && apcPrice && apcPrice > filters.maxApc) continue

    results.push({
      id: r.id as string,
      name: bibjson.title as string,
      issn: (bibjson.eissn as string) || (bibjson.pissn as string) || null,
      homepageUrl: refs?.journal || null,
      publisher: publisher?.name || null,
      countryCode: publisher?.country || null,
      countryName: COUNTRY_NAMES[publisher?.country || ''] || publisher?.country || null,
      apc: hasApc ? apcPrice : 0,
      apcCurrency: apcMax?.[0]?.currency || null,
      isDoaj: true,
      isScopus: false,
      license,
      reviewProcess,
      subjects,
      topics: subjects.slice(0, 3),
      worksCount: 0,
      citedByCount: 0,
      firstPublicationYear: bibjson.oa_start as number || null,
      submissionUrl: refs?.author_instructions || null,
      source: 'doaj' as const,
    })
  }
  return results
}

// ─── Merge & Deduplicate ─────────────────────────────────────
function mergeJournals(openalex: JournalResult[], doaj: JournalResult[]): JournalResult[] {
  const map = new Map<string, JournalResult>()
  for (const j of openalex) {
    const key = j.issn || j.name.toLowerCase()
    map.set(key, j)
  }
  for (const d of doaj) {
    const key = d.issn || d.name.toLowerCase()
    const existing = map.get(key)
    if (existing) {
      if (d.license) existing.license = d.license
      if (d.reviewProcess) existing.reviewProcess = d.reviewProcess
      if (d.subjects.length > existing.subjects.length) existing.subjects = d.subjects
      if (d.submissionUrl) existing.submissionUrl = d.submissionUrl
      existing.isDoaj = true
      existing.source = 'both'
      if (existing.apc === null && d.apc !== null) {
        existing.apc = d.apc
        existing.apcCurrency = d.apcCurrency
      }
    } else {
      map.set(key, d)
    }
  }
  return Array.from(map.values())
}

// ─── LLM Relevance Ranking ───────────────────────────────────
async function rankWithLLM(
  journals: JournalResult[],
  manuscriptContext: string
): Promise<JournalResult[]> {
  if (journals.length <= 3 || !manuscriptContext.trim()) return journals

  const journalList = journals.slice(0, 30).map((j, i) => {
    const parts = [
      `${i + 1}. ${j.name}`,
      `   Éditeur: ${j.publisher || 'N/A'}`,
      `   Sujets: ${(j.topics.length ? j.topics : j.subjects).join(', ') || 'N/A'}`,
    ]
    if (j.apc !== null) parts.push(`   APC: ${j.apc === 0 ? 'Gratuit' : `${j.apc} ${j.apcCurrency}`}`)
    return parts.join('\n')
  }).join('\n')

  const prompt = `Tu es un expert en publication scientifique. Un chercheur prépare un manuscrit avec le contexte suivant :

${manuscriptContext}

Voici une liste de journaux scientifiques en accès ouvert. Classe-les par pertinence pour ce manuscrit (du plus au moins adapté).

Considère :
- L'adéquation du champ/sujet du journal avec le manuscrit
- La réputation du journal (nombre de publications, citations)
- Le coût APC (les gratuits sont un plus)
- L'indexation (DOAJ, Scopus)

${journalList}

Réponds UNIQUEMENT avec un objet JSON : { "ranked": [indices dans l'ordre, ex: [3,7,1,...]], "reasons": { "3": "raison courte", "7": "raison courte", ... } }
Ne donne pas plus de 15 raisons. Les indices commencent à 1.`

  try {
    const zai = await (await import('z-ai-web-dev-sdk')).default.create()
    const result = await zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
    })

    const content = result.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return journals

    const parsed = JSON.parse(jsonMatch[0])
    const ranked: number[] = parsed.ranked || []

    const journalMap = new Map(journals.slice(0, 30).map((j, i) => [i + 1, j]))
    const rankedJournals: JournalResult[] = []
    const seen = new Set<string>()

    for (const idx of ranked) {
      const j = journalMap.get(idx as number)
      if (j && !seen.has(j.id)) {
        seen.add(j.id)
        j.relevanceScore = 1 - (ranked.indexOf(idx) / ranked.length)
        rankedJournals.push(j)
      }
    }

    for (const j of journals) {
      if (!seen.has(j.id)) rankedJournals.push(j)
    }

    return rankedJournals
  } catch (error) {
    console.error('LLM ranking failed:', error)
    return journals
  }
}

// ─── Main Route ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, title, abstract, field, maxApc, doajOnly, freeOnly, sort } = body as {
      query?: string
      title?: string
      abstract?: string
      field?: string
      maxApc?: number
      doajOnly?: boolean
      freeOnly?: boolean
      sort?: string
    }

    const searchQuery = query || field || title || 'science'
    if (!searchQuery || searchQuery.trim().length < 2) {
      return NextResponse.json({ error: 'Requête trop courte (min. 2 caractères)' }, { status: 400 })
    }

    const manuscriptContext = [
      title ? `Titre : ${title}` : null,
      abstract ? `Résumé : ${abstract.slice(0, 1000)}` : null,
      field ? `Domaine : ${field}` : null,
    ].filter(Boolean).join('\n')

    const [openalexResults, doajResults] = await Promise.allSettled([
      searchOpenAlexJournals(searchQuery, { maxApc, doajOnly, freeOnly }),
      searchDoajJournals(searchQuery, { maxApc, doajOnly, freeOnly }),
    ])

    const openalex = openalexResults.status === 'fulfilled' ? openalexResults.value : []
    const doaj = doajResults.status === 'fulfilled' ? doajResults.value : []

    let merged = mergeJournals(openalex, doaj)

    if (maxApc) {
      merged = merged.filter(j => j.apc === null || j.apc === 0 || j.apc <= maxApc)
    }

    if (manuscriptContext) {
      merged = await rankWithLLM(merged, manuscriptContext)
    }

    if (sort === 'apc_asc') {
      merged.sort((a, b) => (a.apc ?? Infinity) - (b.apc ?? Infinity))
    } else if (sort === 'citations_desc') {
      merged.sort((a, b) => b.citedByCount - a.citedByCount)
    } else if (sort === 'works_desc') {
      merged.sort((a, b) => b.worksCount - a.worksCount)
    } else if (sort === 'name_asc') {
      merged.sort((a, b) => a.name.localeCompare(b.name))
    }

    return NextResponse.json({
      results: merged,
      total: merged.length,
      sources: { openalex: openalex.length, doaj: doaj.length, merged: merged.length },
      ranked: !!manuscriptContext,
    })
  } catch (error) {
    console.error('Journal finder error:', error)
    return NextResponse.json({ error: 'Erreur lors de la recherche de journaux' }, { status: 500 })
  }
}

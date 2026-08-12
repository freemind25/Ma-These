import { NextRequest, NextResponse } from 'next/server'
import { searchCache, cacheSearchResult, fetchWithRetry } from '@/lib/search-cache'

// ─── Types ──────────────────────────────────────────────────
interface SearchResult {
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
}

const UA = { 'User-Agent': 'ThesisFrame/1.0 (academic research tool)' }

// ─── Semantic Scholar (bulk + API key) ────────────────────
async function searchSemanticScholar(query: string, limit: number, apiKey?: string): Promise<SearchResult[]> {
  // Bulk endpoint returns more data per request, fewer round-trips
  // Fields: only what we need (per S2 tutorial: limit fields for speed)
  const fields = 'title,authors,year,citationCount,externalIds,journal,openAccessPdf'
  const url = `https://api.semanticscholar.org/graph/v1/paper/search/bulk?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`
  const headers: Record<string, string> = { ...UA }
  if (apiKey) headers['x-api-key'] = apiKey
  const res = await fetchWithRetry(url, { headers }, 2, apiKey ? 1000 : 3000)
  if (!res.ok) return []
  const data = await res.json()
  const papers = (data.data || data || []) as Record<string, unknown>[]
  return papers.map(p => {
    const authors = ((p.authors as Record<string, string>[]) || []).map(a => a.name).join(', ')
    const extIds = (p.externalIds as Record<string, string>) || {}
    const oaPdf = (p.openAccessPdf as Record<string, string>) || {}
    const r: SearchResult = {
      title: String(p.title || ''),
      authors,
      year: String(p.year || ''),
      abstract: (p.abstract as string) || undefined,
      source: 'Semantic Scholar',
      doi: extIds.DOI || undefined,
      url: oaPdf.url || extIds.URL || undefined,
      citationCount: (p.citationCount as number) || 0,
      journal: ((p.journal as Record<string, string>) || {}).name || undefined,
    }
    cacheSearchResult(r)
    return r
  })
}

// ─── OpenAlex (no key, generous, 250M+ works) ───────────────
function invertAbstractIndex(index: Record<string, Record<string, number>>): string {
  if (!index) return ''
  const tokens: string[] = []
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of Object.keys(positions)) {
      tokens[parseInt(pos)] = word
    }
  }
  return tokens.join(' ')
}

async function searchOpenAlex(query: string, limit: number, lang?: string): Promise<SearchResult[]> {
  let url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${limit}&select=id,title,authorships,publication_year,cited_by_count,doi,primary_location,type,open_access,is_retracted,abstract_inverted_index,topics,language`
  if (lang && lang !== 'all') {
    url += `&filter=language:${lang}`
  }
  const res = await fetchWithRetry(url, { headers: UA })
  if (!res.ok) return []
  const data = await res.json()
  return (data.results || []).map((r: Record<string, unknown>) => {
    const authorships = (r.authorships as Record<string, unknown>[]) || []
    const authors = authorships.map(a => (a.author as Record<string, string>).display_name).join(', ')
    const loc = (r.primary_location as Record<string, unknown>) || {}
    const source = (loc.source as Record<string, string>) || {}
    const oa = (r.open_access as Record<string, string>) || {}
    const doi = (r.doi as string)?.replace('https://doi.org/', '') || undefined
    // Extract abstract from inverted index
    const abstract = invertAbstractIndex(r.abstract_inverted_index as Record<string, Record<string, number>>)
    // Best PDF URL: oa_url > primary_location.pdf_url > landing_page
    const pdfUrl = (loc as any).pdf_url || oa.oa_url || undefined
    const landingUrl = (loc as any).landing_page_url || (r.doi as string) || undefined
    const result: SearchResult = {
      title: String(r.title || ''),
      authors,
      year: String(r.publication_year || ''),
      source: 'OpenAlex',
      doi,
      url: pdfUrl || landingUrl,
      abstract: abstract || undefined,
      citationCount: (r.cited_by_count as number) || 0,
      journal: source.display_name || undefined,
      isPreprint: (r.type as string) === 'preprint',
    }
    cacheSearchResult(result)
    return result
  })
}

// ─── Crossref (polite pool, ~50 req/s) ──────────────────────
async function searchCrossref(query: string, limit: number): Promise<SearchResult[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}&select=title,author,published-print,DOI,abstract,container-title,type`
  const res = await fetchWithRetry(url, {
    headers: { ...UA, 'User-Agent': 'ThesisFrame/1.0 (mailto:thesisframe@example.com)' },
  })
  if (!res.ok) return []
  const data = await res.json()
  const msg = data?.message as Record<string, unknown> | undefined
  const items = (msg?.items as Record<string, unknown>[]) || []
  return items.map(item => {
    const authors = ((item.author as Record<string, unknown>[]) || []).map(
      a => `${a.given || ''} ${a.family || ''}`.trim()
    ).join(', ')
    const year = ((item['published-print'] as Record<string, unknown>)?.date_parts as number[][])?.[0]?.[0]
    const doi = (item.DOI as string) || undefined
    const r: SearchResult = {
      title: ((item.title as string[]) || [''])[0],
      authors,
      year: String(year || ''),
      abstract: (item.abstract as string)?.replace(/<[^>]*>/g, '') || undefined,
      source: 'Crossref',
      doi,
      url: doi ? `https://doi.org/${doi}` : undefined,
      isPreprint: (item.type as string) === 'posted-content',
    }
    cacheSearchResult(r)
    return r
  })
}

// ─── arXiv (3 sec between requests — we use retry) ──────────
async function searchArxiv(query: string, limit: number): Promise<SearchResult[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`
  const res = await fetchWithRetry(url, { headers: UA }, 2, 3000) // 3s base delay for arXiv
  if (!res.ok) return []
  const text = await res.text()
  const results: SearchResult[] = []
  const entries = text.split('<entry>').slice(1)
  for (const entry of entries.slice(0, limit)) {
    const title = (entry.match(/<title>[\s\S]*?<\/title>/)?.[1] || '').replace(/\s+/g, ' ').trim()
    const authors = [...entry.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1].trim()).join(', ')
    const year = (entry.match(/<published>(\d{4})/)?.[1]) || ''
    const summary = (entry.match(/<summary>[\s\S]*?<\/summary>/)?.[1] || '').replace(/\s+/g, ' ').trim()
    const id = (entry.match(/<id>(.*?)<\/id>/)?.[1]) || ''
    const doi = (entry.match(/<doi>(.*?)<\/doi>/)?.[1]) || undefined
    const pdfMatch = id.match(/(\d{4}\.\d{4,5})/)
    const arxivId = pdfMatch ? pdfMatch[1] : undefined
    const r: SearchResult = {
      title,
      authors,
      year,
      abstract: summary || undefined,
      source: 'arXiv',
      doi,
      url: id || undefined,
      isPreprint: true,
    }
    cacheSearchResult(r)
    if (arxivId) searchCache.setByArxiv(r, arxivId)
    results.push(r)
  }
  return results
}

// ─── PubMed E-utils (3 req/s, now with abstracts via efetch) ─
async function searchPubmed(query: string, limit: number): Promise<SearchResult[]> {
  try {
    // Step 1: Search for PMIDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${limit}&term=${encodeURIComponent(query)}`
    const searchRes = await fetchWithRetry(searchUrl, { headers: UA }, 1, 500)
    if (!searchRes.ok) return []
    const searchData = await searchRes.json()
    const idList: string[] = searchData?.esearchresult?.idlist || []
    if (idList.length === 0) return []

    // Step 2: Fetch summaries
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${idList.join(',')}`
    const summaryRes = await fetchWithRetry(summaryUrl, { headers: UA }, 1, 500)
    if (!summaryRes.ok) return []
    const summaryData = await summaryRes.json()
    const uidMap: string[] = summaryData?.result?.uids || []

    const results: SearchResult[] = []
    for (const uid of uidMap) {
      const item = summaryData?.result?.[uid] as Record<string, unknown> | undefined
      if (!item || !item.title) continue

      const authorsList = (item.authors as Record<string, string>[]) || []
      const authorNames = authorsList.map(a => a.name).join(', ')
      const pubdate = (item.pubdate as string) || (item.sortpubdate as string) || ''
      const yearMatch = pubdate.match(/\d{4}/)
      const year = yearMatch ? yearMatch[0] : ''
      const articleIds = (item.articleids as Record<string, string>[]) || []
      const doiEntry = articleIds.find(a => a.idtype === 'doi')
      const doi = doiEntry?.value || undefined
      const pmcEntry = articleIds.find(a => a.idtype === 'pmc')
      const url = pmcEntry ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcEntry.value}/` : undefined
      const journal = (item.fulljournalname as string) || (item.source as string) || undefined

      const r: SearchResult = {
        title: (item.title as string) || '',
        authors: authorNames,
        year,
        source: 'PubMed',
        doi,
        url,
        journal,
        isPreprint: false,
      }
      cacheSearchResult(r)
      results.push(r)
    }

    // Step 3: Fetch abstracts via efetch (batch, XML)
    if (results.length > 0) {
      try {
        const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${idList.join(',')}`
        const efetchRes = await fetchWithRetry(efetchUrl, { headers: UA }, 1, 500)
        if (efetchRes.ok) {
          const xml = await efetchRes.text()
          const abstractMap = new Map<string, string>()
          const articles = xml.split('<PubmedArticle>').slice(1)
          for (const art of articles) {
            const pmidMatch = art.match(/<PMID[^>]*>(\d+)/)
            if (!pmidMatch) continue
            const pmid = pmidMatch[1]
            const abstractText = art
              .split('<AbstractText')[1]
              ?.replace(/<\/AbstractText>.*/, '')
              ?.replace(/<[^>]*>/g, '')
              ?.replace(/\s+/g, ' ')
              ?.trim()
            if (abstractText) abstractMap.set(pmid, abstractText)
          }
          // Merge abstracts into results
          for (let i = 0; i < Math.min(results.length, uidMap.length); i++) {
            const abs = abstractMap.get(uidMap[i])
            if (abs) results[i].abstract = abs
          }
        }
      } catch (err) {
        console.error('[api/literature-search] PubMed efetch abstracts (best-effort)', err)
      }
    }

    return results
  } catch (err) {
    console.error('[api/literature-search] PubMed', err)
    return []
  }
}

// ─── HAL (Science) — French open archive ────────────────────
async function searchHAL(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const url = `https://api.archives-ouvertes.fr/search/?q=${encodeURIComponent(query)}&rows=${limit}&fl=docid,title_s,authFullName_s,publicationDateY_i,abstract_s,doiId_s,journalTitle_s,uri_s,citationCount_s,submitType_s`
    const res = await fetchWithRetry(url, { headers: UA })
    if (!res.ok) return []
    const data = await res.json()
    const docs = (data.response?.docs || data.response as unknown[]) || []
    // Handle both array and wrapped response
    const items: Record<string, unknown>[] = Array.isArray(docs)
      ? docs
      : (data.response?.docs || [])
    return items.slice(0, limit).map(doc => {
      const title = (doc.title_s as string[])?.[0] || (doc.title_s as string) || ''
      const authors = Array.isArray(doc.authFullName_s)
        ? (doc.authFullName_s as string[]).join(', ')
        : (doc.authFullName_s as string) || ''
      const year = String(doc.publicationDateY_i || '')
      const abstract = Array.isArray(doc.abstract_s)
        ? (doc.abstract_s as string[]).join(' ')
        : (doc.abstract_s as string) || undefined
      const doi = (doc.doiId_s as string) || undefined
      const halUrl = (doc.uri_s as string) || undefined
      const journal = (doc.journalTitle_s as string) || undefined
      const citations = parseInt(String(doc.citationCount_s || '0')) || 0
      const submitType = (doc.submitType_s as string) || ''
      const isPreprint = submitType === 'file' || submitType === 'notice'

      const r: SearchResult = {
        title,
        authors,
        year,
        abstract,
        source: 'HAL',
        doi,
        url: halUrl || (doi ? `https://doi.org/${doi}` : undefined),
        citationCount: citations,
        journal,
        isPreprint,
      }
      cacheSearchResult(r)
      return r
    })
  } catch (err) {
    console.error('[api/literature-search] HAL', err)
    return []
  }
}

// ─── DOAJ (no API key needed, 2 req/sec, all OA) ──────
async function searchDOAJ(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const url = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?pageSize=${limit}`
    const res = await fetchWithRetry(url, { headers: { ...UA, 'User-Agent': 'ThesisFrame/1.0 (mailto:thesisframe@example.com)' } }, 1, 600)
    if (!res.ok) return []
    const data = await res.json()
    if (data.error) return []
    return (data.results || []).map((doc: Record<string, unknown>) => {
      const bibjson = (doc.bibjson as Record<string, unknown>) || {}
      const authors = ((bibjson.author as Record<string, string>[]) || []).map(a => a.name).join(', ')
      const ids = (bibjson.identifier as Record<string, string>[]) || []
      const doi = ids.find(i => i.type === 'doi')?.id
      const links = (bibjson.link as Record<string, string>[]) || []
      const fulltext = links.find(l => l.type === 'fulltext')
      const journal = (bibjson.journal as Record<string, string>) || {}
      const r: SearchResult = {
        title: (bibjson.title as string) || '',
        authors,
        year: String(bibjson.year || ''),
        abstract: (bibjson.abstract as string) || undefined,
        source: 'DOAJ',
        doi: doi || undefined,
        url: fulltext?.url || undefined,
        journal: journal.title || undefined,
        isPreprint: false,
      }
      cacheSearchResult(r)
      return r
    })
  } catch (err) {
    console.error('[api/literature-search] DOAJ', err)
    return []
  }
}

// ─── Europe PMC (33M+ publications, no key, JSON) ──────
async function searchEuropePMC(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=${limit}&resultType=core&cursor=*`
    const res = await fetchWithRetry(url, { headers: UA }, 1, 300)
    if (!res.ok) return []
    const data = await res.json()
    const items = (data.resultList?.result as Record<string, unknown>[]) || []
    return items.slice(0, limit).map(doc => {
      // Authors
      const docAny = doc as Record<string, unknown>
      const authorList = (docAny.authorList as Record<string, unknown> | undefined)?.author as Record<string, string>[] | undefined || []
      const authors = authorList.map(a => a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim()).filter(Boolean).join(', ')
      // OA URL
      const ftUrls = ((docAny.fullTextUrlList as Record<string, unknown> | undefined)?.fullTextUrl as Record<string, string>[]) || []
      const oaUrl = ftUrls.find(u => u.documentStyle === 'full_text' || u.documentStyle === 'oa')
      const euPmcUrl = `https://europepmc.org/article/${doc.pmcid || doc.pmid || doc.id}`
      const doi = (doc.doi as string) || undefined
      const r: SearchResult = {
        title: (doc.title as string) || '',
        authors,
        year: String(doc.pubYear || ''),
        abstract: (doc.abstractText as string) || undefined,
        source: 'Europe PMC',
        doi,
        url: oaUrl?.url || (doi ? `https://doi.org/${doi}` : euPmcUrl),
        citationCount: (doc.citationCount as number) || 0,
        journal: ((docAny.journalInfo as Record<string, unknown> | undefined)?.journal as Record<string, unknown>)?.title as string || undefined,
        isPreprint: false,
      }
      cacheSearchResult(r)
      return r
    })
  } catch (err) {
    console.error('[api/literature-search] Europe PMC', err)
    return []
  }
}

// ─── ERIC (1.5M+ education publications, no key, JSON) ────
async function searchERIC(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const url = `https://api.ies.ed.gov/eric/?search=${encodeURIComponent(query)}&rows=${limit}&format=json`
    const res = await fetchWithRetry(url, { headers: UA }, 1, 300)
    if (!res.ok) return []
    const data = await res.json()
    const docs = (data.response?.docs as Record<string, unknown>[]) || []
    return docs.slice(0, limit).map(doc => {
      const authors = ((doc.author as string[]) || []).join(', ')
      const year = String(doc.publicationdateyear || '')
      const doi = (doc.doi as string) || undefined
      const issn = ((doc.issn as string[]) || [])[0]
      const r: SearchResult = {
        title: (doc.title as string) || '',
        authors,
        year,
        abstract: (doc.description as string) || undefined,
        source: 'ERIC',
        doi,
        url: doi ? `https://doi.org/${doi}` : (doc.url as string) || undefined,
        journal: issn || undefined,
        isPreprint: false,
      }
      cacheSearchResult(r)
      return r
    })
  } catch (err) {
    console.error('[api/literature-search] ERIC', err)
    return []
  }
}

// ─── CORE (300M+ papers, API key required) ──────────────
async function searchCORE(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const apiKey = process.env.CORE_API_KEY
    if (!apiKey) return []
    const url = `https://api.core.ac.uk/v3/search/works/?q=${encodeURIComponent(query)}&limit=${limit}`
    const res = await fetchWithRetry(url, {
      headers: {
        ...UA,
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    }, 2, 200)
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).map((doc: Record<string, unknown>) => {
      const authors = ((doc.authors as Record<string, string>[]) || []).map(a => a.name).join(', ')
      const journals = (doc.journals as Record<string, string>[]) || []
      const doi = (doc.doi as string) || undefined
      const downloadUrl = (doc.downloadUrl as string) || undefined
      const ftUrls = (doc.sourceFulltextUrls as string[]) || []
      const links = (doc.links as Record<string, string>[]) || []
      const displayUrl = links.find(l => l.type === 'display')?.url
      const r: SearchResult = {
        title: (doc.title as string) || '',
        authors,
        year: String(doc.yearPublished || ''),
        abstract: (doc.abstract as string) || undefined,
        source: 'CORE',
        doi,
        url: downloadUrl || ftUrls[0] || displayUrl || undefined,
        citationCount: (doc.citationCount as number) || 0,
        journal: journals[0]?.title || undefined,
        isPreprint: false,
      }
      cacheSearchResult(r)
      return r
    })
  } catch (err) {
    console.error('[api/literature-search] CORE', err)
    return []
  }
}

// ─── Deduplication ──────────────────────────────────────────
function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function resultScore(r: SearchResult): number {
  let score = 0
  if (r.abstract && r.abstract.length > 50) score += 10
  else if (r.abstract) score += 5
  if (r.citationCount !== undefined && r.citationCount > 0) score += Math.min(r.citationCount, 20)
  if (r.doi) score += 3
  if (r.journal) score += 2
  if (r.authors) score += 1
  return score
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen: Map<string, SearchResult> = new Map()
  const titleSeen: Map<string, SearchResult> = new Map()

  for (const r of results) {
    // Check memory cache first — if we already have a richer version, use it
    if (r.doi) {
      const cached = searchCache.getByDoi(r.doi)
      if (cached && resultScore(cached as SearchResult) > resultScore(r)) {
        continue // Skip this result, we have a better cached version
      }
    }

    if (r.doi) {
      const key = r.doi.toLowerCase()
      const existing = seen.get(key)
      if (!existing || resultScore(r) > resultScore(existing)) {
        seen.set(key, r)
      }
    } else {
      const normalized = normalizeTitle(r.title)
      if (!normalized) continue
      const existing = titleSeen.get(normalized)
      if (!existing || resultScore(r) > resultScore(existing)) {
        titleSeen.set(normalized, r)
      }
    }
  }

  // Sort by score descending, then by year descending
  const deduped = [...seen.values(), ...titleSeen.values()]
  deduped.sort((a, b) => {
    const scoreDiff = resultScore(b) - resultScore(a)
    if (scoreDiff !== 0) return scoreDiff
    return (parseInt(b.year) || 0) - (parseInt(a.year) || 0)
  })

  return deduped
}

// ─── Main Route ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { query, sources = ['openalex', 'crossref', 'hal', 'semantic_scholar', 'doaj'], limit = 10, s2ApiKey, lang } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const safeLimit = Math.min(Math.max(limit, 1), 20)

    // Launch all searches in parallel (each source handles its own rate limits)
    const searches: Promise<SearchResult[]>[] = []

    if (sources.includes('semantic_scholar')) searches.push(searchSemanticScholar(query, safeLimit, s2ApiKey as string | undefined))
    if (sources.includes('openalex')) searches.push(searchOpenAlex(query, safeLimit, lang as string | undefined))
    if (sources.includes('crossref')) searches.push(searchCrossref(query, safeLimit))
    if (sources.includes('arxiv')) searches.push(searchArxiv(query, safeLimit))
    if (sources.includes('pubmed')) searches.push(searchPubmed(query, safeLimit))
    if (sources.includes('hal')) searches.push(searchHAL(query, safeLimit))
    if (sources.includes('doaj')) searches.push(searchDOAJ(query, safeLimit))
    if (sources.includes('core')) searches.push(searchCORE(query, safeLimit))
    if (sources.includes('europe_pmc')) searches.push(searchEuropePMC(query, safeLimit))
    if (sources.includes('eric')) searches.push(searchERIC(query, safeLimit))

    const rawResults: SearchResult[] = []
    const errors: string[] = []

    const settled = await Promise.allSettled(searches)
    for (let i = 0; i < settled.length; i++) {
      const r = settled[i]
      if (r.status === 'fulfilled') {
        rawResults.push(...r.value)
      } else {
        const srcName = sources[i] || 'unknown'
        errors.push(srcName)
      }
    }

    const results = deduplicateResults(rawResults)

    return NextResponse.json({
      query,
      totalResults: results.length,
      results,
      cache: searchCache.stats,
      ...(errors.length > 0 ? { errors } : {}),
    })
  } catch (error) {
    console.error('[POST /api/literature-search] Error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 },
    )
  }
}

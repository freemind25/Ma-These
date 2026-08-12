// ─── In-memory LRU Cache for academic search results ──────────
// Caches papers by DOI / arXiv ID so the same paper is never fetched twice.
// Inspired by the article's recommendation #1: "Cache by DOI/arXiv ID, not by query"

interface CachedPaper {
  title: string
  authors: string
  year: string
  abstract?: string
  source: string
  doi?: string
  url?: string
  citationCount?: number
  journal?: string
  fetchedAt: number
}

const MAX_CACHE_SIZE = 2000
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Separate maps: one for DOI keys, one for arXiv keys, one for query keys
const doiCache = new Map<string, CachedPaper>()
const arxivCache = new Map<string, CachedPaper>()
// Query-level cache stores arrays of DOIs/arXiv IDs found for a given query+sources combo
const queryCache = new Map<string, string[]>() // key: "query|sources_hash" → value: list of doi keys

function evict(map: Map<string, CachedPaper>) {
  // Evict oldest entry
  let oldestKey: string | null = null
  let oldestTime = Infinity
  for (const [k, v] of map) {
    if (v.fetchedAt < oldestTime) {
      oldestTime = v.fetchedAt
      oldestKey = k
    }
  }
  if (oldestKey) map.delete(oldestKey)
}

function evictQueryCache() {
  let oldestKey: string | null = null
  let oldestTime = Infinity
  // Query cache entries are stored as JSON with timestamp
  for (const [k, v] of queryCache) {
    // We store timestamp in the key as last segment
    const parts = k.split('|')
    const ts = parseInt(parts[parts.length - 1]) || 0
    if (ts < oldestTime) {
      oldestTime = ts
      oldestKey = k
    }
  }
  if (oldestKey) queryCache.delete(oldestKey)
}

export const searchCache = {
  // Store a paper by DOI
  setByDoi(paper: Omit<CachedPaper, 'fetchedAt'>) {
    if (!paper.doi) return
    const key = paper.doi.toLowerCase()
    if (doiCache.size >= MAX_CACHE_SIZE) evict(doiCache)
    doiCache.set(key, { ...paper, fetchedAt: Date.now() })
  },

  // Store a paper by arXiv ID
  setByArxiv(paper: Omit<CachedPaper, 'fetchedAt'>, arxivId: string) {
    if (!arxivId) return
    const key = arxivId.toLowerCase()
    if (arxivCache.size >= MAX_CACHE_SIZE) evict(arxivCache)
    arxivCache.set(key, { ...paper, fetchedAt: Date.now() })
  },

  // Get by DOI
  getByDoi(doi: string): CachedPaper | undefined {
    const p = doiCache.get(doi.toLowerCase())
    if (!p) return undefined
    if (Date.now() - p.fetchedAt > CACHE_TTL_MS) {
      doiCache.delete(doi.toLowerCase())
      return undefined
    }
    return p
  },

  // Get by arXiv ID
  getByArxiv(arxivId: string): CachedPaper | undefined {
    const p = arxivCache.get(arxivId.toLowerCase())
    if (!p) return undefined
    if (Date.now() - p.fetchedAt > CACHE_TTL_MS) {
      arxivCache.delete(arxivId.toLowerCase())
      return undefined
    }
    return p
  },

  // Get by DOI or arXiv ID (unified lookup)
  getByIdentifier(doi?: string, arxivId?: string): CachedPaper | undefined {
    if (doi) {
      const p = this.getByDoi(doi)
      if (p) return p
    }
    if (arxivId) {
      const p = this.getByArxiv(arxivId)
      if (p) return p
    }
    return undefined
  },

  // Check if we already have a paper cached for this identifier
  has(doi?: string, arxivId?: string): boolean {
    if (doi && doiCache.has(doi.toLowerCase())) return true
    if (arxivId && arxivCache.has(arxivId.toLowerCase())) return true
    return false
  },

  // Store query → identifiers mapping
  setQueryResult(query: string, sourcesHash: string, identifiers: string[]) {
    const key = `${query.toLowerCase().trim()}|${sourcesHash}|${Date.now()}`
    if (queryCache.size >= 500) evictQueryCache()
    queryCache.set(key, identifiers)
  },

  // Get cached identifiers for a query
  getQueryResult(query: string, sourcesHash: string): string[] | undefined {
    const prefix = `${query.toLowerCase().trim()}|${sourcesHash}|`
    for (const [k, v] of queryCache) {
      if (k.startsWith(prefix)) {
        const ts = parseInt(k.split('|').pop() || '0')
        if (Date.now() - ts < CACHE_TTL_MS) return v
        queryCache.delete(k)
      }
    }
    return undefined
  },

  // Stats
  get stats() {
    return {
      doiCacheSize: doiCache.size,
      arxivCacheSize: arxivCache.size,
      queryCacheSize: queryCache.size,
    }
  },
}

// Cache a search result (extracts DOI/arXiv ID and stores appropriately)
export function cacheSearchResult(r: { title: string; authors: string; year: string; abstract?: string; source: string; doi?: string; url?: string; citationCount?: number; journal?: string }) {
  if (r.doi) {
    searchCache.setByDoi(r)
  }
  // Extract arXiv ID from URL
  if (r.url && r.url.includes('arxiv.org')) {
    const match = r.url.match(/(\d{4}\.\d{4,5})/)
    if (match) searchCache.setByArxiv(r, match[1])
  }
}

// Fetch with retry and rate-limit awareness
export async function fetchWithRetry(
  url: string,
  opts: RequestInit = {},
  maxRetries = 2,
  baseDelay = 1000,
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, opts)
    if (res.ok) return res
    if (res.status === 429) {
      // Rate limited — backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500
      await new Promise(resolve => setTimeout(resolve, delay))
      continue
    }
    // Other errors: don't retry
    return res
  }
  // Should not reach here, but just in case
  return fetch(url, opts)
}

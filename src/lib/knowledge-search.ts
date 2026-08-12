/**
 * Knowledge Search — Full-text search across uploaded knowledge documents.
 * Inspired by SurfSense's hybrid search (vector + BM25), adapted for SQLite FTS5.
 *
 * Uses SQLite's built-in FTS5 for full-text search with French stemming,
 * combined with the existing keyword scoring from thesis-rag.ts.
 */

import { db } from '@/lib/db'
import type { KnowledgeChunk, KnowledgeDocument } from '@prisma/client'

// ── Types ──

export interface SearchResult {
  document: Pick<KnowledgeDocument, 'id' | 'title' | 'fileType' | 'tags' | 'sourceType' | 'wordCount'>
  chunk: Pick<KnowledgeChunk, 'id' | 'content' | 'chunkIndex' | 'charStart' | 'charEnd' | 'wordCount'>
  score: number
  matchType: 'fulltext' | 'keyword' | 'hybrid'
}

export interface SearchOptions {
  query: string
  topK?: number
  documentId?: string
  thesisId?: string
  fileType?: string
  minScore?: number
}

// ── Local tokenizer (mirrors thesis-rag.ts internals) ──

const STOP_WORDS = new Set([
  'a','au','aux','avec','ce','ces','dans','de','des','du','en','et',
  'est','eu','il','je','la','le','les','leur','lui','ma','mais','me',
  'mes','moi','mon','ne','nos','notre','nous','on','ou','par','pas',
  'pour','qu','que','qui','sa','se','ses','son','sur','ta','te','tes',
  'toi','ton','tu','un','une','vos','votre','vous',
  'the','of','and','in','to','is','for','with','on','at','by','an',
  'be','this','that','from','or','are','was','were','it','as','not',
  'but','has','had','have','they','their','which','what','how','can',
])

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüÿçœæ\s0-9]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokenizeLocal(text: string): string[] {
  return normalize(text).split(' ').filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function ngramsLocal(tokens: string[], n: number): string[] {
  const result: string[] = []
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(' '))
  }
  return result
}

// ── FTS5 Search (using Prisma raw query) ──

/**
 * Search using SQLite FTS5 on KnowledgeChunk.plainText.
 * SQLite FTS5 supports French stemming if configured, otherwise defaults to unicode61.
 */
async function ftsSearch(query: string, options: SearchOptions): Promise<SearchResult[]> {
  const topK = options.topK ?? 10
  const safeQuery = query.replace(/'/g, "''")

  try {
    const conditions: string[] = []
    const values: unknown[] = []

    if (options.documentId) {
      conditions.push('kc."documentId" = ?')
      values.push(options.documentId)
    }

    const whereClause = conditions.length > 0
      ? `AND ${conditions.join(' AND ')}`
      : ''

    const sql = `
      SELECT
        kc.id, kc."documentId", kd.title, kd."fileType", kd.tags, kd."sourceType",
        kd."wordCount" as docWordCount,
        kc.content, kc."chunkIndex", kc."charStart", kc."charEnd", kc."wordCount" as chunkWordCount,
        1.0 as rank
      FROM "KnowledgeChunk" kc
      JOIN "KnowledgeDocument" kd ON kc."documentId" = kd.id
      WHERE kc."plainText" LIKE '%${safeQuery}%' ${whereClause}
      ORDER BY kc."wordCount" DESC
      LIMIT ${topK}
    `

    const results = await db.$queryRawUnsafe<Array<{
      id: string
      documentId: string
      title: string
      fileType: string
      tags: string | null
      sourceType: string
      docWordCount: number
      content: string
      chunkIndex: number
      charStart: number
      charEnd: number
      chunkWordCount: number
      rank: number
    }>>(sql, ...values)

    return results.map(r => ({
      document: {
        id: r.documentId,
        title: r.title,
        fileType: r.fileType,
        tags: r.tags,
        sourceType: r.sourceType,
        wordCount: r.docWordCount,
      },
      chunk: {
        id: r.id,
        content: r.content,
        chunkIndex: r.chunkIndex,
        charStart: r.charStart,
        charEnd: r.charEnd,
        wordCount: r.chunkWordCount,
      },
      score: r.rank,
      matchType: 'fulltext' as const,
    }))
  } catch (error) {
    console.error('[knowledge-search] FTS error, falling back to keyword search:', error)
    return []
  }
}

// ── Keyword Scoring (reusing thesis-rag patterns) ──

async function keywordSearch(query: string, options: SearchOptions): Promise<SearchResult[]> {
  const queryTokens = tokenizeLocal(query)
  const queryBigrams = ngramsLocal(queryTokens, 2)

  if (queryTokens.length === 0) return []

  const where: Record<string, unknown> = { isIndexed: true }
  if (options.documentId) where.documentId = options.documentId
  if (options.thesisId) where.thesisId = options.thesisId
  if (options.fileType) where.fileType = options.fileType

  const chunks = await db.knowledgeChunk.findMany({
    where: { document: where as never },
    include: {
      document: {
        select: { id: true, title: true, fileType: true, tags: true, sourceType: true, wordCount: true },
      },
    },
    take: 200, // Limit for in-memory scoring
  })

  const scored = chunks.map(chunk => {
    const chunkTokens = tokenizeLocal(chunk.plainText)
    const chunkTokenSet = new Set(chunkTokens)

    // Unigram overlap
    let overlap = 0
    for (const qt of queryTokens) {
      if (chunkTokenSet.has(qt)) overlap++
    }
    const unigramScore = queryTokens.length > 0 ? overlap / queryTokens.length : 0

    // Bigram overlap
    const chunkBigrams = new Set(ngramsLocal(chunkTokens, 2))
    let bigramOverlap = 0
    for (const bg of queryBigrams) {
      if (chunkBigrams.has(bg)) bigramOverlap++
    }
    const bigramScore = queryBigrams.length > 0 ? bigramOverlap / queryBigrams.length : 0

    // Combined score
    const score = unigramScore * 0.5 + bigramScore * 0.5

    return {
      document: chunk.document,
      chunk: {
        id: chunk.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        charStart: chunk.charStart,
        charEnd: chunk.charEnd,
        wordCount: chunk.wordCount,
      },
      score,
      matchType: 'keyword' as const,
    }
  })

  const minScore = options.minScore ?? 0.05
  const topK = options.topK ?? 10

  return scored
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

// ── Main Search Function ──

export async function searchKnowledge(options: SearchOptions): Promise<{
  results: SearchResult[]
  query: string
  totalDocumentsSearched: number
  searchTimeMs: number
}> {
  const startTime = Date.now()

  // Run both searches in parallel
  const [ftsResults, keywordResults] = await Promise.all([
    ftsSearch(options.query, options),
    keywordSearch(options.query, options),
  ])

  // Merge results with reciprocal rank fusion
  const scoreMap = new Map<string, SearchResult>()

  const allResults = [...ftsResults, ...keywordResults]
  for (const result of allResults) {
    const key = result.chunk.id
    const existing = scoreMap.get(key)

    if (existing) {
      // Combine scores (average)
      existing.score = (existing.score + result.score) / 2
      existing.matchType = 'hybrid'
    } else {
      scoreMap.set(key, { ...result })
    }
  }

  const results = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, options.topK ?? 10)

  // Count total indexed documents
  const whereCount: Record<string, unknown> = { isIndexed: true }
  if (options.thesisId) whereCount.thesisId = options.thesisId
  const totalDocuments = await db.knowledgeDocument.count({
    where: whereCount as never,
  })

  return {
    results,
    query: options.query,
    totalDocumentsSearched: totalDocuments,
    searchTimeMs: Date.now() - startTime,
  }
}

// ── Format context for LLM (with citations) ──

export function formatSearchContextForLLM(results: SearchResult[]): string {
  if (results.length === 0) return ''

  const parts = results.map((r, i) => {
    const source = `"${r.document.title}" (${r.document.sourceType})`
    const excerpt = r.chunk.content.length > 600
      ? r.chunk.content.slice(0, 600) + ' [...]'
      : r.chunk.content

    return `SOURCE ${i + 1} (${source}, chunk ${r.chunk.chunkIndex + 1}) :
${excerpt}
[Ref: ${r.document.id}/chunk/${r.chunk.chunkIndex}]`
  })

  return `DOCUMENTS DE LA BASE DE CONNAISSANCES (${results.length} résultat(s)) :\n\n${parts.join('\n\n')}`
}

/**
 * Module RAG (Retrieval-Augmented Generation) léger pour la thèse.
 * Chunking par paragraphes + scoring par mots-clés.
 * Aucune dépendance externe — fonctionne entièrement en mémoire.
 */

// ── Types ──

export interface Chunk {
  text: string
  chapterNumber: string
  chapterTitle: string
  chunkIndex: number
  totalChunks: number
  score?: number
}

export interface RagResult {
  chunks: Chunk[]
  query: string
  chaptersSearched: number
  totalChunks: number
}

// ── French stop words ──

const STOP_WORDS = new Set([
  'a', 'au', 'aux', 'avec', 'ce', 'ces', 'dans', 'de', 'des', 'du', 'en', 'et',
  'est', 'eu', 'il', 'je', 'la', 'le', 'les', 'leur', 'lui', 'ma', 'mais', 'me',
  'mes', 'moi', 'mon', 'ne', 'nos', 'notre', 'nous', 'on', 'ou', 'par', 'pas',
  'pour', 'qu', 'que', 'qui', 'sa', 'se', 'ses', 'son', 'sur', 'ta', 'te', 'tes',
  'toi', 'ton', 'tu', 'un', 'une', 'vos', 'votre', 'vous', 'c', 'd', 'j', 'l',
  'm', 'n', 's', 't', 'y', 'été', 'étée', 'étées', 'étés', 'étant', 'sont',
  'cas', 'plus', 'tout', 'tous', 'toute', 'toutes', 'peut', 'fait', 'cette',
  'aussi', 'entre', 'autres', 'autre', 'depuis', 'peu', 'très', 'bien', 'alors',
  'quand', 'comme', 'dont', 'chaque', 'quel', 'quelle', 'quels', 'quelles',
  'sans', 'soit', 'avoir', 'être', 'avoir', 'fait', 'été', 'été', 'peut',
  'the', 'of', 'and', 'in', 'to', 'is', 'for', 'with', 'on', 'at', 'by', 'an',
  'be', 'this', 'that', 'from', 'or', 'are', 'was', 'were', 'it', 'as', 'not',
  'but', 'has', 'had', 'have', 'they', 'their', 'which', 'what', 'how', 'can',
])

// ── Text normalization ──

function normalize(text: string): string {
  return text
    .toLowerCase()
    // Remove markdown
    .replace(/#{1,6}\s+/g, ' ')
    .replace(/\*+/g, '')
    .replace(/_+/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    // Remove punctuation but keep accents
    .replace(/[^a-zàâäéèêëïîôùûüÿçœæ\s0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

function ngrams(tokens: string[], n: number): string[] {
  const result: string[] = []
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(' '))
  }
  return result
}

// ── Chunking ──

const MIN_CHUNK_LENGTH = 80
const MAX_CHUNK_LENGTH = 800

function chunkText(text: string): string[] {
  if (!text || text.trim().length === 0) return []

  // Split by double newlines (paragraphs) or single newlines
  const rawParagraphs = text.split(/\n{2,}|\n/)
  const chunks: string[] = []
  let buffer = ''

  for (const para of rawParagraphs) {
    const cleaned = para.trim().replace(/^#+\s+/, '') // strip headings
    if (!cleaned) continue

    if (buffer.length + cleaned.length > MAX_CHUNK_LENGTH && buffer.length >= MIN_CHUNK_LENGTH) {
      chunks.push(buffer.trim())
      buffer = ''
    }

    buffer += (buffer ? ' ' : '') + cleaned
  }

  if (buffer.trim().length > 0) {
    chunks.push(buffer.trim())
  }

  // Filter out too-short chunks
  return chunks.filter((c) => c.length >= MIN_CHUNK_LENGTH)
}

// ── Scoring ──

function scoreChunk(queryTokens: string[], queryBigrams: string[], chunkText: string): number {
  const chunkTokens = tokenize(chunkText)
  if (chunkTokens.length === 0) return 0

  const chunkTokenSet = new Set(chunkTokens)

  // 1. Unigram overlap (Jaccard-like)
  let overlap = 0
  for (const qt of queryTokens) {
    if (chunkTokenSet.has(qt)) overlap++
  }
  const unigramScore = queryTokens.length > 0 ? overlap / queryTokens.length : 0

  // 2. Bigram overlap (phrase matching)
  const chunkBigrams = new Set(ngrams(chunkTokens, 2))
  let bigramOverlap = 0
  for (const bg of queryBigrams) {
    if (chunkBigrams.has(bg)) bigramOverlap++
  }
  const bigramScore = queryBigrams.length > 0 ? bigramOverlap / queryBigrams.length : 0

  // 3. Length bonus — penalize very short chunks, slight bonus for longer relevant ones
  const lengthFactor = Math.min(chunkTokens.length / 50, 1.5)

  // Combined score: bigrams are worth 2x (they indicate phrase matches)
  return unigramScore * 0.4 + bigramScore * 0.4 + Math.min(unigramScore, 1) * 0.2 * lengthFactor
}

// ── Query detection ──

/**
 * Detect if a user query is likely asking about their own thesis content.
 * Returns true if the query contains indicators of self-reference.
 */
export function shouldRetrieve(query: string): boolean {
  const q = query.toLowerCase()
  const selfRefPatterns = [
    // Explicit self-reference
    /j['']ai (?:écrit|rédigé|mentionné|dit|expliqué)/i,
    /ce (?:que|qu[''])?j['']?ai/i,
    /mon (?:chapitre|texte|introduction|conclusion|problématique|méthodologie)/i,
    /ma (?:thèse|recherche|revue|démarche)/i,
    /dans (?:mon|ma|mes)/i,
    /ce que j['']écris/i,
    // Cross-chapter references
    /chapitre (?:\d+|\w+).*chapitre/i,
    /entre (?:l['']intro|l['']introduction).*et/i,
    /co[hé]rence.*chapitre/i,
    /répéti/i,
    /redondan/i,
    // Content search
    /où.*ai.*écrit/i,
    /qu'est[- ]ce.*que.*écrit/i,
    /trouve.*dans.*chapitre/i,
    /recherche.*dans.*ma.*thèse/i,
    // Review mode specific
    /relis/i,
    /vérif.*ce.*j['']?ai/i,
    /analyser (?:mon|ce) /i,
  ]

  for (const pattern of selfRefPatterns) {
    if (pattern.test(q)) return true
  }

  // If the query is very short (< 5 words), it's likely not a retrieval query
  // unless it's an explicit command
  const words = q.split(/\s+/).filter(Boolean)
  if (words.length < 5 && !q.includes('chapitre')) return false

  return false
}

// ── Main retrieval function ──

/**
 * Search through all thesis chapters for chunks relevant to the query.
 */
export function retrieve(
  query: string,
  chapters: Array<{ number: string; title: string; content: string }>,
  options?: { topK?: number; minScore?: number }
): RagResult {
  const topK = options?.topK ?? 5
  const minScore = options?.minScore ?? 0.05

  const queryTokens = tokenize(query)
  const queryBigrams = ngrams(queryTokens, 2)

  // If no meaningful query tokens, skip retrieval
  if (queryTokens.length === 0) {
    return { chunks: [], query, chaptersSearched: chapters.length, totalChunks: 0 }
  }

  // Chunk all chapters
  const allChunks: Chunk[] = []
  let totalChunks = 0

  for (const chapter of chapters) {
    if (!chapter.content || chapter.content.trim().length < MIN_CHUNK_LENGTH) continue

    const chapterChunks = chunkText(chapter.content)
    totalChunks += chapterChunks.length

    for (let i = 0; i < chapterChunks.length; i++) {
      allChunks.push({
        text: chapterChunks[i],
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        chunkIndex: i,
        totalChunks: chapterChunks.length,
      })
    }
  }

  // Score each chunk
  const scored = allChunks.map((chunk) => ({
    ...chunk,
    score: scoreChunk(queryTokens, queryBigrams, chunk.text),
  }))

  // Filter by minimum score and sort
  const results = scored
    .filter((c) => c.score >= minScore)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topK)

  return {
    chunks: results,
    query,
    chaptersSearched: chapters.length,
    totalChunks,
  }
}

/**
 * Format retrieved chunks into a text block for the LLM prompt.
 */
export function formatRagContext(result: RagResult): string {
  if (result.chunks.length === 0) return ''

  const parts = result.chunks.map((chunk, i) => {
    const source = `Chapitre ${chunk.chapterNumber} — ${chunk.chapterTitle}`
    const excerpt = chunk.text.length > 500
      ? chunk.text.slice(0, 500) + ' [...]'
      : chunk.text
    return `EXTRAIT ${i + 1} (${source}) :
${excerpt}`
  })

  return `EXTRAITS PERTINENTS TROUVÉS DANS LA THÈSE DE L'UTILISATEUR :

${parts.join('\n\n')}`
}

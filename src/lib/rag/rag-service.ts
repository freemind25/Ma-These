// ═════════════════════════════════════
// ThesisFrame — RAG Service v2 (Hybrid: Keyword + Semantic)
// Server-side only — with optional vector embeddings
// ═════════════════════════════════════

import { db } from "@/lib/db";
import {
  generateCompletion,
  type AiCompletionOptions,
} from "@/lib/ai/zai-client";
import type { AiProviderConfig } from "@/lib/ai/ai-types";
import {
  generateEmbeddings,
  getEmbeddingInfo,
  parseEmbedding,
  cosineSimilarity,
  type EmbeddingResult,
} from "./embedding-service";

// ───────────────────────────────────────
// Types
// ───────────────────────────────────────

export interface Chunk {
  content: string;
  index: number;
}

export interface IndexResult {
  totalChunks: number;
  chapters: number;
  references: number;
  notebooks: number;
  cadrages: number;
  totalTokens: number;
  embeddedChunks: number;
  embeddingModel: string | null;
}

export interface RetrievalResult {
  chunk: {
    id: string;
    sourceType: string;
    sourceId: string;
    sourceTitle: string;
    content: string;
    chunkIndex: number;
    metadata: string;
    tokenCount: number;
  };
  score: number;
  scoreType: "keyword" | "semantic" | "hybrid";
}

export interface RagResponse {
  answer: string;
  sources: { type: string; title: string; chunkIndex: number }[];
  chunks: RetrievalResult[];
}

// ───────────────────────────────────────
// Constants
// ───────────────────────────────────────

const DEFAULT_MAX_TOKENS = 500;
const OVERLAP_TOKENS = 100;
/** Approximate chars per token (French text tends to be slightly lower than English) */
const CHARS_PER_TOKEN = 4;

/**
 * Weights for hybrid scoring.
 * Exported so they can be overridden via env vars or tests.
 * Default: 65% semantic (embeddings) / 35% keyword (term matching).
 * Adjust after real-user testing — see AGENTS.md RAG section.
 */
export const HYBRID_WEIGHTS = {
  keyword: Number(process.env.RAG_KEYWORD_WEIGHT) || 0.35,
  semantic: Number(process.env.RAG_SEMANTIC_WEIGHT) || 0.65,
} as const;

/** @deprecated Use HYBRID_WEIGHTS.keyword */
const KEYWORD_WEIGHT = HYBRID_WEIGHTS.keyword;
/** @deprecated Use HYBRID_WEIGHTS.semantic */
const SEMANTIC_WEIGHT = HYBRID_WEIGHTS.semantic;

// ───────────────────────────────────────
// System prompt for RAG
// ───────────────────────────────────────

const RAG_SYSTEM_PROMPT = `Tu es l'assistant de thèse de l'utilisateur. Réponds à sa question en te basant UNIQUEMENT sur les extraits de documents fournis ci-dessous.
Si les documents ne contiennent pas assez d'information, dis-le honnêtement.
Cite tes sources entre crochets : [Chapitre X - Titre] ou [Réf: Auteur, Année].
Réponds en français, de manière structurée et académique.`;

// ───────────────────────────────────────
// chunkText — split text into overlapping chunks
// ───────────────────────────────────────

export function chunkText(text: string, maxTokens: number = DEFAULT_MAX_TOKENS): Chunk[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const overlapChars = OVERLAP_TOKENS * CHARS_PER_TOKEN;

  // Split on sentence boundaries / paragraph breaks
  const segments = trimmed
    .split(/\n\n/)
    .flatMap((para) => para.split(/\n/))
    .flatMap((line) => line.split(/\.\s+/))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (segments.length === 0) return [];

  const chunks: Chunk[] = [];
  let buffer = "";
  let chunkIndex = 0;

  for (const segment of segments) {
    if (buffer.length > 0 && buffer.length + segment.length + 1 > maxChars) {
      chunks.push({ content: buffer.trim(), index: chunkIndex++ });

      if (buffer.length > overlapChars) {
        const overlapStart = buffer.length - overlapChars;
        const overlapText = buffer.slice(overlapStart);
        const sentenceBoundary = overlapText.search(/\.[\s!]?/);
        if (sentenceBoundary > 0) {
          buffer = overlapText.slice(sentenceBoundary + 1).trim() + " " + segment;
        } else {
          buffer = overlapText.trim() + " " + segment;
        }
      } else {
        buffer = segment;
      }
    } else {
      buffer = buffer ? buffer + " " + segment : segment;
    }
  }

  if (buffer.trim()) {
    chunks.push({ content: buffer.trim(), index: chunkIndex });
  }

  return chunks;
}

// ───────────────────────────────────────
// estimateTokens — rough token count
// ───────────────────────────────────────

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// ───────────────────────────────────────
// indexThesisContent — fetch, chunk, embed, store
// ───────────────────────────────────────

export async function indexThesisContent(
  thesisId: string,
  providerConfig?: AiProviderConfig
): Promise<IndexResult> {
  const stats: IndexResult = {
    totalChunks: 0,
    chapters: 0,
    references: 0,
    notebooks: 0,
    cadrages: 0,
    totalTokens: 0,
    embeddedChunks: 0,
    embeddingModel: null,
  };

  // Check if provider supports embeddings
  const embInfo = providerConfig ? getEmbeddingInfo(providerConfig) : null;
  const canEmbed = embInfo?.supported === true;

  // 1. Collect all content to index
  interface SourceData {
    sourceType: string;
    sourceId: string;
    sourceTitle: string;
    content: string;
    metadata: Record<string, unknown>;
  }

  const sources: SourceData[] = [];

  // ── Chapters (filtered by thesisId) ──
  const chapters = await db.chapter.findMany({
    where: { thesisId },
    select: { id: true, title: true, plainText: true, number: true },
    orderBy: { number: "asc" },
  });

  for (const ch of chapters) {
    if (ch.plainText.trim()) {
      sources.push({
        sourceType: "chapter",
        sourceId: ch.id,
        sourceTitle: ch.title,
        content: ch.plainText,
        metadata: { chapterNumber: ch.number },
      });
    }
  }

  // ── References (global) ──
  const references = await db.reference.findMany({
    select: { id: true, title: true, abstract: true, keywords: true, notes: true, authors: true, year: true },
  });

  for (const ref of references) {
    const parts: string[] = [];
    if (ref.abstract) parts.push(ref.abstract);
    if (ref.notes) parts.push(ref.notes);
    const combined = parts.join("\n\n");
    if (combined.trim()) {
      sources.push({
        sourceType: "reference",
        sourceId: ref.id,
        sourceTitle: ref.title,
        content: combined,
        metadata: { authors: ref.authors, year: ref.year, keywords: ref.keywords, title: ref.title },
      });
    }
  }

  // ── NotebookEntries (global) ──
  const notebookEntries = await db.notebookEntry.findMany({
    select: { id: true, question: true, answer: true, tags: true, sourceId: true },
  });

  for (const entry of notebookEntries) {
    sources.push({
      sourceType: "notebook",
      sourceId: entry.id,
      sourceTitle: entry.question.slice(0, 80),
      content: `Question : ${entry.question}\n\nRéponse : ${entry.answer}`,
      metadata: { tags: entry.tags, sourceId: entry.sourceId },
    });
  }

  // ── ThesisCadrageFields (filtered by thesisId) ──
  const cadrages = await db.thesisCadrage.findMany({
    where: { thesisId },
    select: { id: true, label: true, fields: { select: { id: true, fieldKey: true, label: true, value: true } } },
  });

  for (const cadrage of cadrages) {
    for (const field of cadrage.fields) {
      if (field.value && field.value.trim()) {
        sources.push({
          sourceType: "cadrage",
          sourceId: field.id,
          sourceTitle: `${field.label} (${cadrage.label || "Cadrage"})`,
          content: field.value,
          metadata: { fieldKey: field.fieldKey, cadrageLabel: cadrage.label },
        });
      }
    }
  }

  // 2. Clear existing chunks
  const chapterIds = chapters.map((c) => c.id);
  const referenceIds = references.map((r) => r.id);
  const notebookIds = notebookEntries.map((e) => e.id);
  const cadrageIds = cadrages.flatMap((c) => c.fields.map((f) => f.id));

  await db.documentChunk.deleteMany({
    where: {
      OR: [
        { sourceType: "chapter", sourceId: { in: chapterIds } },
        { sourceType: "reference", sourceId: { in: referenceIds } },
        { sourceType: "notebook", sourceId: { in: notebookIds } },
        { sourceType: "cadrage", sourceId: { in: cadrageIds } },
      ],
    },
  });

  // 3. Chunk all sources
  interface ChunkData {
    thesisId: string | null;
    sourceType: string;
    sourceId: string;
    sourceTitle: string;
    content: string;
    chunkIndex: number;
    metadata: string;
    tokenCount: number;
  }

  const allChunkData: ChunkData[] = [];

  for (const source of sources) {
    const chunks = chunkText(source.content);
    for (const chunk of chunks) {
      const tokenCount = estimateTokens(chunk.content);
      stats.totalTokens += tokenCount;
      stats.totalChunks++;

      switch (source.sourceType) {
        case "chapter": stats.chapters++; break;
        case "reference": stats.references++; break;
        case "notebook": stats.notebooks++; break;
        case "cadrage": stats.cadrages++; break;
      }

      allChunkData.push({
        thesisId: source.sourceType === "chapter" || source.sourceType === "cadrage"
          ? thesisId : null,
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        sourceTitle: source.sourceTitle,
        content: chunk.content,
        chunkIndex: chunk.index,
        metadata: JSON.stringify(source.metadata),
        tokenCount,
      });
    }
  }

  // 4. Generate embeddings (if provider supports it)
  let embeddings: (EmbeddingResult | null)[] = [];
  if (canEmbed && providerConfig && allChunkData.length > 0) {
    const texts = allChunkData.map((c) => c.content);
    console.log(`[RAG] Generating embeddings for ${texts.length} chunks via ${embInfo!.provider}/${embInfo!.model}...`);
    embeddings = await generateEmbeddings(texts, providerConfig);
    const embeddedCount = embeddings.filter((e) => e !== null).length;
    stats.embeddedChunks = embeddedCount;
    if (embeddedCount > 0) {
      stats.embeddingModel = embInfo!.model;
      console.log(`[RAG] ${embeddedCount}/${texts.length} chunks embedded successfully`);
    } else {
      console.log(`[RAG] Embedding generation failed — falling back to keyword search`);
    }
  }

  // 5. Insert into DB
  if (allChunkData.length > 0) {
    const BATCH_SIZE = 100;
    for (let i = 0; i < allChunkData.length; i += BATCH_SIZE) {
      const batch = allChunkData.slice(i, i + BATCH_SIZE);
      await db.documentChunk.createMany({
        data: batch.map((c, idx) => ({
          ...c,
          embedding: embeddings[i + idx]?.embedding ?? null,
          embeddingModel: embeddings[i + idx]?.model ?? null,
        })),
      });
    }
  }

  return stats;
}

// ───────────────────────────────────────
// retrieveChunks — hybrid (keyword + semantic)
// Paginated with Prisma filters: thesisId + embedding IS NOT NULL
// ───────────────────────────────────────

/**
 * Retrieve the most relevant chunks for a query.
 *
 * Filters applied at the DB level (not in-memory):
 * - thesisId: only chunks belonging to this thesis (chapter/cadrage)
 *   + global chunks (references/notebooks) if includeGlobal=true
 * - embedding IS NOT NULL: when doing hybrid/semantic search,
 *   skip chunks without embeddings to avoid unnecessary parsing
 *
 * Pagination: loads all filtered chunks (SQLite has no native vector index,
 *   so cosine similarity must be computed in-app). For 1 thesis (~400 chunks)
 *   this is fine. See AGENTS.md for scaling limits.
 */
export async function retrieveChunks(
  query: string,
  topK: number = 5,
  providerConfig?: AiProviderConfig,
  options?: { thesisId?: string; includeGlobal?: boolean }
): Promise<RetrievalResult[]> {
  const { thesisId, includeGlobal = true } = options ?? {};

  // Build Prisma WHERE clause for thesis filtering
  const thesisWhere = buildThesisWhere(thesisId, includeGlobal);

  // Check if we can do semantic scoring (need provider that supports embeddings)
  const canDoSemantic = providerConfig &&
    getEmbeddingInfo(providerConfig).supported;

  if (canDoSemantic) {
    // For hybrid/semantic, only load chunks that HAVE embeddings
    // Combine thesis filter + embedding filter with AND
    const where = thesisWhere
      ? { AND: [thesisWhere, { embedding: { not: null as const } }] }
      : { embedding: { not: null as const } };

    const allChunks = await db.documentChunk.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (allChunks.length === 0) {
      // No embedded chunks — fallback to keyword-only (broader filter)
      return retrieveChunksKeywordOnly(query, topK, thesisWhere);
    }

    // Keyword scoring (on the embedded subset)
    const keywordScores = scoreByKeywords(allChunks, query);

    // Semantic scoring
    const { generateEmbedding } = await import("./embedding-service");
    const queryEmbedding = await generateEmbedding(query, providerConfig);

    if (queryEmbedding) {
      const queryVector = parseEmbedding(queryEmbedding.embedding);
      if (queryVector.length > 0) {
        const semanticScores = scoreByEmbeddings(allChunks, queryVector);
        return hybridRank(allChunks, keywordScores, semanticScores, topK);
      }
    }

    // Embedding generation failed — keyword-only on embedded chunks
    return keywordOnlyRank(allChunks, keywordScores, topK);
  }

  // Keyword-only path (no provider or provider doesn't support embeddings)
  return retrieveChunksKeywordOnly(query, topK, thesisWhere);
}

/**
 * Build a Prisma-compatible WHERE clause for thesis filtering.
 * Returns undefined if no filtering is needed.
 */
function buildThesisWhere(
  thesisId: string | undefined,
  includeGlobal: boolean
): Record<string, unknown> | undefined {
  if (!thesisId) return undefined;
  if (includeGlobal) {
    // Thesis-specific chunks OR global chunks (references/notebooks)
    return { OR: [{ thesisId }, { thesisId: null }] };
  }
  return { thesisId };
}

/**
 * Keyword-only retrieval with Prisma filtering.
 */
async function retrieveChunksKeywordOnly(
  query: string,
  topK: number,
  thesisWhere: Record<string, unknown> | undefined
): Promise<RetrievalResult[]> {
  const allChunks = await db.documentChunk.findMany({
    where: thesisWhere,
    orderBy: { createdAt: "desc" },
  });

  if (allChunks.length === 0) return [];

  const keywordScores = scoreByKeywords(allChunks, query);
  return keywordOnlyRank(allChunks, keywordScores, topK);
}

// ───────────────────────────────────────
// Scoring helpers
// ───────────────────────────────────────

function scoreByKeywords(
  chunks: { id: string; content: string; sourceTitle: string }[],
  query: string
): Map<string, number> {
  const queryLower = query.toLowerCase();
  const stopWords = new Set([
    "le", "la", "les", "de", "du", "des", "un", "une", "et", "ou", "est",
    "en", "dans", "pour", "que", "qui", "sur", "par", "avec", "ce", "cette",
    "il", "elle", "ils", "elles", "son", "sa", "ses", "au", "aux", "ne",
    "pas", "plus", "très", "été", "a", "à", "l", "d", "s", "n", "c", "j",
    "me", "tu", "nous", "vous", "on", "y", "se", "leur", "leurs", "mon",
    "ton", "ma", "ta", "mes", "tes", "tout", "tous", "toute", "toutes",
    "the", "a", "an", "is", "are", "of", "in", "to", "and", "or", "for",
    "with", "on", "at", "by", "from", "it", "its", "this", "that", "be",
  ]);

  const queryTerms = queryLower
    .replace(/[^a-zàâäéèêëïîôùûüÿçœæ0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !stopWords.has(t));

  const scores = new Map<string, number>();

  if (queryTerms.length === 0) return scores;

  for (const chunk of chunks) {
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.sourceTitle.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      score += (contentLower.split(term).length - 1);
      score += (titleLower.split(term).length - 1) * 2;
    }
    if (score > 0) scores.set(chunk.id, score);
  }

  return scores;
}

function scoreByEmbeddings(
  chunks: { id: string; embedding: string | null }[],
  queryVector: number[]
): Map<string, number> {
  const scores = new Map<string, number>();

  for (const chunk of chunks) {
    if (!chunk.embedding) continue;
    const chunkVector = parseEmbedding(chunk.embedding);
    if (chunkVector.length === 0) continue;
    const sim = cosineSimilarity(queryVector, chunkVector);
    if (sim > 0) scores.set(chunk.id, sim);
  }

  return scores;
}

/** Normalize scores to 0-1 range */
function normalizeScores(scores: Map<string, number>): Map<string, number> {
  const result = new Map<string, number>();
  let max = 0;
  for (const v of scores.values()) {
    if (v > max) max = v;
  }
  if (max === 0) return result;
  for (const [k, v] of scores) {
    result.set(k, v / max);
  }
  return result;
}

function hybridRank(
  chunks: { id: string; sourceType: string; sourceId: string; sourceTitle: string; content: string; chunkIndex: number; metadata: string; tokenCount: number }[],
  keywordScores: Map<string, number>,
  semanticScores: Map<string, number>,
  topK: number
): RetrievalResult[] {
  const normKw = normalizeScores(keywordScores);
  const normSem = normalizeScores(semanticScores);

  const scored: RetrievalResult[] = [];

  for (const chunk of chunks) {
    const kw = normKw.get(chunk.id) ?? 0;
    const sem = normSem.get(chunk.id) ?? 0;
    const combined = kw * KEYWORD_WEIGHT + sem * SEMANTIC_WEIGHT;

    // Only include chunks that have at least one signal
    if (combined > 0) {
      const scoreType: RetrievalResult["scoreType"] =
        kw > 0 && sem > 0 ? "hybrid" : kw > 0 ? "keyword" : "semantic";
      scored.push({
        chunk: { id: chunk.id, sourceType: chunk.sourceType, sourceId: chunk.sourceId, sourceTitle: chunk.sourceTitle, content: chunk.content, chunkIndex: chunk.chunkIndex, metadata: chunk.metadata, tokenCount: chunk.tokenCount },
        score: combined,
        scoreType,
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

function keywordOnlyRank(
  chunks: { id: string; sourceType: string; sourceId: string; sourceTitle: string; content: string; chunkIndex: number; metadata: string; tokenCount: number }[],
  keywordScores: Map<string, number>,
  topK: number
): RetrievalResult[] {
  const scored: RetrievalResult[] = [];

  for (const chunk of chunks) {
    const score = keywordScores.get(chunk.id);
    if (score !== undefined && score > 0) {
      scored.push({
        chunk: { id: chunk.id, sourceType: chunk.sourceType, sourceId: chunk.sourceId, sourceTitle: chunk.sourceTitle, content: chunk.content, chunkIndex: chunk.chunkIndex, metadata: chunk.metadata, tokenCount: chunk.tokenCount },
        score,
        scoreType: "keyword",
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

// ───────────────────────────────────────
// generateRagResponse — retrieve + generate
// ───────────────────────────────────────

export async function generateRagResponse(
  query: string,
  thesisId?: string,
  providerConfig?: AiProviderConfig
): Promise<RagResponse> {
  // Step 1: Retrieve relevant chunks (filtered by thesisId when available)
  const retrieved = await retrieveChunks(query, 5, providerConfig, {
    thesisId,
    includeGlobal: true,
  });

  if (retrieved.length === 0) {
    return {
      answer:
        "Aucun document n'a été trouvé dans l'index. Veuillez d'abord indexer le contenu de votre thèse " +
        "via le bouton \"Indexer\" dans le module \"Mon IA de thèse\".",
      sources: [],
      chunks: [],
    };
  }

  // Step 2: Build context string
  const contextParts = retrieved.map((r, i) => {
    const meta = (() => {
      try { return JSON.parse(r.chunk.metadata) as Record<string, unknown>; }
      catch { return {}; }
    })();

    let sourceLabel = "";
    switch (r.chunk.sourceType) {
      case "chapter":
        sourceLabel = `[Chapitre ${meta.chapterNumber ?? "?"} - ${r.chunk.sourceTitle}]`;
        break;
      case "reference": {
        const authorStr = typeof meta.authors === "string" ? meta.authors.split(";")[0].trim() : "";
        const yearStr = meta.year ? ` (${meta.year})` : "";
        sourceLabel = `[Réf: ${authorStr}${yearStr} - ${r.chunk.sourceTitle}]`;
        break;
      }
      case "notebook":
        sourceLabel = `[Carnet: ${r.chunk.sourceTitle}]`;
        break;
      case "cadrage":
        sourceLabel = `[Cadrage: ${r.chunk.sourceTitle}]`;
        break;
    }

    return `--- Extrait ${i + 1} ${sourceLabel} ---\n${r.chunk.content}`;
  });

  const contextStr = contextParts.join("\n\n");

  // Step 3: Build messages and call AI
  const userMessage =
    `Voici les extraits de documents de la thèse de l'utilisateur :\n\n` +
    contextStr +
    `\n\n---\n\nQuestion de l'utilisateur : ${query}`;

  const completionOptions: AiCompletionOptions = {
    messages: [
      { role: "system", content: RAG_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.4,
    maxTokens: 2048,
    providerConfig,
  };

  const result = await generateCompletion(completionOptions);

  // Step 4: Build sources list
  const sources = retrieved.map((r) => ({
    type: r.chunk.sourceType,
    title: r.chunk.sourceTitle,
    chunkIndex: r.chunk.chunkIndex,
  }));

  return {
    answer: result.content,
    sources,
    chunks: retrieved,
  };
}

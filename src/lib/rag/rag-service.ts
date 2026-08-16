// ═══════════════════════════════════════
// ThesisFrame — RAG Service ("Mon IA de thèse")
// Server-side only — keyword-based retrieval with chunking
// ═══════════════════════════════════════

import { db } from "@/lib/db";
import {
  generateCompletion,
  type AiCompletionOptions,
  type AiProviderConfig,
} from "@/lib/ai/zai-client";

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
  // Priority: double newline > single newline > period+space
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
    // If adding this segment exceeds max, flush the buffer
    if (buffer.length > 0 && buffer.length + segment.length + 1 > maxChars) {
      chunks.push({ content: buffer.trim(), index: chunkIndex++ });

      // Start new buffer with overlap from end of previous chunk
      if (buffer.length > overlapChars) {
        // Find a sentence boundary within the overlap region
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

  // Flush remaining buffer
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
// indexThesisContent — fetch, chunk, store
// ───────────────────────────────────────

export async function indexThesisContent(thesisId: string): Promise<IndexResult> {
  const stats: IndexResult = {
    totalChunks: 0,
    chapters: 0,
    references: 0,
    notebooks: 0,
    cadrages: 0,
    totalTokens: 0,
  };

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
    select: {
      id: true,
      title: true,
      plainText: true,
      number: true,
    },
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

  // ── References (global — index all) ──
  const references = await db.reference.findMany({
    select: {
      id: true,
      title: true,
      abstract: true,
      keywords: true,
      notes: true,
      authors: true,
      year: true,
    },
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
        metadata: {
          authors: ref.authors,
          year: ref.year,
          keywords: ref.keywords,
          title: ref.title,
        },
      });
    }
  }

  // ── NotebookEntries (global — index all) ──
  const notebookEntries = await db.notebookEntry.findMany({
    select: {
      id: true,
      question: true,
      answer: true,
      tags: true,
      sourceId: true,
    },
  });

  for (const entry of notebookEntries) {
    const content = `Question : ${entry.question}\n\nRéponse : ${entry.answer}`;
    sources.push({
      sourceType: "notebook",
      sourceId: entry.id,
      sourceTitle: entry.question.slice(0, 80),
      content,
      metadata: { tags: entry.tags, sourceId: entry.sourceId },
    });
  }

  // ── ThesisCadrageFields (filtered by thesisId) ──
  const cadrages = await db.thesisCadrage.findMany({
    where: { thesisId },
    select: {
      id: true,
      label: true,
      fields: {
        select: {
          id: true,
          fieldKey: true,
          label: true,
          value: true,
        },
      },
    },
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

  // 2. Clear existing chunks for this thesis
  //    - Chapters: only this thesis's chapters
  //    - References: all (global)
  //    - Notebooks: all (global)
  //    - Cadrage: only this thesis's cadrage fields
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

  // 3. Chunk and insert
  const insertData: {
    sourceType: string;
    sourceId: string;
    sourceTitle: string;
    content: string;
    chunkIndex: number;
    metadata: string;
    tokenCount: number;
  }[] = [];

  for (const source of sources) {
    const chunks = chunkText(source.content);
    for (const chunk of chunks) {
      const tokenCount = estimateTokens(chunk.content);
      stats.totalTokens += tokenCount;
      stats.totalChunks++;

      switch (source.sourceType) {
        case "chapter":
          stats.chapters++;
          break;
        case "reference":
          stats.references++;
          break;
        case "notebook":
          stats.notebooks++;
          break;
        case "cadrage":
          stats.cadrages++;
          break;
      }

      insertData.push({
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

  // Batch insert (SQLite handles reasonable batch sizes)
  if (insertData.length > 0) {
    // Insert in batches of 100 to avoid issues
    const BATCH_SIZE = 100;
    for (let i = 0; i < insertData.length; i += BATCH_SIZE) {
      const batch = insertData.slice(i, i + BATCH_SIZE);
      await db.documentChunk.createMany({ data: batch });
    }
  }

  return stats;
}

// ───────────────────────────────────────
// retrieveChunks — keyword-based retrieval
// ───────────────────────────────────────

export async function retrieveChunks(
  query: string,
  topK: number = 5
): Promise<RetrievalResult[]> {
  // Fetch ALL chunks from DB
  const allChunks = await db.documentChunk.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (allChunks.length === 0) return [];

  // Normalize and tokenize the query
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

  if (queryTerms.length === 0) return [];

  // Score each chunk
  const scored: RetrievalResult[] = allChunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.sourceTitle.toLowerCase();

    let score = 0;
    for (const term of queryTerms) {
      // Count term occurrences in content
      const contentMatches = contentLower.split(term).length - 1;
      score += contentMatches;

      // Boost for title matches (2x weight)
      const titleMatches = titleLower.split(term).length - 1;
      score += titleMatches * 2;
    }

    return {
      chunk: {
        id: chunk.id,
        sourceType: chunk.sourceType,
        sourceId: chunk.sourceId,
        sourceTitle: chunk.sourceTitle,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        metadata: chunk.metadata,
        tokenCount: chunk.tokenCount,
      },
      score,
    };
  });

  // Filter out zero-score results and sort by score descending
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ───────────────────────────────────────
// generateRagResponse — retrieve + generate
// ───────────────────────────────────────

export async function generateRagResponse(
  query: string,
  thesisId?: string,
  providerConfig?: AiProviderConfig
): Promise<RagResponse> {
  // Step 1: Retrieve relevant chunks
  const retrieved = await retrieveChunks(query, 5);

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
      try {
        return JSON.parse(r.chunk.metadata) as Record<string, unknown>;
      } catch {
        return {};
      }
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

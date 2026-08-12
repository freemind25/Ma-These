/**
 * Document Parser — Extract text from uploaded documents.
 * Inspired by SurfSense's ETL pipeline, adapted for TypeScript/Node.js.
 *
 * Supported formats:
 * - text/plain
 * - text/markdown
 * - application/pdf (extracted via VLM on mini-service, or raw text fallback)
 * - HTML (stripped to text)
 */

// ── Types ──

export interface ParseResult {
  title: string
  content: string
  plainText: string
  wordCount: number
  language?: string
}

// ── Normalization ──

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function stripHtml(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function toPlainText(text: string): string {
  return text
    .replace(/[^a-zA-ZàâäéèêëïîôùûüÿçœæÀÂÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ\s\d.,;:!?()\[\]{}"'«»\-–—/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function extractTitle(text: string, fileName?: string): string {
  // Try first meaningful line
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (line.length > 3 && line.length < 200 && !line.startsWith('#') && !line.startsWith('http')) {
      return line
    }
  }
  return fileName?.replace(/\.[^.]+$/, '') || 'Document sans titre'
}

// ── Detect MIME type ──

export function detectFileType(fileName: string, mimeType?: string): 'text' | 'markdown' | 'html' | 'pdf' | 'image' | 'audio' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const mime = (mimeType || '').toLowerCase()

  if (['md', 'markdown'].includes(ext) || mime.includes('markdown')) return 'markdown'
  if (['txt', 'text'].includes(ext) || mime === 'text/plain') return 'text'
  if (['html', 'htm'].includes(ext) || mime.includes('html')) return 'html'
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext) || mime.startsWith('image/')) return 'image'
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'webm'].includes(ext) || mime.startsWith('audio/')) return 'audio'
  return 'other'
}

// ── Main parser ──

export function parseDocument(
  rawContent: string,
  fileName?: string,
  mimeType?: string
): ParseResult {
  const fileType = detectFileType(fileName || '', mimeType)
  let content = rawContent
  let plainText: string

  switch (fileType) {
    case 'markdown':
      content = rawContent
      plainText = toPlainText(stripMarkdown(rawContent))
      break
    case 'html':
      content = stripHtml(rawContent)
      plainText = toPlainText(content)
      break
    case 'text':
    default:
      content = rawContent
      plainText = toPlainText(rawContent)
      break
  }

  const title = extractTitle(content, fileName)
  const wordCount = countWords(plainText)

  return { title, content, plainText, wordCount }
}

// ── Chunking (inspired by SurfSense's Chonkie + thesis-rag) ──

const MIN_CHUNK_LENGTH = 100
const MAX_CHUNK_LENGTH = 1000
const OVERLAP_LENGTH = 100

export interface TextChunk {
  content: string
  plainText: string
  chunkIndex: number
  charStart: number
  charEnd: number
  wordCount: number
}

export function chunkText(text: string): TextChunk[] {
  if (!text || text.trim().length < MIN_CHUNK_LENGTH) {
    if (text && text.trim().length > 0) {
      return [{
        content: text.trim(),
        plainText: toPlainText(text.trim()),
        chunkIndex: 0,
        charStart: 0,
        charEnd: text.length,
        wordCount: countWords(text.trim()),
      }]
    }
    return []
  }

  const chunks: TextChunk[] = []
  let position = 0

  while (position < text.length) {
    let end = Math.min(position + MAX_CHUNK_LENGTH, text.length)

    // Try to break at a sentence or paragraph boundary
    if (end < text.length) {
      const searchArea = text.slice(position, end)

      // Look for paragraph break first
      let breakPoint = searchArea.lastIndexOf('\n\n')
      if (breakPoint > MIN_CHUNK_LENGTH) {
        end = position + breakPoint + 2
      } else {
        // Look for sentence end
        breakPoint = searchArea.lastIndexOf('. ')
        if (breakPoint > MIN_CHUNK_LENGTH) {
          end = position + breakPoint + 2
        } else {
          // Look for any newline
          breakPoint = searchArea.lastIndexOf('\n')
          if (breakPoint > MIN_CHUNK_LENGTH) {
            end = position + breakPoint + 1
          }
        }
      }
    }

    const chunkText = text.slice(position, end).trim()
    if (chunkText.length >= MIN_CHUNK_LENGTH) {
      chunks.push({
        content: chunkText,
        plainText: toPlainText(chunkText),
        chunkIndex: chunks.length,
        charStart: position,
        charEnd: end,
        wordCount: countWords(chunkText),
      })
    }

    // Move position with overlap
    position = end - OVERLAP_LENGTH
    if (position <= end - MAX_CHUNK_LENGTH + MIN_CHUNK_LENGTH) {
      position = end
    }
  }

  return chunks
}

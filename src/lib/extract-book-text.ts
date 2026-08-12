// Server-side text extraction from PDF and EPUB files.
// Inspired by book-to-skill's extraction approach but implemented in TypeScript.

// Import the actual parser directly, not the wrapper that runs test code at import time
import pdf from 'pdf-parse/lib/pdf-parse.js'
import JSZip from 'jszip'

export interface ExtractResult {
  text: string
  pageCount?: number
  metadata?: { title?: string; author?: string; creator?: string }
}

/**
 * Extract text from a PDF buffer.
 */
export async function extractPdfText(buffer: Buffer): Promise<ExtractResult> {
  const data = await pdf(buffer)
  return {
    text: data.text,
    pageCount: data.numpages,
    metadata: data.info
      ? {
          title: data.info.Title || undefined,
          author: data.info.Author || undefined,
          creator: data.info.Creator || undefined,
        }
      : undefined,
  }
}

/**
 * Extract text from an EPUB buffer.
 * EPUB is a ZIP containing XHTML content files.
 */
export async function extractEpubText(buffer: Buffer): Promise<ExtractResult> {
  const zip = await JSZip.loadAsync(buffer)

  // Collect all XHTML/HTML content files, sorted by name for chapter order
  const htmlFiles: { name: string; content: string }[] = []

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue
    const ext = path.split('.').pop()?.toLowerCase()
    if (ext === 'xhtml' || ext === 'html' || ext === 'htm') {
      // Skip navigation, toc, and stylesheet-related files
      if (/\b(nav|toc|ncx|cover)\b/i.test(path)) continue
      const content = await file.async('string')
      htmlFiles.push({ name: path, content })
    }
  }

  // Sort by filename for reasonable chapter order
  htmlFiles.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))

  // Extract text from each file
  const textParts: string[] = []
  for (const { content } of htmlFiles) {
    const text = stripHtml(content)
    if (text.trim().length > 100) {
      textParts.push(text)
    }
  }

  // Try to get metadata from OPF
  let metadata: ExtractResult['metadata'] = {}
  const opfFile = Object.keys(zip.files).find(f => f.endsWith('.opf'))
  if (opfFile) {
    const opfContent = await zip.files[opfFile].async('string')
    const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)/i)
    const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)/i)
    if (titleMatch) metadata.title = titleMatch[1].trim()
    if (authorMatch) metadata.author = authorMatch[1].trim()
  }

  return {
    text: textParts.join('\n\n---\n\n'),
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function extractBookText(buffer: Buffer, fileName: string): Promise<ExtractResult> {
  const ext = fileName.toLowerCase().split('.').pop()

  if (ext === 'pdf') return extractPdfText(buffer)
  if (ext === 'epub') return extractEpubText(buffer)

  throw new Error(`Format non supporté : .${ext}. Utilisez PDF ou EPUB.`)
}
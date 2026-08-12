import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

// Font type for helpers (avoids circular reference with typeof font.embed)
type PDFEmbeddedFont = Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>

// ─── Types ─────────────────────────────────────────────────────
interface ChapterInput {
  title: string
  content: string
  selected: boolean
}

interface ExportRequest {
  thesisTitle: string
  author: string
  supervisor?: string
  university?: string
  faculty?: string
  department?: string
  date?: string
  keywords?: string
  includeToc: boolean
  includePageNumbers: boolean
  watermark?: string
  chapters: ChapterInput[]
}

// ─── Constants ─────────────────────────────────────────────────
const PAGE_W = 595.28 // A4 width in points
const PAGE_H = 841.89 // A4 height in points
const MARGIN_TOP = 72
const MARGIN_BOTTOM = 72
const MARGIN_LEFT = 72
const MARGIN_RIGHT = 72
const LINE_HEIGHT = 16
const BODY_SIZE = 11
const H1_SIZE = 22
const H2_SIZE = 16
const SMALL_SIZE = 9
const COLOR_TEXT = rgb(0.15, 0.15, 0.15)
const COLOR_HEADING = rgb(0.1, 0.1, 0.1)
const COLOR_MUTED = rgb(0.45, 0.45, 0.45)
const COLOR_ACCENT = rgb(0.05, 0.55, 0.35) // emerald
const COLOR_WATERMARK = rgb(0.85, 0.85, 0.85)

// ─── Helpers ───────────────────────────────────────────────────

function wrapText(text: string, font: PDFEmbeddedFont, fontSize: number, maxWidth: number): string[] {
  // Normalize whitespace
  const normalized = text.replace(/\r\n/g, '\n').replace(/\t/g, '    ')
  const paragraphs = normalized.split('\n')
  const lines: string[] = []

  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('')
      continue
    }
    const words = para.split(/\s+/)
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      try {
        const width = font.widthOfTextAtSize(testLine, fontSize)
        if (width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      } catch {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
  }
  return lines
}

function cleanContent(text: string): string {
  // Remove LaTeX commands but keep text
  return text
    .replace(/\\TODO\{[^}]*\}/g, '')
    .replace(/\\\w+\{([^}]*)\}/g, '$1')
    .replace(/\\\w+/g, '')
    .replace(/[{}\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Main PDF Generator ────────────────────────────────────────

async function generateThesisPdf(data: ExportRequest): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const fontBoldItalic = await pdf.embedFont(StandardFonts.HelveticaBoldOblique)

  const usableWidth = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT
  let currentPage = pdf.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN_TOP
  let chapterIndex = 0
  const tocEntries: { title: string; page: number }[] = []

  // ─── Helper: add text on current or new page ───
  function ensureSpace(needed: number) {
    if (y - needed < MARGIN_BOTTOM) {
      addPageNumber(pdf, currentPage, chapterIndex, data.includePageNumbers, fontRegular)
      if (data.watermark) addWatermark(currentPage, data.watermark, fontBold)
      currentPage = pdf.addPage([PAGE_W, PAGE_H])
      y = PAGE_H - MARGIN_TOP
    }
  }

  function drawLine(text: string, x: number, fontSize: number, color: typeof COLOR_TEXT, font: typeof fontRegular) {
    try {
      currentPage.drawText(text, { x, y, size: fontSize, color, font: font || fontRegular })
    } catch {
      // skip problematic characters
      currentPage.drawText(text.replace(/[^\x00-\x7F]/g, '?'), { x, y, size: fontSize, color, font: font || fontRegular })
    }
  }

  // ─── PAGE DE COVERTURE ───
  const totalChapters = data.chapters.filter(c => c.selected).length

  y = PAGE_H - 200
  drawLine('RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE', PAGE_W / 2, 11, COLOR_TEXT, fontBold)
  y -= LINE_HEIGHT
  drawLine('MINISTÈRE DE L\'ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE', PAGE_W / 2, 10, COLOR_TEXT, fontRegular)
  y -= LINE_HEIGHT * 1.5

  if (data.university) {
    drawLine(data.university, PAGE_W / 2, 12, COLOR_TEXT, fontBold)
    y -= LINE_HEIGHT
  }
  if (data.faculty) {
    drawLine(data.faculty, PAGE_W / 2, 11, COLOR_TEXT, fontBold)
    y -= LINE_HEIGHT
  }
  if (data.department) {
    drawLine(data.department, PAGE_W / 2, 11, COLOR_TEXT, fontRegular)
    y -= LINE_HEIGHT * 2
  }

  // Separator line
  try {
    currentPage.drawLine({
      start: { x: MARGIN_LEFT + 80, y: y + 5 },
      end: { x: PAGE_W - MARGIN_RIGHT - 80, y: y + 5 },
      thickness: 1.5,
      color: COLOR_ACCENT,
    })
  } catch { /* noop */ }
  y -= LINE_HEIGHT * 2

  // Type of document
  drawLine('THÈSE DE DOCTORAT', PAGE_W / 2, 14, COLOR_TEXT, fontBold)
  y -= LINE_HEIGHT * 1.5

  // Discipline
  if (data.keywords) {
    drawLine(`Mots-clés : ${data.keywords}`, PAGE_W / 2, 11, COLOR_MUTED, fontItalic)
  }
  y -= LINE_HEIGHT * 2

  // Title
  const titleLines = wrapText(data.thesisTitle || 'Titre de la thèse', fontBold, H1_SIZE - 2, usableWidth - 40)
  for (const line of titleLines) {
    const lineWidth = fontBold.widthOfTextAtSize(line, H1_SIZE - 2)
    drawLine(line, (PAGE_W - lineWidth) / 2, H1_SIZE - 2, COLOR_HEADING, fontBold)
    y -= LINE_HEIGHT * 1.5
  }
  y -= LINE_HEIGHT

  // Separator
  try {
    currentPage.drawLine({
      start: { x: PAGE_W / 2 - 60, y },
      end: { x: PAGE_W / 2 + 60, y },
      thickness: 0.5,
      color: COLOR_MUTED,
    })
  } catch { /* noop */ }
  y -= LINE_HEIGHT * 2

  // Author
  if (data.author) {
    drawLine('Présentée et soutenue par :', PAGE_W / 2, 11, COLOR_MUTED, fontItalic)
    y -= LINE_HEIGHT * 1.2
    drawLine(data.author, PAGE_W / 2, 16, COLOR_HEADING, fontBold)
    y -= LINE_HEIGHT * 2
  }

  // Supervisor
  if (data.supervisor) {
    drawLine('Directeur de thèse :', PAGE_W / 2, 11, COLOR_MUTED, fontItalic)
    y -= LINE_HEIGHT * 1.2
    drawLine(data.supervisor, PAGE_W / 2, 13, COLOR_TEXT, fontBold)
  }

  y -= LINE_HEIGHT * 3
  // Date
  if (data.date) {
    drawLine(data.date, PAGE_W / 2, 12, COLOR_MUTED, fontRegular)
  }

  // ─── TABLE DES MATIÈRES ───
  if (data.includeToc) {
    chapterIndex++
    addPageNumber(pdf, currentPage, chapterIndex, data.includePageNumbers, fontRegular)
    if (data.watermark) addWatermark(currentPage, data.watermark, fontBold)

    currentPage = pdf.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN_TOP

    drawLine('TABLE DES MATIÈRES', MARGIN_LEFT, H1_SIZE, COLOR_HEADING, fontBold)
    y -= LINE_HEIGHT * 2

    for (const chapter of data.chapters) {
      if (!chapter.selected) continue
      tocEntries.push({ title: chapter.title, page: 0 }) // page filled later
      drawLine(chapter.title, MARGIN_LEFT + 20, BODY_SIZE, COLOR_TEXT, fontRegular)
      y -= LINE_HEIGHT * 1.5
      ensureSpace(LINE_HEIGHT * 2)
    }
  }

  // ─── CHAPTERS ───
  const selectedChapters = data.chapters.filter(c => c.selected && c.content.trim())

  for (let ci = 0; ci < selectedChapters.length; ci++) {
    const chapter = selectedChapters[ci]
    chapterIndex++

    // New page for each chapter
    if (ci > 0 || data.includeToc) {
      addPageNumber(pdf, currentPage, chapterIndex, data.includePageNumbers, fontRegular)
      if (data.watermark) addWatermark(currentPage, data.watermark, fontBold)
      currentPage = pdf.addPage([PAGE_W, PAGE_H])
      y = PAGE_H - MARGIN_TOP
    }

    // Chapter heading
    const chapterNum = data.chapters.filter(c => c.selected).indexOf(chapter) + 1
    const headingText = chapter.title
    const headingLines = wrapText(headingText, fontBold, H1_SIZE, usableWidth)

    for (const line of headingLines) {
      drawLine(line, MARGIN_LEFT, H1_SIZE, COLOR_HEADING, fontBold)
      y -= LINE_HEIGHT * 1.8
    }

    // Separator after heading
    try {
      currentPage.drawLine({
        start: { x: MARGIN_LEFT, y: y + 5 },
        end: { x: PAGE_W - MARGIN_RIGHT, y: y + 5 },
        thickness: 0.8,
        color: COLOR_ACCENT,
      })
    } catch { /* noop */ }
    y -= LINE_HEIGHT * 1.2

    // Body text
    const cleanedContent = cleanContent(chapter.content)
    const paragraphs = cleanedContent.split(/\n\s*\n/)

    for (const para of paragraphs) {
      const trimmed = para.trim()
      if (!trimmed) continue

      const lines = wrapText(trimmed, fontRegular, BODY_SIZE, usableWidth)
      // First line indent
      const indent = trimmed.length > 50 ? 24 : 0

      for (let li = 0; li < lines.length; li++) {
        ensureSpace(LINE_HEIGHT * 2)
        const lineIndent = li === 0 ? indent : 0
        drawLine(lines[li], MARGIN_LEFT + lineIndent, BODY_SIZE, COLOR_TEXT, fontRegular)
        y -= LINE_HEIGHT
      }
      y -= LINE_HEIGHT * 0.5 // paragraph spacing
    }
  }

  // Final page number
  addPageNumber(pdf, currentPage, chapterIndex, data.includePageNumbers, fontRegular)
  if (data.watermark) addWatermark(currentPage, data.watermark, fontBold)

  return pdf.save()
}

// ─── Page number helper ────────────────────────────────────────
function addPageNumber(
  pdf: PDFDocument,
  page: Awaited<ReturnType<typeof pdf.addPage>>,
  index: number,
  show: boolean,
  font: Awaited<ReturnType<typeof pdf.embedFont>>
) {
  if (!show) return
  try {
    const text = `— ${index} —`
    const width = font.widthOfTextAtSize(text, SMALL_SIZE)
    page.drawText(text, {
      x: (PAGE_W - width) / 2,
      y: MARGIN_BOTTOM / 2,
      size: SMALL_SIZE,
      color: COLOR_MUTED,
      font,
    })
  } catch { /* noop */ }
}

// ─── Watermark helper ──────────────────────────────────────────
function addWatermark(
  page: Awaited<ReturnType<typeof PDFDocument.prototype.addPage>>,
  text: string,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
) {
  try {
    const textWidth = font.widthOfTextAtSize(text, 48)
    page.drawText(text, {
      x: (PAGE_W - textWidth) / 2,
      y: PAGE_H / 2,
      size: 48,
      color: COLOR_WATERMARK,
      font,
      rotate: degrees(45),
    })
  } catch { /* noop */ }
}

// ─── Route Handler ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()

    // Validation
    if (!body.chapters || !Array.isArray(body.chapters)) {
      return NextResponse.json({ error: 'Chapitres requis' }, { status: 400 })
    }

    const selectedChapters = body.chapters.filter((c: ChapterInput) => c.selected)
    if (selectedChapters.length === 0) {
      return NextResponse.json({ error: 'Sélectionnez au moins un chapitre' }, { status: 400 })
    }

    const pdfBytes = await generateThesisPdf(body)

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${(body.thesisTitle || 'these').replace(/[^a-zA-Z0-9àâéèêëïîôùûüç\s-]/g, '').replace(/\s+/g, '_').substring(0, 60)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
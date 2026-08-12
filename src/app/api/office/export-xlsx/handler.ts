import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { mkdtemp, writeFile, rm, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execFileAsync = promisify(execFile)
const OFFICECLI = process.env.OFFICECLI_PATH || '/home/z/.local/bin/officecli'

interface ChapterInfo {
  number: number
  title: string
  content: string
  wordCount: number
  status: string
  order: number
}

interface ThesisPayload {
  title: string
  author: string
  university: string
  field: string
  chapters: ChapterInfo[]
}

// POST /api/office/export-xlsx — Tableur de suivi de la thèse
export async function POST(request: NextRequest) {
  try {
    const payload: ThesisPayload = await request.json()
    const { title, author, university, field, chapters } = payload

    if (!chapters || !Array.isArray(chapters)) {
      return NextResponse.json({ error: 'chapters requis' }, { status: 400 })
    }

    const workDir = await mkdtemp(join(tmpdir(), 'officecli-xlsx-'))
    const filePath = join(workDir, 'suivi-these.xlsx')

    try {
      // 1. Create blank workbook
      await execFileAsync(OFFICECLI, ['create', filePath], { timeout: 30000 })

      // 2. Rename default sheet
      const renameOps = [
        { command: 'set', path: '/Sheet1', props: { name: 'Suivi' } },
      ]
      await writeAndBatch(workDir, filePath, renameOps, 'rename')

      // 3. Title block
      const titleOps = [
        // Row 1: Main title
        { command: 'set', path: '/Suivi/A1', props: { value: 'SUIVI DE THÈSE', bold: true, size: 16, font: 'Calibri', fill: '10B981', 'font.color': 'FFFFFF' } },
        { command: 'set', path: '/Suivi/B1', props: { value: title || 'Ma thèse', bold: true, size: 14, font: 'Calibri' } },
        // Row 2: Author
        { command: 'set', path: '/Suivi/A2', props: { value: 'Doctorant :', bold: true, size: 11, font: 'Calibri' } },
        { command: 'set', path: '/Suivi/B2', props: { value: author || 'Doctorant', size: 11, font: 'Calibri' } },
        // Row 3: University
        { command: 'set', path: '/Suivi/A3', props: { value: 'Université :', bold: true, size: 11, font: 'Calibri' } },
        { command: 'set', path: '/Suivi/B3', props: { value: university || '', size: 11, font: 'Calibri' } },
        // Row 4: Field
        { command: 'set', path: '/Suivi/A4', props: { value: 'Discipline :', bold: true, size: 11, font: 'Calibri' } },
        { command: 'set', path: '/Suivi/B4', props: { value: field || '', size: 11, font: 'Calibri' } },
        // Row 5: Date
        { command: 'set', path: '/Suivi/A5', props: { value: 'Date export :', bold: true, size: 11, font: 'Calibri' } },
        { command: 'set', path: '/Suivi/B5', props: { value: new Date().toLocaleDateString('fr-FR'), size: 11, font: 'Calibri' } },
      ]
      await writeAndBatch(workDir, filePath, titleOps, 'title')

      // 4. Column headers (row 7)
      const headers = ['N°', 'Chapitre', 'Statut', 'Mots rédigés', 'Objectif', 'Progression', 'Dernière révision']
      const headerOps = headers.map((h, i) => ({
        command: 'set' as const,
        path: `/Suivi/${String.fromCharCode(65 + i)}7`,
        props: { value: h, bold: true, size: 11, font: 'Calibri', fill: '1E293B', 'font.color': 'FFFFFF' },
      }))
      await writeAndBatch(workDir, filePath, headerOps, 'headers')

      // 5. Chapter data (rows 8+)
      const targetWordsPerChapter = Math.ceil(80000 / Math.max(chapters.length, 1))
      const chapterOps: any[] = []

      chapters.forEach((ch, i) => {
        const row = 8 + i
        const completion = ch.wordCount > 0 ? Math.min(100, Math.round((ch.wordCount / targetWordsPerChapter) * 100)) : 0
        const statusLabel = ch.status === 'completed' ? 'Terminé' : ch.status === 'in_progress' ? 'En cours' : 'Brouillon'

        chapterOps.push(
          { command: 'set', path: `/Suivi/A${row}`, props: { value: ch.number || (i + 1), size: 10, font: 'Calibri' } },
          { command: 'set', path: `/Suivi/B${row}`, props: { value: ch.title || `Chapitre ${i + 1}`, size: 10, font: 'Calibri', bold: true } },
          { command: 'set', path: `/Suivi/C${row}`, props: { value: statusLabel, size: 10, font: 'Calibri' } },
          { command: 'set', path: `/Suivi/D${row}`, props: { value: ch.wordCount || 0, size: 10, font: 'Calibri', numberformat: '#,##0' } },
          { command: 'set', path: `/Suivi/E${row}`, props: { value: targetWordsPerChapter, size: 10, font: 'Calibri', numberformat: '#,##0' } },
          { command: 'set', path: `/Suivi/F${row}`, props: { value: `${completion}%`, size: 10, font: 'Calibri', numberformat: '0%' } },
        )
      })

      // Totals row
      const totalRow = 8 + chapters.length + 1
      chapterOps.push(
        { command: 'set', path: `/Suivi/A${totalRow}`, props: { value: '', bold: true, fill: 'F1F5F9' } },
        { command: 'set', path: `/Suivi/B${totalRow}`, props: { value: 'TOTAL', bold: true, size: 11, font: 'Calibri', fill: 'F1F5F9' } },
        { command: 'set', path: `/Suivi/C${totalRow}`, props: { value: '', bold: true, fill: 'F1F5F9' } },
        { command: 'set', path: `/Suivi/D${totalRow}`, props: { value: chapters.reduce((s, c) => s + (c.wordCount || 0), 0), bold: true, size: 11, font: 'Calibri', fill: 'F1F5F9', numberformat: '#,##0' } },
        { command: 'set', path: `/Suivi/E${totalRow}`, props: { value: 80000, bold: true, size: 11, font: 'Calibri', fill: 'F1F5F9', numberformat: '#,##0' } },
        { command: 'set', path: `/Suivi/F${totalRow}`, props: { value: `${Math.min(100, Math.round((chapters.reduce((s, c) => s + (c.wordCount || 0), 0) / 80000) * 100))}%`, bold: true, size: 11, font: 'Calibri', fill: 'F1F5F9' } },
      )

      // Progress target row
      const targetRow = totalRow + 1
      chapterOps.push(
        { command: 'set', path: `/Suivi/B${targetRow}`, props: { value: 'Objectif thèse', size: 10, font: 'Calibri', italic: true } },
        { command: 'set', path: `/Suivi/D${targetRow}`, props: { value: 80000, size: 10, font: 'Calibri', numberformat: '#,##0' } },
      )

      await writeAndBatch(workDir, filePath, chapterOps, 'chapters')

      // 6. Add a second sheet: Timeline estimations
      const timelineOps: any[] = [
        { command: 'add', parent: '/', type: 'sheet' },
        { command: 'set', path: '/Sheet1', props: { name: 'Calendrier' } },
        { command: 'set', path: '/Calendrier/A1', props: { value: 'CALENDRIER ESTIMATIF', bold: true, size: 14, font: 'Calibri', fill: '10B981', 'font.color': 'FFFFFF' } },
        { command: 'set', path: '/Calendrier/A3', props: { value: 'Phase', bold: true, size: 11, font: 'Calibri', fill: '1E293B', 'font.color': 'FFFFFF' } },
        { command: 'set', path: '/Calendrier/B3', props: { value: 'Tâche', bold: true, size: 11, font: 'Calibri', fill: '1E293B', 'font.color': 'FFFFFF' } },
        { command: 'set', path: '/Calendrier/C3', props: { value: 'Durée estimée', bold: true, size: 11, font: 'Calibri', fill: '1E293B', 'font.color': 'FFFFFF' } },
        { command: 'set', path: '/Calendrier/D3', props: { value: 'Statut', bold: true, size: 11, font: 'Calibri', fill: '1E293B', 'font.color': 'FFFFFF' } },
      ]

      // Predefined timeline items
      const timeline = [
        ['Cadrage', 'Définir le cadrage préalable', '1-2 semaines', 'À faire'],
        ['Revue', 'Revue de littérature', '4-6 semaines', 'À faire'],
        ['Méthodologie', 'Rédiger la méthodologie', '2-3 semaines', 'À faire'],
        ['Résultats', 'Rédiger les résultats', '4-6 semaines', 'À faire'],
        ['Discussion', 'Rédiger la discussion', '2-3 semaines', 'À faire'],
        ['Introduction/Conclusion', 'Rédiger l\'intro et la conclusion', '1-2 semaines', 'À faire'],
        ['Révision', 'Révision complète + directeur', '2-3 semaines', 'À faire'],
        ['Mise en forme', 'Mise en forme finale + export', '1 semaine', 'À faire'],
      ]

      timeline.forEach((item, i) => {
        const row = 4 + i
        timelineOps.push(
          { command: 'set', path: `/Calendrier/A${row}`, props: { value: item[0], bold: true, size: 10, font: 'Calibri' } },
          { command: 'set', path: `/Calendrier/B${row}`, props: { value: item[1], size: 10, font: 'Calibri' } },
          { command: 'set', path: `/Calendrier/C${row}`, props: { value: item[2], size: 10, font: 'Calibri' } },
          { command: 'set', path: `/Calendrier/D${row}`, props: { value: item[3], size: 10, font: 'Calibri' } },
        )
      })

      await writeAndBatch(workDir, filePath, timelineOps, 'timeline')

      // 7. Close and read
      try { await execFileAsync(OFFICECLI, ['close', filePath], { timeout: 15000 }) } catch { /* ok */ }

      const fileBuffer = await readFile(filePath)

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="suivi-${sanitize(title)}.xlsx"`,
        },
      })
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => {})
    }
  } catch (err) {
    console.error('[office/export-xlsx]', err)
    return NextResponse.json({ error: "Erreur lors de la génération du tableur." }, { status: 500 })
  }
}

async function writeAndBatch(workDir: string, filePath: string, ops: any[], name: string) {
  const file = join(workDir, `${name}.json`)
  await writeFile(file, JSON.stringify(ops))
  await execFileAsync(OFFICECLI, ['batch', filePath, '--input', file, '--best-effort'], { timeout: 60000 })
}

function sanitize(name: string): string {
  return (name || 'these').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

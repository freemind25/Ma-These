import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { mkdtemp, writeFile, rm, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execFileAsync = promisify(execFile)
const OFFICECLI = process.env.OFFICECLI_PATH || '/home/z/.local/bin/officecli'

// Parse markdown-like content into paragraphs for OfficeCLI
function parseContentToBatchOps(content: string): any[] {
  const ops: any[] = []
  const lines = content.split('\n')
  let inTable = false
  let tableRows: string[][] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) {
      if (inTable) {
        // End table, create it
        ops.push({
          command: 'add', parent: '/body', type: 'table',
          props: { rows: tableRows.length - 1, cols: (tableRows[0] || []).length }
        })
        tableRows.forEach((row, ri) => {
          row.forEach((cell, ci) => {
            const cellPath = `/body/tbl[1]/tr[${ri + 1}]/tc[${ci + 1}]/p`
            ops.push({ command: 'add', parent: cellPath, type: 'run', props: { text: cell, bold: ri === 0 } })
          })
        })
        inTable = false
        tableRows = []
      }
      continue
    }

    // Table detection
    if (trimmed.startsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) continue // separator row
      tableRows.push(cells)
      inTable = true
      continue
    }

    if (inTable) {
      // End table before processing non-table line
      ops.push({
        command: 'add', parent: '/body', type: 'table',
        props: { rows: tableRows.length - 1, cols: (tableRows[0] || []).length }
      })
      tableRows.forEach((row, ri) => {
        row.forEach((cell, ci) => {
          const cellPath = `/body/tbl[1]/tr[${ri + 1}]/tc[${ci + 1}]/p`
          ops.push({ command: 'add', parent: cellPath, type: 'run', props: { text: cell, bold: ri === 0 } })
        })
      })
      inTable = false
      tableRows = []
    }

    // Headings
    const h1Match = trimmed.match(/^# (.+)/)
    const h2Match = trimmed.match(/^## (.+)/)
    const h3Match = trimmed.match(/^### (.+)/)

    if (h1Match) {
      ops.push({ command: 'add', parent: '/body', type: 'paragraph', props: { style: 'Heading1' } })
      ops.push({ command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: h1Match[1], bold: true, size: 28 } })
    } else if (h2Match) {
      ops.push({ command: 'add', parent: '/body', type: 'paragraph', props: { style: 'Heading2' } })
      ops.push({ command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: h2Match[1], bold: true, size: 22 } })
    } else if (h3Match) {
      ops.push({ command: 'add', parent: '/body', type: 'paragraph', props: { style: 'Heading3' } })
      ops.push({ command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: h3Match[1], bold: true, size: 16 } })
    } else {
      // Regular paragraph
      // Parse inline formatting
      const text = trimmed.replace(/\*\*(.+?)\*\*/g, '$1') // strip **bold** markers
      ops.push({ command: 'add', parent: '/body', type: 'paragraph' })
      ops.push({ command: 'add', parent: '/body/p[last()]', type: 'run', props: { text, size: 12, font: 'Times New Roman' } })
    }
  }

  return ops
}

// POST /api/office/export-docx
export async function POST(request: NextRequest) {
  try {
    const { title, author, chapters, university, field } = await request.json()

    if (!chapters || !Array.isArray(chapters)) {
      return NextResponse.json({ error: 'chapters requis' }, { status: 400 })
    }

    const workDir = await mkdtemp(join(tmpdir(), 'officecli-docx-'))
    const filePath = join(workDir, 'these.docx')

    try {
      // 1. Create blank document
      await execFileAsync(OFFICECLI, ['create', filePath], { timeout: 30000 })

      // 2. Set document properties
      const propsOps = [
        { command: 'set', path: '/', props: { title: title || 'Thèse de doctorat' } },
        { command: 'set', path: '/', props: { author: author || 'Doctorant' } },
      ]
      const propsFile = join(workDir, 'props.json')
      await writeFile(propsFile, JSON.stringify(propsOps))
      await execFileAsync(OFFICECLI, ['batch', filePath, '--input', propsFile], { timeout: 30000 })

      // 3. Add title page
      const titleOps = [
        { command: 'add', parent: '/body', type: 'paragraph' },
        { command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: '\n\n\n', size: 12 } },
        { command: 'add', parent: '/body', type: 'paragraph', props: { align: 'center' } },
        { command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: 'THÈSE DE DOCTORAT', bold: true, size: 16, font: 'Times New Roman' } },
        { command: 'add', parent: '/body', type: 'paragraph', props: { align: 'center' } },
        { command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: title || 'Ma thèse de doctorat', bold: true, size: 28, font: 'Times New Roman' } },
        { command: 'add', parent: '/body', type: 'paragraph', props: { align: 'center' } },
        { command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: `Présentée par ${author || 'Doctorant'}`, size: 14, font: 'Times New Roman' } },
        { command: 'add', parent: '/body', type: 'paragraph', props: { align: 'center' } },
        { command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: `Discipline : ${field || ''}`, size: 12, font: 'Times New Roman' } },
        { command: 'add', parent: '/body', type: 'paragraph', props: { align: 'center' } },
        { command: 'add', parent: '/body/p[last()]', type: 'run', props: { text: university || '', size: 12, font: 'Times New Roman' } },
        // Page break after title
        { command: 'add', parent: '/body', type: 'paragraph' },
      ]
      const titleFile = join(workDir, 'title.json')
      await writeFile(titleFile, JSON.stringify(titleOps))
      await execFileAsync(OFFICECLI, ['batch', filePath, '--input', titleFile, '--best-effort'], { timeout: 60000 })

      // 4. Add each chapter's content
      for (const chapter of chapters) {
        if (!chapter.content || chapter.content.trim().length === 0) continue

        const chapterOps = parseContentToBatchOps(chapter.content)
        if (chapterOps.length === 0) continue

        const chFile = join(workDir, `ch-${chapter.order}.json`)
        await writeFile(chFile, JSON.stringify(chapterOps))
        await execFileAsync(OFFICECLI, ['batch', filePath, '--input', chFile, '--best-effort'], { timeout: 60000 })
      }

      // 5. Close and read file
      try { await execFileAsync(OFFICECLI, ['close', filePath], { timeout: 15000 }) } catch { /* may not be in resident mode */ }

      const fileBuffer = await readFile(filePath)

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="these-${sanitize(title)}.docx"`,
        },
      })
    } finally {
      // Cleanup
      await rm(workDir, { recursive: true, force: true }).catch(() => {})
    }
  } catch (err) {
    console.error('[office/export-docx]', err)
    return NextResponse.json({ error: 'Erreur lors de l\'export Word.' }, { status: 500 })
  }
}

function sanitize(name: string): string {
  return (name || 'these').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

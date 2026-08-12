import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { mkdtemp, writeFile, rm, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execFileAsync = promisify(execFile)
const OFFICECLI = process.env.OFFICECLI_PATH || '/home/z/.local/bin/officecli'

// POST /api/office/export-pptx — Générer une présentation de soutenance
export async function POST(request: NextRequest) {
  try {
    const { title, author, university, field, chapters } = await request.json()

    if (!chapters || !Array.isArray(chapters)) {
      return NextResponse.json({ error: 'chapters requis' }, { status: 400 })
    }

    // Filter chapters with content
    const filledChapters = chapters.filter((c: any) => c.content && c.content.trim().length > 20)
    if (filledChapters.length === 0) {
      return NextResponse.json({ error: 'Aucun chapitre avec du contenu.' }, { status: 400 })
    }

    const workDir = await mkdtemp(join(tmpdir(), 'officecli-pptx-'))
    const filePath = join(workDir, 'soutenance.pptx')

    try {
      // 1. Create presentation
      await execFileAsync(OFFICECLI, ['create', filePath], { timeout: 30000 })

      // 2. Build batch operations
      const ops: any[] = []

      // Title slide
      ops.push({
        command: 'add', parent: '/', type: 'slide',
        props: { title: title || 'Soutenance de thèse', background: '1A1A2E' }
      })
      ops.push({
        command: 'add', parent: '/slide[1]', type: 'shape',
        props: {
          text: `Présenté par ${author || 'Doctorant'}`,
          x: '3cm', y: '12cm', size: 18, color: 'CCCCCC', font: 'Arial'
        }
      })
      ops.push({
        command: 'add', parent: '/slide[1]', type: 'shape',
        props: {
          text: `${university || ''} — ${field || ''}`,
          x: '3cm', y: '14cm', size: 14, color: '999999', font: 'Arial'
        }
      })

      // Plan slide
      ops.push({
        command: 'add', parent: '/', type: 'slide',
        props: { title: 'Plan de la présentation' }
      })
      filledChapters.forEach((ch: any, i: number) => {
        ops.push({
          command: 'add', parent: '/slide[2]', type: 'shape',
          props: {
            text: `${ch.number || i + 1}. ${ch.title || `Chapitre ${i + 1}`}`,
            x: '2cm', y: `${4 + i * 1.2}cm`, size: 16, font: 'Arial'
          }
        })
      })

      // Content slides — one per chapter (max 3 key points each)
      for (let i = 0; i < filledChapters.length; i++) {
        const ch = filledChapters[i]
        ops.push({
          command: 'add', parent: '/', type: 'slide',
          props: { title: `${ch.number || i + 1}. ${ch.title || `Chapitre ${i + 1}`}` }
        })

        // Extract key sentences (first 3 non-empty, non-heading lines)
        const lines = ch.content
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l && !l.startsWith('#') && l.length > 15)
          .slice(0, 3)

        lines.forEach((line: string, li: number) => {
          const cleanLine = line.replace(/\*\*/g, '').replace(/^[-*]\s*/, '')
          ops.push({
            command: 'add', parent: `/slide[${i + 3}]`, type: 'shape',
            props: {
              text: `• ${cleanLine.slice(0, 120)}`,
              x: '1.5cm', y: `${4 + li * 2}cm`, size: 14, font: 'Arial'
            }
          })
        })
      }

      // Closing slide
      ops.push({
        command: 'add', parent: '/', type: 'slide',
        props: { title: 'Merci de votre attention', background: '1A1A2E' }
      })
      ops.push({
        command: 'add', parent: `/slide[${filledChapters.length + 3}]`, type: 'shape',
        props: {
          text: 'Questions ?',
          x: '5cm', y: '10cm', size: 36, color: 'FFFFFF', font: 'Arial'
        }
      })

      // 3. Execute batch
      const batchFile = join(workDir, 'batch.json')
      await writeFile(batchFile, JSON.stringify(ops))
      await execFileAsync(OFFICECLI, ['batch', filePath, '--input', batchFile, '--best-effort'], { timeout: 120000 })

      // 4. Close and read
      try { await execFileAsync(OFFICECLI, ['close', filePath], { timeout: 15000 }) } catch { /* ok */ }

      const fileBuffer = await readFile(filePath)

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="soutenance-${(title || 'these').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}.pptx"`,
        },
      })
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => {})
    }
  } catch (err) {
    console.error('[office/export-pptx]', err)
    return NextResponse.json({ error: 'Erreur lors de la génération de la présentation.' }, { status: 500 })
  }
}

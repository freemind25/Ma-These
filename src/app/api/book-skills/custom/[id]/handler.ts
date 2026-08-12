import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const record = await db.customBookSkill.findUnique({ where: { id } })
    if (!record) {
      return NextResponse.json({ error: 'Compétence non trouvée.' }, { status: 404 })
    }

    await db.customBookSkill.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/book-skills/custom/[id]] DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const record = await db.customBookSkill.findUnique({ where: { id } })
    if (!record) {
      return NextResponse.json({ error: 'Compétence non trouvée.' }, { status: 404 })
    }

    // Parse JSON fields
    let frameworks: unknown[] = []
    let principles: string[] = []
    let techniques: string[] = []
    let antiPatterns: string[] = []
    let relevance: unknown[] = []
    let glossary: unknown[] = []

    try { frameworks = JSON.parse(record.frameworks) } catch { /* keep empty */ }
    try { principles = JSON.parse(record.principles) } catch { /* keep empty */ }
    try { techniques = JSON.parse(record.techniques) } catch { /* keep empty */ }
    try { antiPatterns = JSON.parse(record.antiPatterns) } catch { /* keep empty */ }
    try { relevance = JSON.parse(record.relevance) } catch { /* keep empty */ }
    try { glossary = JSON.parse(record.glossary || '[]') } catch { /* keep empty */ }

    return NextResponse.json({
      ...record,
      frameworks,
      principles,
      techniques,
      antiPatterns,
      relevance,
      glossary,
    })
  } catch (error) {
    console.error('[api/book-skills/custom/[id]] GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

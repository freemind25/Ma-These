import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { BookSkill } from '@/data/book-skills'

/**
 * List all custom book skills, with their parsed JSON fields.
 */
export async function GET() {
  try {
    const records = await db.customBookSkill.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const skills: (BookSkill & { isCustom: true; status: string; errorMessage: string; fileName: string; glossary: Array<{ term: string; definition: string }> })[] = records.map(r => {
      let frameworks: BookSkill['frameworks'] = []
      let principles: string[] = []
      let techniques: string[] = []
      let antiPatterns: string[] = []
      let relevance: BookSkill['relevance'] = []
      let glossary: Array<{ term: string; definition: string }> = []

      try { frameworks = JSON.parse(r.frameworks) } catch { /* keep empty */ }
      try { principles = JSON.parse(r.principles) } catch { /* keep empty */ }
      try { techniques = JSON.parse(r.techniques) } catch { /* keep empty */ }
      try { antiPatterns = JSON.parse(r.antiPatterns) } catch { /* keep empty */ }
      try { relevance = JSON.parse(r.relevance) } catch { /* keep empty */ }
      try { glossary = JSON.parse(r.glossary || '[]') } catch { /* keep empty */ }

      return {
        id: r.id,
        title: r.title,
        author: r.author,
        coreConcept: r.coreConcept,
        frameworks,
        principles,
        techniques,
        antiPatterns,
        relevance,
        quickReference: r.quickReference,
        isCustom: true,
        status: r.status,
        errorMessage: r.errorMessage,
        fileName: r.fileName,
        glossary,
      }
    })

    return NextResponse.json({ skills })
  } catch (error) {
    console.error('[api/book-skills/custom] GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

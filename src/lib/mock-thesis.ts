import type { ThesisData } from '@/types/thesis'
import { CHAPTERS } from '@/data/chapters-structure'

/**
 * Mock thesis data used as fallback when PostgreSQL is not available (sandbox).
 * In production (Vercel + Supabase), the real DB is used instead.
 */
let _mockThesis: ThesisData | null = null

function generateMockThesis(): ThesisData {
  const now = new Date().toISOString()
  return {
    id: 'mock-thesis-001',
    title: 'Ma thèse de doctorat',
    subtitle: 'Sous-titre de la thèse',
    author: 'Doctorant',
    field: 'Sciences',
    university: 'Université de démonstration',
    status: 'draft',
    structureMode: 'chapters',
    chapters: CHAPTERS.map((ch, i) => ({
      id: `mock-ch-${ch.order}`,
      thesisId: 'mock-thesis-001',
      partId: null,
      order: ch.order,
      number: ch.number,
      title: ch.title,
      content: i === 0
        ? `# ${ch.title}\n\n${ch.description}\n\n## 1.1 Contexte général du domaine\n\nCommencez à rédiger ici...`
        : '',
      wordCount: i === 0 ? 42 : 0,
      status: i === 0 ? 'in_progress' : 'draft',
      directorFeedback: null,
      directorFeedbackAt: null,
    })),
    parts: [],
  }
}

export function getMockThesis(): ThesisData {
  if (!_mockThesis) {
    _mockThesis = generateMockThesis()
  }
  return _mockThesis
}

/** Check if database is reachable — never throws */
export async function isDbAvailable(): Promise<boolean> {
  try {
    const { db } = await import('@/lib/db')
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    return true
  } catch {
    return false
  }
}

/**
 * Research Memory — Persistent cross-session research context.
 * Inspired by SurfSense's memory service (document.py, rewrite.py, validation.py).
 *
 * Unlike the in-memory ConversationStore, this persists to SQLite via Prisma.
 * The AI assistant can save and recall research context across sessions.
 */

import { db } from '@/lib/db'

// ── Types ──

export interface MemoryEntry {
  id: string
  category: MemoryCategory
  key: string
  value: string
  thesisId?: string
  importance: number
  isExpired: boolean
  createdAt: Date
  updatedAt: Date
}

export type MemoryCategory =
  | 'theme'
  | 'methodologie'
  | 'problematique'
  | 'reference'
  | 'hypothese'
  | 'cadre'
  | 'result'
  | 'note'

// ── Category labels (French) ──

export const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  theme: 'Thème & Sujet',
  methodologie: 'Méthodologie',
  problematique: 'Problématique',
  reference: 'Références clés',
  hypothese: 'Hypothèses',
  cadre: 'Cadre théorique',
  result: 'Résultats importants',
  note: 'Notes générales',
}

// ── CRUD ──

export async function saveMemory(params: {
  category: MemoryCategory
  key: string
  value: string
  thesisId?: string
  importance?: number
  expiresAt?: Date
}): Promise<MemoryEntry> {
  const { category, key, value, thesisId, importance = 5, expiresAt } = params

  return await db.researchMemory.upsert({
    where: {
      category_key_thesisId: {
        category,
        key,
        thesisId: thesisId ?? '__global__',
      },
    },
    create: {
      category,
      key,
      value,
      thesisId: thesisId ?? '__global__',
      importance: Math.max(1, Math.min(10, importance)),
      expiresAt,
    },
    update: {
      value,
      importance: Math.max(1, Math.min(10, importance)),
      isExpired: false,
      expiresAt,
    },
  })
}

export async function getMemories(params?: {
  category?: MemoryCategory
  thesisId?: string
  includeExpired?: boolean
}): Promise<MemoryEntry[]> {
  const where: Record<string, unknown> = {}
  if (params?.category) where.category = params.category
  if (params?.thesisId) where.thesisId = params.thesisId

  if (!params?.includeExpired) {
    where.isExpired = false
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ]
  }

  return await db.researchMemory.findMany({
    where: where as never,
    orderBy: { importance: 'desc' },
  })
}

export async function getMemory(params: {
  category: MemoryCategory
  key: string
  thesisId?: string
}): Promise<MemoryEntry | null> {
  return await db.researchMemory.findUnique({
    where: {
      category_key_thesisId: {
        category: params.category,
        key: params.key,
        thesisId: params.thesisId ?? '__global__',
      },
    },
  })
}

export async function deleteMemory(id: string): Promise<void> {
  await db.researchMemory.delete({ where: { id } })
}

export async function expireOldMemories(): Promise<number> {
  const result = await db.researchMemory.updateMany({
    where: {
      isExpired: false,
      expiresAt: { lt: new Date() },
    },
    data: { isExpired: true },
  })
  return result.count
}

export async function clearMemories(thesisId?: string): Promise<number> {
  const result = await db.researchMemory.deleteMany({
    where: { thesisId: thesisId ?? '__global__' },
  })
  return result.count
}

// ── Format memory context for LLM ──

export async function formatMemoryForLLM(thesisId?: string): Promise<string> {
  const memories = await getMemories({ thesisId })

  if (memories.length === 0) return ''

  const grouped = new Map<MemoryCategory, MemoryEntry[]>()
  for (const mem of memories) {
    const cat = mem.category as MemoryCategory
    const existing = grouped.get(cat) || []
    existing.push(mem)
    grouped.set(cat, existing)
  }

  const parts: string[] = ['MÉMOIRE DE RECHERCHE (contexte persistant) :']

  for (const [category, entries] of grouped) {
    const label = MEMORY_CATEGORY_LABELS[category] || category
    const items = entries.map(e => `  - ${e.key}: ${e.value}`)
    parts.push(`\n${label} :\n${items.join('\n')}`)
  }

  return parts.join('\n')
}

// ── Auto-extract memories from AI conversation ──

/**
 * Extract potential memories from an AI response.
 * Looks for structured information patterns.
 */
export function extractPotentialMemories(text: string): Array<{
  category: MemoryCategory
  key: string
  value: string
  importance: number
}> {
  const memories: Array<{ category: MemoryCategory; key: string; value: string; importance: number }> = []

  // Pattern: explicit theme/research topic mentions
  const themePatterns = [
    /(?:thème|sujet|objet)\s*(?:de (?:la |votre )?(?:recherche|thèse|étude))\s*(?:est|porte sur|concerne)\s*:?\s*(.+)/gi,
  ]
  for (const pattern of themePatterns) {
    const match = pattern.exec(text)
    if (match?.[1]) {
      memories.push({
        category: 'theme',
        key: 'sujet_principal',
        value: match[1].trim().slice(0, 500),
        importance: 8,
      })
    }
  }

  // Pattern: methodology mentions
  const methodPatterns = [
    /(?:méthodologie|approche|méthode)\s*(?:adoptée|utilisée|retenue)\s*(?:est|:)\s*(.+)/gi,
  ]
  for (const pattern of methodPatterns) {
    const match = pattern.exec(text)
    if (match?.[1]) {
      memories.push({
        category: 'methodologie',
        key: 'approche_principale',
        value: match[1].trim().slice(0, 500),
        importance: 7,
      })
    }
  }

  // Pattern: hypotheses
  const hypothesisPatterns = [
    /(?:hypoth[èe]se)\s*(?:principale|h[123]|n[°0-9]+)\s*(?::|est)\s*(.+)/gi,
  ]
  for (const pattern of hypothesisPatterns) {
    const match = pattern.exec(text)
    if (match?.[1]) {
      memories.push({
        category: 'hypothese',
        key: `h${memories.filter(m => m.category === 'hypothese').length + 1}`,
        value: match[1].trim().slice(0, 500),
        importance: 6,
      })
    }
  }

  return memories.slice(0, 5) // Limit auto-extraction
}

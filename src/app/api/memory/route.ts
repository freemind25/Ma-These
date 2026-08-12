import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { saveMemory, getMemories, getMemory, deleteMemory, expireOldMemories, clearMemories, formatMemoryForLLM, extractPotentialMemories, type MemoryCategory } from '@/lib/research-memory'

const VALID_CATEGORIES: MemoryCategory[] = ['theme', 'methodologie', 'problematique', 'reference', 'hypothese', 'cadre', 'result', 'note']

// GET /api/memory — List memories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as MemoryCategory | null
    const thesisId = searchParams.get('thesisId')
    const format = searchParams.get('format') // 'llm' formats for LLM context
    const action = searchParams.get('action') // 'expire' to expire old, 'clear' to clear all

    if (action === 'expire') {
      const count = await expireOldMemories()
      return NextResponse.json({ success: true, expired: count })
    }

    if (action === 'clear') {
      const count = await clearMemories(thesisId || undefined)
      return NextResponse.json({ success: true, cleared: count })
    }

    if (format === 'llm') {
      const context = await formatMemoryForLLM(thesisId || undefined)
      return NextResponse.json({ context })
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Catégorie invalide. Catégories: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
    }

    const memories = await getMemories({
      category: category || undefined,
      thesisId: thesisId || undefined,
    })

    return NextResponse.json({ memories, total: memories.length })
  } catch (error) {
    console.error('[api/memory] GET error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement.' }, { status: 500 })
  }
}

// POST /api/memory — Save a memory (single or auto-extract)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Auto-extract from text
    if (body.extractFrom) {
      const extracted = extractPotentialMemories(body.extractFrom)
      const saved = []
      for (const mem of extracted) {
        const entry = await saveMemory({
          category: mem.category,
          key: mem.key,
          value: mem.value,
          importance: mem.importance,
          thesisId: body.thesisId,
        })
        saved.push(entry)
      }
      return NextResponse.json({ success: true, extracted: saved.length, memories: saved })
    }

    // Manual save
    if (!body.category || !body.key || !body.value) {
      return NextResponse.json({ error: 'Champs requis: category, key, value' }, { status: 400 })
    }

    if (!VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: `Catégorie invalide. Catégories: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
    }

    const memory = await saveMemory({
      category: body.category,
      key: body.key,
      value: body.value,
      importance: body.importance,
      thesisId: body.thesisId,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    })

    return NextResponse.json({ success: true, memory }, { status: 201 })
  } catch (error) {
    console.error('[api/memory] POST error:', error)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde.' }, { status: 500 })
  }
}

// DELETE /api/memory?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
    }

    await deleteMemory(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/memory] DELETE error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }
}

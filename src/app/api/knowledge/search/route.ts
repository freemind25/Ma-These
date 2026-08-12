import { NextRequest, NextResponse } from 'next/server'
import { searchKnowledge, formatSearchContextForLLM } from '@/lib/knowledge-search'
import { db } from '@/lib/db'

// POST /api/knowledge/search — Search across all knowledge documents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = body.query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Requête vide.' }, { status: 400 })
    }

    const results = await searchKnowledge({
      query: query.trim(),
      topK: body.topK || 10,
      documentId: body.documentId,
      thesisId: body.thesisId,
      fileType: body.fileType,
      minScore: body.minScore,
    })

    return NextResponse.json({
      success: true,
      ...results,
      llmContext: formatSearchContextForLLM(results.results),
    })
  } catch (error) {
    console.error('[api/knowledge/search] POST error:', error)
    return NextResponse.json({ error: 'Erreur lors de la recherche.' }, { status: 500 })
  }
}

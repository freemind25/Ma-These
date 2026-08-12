import { NextRequest, NextResponse } from 'next/server'
import { getSessionCitations, getCitationStats } from '@/lib/citation-extractor'
import { db } from '@/lib/db'

// GET /api/citations — Get citations (by session or stats)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = await getCitationStats()
      return NextResponse.json(stats)
    }

    if (sessionId) {
      const citations = await getSessionCitations(sessionId)
      return NextResponse.json({ citations, total: citations.length })
    }

    // Global citations list
    const citations = await db.citation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        document: {
          select: { id: true, title: true, sourceType: true },
        },
      },
    })

    return NextResponse.json({ citations, total: citations.length })
  } catch (error) {
    console.error('[api/citations] GET error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement.' }, { status: 500 })
  }
}

// DELETE /api/citations — Clear citations for a session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requis.' }, { status: 400 })
    }

    await db.citation.deleteMany({ where: { sessionId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/citations] DELETE error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }
}

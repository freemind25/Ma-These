import { NextRequest, NextResponse } from 'next/server'
import { getGuidanceForContext, type GuidanceContext } from '@/data/guidance-fiches'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chapterTitle, userMessage, signal } = body as GuidanceContext

    const result = getGuidanceForContext({ chapterTitle, userMessage, signal })

    return NextResponse.json({
      fiches: result.fiches,
      reason: result.reason,
    })
  } catch (error) {
    console.error('Guidance API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 },
    )
  }
}

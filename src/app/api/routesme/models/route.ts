import { NextRequest, NextResponse } from 'next/server'
import { RoutesMeClient } from '@/lib/routesme'

export async function GET(request: NextRequest) {
  try {
    // Read key from header (for Vercel/serverless) or fall back to saved config
    const apiKey = request.headers.get('X-RoutesMe-Key')?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API RoutesMe non configurée.' },
        { status: 400 },
      )
    }

    // Determine plan from query param or default to free
    const plan = (request.nextUrl.searchParams.get('plan') as 'free' | 'vip') || 'free'
    const baseUrl = plan === 'vip'
      ? 'https://routesme.online/v2'
      : 'https://routesme.online/v1'

    const client = new RoutesMeClient({ apiKey, plan })
    const models = await client.listModels()
    return NextResponse.json({ models })
  } catch (error) {
    console.error('[RoutesMe] Models error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne.' },
      { status: 500 },
    )
  }
}

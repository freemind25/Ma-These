import { NextRequest, NextResponse } from 'next/server'
import { RoutesMeClient } from '@/lib/routesme'

export async function POST(request: NextRequest) {
  try {
    // Read key from header (for Vercel/serverless) or fall back to saved config
    const apiKey = request.headers.get('X-RoutesMe-Key')?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API RoutesMe non configurée. Entrez votre clé dans le panneau RoutesMe.' },
        { status: 400 },
      )
    }

    const body = await request.json()
    const { model, messages, temperature, max_tokens, plan } = body as {
      model?: string
      messages: Array<{ role: string; content: string }>
      temperature?: number
      max_tokens?: number
      plan?: 'free' | 'vip'
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages requis.' }, { status: 400 })
    }

    const client = new RoutesMeClient({ apiKey, plan: plan || 'free' })
    const result = await client.chat({
      model: model || 'GLM5.2R',
      messages: messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      temperature: temperature ?? 0.3,
      max_tokens: max_tokens ?? 4000,
    })

    return NextResponse.json({
      content: result.choices[0]?.message?.content || '',
      model: result.model,
      usage: result.usage,
    })
  } catch (error) {
    console.error('[RoutesMe] Chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne.' },
      { status: 500 },
    )
  }
}

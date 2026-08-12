import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey } = body as { apiKey?: string }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'La clé API est requise.' },
        { status: 400 }
      )
    }

    const trimmedKey = apiKey.trim()

    // Validate by calling Mistral models endpoint
    const testRes = await fetch('https://api.mistral.ai/v1/models', {
      headers: { Authorization: `Bearer ${trimmedKey}` },
    })

    if (!testRes.ok) {
      const text = await testRes.text()
      return NextResponse.json(
        { error: `Clé API Mistral invalide (${testRes.status}) : ${text.slice(0, 200)}` },
        { status: 400 }
      )
    }

    await db.aiToolConfig.upsert({
      where: { tool: 'mistral' },
      update: { apiKey: trimmedKey, connected: true },
      create: { tool: 'mistral', apiKey: trimmedKey, connected: true },
    })

    return NextResponse.json({ success: true, message: 'Clé API Mistral enregistrée avec succès.' })
  } catch (error) {
    console.error('Mistral config error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const config = await db.aiToolConfig.findFirst({ where: { tool: 'mistral' } })
    if (!config) {
      return NextResponse.json({ error: 'Configuration Mistral introuvable.' }, { status: 404 })
    }
    await db.aiToolConfig.update({
      where: { id: config.id },
      data: { apiKey: null, connected: false },
    })
    return NextResponse.json({ success: true, message: 'Clé API Mistral supprimée.' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

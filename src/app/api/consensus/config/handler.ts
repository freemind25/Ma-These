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

    // Validate via /api/v1/auth/key (free, no credits consumed, no region issue)
    const authRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${trimmedKey}` },
    })

    if (!authRes.ok) {
      const text = await authRes.text()
      return NextResponse.json(
        { error: `Clé API invalide (${authRes.status}) : ${text}` },
        { status: 400 }
      )
    }

    const authData = await authRes.json()
    const isFree = authData?.data?.is_free_tier === true

    // Upsert into AiToolConfig
    await db.aiToolConfig.upsert({
      where: { tool: 'openrouter' },
      update: {
        apiKey: trimmedKey,
        connected: true,
        extraConfig: JSON.stringify({ isFreeTier: isFree }),
      },
      create: {
        tool: 'openrouter',
        apiKey: trimmedKey,
        connected: true,
        extraConfig: JSON.stringify({ isFreeTier: isFree }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Clé API OpenRouter enregistrée avec succès.',
      isFreeTier: isFree,
    })
  } catch (error) {
    console.error('OpenRouter config error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const config = await db.aiToolConfig.findFirst({
      where: { tool: 'openrouter' },
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration OpenRouter introuvable.' },
        { status: 404 }
      )
    }

    await db.aiToolConfig.update({
      where: { id: config.id },
      data: {
        apiKey: null,
        connected: false,
      },
    })

    return NextResponse.json({ success: true, message: 'Clé API OpenRouter supprimée.' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

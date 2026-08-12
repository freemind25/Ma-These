import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const MENDELEY_AUTH_URL = 'https://api.mendeley.com/oauth/authorize'
const MENDELEY_TOKEN_URL = 'https://api.mendeley.com/oauth/token'
const SCOPES = 'all'

export async function GET() {
  try {
    const config = await db.mendeleyConfig.findFirst()

    if (!config?.clientId) {
      return NextResponse.json(
        { error: 'Mendeley non configuré. Veuillez saisir votre Client ID.' },
        { status: 400 }
      )
    }

    // Use the current origin as redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mendeley/callback`

    const authUrl =
      `${MENDELEY_AUTH_URL}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`

    return NextResponse.json({ authUrl })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, clientSecret, accessToken } = body

    let config = await db.mendeleyConfig.findFirst()

    if (!config) {
      config = await db.mendeleyConfig.create({
        data: {
          clientId: clientId || null,
          clientSecret: encrypt(clientSecret),
          accessToken: encrypt(accessToken),
          connected: !!accessToken,
        },
      })
    } else {
      config = await db.mendeleyConfig.update({
        where: { id: config.id },
        data: {
          ...(clientId !== undefined && { clientId }),
          ...(clientSecret !== undefined && { clientSecret: encrypt(clientSecret) }),
          ...(accessToken !== undefined && {
            accessToken: encrypt(accessToken),
            connected: !!accessToken,
          }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      connected: config.connected,
      hasClientId: !!config.clientId,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

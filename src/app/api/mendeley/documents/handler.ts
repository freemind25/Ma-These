import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const MENDELEY_API = 'https://api.mendeley.com'

async function getAccessToken(): Promise<string | null> {
  const config = await db.mendeleyConfig.findFirst()
  if (!config?.accessToken) return null

  const accessToken = decrypt(config.accessToken)
  if (!accessToken) return null

  // Check if token is expired, try refresh
  if (config.tokenExpiresAt && new Date() > config.tokenExpiresAt) {
    const refreshToken = decrypt(config.refreshToken)
    const clientSecret = decrypt(config.clientSecret)
    if (refreshToken && config.clientId && clientSecret) {
      try {
        const res = await fetch('https://api.mendeley.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${config.clientId}:${clientSecret}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }).toString(),
        })

        if (res.ok) {
          const tokens = await res.json()
          await db.mendeleyConfig.update({
            where: { id: config.id },
            data: {
              accessToken: encrypt(tokens.access_token),
              refreshToken: encrypt(tokens.refresh_token) || config.refreshToken,
              tokenExpiresAt: tokens.expires_in
                ? new Date(Date.now() + tokens.expires_in * 1000)
                : null,
            },
          })
          return tokens.access_token
        }
      } catch {
        // Refresh failed
      }
    }
    return null
  }

  return accessToken
}

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken()
    if (!token) {
      return NextResponse.json({ error: 'Non connecté à Mendeley' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const res = await fetch(
      `${MENDELEY_API}/documents?limit=${limit}&offset=${offset}&view=all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.mendeley-document.1+json',
        },
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json(
        { error: `Erreur Mendeley API: ${res.status}`, details: errText },
        { status: res.status }
      )
    }

    const documents = await res.json()
    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const MENDELEY_API = 'https://api.mendeley.com'

async function getAccessToken(): Promise<string | null> {
  const config = await db.mendeleyConfig.findFirst()
  if (!config?.accessToken) return null

  const accessToken = decrypt(config.accessToken)
  if (!accessToken) return null

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
      } catch { /* ignore */ }
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
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    const res = await fetch(
      `${MENDELEY_API}/catalog?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.mendeley-catalog.1+json',
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erreur Mendeley: ${res.status}` },
        { status: res.status }
      )
    }

    const results = await res.json()
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const MENDELEY_TOKEN_URL = 'https://api.mendeley.com/oauth/token'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/?mendeley_error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/?mendeley_error=no_code', request.url)
      )
    }

    const config = await db.mendeleyConfig.findFirst()
    if (!config?.clientId || !config?.clientSecret) {
      return NextResponse.redirect(
        new URL('/?mendeley_error=no_config', request.url)
      )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mendeley/callback`

    // Exchange code for token
    const tokenRes = await fetch(MENDELEY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${decrypt(config.clientSecret)}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Mendeley token error:', errText)
      return NextResponse.redirect(
        new URL('/?mendeley_error=token_exchange_failed', request.url)
      )
    }

    const tokens = await tokenRes.json()

    // Save tokens
    await db.mendeleyConfig.update({
      where: { id: config.id },
      data: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token),
        tokenExpiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        connected: true,
      },
    })

    return NextResponse.redirect(
      new URL('/?mendeley=connected', request.url)
    )
  } catch (error) {
    console.error('Mendeley callback error:', error)
    return NextResponse.redirect(
      new URL('/?mendeley_error=server_error', request.url)
    )
  }
}
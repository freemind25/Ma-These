import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode, getGoogleProfile } from '@/lib/google-drive'
import { db } from '@/lib/db'
import { encrypt } from '@/lib/crypto'

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')
  }
  // Derive from request headers
  const protocol = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('host') || 'localhost:3000'
  return `${protocol}://${host}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const baseUrl = getBaseUrl(req)

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?drive_error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?drive_error=no_code`)
  }

  try {
    // Exchange code for tokens — pass baseUrl so redirect_uri matches exactly
    const tokens = await exchangeCode(code, baseUrl)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Get user profile
    const profile = await getGoogleProfile(tokens.access_token)

    // Upsert connection in DB
    const existing = await db.cloudDriveConnection.findFirst({ where: { provider: 'google_drive' } })

    if (existing) {
      await db.cloudDriveConnection.update({
        where: { id: existing.id },
        data: {
          connected: true,
          email: profile.email,
          displayName: profile.name,
          accessToken: encrypt(tokens.access_token),
          refreshToken: encrypt(tokens.refresh_token),
          tokenExpiresAt: expiresAt,
          lastSyncAt: new Date(),
        },
      })
    } else {
      await db.cloudDriveConnection.create({
        data: {
          provider: 'google_drive',
          connected: true,
          email: profile.email,
          displayName: profile.name,
          accessToken: encrypt(tokens.access_token),
          refreshToken: encrypt(tokens.refresh_token),
          tokenExpiresAt: expiresAt,
        },
      })
    }

    // Redirect back to app with success
    return NextResponse.redirect(
      `${baseUrl}/?drive_connected=1&drive_email=${encodeURIComponent(profile.email)}`,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur OAuth'
    return NextResponse.redirect(`${baseUrl}/?drive_error=${encodeURIComponent(msg)}`)
  }
}

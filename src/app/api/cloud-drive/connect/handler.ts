import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/google-drive'
import { encrypt, decrypt } from '@/lib/crypto'

export async function GET(req: NextRequest) {
  try {
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const host = req.headers.get('host') || 'localhost:3000'
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = envUrl ? envUrl.replace(/\/+$/, '') : `${protocol}://${host}`

    const url = getGoogleAuthUrl('thesisframe_connect', baseUrl)
    const parsed = new URL(url)
    const redirectUri = parsed.searchParams.get('redirect_uri')!

    return NextResponse.json({
      url,
      // What user MUST put in Google Console:
      google_console_config: {
        authorized_javascript_origin: new URL(redirectUri).origin,
        authorized_redirect_uri: redirectUri,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Configuration manquante' },
      { status: 500 },
    )
  }
}

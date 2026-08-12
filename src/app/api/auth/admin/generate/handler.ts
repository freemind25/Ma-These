import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateLicenseKey, hashKey, keyPrefix, LICENSE_TYPE_LIMITS, LICENSE_TYPE_DURATIONS } from '@/lib/license'
import { addDays } from 'date-fns'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'tf-admin-2024'

function checkAuth(req: NextRequest, body?: Record<string, unknown>): boolean {
  // Body-based auth (most reliable through proxies)
  const bodySecret = (body?.adminSecret as string) || ''
  if (bodySecret === ADMIN_SECRET) return true
  // Header-based auth
  const headerAuth = req.headers.get('authorization')
  if (headerAuth === `Bearer ${ADMIN_SECRET}`) return true
  // Query param fallback
  const url = new URL(req.url)
  return url.searchParams.get('admin_secret') === ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!checkAuth(req, body)) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 })
    }

    const licenseType = body.licenseType || 'standard'
    const count = Math.min(Math.max(body.count || 1, 1), 50)
    const note = body.note || ''

    const validTypes = ['trial', 'academic', 'standard', 'premium']
    if (!validTypes.includes(licenseType)) {
      return NextResponse.json({ success: false, error: 'Type de licence invalide' }, { status: 400 })
    }

    const maxAct = LICENSE_TYPE_LIMITS[licenseType]
    const duration = LICENSE_TYPE_DURATIONS[licenseType]
    const expiresAt = duration ? addDays(new Date(), duration) : null

    const generated: string[] = []

    for (let i = 0; i < count; i++) {
      const rawKey = generateLicenseKey()
      const kh = hashKey(rawKey)
      const kp = keyPrefix(rawKey)

      await db.licenseKey.create({
        data: {
          keyHash: kh,
          keyPrefix: kp,
          licenseType,
          maxActivations: maxAct,
          status: 'active',
          note: note || null,
          expiresAt,
        },
      })
      generated.push(rawKey)
    }

    return NextResponse.json({
      success: true,
      count: generated.length,
      licenseType,
      expiresAt,
      keys: generated,
    })
  } catch (error) {
    console.error('[auth/admin/generate] Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}

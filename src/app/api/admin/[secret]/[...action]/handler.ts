import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'tf-admin-2024'

/** Lazy-import db to avoid module-level crash if Prisma init fails */
async function getDb() {
  const { db } = await import('@/lib/db')
  return db
}

/** Lazy-import license helpers */
async function getLicenseHelpers() {
  const m = await import('@/lib/license')
  return m
}

function daysFromNow(days: number): string | null {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function mapKey(k: { id: string; keyPrefix: string; licenseType: string; status: string; maxActivations: number; currentActivations: number; note: string | null; createdAt: Date; expiresAt: Date | null; activations: { id: string; deviceName: string | null; activatedAt: Date; lastSeenAt: Date }[] }) {
  return {
    id: k.id,
    keyPrefix: k.keyPrefix,
    licenseType: k.licenseType,
    licenseTypeLabel: k.licenseType,
    status: k.status,
    maxActivations: k.maxActivations,
    currentActivations: k.currentActivations,
    note: k.note,
    createdAt: k.createdAt.toISOString(),
    expiresAt: k.expiresAt?.toISOString() || null,
    activations: k.activations.map((a) => ({
      id: a.id,
      deviceName: a.deviceName,
      activatedAt: a.activatedAt.toISOString(),
      lastSeenAt: a.lastSeenAt.toISOString(),
    })),
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ secret: string; action: string[] }> }
) {
  try {
    const { secret, action } = await params
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 })
    }

    const op = action[0] || 'keys'
    const keyId = action[1] || ''

    // Lazy-load heavy deps only after auth passes
    const db = await getDb()
    const { generateLicenseKey, hashKey, keyPrefix, LICENSE_TYPE_LABELS, LICENSE_TYPE_LIMITS, LICENSE_TYPE_DURATIONS } = await getLicenseHelpers()

    // ── LIST KEYS ──
    if (op === 'keys' || op === 'list') {
      const keys = await db.licenseKey.findMany({
        orderBy: { createdAt: 'desc' },
        include: { activations: { orderBy: { activatedAt: 'desc' } } },
      })
      return NextResponse.json({ success: true, keys: keys.map((k) => ({ ...mapKey(k), licenseTypeLabel: LICENSE_TYPE_LABELS[k.licenseType] || k.licenseType })) })
    }

    // ── GENERATE KEYS ──
    if (op === 'generate') {
      const url = new URL(req.url)
      const licenseType = url.searchParams.get('type') || 'standard'
      const count = Math.min(Math.max(parseInt(url.searchParams.get('count') || '1'), 1), 50)
      const validTypes = ['trial', 'academic', 'standard', 'premium']
      if (!validTypes.includes(licenseType)) {
        return NextResponse.json({ success: false, error: 'Type invalide' }, { status: 400 })
      }
      const maxAct = LICENSE_TYPE_LIMITS[licenseType]
      const duration = LICENSE_TYPE_DURATIONS[licenseType]
      const expiresAt = duration ? daysFromNow(duration) : null
      const generated: string[] = []
      for (let i = 0; i < count; i++) {
        const rawKey = generateLicenseKey()
        await db.licenseKey.create({
          data: { keyHash: hashKey(rawKey), keyPrefix: keyPrefix(rawKey), licenseType, maxActivations: maxAct, status: 'active', expiresAt: expiresAt ? new Date(expiresAt) : null },
        })
        generated.push(rawKey)
      }
      return NextResponse.json({ success: true, count: generated.length, licenseType, expiresAt, keys: generated })
    }

    // ── ACTIONS (revoke/delete/reset) need keyId ──
    if (!keyId) {
      return NextResponse.json({ success: false, error: 'keyId manquant' }, { status: 400 })
    }

    if (op === 'revoke') {
      await db.licenseKey.update({ where: { id: keyId }, data: { status: 'revoked' } })
      await db.activation.deleteMany({ where: { licenseKeyId: keyId } })
      return NextResponse.json({ success: true, message: 'Licence revoque' })
    }
    if (op === 'delete') {
      await db.licenseKey.delete({ where: { id: keyId } })
      return NextResponse.json({ success: true, message: 'Licence supprime' })
    }
    if (op === 'reset') {
      await db.activation.deleteMany({ where: { licenseKeyId: keyId } })
      await db.licenseKey.update({ where: { id: keyId }, data: { currentActivations: 0 } })
      return NextResponse.json({ success: true, message: 'Activations reinitialise' })
    }

    return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[admin] Error:', msg)
    return NextResponse.json({ success: false, error: 'Erreur interne', debug: msg }, { status: 500 })
  }
}

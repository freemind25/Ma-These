import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashKey, isValidKeyFormat, generateSessionToken, fingerprintDevice, LICENSE_TYPE_LIMITS } from '@/lib/license'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, deviceName } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ success: false, error: 'Clé de licence requise' }, { status: 400 })
    }

    const normalized = key.trim().toUpperCase()

    if (!isValidKeyFormat(normalized)) {
      return NextResponse.json(
        { success: false, error: 'Format invalide. Attendu : TF-XXXX-XXXX-XXXX-XXXX' },
        { status: 400 },
      )
    }

    const keyHash = hashKey(normalized)
    const license = await db.licenseKey.findUnique({ where: { keyHash } })

    if (!license) {
      return NextResponse.json({ success: false, error: 'Clé de licence non reconnue' }, { status: 404 })
    }

    if (license.status === 'revoked') {
      return NextResponse.json({ success: false, error: 'Cette licence a été révoquée' }, { status: 403 })
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      await db.licenseKey.update({ where: { id: license.id }, data: { status: 'expired' } })
      return NextResponse.json({ success: false, error: 'Cette licence a expiré' }, { status: 403 })
    }

    const maxAct = LICENSE_TYPE_LIMITS[license.licenseType] ?? license.maxActivations
    if (license.currentActivations >= maxAct) {
      const activeActivations = await db.activation.findMany({
        where: { licenseKeyId: license.id },
      })
      return NextResponse.json({
        success: false,
        error: `Nombre maximum d'activations atteint (${maxAct}). Déconnectez un appareil ou contactez le support.`,
        devices: activeActivations.map((a) => ({
          id: a.id,
          deviceName: a.deviceName,
          activatedAt: a.activatedAt,
          lastSeenAt: a.lastSeenAt,
        })),
      })
    }

    // Check if this device already has an activation
    const ua = req.headers.get('user-agent') || ''
    const fp = fingerprintDevice(ua)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

    const existingActivation = await db.activation.findFirst({
      where: { licenseKeyId: license.id, deviceFingerprint: fp },
    })

    let sessionToken: string

    if (existingActivation) {
      // Refresh the existing activation
      sessionToken = existingActivation.sessionToken
      await db.activation.update({
        where: { id: existingActivation.id },
        data: { lastSeenAt: new Date(), deviceName: deviceName || existingActivation.deviceName, ipAddress: ip },
      })
    } else {
      // Create new activation
      sessionToken = generateSessionToken()
      await db.activation.create({
        data: {
          licenseKeyId: license.id,
          sessionToken,
          deviceName: deviceName || 'Appareil inconnu',
          deviceFingerprint: fp,
          ipAddress: ip,
        },
      })
      await db.licenseKey.update({
        where: { id: license.id },
        data: { currentActivations: { increment: 1 } },
      })
    }

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Licence activée avec succès',
      licenseType: license.licenseType,
      expiresAt: license.expiresAt,
    })

    response.cookies.set('tf_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })

    return response
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[auth/activate] Error:', msg, error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur', debug: process.env.NODE_ENV !== 'production' ? msg : undefined },
      { status: 500 },
    )
  }
}

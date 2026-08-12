import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { LICENSE_TYPE_LABELS } from '@/lib/license'

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('tf_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ activated: false })
    }

    const activation = await db.activation.findUnique({
      where: { sessionToken },
      include: { licenseKey: true },
    })

    if (!activation || activation.licenseKey.status !== 'active') {
      return NextResponse.json({ activated: false })
    }

    // Check expiry
    if (activation.licenseKey.expiresAt && activation.licenseKey.expiresAt < new Date()) {
      await db.licenseKey.update({
        where: { id: activation.licenseKey.id },
        data: { status: 'expired' },
      })
      return NextResponse.json({ activated: false, reason: 'expired' })
    }

    // Update last seen
    await db.activation.update({
      where: { id: activation.id },
      data: { lastSeenAt: new Date() },
    })

    return NextResponse.json({
      activated: true,
      licenseType: activation.licenseKey.licenseType,
      licenseTypeLabel: LICENSE_TYPE_LABELS[activation.licenseKey.licenseType] || activation.licenseKey.licenseType,
      expiresAt: activation.licenseKey.expiresAt,
      deviceName: activation.deviceName,
    })
  } catch (error) {
    console.error('[auth/status] Error:', error)
    return NextResponse.json({ activated: false })
  }
}

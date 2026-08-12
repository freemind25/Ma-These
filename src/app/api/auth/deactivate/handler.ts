import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('tf_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ success: true, message: 'Aucune session active' })
    }

    const activation = await db.activation.findUnique({ where: { sessionToken } })

    if (activation) {
      await db.licenseKey.update({
        where: { id: activation.licenseKeyId },
        data: { currentActivations: { decrement: 1 } },
      })
      await db.activation.delete({ where: { id: activation.id } })
    }

    const response = NextResponse.json({ success: true, message: 'Appareil déconnecté' })
    response.cookies.set('tf_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })

    return response
  } catch (error) {
    console.error('[auth/deactivate] Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}

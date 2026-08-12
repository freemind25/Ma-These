import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const conn = await db.cloudDriveConnection.findFirst({ where: { provider: 'google_drive' } })
    if (conn) {
      await db.cloudDriveConnection.update({
        where: { id: conn.id },
        data: {
          connected: false,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
        },
      })
    }
    return NextResponse.json({ disconnected: true })
  } catch {
    return NextResponse.json({ error: 'Erreur déconnexion' }, { status: 500 })
  }
}
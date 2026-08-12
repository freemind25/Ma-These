import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decrypt } from '@/lib/crypto'

export async function GET() {
  try {
    const conn = await db.cloudDriveConnection.findFirst({
      where: { provider: 'google_drive' },
      select: {
        id: true,
        connected: true,
        email: true,
        displayName: true,
        lastSyncAt: true,
        tokenExpiresAt: true,
      },
    })

    if (!conn || !conn.connected) {
      return NextResponse.json({ connected: false })
    }

    // Check if token needs refresh (don't actually refresh, just report)
    const needsRefresh = conn.tokenExpiresAt
      ? new Date(conn.tokenExpiresAt).getTime() - Date.now() < 300_000
      : false

    return NextResponse.json({
      connected: true,
      email: conn.email,
      displayName: conn.displayName,
      lastSyncAt: conn.lastSyncAt,
      needsRefresh,
    })
  } catch {
    return NextResponse.json({ connected: false, error: 'DB error' })
  }
}

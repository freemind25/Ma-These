import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const config = await db.mendeleyConfig.findFirst()
    if (config) {
      await db.mendeleyConfig.update({
        where: { id: config.id },
        data: {
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          connected: false,
        },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Simple DB connectivity check – no execSync needed
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ success: true, message: 'Database ready' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[setup] DB check failed:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

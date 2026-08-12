import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.DATABASE_URL || 'NOT_SET'
  const masked = url.length > 30
    ? url.slice(0, 15) + '...' + url.slice(-15)
    : url
  return NextResponse.json({
    database_url_prefix: url.startsWith('libsql://') ? 'libsql://✓' : url.startsWith('file:') ? 'file: (local)' : `unknown: ${masked}`,
    has_admin_secret: !!process.env.ADMIN_SECRET,
    node_env: process.env.NODE_ENV,
  })
}

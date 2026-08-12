import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    patchVersion: 'v6-cross-container-retry',
    strategy: 'FIFO locale + retry 5-6s fixe (cross-container)',
    maxRetries: 3,
    retryDelay: '5-6 secondes (fixe + jitter)',
    totalRetryTime: '~18s',
    proactiveJitter: '0-500ms avant chaque appel',
    vercelMaxDuration: '30s',
    timestamp: new Date().toISOString(),
    note: 'v6: retry 5-6s adapté au maxDuration=30s de Vercel.',
  })
}

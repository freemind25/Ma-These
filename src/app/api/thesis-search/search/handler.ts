import { NextRequest, NextResponse } from 'next/server'

const SEARCH_PORT = 3031

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || ''
    const limit = req.nextUrl.searchParams.get('limit') || '20'
    const res = await fetch(`/?q=${encodeURIComponent(q)}&limit=${limit}&XTransformPort=${SEARCH_PORT}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    // Fallback: simple client-side search if service is down
    console.warn('Search service unavailable')
    return NextResponse.json({ results: [], total: 0, query: req.nextUrl.searchParams.get('q') || '' })
  }
}

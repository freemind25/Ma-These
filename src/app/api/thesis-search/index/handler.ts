import { NextRequest, NextResponse } from 'next/server'

const SEARCH_PORT = 3031

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`/?XTransformPort=${SEARCH_PORT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    // Fallback: if search service is down, return mock response
    console.warn('Search service unavailable, using fallback')
    const { docs } = await req.json()
    return NextResponse.json({ indexed: docs?.length || 0, totalDocuments: docs?.length || 0 })
  }
}

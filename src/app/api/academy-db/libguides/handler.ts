import { NextRequest, NextResponse } from 'next/server'
import { academicDatabases } from '@/data/academic-databases'

const LIBGUIDES_CONFIG = academicDatabases.find(d => d.id === 'libguides')!

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q')
    const page = request.nextUrl.searchParams.get('page') || '1'
    if (!q) return NextResponse.json({ error: 'Recherche requise' })
    const url = `${LIBGUIDES_CONFIG.searchUrl}${encodeURIComponent(q)}&page=${page}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    const data = await res.json()
    const results = (data.results || data.items || []).slice(0, 12).map((item: Record<string, unknown>) => ({
      title: item.title || 'Sans titre',
      authors: item.authors || '',
      year: item.year || '',
      abstract: item.abstract || item.description || '',
      url: item.id || item.URL || item.href || '',
      source: 'libguides',
      sourceLabel: 'LibGuides',
      sourceColor: '#9333EA',
    }))
    return NextResponse.json({ results, total: data.total || 0 })
  } catch (err) {
    console.error('[api/academy-db/libguides]', err)
    return NextResponse.json({ error: 'Erreur LibGuides.' }, { status: 500 })
  }
}

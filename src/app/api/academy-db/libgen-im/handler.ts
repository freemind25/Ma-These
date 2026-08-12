import { NextRequest, NextResponse } from 'next/server'
import { academicDatabases } from '@/data/academic-databases'

const LIBGEN_CONFIG = academicDatabases.find(d => d.id === 'libgen-im')!

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q')
    const page = request.nextUrl.searchParams.get('page') || '1'
    if (!q) return NextResponse.json({ error: 'Recherche requise' })
    const url = `${LIBGEN_CONFIG.url}${encodeURIComponent(q)}&page=${page}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    const data = await res.json()
    const results = (data.results || data.items || []).slice(0, 12).map((doc: Record<string, unknown>) => ({
      title: doc.title || 'Sans titre',
      authors: doc.authors || '',
      year: doc.year || '',
      abstract: doc.abstract || doc.description || '',
      url: doc.id || doc.URL || doc.href || '',
      source: 'libgen-im',
      sourceLabel: 'Library Genesis',
      sourceColor: '#7C3AED',
    }))
    return NextResponse.json({ results, total: data.total || 0 })
  } catch (err) {
    console.error('[api/academy-db/libgen-im]', err)
    return NextResponse.json({ error: 'Erreur Library Genesis.' }, { status: 500 })
  }
}

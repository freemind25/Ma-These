import { NextRequest, NextResponse } from 'next/server'
import { academicDatabases } from '@/data/academic-databases'

const WELIB_CONFIG = academicDatabases.find(d => d.id === 'welib-st')!

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q')
    const page = request.nextUrl.searchParams.get('page') || '1'
    const rows = request.nextUrl.searchParams.get('rows') || '12'
    if (!q) return NextResponse.json({ error: 'Recherche requise' })
    const url = `${WELIB_CONFIG.url}${encodeURIComponent(q)}&page=${page}&rows=${rows}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    const data = await res.json()
    const docs = data.docs || data.results || data.items || []
    const results = docs.slice(0, Number(rows)).map((doc: Record<string, unknown>) => ({
      title: doc.title || 'Sans titre',
      authors: doc.authors || '',
      year: doc.year || '',
      abstract: doc.abstract || doc.description || '',
      url: doc.id || doc.URL || doc.href || '',
      source: 'welib',
      sourceLabel: 'Welib',
      sourceColor: '#2563EB',
    }))
    return NextResponse.json({ results, total: data.total || 0 })
  } catch (err) {
    console.error('[api/academy-db/welib]', err)
    return NextResponse.json({ error: 'Erreur Welib.' }, { status: 500 })
  }
}

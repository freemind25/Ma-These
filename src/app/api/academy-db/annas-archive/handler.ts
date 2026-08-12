import { NextRequest, NextResponse } from 'next/server'
import { academicDatabases } from '@/data/academic-databases'

const ANNAS_CONFIG = academicDatabases.find(d => d.id === 'annas-archive')!

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q')
    const page = request.nextUrl.searchParams.get('page') || '1'
    const rows = request.nextUrl.searchParams.get('rows') || '20'
    if (!q) return NextResponse.json({ error: 'Recherche requise' })
    const url = `${ANNAS_CONFIG.url}${encodeURIComponent(q)}&page=${page}&rows=${rows}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    const data = await res.json()
    const results = (data.response?.docs || data.results || []).slice(0, Number(rows)).map((doc: Record<string, unknown>) => ({
      title: doc.title || 'Sans titre',
      authors: doc.authors || '',
      year: doc.year || '',
      abstract: doc.abstract || doc.description || '',
      url: doc.id || doc.URL || doc.href || '',
      source: 'annas-archive',
      sourceLabel: "Anna's Archive",
      sourceColor: '#8B4513',
    }))
    return NextResponse.json({ results, total: data.response?.numFound || 0 })
  } catch (err) {
    console.error('[api/academy-db/annas-archive]', err)
    return NextResponse.json({ error: "Erreur Anna's Archive." }, { status: 500 })
  }
}

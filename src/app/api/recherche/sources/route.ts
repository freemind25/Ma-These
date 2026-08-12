import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const chapitreId = searchParams.get('chapitreId')
    const type = searchParams.get('type')
    const tag = searchParams.get('tag')
    const search = searchParams.get('q')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (search) where.titre = { contains: search }

    let sources = await db.sourceBibliographique.findMany({
      where,
      include: { chapitres: true, fichesLecture: true },
      orderBy: { createdAt: 'desc' },
    })

    // Filter by tag if provided
    if (tag) {
      sources = sources.filter(s => {
        try {
          const tags = JSON.parse(s.tags || '[]')
          return tags.includes(tag)
        } catch { return false }
      })
    }

    // Filter by chapitre if provided
    if (chapitreId) {
      sources = sources.filter(s => s.chapitres.some(c => c.chapitreId === chapitreId))
    }

    return NextResponse.json(sources)
  } catch (error) {
    console.error('[recherche/sources GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { titre, auteurs, annee, doi, type, abstract, journal, volume, pages, url, tags, chapitreId } = body

    if (!titre) {
      return NextResponse.json({ error: 'titre requis' }, { status: 400 })
    }

    const source = await db.sourceBibliographique.create({
      data: {
        titre,
        auteurs: typeof auteurs === 'string' ? auteurs : JSON.stringify(auteurs || []),
        annee: annee ? parseInt(annee, 10) : null,
        doi: doi || null,
        type: type || 'article',
        abstract: abstract || null,
        journal: journal || null,
        volume: volume || null,
        pages: pages || null,
        url: url || null,
        tags: tags ? JSON.stringify(tags) : null,
        ...(chapitreId ? {
          chapitres: {
            create: { chapitreId },
          },
        } : {}),
      },
      include: { chapitres: true },
    })

    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    console.error('[recherche/sources POST]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    await db.sourceBibliographique.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[recherche/sources DELETE]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (data.titre !== undefined) updateData.titre = data.titre
    if (data.auteurs !== undefined) updateData.auteurs = typeof data.auteurs === 'string' ? data.auteurs : JSON.stringify(data.auteurs)
    if (data.annee !== undefined) updateData.annee = data.annee ? parseInt(data.annee, 10) : null
    if (data.doi !== undefined) updateData.doi = data.doi
    if (data.type !== undefined) updateData.type = data.type
    if (data.abstract !== undefined) updateData.abstract = data.abstract
    if (data.journal !== undefined) updateData.journal = data.journal
    if (data.volume !== undefined) updateData.volume = data.volume
    if (data.pages !== undefined) updateData.pages = data.pages
    if (data.url !== undefined) updateData.url = data.url
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)

    const source = await db.sourceBibliographique.update({
      where: { id },
      data: updateData,
      include: { chapitres: true },
    })
    return NextResponse.json(source)
  } catch (error) {
    console.error('[recherche/sources PATCH]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

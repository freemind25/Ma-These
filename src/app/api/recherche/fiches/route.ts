import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sourceId = searchParams.get('sourceId')
    const chapitreId = searchParams.get('chapitreId')

    const where: Record<string, unknown> = {}
    if (sourceId) where.sourceId = sourceId
    if (chapitreId) where.chapitreId = chapitreId

    const fiches = await db.ficheLecture.findMany({
      where,
      include: { source: { select: { id: true, titre: true, auteurs: true, annee: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(fiches)
  } catch (error) {
    console.error('[recherche/fiches GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sourceId, chapitreId, problematique, methode, resultatsCles, limites, positionnement } = body

    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId requis' }, { status: 400 })
    }

    const fiche = await db.ficheLecture.create({
      data: {
        sourceId,
        chapitreId: chapitreId || null,
        problematique: problematique || null,
        methode: methode || null,
        resultatsCles: resultatsCles || null,
        limites: limites || null,
        positionnement: positionnement || null,
      },
      include: { source: true },
    })

    return NextResponse.json(fiche, { status: 201 })
  } catch (error) {
    console.error('[recherche/fiches POST]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (data.problematique !== undefined) updateData.problematique = data.problematique
    if (data.methode !== undefined) updateData.methode = data.methode
    if (data.resultatsCles !== undefined) updateData.resultatsCles = data.resultatsCles
    if (data.limites !== undefined) updateData.limites = data.limites
    if (data.positionnement !== undefined) updateData.positionnement = data.positionnement
    if (data.chapitreId !== undefined) updateData.chapitreId = data.chapitreId

    const fiche = await db.ficheLecture.update({
      where: { id },
      data: updateData,
      include: { source: true },
    })
    return NextResponse.json(fiche)
  } catch (error) {
    console.error('[recherche/fiches PATCH]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    await db.ficheLecture.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[recherche/fiches DELETE]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

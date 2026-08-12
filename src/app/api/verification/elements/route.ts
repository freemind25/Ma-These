import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * CRUD — ElementAnalyse
 * GET   : lister les éléments (filtre par chapitreId, natureElement, sousAnalyse)
 * POST  : créer un élément
 * DELETE : supprimer un élément par id
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const chapitreId = searchParams.get('chapitreId')
    const natureElement = searchParams.get('natureElement')
    const sousAnalyse = searchParams.get('sousAnalyse')
    const source = searchParams.get('source')

    const where: Record<string, unknown> = {}
    if (chapitreId) where.chapitreId = chapitreId
    if (natureElement) where.natureElement = natureElement
    if (sousAnalyse) where.sousAnalyse = sousAnalyse
    if (source) where.source = source

    const elements = await db.elementAnalyse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(elements)
  } catch (error) {
    console.error('[verification/elements GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nom, typeElement, natureElement, sousAnalyse, source, geojson, styleConfig, chapitreId } = body

    if (!nom || !typeElement || !natureElement || !source) {
      return NextResponse.json(
        { error: 'Champs requis : nom, typeElement, natureElement, source' },
        { status: 400 }
      )
    }

    // Vérifier que le typeElement existe dans le référentiel
    const { REFERENTIAL_ANALYSE_URBAINE } = await import('@/data/verification-referentials')
    const allTypes = [
      ...REFERENTIAL_ANALYSE_URBAINE.prealable,
      ...REFERENTIAL_ANALYSE_URBAINE.phases.flatMap(p => p.elements.map(e => e.typeElement)),
    ]
    if (!allTypes.includes(typeElement)) {
      return NextResponse.json(
        { error: `typeElement "${typeElement}" non reconnu dans le référentiel` },
        { status: 400 }
      )
    }

    const element = await db.elementAnalyse.create({
      data: {
        nom,
        typeElement,
        natureElement,
        sousAnalyse: sousAnalyse || null,
        source,
        dateSource: body.dateSource ? new Date(body.dateSource) : null,
        geojson: geojson || null,
        styleConfig: styleConfig || null,
        chapitreId: chapitreId || null,
      },
    })

    return NextResponse.json(element, { status: 201 })
  } catch (error) {
    console.error('[verification/elements POST]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    await db.elementAnalyse.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[verification/elements DELETE]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

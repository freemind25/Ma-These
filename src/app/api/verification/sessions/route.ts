import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * SessionVerification — GET / PUT / DELETE
 * GET    : lister ou récupérer une session (filtre par siteEtudeId ou id)
 * PUT    : mettre à jour une session (reponses, elementsManquants)
 * DELETE : supprimer une session
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const siteEtudeId = searchParams.get('siteEtudeId')
    const typeAnalyseId = searchParams.get('typeAnalyseId')

    if (id) {
      const session = await db.sessionVerification.findUnique({
        where: { id },
      })
      if (!session) {
        return NextResponse.json(
          { error: 'Session non trouvée' },
          { status: 404 }
        )
      }
      return NextResponse.json(session)
    }

    const where: Record<string, unknown> = {}
    if (siteEtudeId) where.siteEtudeId = siteEtudeId
    if (typeAnalyseId) where.typeAnalyseId = typeAnalyseId

    const sessions = await db.sessionVerification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('[verification/sessions GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, reponses, elementsManquants } = body

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (reponses !== undefined) updateData.reponses = typeof reponses === 'string' ? reponses : JSON.stringify(reponses)
    if (elementsManquants !== undefined) updateData.elementsManquants = typeof elementsManquants === 'string' ? elementsManquants : JSON.stringify(elementsManquants)

    const session = await db.sessionVerification.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('[verification/sessions PUT]', error)
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

    await db.sessionVerification.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[verification/sessions DELETE]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

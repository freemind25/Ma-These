import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const veilles = await db.rechercheSauvegardee.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(veilles)
  } catch (error) {
    console.error('[recherche/veilles GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { requete, filtres, alerteActive } = body

    if (!requete) {
      return NextResponse.json({ error: 'requete requise' }, { status: 400 })
    }

    const veille = await db.rechercheSauvegardee.create({
      data: {
        requete,
        filtres: filtres ? JSON.stringify(filtres) : null,
        alerteActive: alerteActive || false,
        derniereExecution: new Date(),
      },
    })

    return NextResponse.json(veille, { status: 201 })
  } catch (error) {
    console.error('[recherche/veilles POST]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, alerteActive, derniereExecution } = body
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const veille = await db.rechercheSauvegardee.update({
      where: { id },
      data: {
        ...(alerteActive !== undefined && { alerteActive }),
        ...(derniereExecution && { derniereExecution: new Date(derniereExecution) }),
      },
    })
    return NextResponse.json(veille)
  } catch (error) {
    console.error('[recherche/veilles PATCH]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    await db.rechercheSauvegardee.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[recherche/veilles DELETE]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

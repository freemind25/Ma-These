import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const entries = await db.notebookEntry.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, entries })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "L'id de l'entrée est requis." },
        { status: 400 }
      )
    }

    await db.notebookEntry.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Entrée supprimée.' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
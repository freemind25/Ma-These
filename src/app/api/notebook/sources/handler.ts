import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag') || ''

    const sources = await db.researchSource.findMany({
      where: tag
        ? {
            tags: { contains: tag },
          }
        : undefined,
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ success: true, sources })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, sourceType, tags } = body as {
      title?: string
      content?: string
      sourceType?: string
      tags?: string
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le titre est requis.' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu est requis.' },
        { status: 400 }
      )
    }

    const source = await db.researchSource.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        sourceType: sourceType || 'text',
        tags: tags || null,
      },
    })

    return NextResponse.json({ success: true, source })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, tags } = body as {
      id?: string
      title?: string
      content?: string
      tags?: string
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "L'id de la source est requis." },
        { status: 400 }
      )
    }

    const existing = await db.researchSource.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Source introuvable.' },
        { status: 404 }
      )
    }

    const source = await db.researchSource.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(content !== undefined ? { content: content.trim() } : {}),
        ...(tags !== undefined ? { tags } : {}),
      },
    })

    return NextResponse.json({ success: true, source })
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
        { error: "L'id de la source est requis." },
        { status: 400 }
      )
    }

    await db.researchSource.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Source supprimée.' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
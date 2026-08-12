import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chunkText, parseDocument } from '@/lib/document-parser'

const DOCUMENT_ID_REGEX = /^[a-z0-9]{20,}$/

// GET /api/knowledge/documents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!DOCUMENT_ID_REGEX.test(id)) {
      return NextResponse.json({ error: 'ID invalide.' }, { status: 400 })
    }

    const document = await db.knowledgeDocument.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true, citations: true } },
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          take: 50,
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé.' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('[api/knowledge/documents/[id]] GET error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement.' }, { status: 500 })
  }
}

// PUT /api/knowledge/documents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.metadata !== undefined) updateData.metadata = body.metadata
    if (body.thesisId !== undefined) updateData.thesisId = body.thesisId

    // If content is updated, re-parse and re-chunk
    if (body.content !== undefined) {
      const parsedDoc = parseDocument(body.content)
      updateData.content = parsedDoc.content
      updateData.plainText = parsedDoc.plainText
      updateData.wordCount = parsedDoc.wordCount

      // Delete old chunks and create new ones
      await db.knowledgeChunk.deleteMany({ where: { documentId: id } })
      const chunks = chunkText(parsedDoc.content)
      if (chunks.length > 0) {
        await db.knowledgeChunk.createMany({
          data: chunks.map(chunk => ({
            documentId: id,
            content: chunk.content,
            plainText: chunk.plainText,
            chunkIndex: chunk.chunkIndex,
            charStart: chunk.charStart,
            charEnd: chunk.charEnd,
            wordCount: chunk.wordCount,
          })),
        })
      }
      updateData.chunkCount = chunks.length
      updateData.isIndexed = true
    }

    const document = await db.knowledgeDocument.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('[api/knowledge/documents/[id]] PUT error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
  }
}

// DELETE /api/knowledge/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Chunks and citations are cascade-deleted
    await db.knowledgeDocument.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/knowledge/documents/[id]] DELETE error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }
}

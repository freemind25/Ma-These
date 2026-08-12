import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseDocument, chunkText, detectFileType } from '@/lib/document-parser'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  content: z.string().min(1, 'Contenu requis'),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  metadata: z.string().optional(),
  tags: z.string().optional(),
  sourceType: z.enum(['upload', 'url', 'reference', 'mendeley']).optional(),
  sourceRef: z.string().optional(),
  thesisId: z.string().optional(),
  autoChunk: z.boolean().optional(),
})

// GET /api/knowledge/documents — List documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get('fileType')
    const sourceType = searchParams.get('sourceType')
    const thesisId = searchParams.get('thesisId')
    const isIndexed = searchParams.get('indexed')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (fileType) where.fileType = fileType
    if (sourceType) where.sourceType = sourceType
    if (thesisId) where.thesisId = thesisId
    if (isIndexed !== null) where.isIndexed = isIndexed === 'true'
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { plainText: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    const [documents, total] = await Promise.all([
      db.knowledgeDocument.findMany({
        where: where as never,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { chunks: true, citations: true } },
        },
      }),
      db.knowledgeDocument.count({ where: where as never }),
    ])

    return NextResponse.json({
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[api/knowledge/documents] GET error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement des documents.' }, { status: 500 })
  }
}

// POST /api/knowledge/documents — Create document + optional auto-chunking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { title, content, fileName, fileType, metadata, tags, sourceType, sourceRef, thesisId, autoChunk } = parsed.data

    // Parse document content
    const detectedFileType = fileType || detectFileType(fileName || '', undefined)
    const parsedDoc = parseDocument(content, fileName, undefined)

    // Create document
    const document = await db.knowledgeDocument.create({
      data: {
        title: title || parsedDoc.title,
        fileName,
        fileType: detectedFileType,
        content: parsedDoc.content,
        plainText: parsedDoc.plainText,
        metadata,
        tags,
        sourceType: sourceType || 'upload',
        sourceRef,
        thesisId,
        wordCount: parsedDoc.wordCount,
        isIndexed: false,
      },
    })

    // Auto-chunk if requested
    let chunkCount = 0
    if (autoChunk !== false) {
      const chunks = chunkText(parsedDoc.content)
      if (chunks.length > 0) {
        await db.knowledgeChunk.createMany({
          data: chunks.map(chunk => ({
            documentId: document.id,
            content: chunk.content,
            plainText: chunk.plainText,
            chunkIndex: chunk.chunkIndex,
            charStart: chunk.charStart,
            charEnd: chunk.charEnd,
            wordCount: chunk.wordCount,
          })),
        })
        chunkCount = chunks.length

        // Mark as indexed
        await db.knowledgeDocument.update({
          where: { id: document.id },
          data: { isIndexed: true, chunkCount },
        })
      }
    }

    return NextResponse.json({
      success: true,
      document: { ...document, chunkCount },
    }, { status: 201 })
  } catch (error) {
    console.error('[api/knowledge/documents] POST error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du document.' }, { status: 500 })
  }
}

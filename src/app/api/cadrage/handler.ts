import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CADRAGE_FIELD_KEYS, REQUIRED_FIELDS, type CadrageFieldKey } from '@/types/cadrage'

// GET /api/cadrage?thesisId=xxx — Récupérer le cadrage courant
export async function GET(request: NextRequest) {
  try {
    const thesisId = request.nextUrl.searchParams.get('thesisId')
    if (!thesisId) {
      return NextResponse.json({ error: 'thesisId requis' }, { status: 400 })
    }

    const cadrage = await db.thesisCadrage.findUnique({
      where: { thesisId },
      include: { fields: true, versions: { orderBy: { version: 'desc' } } },
    })

    if (!cadrage) {
      return NextResponse.json({ exists: false, fields: [] })
    }

    // Ensure all field keys exist
    const existingKeys = new Set(cadrage.fields.map(f => f.fieldKey))
    const missingKeys = CADRAGE_FIELD_KEYS.filter(k => !existingKeys.has(k))

    if (missingKeys.length > 0) {
      await db.thesisCadrageField.createMany({
        data: missingKeys.map(key => ({
          cadrageId: cadrage.id,
          fieldKey: key,
          fieldValue: '',
          isAiSuggestion: false,
          editedByUser: false,
        })),
      })
      // Re-fetch with new fields
      const updated = await db.thesisCadrage.findUnique({
        where: { thesisId },
        include: { fields: true, versions: { orderBy: { version: 'desc' } } },
      })
      return NextResponse.json({ exists: true, ...formatCadrage(updated!) })
    }

    return NextResponse.json({ exists: true, ...formatCadrage(cadrage) })
  } catch (err) {
    console.error('[cadrage GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/cadrage — Mettre à jour le cadrage (sauvegarde auto des champs)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { thesisId, fields } = body

    if (!thesisId || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'thesisId et fields requis' }, { status: 400 })
    }

    // Upsert cadrage
    let cadrage = await db.thesisCadrage.findUnique({ where: { thesisId } })

    if (!cadrage) {
      const newCadrage = await db.thesisCadrage.create({
        data: { thesisId },
      })
      cadrage = newCadrage
      // Create all fields
      await db.thesisCadrageField.createMany({
        data: CADRAGE_FIELD_KEYS.map(key => ({
          cadrageId: newCadrage.id,
          fieldKey: key,
          fieldValue: '',
          isAiSuggestion: false,
          editedByUser: false,
        })),
      })
    }

    // Update each field
    for (const field of fields) {
      await db.thesisCadrageField.upsert({
        where: {
          cadrageId_fieldKey: {
            cadrageId: cadrage.id,
            fieldKey: field.key,
          },
        },
        create: {
          cadrageId: cadrage.id,
          fieldKey: field.key,
          fieldValue: field.value || '',
          fieldMeta: field.meta || null,
          isAiSuggestion: field.isAiSuggestion ?? false,
          editedByUser: field.editedByUser ?? false,
        },
        update: {
          fieldValue: field.value || '',
          fieldMeta: field.meta || null,
          isAiSuggestion: field.isAiSuggestion ?? false,
          editedByUser: field.editedByUser ?? false,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cadrage PUT]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── Helpers ──
function formatCadrage(cadrage: any) {
  const completedCount = REQUIRED_FIELDS.filter(reqKey =>
    cadrage.fields.some((f: any) => f.fieldKey === reqKey && f.fieldValue.trim().length > 0)
  ).length

  return {
    id: cadrage.id,
    thesisId: cadrage.thesisId,
    status: cadrage.status,
    version: cadrage.version,
    completedCount,
    totalRequired: REQUIRED_FIELDS.length,
    fields: cadrage.fields.map((f: any) => ({
      key: f.fieldKey as CadrageFieldKey,
      value: f.fieldValue,
      meta: f.fieldMeta || undefined,
      isAiSuggestion: f.isAiSuggestion,
      editedByUser: f.editedByUser,
    })),
    versions: cadrage.versions.map((v: any) => ({
      version: v.version,
      date: v.createdAt,
    })),
  }
}

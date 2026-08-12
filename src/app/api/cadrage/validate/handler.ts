import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { REQUIRED_FIELDS } from '@/types/cadrage'

// POST /api/cadrage/validate — Valider le cadrage (créer un snapshot versionné)
export async function POST(request: NextRequest) {
  try {
    const { thesisId, fields } = await request.json()

    if (!thesisId || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'thesisId et fields requis' }, { status: 400 })
    }

    // Upsert cadrage
    let cadrage = await db.thesisCadrage.findUnique({ where: { thesisId } })
    if (!cadrage) {
      return NextResponse.json({ error: 'Aucun cadrage trouvé pour cette thèse.' }, { status: 404 })
    }

    const newVersion = cadrage.version + 1

    // Build snapshot
    const snapshot = JSON.stringify(
      fields.reduce((acc: Record<string, any>, f: any) => {
        acc[f.key] = {
          value: f.value,
          meta: f.meta || null,
          isAiSuggestion: f.isAiSuggestion,
          editedByUser: f.editedByUser,
        }
        return acc
      }, {}),
    )

    // Create version snapshot
    await db.thesisCadrageVersion.create({
      data: {
        cadrageId: cadrage.id,
        version: newVersion,
        snapshot,
      },
    })

    // Update all fields (mark AI suggestions as not suggestions anymore)
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
          isAiSuggestion: false,
          editedByUser: field.editedByUser ?? true,
        },
        update: {
          fieldValue: field.value || '',
          fieldMeta: field.meta || null,
          isAiSuggestion: false,
          editedByUser: field.editedByUser ?? true,
        },
      })
    }

    // Update cadrage status
    await db.thesisCadrage.update({
      where: { id: cadrage.id },
      data: {
        status: 'valide',
        version: newVersion,
      },
    })

    return NextResponse.json({
      success: true,
      version: newVersion,
      status: 'valide',
      date: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cadrage/validate]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

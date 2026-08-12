import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  REFERENTIAL_ANALYSE_URBAINE,
  PROMPT_QUESTIONNEUR_ANALYSE_URBAINE,
  TYPE_ELEMENT_LABELS,
  NATURE_ELEMENT_LABELS,
  SOUS_ANALYSE_LABELS,
} from '@/data/verification-referentials'

/**
 * Seed — TypeAnalyseMethodologique
 * POST : insérer le type « analyse_urbaine » avec les éléments attendus sérialisés
 * GET  : lister les types disponibles
 */

function buildElementsAttendus(): string {
  const elements = [
    ...REFERENTIAL_ANALYSE_URBAINE.prealable.map(t => ({
      typeElement: t,
      natureElement: 'document' as const,
      sousAnalyse: 'prealable',
      label: TYPE_ELEMENT_LABELS[t] || t,
    })),
    ...REFERENTIAL_ANALYSE_URBAINE.phases.flatMap(p =>
      p.elements.map(e => ({
        typeElement: e.typeElement,
        natureElement: e.natureElement,
        sousAnalyse: e.sousAnalyse,
        label: e.label,
      }))
    ),
  ]
  return JSON.stringify(elements)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const force = body.force as boolean | undefined

    // Vérifier si le type existe déjà
    const existing = await db.typeAnalyseMethodologique.findUnique({
      where: {
        discipline_nom: {
          discipline: 'urbanisme',
          nom: 'analyse_urbaine',
        },
      },
    })

    if (existing && !force) {
      return NextResponse.json({
        message: 'Type « analyse_urbaine » déjà existant. Utiliser { force: true } pour réinitialiser.',
        id: existing.id,
      })
    }

    const elementsAttendus = buildElementsAttendus()

    if (existing && force) {
      const updated = await db.typeAnalyseMethodologique.update({
        where: { id: existing.id },
        data: {
          elementsAttendus,
          promptQuestionneur: PROMPT_QUESTIONNEUR_ANALYSE_URBAINE,
        },
      })
      return NextResponse.json({
        message: 'Type « analyse_urbaine » mis à jour.',
        id: updated.id,
      })
    }

    const created = await db.typeAnalyseMethodologique.create({
      data: {
        discipline: 'urbanisme',
        nom: 'analyse_urbaine',
        elementsAttendus,
        promptQuestionneur: PROMPT_QUESTIONNEUR_ANALYSE_URBAINE,
      },
    })

    return NextResponse.json({
      message: 'Type « analyse_urbaine » créé avec succès.',
      id: created.id,
    }, { status: 201 })
  } catch (error) {
    console.error('[verification/seed POST]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const types = await db.typeAnalyseMethodologique.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(types)
  } catch (error) {
    console.error('[verification/seed GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

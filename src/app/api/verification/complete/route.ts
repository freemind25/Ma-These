import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  REFERENTIAL_ANALYSE_URBAINE,
  SOUS_ANALYSE_LABELS,
  TYPE_ELEMENT_LABELS,
} from '@/data/verification-referentials'

/**
 * Module A — Vérification de complétude (règles, pas de LLM).
 * Compare les éléments présents en base contre le référentiel méthodologique.
 * Retourne un résultat phase par phase + blocage sur les préalables manquants.
 */

interface PhaseResult {
  phase: string
  label: string
  total: number
  presents: number
  manquants: string[]
  complet: boolean
  pourcentage: number
}

interface CompletionResult {
  complet: boolean
  bloqueParPrealable: boolean
  prealablesManquants: string[]
  phases: PhaseResult[]
  globalPourcentage: number
  nbTotalAttendus: number
  nbTotalPresents: number
}

function computeCompletion(dbTypes: string[]): CompletionResult {
  // ─── Préalables ────────────────────────────────────────
  const prealablesManquants = REFERENTIAL_ANALYSE_URBAINE.prealable.filter(
    p => !dbTypes.includes(p)
  )
  const bloqueParPrealable = prealablesManquants.length > 0

  // ─── Phases ─────────────────────────────────────────────
  const phases: PhaseResult[] = REFERENTIAL_ANALYSE_URBAINE.phases.map(ph => {
    const total = ph.elements.length
    const manquants = ph.elements
      .filter(e => !dbTypes.includes(e.typeElement))
      .map(e => e.label)
    const presents = total - manquants.length
    return {
      phase: ph.phase,
      label: ph.label,
      total,
      presents,
      manquants,
      complet: manquants.length === 0,
      pourcentage: total > 0 ? Math.round((presents / total) * 100) : 0,
    }
  })

  // ─── Global ─────────────────────────────────────────────
  const nbTotalAttendus =
    REFERENTIAL_ANALYSE_URBAINE.prealable.length +
    REFERENTIAL_ANALYSE_URBAINE.phases.reduce((s, p) => s + p.elements.length, 0)

  const nbTotalPresents = dbTypes.filter(t =>
    REFERENTIAL_ANALYSE_URBAINE.prealable.includes(t) ||
    REFERENTIAL_ANALYSE_URBAINE.phases.some(p =>
      p.elements.some(e => e.typeElement === t)
    )
  ).length

  const globalPourcentage =
    nbTotalAttendus > 0
      ? Math.round((nbTotalPresents / nbTotalAttendus) * 100)
      : 0

  const complet = !bloqueParPrealable && phases.every(p => p.complet)

  return {
    complet,
    bloqueParPrealable,
    prealablesManquants,
    phases,
    globalPourcentage,
    nbTotalAttendus,
    nbTotalPresents,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const siteEtudeId = body.siteEtudeId as string | undefined
    const sessionId = body.sessionId as string | undefined

    // Récupérer les éléments en base (filtrés par source si besoin)
    const where: Record<string, unknown> = {}
    if (siteEtudeId) where.source = siteEtudeId

    const elements = await db.elementAnalyse.findMany({
      where,
      select: { typeElement: true },
    })

    const dbTypes = elements.map(e => e.typeElement)
    const result = computeCompletion(dbTypes)

    // ─── Sauvegarder dans la session si sessionId fourni ───
    if (sessionId) {
      await db.sessionVerification.update({
        where: { id: sessionId },
        data: {
          elementsManquants: JSON.stringify({
            prealablesManquants: result.prealablesManquants,
            phases: result.phases.map(p => ({
              phase: p.phase,
              manquants: p.manquants,
            })),
          }),
        },
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[verification/complete POST]', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la vérification' },
      { status: 500 }
    )
  }
}

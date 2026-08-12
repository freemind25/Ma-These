import { NextRequest, NextResponse } from 'next/server'
import { callAI, getProviderConfig } from '@/lib/ai-router'
import { db } from '@/lib/db'
import { PROMPT_QUESTIONNEUR_ANALYSE_URBAINE } from '@/data/verification-referentials'

/**
 * Module B — Questionnement méthodologique via LLM.
 * Barrières de garde : rejet des questions ne se terminant pas par « ? »
 * et des phrases déclaratives commençant par un verbe d'affirmation.
 */

const MAX_QUESTIONS = 3

// Verbes déclaratifs interdits au début d'une question (FR)
const DECLARATIVE_STARTS = [
  'je ', 'il ', 'elle ', 'on ', 'nous ', 'vous ', 'ils ', 'elles ',
  'j\'ai', 'j\'étais', 'c\'est', 'c\'était', 'ce n\'est', 'il est',
  'notre ', 'mon ', 'ma ', 'mes ', 'ton ', 'ta ', 'tes ', 'son ', 'sa ', 'ses ',
  'le ', 'la ', 'les ', 'un ', 'une ', 'des ', 'du ', 'de la ',
]

function isDeclarativeStart(text: string): boolean {
  const lower = text.trim().toLowerCase()
  return DECLARATIVE_STARTS.some(v => lower.startsWith(v))
}

function isQuestion(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.endsWith('?')
}

function cleanQuestion(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question = body.question as string | undefined
    const sessionId = body.sessionId as string | undefined
    const contexte = body.contexte as string | undefined

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question requise (champ "question")' },
        { status: 400 }
      )
    }

    const cleaned = cleanQuestion(question)

    if (cleaned.length < 10) {
      return NextResponse.json(
        { error: 'Question trop courte (minimum 10 caractères)' },
        { status: 400 }
      )
    }

    // ─── Barrière de garde 1 : doit finir par « ? » ───────
    if (!isQuestion(cleaned)) {
      return NextResponse.json(
        {
          error: 'La question doit se terminer par un point d\'interrogation « ? ».',
          reason: 'guardrail_no_question_mark',
        },
        { status: 400 }
      )
    }

    // ─── Barrière de garde 2 : rejet des déclaratifs ───────
    if (isDeclarativeStart(cleaned)) {
      return NextResponse.json(
        {
          error: 'Veuillez formuler une vraie question, pas une affirmation. Commencez par « Comment », « Pourquoi », « Quels », etc.',
          reason: 'guardrail_declarative_start',
        },
        { status: 400 }
      )
    }

    // ─── Vérifier le nombre de questions déjà posées ───────
    if (sessionId) {
      const session = await db.sessionVerification.findUnique({
        where: { id: sessionId },
        select: { questionsPosees: true },
      })

      if (session) {
        try {
          const posed: string[] = JSON.parse(session.questionsPosees || '[]')
          if (posed.length >= MAX_QUESTIONS) {
            return NextResponse.json(
              {
                error: `Limite atteinte : ${MAX_QUESTIONS} questions maximum par session.`,
                reason: 'guardrail_max_questions',
              },
              { status: 429 }
            )
          }
        } catch {
          // Parse error, continue
        }
      }
    }

    // ─── Appel LLM ────────────────────────────────────────
    const providerConfig = getProviderConfig(body)

    const messages = [
      {
        role: 'system' as const,
        content: PROMPT_QUESTIONNEUR_ANALYSE_URBAINE,
      },
      {
        role: 'user' as const,
        content: [
          'Question du chercheur :',
          cleaned,
          ...(contexte ? [`Contexte fourni :\n${contexte}`] : []),
        ].join('\n\n'),
      },
    ]

    const reponse = await callAI({
      provider: providerConfig?.provider || 'z-ai',
      apiKey: providerConfig?.apiKey || '',
      baseUrl: providerConfig?.baseUrl || '',
      model: providerConfig?.model || '',
      messages,
      temperature: 0.7,
      maxTokens: 1024,
    })

    // ─── Mettre à jour la session ──────────────────────────
    if (sessionId) {
      const session = await db.sessionVerification.findUnique({
        where: { id: sessionId },
        select: { questionsPosees: true, reponses: true },
      })

      if (session) {
        try {
          const posed: string[] = JSON.parse(session.questionsPosees || '[]')
          const reps: Array<{ q: string; r: string }> = JSON.parse(
            session.reponses || '[]'
          )
          posed.push(cleaned)
          reps.push({ q: cleaned, r: reponse })

          await db.sessionVerification.update({
            where: { id: sessionId },
            data: {
              questionsPosees: JSON.stringify(posed),
              reponses: JSON.stringify(reps),
            },
          })
        } catch {
          // Parse error — first entry
          await db.sessionVerification.update({
            where: { id: sessionId },
            data: {
              questionsPosees: JSON.stringify([cleaned]),
              reponses: JSON.stringify([{ q: cleaned, r: reponse }]),
            },
          })
        }
      }
    }

    return NextResponse.json({
      question: cleaned,
      reponse,
    })
  } catch (error) {
    console.error('[verification/question POST]', error)
    const message =
      error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: `Erreur lors du questionnement : ${message}` },
      { status: 500 }
    )
  }
}



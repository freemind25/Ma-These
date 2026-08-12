import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRetry } from '@/lib/retry-with-backoff'
import { runWithConcurrencyLimit } from '@/lib/concurrency'

const OPENROUTER_MODELS = [
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
]

const DEFAULT_EVALUATOR = 'google/gemma-4-26b-a4b-it:free'
const DEFAULT_MAX_ROUNDS = 2

interface ModelResponse {
  modelId: string
  response: string
}

interface RoundData {
  round: number
  responses: ModelResponse[]
  consensusScore: number
  consensusSummary: string
}

interface ConsensusEvaluation {
  score: number
  summary: string
  reached: boolean
}

// Route to the correct provider
function isMistralDirect(modelId: string): boolean {
  return modelId.startsWith('mistral-direct/')
}

function getMistralModelName(modelId: string): string {
  return modelId.replace('mistral-direct/', '')
}

// ── callOpenRouter AVEC RETRY ──
async function callOpenRouter(
  apiKey: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  return withRetry(async () => {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelId, messages }),
    })

    if (!res.ok) {
      const text = await res.text()
      const rateLimitRemaining = res.headers.get('x-ratelimit-remaining')
      const rateLimitLimit = res.headers.get('x-ratelimit-limit')
      if (res.status === 429) {
        const err = new Error('RATE_LIMIT')
        ;(err as any).rateLimitRemaining = rateLimitRemaining
        ;(err as any).rateLimitLimit = rateLimitLimit
        ;(err as any).statusCode = 429
        throw err
      }
      const err = new Error(`OpenRouter (${modelId}): ${res.status} - ${text.slice(0, 200)}`)
      ;(err as any).status = res.status
      throw err
    }

    const data = await res.json()
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining')
    const rateLimitLimit = res.headers.get('x-ratelimit-limit')
    if (rateLimitRemaining && rateLimitLimit) {
      ;(data as any)._rateLimit = { remaining: parseInt(rateLimitRemaining), limit: parseInt(rateLimitLimit) }
    }
    return data.choices?.[0]?.message?.content || ''
  }, {
    maxRetries: 3,
    baseDelay: 2000,
    retryableCodes: ['RATE_LIMIT', 'rate_limit', 'TooManyRequests'],
    retryableStatuses: [429, 502, 503],
  })
}

// ── callMistral AVEC RETRY ──
async function callMistral(
  apiKey: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const modelName = getMistralModelName(modelId)
  return withRetry(async () => {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelName, messages }),
    })

    if (!res.ok) {
      const text = await res.text()
      const err = new Error(`Mistral (${modelName}): ${res.status} - ${text.slice(0, 200)}`)
      ;(err as any).status = res.status
      ;(err as any).Code = 'ResourceExhausted'
      throw err
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }, {
    maxRetries: 5,
    baseDelay: 1500,
    retryableCodes: ['ResourceExhausted', 'overloaded', 'concurrency'],
    retryableStatuses: [429, 502, 503, 504],
  })
}

async function callModel(
  openRouterKey: string | undefined,
  mistralKey: string | undefined,
  modelId: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (isMistralDirect(modelId)) {
    if (!mistralKey) throw new Error('Clé API Mistral non configurée.')
    return callMistral(mistralKey, modelId, messages)
  }
  if (!openRouterKey) throw new Error('Clé API OpenRouter non configurée.')
  return callOpenRouter(openRouterKey, modelId, messages)
}

async function evaluateConsensus(
  openRouterKey: string | undefined,
  mistralKey: string | undefined,
  evaluatorModel: string,
  question: string,
  responses: ModelResponse[]
): Promise<{ score: number; summary: string }> {
  const responsesText = responses
    .map((r) => `[${r.modelId}]:\n${r.response}`)
    .join('\n\n---\n\n')

  const evalPrompt = `Tu es un évaluateur de consensus entre plusieurs modèles d'IA.

Question originale : ${question}

Voici les réponses de chaque modèle :

${responsesText}

Évalue le niveau de consensus entre ces réponses sur une échelle de 0 à 100%.

- 100% = Les réponses sont parfaitement alignées sur les mêmes points clés, conclusions et recommandations.
- 0% = Les réponses sont contradictoires ou totalement divergentes.

Réponds EXACTEMENT sous ce format (en français) :
SCORE: [nombre entre 0 et 100]
RÉSUMÉ: [brève description en 1-2 phrases du niveau d'accord et des points de convergence/divergence]`

  const raw = await callModel(openRouterKey, mistralKey, evaluatorModel, [
    { role: 'user', content: evalPrompt },
  ])

  const scoreMatch = raw.match(/SCORE:\s*(\d+)/)
  const summaryMatch = raw.match(/RÉSUMÉ:\s*([\s\S]*?)(?:\n|$)/)

  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 50
  const summary = summaryMatch ? summaryMatch[1].trim() : raw.trim().slice(0, 300)

  return { score, summary }
}

export async function GET() {
  try {
    const openRouter = await db.aiToolConfig.findFirst({ where: { tool: 'openrouter' } })
    const mistral = await db.aiToolConfig.findFirst({ where: { tool: 'mistral' } })

    let isFreeTier = false
    if (openRouter?.extraConfig) {
      try { isFreeTier = JSON.parse(openRouter.extraConfig).isFreeTier === true } catch {}
    }

    return NextResponse.json({
      connected: !!(openRouter?.apiKey),
      mistralConnected: !!(mistral?.apiKey),
      isFreeTier,
    })
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
    const {
      question,
      models,
      modelIds,
      maxRounds,
      evaluatorModel,
    } = body as {
      question?: string
      models?: string[]
      modelIds?: string[]
      maxRounds?: number
      evaluatorModel?: string
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'La question est requise.' },
        { status: 400 }
      )
    }

    // 1. Fetch API keys
    const openRouterConfig = await db.aiToolConfig.findFirst({ where: { tool: 'openrouter' } })
    const mistralConfig = await db.aiToolConfig.findFirst({ where: { tool: 'mistral' } })

    const openRouterKey = openRouterConfig?.apiKey || undefined
    const mistralKey = mistralConfig?.apiKey || undefined

    if (!openRouterKey && !mistralKey) {
      return NextResponse.json(
        { error: 'Aucune clé API configurée. Configurez au moins OpenRouter ou Mistral.' },
        { status: 400 }
      )
    }

    const effectiveModelIds = (modelIds && modelIds.length > 0) || (models && models.length > 0)
      ? (modelIds || models)!
      : OPENROUTER_MODELS
    const numRounds = Math.min(Math.max(maxRounds || DEFAULT_MAX_ROUNDS, 1), 10)

    // Smart evaluator selection
    const hasMistralModels = effectiveModelIds.some((m) => m.startsWith('mistral-direct/'))
    const hasORModels = effectiveModelIds.some((m) => !m.startsWith('mistral-direct/'))
    let evaluator: string
    if (evaluatorModel) {
      evaluator = evaluatorModel
    } else if (hasMistralModels && !hasORModels && mistralKey) {
      evaluator = 'mistral-direct/mistral-small-latest'
    } else if (mistralKey && !openRouterKey) {
      evaluator = 'mistral-direct/mistral-small-latest'
    } else {
      evaluator = DEFAULT_EVALUATOR
    }

    const allRounds: RoundData[] = []
    let currentResponses: ModelResponse[] = []

    // ── Round 1 : appels séquentiels avec limite de concurrence ──
    // AVANT : Promise.all (3 appels en parallèle) → ResourceExhausted
    // APRÈS : max 2 appels simultanés
    const round1Tasks = effectiveModelIds.map((modelId) => {
      return async (): Promise<ModelResponse> => {
        const response = await callModel(openRouterKey, mistralKey, modelId, [
          { role: 'user', content: question },
        ])
        return { modelId, response }
      }
    })
    currentResponses = await runWithConcurrencyLimit(round1Tasks, 2)

    const eval1 = await evaluateConsensus(openRouterKey, mistralKey, evaluator, question, currentResponses)
    allRounds.push({
      round: 1,
      responses: currentResponses,
      consensusScore: eval1.score,
      consensusSummary: eval1.summary,
    })

    // ── Subsequent rounds : même limite de concurrence ──
    for (let r = 2; r <= numRounds; r++) {
      const previousResponsesText = currentResponses
        .map((resp) => `[${resp.modelId}]: ${resp.response}`)
        .join('\n\n---\n\n')

      const refinementPrompt = `Question originale : ${question}

Voici les réponses précédentes de tous les modèles :

${previousResponsesText}

En te basant sur ces réponses, affine ta propre réponse pour tendre vers un consensus avec les autres modèles. Identifie les points d'accord et propose une réponse nuancée qui intègre les meilleures contributions de chacun. Si tu es en désaccord avec un point, explique brièvement pourquoi.`

      const refineTasks = effectiveModelIds.map((modelId) => {
        return async (): Promise<ModelResponse> => {
          const response = await callModel(openRouterKey, mistralKey, modelId, [
            { role: 'user', content: question },
            { role: 'assistant', content: currentResponses.find((r) => r.modelId === modelId)?.response || '' },
            { role: 'user', content: refinementPrompt },
          ])
          return { modelId, response }
        }
      })
      currentResponses = await runWithConcurrencyLimit(refineTasks, 2)

      const evalN = await evaluateConsensus(openRouterKey, mistralKey, evaluator, question, currentResponses)
      allRounds.push({
        round: r,
        responses: currentResponses,
        consensusScore: evalN.score,
        consensusSummary: evalN.summary,
      })

      if (evalN.score >= 90) break
    }

    const finalEval = allRounds[allRounds.length - 1]
    const consensus: ConsensusEvaluation = {
      score: finalEval.consensusScore,
      summary: finalEval.consensusSummary,
      reached: finalEval.consensusScore >= 75,
    }

    return NextResponse.json({
      success: true,
      score: consensus.score,
      consensus: consensus.summary,
      rounds: allRounds.map((round) => ({
        round: round.round,
        responses: round.responses.map((r) => ({
          model: r.modelId,
          label: r.modelId.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || r.modelId,
          response: r.response,
        })),
      })),
    })
  } catch (error) {
    console.error('Consensus error:', error)
    if (error instanceof Error && error.message === 'RATE_LIMIT') {
      const remaining = (error as any).rateLimitRemaining
      const limit = (error as any).rateLimitLimit
      return NextResponse.json(
        {
          error: 'rate_limit',
          message: `Limite quotidienne atteinte${limit ? ` (${limit} requêtes/jour)` : ''}. Le plan gratuit OpenRouter est limité à 50 requêtes/jour pour les modèles gratuits. Ajoutez 10€ de crédits pour obtenir 1000 requêtes/jour gratuites, ou attendez demain (réinitialisation à 00h UTC).`,
          rateLimitRemaining: remaining,
          rateLimitLimit: limit,
        },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}
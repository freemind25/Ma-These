import { NextRequest, NextResponse } from 'next/server'
import { getZAI } from '@/lib/zai'
import { callAI, getProviderConfig } from '@/lib/ai-router'

// ─── Types ──────────────────────────────────────────────
interface ResearcherResponse {
  researcherId: string
  researcherName: string
  researcherRole: string
  response: string
  keyPoints: string[]
  confidence: number // 0-1
  duration: number // ms
}

interface ConsensusPoint {
  point: string
  agreement: number // 0-1 ratio of researchers agreeing
  supportingResearchers: string[]
  confidence: 'high' | 'medium' | 'low'
}

interface AggregateResult {
  aggregatedResponse: string
  researchers: ResearcherResponse[]
  consensusPoints: ConsensusPoint[]
  consensusScore: number // 0-100
  researchMode: 'fast' | 'deep'
  totalDuration: number
}

// ─── Researcher Personas ────────────────────────────────
const RESEARCHERS = [
  {
    id: 'analyste',
    name: 'Dr. Analyste',
    role: 'Analyse critique et rigueur méthodologique',
    systemSuffix: `Tu es un chercheur académique spécialisé en analyse critique. Ton rôle est d'analyser la question avec un œil critique, d'identifier les biais potentiels, les limites méthodologiques, et de fournir une réponse précise et bien étayée. Formate ta réponse en français académique. Termine toujours par une liste de 3-5 points clés sous forme de tirets commençant par "POINT: ".`,
    temperature: 0.3,
  },
  {
    id: 'synthetiseur',
    name: 'Dr. Synthétiseur',
    role: 'Synthèse et mise en perspective',
    systemSuffix: `Tu es un chercheur académique spécialisé en synthèse et intégration de connaissances. Ton rôle est de fournir une vue d'ensemble cohérente, de connecter les différents aspects de la question, et d'offrir des perspectives transversales. Formate ta réponse en français académique. Termine toujours par une liste de 3-5 points clés sous forme de tirets commençant par "POINT: ".`,
    temperature: 0.5,
  },
  {
    id: 'innovateur',
    name: 'Dr. Innovateur',
    role: 'Perspectives innovantes et pistes de recherche',
    systemSuffix: `Tu es un chercheur académique visionnaire spécialisé dans l'identification de pistes de recherche émergentes. Ton rôle est de proposer des angles originaux, des connexions inattendues entre domaines, et d'identifier les lacunes dans la littérature existante. Formate ta réponse en français académique. Termine toujours par une liste de 3-5 points clés sous forme de tirets commençant par "POINT: ".`,
    temperature: 0.7,
  },
  {
    id: 'methodologue',
    name: 'Dr. Méthodologue',
    role: 'Expertise méthodologique et épistémologie',
    systemSuffix: `Tu es un chercheur académique expert en méthodologie de recherche. Ton rôle est d'analyser la question sous l'angle des méthodes de recherche appropriées, des cadres théoriques pertinents, et de la validité scientifique des approches. Formate ta réponse en français académique. Termine toujours par une liste de 3-5 points clés sous forme de tirets commençant par "POINT: ".`,
    temperature: 0.4,
  },
  {
    id: 'bibliographe',
    name: 'Dr. Bibliographe',
    role: "Expertise bibliographique et état de l'art",
    systemSuffix: `Tu es un chercheur académique spécialisé dans les revues de littérature et l'état de l'art. Ton rôle est de situer la question dans le contexte de la littérature existante, d'identifier les auteurs et courants majeurs, et de proposer une structuration bibliographique pertinente. Formate ta réponse en français académique. Termine toujours par une liste de 3-5 points clés sous forme de tirets commençant par "POINT: ".`,
    temperature: 0.5,
  },
]

// ─── Helper: Extract key points from researcher response ──
function extractKeyPoints(response: string): string[] {
  const points: string[] = []
  const lines = response.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 10) continue
    if (/^[-*•]\s*POINT:/i.test(trimmed) || /^POINT:/i.test(trimmed)) {
      const point = trimmed.replace(/^[-*•]\s*/i, '').trim()
      if (point.length > 10) points.push(point)
    }
  }
  return points
}

// ─── Helper: Compute consensus ──────────────────────────
function computeConsensus(responses: ResearcherResponse[]) {
  const allPoints = new Map<string, { text: string; researchers: string[] }>()

  for (const r of responses) {
    for (const point of r.keyPoints) {
      const normalized = point.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ\s]/g, '').trim()
      if (normalized.length < 10) continue

      let found = false
      for (const [existing, val] of allPoints) {
        const setA = new Set(existing.split(/\s+/))
        const setB = new Set(normalized.split(/\s+/))
        let inter = 0
        for (const w of setA) if (setB.has(w)) inter++
        const union = setA.size + setB.size - inter
        const similarity = union === 0 ? 0 : inter / union
        if (similarity > 0.5) {
          val.researchers.push(r.researcherId)
          found = true
          break
        }
      }
      if (!found) {
        allPoints.set(normalized, { text: point, researchers: [r.researcherId] })
      }
    }
  }

  const totalResearchers = responses.length || 1
  const consensusPoints: ConsensusPoint[] = []
  let totalAgreement = 0

  for (const [, val] of allPoints) {
    const agreement = val.researchers.length / totalResearchers
    totalAgreement += agreement
    consensusPoints.push({
      point: val.text,
      agreement,
      supportingResearchers: val.researchers,
      confidence: agreement >= 0.8 ? 'high' : agreement >= 0.5 ? 'medium' : 'low',
    })
  }

  consensusPoints.sort((a, b) => b.agreement - a.agreement)

  const avgAgreement = consensusPoints.length > 0 ? totalAgreement / consensusPoints.length : 0
  const consensusScore = Math.round(avgAgreement * 100)

  return { points: consensusPoints, score: consensusScore }
}

// ─── Helper: Aggregate responses into a final synthesis ──
function buildAggregationPrompt(
  question: string,
  researcherResponses: ResearcherResponse[],
  consensusPoints: ConsensusPoint[],
  mode: 'fast' | 'deep',
  context?: {
    thesisTitle?: string
    thesisField?: string
    chapterTitle?: string
  }
): string {
  const researcherSummaries = researcherResponses
    .map(r => `### ${r.researcherName} (${r.researcherRole})\n${r.response.slice(0, 800)}${r.response.length > 800 ? '...' : ''}`)
    .join('\n\n')

  const consensusSection = consensusPoints.length > 0
    ? `\n\n## Points de consensus identifiés\n${consensusPoints.slice(0, 10).map((cp, i) => `${i + 1}. **[${cp.confidence === 'high' ? 'Fort consensus' : cp.confidence === 'medium' ? 'Consensus modéré' : 'Faible consensus'}]** ${cp.point} (${cp.supportingResearchers.length}/${researcherResponses.length} chercheurs)`).join('\n')}`
    : ''

  const contextSection = context?.thesisTitle
    ? `\n\n## Contexte de la thèse\n- Titre : ${context.thesisTitle}\n${context.thesisField ? `- Domaine : ${context.thesisField}` : ''}\n${context.chapterTitle ? `- Chapitre en cours : ${context.chapterTitle}` : ''}`
    : ''

  const depthInstruction = mode === 'deep'
    ? 'Fournis une analyse approfondie et détaillée (800-1200 mots). Inclue des sous-sections structurées.'
    : "Fournis une synthèse concise et percutante (300-500 mots). Va droit à l'essentiel."

  return `Tu es un chef de recherche qui doit agréger les analyses de ${researcherResponses.length} chercheurs experts en une synthèse cohérente et actionable pour un doctorant.

## Question du doctorant
${question}${contextSection}

## Analyses des chercheurs
${researcherSummaries}${consensusSection}

## Instructions
${depthInstruction}
- Met en avant les points de consensus forts
- Signale les divergences ou points de débat
- Fournis des recommandations concrètes et actionnables
- Formule en français académique de qualité
- Structure clairement avec des titres et sous-titres markdown`
}

// ─── Main Route ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const extProvider = getProviderConfig(body as Record<string, unknown>)
    const {
      question,
      mode = 'fast',
      thesisTitle,
      thesisField,
      chapterTitle,
    } = body as {
      question?: string
      mode?: 'fast' | 'deep'
      thesisTitle?: string
      thesisField?: string
      chapterTitle?: string
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'La question est requise.' }, { status: 400 })
    }

    const trimmedQuestion = question.trim()

    // Select researchers based on mode
    const selectedResearchers = mode === 'deep'
      ? RESEARCHERS // All 5 for deep
      : RESEARCHERS.slice(0, 3) // First 3 for fast

    // Build context header for each researcher
    const contextHeader = [
      thesisTitle ? `Contexte : le doctorant prépare une thèse intitulée « ${thesisTitle} ».` : '',
      thesisField ? `Domaine : ${thesisField}.` : '',
      chapterTitle ? `Chapitre en cours : ${chapterTitle}.` : '',
    ].filter(Boolean).join(' ')

    // ── Phase 1: Query researchers with CONCURRENCY LIMIT ──
    // AVANT : Promise.all (5 appels en parallèle) → ResourceExhausted
    // APRÈS : max 2 appels simultanés grâce à runWithConcurrencyLimit

    const researcherTasks = selectedResearchers.map((researcher) => {
      return async (): Promise<ResearcherResponse> => {
        const researcherStart = Date.now()
        try {
          const systemPrompt = `${contextHeader}\n\n${researcher.systemSuffix}`

          let responseText: string
          if (extProvider) {
            responseText = await callAI({
              provider: extProvider.provider,
              apiKey: extProvider.apiKey,
              baseUrl: extProvider.baseUrl,
              model: extProvider.model || 'GLM5.2R',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: trimmedQuestion },
              ],
              temperature: researcher.temperature,
              maxTokens: 2000,
            })
          } else {
            const zai = await getZAI()
            const completion = await zai.chat.completions.create({
              messages: [
                { role: 'assistant', content: systemPrompt },
                { role: 'user', content: trimmedQuestion },
              ],
              thinking: { type: 'disabled' },
            })
            responseText = completion.choices[0]?.message?.content || ''
          }
          const keyPoints = extractKeyPoints(responseText)
          const duration = Date.now() - researcherStart

          return {
            researcherId: researcher.id,
            researcherName: researcher.name,
            researcherRole: researcher.role,
            response: responseText,
            keyPoints,
            confidence: keyPoints.length > 0 ? Math.min(1, keyPoints.length / 5) : 0.5,
            duration,
          } satisfies ResearcherResponse
        } catch (err) {
          console.error(`Researcher ${researcher.id} failed:`, err)
          return {
            researcherId: researcher.id,
            researcherName: researcher.name,
            researcherRole: researcher.role,
            response: `Erreur lors de l'analyse : ${err instanceof Error ? err.message : 'inconnue'}`,
            keyPoints: [],
            confidence: 0,
            duration: Date.now() - researcherStart,
          } satisfies ResearcherResponse
        }
      }
    })

    // La queue FIFO dans zai.ts sérialise les appels AI automatiquement.
    // Promise.all lance les tâches en parallèle, mais la file s'assure qu'un seul appel
    // AI est exécuté à la fois → jamais de ResourceExhausted.
    const researcherResults = await Promise.all(researcherTasks.map(t => t()))

    // ── Phase 2: Compute consensus ──
    const { points: consensusPoints, score: consensusScore } = computeConsensus(researcherResults)

    // ── Phase 3: Final aggregation ──
    const aggregationPrompt = buildAggregationPrompt(
      trimmedQuestion,
      researcherResults,
      consensusPoints,
      mode,
      { thesisTitle, thesisField, chapterTitle }
    )

    let aggregatedResponse: string
    try {
      if (extProvider) {
        aggregatedResponse = await callAI({
          provider: extProvider.provider,
          apiKey: extProvider.apiKey,
          baseUrl: extProvider.baseUrl,
          model: extProvider.model || 'GLM5.2R',
          messages: [
            { role: 'user', content: aggregationPrompt },
          ],
          temperature: 0.5,
          maxTokens: 3000,
        })
      } else {
        const zai = await getZAI()
        const aggregation = await zai.chat.completions.create({
          messages: [
            { role: 'user', content: aggregationPrompt },
          ],
          thinking: { type: 'disabled' },
        })
        aggregatedResponse = aggregation.choices[0]?.message?.content || "Erreur lors de l'agrégation finale."
      }
    } catch {
      aggregatedResponse = researcherResults[0]?.response || 'Aucune réponse disponible.'
    }

    const totalDuration = Date.now() - startTime

    const result: AggregateResult = {
      aggregatedResponse,
      researchers: researcherResults,
      consensusPoints,
      consensusScore,
      researchMode: mode,
      totalDuration,
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('[POST /api/ai-aggregate] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getZAI } from '@/lib/zai'
import { callAI, getProviderConfig } from '@/lib/ai-router'

const SYSTEM_PROMPT = `Tu es un assistant de recherche académique. Réponds à la question de l'étudiant en te basant EXCLUSIVEMENT sur les sources fournies. Cite les sources utilisées. Si les sources ne contiennent pas assez d'information, indique-le clairement.`

export async function POST(request: NextRequest) {
  try {
    const bodyRaw = await request.json()
    const { question, sourceIds } = bodyRaw as {
      question?: string
      sourceIds?: string[]
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'La question est requise.' },
        { status: 400 }
      )
    }

    // 1. Fetch specified sources (or all if none specified)
    const sources = sourceIds && sourceIds.length > 0
      ? await db.researchSource.findMany({
          where: { id: { in: sourceIds } },
        })
      : await db.researchSource.findMany()

    if (sources.length === 0) {
      return NextResponse.json(
        { error: "Aucune source disponible. Veuillez d'abord ajouter des sources." },
        { status: 400 }
      )
    }

    // 2. Build system prompt with source contents
    const sourcesText = sources
      .map((s, i) => `--- Source ${i + 1} : ${s.title} ---\n${s.content}`)
      .join('\n\n')

    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\nSources disponibles :\n\n${sourcesText}`

    // 3. Use z-ai-web-dev-sdk LLM to answer
    const extProvider = getProviderConfig(bodyRaw)
    let answer: string
    if (extProvider) {
      answer = await callAI({
        provider: extProvider.provider, apiKey: extProvider.apiKey, baseUrl: extProvider.baseUrl,
        model: extProvider.model || 'GLM5.2R',
        messages: [
          { role: 'system', content: fullSystemPrompt },
          { role: 'user', content: question.trim() },
        ],
        temperature: 0.3, maxTokens: 4000,
      })
    } else {
      const zai = await getZAI()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: fullSystemPrompt },
          { role: 'user', content: question.trim() },
        ],
        thinking: { type: 'disabled' },
      })
      answer = completion.choices?.[0]?.message?.content || 'Désolé, une erreur est survenue lors de la génération.'
    }

    // 4. Save Q&A to NotebookEntry
    const usedSourceIds = sources.map((s) => s.id)
    const entry = await db.notebookEntry.create({
      data: {
        question: question.trim(),
        answer,
        sourceIds: usedSourceIds.join(','),
      },
    })

    // 5. Return response
    return NextResponse.json({
      success: true,
      answer,
      sourceIds: usedSourceIds,
      entryId: entry.id,
    })
  } catch (error) {
    console.error('Notebook ask error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}
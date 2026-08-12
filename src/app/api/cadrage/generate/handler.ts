import { NextRequest, NextResponse } from 'next/server'
import { getZAI } from '@/lib/zai'
import { callAI, getProviderConfig } from '@/lib/ai-router'
import { buildGeneratePrompt } from '@/lib/cadrage-prompt'
import { db } from '@/lib/db'
import { CADRAGE_FIELD_KEYS, type CadrageFieldKey } from '@/types/cadrage'

// POST /api/cadrage/generate — Générer un premier jet à partir du pitch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const { thesisId, pitch } = body

    if (!thesisId || !pitch || typeof pitch !== 'string' || pitch.trim().length < 10) {
      return NextResponse.json(
        { error: 'Le pitch doit contenir au moins 10 caractères.' },
        { status: 400 },
      )
    }

    const extProvider = getProviderConfig(body)
    let rawContent: string
    if (extProvider) {
      const userPrompt = buildGeneratePrompt(pitch.trim())
      rawContent = await callAI({
        provider: extProvider.provider, apiKey: extProvider.apiKey, baseUrl: extProvider.baseUrl,
        model: extProvider.model || 'GLM5.2R',
        messages: [
          { role: 'system', content: `Tu es l'assistant de cadrage de ThesisFrame. Tu génères des PROPOSITIONS DE BROUILLON pour un cadrage provisoire. Chaque suggestion doit être formulée comme hypothèse de travail modifiable. Ne jamais inventer de noms d'auteurs ou de références précises. Réponds UNIQUEMENT en JSON valide, sans markdown, sans préambule.` },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7, maxTokens: 4000,
      })
    } else {
      const zai = await getZAI()
      const userPrompt = buildGeneratePrompt(pitch.trim())
      const response = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: `Tu es l'assistant de cadrage de ThesisFrame. Tu génères des PROPOSITIONS DE BROUILLON pour un cadrage provisoire. Chaque suggestion doit être formulée comme hypothèse de travail modifiable. Ne jamais inventer de noms d'auteurs ou de références précises. Réponds UNIQUEMENT en JSON valide, sans markdown, sans préambule.` },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      })
      rawContent = response.choices[0]?.message?.content || ''
    }
    // Strip markdown code blocks if present
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let parsed: any = {}
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      return NextResponse.json(
        { error: 'La réponse IA n\'a pas pu être interprétée. Réessayez.' },
        { status: 502 },
      )
    }

    const generatedFields = parsed.fields || {}
    const questionsRelay = parsed.questions_relay || {}
    const coherenceRemarks = parsed.coherence_remarks || []

    // Upsert cadrage record
    let cadrage = await db.thesisCadrage.findUnique({ where: { thesisId } })
    if (!cadrage) {
      const newCadrage = await db.thesisCadrage.create({ data: { thesisId } })
      cadrage = newCadrage
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

    // Update fields with AI suggestions
    for (const key of CADRAGE_FIELD_KEYS) {
      const val = generatedFields[key]
      if (val !== undefined && val !== null) {
        const valueStr = typeof val === 'string' ? val : JSON.stringify(val)
        const metaStr = typeof val === 'object' ? JSON.stringify(val) : null
        await db.thesisCadrageField.upsert({
          where: { cadrageId_fieldKey: { cadrageId: cadrage.id, fieldKey: key } },
          create: {
            cadrageId: cadrage.id,
            fieldKey: key,
            fieldValue: valueStr,
            fieldMeta: metaStr,
            isAiSuggestion: true,
            editedByUser: false,
          },
          update: {
            fieldValue: valueStr,
            fieldMeta: metaStr,
            isAiSuggestion: true,
            editedByUser: false,
          },
        })
      } else if (questionsRelay[key]) {
        await db.thesisCadrageField.upsert({
          where: { cadrageId_fieldKey: { cadrageId: cadrage.id, fieldKey: key } },
          create: {
            cadrageId: cadrage.id,
            fieldKey: key,
            fieldValue: '',
            fieldMeta: JSON.stringify({ question_relay: questionsRelay[key] }),
            isAiSuggestion: false,
            editedByUser: false,
          },
          update: {
            fieldMeta: JSON.stringify({ question_relay: questionsRelay[key] }),
          },
        })
      }
    }

    // Fetch updated fields
    const updatedFields = await db.thesisCadrageField.findMany({
      where: { cadrageId: cadrage.id },
    })

    return NextResponse.json({
      fields: Object.fromEntries(
        updatedFields.map(f => [
          f.fieldKey,
          f.fieldMeta ? JSON.parse(f.fieldMeta) : f.fieldValue,
        ])
      ),
      questions_relay: questionsRelay,
      coherence_remarks: coherenceRemarks,
    })
  } catch (err) {
    console.error('[cadrage/generate]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

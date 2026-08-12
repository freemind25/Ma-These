import { NextRequest, NextResponse } from 'next/server'
import { getZAI } from '@/lib/zai'
import { callAI, getProviderConfig } from '@/lib/ai-router'
import { buildCoherencePrompt } from '@/lib/cadrage-prompt'

// POST /api/cadrage/verify — Vérification de cohérence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const { thesisId, fields } = body

    if (!fields || typeof fields !== 'object' || Object.keys(fields).length < 3) {
      return NextResponse.json(
        { error: 'Au moins 3 champs sont nécessaires pour la vérification.' },
        { status: 400 },
      )
    }

    const extProvider = getProviderConfig(body)
    let rawContent: string
    if (extProvider) {
      const userPrompt = buildCoherencePrompt(fields)
      rawContent = await callAI({
        provider: extProvider.provider, apiKey: extProvider.apiKey, baseUrl: extProvider.baseUrl,
        model: extProvider.model || 'GLM5.2R',
        messages: [
          { role: 'system', content: 'Tu es l\'assistant de cadrage de ThesisFrame. Vérifie la cohérence entre les champs. Réponds UNIQUEMENT en JSON : { "coherence_remarks": [{ "field": "...", "severity": "info|warning|error", "message": "..." }] }. Si tout est cohérent, renvoie un tableau vide.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, maxTokens: 2000,
      })
    } else {
      const zai = await getZAI()
      const userPrompt = buildCoherencePrompt(fields)
      const response = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: 'Tu es l\'assistant de cadrage de ThesisFrame. Vérifie la cohérence entre les champs. Réponds UNIQUEMENT en JSON : { "coherence_remarks": [{ "field": "...", "severity": "info|warning|error", "message": "..." }] }. Si tout est cohérent, renvoie un tableau vide.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })
      rawContent = response.choices[0]?.message?.content || ''
    }
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    let parsed: any = {}
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      return NextResponse.json({ coherence_remarks: [] })
    }

    return NextResponse.json({
      coherence_remarks: parsed.coherence_remarks || [],
    })
  } catch (err) {
    console.error('[cadrage/verify]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

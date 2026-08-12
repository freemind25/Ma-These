import { NextRequest, NextResponse } from 'next/server'
import {
  buildCleanupPrompt,
  buildEditPrompt,
  detectHallucination,
  type DictationContext,
} from '@/lib/dictation-prompts'
import { callAI, getProviderConfig } from '@/lib/ai-router'

// POST /api/dictation/post-process
//
// Body (cleanup mode):
//   { mode: 'cleanup', transcript: string, context?: DictationContext }
//
// Body (edit mode):
//   { mode: 'edit', selectedText: string, instruction: string, context?: DictationContext }
//
// Returns:
//   { text: string, mode: string, hallucinationDetected?: boolean, hallucinationReason?: string }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode } = body

    if (mode === 'edit') {
      return handleEdit(body)
    }
    return handleCleanup(body)
  } catch (err: unknown) {
    console.error('[dictation/post-process]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur de post-traitement' },
      { status: 500 },
    )
  }
}

// ─── Cleanup mode ──────────────────────────────────────────────────

async function handleCleanup(body: Record<string, unknown>) {
  const { transcript, context } = body

  if (!transcript || typeof transcript !== 'string') {
    return NextResponse.json({ error: 'transcript requis' }, { status: 400 })
  }

  const ctx = context as DictationContext | undefined
  const systemPrompt = buildCleanupPrompt(ctx)
  const cleaned = await callLLM(systemPrompt, transcript, body)

  // Anti-hallucination check
  const { safe, reason } = detectHallucination(transcript, cleaned)
  if (!safe) {
    console.warn('[dictation] Hallucination detected:', reason)
    return NextResponse.json({
      text: basicFrenchCleanup(transcript),
      mode: 'cleanup',
      hallucinationDetected: true,
      hallucinationReason: reason,
      fallback: true,
    })
  }

  return NextResponse.json({ text: cleaned, mode: 'cleanup', hallucinationDetected: false })
}

// ─── Edit mode ─────────────────────────────────────────────────────

async function handleEdit(body: Record<string, unknown>) {
  const { selectedText, instruction, context } = body

  if (!selectedText || typeof selectedText !== 'string') {
    return NextResponse.json({ error: 'selectedText requis' }, { status: 400 })
  }
  if (!instruction || typeof instruction !== 'string') {
    return NextResponse.json({ error: 'instruction requis' }, { status: 400 })
  }

  const ctx = context as DictationContext | undefined
  const prompt = buildEditPrompt({
    selectedText,
    instruction,
    context: ctx,
  })

  const transformed = await callLLM(prompt, '', body)

  return NextResponse.json({ text: transformed, mode: 'edit' })
}

// ─── LLM call ─────────────────────────────────────────────────────

async function callLLM(systemPrompt: string, userMessage: string, body?: Record<string, unknown>): Promise<string> {
  const extProvider = body ? getProviderConfig(body) : null

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ]

  if (userMessage.trim()) {
    messages.push({ role: 'user', content: userMessage })
  }

  if (extProvider) {
    const text = await callAI({
      provider: extProvider.provider,
      apiKey: extProvider.apiKey,
      baseUrl: extProvider.baseUrl,
      model: extProvider.model || 'GLM5.2R',
      messages,
      temperature: 0.1,
      maxTokens: 2000,
    })
    const trimmed = text.trim()
    if (trimmed === 'EMPTY') return ''
    return trimmed
  }

  const { getZAI } = await import('@/lib/zai')
  const zai = await getZAI()

  const result = await zai.chat.completions.create({
    messages,
    model: 'deepseek-chat',
    temperature: 0.1,
    max_tokens: 2000,
  })

  const text = result.choices?.[0]?.message?.content?.trim() || ''
  if (text === 'EMPTY') return ''
  return text
}

// ─── Basic fallback cleanup ────────────────────────────────────────

function basicFrenchCleanup(text: string): string {
  let cleaned = text.replace(/\s+/g, ' ').trim()
  cleaned = cleaned.replace(
    /(^[a-zàâéèêëïîôùûüÿçñ]|(?<=[.!?]\s)[a-zàâéèêëïîôùûüÿçñ])/g,
    m => m.toUpperCase(),
  )
  const fillers = /\b(euh|hum|bah|ben|hein|donc|voilà|enfin|quoi\?|tu vois|en fait)\b/gi
  cleaned = cleaned.replace(fillers, '')
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  if (cleaned.length > 0 && !['.', '!', '?', ';', ':', ',', '…'].includes(cleaned[cleaned.length - 1])) {
    cleaned += '.'
  }
  return cleaned
}

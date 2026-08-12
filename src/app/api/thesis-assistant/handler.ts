import { NextRequest, NextResponse } from 'next/server'
import { getZAI } from '@/lib/zai'
import { callAI, getProviderConfig } from '@/lib/ai-router'
import { buildSystemPrompt, type AssistantMode } from '@/lib/thesis-assistant-knowledge'
import { retrieve, formatRagContext, shouldRetrieve, type Chunk } from '@/lib/thesis-rag'
import { createConversationStore } from '@/lib/conversation-store'
import { thesisAssistantSchema, validateBody } from '@/lib/api-schemas'

const VALID_MODES: AssistantMode[] = ['general', 'redaction', 'correction', 'critique', 'methode', 'bibliographie', 'suivi']

const store = createConversationStore()

interface ChapterProgress {
  number: string
  title: string
  wordCount: number
  status: string
}

interface ChapterContent {
  number: string
  title: string
  content: string
}

function buildContextBlock(body: Record<string, unknown>): string {
  const parts: string[] = []

  // Chapter context
  const chapterNumber = body.chapterNumber as string | undefined
  const chapterTitle = body.chapterTitle as string | undefined
  const chapterContent = body.chapterContent as string | undefined

  if (chapterTitle) {
    parts.push(`CONTEXTE ACTUEL :\nLe doctorant travaille sur le ${chapterNumber ? `Chapitre ${chapterNumber}` : 'chapitre courant'} : « ${chapterTitle} ».`)
  }

  if (chapterContent && chapterContent.trim().length > 0) {
    // Truncate to ~3000 chars to stay within token limits
    const truncated = chapterContent.length > 3000
      ? chapterContent.slice(0, 3000) + '\n[... texte tronqué ...]'
      : chapterContent
    // Strip markdown headings for cleaner context
    const cleaned = truncated
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
    parts.push(`CONTENU DU CHAPITRE (extrait) :\n${cleaned}`)
  }

  // Thesis progress (for suivi mode or general awareness)
  const thesisProgress = body.thesisProgress as ChapterProgress[] | undefined
  if (thesisProgress && thesisProgress.length > 0) {
    const totalWords = thesisProgress.reduce((s, c) => s + c.wordCount, 0)
    const progressLines = thesisProgress
      .map(c => `  - Chap. ${c.number} ${c.title} : ${c.wordCount} mots [${c.status}]`)
      .join('\n')
    parts.push(`PROGRESSION GLOBALE DE LA THÈSE (${totalWords.toLocaleString()} mots) :\n${progressLines}`)
  }

  return parts.length > 0 ? parts.join('\n\n') : ''
}

function enrichSystemPrompt(
  basePrompt: string,
  mode: AssistantMode,
  contextBlock: string,
  ragBlock: string,
  body: Record<string, unknown>,
): string {
  const thesisTitle = body.thesisTitle as string | undefined
  const thesisField = body.thesisField as string | undefined

  const headerParts: string[] = []
  if (thesisTitle) headerParts.push(`Titre de la thèse : ${thesisTitle}`)
  if (thesisField) headerParts.push(`Domaine : ${thesisField}`)

  const header = headerParts.length > 0
    ? `INFORMATIONS SUR LA THÈSE :\n${headerParts.join('\n')}`
    : ''

  return [header, basePrompt, contextBlock, ragBlock].filter(Boolean).join('\n\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(thesisAssistantSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const { mode, message, sessionId, clearHistory, chapterTitle, chapterNumber, chapterContent, thesisTitle, thesisField, allChaptersContent } = validation.data

    const currentMode = (mode || 'general') as AssistantMode

    if (!VALID_MODES.includes(currentMode)) {
      return NextResponse.json(
        { error: `Mode invalide. Modes : ${VALID_MODES.join(', ')}` },
        { status: 400 }
      )
    }

    const trimmedMessage = message.trim()
    const sid = sessionId || `thesis_ast_${Date.now()}`

    if (clearHistory) {
      store.delete(sid)
    }

    // Build context from thesis data
    const contextBlock = buildContextBlock(body)

    // ── RAG: retrieve relevant chunks if the query references thesis content ──
    let ragBlock = ''
    let ragChunks: Chunk[] = []
    if (shouldRetrieve(trimmedMessage) && allChaptersContent && allChaptersContent.length > 0) {
      const ragResult = retrieve(trimmedMessage, allChaptersContent, { topK: 5, minScore: 0.05 })
      ragChunks = ragResult.chunks
      ragBlock = formatRagContext(ragResult)
    }

    const systemPrompt = enrichSystemPrompt(
      buildSystemPrompt(currentMode),
      currentMode,
      contextBlock,
      ragBlock,
      body,
    )

    let history = store.createOrReset(sid, systemPrompt)

    // If RAG found chunks, prepend them to the user message for better visibility
    const userContent = ragChunks.length > 0
      ? `[Recherche dans vos chapitres : ${ragChunks.length} extrait(s) pertinent(s) trouvé(s).]\n\n${trimmedMessage}`
      : trimmedMessage

    history = store.addAndTrim(sid, 'user', userContent, 20)

    // Build messages for AI call
    const apiMessages = history
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const fullMessages = [
      { role: 'assistant', content: systemPrompt },
      ...apiMessages,
    ]

    // Use external provider (RoutesMe, Mistral, etc.) if configured
    const extProvider = getProviderConfig(body)
    let aiResponse: string
    if (extProvider) {
      aiResponse = await callAI({
        provider: extProvider.provider,
        apiKey: extProvider.apiKey,
        baseUrl: extProvider.baseUrl,
        model: extProvider.model || 'GLM5.2R',
        messages: fullMessages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        maxTokens: 4096,
      })
    } else {
      const zai = await getZAI()
      const completion = await zai.chat.completions.create({
        messages: fullMessages,
        thinking: { type: 'disabled' },
      })
      aiResponse = completion.choices[0]?.message?.content || 'Désolé, une erreur est survenue lors de la génération.'
    }

    history = store.addAndTrim(sid, 'assistant', aiResponse, 20)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId: sid,
      messageCount: history.length - 1,
      ragChunksFound: ragChunks.length,
    })
  } catch (error) {
    console.error('Thesis assistant error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    if (sessionId) {
      store.delete(sessionId)
    } else {
      store.clear()
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/thesis-assistant] DELETE', err)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }
}

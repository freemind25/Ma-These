import { getZAI, type ZAIClient } from '@/lib/zai'

export interface AIChatOptions {
  systemPrompt: string
  userMessage: string
  messages?: Array<{ role: string; content: string }>
  model?: string
  temperature?: number
  maxTokens?: number
  thinking?: 'enabled' | 'disabled'
}

export interface AIChatResult {
  response: string
  messages: Array<{ role: string; content: string }>
}

/**
 * Send a chat message to the AI and return the response.
 * Handles ZAI initialization, completion call, and empty-response fallback.
 * System prompt is sent as first message with role 'assistant' (Z.ai SDK convention).
 */
export async function chatWithAI(options: AIChatOptions): Promise<AIChatResult> {
  const { systemPrompt, userMessage, messages: history, model, temperature, maxTokens, thinking = 'disabled' } = options

  const zai = await getZAI()

  // Build messages: system prompt + history (without system) + new user message
  const historyWithoutSystem = (history || []).filter(m => m.role !== 'system')
  const apiMessages = [
    { role: 'assistant' as const, content: systemPrompt },
    ...historyWithoutSystem.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]

  const completion = await zai.chat.completions.create({
    messages: apiMessages,
    thinking: { type: thinking },
    ...(temperature !== undefined && { temperature }),
    ...(maxTokens && { max_tokens: maxTokens }),
  })

  const response = completion.choices[0]?.message?.content || 'Désolé, une erreur est survenue lors de la génération.'

  // Return updated history including the new messages
  return {
    response,
    messages: [
      ...(history || [{ role: 'system', content: systemPrompt }]),
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response },
    ],
  }
}

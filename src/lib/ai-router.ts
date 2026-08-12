/**
 * AI Router — Unified interface for all AI providers.
 * 
 * Supports: Z.ai (default), RoutesMe, Mistral, OpenAI, Anthropic, Groq, Ollama, FreeLLMAPI, Custom
 * RoutesMe is treated as an OpenAI-compatible provider with special retry logic.
 */

export interface ProviderConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
  plan?: 'free' | 'vip' // RoutesMe only
}

// ─── Call OpenAI-compatible provider (shared by all routes) ───

interface ChatMsg {
  role: string
  content: string
}

export async function callAI({
  provider,
  apiKey,
  baseUrl,
  model,
  messages,
  temperature,
  maxTokens,
}: {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
  messages: ChatMsg[]
  temperature?: number
  maxTokens?: number
}): Promise<string> {
  // Route to Z.ai for the default provider
  if (!provider || provider === 'z-ai') {
    const { getZAI } = await import('@/lib/zai')
    const zai = await getZAI()
    const body: Record<string, unknown> = {
      model: model || undefined,
      messages,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens && { max_tokens: maxTokens }),
    }
    const result = await zai.chat.completions.create(body)
    return result.choices[0]?.message?.content || ''
  }

  // All other providers: OpenAI-compatible fetch with retry
  return callOpenAICompatible({ baseUrl, apiKey, model, messages, temperature, maxTokens })
}

/**
 * Call any OpenAI-compatible API (RoutesMe, Mistral, OpenAI, Groq, Ollama, etc.)
 * Includes retry logic for gateway timeouts (504/502/500/429).
 */
export async function callOpenAICompatible({
  baseUrl,
  apiKey,
  model,
  messages,
  temperature,
  maxTokens,
  maxRetries = 3,
  timeout = 120_000,
}: {
  baseUrl: string
  apiKey: string
  model: string
  messages: ChatMsg[]
  temperature?: number
  maxTokens?: number
  maxRetries?: number
  timeout?: number
}): Promise<string> {
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens && { max_tokens: maxTokens }),
      }

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })
      clearTimeout(timer)

      const rawText = await res.text()

      // Check for HTML error pages (504, 502 from nginx)
      let data: any
      try {
        data = JSON.parse(rawText)
      } catch {
        const isGatewayError = res.status === 504 || res.status === 502 || res.status === 500
        if (isGatewayError && attempt < maxRetries) {
          const delay = attempt * 3000
          console.log(`[AI Router] Gateway ${res.status} on ${url}, retry ${attempt + 1}/${maxRetries} in ${delay}ms`)
          await new Promise(r => setTimeout(r, delay))
          continue
        }
        throw new Error(`Fournisseur IA : réponse invalide (HTTP ${res.status}). Réessayez.`)
      }

      if (!res.ok) {
        const errMsg = data?.error?.message || data?.error || rawText.slice(0, 200)
        const isRetryable = res.status === 429 || res.status === 502 || res.status === 503 || res.status === 500
        if (isRetryable && attempt < maxRetries) {
          const delay = res.status === 429 ? 5000 : attempt * 3000
          console.log(`[AI Router] ${res.status} on ${url}, retry ${attempt + 1}/${maxRetries} in ${delay}ms`)
          await new Promise(r => setTimeout(r, delay))
          continue
        }
        throw new Error(`Fournisseur IA ${res.status}: ${errMsg}`)
      }

      return data.choices?.[0]?.message?.content || 'Aucune réponse générée.'
    } catch (e) {
      clearTimeout(timer)
      lastError = e instanceof Error ? e : new Error(String(e))
      if (lastError.name === 'AbortError' && attempt < maxRetries) {
        console.log(`[AI Router] Timeout on ${url}, retry ${attempt + 1}/${maxRetries}`)
        continue
      }
      throw lastError
    }
  }

  throw lastError || new Error('Échec après retries')
}

/**
 * Extract provider config from request body (used by all AI API routes)
 */
export function getProviderConfig(body: Record<string, unknown>): ProviderConfig | null {
  const provider = body.provider as string | undefined
  if (!provider || provider === 'z-ai') return null

  const apiKey = body.apiKey as string | undefined
  const baseUrl = body.baseUrl as string | undefined
  const model = body.model as string | undefined

  if (!apiKey || !baseUrl) return null

  return {
    provider,
    apiKey,
    baseUrl,
    model: model || '',
    plan: (body.plan as 'free' | 'vip') || undefined,
  }
}

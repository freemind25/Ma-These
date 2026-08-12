import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir, tmpdir } from 'os'

// ─── Public client interface ─────────────────────────────────────

export interface ZAIClient {
  chat: {
    completions: {
      create(params: Record<string, unknown>): Promise<{ choices: Array<{ message: { content: string } }> }>
    }
  }
  audio: {
    asr: {
      create(params: { file_base64: string }): Promise<{ text: string }>
    }
  }
}

// ─── Types (mirror SDK interface) ─────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CreateChatCompletionBody {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
  thinking?: { type: string }
  stream?: boolean
}

// ─── FILE D'ATTENTE LOCALE (FIFO) ─────────────────────────────────
// Sérialise les appels AU SEIN d'un même container Vercel.
// Utile pour ai-aggregate qui lance 5 chercheurs en parallèle.

let queueRunning = false
const aiQueue: Array<{
  execute: () => Promise<void>
  resolve: (value: any) => void
  reject: (reason: any) => void
}> = []

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    aiQueue.push({ execute: () => fn().then(resolve).catch(reject), resolve, reject })
    drainQueue()
  })
}

async function drainQueue() {
  if (queueRunning) return
  queueRunning = true

  while (aiQueue.length > 0) {
    const item = aiQueue.shift()!
    try {
      await item.execute()
    } catch (err) {
      // L'erreur est déjà propagée via reject
    }
  }

  queueRunning = false
}

// ─── DÉTECTION D'ERREURS RESSAYABLES ──────────────────────────────

const RETRYABLE_KEYWORDS = [
  'resourceexhausted',
  'concurrency threshold',
  'ratelimit',
  'rate_limit',
  'toomanyrequests',
  'overloaded',
  'serviceunavailable',
]

function isRetryableError(error: unknown): boolean {
  const text = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : JSON.stringify(error)
  const lower = text.toLowerCase()
  return RETRYABLE_KEYWORDS.some(kw => lower.includes(kw))
}

// ─── RETRY ADAPTATIF (v6) ─────────────────────────────────────────
//
// PROBLÈME : sur Vercel, 16 routes API différentes utilisent getZAI().
// Chaque route est un container isolé → la file locale ne coordonne PAS
// entre les containers. Si 2 routes font un appel AI simultanément,
// DashScope renvoie ResourceExhausted.
//
// SOLUTION : des délais de retry LONGS (8s) car un appel AI typique
// dure 5-15 secondes. On attend que l'autre appel se termine.
//
// Stratégie :
//   - 3 retries, délai de 5-6s (adapté au maxDuration=30s de Vercel)
//   - Temps total de retry : ~18s
//   - Jitter proactif de 0-500ms avant chaque appel

async function retryAI<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Jitter proactif : petit délai aléatoire avant l'appel
      // pour éviter que 2 containers ne frappent DashScope en même temps
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, Math.random() * 500))
      }
      return await fn()
    } catch (error) {
      lastError = error

      // Dernière tentative ou erreur non-retryable → on arrête
      if (attempt >= maxAttempts - 1 || !isRetryableError(error)) break

      // Délai de 5 secondes — attend qu'un appel AI concurrent se termine.
      // maxDuration=30s dans vercel.json → 3 retries × 5s = 15s + 15s appel = 30s
      const delay = 5000 + Math.random() * 1000 // 5-6s avec jitter
      console.warn(
        `[AI v6] Retry ${attempt + 1}/${maxAttempts} après ${Math.round(delay / 1000)}s – ResourceExhausted, attente appel concurrent…`
      )
      await new Promise(r => setTimeout(r, delay))
    }
  }

  throw lastError
}

// ─── FETCH-BASED CLIENT (Mistral, OpenAI-compatible) ─────────────────

class FetchAI {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.apiKey = apiKey
  }

  get chat() {
    return {
      completions: {
        create: async (body: Record<string, unknown>): Promise<{ choices: Array<{ message: { content: string } }> }> => {
          const { thinking, stream, messages: rawMessages, ...rest } = body as unknown as CreateChatCompletionBody
          // SDK convention uses 'assistant' for system prompts; remap for standard APIs
          const messages = (rawMessages ?? []).map((m: ChatMessage, i: number) =>
            i === 0 && m.role === 'assistant' ? { ...m, role: 'system' as const } : m
          )
          const res = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: rest.model || 'mistral-large-latest',
              ...rest,
              messages,
            }),
          })

          const rawText = await res.text()

          // Parser la réponse JSON
          let data: any
          try {
            data = JSON.parse(rawText)
          } catch {
            const err = new Error(`AI API ${res.status}: réponse JSON invalide – ${rawText.slice(0, 200)}`)
            ;(err as any).status = res.status
            throw err
          }

          // Détecter les erreurs dans le corps de la réponse (même sur HTTP 200)
          const errCode = data?.Code || data?.code || data?.error?.code
          if (!res.ok || errCode) {
            const errMsg = data?.Message || data?.message || data?.error?.message || rawText.slice(0, 200)
            const err = new Error(`AI API ${res.status} [${errCode || 'UNKNOWN'}]: ${errMsg}`)
            ;(err as any).Code = errCode
            ;(err as any).status = res.status
            throw err
          }

          return data
        },
      },
    }
  }

  get audio() {
    return { asr: { create: async () => { throw new Error('ASR requires Z.ai platform.') } } }
  }

  get functions() {
    return { invoke: async () => { throw new Error('Functions require Z.ai platform.') } }
  }

  get images() {
    return { generations: { create: async () => { throw new Error('Image gen requires Z.ai platform.') } } }
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────

let zaiInstance: ZAIClient | null = null
let initAttempted = false
let initError: string | null = null

function readConfig(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = process.env.AI_BASE_URL || process.env.ZAI_BASE_URL
  const apiKey = process.env.AI_API_KEY || process.env.ZAI_API_KEY
  if (baseUrl && apiKey) return { baseUrl, apiKey }

  const paths = ['.z-ai-config', join(homedir(), '.z-ai-config'), '/etc/.z-ai-config', join(tmpdir(), '.z-ai-config')]
  for (const p of paths) {
    try {
      if (existsSync(p)) {
        const cfg = JSON.parse(readFileSync(p, 'utf-8'))
        if (cfg.baseUrl && cfg.apiKey) return { baseUrl: cfg.baseUrl, apiKey: cfg.apiKey }
      }
    } catch { /* skip */ }
  }
  return null
}

/**
 * Retourne un client AI prêt à l'emploi.
 *
 * v6 – Cross-container retry :
 * - File FIFO locale (sérialise les appels au sein d'un même container)
 * - Retry avec délais de 8-10s (attend la fin des appels depuis d'autres containers)
 * - Jitter proactif 0-500ms (réduit les collisions)
 */
export async function getZAI(): Promise<ZAIClient> {
  if (zaiInstance) return zaiInstance
  if (initAttempted && initError) throw new Error(initError)

  initAttempted = true
  const config = readConfig()

  if (!config) {
    initError = 'Configuration IA non trouvée. Ajoutez AI_BASE_URL et AI_API_KEY dans les variables d\'environnement.'
    throw new Error(initError)
  }

  // Essayer le SDK natif d'abord (développement local)
  let raw: any = null
  if (!process.env.AI_BASE_URL && !process.env.ZAI_BASE_URL) {
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      raw = await ZAI.create()
    } catch (err) {
      console.warn('[ZAI] SDK indisponible, utilisation du client fetch:', err)
    }
  }
  if (!raw) raw = new FetchAI(config.baseUrl, config.apiKey)

  // Wrappé : queue FIFO locale + retry cross-container
  const originalCreate = raw.chat.completions.create.bind(raw.chat.completions)

  zaiInstance = {
    chat: {
      completions: {
        create: (body: Record<string, unknown>) => {
          return enqueue(() => retryAI(() => originalCreate(body as any), 3))
        },
      },
    },
    audio: raw.audio,
  }

  return zaiInstance!
}

export function isZAIConfigured(): boolean {
  if (process.env.AI_BASE_URL && process.env.AI_API_KEY) return true
  if (process.env.ZAI_BASE_URL && process.env.ZAI_API_KEY) return true

  const paths = ['.z-ai-config', join(homedir(), '.z-ai-config'), '/etc/.z-ai-config', join(tmpdir(), '.z-ai-config')]
  for (const p of paths) {
    try {
      if (existsSync(p)) {
        const cfg = JSON.parse(readFileSync(p, 'utf-8'))
        if (cfg.baseUrl && cfg.apiKey) return true
      }
    } catch { /* skip */ }
  }
  return false
}

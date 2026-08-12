import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

// ─── Types ───────────────────────────────────────────────────────

export interface RoutesMeModel {
  id: string
  object: string
  created: number
  owned_by: string
  display_name?: string
}

export interface RoutesMeConfig {
  apiKey: string
  plan: 'free' | 'vip'
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface RoutesMeChatParams {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface RoutesMeChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ─── Config persistence ──────────────────────────────────────────

const CONFIG_DIR = join(homedir(), '.thesisframe')
const CONFIG_FILE = join(CONFIG_DIR, 'routesme.json')

function loadConfig(): RoutesMeConfig | null {
  // 1. Env var takes priority
  if (process.env.ROUTESME_API_KEY) {
    return {
      apiKey: process.env.ROUTESME_API_KEY,
      plan: (process.env.ROUTESME_PLAN as 'free' | 'vip') || 'free',
    }
  }
  // 2. Persistent config file
  try {
    if (existsSync(CONFIG_FILE)) {
      const cfg = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
      if (cfg.apiKey) return cfg as RoutesMeConfig
    }
  } catch { /* skip */ }
  return null
}

function saveConfig(config: RoutesMeConfig): void {
  try {
    if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
  } catch (e) {
    console.error('[RoutesMe] Failed to save config:', e)
  }
}

// ─── Client ──────────────────────────────────────────────────────

const BASE_URL_FREE = 'https://routesme.online/v1'
const BASE_URL_VIP = 'https://routesme.online/v2'

export class RoutesMeClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: RoutesMeConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.plan === 'vip' ? BASE_URL_VIP : BASE_URL_FREE
  }

  /** List all available models */
  async listModels(): Promise<RoutesMeModel[]> {
    const res = await fetch(`${this.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`RoutesMe ${res.status}: ${text.slice(0, 200)}`)
    }
    const data = await res.json()
    return data.data || []
  }

  /** Test the API connection */
  async testConnection(): Promise<{ success: boolean; plan: string; modelCount: number; error?: string }> {
    try {
      const models = await this.listModels()
      return {
        success: true,
        plan: this.baseUrl.includes('/v2') ? 'vip' : 'free',
        modelCount: models.length,
      }
    } catch (e) {
      return {
        success: false,
        plan: 'unknown',
        modelCount: 0,
        error: e instanceof Error ? e.message : 'Erreur inconnue',
      }
    }
  }

  /** Chat completion (OpenAI-compatible) with retry on 504/502/500 */
  async chat(params: RoutesMeChatParams): Promise<RoutesMeChatResponse> {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 120_000)

        const res = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            temperature: params.temperature,
            max_tokens: params.max_tokens,
            stream: false,
          }),
        })
        clearTimeout(timeout)

        const rawText = await res.text()
        let data: any
        try {
          data = JSON.parse(rawText)
        } catch {
          // 504/502 from nginx returns HTML — retry
          const isGatewayError = res.status === 504 || res.status === 502 || res.status === 500
          if (isGatewayError && attempt < maxRetries) {
            const delay = attempt * 3000
            console.log(`[RoutesMe] Gateway ${res.status}, retry ${attempt + 1}/${maxRetries} in ${delay}ms...`)
            await new Promise(r => setTimeout(r, delay))
            continue
          }
          throw new Error(`RoutesMe: réponse invalide du serveur (HTTP ${res.status}). Réessayez.`)
        }

        if (!res.ok) {
          const errMsg = data?.error?.message || rawText.slice(0, 200)
          // Retry on gateway errors
          const isRetryable = res.status === 504 || res.status === 502 || res.status === 500 || res.status === 429
          if (isRetryable && attempt < maxRetries) {
            const delay = res.status === 429 ? 5000 : attempt * 3000
            console.log(`[RoutesMe] ${res.status} (${errMsg.slice(0, 50)}), retry ${attempt + 1}/${maxRetries} in ${delay}ms...`)
            await new Promise(r => setTimeout(r, delay))
            continue
          }
          throw new Error(`RoutesMe ${res.status}: ${errMsg}`)
        }

        return data as RoutesMeChatResponse
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        if (lastError.name === 'AbortError' && attempt < maxRetries) {
          console.log(`[RoutesMe] Timeout, retry ${attempt + 1}/${maxRetries}...`)
          continue
        }
        throw lastError
      }
    }
    throw lastError || new Error('RoutesMe: échec après retries')
  }

  /** Simple one-shot chat */
  async chatSimple(prompt: string, system?: string, model?: string): Promise<string> {
    const messages: ChatMessage[] = []
    if (system) messages.push({ role: 'system', content: system })
    messages.push({ role: 'user', content: prompt })

    const resp = await this.chat({
      model: model || 'GLM5.2R',
      messages,
      temperature: 0.3,
      max_tokens: 4000,
    })

    return resp.choices[0]?.message?.content || ''
  }
}

// ─── Public API ──────────────────────────────────────────────────

/** Get a RoutesMe client from saved config or env */
export function getRoutesMeClient(): RoutesMeClient | null {
  const config = loadConfig()
  if (!config) return null
  return new RoutesMeClient(config)
}

/** Check if RoutesMe is configured */
export function isRoutesMeConfigured(): boolean {
  return loadConfig() !== null
}

/** Save RoutesMe config (for UI settings) */
export function saveRoutesMeConfig(apiKey: string, plan: 'free' | 'vip' = 'free'): void {
  saveConfig({ apiKey, plan })
}

/** Get saved config without creating client */
export function getRoutesMeConfig(): RoutesMeConfig | null {
  return loadConfig()
}

/** Clear RoutesMe config */
export function clearRoutesMeConfig(): void {
  try {
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE)
    }
  } catch { /* skip */ }
}

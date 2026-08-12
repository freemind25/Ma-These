/**
 * retry-with-backoff.ts
 * ─────────────────────────────────────────────
 * Utilitaire de retry avec backoff exponentiel et jitter.
 * Détecte automatiquement les erreurs ResourceExhausted / rate-limit.
 *
 * Usage :
 *   import { withRetry } from '@/lib/retry-with-backoff'
 *   const result = await withRetry(() => zai.chat.completions.create({…}), { maxRetries: 5 })
 */

// ─── Types ───────────────────────────────────────────────────────

export interface RetryOptions {
  /** Nombre maximum de tentatives (défaut : 5) */
  maxRetries?: number
  /** Délai initial en ms avant le 1er retry (défaut : 1000) */
  baseDelay?: number
  /** Délai maximum en ms (défaut : 20000) */
  maxDelay?: number
  /** Timeout global en ms pour toute la chaîne de tentatives (défaut : 60000) */
  timeoutMs?: number
  /** Codes d'erreur qui déclenchent un retry */
  retryableCodes?: string[]
  /** Codes HTTP qui déclenchent un retry */
  retryableStatuses?: number[]
  /** Callback appelé à chaque tentative échouée */
  onRetry?: (attempt: number, error: unknown, delay: number) => void
}

// ─── Pre-configured timeout presets (FreeFlow-inspired) ─────────────
// Per-operation timeout configs to avoid one-size-fits-all.

export const TIMEOUT_PRESETS = {
  /** Fast operations: transcription, simple API calls */
  transcription: { timeoutMs: 20_000, maxRetries: 2, baseDelay: 2000 },
  /** Medium operations: LLM post-processing, text cleanup */
  postProcessing: { timeoutMs: 30_000, maxRetries: 3, baseDelay: 1000 },
  /** Heavy operations: full AI generation, consensus */
  aiGeneration: { timeoutMs: 60_000, maxRetries: 3, baseDelay: 2000 },
  /** Long operations: export, pipeline */
  export: { timeoutMs: 120_000, maxRetries: 2, baseDelay: 5000 },
} as const

// ─── Default options ─────────────────────────────────────────────

const DEFAULTS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 20000,
  timeoutMs: 60_000,
  retryableCodes: [
    'ResourceExhausted',
    'TooManyRequests',
    'ServiceUnavailable',
    'RATE_LIMIT',
    'rate_limit_exceeded',
    'overloaded',
  ],
  retryableStatuses: [429, 502, 503, 504],
}

// ─── Helpers ─────────────────────────────────────────────────────

function extractErrorCode(error: unknown): string {
  if (!error) return ''
  if (typeof error === 'string') return error
  const err = error as Record<string, unknown>
  if (err.Code && typeof err.Code === 'string') return err.Code
  if (err.code && typeof err.code === 'string') return err.code
  if (err.error && typeof err.error === 'object') {
    const sub = err.error as Record<string, unknown>
    if (sub.code) return String(sub.code)
    if (sub.type) return String(sub.type)
  }
  const msg = err.message ? String(err.message) : String(error)
  return msg
}

function extractStatus(error: unknown): number | undefined {
  const err = error as Record<string, unknown>
  if (typeof err.status === 'number') return err.status
  if (typeof err.statusCode === 'number') return err.statusCode
  return undefined
}

function isRetryable(error: unknown, options: Required<Omit<RetryOptions, 'onRetry'>>): boolean {
  const code = extractErrorCode(error).toLowerCase()
  const status = extractStatus(error)
  const matchesCode = options.retryableCodes.some(c => code.toLowerCase().includes(c.toLowerCase()))
  const matchesStatus = status !== undefined && options.retryableStatuses.includes(status)
  return matchesCode || matchesStatus
}

// ─── Main function ───────────────────────────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULTS, ...options }
  let lastError: unknown

  const deadline = opts.timeoutMs ? Date.now() + opts.timeoutMs : Infinity

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    // Check global timeout before each attempt
    if (Date.now() >= deadline) {
      throw new Error(`Retry chain timed out after ${opts.timeoutMs}ms (${attempt} attempts)`)
    }
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt >= opts.maxRetries) break
      if (!isRetryable(error, opts)) break

      const expDelay = opts.baseDelay * Math.pow(2, attempt)
      const jitter = Math.random() * 800
      const delay = Math.min(expDelay + jitter, opts.maxDelay)

      const code = extractErrorCode(error)
      console.warn(
        `[Retry] Tentative ${attempt + 1}/${opts.maxRetries} échouée ` +
        `(code: ${code || 'inconnu'}). ` +
        `Nouvel essai dans ${Math.round(delay)}ms…`
      )
      opts.onRetry?.(attempt + 1, error, delay)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return withRetry(async () => {
    const res = await fetch(input, init)
    if (
      (options?.retryableStatuses?.includes(res.status)) ||
      DEFAULTS.retryableStatuses.includes(res.status)
    ) {
      const body = await res.text().catch(() => '')
      const err = new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
      ;(err as any).status = res.status
      ;(err as any).statusCode = res.status
      throw err
    }
    return res
  }, options)
}

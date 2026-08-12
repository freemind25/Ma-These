/**
 * In-memory sliding-window rate limiter for API routes.
 *
 * No external dependencies — uses a Map with periodic cleanup.
 * Per-route-type limits: AI-heavy routes get stricter limits.
 *
 * Headers returned:
 *   X-RateLimit-Limit     — max requests per window
 *   X-RateLimit-Remaining — requests left in current window
 *   X-RateLimit-Reset     — seconds until window resets
 */

interface RateLimitEntry {
  count: number
  resetAt: number // epoch ms
}

// ─── Configuration per route category ──────────────────────────────────

const LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  // AI endpoints — expensive, stricter
  ai:          { windowMs: 60_000, maxRequests: 30 },
  // Auth endpoints — prevent brute force
  auth:        { windowMs: 60_000, maxRequests: 20 },
  // General API — moderate
  default:     { windowMs: 60_000, maxRequests: 60 },
  // Heavy export/generation — very strict
  export:      { windowMs: 60_000, maxRequests: 10 },
}

// Route prefix → category mapping
const ROUTE_CATEGORIES: Array<{ prefixes: string[]; category: string }> = [
  {
    prefixes: [
      'ai-writing', 'ai-aggregate', 'ai-status',
      'directeur', 'directeur-chat',
      'thesis-assistant', 'guidance', 'humanizer',
      'grammar-check', 'harper-lint', 'consensus',
      'literature-search', 'cadrage', 'journal-finder',
      'automation', 'asr', 'thesis-search',
    ],
    category: 'ai',
  },
  {
    prefixes: [
      'auth', 'mendeley/auth', 'mendeley/callback', 'cloud-drive/callback',
    ],
    category: 'auth',
  },
  {
    prefixes: [
      'export-pdf', 'generate-latex', 'office', 'download',
    ],
    category: 'export',
  },
]

function getCategory(slug: string[]): string {
  const path = slug.join('/')
  for (const { prefixes, category } of ROUTE_CATEGORIES) {
    if (prefixes.some(p => path === p || path.startsWith(p + '/'))) {
      return category
    }
  }
  return 'default'
}

// ─── In-memory store with TTL cleanup ──────────────────────────────────

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60_000).unref() // Don't prevent process exit

// ─── Main rate-limit check ─────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetSeconds: number
  headers: Record<string, string>
}

export function checkRateLimit(
  request: Request,
  slug: string[],
): RateLimitResult {
  const category = getCategory(slug)
  const config = LIMITS[category] || LIMITS.default

  // Build identifier: IP + route path
  // Use X-Forwarded-For if behind a proxy, fallback to remote address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const path = slug.join('/')
  const key = `${ip}:${path}`

  const now = Date.now()

  let entry = store.get(key)
  if (!entry || now >= entry.resetAt) {
    // New window
    entry = { count: 0, resetAt: now + config.windowMs }
    store.set(key, entry)
  }

  entry.count++
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000)

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetSeconds),
  }

  return {
    allowed: entry.count <= config.maxRequests,
    limit: config.maxRequests,
    remaining,
    resetSeconds,
    headers,
  }
}

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — In-memory Sliding Window Rate Limiter
// Protects AI routes from abuse (cost control).
// No external dependencies — pure in-memory Map.
// ═══════════════════════════════════════════════════════════════

interface RateLimitEntry {
  timestamps: number[];
}

/**
 * Rate limit configuration per route pattern.
 * - windowMs: time window in milliseconds
 * - maxRequests: maximum requests allowed in the window
 */
export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

// In-memory store (per IP + route pattern)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

/**
 * Default rate limit rules by route pattern.
 * Applied in order — first match wins.
 */
export const RATE_LIMIT_RULES: Array<{ pattern: RegExp; rule: RateLimitRule }> = [
  // Heavy AI routes (2 passes) — stricter limit
  { pattern: /^\/api\/coherence-check/, rule: { windowMs: 300_000, maxRequests: 5 } },  // 5 req/5min
  { pattern: /^\/api\/deep-research/, rule: { windowMs: 300_000, maxRequests: 3 } },    // 3 req/5min

  // Standard AI routes
  { pattern: /^\/api\/ai-writing/, rule: { windowMs: 300_000, maxRequests: 20 } },   // 20 req/5min
  { pattern: /^\/api\/directeur-chat/, rule: { windowMs: 300_000, maxRequests: 20 } }, // 20 req/5min
  { pattern: /^\/api\/text-prediction/, rule: { windowMs: 60_000, maxRequests: 30 } }, // 30 req/1min
  { pattern: /^\/api\/thesis-rag/, rule: { windowMs: 300_000, maxRequests: 15 } },   // 15 req/5min
  { pattern: /^\/api\/verification-/, rule: { windowMs: 300_000, maxRequests: 10 } }, // 10 req/5min
  { pattern: /^\/api\/paper2code/, rule: { windowMs: 300_000, maxRequests: 5 } },   // 5 req/5min

  // AI test endpoint (used during configuration)
  { pattern: /^\/api\/ai-test/, rule: { windowMs: 60_000, maxRequests: 10 } },     // 10 req/1min
  { pattern: /^\/api\/ai-models/, rule: { windowMs: 60_000, maxRequests: 20 } },   // 20 req/1min
  { pattern: /^\/api\/ai-probe/, rule: { windowMs: 300_000, maxRequests: 5 } },    // 5 req/5min

  // Default: no rate limiting for non-AI routes
];

/**
 * Find the matching rate limit rule for a given pathname.
 */
export function getRateLimitRule(pathname: string): RateLimitRule | null {
  for (const { pattern, rule } of RATE_LIMIT_RULES) {
    if (pattern.test(pathname)) return rule;
  }
  return null;
}

/**
 * Check if a request is rate-limited.
 * Returns { limited: false } or { limited: true, retryAfterMs }.
 */
export function checkRateLimit(
  key: string,  // e.g. "ip:pathname"
  rule: RateLimitRule
): { limited: false } | { limited: true; retryAfterMs: number } {
  const now = Date.now();

  // Periodic cleanup
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [k, entry] of store) {
      // Remove timestamps outside any rule's window
      entry.timestamps = entry.timestamps.filter(
        (t) => now - t < rule.windowMs
      );
      if (entry.timestamps.length === 0) store.delete(k);
    }
  }

  const entry = store.get(key);
  if (!entry) {
    store.set(key, { timestamps: [now] });
    return { limited: false };
  }

  // Slide the window
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < rule.windowMs
  );

  if (entry.timestamps.length >= rule.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + rule.windowMs - now;
    return { limited: true, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { limited: false };
}

/**
 * Extract client IP from request headers.
 * Falls back to "unknown" if no IP can be determined.
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "unknown";
}

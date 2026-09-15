import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, getRateLimitRule, RATE_LIMIT_RULES, type RateLimitRule } from './rate-limit'

// Helper to reset the in-memory store between tests
// We test via different keys to avoid cross-test contamination.
// The store is a module-level Map, so we use unique keys per test.

describe('rate-limit', () => {
  describe('checkRateLimit', () => {
    it('allows requests under the limit', () => {
      const rule: RateLimitRule = { windowMs: 60_000, maxRequests: 5 }
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(`test-under-${Date.now()}-${i}`, rule)
        expect(result.limited).toBe(false)
      }
    })

    it('returns 429 on the 6th request when limit is 5', () => {
      const key = `test-429-${Date.now()}`
      const rule: RateLimitRule = { windowMs: 300_000, maxRequests: 5 }

      // Send 5 requests — all should pass
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(key, rule)
        expect(result.limited).toBe(false)
      }

      // 6th request should be rate-limited
      const result = checkRateLimit(key, rule)
      expect(result.limited).toBe(true)
      if (result.limited) {
        // Verify Retry-After value is a positive number of seconds
        expect(result.retryAfterMs).toBeGreaterThan(0)
        // The retryAfterMs should be <= windowMs
        expect(result.retryAfterMs).toBeLessThanOrEqual(rule.windowMs)
      }
    })

    it('returns retryAfterMs reflecting time until oldest request expires', () => {
      const key = `test-retry-${Date.now()}`
      const rule: RateLimitRule = { windowMs: 100_000, maxRequests: 2 }

      // First two requests pass
      checkRateLimit(key, rule)
      checkRateLimit(key, rule)

      // Third is limited
      const limited = checkRateLimit(key, rule)
      expect(limited.limited).toBe(true)
      if (limited.limited) {
        // retryAfterMs should be close to windowMs (since first request was just made)
        // Allow 1s tolerance for test execution time
        expect(limited.retryAfterMs).toBeGreaterThan(99_000)
        expect(limited.retryAfterMs).toBeLessThanOrEqual(100_000)
      }
    })

    it('allows requests from different keys independently', () => {
      const rule: RateLimitRule = { windowMs: 60_000, maxRequests: 1 }

      const r1 = checkRateLimit('user-alice', rule)
      expect(r1.limited).toBe(false)

      const r2 = checkRateLimit('user-bob', rule)
      expect(r2.limited).toBe(false)

      // Alice's 2nd request is limited
      const r3 = checkRateLimit('user-alice', rule)
      expect(r3.limited).toBe(true)

      // Bob's 2nd request is also limited
      const r4 = checkRateLimit('user-bob', rule)
      expect(r4.limited).toBe(true)
    })
  })

  describe('getRateLimitRule', () => {
    it('returns a rule for coherence-check', () => {
      const rule = getRateLimitRule('/api/coherence-check')
      expect(rule).not.toBeNull()
      expect(rule!.maxRequests).toBe(5)
      expect(rule!.windowMs).toBe(300_000) // 5 min
    })

    it('returns a stricter rule for deep-research', () => {
      const rule = getRateLimitRule('/api/deep-research')
      expect(rule).not.toBeNull()
      expect(rule!.maxRequests).toBe(3)
      expect(rule!.windowMs).toBe(300_000)
    })

    it('returns null for non-AI routes', () => {
      const rule = getRateLimitRule('/api/thesis')
      expect(rule).toBeNull()
    })

    it('returns a rule for ai-writing', () => {
      const rule = getRateLimitRule('/api/ai-writing')
      expect(rule).not.toBeNull()
      expect(rule!.maxRequests).toBe(20)
    })

    it('returns a rule for text-prediction with 1-min window', () => {
      const rule = getRateLimitRule('/api/text-prediction')
      expect(rule).not.toBeNull()
      expect(rule!.maxRequests).toBe(30)
      expect(rule!.windowMs).toBe(60_000) // 1 min
    })
  })

  describe('coherence-check rate limit scenario', () => {
    it('6th call to coherence-check returns 429 with valid retryAfterMs', () => {
      const ip = 'test-campus-ip'
      const pathname = '/api/coherence-check'
      const rule = getRateLimitRule(pathname)!
      const key = `${ip}:${pathname}`

      // Simulate 5 requests from the same IP — all pass
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(key, rule)
        expect(result.limited).toBe(false)
      }

      // 6th request — should be rate-limited
      const result = checkRateLimit(key, rule)
      expect(result.limited).toBe(true)
      if (result.limited) {
        // Retry-After should be calculable in seconds
        const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000)
        expect(retryAfterSeconds).toBeGreaterThan(0)
        // For a 5-min window with requests made near-simultaneously,
        // retry should be close to 300s
        expect(retryAfterSeconds).toBeGreaterThanOrEqual(298)
        expect(retryAfterSeconds).toBeLessThanOrEqual(300)
      }
    })
  })

  describe('RATE_LIMIT_RULES coverage', () => {
    it('has rules for all expected AI route patterns', () => {
      const expectedPatterns = [
        '/api/coherence-check',
        '/api/deep-research',
        '/api/ai-writing',
        '/api/directeur-chat',
        '/api/text-prediction',
        '/api/thesis-rag',
        '/api/verification-',
        '/api/paper2code',
        '/api/ai-test',
        '/api/ai-models',
        '/api/ai-probe',
      ]

      for (const pattern of expectedPatterns) {
        const rule = getRateLimitRule(pattern)
        expect(rule, `Expected rule for ${pattern}`).not.toBeNull()
      }
    })
  })
})

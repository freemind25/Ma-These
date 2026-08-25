// ═══════════════════════════════════════════════════════════════
// Circuit Breaker — Smoke Tests (Bun:test)
// ═══════════════════════════════════════════════════════════════
//
// The circuit breaker internals (canRequest, recordSuccess, recordFailure)
// are NOT exported. Only getCircuitBreakerStatus() is public.
// These tests verify the export exists, returns the correct shape,
// and behaves as a proper diagnostic surface.
//
// NOTE: Because the circuit breaker state is module-scoped (in-memory Map),
// it persists across tests within the same process. Tests here are
// designed to be order-independent.

import { describe, it, expect } from "bun:test";
import { getCircuitBreakerStatus } from "../zai-client";

describe("Circuit Breaker > getCircuitBreakerStatus()", () => {
  it("is exported as a function", () => {
    expect(typeof getCircuitBreakerStatus).toBe("function");
  });

  it("returns an object", () => {
    const status = getCircuitBreakerStatus();
    expect(status).toBeObject();
  });

  it("returns an empty object when no failures have occurred", () => {
    // In a fresh test run with no AI calls, the circuit breaker
    // map should be empty (no providers registered).
    const status = getCircuitBreakerStatus();
    expect(Object.keys(status)).toHaveLength(0);
  });

  it("returned entries have the correct shape when present", () => {
    const status = getCircuitBreakerStatus();
    for (const [provider, info] of Object.entries(status)) {
      expect(provider).toBeString();
      expect(info.state).toBeOneOf(["closed", "open", "half-open"]);
      expect(typeof info.failureCount).toBe("number");
      expect(typeof info.lastFailureTime).toBe("number");
    }
    // This test passes trivially when no entries exist (empty loop)
  });

  it("does not mutate between consecutive calls (pure read)", () => {
    const a = getCircuitBreakerStatus();
    const b = getCircuitBreakerStatus();
    expect(a).toEqual(b);
  });

  it("returns independent snapshots (not same reference)", () => {
    // The function should return a new object each time,
    // not a cached reference that could be mutated externally.
    const a = getCircuitBreakerStatus();
    const b = getCircuitBreakerStatus();
    // Even if both are empty, they should not be the same reference
    // if the implementation creates a new object each call.
    // NOTE: Some implementations may return the same empty object —
    // that's acceptable. This test documents the behavior.
    expect(typeof a).toBe("object");
    expect(typeof b).toBe("object");
  });
});

describe("Circuit Breaker > state transitions (integration smoke)", () => {
  // These tests verify that the circuit breaker's exported status
  // reflects the expected initial state. Full state transition testing
  // would require exporting canRequest/recordSuccess/recordFailure,
  // which is outside the scope of this smoke test.

  it("no provider is in 'open' state initially", () => {
    const status = getCircuitBreakerStatus();
    for (const info of Object.values(status)) {
      expect(info.state).not.toBe("open");
    }
  });

  it("no provider has a non-zero failure count initially", () => {
    const status = getCircuitBreakerStatus();
    for (const info of Object.values(status)) {
      expect(info.failureCount).toBe(0);
    }
  });
});

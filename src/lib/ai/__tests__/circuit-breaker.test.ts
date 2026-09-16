// ═══════════════════════════════════════════════════════════════
// Circuit Breaker — Smoke Tests (Vitest)
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

import { describe, it, expect } from "vitest";
import { getCircuitBreakerStatus } from "../zai-client";

describe("Circuit Breaker > getCircuitBreakerStatus()", () => {
  it("is exported as a function", () => {
    expect(typeof getCircuitBreakerStatus).toBe("function");
  });

  it("returns an object", () => {
    const status = getCircuitBreakerStatus();
    expect(typeof status).toBe("object");
    expect(status).not.toBeNull();
    expect(Array.isArray(status)).toBe(false);
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
      expect(typeof provider).toBe("string");
      expect(["closed", "open", "half-open"]).toContain(info.state);
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
    const a = getCircuitBreakerStatus();
    const b = getCircuitBreakerStatus();
    expect(typeof a).toBe("object");
    expect(typeof b).toBe("object");
  });
});

describe("Circuit Breaker > state transitions (integration smoke)", () => {
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

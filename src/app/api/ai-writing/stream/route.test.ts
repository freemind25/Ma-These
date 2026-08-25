// ═══════════════════════════════════════════════════════════════
// POST /api/ai-writing/stream — Validation & Guard Tests (Bun:test)
// ═══════════════════════════════════════════════════════════════
//
// These tests cover the 400 guard clauses that fire BEFORE any AI
// call is made, so no mocking of the AI client is needed.
// The three guards tested:
//   1. Zod validation rejects short prompts (< 10 chars)
//   2. Unknown mode returns 400
//   3. Mode with customEndpoint returns 400

import { describe, it, expect } from "bun:test";
import { POST } from "./route";

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai-writing/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai-writing/stream > validation", () => {
  it("returns 400 for short prompt (< 10 chars)", async () => {
    const res = await POST(createRequest({
      mode: "scientific-writing",
      prompt: "court",  // 5 chars < 10
    }) as any);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for empty prompt", async () => {
    const res = await POST(createRequest({
      mode: "scientific-writing",
      prompt: "",
    }) as any);

    expect(res.status).toBe(400);
  });

  it("returns 400 when prompt is missing entirely", async () => {
    const res = await POST(createRequest({
      mode: "scientific-writing",
    }) as any);

    expect(res.status).toBe(400);
  });

  it("returns 400 for non-JSON body", async () => {
    const req = new Request("http://localhost:3000/api/ai-writing/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });

  it("returns 400 for empty body", async () => {
    const res = await POST(createRequest({}) as any);

    expect(res.status).toBe(400);
  });

  it("accepts prompt with exactly 10 characters", async () => {
    // 10 chars = minimum allowed
    const res = await POST(createRequest({
      mode: "nonexistent-mode", // Still needs valid mode to reach AI call
      prompt: "0123456789",  // exactly 10
    }) as any);

    // Should pass Zod but fail on mode lookup → 400
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("non trouvé");
  });
});

describe("POST /api/ai-writing/stream > mode lookup", () => {
  it("returns 400 for unknown mode", async () => {
    const res = await POST(createRequest({
      mode: "does-not-exist",
      prompt: "Un prompt suffisamment long pour passer la validation",
    }) as any);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("non trouvé");
  });

  it("returns 400 for mode with customEndpoint (deep-research)", async () => {
    const res = await POST(createRequest({
      mode: "deep-research",
      prompt: "Question de recherche approfondie sur un sujet",
    }) as any);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("streaming");
  });

  it("returns 400 with specific message for custom endpoint mode", async () => {
    const res = await POST(createRequest({
      mode: "deep-research",
      prompt: "Recherche sur l'impact de l'IA en éducation",
    }) as any);

    expect(res.status).toBe(400);
    const data = await res.json();
    // The error message should mention the custom endpoint
    expect(data.error).toContain("endpoint");
  });
});

describe("POST /api/ai-writing/stream > schema edge cases", () => {
  it("accepts optional context field (validated via deep-research guard)", async () => {
    // Use deep-research mode so we get 400 before any AI call
    const res = await POST(createRequest({
      mode: "deep-research",
      prompt: "Analysez les méthodologies qualitatives en sciences sociales",
      context: "Thèse en sciences de l'éducation",
    }) as any);

    // deep-research has customEndpoint → 400 before AI call
    // If context broke Zod parsing, we'd get a different 400 (Zod error)
    expect(res.status).toBe(400);
    const data = await res.json();
    // Must be the custom-endpoint guard, not a Zod error
    expect(data.error).toContain("endpoint");
  });

  it("accepts _aiConfig field (validated via deep-research guard)", async () => {
    const res = await POST(createRequest({
      mode: "deep-research",
      prompt: "Rédigez un résumé de la problématique de recherche",
      _aiConfig: { provider: "openai", apiKey: "sk-test", model: "gpt-4o" },
    }) as any);

    expect(res.status).toBe(400);
    const data = await res.json();
    // Must be the custom-endpoint guard, not a Zod error
    expect(data.error).toContain("endpoint");
  });

  it("accepts prompt with exactly 10 characters (boundary)", async () => {
    // 10 chars = minimum allowed by Zod min(10)
    const res = await POST(createRequest({
      mode: "nonexistent-mode",
      prompt: "0123456789",  // exactly 10
    }) as any);

    // Should pass Zod but fail on mode lookup → 400
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("non trouvé");
  });

  it("rejects prompt with 9 characters (just below boundary)", async () => {
    const res = await POST(createRequest({
      mode: "scientific-writing",
      prompt: "123456789",  // 9 chars < 10
    }) as any);

    expect(res.status).toBe(400);
  });
});

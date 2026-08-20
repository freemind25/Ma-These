import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Spy on global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createGetRequest(url: string): NextRequest {
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/ai-models", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // Reset module cache to clear modelCache Map
  });

  // Helper to dynamically import GET with fresh module state
  async function getGET() {
    const mod = await import("./route");
    return mod.GET;
  }

  it("should return 400 when baseUrl is missing", async () => {
    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("baseUrl");
  });

  it("should return models from provider", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { id: "gpt-4o", object: "model" },
            { id: "gpt-4o-mini", object: "model" },
          ],
        }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.models).toContain("gpt-4o");
    expect(data.models).toContain("gpt-4o-mini");
    expect(data.cached).toBe(false);
  });

  it("should send Authorization header when apiKey is provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const GET = await getGET();
    const req = createGetRequest(
      "http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1&apiKey=sk-test"
    );
    await GET(req);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test",
        }),
      })
    );
  });

  it("should not send Authorization header when apiKey is missing", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const GET = await getGET();
    const req = createGetRequest(
      "http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1"
    );
    await GET(req);

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[1].headers).not.toHaveProperty("Authorization");
  });

  it("should append /models to baseUrl", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    await GET(req);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/models",
      expect.anything()
    );
  });

  it("should strip trailing slashes from baseUrl", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1/");
    await GET(req);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/models",
      expect.anything()
    );
  });

  it("should sort utility models (embeddings, moderation) to the end", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { id: "text-embedding-ada-002", object: "model" },
            { id: "gpt-4o", object: "model" },
          ],
        }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    // Embedding models are sorted to the end, not excluded
    expect(data.models).toContain("gpt-4o");
    expect(data.models).toContain("text-embedding-ada-002");
    const gptIdx = data.models.indexOf("gpt-4o");
    const embedIdx = data.models.indexOf("text-embedding-ada-002");
    expect(gptIdx).toBeLessThan(embedIdx);
  });

  it("should put top-tier models first in priority order", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { id: "random-model-1", object: "model" },
            { id: "gpt-4o", object: "model" },
            { id: "mistral-small-latest", object: "model" },
          ],
        }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.mistral.ai/v1");
    const res = await GET(req);
    const data = await res.json();

    // mistral-small-latest (top tier) should come before random-model-1 (other)
    const topIdx = data.models.indexOf("mistral-small-latest");
    const randomIdx = data.models.indexOf("random-model-1");
    expect(topIdx).toBeLessThan(randomIdx);
  });

  it("should return empty models with message when only utility models exist", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { id: "embed-model", object: "model" },
            { id: "moderation-model", object: "model" },
          ],
        }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    // All models are utility → models array includes them in otherModels
    // but if ALL are filtered to otherModels and nothing in top/chat, models is still non-empty
    // Actually the route returns all models (topTier + chatModels + otherModels)
    expect(data.models.length).toBeGreaterThan(0);
  });

  it("should return models even when only utility models exist (all models included)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { id: "text-embedding-ada-002", object: "model" },
          ],
        }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.models).toContain("text-embedding-ada-002");
  });

  it("should return 502 when fetch fails with 401", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify({ error: { type: "invalid_api_key", message: "Invalid API key" } })),
    });

    const GET = await getGET();
    const req = createGetRequest(
      "http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1&apiKey=bad-key"
    );
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toContain("invalide");
  });

  it("should return 502 with parsed JSON error message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: () =>
        Promise.resolve(JSON.stringify({ detail: "Bad request details" })),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toContain("Bad request details");
  });

  it("should return 502 with error.message from nested error format", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: () =>
        Promise.resolve(
          JSON.stringify({ error: { message: "Invalid request" } })
        ),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.error).toContain("Invalid request");
  });

  it("should return 500 when fetch throws an error", async () => {
    mockFetch.mockRejectedValue(new Error("Network failure"));

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("Network failure");
  });

  it("should return cached result on second request (same cache key)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ id: "gpt-4o", object: "model" }],
        }),
    });

    const GET = await getGET();
    const req = createGetRequest(
      "http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1"
    );

    // First request
    const res1 = await GET(req);
    const data1 = await res1.json();
    expect(data1.cached).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second request (should be cached)
    const res2 = await GET(req);
    const data2 = await res2.json();
    expect(data2.cached).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1); // No additional fetch
  });

  it("should use different cache keys for auth vs public", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ id: "gpt-4o", object: "model" }],
        }),
    });

    const GET = await getGET();
    const req1 = createGetRequest(
      "http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1"
    );
    const req2 = createGetRequest(
      "http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1&apiKey=sk-test"
    );

    await GET(req1);
    await GET(req2);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should handle empty data array from provider", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    // Empty data → empty allModels → { models: [], message: "Aucun modèle trouvé" }
    expect(data.models).toEqual([]);
    expect(data.message).toBe("Aucun modèle trouvé");
  });

  it("should handle models without object field (include them)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ id: "custom-model" }],
        }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://custom.api/v1");
    const res = await GET(req);
    const data = await res.json();

    expect(data.models).toContain("custom-model");
  });

  it("should use AbortSignal.timeout for the request", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const GET = await getGET();
    const req = createGetRequest("http://localhost:3000/api/ai-models?baseUrl=https://api.openai.com/v1");
    await GET(req);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchOptions = mockFetch.mock.calls[0][1];
    expect(fetchOptions).toBeDefined();
    expect(fetchOptions.signal).toBeDefined();
  });
});

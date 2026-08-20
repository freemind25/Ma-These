import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { generateCompletion } from "@/lib/ai/zai-client";

// ── Mocks ───────────────────────────────────────────────────────────────
vi.mock("@/lib/ai/zai-client", () => ({
  generateCompletion: vi.fn(),
}));

const mockGenerateCompletion = vi.mocked(generateCompletion);

// Helper to create a NextRequest-like object
function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai-writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai-writing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Success cases ─────────────────────────────────────────────────────
  it("should return 200 with generated content for a valid request", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "Generated scientific text",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({
        mode: "scientific-writing",
        prompt: "Rédigez une introduction sur l'urbanisme durable",
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.content).toBe("Generated scientific text");
    expect(data.data.mode).toBe("scientific-writing");
    expect(data.data.model).toBe("default");
  });

  it("should pass context to the AI when provided", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "Generated text with context",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({
        mode: "scientific-writing",
        prompt: "Rédigez une introduction sur l'urbanisme durable",
        context: "Thèse en architecture",
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({
            role: "system",
            content: expect.stringContaining("CONTEXTE ADDITIONNEL"),
          }),
          expect.objectContaining({ role: "user" }),
        ]),
      })
    );
  });

  it("should pass providerConfig when _aiConfig is provided", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "text",
      model: "gpt-4o",
      provider: "openai",
    });

    const aiConfig = { provider: "openai" as const, apiKey: "sk-test", model: "gpt-4o" };
    const res = await POST(
      createRequest({
        mode: "scientific-writing",
        prompt: "Rédigez une introduction sur l'urbanisme durable",
        _aiConfig: aiConfig,
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.model).toBe("gpt-4o");
    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ providerConfig: aiConfig })
    );
  });

  it("should pass temperature from the writing mode", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "text",
      model: "default",
      provider: "zai",
    });

    await POST(
      createRequest({
        mode: "scientific-writing", // temperature: 0.6
        prompt: "Rédigez une introduction sur l'urbanisme durable et la ville",
      }) as any
    );

    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.6 })
    );
  });

  it("should work with different valid modes", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "review text",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({
        mode: "literature-review",
        prompt: "Synthétisez la littérature sur les espaces publics urbains",
      }) as any
    );

    expect(res.status).toBe(200);
    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.5 })
    );
  });

  // ── Validation errors ──────────────────────────────────────────────────
  it("should return 400 for unknown mode", async () => {
    const res = await POST(
      createRequest({
        mode: "nonexistent-mode",
        prompt: "Rédigez une introduction sur l'urbanisme durable et la ville",
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("non trouvé");
    expect(data.availableModes).toBeInstanceOf(Array);
  });

  it("should return 500 when prompt is too short (< 10 chars)", async () => {
    const res = await POST(
      createRequest({
        mode: "scientific-writing",
        prompt: "court",
      }) as any
    );

    // Zod validation error → 500 (caught by general catch)
    expect(res.status).toBe(500);
  });

  it("should return 500 when prompt is missing", async () => {
    const res = await POST(
      createRequest({
        mode: "scientific-writing",
      }) as any
    );

    expect(res.status).toBe(500);
  });

  it("should return 500 when body is empty", async () => {
    const res = await POST(
      createRequest({}) as any
    );

    expect(res.status).toBe(500);
  });

  it("should return 500 when body is not valid JSON", async () => {
    const req = new Request("http://localhost:3000/api/ai-writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as any);

    expect(res.status).toBe(500);
  });

  // ── AI error cases ────────────────────────────────────────────────────
  it("should return 500 when generateCompletion throws an error", async () => {
    mockGenerateCompletion.mockRejectedValue(new Error("API connection failed"));

    const res = await POST(
      createRequest({
        mode: "scientific-writing",
        prompt: "Rédigez une introduction sur l'urbanisme durable",
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("API connection failed");
  });

  it("should return 500 when generateCompletion throws a non-Error", async () => {
    mockGenerateCompletion.mockRejectedValue("string error");

    const res = await POST(
      createRequest({
        mode: "scientific-writing",
        prompt: "Rédigez une introduction sur l'urbanisme durable",
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Erreur lors de la génération");
  });

  it("should include system prompt from mode in the messages", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "text",
      model: "default",
      provider: "zai",
    });

    await POST(
      createRequest({
        mode: "scientific-writing",
        prompt: "Rédigez une introduction sur l'urbanisme durable",
      }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[0].content).toContain("rédaction scientifique");
  });
});

describe("GET /api/ai-writing", () => {
  it("should return a list of writing modes", async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("should include id, label, description, icon, category, placeholder for each mode", async () => {
    const res = await GET();
    const data = await res.json();

    for (const mode of data.data) {
      expect(mode).toHaveProperty("id");
      expect(mode).toHaveProperty("label");
      expect(mode).toHaveProperty("description");
      expect(mode).toHaveProperty("icon");
      expect(mode).toHaveProperty("category");
      expect(mode).toHaveProperty("placeholder");
    }
  });

  it("should NOT include systemPrompt or temperature in the response", async () => {
    const res = await GET();
    const data = await res.json();

    for (const mode of data.data) {
      expect(mode).not.toHaveProperty("systemPrompt");
      expect(mode).not.toHaveProperty("temperature");
    }
  });

  it("should have categories from the WritingMode category type", async () => {
    const res = await GET();
    const data = await res.json();

    const categories = data.data.map((m: any) => m.category);
    const validCategories = ["writing", "analysis", "review", "generation"];
    for (const cat of categories) {
      expect(validCategories).toContain(cat);
    }
  });
});

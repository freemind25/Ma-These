import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { generateCompletion } from "@/lib/ai/zai-client";

// ── Mocks ───────────────────────────────────────────────────────────────
vi.mock("@/lib/ai/zai-client", () => ({
  generateCompletion: vi.fn(),
}));

const mockGenerateCompletion = vi.mocked(generateCompletion);

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/text-prediction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/text-prediction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Success cases ─────────────────────────────────────────────────────
  it("should return primary and alternatives for valid response", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "significatifs observés sont conformes|||mesurés dépassent les attentes|||obtenus valident notre hypothèse",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({
        text: "Les résultats de cette étude montrent que les effets",
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.primary).toBe("significatifs observés sont conformes");
    expect(data.alternatives).toHaveLength(2);
    expect(data.alternatives[0]).toBe("mesurés dépassent les attentes");
    expect(data.alternatives[1]).toBe("obtenus valident notre hypothèse");
  });

  it("should strip quotes from predictions", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: '"un texte avec guillemets"|||\'un autre texte\'',
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({ text: "Ceci est un texte de test académique" }) as any
    );
    const data = await res.json();

    expect(data.primary).not.toMatch(/^["'«]/);
    expect(data.primary).not.toMatch(/["'»]$/);
  });

  it("should include context in the user prompt when provided", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "complétion principale|||alternative 1|||alternative 2",
      model: "default",
      provider: "zai",
    });

    await POST(
      createRequest({
        text: "Les résultats montrent que",
        context: "Contexte précédent de la thèse",
      }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: any) => m.role === "user");
    expect(userMsg.content).toContain("Contexte précédent");
  });

  it("should truncate text to last 400 chars", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "suite|||alt1|||alt2",
      model: "default",
      provider: "zai",
    });

    const longText = "a".repeat(500);
    await POST(
      createRequest({ text: longText }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: any) => m.role === "user");
    expect(userMsg.content).toContain("[Texte en cours]");
    // Should contain last 400 chars (the whole text is 'a's, so check it's not the full 500)
    const textPart = userMsg.content.split("[Texte en cours] : ...")[1];
    expect(textPart.length).toBeLessThanOrEqual(400);
  });

  it("should pass providerConfig when _aiConfig is provided", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "text|||alt1|||alt2",
      model: "default",
      provider: "zai",
    });
    const aiConfig = { provider: "openai" as const, apiKey: "sk-test", model: "gpt-4o" };

    await POST(
      createRequest({ text: "texte de test académique", _aiConfig: aiConfig }) as any
    );

    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ providerConfig: aiConfig })
    );
  });

  it("should use temperature 0.35 and maxTokens 120", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "text|||alt1|||alt2",
      model: "default",
      provider: "zai",
    });

    await POST(
      createRequest({ text: "texte de test académique" }) as any
    );

    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.35, maxTokens: 120 })
    );
  });

  it("should include a system prompt about academic text prediction", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "text|||alt1|||alt2",
      model: "default",
      provider: "zai",
    });

    await POST(
      createRequest({ text: "texte de test académique" }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    const systemMsg = callArgs.messages.find((m: any) => m.role === "system");
    expect(systemMsg.content).toContain("prédiction de texte");
    expect(systemMsg.content).toContain("académique");
  });

  // ── Short text handling ────────────────────────────────────────────────
  it("should return primary:null and empty alternatives for text < 5 chars", async () => {
    const res = await POST(
      createRequest({ text: "abc" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.primary).toBeNull();
    expect(data.alternatives).toEqual([]);
    expect(mockGenerateCompletion).not.toHaveBeenCalled();
  });

  it("should return primary:null for whitespace-only text", async () => {
    const res = await POST(
      createRequest({ text: "     " }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.primary).toBeNull();
    expect(mockGenerateCompletion).not.toHaveBeenCalled();
  });

  it("should return primary:null for empty text", async () => {
    const res = await POST(
      createRequest({ text: "" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.primary).toBeNull();
  });

  it("should return primary:null for missing text field", async () => {
    const res = await POST(createRequest({}) as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.primary).toBeNull();
  });

  // ── Parsing edge cases ────────────────────────────────────────────────
  it("should handle AI returning only primary (no alternatives)", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "seule prédiction principale",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({ text: "texte de test académique" }) as any
    );
    const data = await res.json();

    expect(data.primary).toBe("seule prédiction principale");
    expect(data.alternatives).toEqual([]);
  });

  it("should handle AI returning more than 3 alternatives (limit to 3)", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "p1|||a1|||a2|||a3|||a4",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({ text: "texte de test académique" }) as any
    );
    const data = await res.json();

    expect(data.alternatives.length).toBeLessThanOrEqual(3);
  });

  it("should filter out empty alternatives", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "p1|||  |||a2",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({ text: "texte de test académique" }) as any
    );
    const data = await res.json();

    expect(data.alternatives).toEqual(["a2"]);
  });

  it("should handle AI returning empty content", async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: "",
      model: "default",
      provider: "zai",
    });

    const res = await POST(
      createRequest({ text: "texte de test académique" }) as any
    );
    const data = await res.json();

    expect(data.primary).toBeNull();
  });

  // ── Error cases ────────────────────────────────────────────────────────
  it("should return 500 when generateCompletion throws Error", async () => {
    mockGenerateCompletion.mockRejectedValue(new Error("API overloaded"));

    const res = await POST(
      createRequest({ text: "texte de test académique" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("API overloaded");
    expect(data.primary).toBeNull();
    expect(data.alternatives).toEqual([]);
  });

  it("should return 500 with generic message for non-Error throw", async () => {
    mockGenerateCompletion.mockRejectedValue("string error");

    const res = await POST(
      createRequest({ text: "texte de test académique" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Erreur de prédiction");
  });

  it("should return 500 for invalid JSON body", async () => {
    const req = new Request("http://localhost:3000/api/text-prediction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as any);

    expect(res.status).toBe(500);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { generateCompletion } from "@/lib/ai/zai-client";
import { DIRECTEUR_SYSTEM_PROMPT } from "@/data/directeur-prompt";
import { detectRelevantFiches, getFichesContentForPrompt } from "@/data/corpus-publication";

// ── Mocks ───────────────────────────────────────────────────────────────
vi.mock("@/lib/ai/zai-client", () => ({
  generateCompletion: vi.fn(),
}));

vi.mock("@/data/directeur-prompt", () => ({
  DIRECTEUR_SYSTEM_PROMPT: "You are Professor Jean-Marc Renaud.",
}));

vi.mock("@/data/corpus-publication", () => ({
  detectRelevantFiches: vi.fn(),
  getFichesContentForPrompt: vi.fn(),
}));

const mockGenerateCompletion = vi.mocked(generateCompletion);
const mockDetectRelevantFiches = vi.mocked(detectRelevantFiches);
const mockGetFichesContentForPrompt = vi.mocked(getFichesContentForPrompt);

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/directeur-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/directeur-chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateCompletion.mockResolvedValue({
      content: "Réponse du directeur de thèse.",
      model: "default",
      provider: "zai",
    });
  });

  // ── Success cases ─────────────────────────────────────────────────────
  it("should return 200 with assistant response for a single user message", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    const res = await POST(
      createRequest({
        messages: [{ role: "user", content: "Comment structurer mon chapitre ?" }],
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.content).toBe("Réponse du directeur de thèse.");
    expect(data.data.role).toBe("assistant");
  });

  it("should pass system prompt from directeur-prompt", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    await POST(
      createRequest({
        messages: [{ role: "user", content: "Aide-moi" }],
      }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[0].content).toContain("Jean-Marc Renaud");
  });

  it("should handle conversation history with multiple messages", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    await POST(
      createRequest({
        messages: [
          { role: "user", content: "Premier message" },
          { role: "assistant", content: "Première réponse" },
          { role: "user", content: "Deuxième message" },
        ],
      }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    // system + 3 history messages
    expect(callArgs.messages.length).toBe(4);
  });

  it("should use temperature 0.7", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    await POST(
      createRequest({
        messages: [{ role: "user", content: "Test" }],
      }) as any
    );

    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.7 })
    );
  });

  // ── Corpus fiche injection ─────────────────────────────────────────────
  it("should call detectRelevantFiches with latest user message", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    await POST(
      createRequest({
        messages: [
          { role: "user", content: "message ancien" },
          { role: "assistant", content: "réponse" },
          { role: "user", content: "question sur le plagiat" },
        ],
      }) as any
    );

    // Should detect from the last user message (reversed find)
    expect(mockDetectRelevantFiches).toHaveBeenCalledWith("question sur le plagiat");
  });

  it("should append fiche content to system prompt when fiches are detected", async () => {
    mockDetectRelevantFiches.mockReturnValue(["ethique-publication"]);
    mockGetFichesContentForPrompt.mockReturnValue(
      "\n---\nCONTEXTE ADDITIONNEL (corpus publication) :\nÉthique de la publication..."
    );

    await POST(
      createRequest({
        messages: [{ role: "user", content: "Comment éviter le plagiat ?" }],
      }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    const systemPrompt = callArgs.messages[0].content;
    expect(systemPrompt).toContain("CONTEXTE ADDITIONNEL");
    expect(mockGetFichesContentForPrompt).toHaveBeenCalledWith(["ethique-publication"]);
  });

  it("should not append fiche content when no fiches are detected", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    await POST(
      createRequest({
        messages: [{ role: "user", content: "Bonjour" }],
      }) as any
    );

    expect(mockGetFichesContentForPrompt).not.toHaveBeenCalled();
  });

  // ── Thesis context ────────────────────────────────────────────────────
  it("should include thesis context as a system message when provided", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    await POST(
      createRequest({
        messages: [{ role: "user", content: "Test" }],
        thesisContext: "Thèse sur l'urbanisme durable à Paris",
      }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    const contextMsg = callArgs.messages.find(
      (m: any) => m.content.includes("INFORMATIONS SUR LA THÈSE")
    );
    expect(contextMsg).toBeDefined();
    expect(contextMsg.content).toContain("urbanisme durable");
  });

  it("should not include thesis context message when not provided", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    await POST(
      createRequest({
        messages: [{ role: "user", content: "Test" }],
      }) as any
    );

    const callArgs = mockGenerateCompletion.mock.calls[0][0];
    const contextMsg = callArgs.messages.find(
      (m: any) => m.content.includes("INFORMATIONS SUR LA THÈSE")
    );
    expect(contextMsg).toBeUndefined();
  });

  // ── Provider config ───────────────────────────────────────────────────
  it("should pass providerConfig when _aiConfig is provided", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);
    const aiConfig = { provider: "openai" as const, apiKey: "sk-test", model: "gpt-4o" };

    await POST(
      createRequest({
        messages: [{ role: "user", content: "Test" }],
        _aiConfig: aiConfig,
      }) as any
    );

    expect(mockGenerateCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ providerConfig: aiConfig })
    );
  });

  // ── Validation errors ──────────────────────────────────────────────────
  it("should return 500 when messages array is empty", async () => {
    const res = await POST(
      createRequest({ messages: [] }) as any
    );

    expect(res.status).toBe(500);
  });

  it("should return 500 when messages is missing", async () => {
    const res = await POST(
      createRequest({}) as any
    );

    expect(res.status).toBe(500);
  });

  it("should return 500 when a message has empty content", async () => {
    const res = await POST(
      createRequest({
        messages: [{ role: "user", content: "" }],
      }) as any
    );

    expect(res.status).toBe(500);
  });

  it("should return 500 when a message has invalid role", async () => {
    const res = await POST(
      createRequest({
        messages: [{ role: "system", content: "Test" }],
      }) as any
    );

    expect(res.status).toBe(500);
  });

  it("should return 500 for invalid JSON body", async () => {
    const req = new Request("http://localhost:3000/api/directeur-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as any);

    expect(res.status).toBe(500);
  });

  // ── AI error cases ────────────────────────────────────────────────────
  it("should return 500 when generateCompletion throws Error", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);
    mockGenerateCompletion.mockRejectedValue(new Error("AI service unavailable"));

    const res = await POST(
      createRequest({
        messages: [{ role: "user", content: "Test" }],
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("AI service unavailable");
  });

  it("should return 500 with generic message when generateCompletion throws non-Error", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);
    mockGenerateCompletion.mockRejectedValue("unknown error");

    const res = await POST(
      createRequest({
        messages: [{ role: "user", content: "Test" }],
      }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Erreur lors de la génération");
  });

  // ── Assistant-only messages (edge case) ───────────────────────────────
  it("should handle messages with only assistant messages (no user msg for fiche detection)", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);

    const res = await POST(
      createRequest({
        messages: [{ role: "assistant", content: "Je suis le directeur" }],
      }) as any
    );

    // detectRelevantFiches should NOT be called when no user message exists
    expect(mockDetectRelevantFiches).not.toHaveBeenCalled();
  });
});

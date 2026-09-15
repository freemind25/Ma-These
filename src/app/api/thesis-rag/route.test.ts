import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { indexThesisContent, generateRagResponse } from "@/lib/rag/rag-service";

// ── Mocks ───────────────────────────────────────────────────────────────
vi.mock("@/lib/rag/rag-service", () => ({
  indexThesisContent: vi.fn(),
  generateRagResponse: vi.fn(),
}));

const mockIndexThesisContent = vi.mocked(indexThesisContent);
const mockGenerateRagResponse = vi.mocked(generateRagResponse);

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/thesis-rag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/thesis-rag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Validation ────────────────────────────────────────────────────────
  it("should return 400 when action is missing", async () => {
    const res = await POST(
      createRequest({ thesisId: "thesis-123" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("action");
    expect(data.error).toContain("thesisId");
  });

  it("should return 400 when thesisId is missing", async () => {
    const res = await POST(
      createRequest({ action: "index" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("action");
    expect(data.error).toContain("thesisId");
  });

  it("should return 400 when both action and thesisId are missing", async () => {
    const res = await POST(createRequest({}) as any);
    const data = await res.json();

    expect(res.status).toBe(400);
  });

  it("should return 400 for unknown action", async () => {
    const res = await POST(
      createRequest({ action: "delete", thesisId: "thesis-123" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("inconnue");
    expect(data.error).toContain("delete");
  });

  it("should return 400 when query action is missing query param", async () => {
    const res = await POST(
      createRequest({ action: "query", thesisId: "thesis-123" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("query");
  });

  it("should return 400 when query action has whitespace-only query", async () => {
    const res = await POST(
      createRequest({ action: "query", thesisId: "thesis-123", query: "   " }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("query");
  });

  // ── Index action ──────────────────────────────────────────────────────
  describe("action: index", () => {
    it("should return 200 with stats on successful index", async () => {
      const mockStats = {
        totalChunks: 42,
        chapters: 10,
        references: 20,
        notebooks: 8,
        cadrages: 4,
        totalTokens: 5000,
      };
      mockIndexThesisContent.mockResolvedValue(mockStats);

      const res = await POST(
        createRequest({ action: "index", thesisId: "thesis-123" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toEqual(mockStats);
      expect(mockIndexThesisContent).toHaveBeenCalledWith("thesis-123", undefined);
    });

    it("should return 500 when indexThesisContent throws", async () => {
      mockIndexThesisContent.mockRejectedValue(new Error("DB connection failed"));

      const res = await POST(
        createRequest({ action: "index", thesisId: "thesis-123" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("DB connection failed");
    });
  });

  // ── Query action ──────────────────────────────────────────────────────
  describe("action: query", () => {
    const mockRagResult = {
      answer: "Based on the thesis documents, the answer is...",
      sources: [
        { type: "chapter", title: "Chapter 1 - Introduction", chunkIndex: 0 },
      ],
      chunks: [
        {
          chunk: {
            id: "chunk-1",
            sourceType: "chapter",
            sourceId: "ch-1",
            sourceTitle: "Chapter 1",
            content: "Some content",
            chunkIndex: 0,
            metadata: "{}",
            tokenCount: 100,
          },
          score: 0.9,
          scoreType: "keyword",
        },
      ],
    };

    beforeEach(() => {
      mockGenerateRagResponse.mockResolvedValue(mockRagResult);
    });

    it("should return 200 with RAG answer and sources", async () => {
      const res = await POST(
        createRequest({
          action: "query",
          thesisId: "thesis-123",
          query: "Quelle est la problématique principale ?",
        }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.answer).toBe(mockRagResult.answer);
      expect(data.sources).toEqual(mockRagResult.sources);
      expect(data.chunks).toEqual(mockRagResult.chunks);
    });

    it("should pass providerConfig to generateRagResponse", async () => {
      const aiConfig = { provider: "openai" as const, apiKey: "sk-test" };

      await POST(
        createRequest({
          action: "query",
          thesisId: "thesis-123",
          query: "Question ?",
          _aiConfig: aiConfig,
        }) as any
      );

      expect(mockGenerateRagResponse).toHaveBeenCalledWith(
        "Question ?",
        "thesis-123",
        aiConfig
      );
    });

    it("should return 500 when generateRagResponse throws", async () => {
      mockGenerateRagResponse.mockRejectedValue(new Error("AI failure"));

      const res = await POST(
        createRequest({
          action: "query",
          thesisId: "thesis-123",
          query: "Question ?",
        }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("AI failure");
    });

    it("should return 500 with generic message for non-Error throws", async () => {
      mockGenerateRagResponse.mockRejectedValue("unexpected");

      const res = await POST(
        createRequest({
          action: "query",
          thesisId: "thesis-123",
          query: "Question ?",
        }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("Erreur interne du serveur.");
    });
  });

  // ── Invalid JSON ──────────────────────────────────────────────────────
  it("should return 500 for invalid JSON body", async () => {
    const req = new Request("http://localhost:3000/api/thesis-rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as any);

    expect(res.status).toBe(500);
  });
});

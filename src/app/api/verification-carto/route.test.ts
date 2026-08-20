import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockFindUnique, mockCreate, mockFindMany } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    typeAnalyseMethodologique: {
      findUnique: mockFindUnique,
    },
    sessionVerification: {
      create: mockCreate,
      findMany: mockFindMany,
    },
  },
}));

vi.mock("@/lib/ai/zai-client", () => ({
  generateCompletion: vi.fn(),
}));

vi.mock("@/lib/ai/ai-provider", () => ({}));

vi.mock("@/lib/geo-mcp-client", () => ({
  isGeoMcpAvailable: vi.fn().mockResolvedValue(false),
  geocodeForContext: vi.fn().mockResolvedValue(null),
  validateCoordsForContext: vi.fn().mockResolvedValue(null),
  distanceForContext: vi.fn().mockResolvedValue(null),
  elevationForContext: vi.fn().mockResolvedValue(null),
  bboxForContext: vi.fn().mockResolvedValue(null),
  validateGeojsonForContext: vi.fn().mockResolvedValue(null),
  areaForContext: vi.fn().mockResolvedValue(null),
}));

// ── Helpers ───────────────────────────────────────────

function makeRequest(body: unknown, method = "POST") {
  return new NextRequest("http://localhost:3000/api/verification-carto", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(url: string) {
  return new NextRequest(url);
}

const mockTypeAnalyse = {
  id: "ta-1",
  nom: "Analyse urbaine",
  elementsAttendus: JSON.stringify({
    prealable: {
      elements: [
        { typeElement: "situation_generale", label: "Situation générale" },
        { typeElement: "perimetre_urbain", label: "Périmètre urbain" },
      ],
    },
    phases: [
      {
        id: "phase-1b",
        label: "Phase 1B",
        elements: [
          { typeElement: "zonage_fonctionnel", label: "Zonage fonctionnel" },
        ],
      },
    ],
  }),
  promptQuestionneur: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindUnique.mockResolvedValue(mockTypeAnalyse);
  mockCreate.mockResolvedValue({ id: "sv-1" });
  mockFindMany.mockResolvedValue([]);
});

// ── Tests ─────────────────────────────────────────────

describe("POST /api/verification-carto", () => {
  it("should return 400 if body is missing action", async () => {
    const req = makeRequest({ siteEtudeId: "s1", typeAnalyseId: "ta-1" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("should return 400 if action is invalid", async () => {
    const req = makeRequest({ action: "invalid", siteEtudeId: "s1", typeAnalyseId: "ta-1" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 if typeAnalyse not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = makeRequest({
      action: "completude",
      siteEtudeId: "s1",
      typeAnalyseId: "nonexistent",
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Type d'analyse non trouvé");
  });

  // ── action: completude ──

  describe("action: completude", () => {
    it("should return complet=true when all elements provided", async () => {
      const req = makeRequest({
        action: "completude",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        typeElementsRenseignes: ["situation_generale", "perimetre_urbain", "zonage_fonctionnel"],
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.complet).toBe(true);
      expect(data.data.manquants).toHaveLength(0);
    });

    it("should return complet=false with missing prealable elements (bloquant=true)", async () => {
      const req = makeRequest({
        action: "completude",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        typeElementsRenseignes: ["zonage_fonctionnel"],
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.complet).toBe(false);
      expect(data.data.bloquant).toBe(true);
      expect(data.data.etape).toBe("prealable");
      expect(data.data.manquants.length).toBeGreaterThan(0);
    });

    it("should return complet=false with missing phase elements (bloquant=false)", async () => {
      const req = makeRequest({
        action: "completude",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        typeElementsRenseignes: ["situation_generale", "perimetre_urbain"],
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.complet).toBe(false);
      expect(data.data.bloquant).toBe(false);
      expect(data.data.etape).toBe("analyse");
    });

    it("should handle empty typeElementsRenseignes", async () => {
      const req = makeRequest({
        action: "completude",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        typeElementsRenseignes: [],
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.complet).toBe(false);
    });

    it("should create a sessionVerification entry", async () => {
      const req = makeRequest({
        action: "completude",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        typeElementsRenseignes: [],
      });
      await POST(req);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            siteEtudeId: "s1",
            typeAnalyseId: "ta-1",
          }),
        })
      );
    });

    it("should list presents elements in phases", async () => {
      // Provide all prealable + one phase element
      const req = makeRequest({
        action: "completude",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        typeElementsRenseignes: ["situation_generale", "perimetre_urbain", "zonage_fonctionnel"],
      });
      const res = await POST(req);
      const data = await res.json();
      // presents only contains elements found in phases (not prealable)
      expect(data.data.presents).toContain("zonage_fonctionnel");
      expect(data.data.complet).toBe(true);
    });
  });

  // ── action: questionneur ──

  describe("action: questionneur", () => {
    it("should return 400 if no elements provided", async () => {
      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Aucun élément fourni");
    });

    it("should return 400 if elements array is empty", async () => {
      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [],
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should call generateCompletion with valid elements", async () => {
      const { generateCompletion } = await import("@/lib/ai/zai-client");
      (generateCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: JSON.stringify({ questions: ["Question test ?"] }),
      });

      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [
          { typeElement: "perimetre_urbain", nom: "Lyon", source: "IGN" },
        ],
        typeAnalyseNom: "Analyse urbaine",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(generateCompletion).toHaveBeenCalled();
    });

    it("should filter out declarative questions", async () => {
      const { generateCompletion } = await import("@/lib/ai/zai-client");
      (generateCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: JSON.stringify({
          questions: [
            "Cette zone présente-t-elle des problèmes ?",
            "Avez-vous vérifié la cohérence temporelle ?",
            "Ceci montre que le site est intéressant ?",
          ],
        }),
      });

      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [{ typeElement: "perimetre_urbain", nom: "Lyon", source: "IGN" }],
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.data.filtered).toBeGreaterThan(0);
    });

    it("should handle unparseable LLM response gracefully", async () => {
      const { generateCompletion } = await import("@/lib/ai/zai-client");
      (generateCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: "Not valid JSON at all",
      });

      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [{ typeElement: "perimetre_urbain", nom: "Lyon", source: "IGN" }],
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.questions).toEqual([]);
    });

    it("should strip markdown fences from LLM response", async () => {
      const { generateCompletion } = await import("@/lib/ai/zai-client");
      (generateCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: '```json\n{"questions": ["Question valide ?"]}\n```',
      });

      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [{ typeElement: "perimetre_urbain", nom: "Lyon", source: "IGN" }],
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.questions).toHaveLength(1);
    });

    it("should include filtered count in response", async () => {
      const { generateCompletion } = await import("@/lib/ai/zai-client");
      (generateCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: JSON.stringify({
          questions: ["Question 1 ?", "Question 2 ?"],
        }),
      });

      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [{ typeElement: "perimetre_urbain", nom: "Lyon", source: "IGN" }],
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.data.total).toBe(2);
      expect(typeof data.data.filtered).toBe("number");
    });

    it("should use type-specific prompt if available", async () => {
      mockFindUnique.mockResolvedValue({
        ...mockTypeAnalyse,
        promptQuestionneur: "Custom prompt here",
      });
      const { generateCompletion } = await import("@/lib/ai/zai-client");
      (generateCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: JSON.stringify({ questions: [] }),
      });

      const req = makeRequest({
        action: "questionneur",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [{ typeElement: "perimetre_urbain", nom: "Lyon", source: "IGN" }],
      });
      await POST(req);
      const callArgs = (generateCompletion as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.messages[0].content).toBe("Custom prompt here");
    });
  });

  // ── action: save-session ──

  describe("action: save-session", () => {
    it("should create session and return 201", async () => {
      const req = makeRequest({
        action: "save-session",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elementsManquants: [{ label: "test" }],
        questionsPosees: ["Q1 ?"],
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.data).toBeDefined();
    });

    it("should serialize elementsManquants and questionsPosees to JSON", async () => {
      const req = makeRequest({
        action: "save-session",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elementsManquants: [{ label: "test" }],
        questionsPosees: ["Q1 ?"],
      });
      await POST(req);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            elementsManquants: JSON.stringify([{ label: "test" }]),
            questionsPosees: JSON.stringify(["Q1 ?"]),
          }),
        })
      );
    });

    it("should handle optional reponses field", async () => {
      const req = makeRequest({
        action: "save-session",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        reponses: { q1: "answer" },
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });

  // ── action: geo-enrich ──

  describe("action: geo-enrich", () => {
    it("should return mcp_available flag", async () => {
      const req = makeRequest({
        action: "geo-enrich",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.mcp_available).toBe(false);
      expect(data.data.enrichments).toEqual([]);
      expect(data.data.count).toBe(0);
    });

    it("should skip enrichment when MCP is unavailable", async () => {
      const req = makeRequest({
        action: "geo-enrich",
        siteEtudeId: "s1",
        typeAnalyseId: "ta-1",
        elements: [
          { typeElement: "perimetre_urbain", nom: "Lyon", source: "IGN" },
        ],
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.data.count).toBe(0);
    });
  });

  // ── validation errors ──

  describe("validation", () => {
    it("should return 400 for missing siteEtudeId", async () => {
      const req = makeRequest({ action: "completude", typeAnalyseId: "ta-1" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 400 for missing typeAnalyseId", async () => {
      const req = makeRequest({ action: "completude", siteEtudeId: "s1" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid JSON body", async () => {
      const req = new NextRequest("http://localhost:3000/api/verification-carto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      });
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });
});

describe("GET /api/verification-carto", () => {
  it("should return sessions list", async () => {
    mockFindMany.mockResolvedValue([
      { id: "sv-1", siteEtudeId: "s1", createdAt: new Date() },
    ]);
    const req = makeGetRequest("http://localhost:3000/api/verification-carto");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
  });

  it("should filter by siteEtudeId query param", async () => {
    const req = makeGetRequest(
      "http://localhost:3000/api/verification-carto?siteEtudeId=s1"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ siteEtudeId: "s1" }),
      })
    );
  });

  it("should filter by typeAnalyseId query param", async () => {
    const req = makeGetRequest(
      "http://localhost:3000/api/verification-carto?typeAnalyseId=ta-1"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ typeAnalyseId: "ta-1" }),
      })
    );
  });

  it("should filter by both params", async () => {
    const req = makeGetRequest(
      "http://localhost:3000/api/verification-carto?siteEtudeId=s1&typeAnalyseId=ta-1"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ siteEtudeId: "s1", typeAnalyseId: "ta-1" }),
      })
    );
  });

  it("should return 500 on db error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));
    const req = makeGetRequest("http://localhost:3000/api/verification-carto");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it("should limit results to 50", async () => {
    const req = makeGetRequest("http://localhost:3000/api/verification-carto");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });
});

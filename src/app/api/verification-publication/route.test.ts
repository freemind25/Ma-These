import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockGenerateCompletion } = vi.hoisted(() => ({
  mockGenerateCompletion: vi.fn(),
}));

vi.mock("@/lib/ai/zai-client", () => ({
  generateCompletion: mockGenerateCompletion,
}));

vi.mock("@/lib/ai/ai-provider", () => ({}));

// ── Helpers ───────────────────────────────────────────

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/verification-publication", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────

describe("POST /api/verification-publication", () => {
  // ── General ──

  describe("general validation", () => {
    it("should return 400 if action is missing", async () => {
      const req = makeRequest({});
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("action");
    });

    it("should return 400 if action is not a string", async () => {
      const req = makeRequest({ action: 123 });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 400 for unrecognized action", async () => {
      const req = makeRequest({ action: "nonexistent" });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("non reconnue");
    });

    it("should return 500 if body is not JSON", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/verification-publication",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "invalid",
        }
      );
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  // ── action: intro-discussion-coherence ──

  describe("action: intro-discussion-coherence", () => {
    const validBody = {
      action: "intro-discussion-coherence",
      introductionText: "Our research question is: does X affect Y?",
      discussionText: "The results show that X significantly affects Y (p<0.05).",
    };

    it("should return 400 if introductionText is missing", async () => {
      const req = makeRequest({
        action: "intro-discussion-coherence",
        discussionText: "Some text",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("introductionText");
    });

    it("should return 400 if discussionText is missing", async () => {
      const req = makeRequest({
        action: "intro-discussion-coherence",
        introductionText: "Some text",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should call generateCompletion and return parsed data", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({
          questions: [
            {
              question: "Does X affect Y?",
              answered: true,
              evidence: "The results show that X significantly affects Y",
            },
          ],
          orphanResults: [],
          funnelStructure: { score: 8, comment: "Good structure" },
          overallCoherence: 8,
        }),
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.overallCoherence).toBe(8);
      expect(data.data.questions).toHaveLength(1);
    });

    it("should handle markdown-wrapped JSON response", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: '```json\n{"questions":[],"orphanResults":[],"funnelStructure":{"score":5,"comment":"ok"},"overallCoherence":5}\n```',
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.overallCoherence).toBe(5);
    });

    it("should return error when LLM response is not JSON", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: "This is not JSON",
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(data.raw).toBeDefined();
    });
  });

  // ── action: table-quality ──

  describe("action: table-quality", () => {
    it("should return 400 if tableData is missing", async () => {
      const req = makeRequest({ action: "table-quality" });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("tableData");
    });

    it("should return 400 if tableData is not a string", async () => {
      const req = makeRequest({ action: "table-quality", tableData: 123 });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should detect identical columns (signal-1)", async () => {
      const req = makeRequest({
        action: "table-quality",
        tableData: "| Col | Val |\n|-----|-----|\n| A | x |\n| B | x |\n| C | x |\n| D | x |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const signal1 = data.data.signals.find((s: { signalId: string }) => s.signalId === "signal-1");
      expect(signal1.detected).toBe(true);
    });

    it("should detect binary symbols (signal-2)", async () => {
      // All data cells must be binary (+, -) for >70% detection
      // 8 data cells, all binary = 100% > 70%
      const req = makeRequest({
        action: "table-quality",
        tableData: "| Item | Result |\n|------|--------|\n| + | + |\n| - | - |\n| - | + |\n| + | - |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const signal2 = data.data.signals.find((s: { signalId: string }) => s.signalId === "signal-2");
      expect(signal2.detected).toBe(true);
    });

    it("should detect non-significant results (signal-3)", async () => {
      const req = makeRequest({
        action: "table-quality",
        tableData: "| Test | p-value |\n|------|---------|\n| T1 | p > 0.05 |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const signal3 = data.data.signals.find((s: { signalId: string }) => s.signalId === "signal-3");
      expect(signal3.detected).toBe(true);
    });

    it("should detect 'non significatif' text (signal-3)", async () => {
      const req = makeRequest({
        action: "table-quality",
        tableData: "| Test | Result |\n|------|--------|\n| T1 | non significatif |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const signal3 = data.data.signals.find((s: { signalId: string }) => s.signalId === "signal-3");
      expect(signal3.detected).toBe(true);
    });

    it("should detect 'ns' abbreviation (signal-3)", async () => {
      const req = makeRequest({
        action: "table-quality",
        tableData: "| Test | Result |\n|------|--------|\n| T1 | NS |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      const signal3 = data.data.signals.find((s: { signalId: string }) => s.signalId === "signal-3");
      expect(signal3.detected).toBe(true);
    });

    it("should compute rule-based score correctly", async () => {
      // No signals detected → score 10
      const req = makeRequest({
        action: "table-quality",
        tableData: "| Col | Val |\n|-----|-----|\n| A | 10 |\n| B | 20 |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      // Rule score is 10 (no signals), LLM not called for small table
      // overallScore = round((10 + 10) / 2) = 10
      expect(data.data.overallScore).toBeGreaterThanOrEqual(7);
    });

    it("should call LLM for tables with more than 6 cells", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({ justified: true, alternative: "" }),
      });
      const req = makeRequest({
        action: "table-quality",
        tableData: "| A | B | C |\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |\n| 7 | 8 | 9 |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockGenerateCompletion).toHaveBeenCalled();
    });

    it("should not call LLM for tiny tables", async () => {
      const req = makeRequest({
        action: "table-quality",
        tableData: "| A |\n| 1 |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockGenerateCompletion).not.toHaveBeenCalled();
    });

    it("should handle LLM unparseable response gracefully", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: "not json",
      });
      const req = makeRequest({
        action: "table-quality",
        tableData: "| A | B | C |\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |\n| 7 | 8 | 9 |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.llmVerdict.justified).toBe(true);
    });

    it("should handle LLM error gracefully", async () => {
      mockGenerateCompletion.mockRejectedValue(new Error("LLM down"));
      const req = makeRequest({
        action: "table-quality",
        tableData: "| A | B | C |\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |\n| 7 | 8 | 9 |",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.llmVerdict.justified).toBe(true);
      expect(data.data.llmVerdict.alternative).toContain("non disponible");
    });

    it("should parse tab-separated tables", async () => {
      const req = makeRequest({
        action: "table-quality",
        tableData: "Col1\tCol2\n1\t2\n3\t4",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });

    it("should parse CSV tables", async () => {
      const req = makeRequest({
        action: "table-quality",
        tableData: "Col1,Col2\n1,2\n3,4",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  // ── action: paragraph-structure ──

  describe("action: paragraph-structure", () => {
    it("should return 400 if text is missing", async () => {
      const req = makeRequest({ action: "paragraph-structure" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 400 if text is not a string", async () => {
      const req = makeRequest({ action: "paragraph-structure", text: 42 });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return empty paragraphs for very short text", async () => {
      const req = makeRequest({
        action: "paragraph-structure",
        text: "Short",
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.paragraphs).toEqual([]);
    });

    it("should call LLM for text with multiple paragraphs", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({
          paragraphs: [
            { index: 1, hasDirectOpening: true, issue: null },
            { index: 2, hasDirectOpening: false, issue: "Opening indirecte" },
          ],
        }),
      });

      const longText =
        "This is the first paragraph of a longer text that should be long enough to pass the filter threshold.\n\n" +
        "This is the second paragraph with enough content to be considered a real paragraph for analysis purposes.";

      const req = makeRequest({
        action: "paragraph-structure",
        text: longText,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.paragraphs).toHaveLength(2);
      expect(data.data.paragraphs[0].preview).toBeDefined();
      expect(data.data.paragraphs[0].hasDirectOpening).toBe(true);
    });

    it("should add preview to each paragraph", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({
          paragraphs: [
            { index: 1, hasDirectOpening: true, issue: null },
          ],
        }),
      });

      const text = "This is a sufficiently long paragraph that will pass the minimum length threshold for paragraph analysis in the system.";
      const req = makeRequest({ action: "paragraph-structure", text });
      const res = await POST(req);
      const data = await res.json();
      expect(data.data.paragraphs[0].preview).toBeTruthy();
      expect(data.data.paragraphs[0].preview.length).toBeLessThanOrEqual(80);
    });

    it("should handle unparseable LLM response for paragraph-structure", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: "Not JSON at all",
      });

      const longText =
        "This is the first paragraph of a longer text that should be long enough to pass the filter threshold.\n\n" +
        "This is the second paragraph with enough content to be considered a real paragraph for analysis purposes.";

      const req = makeRequest({ action: "paragraph-structure", text: longText });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(data.raw).toBeDefined();
    });
  });

  // ── action: text-table-redundancy ──

  describe("action: text-table-redundancy", () => {
    const validBody = {
      action: "text-table-redundancy",
      text: "Les résultats montrent que le groupe A a un score de 85, le groupe B a un score de 72, et le groupe C a un score de 93.",
      tableOrFigureDescription:
        "| Groupe | Score |\n|--------|-------|\n| A | 85 |\n| B | 72 |\n| C | 93 |",
    };

    it("should return 400 if text is missing", async () => {
      const req = makeRequest({
        action: "text-table-redundancy",
        tableOrFigureDescription: "table",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 400 if tableOrFigureDescription is missing", async () => {
      const req = makeRequest({
        action: "text-table-redundancy",
        text: "some text",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should call LLM and return parsed data", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({
          isRedundant: true,
          redundantPhrases: ["le groupe A a un score de 85"],
          suggestion: "Référez-vous au Tableau 1 au lieu de citer chaque valeur.",
        }),
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.isRedundant).toBe(true);
      expect(data.data.redundantPhrases).toHaveLength(1);
      expect(data.data.suggestion).toBeTruthy();
    });

    it("should handle non-redundant case", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({
          isRedundant: false,
          redundantPhrases: [],
          suggestion: "",
        }),
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.isRedundant).toBe(false);
    });

    it("should handle unparseable LLM response for redundancy check", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: "Not JSON",
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(data.raw).toBeDefined();
    });

    it("should normalize redundantPhrases to empty array if not array", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({
          isRedundant: true,
          redundantPhrases: "not an array",
          suggestion: "Fix it",
        }),
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      const data = await res.json();
      expect(Array.isArray(data.data.redundantPhrases)).toBe(true);
    });

    it("should normalize suggestion to empty string if not string", async () => {
      mockGenerateCompletion.mockResolvedValue({
        content: JSON.stringify({
          isRedundant: false,
          redundantPhrases: [],
          suggestion: 123,
        }),
      });

      const req = makeRequest(validBody);
      const res = await POST(req);
      const data = await res.json();
      expect(data.data.suggestion).toBe("");
    });

    // ── T1 Bug: generateCompletion rejection handling ─────────
    describe("T1 bug: generateCompletion rejection handling", () => {
      it("should return 502 when generateCompletion rejects for intro-discussion-coherence", async () => {
        mockGenerateCompletion.mockRejectedValue(new Error("Service AI indisponible"));

        const req = makeRequest({
          action: "intro-discussion-coherence",
          introductionText: "Some intro text",
          discussionText: "Some discussion text",
        });
        const res = await POST(req);
        expect(res.status).toBe(502);
        const data = await res.json();
        expect(data.error).toBe("Service AI indisponible");
      });

      it("should return 502 when generateCompletion rejects for paragraph-structure", async () => {
        mockGenerateCompletion.mockRejectedValue(new Error("Rate limit"));

        const req = makeRequest({
          action: "paragraph-structure",
          text: "Some text to analyze.",
        });
        const res = await POST(req);
        expect(res.status).toBe(502);
        const data = await res.json();
        expect(data.error).toBe("Rate limit");
      });

      it("should return 502 when generateCompletion rejects for text-table-redundancy", async () => {
        mockGenerateCompletion.mockRejectedValue(new Error("Modèle introuvable"));

        const req = makeRequest({
          action: "text-table-redundancy",
          text: "Text content.",
          tableOrFigureDescription: "Table description.",
        });
        const res = await POST(req);
        expect(res.status).toBe(502);
        const data = await res.json();
 expect(data.error).toBe("Modèle introuvable");
      });

      it("should return 502 with generic message for non-Error rejection", async () => {
        mockGenerateCompletion.mockRejectedValue("string error");

        const req = makeRequest({
          action: "intro-discussion-coherence",
          introductionText: "A",
          discussionText: "B",
        });
        const res = await POST(req);
        expect(res.status).toBe(502);
        const data = await res.json();
        expect(data.error).toBe("Erreur lors de l'appel à l'IA.");
      });
    });
  });
});

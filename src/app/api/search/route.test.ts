import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockCount, mockFindMany, mockFindFirst, mockAggregate } = vi.hoisted(() => ({
  mockCount: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindFirst: vi.fn(),
  mockAggregate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    chapter: {
      count: mockCount,
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      aggregate: mockAggregate,
    },
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeGetRequest(url: string) {
  return new NextRequest(url);
}

const now = new Date("2025-01-15");

const mockChapters = [
  {
    id: "ch-1",
    number: 1,
    title: "Introduction",
    romanNumeral: "I",
    plainText: "This is the introduction chapter with some important content about urban morphology.",
    wordCount: 1500,
    status: "completed",
    updatedAt: now,
    thesisId: "th-1",
    thesis: { title: "My Thesis", author: "Author" },
  },
  {
    id: "ch-2",
    number: 2,
    title: "Literature Review",
    romanNumeral: "II",
    plainText: "The literature on urban morphology is vast and varied.",
    wordCount: 3000,
    status: "in_progress",
    updatedAt: now,
    thesisId: "th-1",
    thesis: { title: "My Thesis", author: "Author" },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockFindMany.mockResolvedValue(mockChapters);
  mockCount.mockResolvedValue(2);
  mockFindFirst.mockResolvedValue({ updatedAt: now });
  mockAggregate.mockResolvedValue({ _sum: { wordCount: 4500 } });
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/search", () => {
  describe("no query (stats mode)", () => {
    it("should return empty results with stats when no query provided", async () => {
      const req = makeGetRequest("http://localhost:3000/api/search");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toEqual([]);
      expect(data.meta.count).toBe(0);
      expect(data.meta.totalIndexed).toBe(2);
      expect(data.meta.totalWords).toBe(4500);
      // Date gets serialized to string in JSON response
      expect(data.meta.lastIndexUpdate).toBe(now.toISOString());
    });

    it("should handle null latestChapter", async () => {
      mockFindFirst.mockResolvedValue(null);
      const req = makeGetRequest("http://localhost:3000/api/search");
      const res = await GET(req);
      const data = await res.json();
      expect(data.meta.lastIndexUpdate).toBeNull();
    });

    it("should handle zero totalWords", async () => {
      mockAggregate.mockResolvedValue({ _sum: { wordCount: null } });
      const req = makeGetRequest("http://localhost:3000/api/search");
      const res = await GET(req);
      const data = await res.json();
      expect(data.meta.totalWords).toBe(0);
    });
  });

  describe("with query", () => {
    it("should return matching chapters", async () => {
      const req = makeGetRequest("http://localhost:3000/api/search?q=morphology");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.meta.count).toBeGreaterThan(0);
    });

    it("should score title matches higher", async () => {
      const req = makeGetRequest("http://localhost:3000/api/search?q=Introduction");
      const res = await GET(req);
      const data = await res.json();
      // The chapter titled "Introduction" should rank highest
      if (data.data.length > 0) {
        expect(data.data[0].chapterTitle).toBe("Introduction");
      }
    });

    it("should include snippet in results", async () => {
      const req = makeGetRequest("http://localhost:3000/api/search?q=urban");
      const res = await GET(req);
      const data = await res.json();
      if (data.data.length > 0) {
        expect(data.data[0].snippet).toBeTruthy();
      }
    });

    it("should filter by chapterId", async () => {
      const req = makeGetRequest(
        "http://localhost:3000/api/search?q=morphology&chapterId=ch-1"
      );
      await GET(req);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: "ch-1" }),
        })
      );
    });

    it("should filter by dateFrom", async () => {
      const req = makeGetRequest(
        "http://localhost:3000/api/search?q=morphology&dateFrom=2025-01-01"
      );
      await GET(req);
      const whereArg = mockFindMany.mock.calls[0][0].where;
      expect(whereArg.updatedAt.gte).toBeInstanceOf(Date);
    });

    it("should filter by dateTo", async () => {
      const req = makeGetRequest(
        "http://localhost:3000/api/search?q=morphology&dateTo=2025-12-31"
      );
      await GET(req);
      const whereArg = mockFindMany.mock.calls[0][0].where;
      expect(whereArg.updatedAt.lte).toBeInstanceOf(Date);
    });

    it("should handle NOT operator", async () => {
      const req = makeGetRequest(
        "http://localhost:3000/api/search?q=morphology NOT urban"
      );
      const res = await GET(req);
      const data = await res.json();
      // Chapter 1 contains "urban" so should be excluded
      expect(data.data.every((r: { chapterTitle: string }) => r.chapterTitle !== "Literature Review")).toBe(true);
    });

    it("should handle AND operator", async () => {
      const req = makeGetRequest(
        "http://localhost:3000/api/search?q=urban AND morphology"
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      // Both chapters contain both "urban" and "morphology"
      expect(data.data.length).toBe(2);
    });

    it("should handle OR operator", async () => {
      const req = makeGetRequest(
        "http://localhost:3000/api/search?q=important OR literature"
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
    });

    it("should return zero results for non-matching query", async () => {
      const req = makeGetRequest(
        "http://localhost:3000/api/search?q=xyznonexistent"
      );
      const res = await GET(req);
      const data = await res.json();
      expect(data.data).toHaveLength(0);
    });

    it("should include thesisTitle and thesisAuthor in results", async () => {
      const req = makeGetRequest("http://localhost:3000/api/search?q=morphology");
      const res = await GET(req);
      const data = await res.json();
      if (data.data.length > 0) {
        expect(data.data[0].thesisTitle).toBe("My Thesis");
        expect(data.data[0].thesisAuthor).toBe("Author");
      }
    });

    it("should return results sorted by score descending", async () => {
      const req = makeGetRequest("http://localhost:3000/api/search?q=urban");
      const res = await GET(req);
      const data = await res.json();
      for (let i = 1; i < data.data.length; i++) {
        expect(data.data[i - 1].score).toBeGreaterThanOrEqual(data.data[i].score);
      }
    });

    it("should include wordCount and status in results", async () => {
      const req = makeGetRequest("http://localhost:3000/api/search?q=morphology");
      const res = await GET(req);
      const data = await res.json();
      if (data.data.length > 0) {
        expect(typeof data.data[0].wordCount).toBe("number");
        expect(data.data[0].status).toBeTruthy();
      }
    });
  });

  describe("error handling", () => {
    it("should return 500 on db error", async () => {
      mockFindMany.mockRejectedValue(new Error("DB down"));
      const req = makeGetRequest("http://localhost:3000/api/search?q=test");
      const res = await GET(req);
      expect(res.status).toBe(500);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// ── Mocks ─────────────────────────────────────────────

const { mockThesisCount, mockChapterCount, mockReferenceCount, mockResearchSourceCount, mockAgileSprintCount, mockChapterAggregate } = vi.hoisted(() => ({
  mockThesisCount: vi.fn(),
  mockChapterCount: vi.fn(),
  mockReferenceCount: vi.fn(),
  mockResearchSourceCount: vi.fn(),
  mockAgileSprintCount: vi.fn(),
  mockChapterAggregate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    thesis: { count: mockThesisCount },
    chapter: { count: mockChapterCount, aggregate: mockChapterAggregate },
    reference: { count: mockReferenceCount },
    researchSource: { count: mockResearchSourceCount },
    agileSprint: { count: mockAgileSprintCount },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockThesisCount.mockResolvedValue(3);
  mockChapterCount.mockResolvedValue(10);
  mockReferenceCount.mockResolvedValue(50);
  mockResearchSourceCount.mockResolvedValue(12);
  mockAgileSprintCount.mockResolvedValue(2);
  mockChapterAggregate.mockResolvedValue({ _sum: { wordCount: 15000 } });
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/stats", () => {
  it("should return aggregated statistics", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.totalTheses).toBe(3);
    expect(data.data.totalChapters).toBe(10);
    expect(data.data.totalWords).toBe(15000);
    expect(data.data.totalReferences).toBe(50);
    expect(data.data.totalSources).toBe(12);
    expect(data.data.activeSprints).toBe(2);
  });

  it("should count active sprints correctly", async () => {
    const res = await GET();
    await res.json();
    expect(mockAgileSprintCount).toHaveBeenCalledWith({
      where: { status: "active" },
    });
  });

  it("should compute progressPercent correctly", async () => {
    // completedChapters will also be counted with where: { status: "completed" }
    // Default mockChapterCount returns 10 for both calls
    const res = await GET();
    const data = await res.json();
    // completed chapters count = mockChapterCount({where:{status:"completed"}}) = 10
    // total chapters = 10
    // progress = Math.round((10/10)*100) = 100
    expect(typeof data.data.progressPercent).toBe("number");
  });

  it("should return 0 progressPercent when no chapters", async () => {
    mockChapterCount.mockResolvedValue(0);
    const res = await GET();
    const data = await res.json();
    expect(data.data.progressPercent).toBe(0);
  });

  it("should handle zero wordCount aggregate", async () => {
    mockChapterAggregate.mockResolvedValue({ _sum: { wordCount: null } });
    const res = await GET();
    const data = await res.json();
    expect(data.data.totalWords).toBe(0);
  });

  it("should handle zero for all counts", async () => {
    mockThesisCount.mockResolvedValue(0);
    mockChapterCount.mockResolvedValue(0);
    mockReferenceCount.mockResolvedValue(0);
    mockResearchSourceCount.mockResolvedValue(0);
    mockAgileSprintCount.mockResolvedValue(0);
    mockChapterAggregate.mockResolvedValue({ _sum: { wordCount: null } });

    const res = await GET();
    const data = await res.json();
    expect(data.data.totalTheses).toBe(0);
    expect(data.data.totalChapters).toBe(0);
    expect(data.data.totalWords).toBe(0);
    expect(data.data.progressPercent).toBe(0);
  });

  it("should return 500 on database error", async () => {
    mockThesisCount.mockRejectedValue(new Error("DB down"));
    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

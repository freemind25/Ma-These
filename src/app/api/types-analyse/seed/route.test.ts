import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// ── Mocks ─────────────────────────────────────────────

const { mockFindFirst, mockCreate } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    typeAnalyseMethodologique: {
      findFirst: mockFindFirst,
      create: mockCreate,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────

describe("POST /api/types-analyse/seed", () => {
  it("should return existing type if already seeded", async () => {
    const existing = {
      id: "ta-existing",
      discipline: "analyse_urbaine",
      nom: "Diagnostic morphologique complet",
    };
    mockFindFirst.mockResolvedValue(existing);

    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe("ta-existing");
    expect(data.seeded).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should create a new type when not yet seeded", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "ta-new",
      discipline: "analyse_urbaine",
      nom: "Diagnostic morphologique complet",
    });

    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.seeded).toBe(true);
    expect(data.data.discipline).toBe("analyse_urbaine");
    expect(data.data.nom).toBe("Diagnostic morphologique complet");
  });

  it("should search for analyse_urbaine discipline", async () => {
    mockFindFirst.mockResolvedValue(null);
    await POST();
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { discipline: "analyse_urbaine" },
    });
  });

  it("should create with correct elementsAttendus", async () => {
    mockFindFirst.mockResolvedValue(null);
    await POST();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discipline: "analyse_urbaine",
          nom: "Diagnostic morphologique complet",
        }),
      })
    );
  });

  it("should include a non-empty promptQuestionneur", async () => {
    mockFindFirst.mockResolvedValue(null);
    await POST();
    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.promptQuestionneur).toBeTruthy();
    expect(typeof callData.promptQuestionneur).toBe("string");
  });

  it("should include a non-empty elementsAttendus JSON", async () => {
    mockFindFirst.mockResolvedValue(null);
    await POST();
    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.elementsAttendus).toBeTruthy();
    const parsed = JSON.parse(callData.elementsAttendus);
    expect(parsed).toHaveProperty("prealable");
    expect(parsed).toHaveProperty("phases");
  });

  it("should return 500 on db error", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB down"));
    const res = await POST();
    expect(res.status).toBe(500);
  });
});

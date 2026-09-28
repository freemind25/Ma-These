import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockGetAllFiches, mockDetectRelevantFiches, mockGetFichesContentForPrompt, mockGetFicheById } = vi.hoisted(() => ({
  mockGetAllFiches: vi.fn(),
  mockDetectRelevantFiches: vi.fn(),
  mockGetFichesContentForPrompt: vi.fn(),
  mockGetFicheById: vi.fn(),
}));

vi.mock("@/data/corpus-publication", () => ({
  getAllFiches: mockGetAllFiches,
  detectRelevantFiches: mockDetectRelevantFiches,
  getFichesContentForPrompt: mockGetFichesContentForPrompt,
  getFicheById: mockGetFicheById,
}));

// ── Helpers ───────────────────────────────────────────

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/corpus-publication", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockFiches = [
  { id: "f1", title: "Fiche 1", content: "Content 1" },
  { id: "f2", title: "Fiche 2", content: "Content 2" },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAllFiches.mockReturnValue(mockFiches);
  mockDetectRelevantFiches.mockReturnValue(["f1"]);
  mockGetFichesContentForPrompt.mockReturnValue("Prompt content");
  mockGetFicheById.mockImplementation((id: string) =>
    mockFiches.find((f) => f.id === id)
  );
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/corpus-publication", () => {
  it("should return all fiches", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(2);
  });

  it("should return empty array when no fiches", async () => {
    mockGetAllFiches.mockReturnValue([]);
    const res = await GET();
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("should return 500 when getAllFiches throws", async () => {
    mockGetAllFiches.mockImplementation(() => {
      throw new Error("Data error");
    });
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/corpus-publication", () => {
  it("should detect relevant fiches for a message", async () => {
    const req = makePostRequest({ message: "How to write a good introduction?" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.ficheIds).toEqual(["f1"]);
    expect(data.data.fiches).toHaveLength(1);
    expect(data.data.promptContent).toBe("Prompt content");
  });

  it("should call detectRelevantFiches with message and maxFiches", async () => {
    const req = makePostRequest({
      message: "Test",
      maxFiches: 3,
    });
    await POST(req);
    expect(mockDetectRelevantFiches).toHaveBeenCalledWith("Test", 3);
  });

  it("should use default maxFiches when not provided", async () => {
    const req = makePostRequest({ message: "Test" });
    await POST(req);
    expect(mockDetectRelevantFiches).toHaveBeenCalledWith("Test", undefined);
  });

  it("should return 500 for missing message (caught by generic catch)", async () => {
    const req = makePostRequest({});
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("should return 500 for empty message (caught by generic catch)", async () => {
    const req = makePostRequest({ message: "" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("should return 500 for invalid maxFiches (0, caught by generic catch)", async () => {
    const req = makePostRequest({ message: "Test", maxFiches: 0 });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("should return 500 for maxFiches > 6 (caught by generic catch)", async () => {
    const req = makePostRequest({ message: "Test", maxFiches: 10 });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("should handle no matching fiches gracefully", async () => {
    mockDetectRelevantFiches.mockReturnValue([]);
    const req = makePostRequest({ message: "Unrelated topic" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.ficheIds).toEqual([]);
    expect(data.data.fiches).toEqual([]);
  });

  it("should handle getFicheById returning undefined", async () => {
    mockDetectRelevantFiches.mockReturnValue(["f-nonexistent"]);
    mockGetFicheById.mockReturnValue(undefined);
    const req = makePostRequest({ message: "Test" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.data.fiches).toEqual([]);
  });

  it("should return 500 on unexpected error", async () => {
    mockDetectRelevantFiches.mockImplementation(() => {
      throw new Error("Unexpected");
    });
    const req = makePostRequest({ message: "Test" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

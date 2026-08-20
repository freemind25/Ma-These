import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockFindMany, mockCreate, mockTransaction } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    thesisCadrage: {
      findMany: mockFindMany,
      create: mockCreate,
      updateMany: vi.fn(),
    },
    $transaction: mockTransaction,
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/thesis/t1/cadrages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockCadrage = {
  id: "cad-1",
  thesisId: "t1",
  label: "Cadrage 1",
  isActive: true,
  fields: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindMany.mockResolvedValue([]);
  mockTransaction.mockImplementation(async (fn: (...args: unknown[]) => Promise<unknown>) => fn({
    thesisCadrage: {
      updateMany: vi.fn(),
      create: mockCreate,
    },
  }));
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/thesis/[id]/cadrages", () => {
  it("should return cadrages for a thesis", async () => {
    mockFindMany.mockResolvedValue([mockCadrage]);
    const res = await GET(new NextRequest("http://x"), makeParams("t1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.meta.count).toBe(1);
  });

  it("should return empty array when no cadrages", async () => {
    const res = await GET(new NextRequest("http://x"), makeParams("t1"));
    const data = await res.json();
    expect(data.data).toEqual([]);
    expect(data.meta.count).toBe(0);
  });

  it("should query with correct thesisId", async () => {
    await GET(new NextRequest("http://x"), makeParams("t1"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { thesisId: "t1" },
      })
    );
  });

  it("should include fields ordered by sortOrder asc", async () => {
    await GET(new NextRequest("http://x"), makeParams("t1"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { fields: { orderBy: { sortOrder: "asc" } } },
      })
    );
  });

  it("should order cadrages by createdAt desc", async () => {
    await GET(new NextRequest("http://x"), makeParams("t1"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("should return 500 on db error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));
    const res = await GET(new NextRequest("http://x"), makeParams("t1"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/thesis/[id]/cadrages", () => {
  it("should create a cadrage with 201", async () => {
    mockCreate.mockResolvedValue(mockCadrage);
    const req = makePostRequest({
      thesisId: "t1",
      label: "Cadrage test",
      fields: [
        { fieldKey: "auteur", label: "Auteur", value: "Dupont" },
      ],
    });
    const res = await POST(req, makeParams("t1"));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data).toBeDefined();
  });

  it("should return 400 if thesisId in body does not match route param", async () => {
    const req = makePostRequest({
      thesisId: "t2",
      label: "Wrong thesis",
    });
    const res = await POST(req, makeParams("t1"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("ne correspond pas");
  });

  it("should return 400 for missing thesisId", async () => {
    const req = makePostRequest({ label: "No thesis" });
    const res = await POST(req, makeParams("t1"));
    expect(res.status).toBe(400);
  });

  it("should create cadrage without fields", async () => {
    mockCreate.mockResolvedValue({ ...mockCadrage, fields: [] });
    const req = makePostRequest({
      thesisId: "t1",
      label: "Simple cadrage",
    });
    const res = await POST(req, makeParams("t1"));
    expect(res.status).toBe(201);
  });

  it("should use transaction for creating with fields", async () => {
    mockCreate.mockResolvedValue(mockCadrage);
    const req = makePostRequest({
      thesisId: "t1",
      label: "With fields",
      fields: [
        { fieldKey: "k1", label: "L1", value: "V1", sortOrder: 0 },
        { fieldKey: "k2", label: "L2", value: "V2" },
      ],
    });
    await POST(req, makeParams("t1"));
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("should return 400 for invalid field data", async () => {
    const req = makePostRequest({
      thesisId: "t1",
      fields: [{ badField: true }],
    });
    const res = await POST(req, makeParams("t1"));
    expect(res.status).toBe(400);
  });

  it("should return 500 on db error", async () => {
    mockTransaction.mockImplementation(async () => {
      throw new Error("DB error");
    });
    const req = makePostRequest({
      thesisId: "t1",
      label: "Test",
    });
    const res = await POST(req, makeParams("t1"));
    expect(res.status).toBe(500);
  });
});

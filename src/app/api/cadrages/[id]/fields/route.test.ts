import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockFindMany, mockCount, mockCreate } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    thesisCadrageField: {
      findMany: mockFindMany,
      count: mockCount,
      create: mockCreate,
    },
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/cadrages/c1/fields", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockField = {
  id: "f-1",
  cadrageId: "c1",
  fieldKey: "auteur",
  label: "Auteur",
  value: "Dupont",
  sortOrder: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindMany.mockResolvedValue([]);
  mockCount.mockResolvedValue(0);
  mockCreate.mockResolvedValue(mockField);
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/cadrages/[id]/fields", () => {
  it("should return fields for a cadrage", async () => {
    mockFindMany.mockResolvedValue([mockField]);
    const res = await GET(new NextRequest("http://x"), makeParams("c1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.meta.count).toBe(1);
  });

  it("should return empty array when no fields", async () => {
    const res = await GET(new NextRequest("http://x"), makeParams("c1"));
    const data = await res.json();
    expect(data.data).toEqual([]);
    expect(data.meta.count).toBe(0);
  });

  it("should query with correct cadrageId", async () => {
    await GET(new NextRequest("http://x"), makeParams("c1"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cadrageId: "c1" },
      })
    );
  });

  it("should order by sortOrder asc", async () => {
    await GET(new NextRequest("http://x"), makeParams("c1"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { sortOrder: "asc" },
      })
    );
  });

  it("should return 500 on db error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));
    const res = await GET(new NextRequest("http://x"), makeParams("c1"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/cadrages/[id]/fields", () => {
  it("should create a field with 201", async () => {
    const req = makePostRequest({
      fieldKey: "auteur",
      label: "Auteur",
      value: "Dupont",
    });
    const res = await POST(req, makeParams("c1"));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.id).toBe("f-1");
  });

  it("should assign next sortOrder when not provided", async () => {
    mockCount.mockResolvedValue(3);
    const req = makePostRequest({
      fieldKey: "titre",
      label: "Titre",
      value: "Test",
    });
    await POST(req, makeParams("c1"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sortOrder: 3,
          cadrageId: "c1",
        }),
      })
    );
  });

  it("should use provided sortOrder when given", async () => {
    const req = makePostRequest({
      fieldKey: "titre",
      label: "Titre",
      value: "Test",
      sortOrder: 10,
    });
    await POST(req, makeParams("c1"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sortOrder: 10,
        }),
      })
    );
  });

  it("should default isLocked to false", async () => {
    const req = makePostRequest({
      fieldKey: "k",
      label: "L",
    });
    await POST(req, makeParams("c1"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isLocked: false,
        }),
      })
    );
  });

  it("should set isLocked when provided", async () => {
    const req = makePostRequest({
      fieldKey: "k",
      label: "L",
      isLocked: true,
    });
    await POST(req, makeParams("c1"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isLocked: true,
        }),
      })
    );
  });

  it("should pass aiSuggestion when provided", async () => {
    const req = makePostRequest({
      fieldKey: "k",
      label: "L",
      aiSuggestion: "Suggested value",
    });
    await POST(req, makeParams("c1"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          aiSuggestion: "Suggested value",
        }),
      })
    );
  });

  it("should return 400 for missing fieldKey", async () => {
    const req = makePostRequest({ label: "L" });
    const res = await POST(req, makeParams("c1"));
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing label", async () => {
    const req = makePostRequest({ fieldKey: "k" });
    const res = await POST(req, makeParams("c1"));
    expect(res.status).toBe(400);
  });

  it("should return 500 on db error", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));
    const req = makePostRequest({
      fieldKey: "k",
      label: "L",
    });
    const res = await POST(req, makeParams("c1"));
    expect(res.status).toBe(500);
  });
});

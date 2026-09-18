import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockFindMany, mockCreate } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    thesisCadrageField: {
      findMany: mockFindMany,
    },
    thesisCadrageVersion: {
      findMany: mockFindMany,
      create: mockCreate,
    },
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/cadrages/c1/versions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockVersion = {
  id: "v-1",
  cadrageId: "c1",
  label: "Version 1",
  snapshot: '[{"id":"f-1","value":"test"}]',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindMany.mockResolvedValue([]);
  mockCreate.mockResolvedValue(mockVersion);
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/cadrages/[id]/versions", () => {
  it("should return versions for a cadrage", async () => {
    mockFindMany.mockResolvedValue([mockVersion]);
    const res = await GET(new NextRequest("http://x"), makeParams("c1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.meta.count).toBe(1);
  });

  it("should return empty array when no versions", async () => {
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

  it("should order by createdAt desc", async () => {
    await GET(new NextRequest("http://x"), makeParams("c1"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("should return 500 on db error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));
    const res = await GET(new NextRequest("http://x"), makeParams("c1"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/cadrages/[id]/versions", () => {
  it("should create a version with 201", async () => {
    const req = makePostRequest({ label: "Snapshot 1" });
    const res = await POST(req, makeParams("c1"));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.id).toBe("v-1");
  });

  it("should snapshot all fields as JSON", async () => {
    mockFindMany.mockResolvedValue([
      { id: "f-1", fieldKey: "auteur", label: "Auteur", value: "Dupont" },
      { id: "f-2", fieldKey: "date", label: "Date", value: "2025" },
    ]);

    const req = makePostRequest({ label: "v1" });
    await POST(req, makeParams("c1"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          snapshot: expect.stringContaining("Dupont"),
        }),
      })
    );
  });

  it("should create version without label", async () => {
    const req = makePostRequest({});
    const res = await POST(req, makeParams("c1"));
    expect(res.status).toBe(201);
  });

  it("should handle empty fields array for snapshot", async () => {
    mockFindMany.mockResolvedValue([]);
    const req = makePostRequest({ label: "empty" });
    await POST(req, makeParams("c1"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          snapshot: "[]",
        }),
      })
    );
  });

  it("should return 500 on db error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));
    const req = makePostRequest({ label: "test" });
    const res = await POST(req, makeParams("c1"));
    expect(res.status).toBe(500);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH, DELETE } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockFindUnique, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    elementAnalyse: {
      findUnique: mockFindUnique,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePatchRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/elements-analyse/el-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockElement = {
  id: "el-1",
  nom: "Périmètre urbain",
  typeElement: "perimetre_urbain",
  natureElement: "spatial",
  sousAnalyse: null,
  source: "IGN",
  dateSource: new Date("2024-01-01"),
  geojson: null,
  styleConfig: null,
  chapitreId: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindUnique.mockResolvedValue(mockElement);
  mockUpdate.mockResolvedValue(mockElement);
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/elements-analyse/[id]", () => {
  it("should return an element by id", async () => {
    const res = await GET(new NextRequest("http://x"), makeParams("el-1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe("el-1");
    expect(data.data.nom).toBe("Périmètre urbain");
  });

  it("should return 404 when element not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://x"), makeParams("nonexistent"));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Élément non trouvé");
  });

  it("should return 500 on db error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB down"));
    const res = await GET(new NextRequest("http://x"), makeParams("el-1"));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/elements-analyse/[id]", () => {
  it("should update nom", async () => {
    const req = makePatchRequest({ nom: "New name" });
    const res = await PATCH(req, makeParams("el-1"));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "el-1" },
        data: expect.objectContaining({ nom: "New name" }),
      })
    );
  });

  it("should update typeElement", async () => {
    const req = makePatchRequest({ typeElement: "zonage" });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ typeElement: "zonage" }),
      })
    );
  });

  it("should update natureElement", async () => {
    const req = makePatchRequest({ natureElement: "bibliographique" });
    const res = await PATCH(req, makeParams("el-1"));
    expect(res.status).toBe(200);
  });

  it("should update source", async () => {
    const req = makePatchRequest({ source: "OSM" });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ source: "OSM" }),
      })
    );
  });

  it("should update sousAnalyse", async () => {
    const req = makePatchRequest({ sousAnalyse: "morpho" });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sousAnalyse: "morpho" }),
      })
    );
  });

  it("should set sousAnalyse to null", async () => {
    const req = makePatchRequest({ sousAnalyse: null });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sousAnalyse: null }),
      })
    );
  });

  it("should update geojson (serialize to string)", async () => {
    const geojson = { type: "Polygon", coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]] };
    const req = makePatchRequest({ geojson });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ geojson: JSON.stringify(geojson) }),
      })
    );
  });

  it("should set geojson to null when null passed", async () => {
    const req = makePatchRequest({ geojson: null });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ geojson: null }),
      })
    );
  });

  it("should update styleConfig (serialize to string)", async () => {
    const styleConfig = { color: "blue" };
    const req = makePatchRequest({ styleConfig });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ styleConfig: JSON.stringify(styleConfig) }),
      })
    );
  });

  it("should update dateSource from ISO string to Date", async () => {
    const req = makePatchRequest({ dateSource: "2025-01-01T00:00:00Z" });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dateSource: expect.any(Date) }),
      })
    );
  });

  it("should set dateSource to null when null passed", async () => {
    const req = makePatchRequest({ dateSource: null });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dateSource: null }),
      })
    );
  });

  it("should update chapitreId", async () => {
    const req = makePatchRequest({ chapitreId: "ch-5" });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ chapitreId: "ch-5" }),
      })
    );
  });

  it("should set chapitreId to null", async () => {
    const req = makePatchRequest({ chapitreId: null });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ chapitreId: null }),
      })
    );
  });

  it("should include updatedAt in data", async () => {
    const req = makePatchRequest({ nom: "X" });
    await PATCH(req, makeParams("el-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ updatedAt: expect.any(Date) }),
      })
    );
  });

  it("should return 400 for invalid natureElement", async () => {
    const req = makePatchRequest({ natureElement: "invalid" });
    const res = await PATCH(req, makeParams("el-1"));
    expect(res.status).toBe(400);
  });

  it("should return 400 for empty nom", async () => {
    const req = makePatchRequest({ nom: "" });
    const res = await PATCH(req, makeParams("el-1"));
    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid dateSource format", async () => {
    const req = makePatchRequest({ dateSource: "not-a-date" });
    const res = await PATCH(req, makeParams("el-1"));
    expect(res.status).toBe(400);
  });

  it("should return 500 on db error", async () => {
    mockUpdate.mockRejectedValue(new Error("DB error"));
    const req = makePatchRequest({ nom: "X" });
    const res = await PATCH(req, makeParams("el-1"));
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/elements-analyse/[id]", () => {
  it("should delete and return { ok: true }", async () => {
    const req = new NextRequest("http://localhost:3000/api/elements-analyse/el-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("el-1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("should call delete with correct id", async () => {
    const req = new NextRequest("http://localhost:3000/api/elements-analyse/el-1", {
      method: "DELETE",
    });
    await DELETE(req, makeParams("el-1"));
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "el-1" } });
  });

  it("should return 500 on db error", async () => {
    mockDelete.mockRejectedValue(new Error("Foreign key constraint"));
    const req = new NextRequest("http://localhost:3000/api/elements-analyse/el-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("el-1"));
    expect(res.status).toBe(500);
  });
});

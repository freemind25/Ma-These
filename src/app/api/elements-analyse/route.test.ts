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
    elementAnalyse: {
      findMany: mockFindMany,
      create: mockCreate,
    },
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeGetRequest(url: string) {
  return new NextRequest(url);
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/elements-analyse", {
    method: "POST",
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
  dateSource: "2024-01-01T00:00:00Z",
  geojson: null,
  styleConfig: null,
  chapitreId: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindMany.mockResolvedValue([]);
  mockCreate.mockResolvedValue(mockElement);
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/elements-analyse", () => {
  it("should return elements list", async () => {
    mockFindMany.mockResolvedValue([mockElement]);
    const req = makeGetRequest("http://localhost:3000/api/elements-analyse");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
  });

  it("should return empty array when no elements", async () => {
    const req = makeGetRequest("http://localhost:3000/api/elements-analyse");
    const data = await (await GET(req)).json();
    expect(data.data).toEqual([]);
  });

  it("should filter by natureElement", async () => {
    const req = makeGetRequest(
      "http://localhost:3000/api/elements-analyse?natureElement=spatial"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ natureElement: "spatial" }),
      })
    );
  });

  it("should filter by sousAnalyse", async () => {
    const req = makeGetRequest(
      "http://localhost:3000/api/elements-analyse?sousAnalyse=morpho"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sousAnalyse: "morpho" }),
      })
    );
  });

  it("should filter by both natureElement and sousAnalyse", async () => {
    const req = makeGetRequest(
      "http://localhost:3000/api/elements-analyse?natureElement=spatial&sousAnalyse=morpho"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ natureElement: "spatial", sousAnalyse: "morpho" }),
      })
    );
  });

  it("should not filter when no params", async () => {
    const req = makeGetRequest("http://localhost:3000/api/elements-analyse");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
  });

  it("should order by createdAt asc", async () => {
    const req = makeGetRequest("http://localhost:3000/api/elements-analyse");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "asc" },
      })
    );
  });

  it("should return 500 on db error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));
    const req = makeGetRequest("http://localhost:3000/api/elements-analyse");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/elements-analyse", () => {
  it("should create an element with 201", async () => {
    const req = makePostRequest({
      nom: "Périmètre urbain",
      typeElement: "perimetre_urbain",
      natureElement: "spatial",
      source: "IGN",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.id).toBe("el-1");
  });

  it("should serialize geojson to JSON string", async () => {
    const geojson = { type: "Point", coordinates: [4.85, 45.75] };
    const req = makePostRequest({
      nom: "Point",
      typeElement: "point_repere",
      natureElement: "spatial",
      source: "GPS",
      geojson,
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          geojson: JSON.stringify(geojson),
        }),
      })
    );
  });

  it("should serialize styleConfig to JSON string", async () => {
    const styleConfig = { color: "red", weight: 2 };
    const req = makePostRequest({
      nom: "Line",
      typeElement: "trace_voirie",
      natureElement: "spatial",
      source: "OSM",
      styleConfig,
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          styleConfig: JSON.stringify(styleConfig),
        }),
      })
    );
  });

  it("should convert dateSource string to Date", async () => {
    const req = makePostRequest({
      nom: "Data",
      typeElement: "occupation_sol",
      natureElement: "spatial",
      source: "IGN",
      dateSource: "2024-06-15T00:00:00Z",
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dateSource: expect.any(Date),
        }),
      })
    );
  });

  it("should accept optional sousAnalyse", async () => {
    const req = makePostRequest({
      nom: "Zonage",
      typeElement: "zonage",
      natureElement: "spatial",
      source: "IGN",
      sousAnalyse: "morpho",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("should accept optional chapitreId", async () => {
    const req = makePostRequest({
      nom: "Ref",
      typeElement: "ref",
      natureElement: "bibliographique",
      source: "Scopus",
      chapitreId: "ch-1",
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ chapitreId: "ch-1" }),
      })
    );
  });

  it("should accept all natureElement values", async () => {
    const natures = ["spatial", "bibliographique", "donnee_enquete", "document"];
    for (const nature of natures) {
      const req = makePostRequest({
        nom: `El ${nature}`,
        typeElement: "test",
        natureElement: nature,
        source: "Test",
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    }
  });

  it("should reject invalid natureElement", async () => {
    const req = makePostRequest({
      nom: "Bad",
      typeElement: "test",
      natureElement: "invalid_nature",
      source: "Test",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing nom", async () => {
    const req = makePostRequest({
      typeElement: "test",
      natureElement: "spatial",
      source: "Test",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing typeElement", async () => {
    const req = makePostRequest({
      nom: "Test",
      natureElement: "spatial",
      source: "Test",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing source", async () => {
    const req = makePostRequest({
      nom: "Test",
      typeElement: "test",
      natureElement: "spatial",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing natureElement", async () => {
    const req = makePostRequest({
      nom: "Test",
      typeElement: "test",
      source: "Test",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 500 on db error", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));
    const req = makePostRequest({
      nom: "Test",
      typeElement: "test",
      natureElement: "spatial",
      source: "Test",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

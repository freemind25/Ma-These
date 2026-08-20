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
    typeAnalyseMethodologique: {
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
  return new NextRequest("http://localhost:3000/api/types-analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockType = {
  id: "ta-1",
  discipline: "analyse_urbaine",
  nom: "Diagnostic morphologique",
  elementsAttendus: '{"phases":[]}',
  promptQuestionneur: "Custom prompt",
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindMany.mockResolvedValue([]);
  mockCreate.mockResolvedValue(mockType);
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/types-analyse", () => {
  it("should return types list", async () => {
    mockFindMany.mockResolvedValue([mockType]);
    const req = makeGetRequest("http://localhost:3000/api/types-analyse");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
  });

  it("should return empty array when no types", async () => {
    const req = makeGetRequest("http://localhost:3000/api/types-analyse");
    const data = await (await GET(req)).json();
    expect(data.data).toEqual([]);
  });

  it("should filter by discipline", async () => {
    const req = makeGetRequest(
      "http://localhost:3000/api/types-analyse?discipline=analyse_urbaine"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { discipline: "analyse_urbaine" },
      })
    );
  });

  it("should not filter when no discipline param", async () => {
    const req = makeGetRequest("http://localhost:3000/api/types-analyse");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
  });

  it("should order by createdAt asc", async () => {
    const req = makeGetRequest("http://localhost:3000/api/types-analyse");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "asc" },
      })
    );
  });

  it("should return 500 on db error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));
    const req = makeGetRequest("http://localhost:3000/api/types-analyse");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/types-analyse", () => {
  it("should create a type with 201", async () => {
    const req = makePostRequest({
      discipline: "geographie",
      nom: "Analyse spatiale",
      elementsAttendus: { phases: [] },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.id).toBe("ta-1");
  });

  it("should serialize elementsAttendus to JSON string", async () => {
    const elements = { phases: [{ elements: [] }], prealable: { elements: [] } };
    const req = makePostRequest({
      discipline: "geo",
      nom: "Test",
      elementsAttendus: elements,
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          elementsAttendus: JSON.stringify(elements),
        }),
      })
    );
  });

  it("should include optional promptQuestionneur", async () => {
    const req = makePostRequest({
      discipline: "geo",
      nom: "Test",
      elementsAttendus: {},
      promptQuestionneur: "Custom prompt for this type",
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          promptQuestionneur: "Custom prompt for this type",
        }),
      })
    );
  });

  it("should set promptQuestionneur to null when not provided", async () => {
    const req = makePostRequest({
      discipline: "geo",
      nom: "Test",
      elementsAttendus: {},
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          promptQuestionneur: null,
        }),
      })
    );
  });

  it("should return 400 for missing discipline", async () => {
    const req = makePostRequest({
      nom: "Test",
      elementsAttendus: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing nom", async () => {
    const req = makePostRequest({
      discipline: "geo",
      elementsAttendus: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing elementsAttendus", async () => {
    const req = makePostRequest({
      discipline: "geo",
      nom: "Test",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should accept empty object for elementsAttendus", async () => {
    const req = makePostRequest({
      discipline: "geo",
      nom: "Test",
      elementsAttendus: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("should return 500 on db error", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));
    const req = makePostRequest({
      discipline: "geo",
      nom: "Test",
      elementsAttendus: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

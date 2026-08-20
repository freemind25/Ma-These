import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { db } from "@/lib/db";

// ── Mocks ───────────────────────────────────────────────────────────────
const mockFindMany = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    aiToolConfig: {
      findMany: (...args: any[]) => mockFindMany(...args),
      create: (...args: any[]) => mockCreate(...args),
    },
  },
}));

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/ai-config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with list of configs ordered by createdAt desc", async () => {
    const configs = [
      { id: "2", provider: "openai", createdAt: "2025-01-02" },
      { id: "1", provider: "zai", createdAt: "2025-01-01" },
    ];
    mockFindMany.mockResolvedValue(configs);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(configs);
    expect(data.meta.count).toBe(2);
    expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
  });

  it("should return 200 with empty array when no configs exist", async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.meta.count).toBe(0);
  });

  it("should return 500 when database query fails", async () => {
    mockFindMany.mockRejectedValue(new Error("DB connection lost"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("récupération");
  });
});

describe("POST /api/ai-config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Success cases ─────────────────────────────────────────────────────
  it("should create config and return 201", async () => {
    const newConfig = { id: "cfg-1", provider: "openai", model: "gpt-4o", isActive: false };
    mockCreate.mockResolvedValue(newConfig);

    const res = await POST(
      createRequest({ provider: "openai", model: "gpt-4o" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data).toEqual(newConfig);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ provider: "openai", model: "gpt-4o" }),
      })
    );
  });

  it("should create config with isActive defaulting to false", async () => {
    mockCreate.mockResolvedValue({ id: "cfg-1", provider: "zai", isActive: false });

    const res = await POST(
      createRequest({ provider: "zai" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data.isActive).toBe(false);
  });

  it("should create config with isActive explicitly set to true", async () => {
    mockCreate.mockResolvedValue({ id: "cfg-1", provider: "mistral", isActive: true });

    const res = await POST(
      createRequest({ provider: "mistral", isActive: true }) as any
    );

    expect(res.status).toBe(201);
  });

  it("should create config with apiKey", async () => {
    mockCreate.mockResolvedValue({
      id: "cfg-1",
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
    });

    const res = await POST(
      createRequest({
        provider: "openai",
        apiKey: "sk-test",
        model: "gpt-4o-mini",
      }) as any
    );

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ apiKey: "sk-test" }),
      })
    );
  });

  it("should accept all valid provider values", async () => {
    const providers = ["openai", "anthropic", "mistral", "routesme", "zai", "custom"];

    for (const provider of providers) {
      mockCreate.mockResolvedValue({ id: "cfg-1", provider });
      const res = await POST(
        createRequest({ provider }) as any
      );
      expect(res.status).toBe(201);
    }
  });

  // ── Validation errors ──────────────────────────────────────────────────
  it("should return 400 for missing provider", async () => {
    const res = await POST(
      createRequest({ model: "gpt-4o" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("invalides");
  });

  it("should return 400 for invalid provider value", async () => {
    const res = await POST(
      createRequest({ provider: "google-ai" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("invalides");
    expect(data.details).toBeDefined();
  });

  it("should return 400 with details for ZodError", async () => {
    const res = await POST(
      createRequest({ provider: "invalid" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.details).toBeDefined();
  });

  it("should return 500 when database create fails", async () => {
    mockCreate.mockRejectedValue(new Error("Unique constraint violation"));

    const res = await POST(
      createRequest({ provider: "openai" }) as any
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("création");
  });

  it("should return 500 for invalid JSON body", async () => {
    const req = new Request("http://localhost:3000/api/ai-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as any);

    expect(res.status).toBe(500);
  });

  it("should return 400 for empty body", async () => {
    const res = await POST(createRequest({}) as any);

    expect(res.status).toBe(400);
  });
});

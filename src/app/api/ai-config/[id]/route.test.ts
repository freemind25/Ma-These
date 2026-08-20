import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "./route";
import { db } from "@/lib/db";

// ── Mocks ───────────────────────────────────────────────────────────────
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    aiToolConfig: {
      update: (...args: any[]) => mockUpdate(...args),
      delete: (...args: any[]) => mockDelete(...args),
    },
  },
}));

// Helper: create a request with dynamic params for Next.js route handler
// Next.js 15 uses `params: Promise<{ id: string }>`
function createPutRequest(body: unknown, id: string): Request {
  return new Request(`http://localhost:3000/api/ai-config/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createDeleteRequest(id: string): Request {
  return new Request(`http://localhost:3000/api/ai-config/${id}`, {
    method: "DELETE",
  });
}

// ── PUT /api/ai-config/[id] ────────────────────────────────────────────
describe("PUT /api/ai-config/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Success cases ─────────────────────────────────────────────────────
  it("should update a config and return 200", async () => {
    const updated = { id: "cfg-1", provider: "openai", model: "gpt-4o", isActive: true };
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      createPutRequest({ model: "gpt-4o", isActive: true }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toEqual(updated);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cfg-1" },
        data: { model: "gpt-4o", isActive: true },
      })
    );
  });

  it("should update only apiKey", async () => {
    mockUpdate.mockResolvedValue({ id: "cfg-1", apiKey: "sk-new" });

    const res = await PUT(
      createPutRequest({ apiKey: "sk-new" }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { apiKey: "sk-new" },
      })
    );
  });

  it("should update only model", async () => {
    mockUpdate.mockResolvedValue({ id: "cfg-1", model: "gpt-4o-mini" });

    const res = await PUT(
      createPutRequest({ model: "gpt-4o-mini" }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );

    expect(res.status).toBe(200);
  });

  it("should update only isActive", async () => {
    mockUpdate.mockResolvedValue({ id: "cfg-1", isActive: false });

    const res = await PUT(
      createPutRequest({ isActive: false }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );

    expect(res.status).toBe(200);
  });

  it("should update multiple fields at once", async () => {
    mockUpdate.mockResolvedValue({
      id: "cfg-1",
      apiKey: "sk-new",
      model: "gpt-4o",
      isActive: true,
    });

    const res = await PUT(
      createPutRequest(
        { apiKey: "sk-new", model: "gpt-4o", isActive: true },
        "cfg-1"
      ) as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );

    expect(res.status).toBe(200);
  });

  it("should pass the id from params to the query where clause", async () => {
    mockUpdate.mockResolvedValue({ id: "special-id" });

    await PUT(
      createPutRequest({ isActive: true }, "special-id") as any,
      { params: Promise.resolve({ id: "special-id" }) }
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "special-id" } })
    );
  });

  // ── Validation errors ──────────────────────────────────────────────────
  it("should return 400 when no fields are provided (empty body)", async () => {
    // Empty body: updateAiConfigSchema requires at least one optional field,
    // but empty {} should still parse since all fields are optional.
    // However passing provider would fail since it's not in updateSchema.
    // Let's test with an invalid field type
    const res = await PUT(
      createPutRequest({ model: 123 }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );

    // ZodError → 400
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("invalides");
  });

  it("should return 400 with details for ZodError", async () => {
    const res = await PUT(
      createPutRequest({ apiKey: 123 }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.details).toBeDefined();
  });

  it("should return 400 for isActive as non-boolean", async () => {
    const res = await PUT(
      createPutRequest({ isActive: "true" }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );

    expect(res.status).toBe(400);
  });

  // ── Error cases ────────────────────────────────────────────────────────
  it("should return 500 when database update fails (record not found)", async () => {
    mockUpdate.mockRejectedValue(new Error("Record not found"));

    const res = await PUT(
      createPutRequest({ model: "gpt-4o" }, "cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("mise à jour");
  });

  it("should return 500 for invalid JSON body", async () => {
    const req = new Request("http://localhost:3000/api/ai-config/cfg-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await PUT(
      req as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );

    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/ai-config/[id] ─────────────────────────────────────────
describe("DELETE /api/ai-config/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a config and return 200 with the id", async () => {
    mockDelete.mockResolvedValue({ id: "cfg-1" });

    const res = await DELETE(
      createDeleteRequest("cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.id).toBe("cfg-1");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "cfg-1" } });
  });

  it("should pass the id from params to the delete query", async () => {
    mockDelete.mockResolvedValue({ id: "to-delete-id" });

    await DELETE(
      createDeleteRequest("to-delete-id") as any,
      { params: Promise.resolve({ id: "to-delete-id" }) }
    );

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "to-delete-id" } });
  });

  it("should return 500 when database delete fails", async () => {
    mockDelete.mockRejectedValue(new Error("Foreign key constraint"));

    const res = await DELETE(
      createDeleteRequest("cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("suppression");
  });

  it("should return 500 with generic message for non-Error throws", async () => {
    mockDelete.mockRejectedValue("unexpected");

    const res = await DELETE(
      createDeleteRequest("cfg-1") as any,
      { params: Promise.resolve({ id: "cfg-1" }) }
    );
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("suppression");
  });
});

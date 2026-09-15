import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    thesisCadrageField: {
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeParams(fieldId: string) {
  return { params: Promise.resolve({ fieldId }) };
}

function makePutRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/cadrages/fields/f1", {
    method: "PUT",
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
  isLocked: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdate.mockResolvedValue(mockField);
  mockDelete.mockResolvedValue(mockField);
});

// ── Tests ─────────────────────────────────────────────

describe("PUT /api/cadrages/fields/[fieldId]", () => {
  it("should update a field", async () => {
    const req = makePutRequest({ label: "Updated label" });
    const res = await PUT(req, makeParams("f-1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toBeDefined();
  });

  it("should update with fieldId from params", async () => {
    const req = makePutRequest({ value: "New value" });
    await PUT(req, makeParams("f-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "f-1" },
      })
    );
  });

  it("should update label", async () => {
    const req = makePutRequest({ label: "New Label" });
    await PUT(req, makeParams("f-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { label: "New Label" },
      })
    );
  });

  it("should update value", async () => {
    const req = makePutRequest({ value: "New Value" });
    await PUT(req, makeParams("f-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { value: "New Value" },
      })
    );
  });

  it("should update isLocked", async () => {
    const req = makePutRequest({ isLocked: true });
    await PUT(req, makeParams("f-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isLocked: true },
      })
    );
  });

  it("should update sortOrder", async () => {
    const req = makePutRequest({ sortOrder: 5 });
    await PUT(req, makeParams("f-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { sortOrder: 5 },
      })
    );
  });

  it("should update aiSuggestion", async () => {
    const req = makePutRequest({ aiSuggestion: "Try this" });
    await PUT(req, makeParams("f-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { aiSuggestion: "Try this" },
      })
    );
  });

  it("should update multiple fields at once", async () => {
    const req = makePutRequest({ label: "L", value: "V", isLocked: true });
    await PUT(req, makeParams("f-1"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { label: "L", value: "V", isLocked: true },
      })
    );
  });

  it("should return 400 for invalid data", async () => {
    const req = makePutRequest({ sortOrder: "not a number" });
    const res = await PUT(req, makeParams("f-1"));
    expect(res.status).toBe(400);
  });

  it("should return 500 on db error", async () => {
    mockUpdate.mockRejectedValue(new Error("DB down"));
    const req = makePutRequest({ label: "Test" });
    const res = await PUT(req, makeParams("f-1"));
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/cadrages/fields/[fieldId]", () => {
  it("should delete a field and return its id", async () => {
    const req = new NextRequest("http://localhost:3000/api/cadrages/fields/f1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("f-1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe("f-1");
  });

  it("should call delete with correct fieldId", async () => {
    const req = new NextRequest("http://localhost:3000/api/cadrages/fields/f1", {
      method: "DELETE",
    });
    await DELETE(req, makeParams("f-1"));
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "f-1" } });
  });

  it("should return 500 on db error", async () => {
    mockDelete.mockRejectedValue(new Error("Foreign key constraint"));
    const req = new NextRequest("http://localhost:3000/api/cadrages/fields/f1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("f-1"));
    expect(res.status).toBe(500);
  });
});

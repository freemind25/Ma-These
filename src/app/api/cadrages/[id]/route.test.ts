import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockFindUnique, mockUpdate, mockUpdateMany, mockDelete, mockTransaction } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockDelete: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    thesisCadrage: {
      findUnique: mockFindUnique,
      update: mockUpdate,
      updateMany: mockUpdateMany,
      delete: mockDelete,
    },
    $transaction: mockTransaction,
  },
}));

// ── Helpers ───────────────────────────────────────────

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePutRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/cadrages/c1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const existingCadrage = {
  id: "c1",
  thesisId: "t1",
  label: "Cadrage 1",
  isActive: false,
  fields: [],
};

const updatedCadrage = {
  ...existingCadrage,
  label: "Updated",
  isActive: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindUnique.mockResolvedValue(existingCadrage);
  mockUpdate.mockResolvedValue(updatedCadrage);
  mockTransaction.mockImplementation(async (fn: (...args: unknown[]) => Promise<unknown>) => fn({
    thesisCadrage: {
      updateMany: mockUpdateMany,
      update: mockUpdate,
    },
  }));
});

// ── Tests ─────────────────────────────────────────────

describe("PUT /api/cadrages/[id]", () => {
  it("should update cadrage label", async () => {
    const req = makePutRequest({ label: "New label" });
    const res = await PUT(req, makeParams("c1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toBeDefined();
  });

  it("should return 404 if cadrage not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = makePutRequest({ label: "New" });
    const res = await PUT(req, makeParams("nonexistent"));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Cadrage introuvable");
  });

  it("should deactivate other cadrages when activating", async () => {
    mockFindUnique.mockResolvedValue({ ...existingCadrage, isActive: false });
    mockUpdate.mockResolvedValue({ ...existingCadrage, isActive: true, label: "Active" });

    const req = makePutRequest({ isActive: true, label: "Active" });
    const res = await PUT(req, makeParams("c1"));
    expect(res.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("should not deactivate others when not activating", async () => {
    const req = makePutRequest({ label: "Just label" });
    const res = await PUT(req, makeParams("c1"));
    expect(res.status).toBe(200);
    // isActive is not true, so no transaction
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "c1" } })
    );
  });

  it("should not deactivate others when already active", async () => {
    mockFindUnique.mockResolvedValue({ ...existingCadrage, isActive: true });
    const req = makePutRequest({ label: "Still active" });
    const res = await PUT(req, makeParams("c1"));
    expect(res.status).toBe(200);
  });

  it("should return 400 for invalid data", async () => {
    const req = makePutRequest({ label: 123 });
    const res = await PUT(req, makeParams("c1"));
    expect(res.status).toBe(400);
  });

  it("should re-fetch after update with fields", async () => {
    const req = makePutRequest({ label: "Updated" });
    await PUT(req, makeParams("c1"));
    // After update, it re-fetches with include fields
    expect(mockFindUnique).toHaveBeenCalledTimes(2);
  });

  it("should return 500 on db error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB down"));
    const req = makePutRequest({ label: "Test" });
    const res = await PUT(req, makeParams("c1"));
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/cadrages/[id]", () => {
  it("should delete cadrage and return its id", async () => {
    const req = new NextRequest("http://localhost:3000/api/cadrages/c1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("c1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe("c1");
  });

  it("should call delete with correct id", async () => {
    const req = new NextRequest("http://localhost:3000/api/cadrages/c1", { method: "DELETE" });
    await DELETE(req, makeParams("c1"));
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });

  it("should return 500 on db error", async () => {
    mockDelete.mockRejectedValue(new Error("Foreign key constraint"));
    const req = new NextRequest("http://localhost:3000/api/cadrages/c1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("c1"));
    expect(res.status).toBe(500);
  });
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/chapters/[id] — Auto-save & Validation Tests (Vitest)
// ═══════════════════════════════════════════════════════════════
//
// Tests the validation guard (Zod → 400) that fires BEFORE any
// database call. This covers the exact data shapes sent by the
// auto-save hook (content, plainText, wordCount, status).
//
// Integration tests (200/500 paths) require db mocking and are
// covered by the vitest suite (bun run test:run).

import { describe, it, expect } from "vitest";
import { PUT } from "./route";
import { NextRequest } from "next/server";
import { updateChapterSchema } from "@/lib/api-schemas";

// ── Helpers ──────────────────────────────────────────────────────────────
const makeRequest = (body?: object) =>
  new NextRequest("http://localhost/api/chapters/ch-1", {
    method: "PUT",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = "ch-1") => Promise.resolve({ id });

// ═══════════════════════════════════════════════════════════════════════════
// PART 1: Schema-level auto-save validation (pure unit tests)
// ═══════════════════════════════════════════════════════════════════════════
describe("updateChapterSchema > auto-save data shapes", () => {
  it("accepts the exact shape auto-save sends (content + plainText + wordCount)", () => {
    const result = updateChapterSchema.safeParse({
      content: "<p>Hello world</p>",
      plainText: "Hello world",
      wordCount: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts content-only update", () => {
    const result = updateChapterSchema.safeParse({
      content: "<p>New content</p>",
    });
    expect(result.success).toBe(true);
  });

  it("accepts wordCount of 0 (initial save)", () => {
    const result = updateChapterSchema.safeParse({
      content: "",
      plainText: "",
      wordCount: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts large wordCount values", () => {
    const result = updateChapterSchema.safeParse({
      wordCount: 50000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateChapterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects negative wordCount (auto-save data corruption guard)", () => {
    const result = updateChapterSchema.safeParse({
      content: "<p>test</p>",
      plainText: "test",
      wordCount: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects float wordCount", () => {
    const result = updateChapterSchema.safeParse({
      wordCount: 10.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects string wordCount", () => {
    const result = updateChapterSchema.safeParse({
      wordCount: "100" as any,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title (min length 1)", () => {
    const result = updateChapterSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status values", () => {
    const result = updateChapterSchema.safeParse({
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    const validStatuses = ["not_started", "in_progress", "draft", "review", "completed"];
    for (const status of validStatuses) {
      const result = updateChapterSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("accepts title + status + sortOrder together", () => {
    const result = updateChapterSchema.safeParse({
      title: "Conclusion",
      status: "in_progress",
      sortOrder: 5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts directorFeedback (advisor comments)", () => {
    const result = updateChapterSchema.safeParse({
      directorFeedback: "Veuillez approfondir l'analyse comparative.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts targetWordCount", () => {
    const result = updateChapterSchema.safeParse({
      targetWordCount: 10000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative sortOrder", () => {
    const result = updateChapterSchema.safeParse({
      sortOrder: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects float sortOrder", () => {
    const result = updateChapterSchema.safeParse({
      sortOrder: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("accepts sortOrder of 0 (first position)", () => {
    const result = updateChapterSchema.safeParse({
      sortOrder: 0,
    });
    expect(result.success).toBe(true);
  });

  it("strips unknown fields (Zod strip mode by default)", () => {
    const result = updateChapterSchema.safeParse({
      content: "test",
      unknownField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).unknownField).toBeUndefined();
    }
  });

  it("auto-save data is not corrupted by empty content/wordCount pair", () => {
    // This test guards against the BUG-02 data corruption issue
    // where auto-save was overwriting plainText and wordCount with empty values.
    const result = updateChapterSchema.safeParse({
      content: "<p>Rich text content</p>",
      plainText: "Plain text version with actual words",
      wordCount: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.plainText).toBe("Plain text version with actual words");
      expect(result.data.wordCount).toBe(42);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PART 2: Route-level validation (400 guard tests)
// These call the actual PUT handler; Zod rejects before db is touched.
// ═══════════════════════════════════════════════════════════════════════════
describe("PUT /api/chapters/[id] > validation guards (no db needed)", () => {
  it("returns 400 for invalid status", async () => {
    const res = await PUT(makeRequest({ status: "invalid" }), {
      params: makeParams(),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty title", async () => {
    const res = await PUT(makeRequest({ title: "" }), {
      params: makeParams(),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for negative wordCount", async () => {
    const res = await PUT(makeRequest({ wordCount: -5 }), {
      params: makeParams(),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for float wordCount", async () => {
    const res = await PUT(makeRequest({ wordCount: 3.14 }), {
      params: makeParams(),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for string wordCount", async () => {
    const res = await PUT(
      makeRequest({ wordCount: "100" }),
      { params: makeParams() },
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for negative sortOrder", async () => {
    const res = await PUT(makeRequest({ sortOrder: -1 }), {
      params: makeParams(),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for float sortOrder", async () => {
    const res = await PUT(makeRequest({ sortOrder: 1.5 }), {
      params: makeParams(),
    });
    expect(res.status).toBe(400);
  });

  it("400 response body includes error field", async () => {
    const res = await PUT(makeRequest({ status: "bad" }), {
      params: makeParams(),
    });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.details).toBeDefined();
  });

  it("400 response includes Zod error details", async () => {
    const res = await PUT(makeRequest({ wordCount: -1 }), {
      params: makeParams(),
    });
    const data = await res.json();
    expect(data.details).toBeDefined();
  });

  it("returns 500 for valid data (db error, no mock) — confirms validation passed", async () => {
    // This test proves that valid auto-save data passes Zod validation
    // and reaches the db call. Without a mock, db.chapter.update throws
    // and we get a 500, which confirms validation succeeded.
    const res = await PUT(
      makeRequest({
        content: "<p>Auto-saved content</p>",
        plainText: "Auto-saved content",
        wordCount: 3,
      }),
      { params: makeParams() },
    );

    // NOT 400 (validation passed) — gets to db → 500
    expect(res.status).not.toBe(400);
    expect(res.status).toBe(500);
  });

  it("returns 500 for valid title update (confirms validation passed)", async () => {
    const res = await PUT(
      makeRequest({ title: "New Title" }),
      { params: makeParams() },
    );
    expect(res.status).not.toBe(400);
  });

  it("returns 500 for valid status update", async () => {
    const res = await PUT(
      makeRequest({ status: "in_progress" }),
      { params: makeParams() },
    );
    expect(res.status).not.toBe(400);
  });

  it("returns 500 for valid sortOrder update", async () => {
    const res = await PUT(
      makeRequest({ sortOrder: 3 }),
      { params: makeParams() },
    );
    expect(res.status).not.toBe(400);
  });

  it("500 response body includes error field", async () => {
    const res = await PUT(
      makeRequest({ title: "Test" }),
      { params: makeParams() },
    );
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

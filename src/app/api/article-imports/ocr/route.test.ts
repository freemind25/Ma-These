import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  db: {
    importedDoc: {
      findUnique: vi.fn(),
    },
    job: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/jobs/queue", () => ({
  enqueueJob: vi.fn(),
}));

import { db } from "@/lib/db";
import { enqueueJob } from "@/lib/jobs/queue";

const mockFindDoc = vi.mocked(db.importedDoc.findUnique);
const mockFindJob = vi.mocked(db.job.findFirst);
const mockEnqueue = vi.mocked(enqueueJob);

const makePost = (body: unknown) =>
  new NextRequest("http://localhost/api/article-imports/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const pdfDoc = (overrides = {}) => ({
  id: "doc-1",
  filename: "memoire-scanne.pdf",
  fileType: "pdf",
  scanned: true,
  data: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
  ...overrides,
});

// ── POST /api/article-imports/ocr ────────────────────────────────────────
describe("POST /api/article-imports/ocr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("201 — enfile un job OCR avec plafond annoncé (défaut 30, CA-1.1/1.5)", async () => {
    mockFindDoc.mockResolvedValue(pdfDoc() as never);
    mockFindJob.mockResolvedValue(null);
    mockEnqueue.mockResolvedValue({ id: "job-ocr-1", status: "pending" } as never);

    const res = await POST(makePost({ importedDocId: "doc-1", lang: "fra" }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.jobId).toBe("job-ocr-1");
    expect(json.data.maxPages).toBe(30);
    expect(json.data.lang).toBe("fra");
    expect(mockEnqueue).toHaveBeenCalledWith("article-import-ocr", {
      importedDocId: "doc-1",
      lang: "fra",
      maxPages: 30,
    });
  });

  it("201 — plafond personnalisé respecté (configurable, CA-1.5)", async () => {
    mockFindDoc.mockResolvedValue(pdfDoc() as never);
    mockFindJob.mockResolvedValue(null);
    mockEnqueue.mockResolvedValue({ id: "job-ocr-2", status: "pending" } as never);

    const res = await POST(makePost({ importedDocId: "doc-1", lang: "eng", maxPages: 45 }));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.data.maxPages).toBe(45);
  });

  it("404 — document introuvable", async () => {
    mockFindDoc.mockResolvedValue(null as never);
    const res = await POST(makePost({ importedDocId: "ghost" }));
    expect(res.status).toBe(404);
  });

  it("415 — l'OCR ne s'applique qu'aux PDF", async () => {
    mockFindDoc.mockResolvedValue(pdfDoc({ fileType: "docx" }) as never);
    const res = await POST(makePost({ importedDocId: "doc-1" }));
    const json = await res.json();
    expect(res.status).toBe(415);
    expect(json.error).toContain("PDF");
  });

  it("422 — octets non conservés (import antérieur à l'OCR)", async () => {
    mockFindDoc.mockResolvedValue(pdfDoc({ data: null }) as never);
    const res = await POST(makePost({ importedDocId: "doc-1" }));
    const json = await res.json();
    expect(res.status).toBe(422);
    expect(json.error).toContain("réimportez");
  });

  it("422 — document non scanné (OCR inutile, réponse honnête)", async () => {
    mockFindDoc.mockResolvedValue(pdfDoc({ scanned: false }) as never);
    const res = await POST(makePost({ importedDocId: "doc-1" }));
    const json = await res.json();
    expect(res.status).toBe(422);
    expect(json.error).toContain("déjà extractible");
  });

  it("409 — garde anti-empilement GLOBALE : un seul job OCR actif (CA-1.5)", async () => {
    mockFindDoc.mockResolvedValue(pdfDoc() as never);
    mockFindJob.mockResolvedValue({ id: "job-en-cours" } as never);

    const res = await POST(makePost({ importedDocId: "doc-2" }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toContain("Un OCR est déjà en cours");
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it("400 — corps invalide (langue inconnue)", async () => {
    const res = await POST(makePost({ importedDocId: "doc-1", lang: "deu" }));
    expect(res.status).toBe(400);
  });

  it("400 — importedDocId manquant", async () => {
    const res = await POST(makePost({ lang: "fra" }));
    expect(res.status).toBe(400);
  });
});

// ── GET /api/article-imports/ocr?importedDocId= ──────────────────────────
describe("GET /api/article-imports/ocr", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("400 — paramètre manquant", async () => {
    const res = await GET(new NextRequest("http://localhost/api/article-imports/ocr"));
    expect(res.status).toBe(400);
  });

  it("data:null — aucun job pour ce document", async () => {
    mockFindJob.mockResolvedValue(null as never);
    const res = await GET(
      new NextRequest("http://localhost/api/article-imports/ocr?importedDocId=doc-1")
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toBeNull();
  });

  it("renvoie le dernier job avec progression et résultat parsé (CA-1.1)", async () => {
    mockFindJob.mockResolvedValue({
      id: "job-ocr-9",
      type: "article-import-ocr",
      status: "running",
      progress: 33,
      progressNote: "Page 2/3 (page PDF 5) en cours…",
      error: null,
      attempts: 1,
      result: null,
      createdAt: new Date(),
      startedAt: new Date(),
      finishedAt: null,
    } as never);

    const res = await GET(
      new NextRequest("http://localhost/api/article-imports/ocr?importedDocId=doc-1")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe("running");
    expect(json.data.progress).toBe(33);
    expect(json.data.progressNote).toContain("Page 2/3");
  });

  it("parse le résultat JSON du job terminé (confiance, pages)", async () => {
    mockFindJob.mockResolvedValue({
      id: "job-ocr-9",
      type: "article-import-ocr",
      status: "done",
      progress: 100,
      progressNote: null,
      error: null,
      attempts: 1,
      result: JSON.stringify({ lang: "fra", pagesProcessed: 3, avgConfidence: 82 }),
      createdAt: new Date(),
      startedAt: new Date(),
      finishedAt: new Date(),
    } as never);

    const res = await GET(
      new NextRequest("http://localhost/api/article-imports/ocr?importedDocId=doc-1")
    );
    const json = await res.json();

    expect(json.data.status).toBe("done");
    expect(json.data.result.avgConfidence).toBe(82);
  });
});

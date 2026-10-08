import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  db: {
    importedDoc: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// extraction : vraies fonctions pures (detectScannedPages, buildLimits…),
// seuls les parseurs lourds sont simulés
vi.mock("@/lib/articles/extraction", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/articles/extraction")>();
  return {
    ...actual,
    extractPdf: vi.fn(),
    extractDocx: vi.fn(),
  };
});

import { db } from "@/lib/db";
import { extractPdf, extractDocx } from "@/lib/articles/extraction";

const mockCreate = vi.mocked(db.importedDoc.create);
const mockFindUnique = vi.mocked(db.importedDoc.findUnique);
const mockExtractPdf = vi.mocked(extractPdf);
const mockExtractDocx = vi.mocked(extractDocx);

const FIXTURE_PATH = path.resolve(
  process.cwd(),
  "specs/article-ocr-async/fixtures/scan-fixture.pdf"
);

const makePost = (form: FormData) =>
  new NextRequest("http://localhost/api/article-imports", {
    method: "POST",
    body: form,
  });

beforeEach(() => {
  vi.clearAllMocks();
});

// ── POST — PDF entièrement scanné : désormais ACCEPTÉ (prérequis US-1) ───
describe("POST /api/article-imports — PDF scanné", () => {
  it("201 sur un PDF 100 % scanné (fixture réelle) — octets conservés, limite scanné honnête", async () => {
    const bytes = fs.readFileSync(FIXTURE_PATH);
    // intégration réelle : le parseur unpdf authentique tourne sur la fixture
    const actual = await vi.importActual<typeof import("@/lib/articles/extraction")>(
      "@/lib/articles/extraction"
    );
    mockExtractPdf.mockImplementation(actual.extractPdf);
    mockCreate.mockResolvedValue({
      id: "doc-scan-1",
      thesisId: null,
      filename: "scan-fixture.pdf",
      fileType: "pdf",
      sizeBytes: bytes.length,
      text: "",
      pages: 1,
      scanned: true,
      limits: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const fd = new FormData();
    fd.append("file", new File([bytes], "scan-fixture.pdf", { type: "application/pdf" }));

    const res = await POST(makePost(fd));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.scanned).toBe(true);
    expect(json.data.pages).toBe(1);
    expect(json.data.textLength).toBe(0);

    const created = mockCreate.mock.calls[0]?.[0] as { data: Record<string, unknown> };
    expect(created.data.scanned).toBe(true);
    expect(Buffer.isBuffer(created.data.data)).toBe(true);
    expect((created.data.data as Buffer).length).toBe(bytes.length);
    expect((created.data.data as Buffer)[0]).toBe(0x25); // %PDF — octets d'origine

    const limits = JSON.parse(created.data.limits as string) as { kind: string; detail: string }[];
    const scannedLimit = limits.find((l) => l.kind === "scanned");
    expect(scannedLimit?.detail).toContain("Un OCR est disponible");
    expect(scannedLimit?.detail).not.toContain("pas disponible dans cette itération");
  });

  it("422 conservé pour un document NON scanné sans texte exploitable", async () => {
    // 15 caractères : page « non vide » (≥ 10 car. → pas scanné) mais total < 20
    mockExtractPdf.mockResolvedValue({ pages: ["a".repeat(15)] });

    const fd = new FormData();
    fd.append("file", new File([Buffer.from("%PDF-1.4 fake")], "vide.pdf", { type: "application/pdf" }));

    const res = await POST(makePost(fd));
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.error).toContain("Extraction vide");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

// ── POST — non-régression DOCX (octets NON conservés) ────────────────────
describe("POST /api/article-imports — DOCX (non-régression)", () => {
  it("201 DOCX — comportement inchangé, data:null (pas d'OCR sur DOCX)", async () => {
    mockExtractDocx.mockResolvedValue({ html: "<p>x</p>", text: "x".repeat(50) });
    mockCreate.mockResolvedValue({
      id: "doc-docx-1",
      thesisId: null,
      filename: "memoire.docx",
      fileType: "docx",
      sizeBytes: 100,
      text: "x".repeat(50),
      pages: null,
      scanned: false,
      limits: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    // conteneur ZIP (magic bytes PK) — contenu factice, extractDocx est mocké
    const fake = Buffer.concat([
      Buffer.from("PK\x03\x04"),
      Buffer.alloc(96, 0),
    ]);
    const fd = new FormData();
    fd.append(
      "file",
      new File([fake], "memoire.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
    );

    const res = await POST(makePost(fd));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.fileType).toBe("docx");
    expect(mockExtractDocx).toHaveBeenCalledTimes(1);

    const created = mockCreate.mock.calls[0]?.[0] as { data: Record<string, unknown> };
    expect(created.data.data).toBeNull();
  });
});

// ── GET ?id — les octets ne sortent JAMAIS de la base via l'API ──────────
describe("GET /api/article-imports?id= — octets exclus", () => {
  it("renvoie le document SANS la colonne data (octets réservés à l'OCR)", async () => {
    mockFindUnique.mockResolvedValue({
      id: "doc-1",
      thesisId: null,
      filename: "scan-fixture.pdf",
      fileType: "pdf",
      sizeBytes: 7550,
      data: Buffer.from([0x25, 0x50, 0x44, 0x46]),
      text: "texte du document",
      pages: 1,
      scanned: true,
      limits: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const res = await GET(new NextRequest("http://localhost/api/article-imports?id=doc-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.data).toBeUndefined();
    expect(json.data.text).toBe("texte du document");
    expect(json.data.preview).toBeDefined();
  });
});

// ── POST — pré-contrôle content-length (cycle import-size-limit, CA-2) ──
describe("POST /api/article-imports — pré-contrôle content-length", () => {
  it("413 lisible AVANT parsing quand l'en-tête dépasse manifestement le plafond (formData jamais appelé)", async () => {
    const formDataSpy = vi.fn();
    const fakeReq = {
      url: "http://localhost/api/article-imports",
      headers: new Headers({ "content-length": String(60 * 1024 * 1024) }),
      formData: formDataSpy,
    } as unknown as NextRequest;

    const res = await POST(fakeReq);
    const json = await res.json();

    expect(res.status).toBe(413);
    expect(json.error).toContain("trop volumineux");
    expect(json.error).toContain("maximum 50 Mo");
    expect(formDataSpy).not.toHaveBeenCalled();
  });

  it("laisse passer un content-length sous la marge multipart (contrôle précis par file.size prend le relais)", async () => {
    const bytes = fs.readFileSync(FIXTURE_PATH);
    const actual = await vi.importActual<typeof import("@/lib/articles/extraction")>(
      "@/lib/articles/extraction"
    );
    mockExtractPdf.mockImplementation(actual.extractPdf);
    mockCreate.mockResolvedValue({
      id: "doc-scan-cl",
      thesisId: null,
      filename: "scan-fixture.pdf",
      fileType: "pdf",
      sizeBytes: bytes.length,
      text: "",
      pages: 1,
      scanned: true,
      limits: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const fd = new FormData();
    fd.append("file", new File([bytes], "scan-fixture.pdf", { type: "application/pdf" }));
    const req = new NextRequest("http://localhost/api/article-imports", {
      method: "POST",
      body: fd,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

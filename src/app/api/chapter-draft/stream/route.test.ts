// ═══════════════════════════════════════════════════════════════
// POST /api/chapter-draft/stream — tests (Vitest)
// Couverture : validation zod (400), chapitre inconnu (404), succès SSE
// avec generateCompletionStream mocké (aucun appel IA réel), relance de
// continuation unique si troncature, règles de citations du prompt.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  db: {
    chapter: { findUnique: vi.fn() },
    reference: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/ai/zai-client", () => ({
  generateCompletionStream: vi.fn(),
  generateCompletion: vi.fn(),
}));

vi.mock("@/lib/ai/book-skills-server", () => ({
  getActiveBookSkills: vi.fn(),
}));

import { db } from "@/lib/db";
import { generateCompletionStream, generateCompletion } from "@/lib/ai/zai-client";
import { getActiveBookSkills } from "@/lib/ai/book-skills-server";

const mockChapterFindUnique = vi.mocked(db.chapter.findUnique);
const mockReferenceFindMany = vi.mocked(db.reference.findMany);
const mockGenerateCompletionStream = vi.mocked(generateCompletionStream);
const mockGenerateCompletion = vi.mocked(generateCompletion);
const mockGetActiveBookSkills = vi.mocked(getActiveBookSkills);

// ── Helpers ──────────────────────────────────────────────────────────────
const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/chapter-draft/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockChapter = {
  id: "ch-2",
  number: 2,
  title: "Cadre théorique",
  thesis: {
    id: "thesis-1",
    title: "Urbanisme durable",
    subtitle: null,
    author: "Marie Dupont",
    discipline: "Urbanisme",
    chapters: [
      { number: 1, title: "Introduction" },
      { number: 2, title: "Cadre théorique" },
    ],
    cadrages: [
      {
        label: "Cadrage principal",
        fields: [{ label: "Problématique", value: "Comment rendre la ville durable ?" }],
      },
    ],
  },
};

const mockReference = {
  id: "ref-1",
  authors: "Bertholet, Alain; Martin, Claire",
  title: "La ville durable en question",
  year: 2012,
  journal: "Revue urbaine",
};

/** Construit une Response SSE à partir de chunks (comme generateCompletionStream). */
const sseResponse = (chunks: object[]) =>
  new Response(
    chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join(""),
    { headers: { "Content-Type": "text/event-stream" } }
  );

const parseSSE = (text: string) =>
  text
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice(6)));

// ── Validation zod (400) ─────────────────────────────────────────────────
describe("POST /api/chapter-draft/stream > validation zod (400)", () => {
  it("400 quand chapterId est manquant", async () => {
    const res = await POST(makeRequest({ targetWords: 2000 }), {
      params: Promise.resolve({}),
    } as never);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe("Données invalides");
    expect(json.details).toBeDefined();
  });

  it("400 quand targetWords est inférieur à 300", async () => {
    const res = await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 299 }),
      { params: Promise.resolve({}) } as never
    );
    expect(res.status).toBe(400);
  });

  it("400 quand targetWords dépasse 8000", async () => {
    const res = await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 8001 }),
      { params: Promise.resolve({}) } as never
    );
    expect(res.status).toBe(400);
  });

  it("400 quand targetWords n'est pas un entier", async () => {
    const res = await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 2000.5 }),
      { params: Promise.resolve({}) } as never
    );
    expect(res.status).toBe(400);
  });

  it("400 quand plus de 20 références sont fournies", async () => {
    const res = await POST(
      makeRequest({
        chapterId: "ch-2",
        targetWords: 2000,
        referenceIds: Array.from({ length: 21 }, (_, i) => `ref-${i}`),
      }),
      { params: Promise.resolve({}) } as never
    );
    expect(res.status).toBe(400);
  });
});

// ── Chapitre inconnu (404) ───────────────────────────────────────────────
describe("POST /api/chapter-draft/stream > chapitre inconnu (404)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("404 quand le chapitre n'existe pas", async () => {
    mockChapterFindUnique.mockResolvedValue(null);

    const res = await POST(
      makeRequest({ chapterId: "inconnu", targetWords: 2000 }),
      { params: Promise.resolve({}) } as never
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Chapitre non trouvé");
    expect(mockGenerateCompletionStream).not.toHaveBeenCalled();
  });
});

// ── Succès SSE (IA mockée) ───────────────────────────────────────────────
describe("POST /api/chapter-draft/stream > succès SSE (IA mockée)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChapterFindUnique.mockResolvedValue(mockChapter as never);
    mockReferenceFindMany.mockResolvedValue([]);
    mockGetActiveBookSkills.mockResolvedValue([]);
  });

  it("renvoie un flux SSE avec les chunks transmis et un seul done", async () => {
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([
        { type: "chunk", content: "## Introduction\n\nLe chapitre pose " },
        { type: "chunk", content: "les bases du cadre théorique." },
        { type: "done" },
      ])
    );

    const res = await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 2000, referenceIds: [] }),
      { params: Promise.resolve({}) } as never
    );
    const text = await res.text();
    const events = parseSSE(text);

    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.status).toBe(200);
    expect(events.filter((e) => e.type === "chunk").map((e) => e.content).join("")).toBe(
      "## Introduction\n\nLe chapitre pose les bases du cadre théorique."
    );
    expect(events.filter((e) => e.type === "done")).toHaveLength(1);
    expect(mockGenerateCompletion).not.toHaveBeenCalled();
  });

  it("passe maxTokens 12 000 et le message utilisateur avec la cible de mots", async () => {
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([{ type: "chunk", content: "Brouillon terminé." }, { type: "done" }])
    );

    await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 3500 }),
      { params: Promise.resolve({}) } as never
    );

    expect(mockGenerateCompletionStream).toHaveBeenCalledTimes(1);
    const options = mockGenerateCompletionStream.mock.calls[0][0];
    expect(options.maxTokens).toBe(12_000);
    expect(options.temperature).toBe(0.6);
    const userMessage = options.messages.find((m) => m.role === "user");
    expect(userMessage?.content).toContain("Cadre théorique");
    expect(userMessage?.content).toContain("3500");
  });

  it("sans référence : le prompt interdit toute citation", async () => {
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([{ type: "chunk", content: "Brouillon sans citation." }, { type: "done" }])
    );

    await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 2000, referenceIds: [] }),
      { params: Promise.resolve({}) } as never
    );

    const options = mockGenerateCompletionStream.mock.calls[0][0];
    const systemMessage = options.messages.find((m) => m.role === "system");
    expect(systemMessage?.content).toContain("AUCUNE citation");
    expect(systemMessage?.content).not.toContain("BIBLIOGRAPHIE AUTORISÉE");
  });

  it("avec références : la bibliographie autorisée contient auteur (année) titre", async () => {
    mockReferenceFindMany.mockResolvedValue([mockReference as never]);
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([{ type: "chunk", content: "Brouillon avec citations." }, { type: "done" }])
    );

    await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 2000, referenceIds: ["ref-1"] }),
      { params: Promise.resolve({}) } as never
    );

    const options = mockGenerateCompletionStream.mock.calls[0][0];
    const systemMessage = options.messages.find((m) => m.role === "system");
    expect(systemMessage?.content).toContain("BIBLIOGRAPHIE AUTORISÉE");
    expect(systemMessage?.content).toContain("Bertholet (2012). La ville durable en question");
    // Le contexte thèse inclut le cadrage actif et les titres des chapitres.
    expect(systemMessage?.content).toContain("Comment rendre la ville durable ?");
    expect(systemMessage?.content).toContain("1. Introduction");
  });

  it("lance UNE relance de continuation quand le texte est probablement tronqué", async () => {
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([
        { type: "chunk", content: "Le chapitre s'ouvre sur une analyse urbaine qui" },
        { type: "done" },
      ])
    );
    mockGenerateCompletion.mockResolvedValue({
      content: "se poursuit jusqu'à la conclusion finale.",
      provider: "test",
      model: "test-model",
    });

    const res = await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 4000 }),
      { params: Promise.resolve({}) } as never
    );
    const text = await res.text();
    const events = parseSSE(text);
    const fullText = events
      .filter((e) => e.type === "chunk")
      .map((e) => e.content)
      .join("");

    expect(mockGenerateCompletion).toHaveBeenCalledTimes(1);
    expect(fullText).toContain("se poursuit jusqu'à la conclusion finale.");
    expect(events.filter((e) => e.type === "done")).toHaveLength(1);
  });

  it("ne relance PAS la continuation quand le texte se termine proprement", async () => {
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([{ type: "chunk", content: "Conclusion complète." }, { type: "done" }])
    );

    await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 2000 }),
      { params: Promise.resolve({}) } as never
    );

    expect(mockGenerateCompletion).not.toHaveBeenCalled();
  });

  it("relaye le chunk error sans relance de continuation", async () => {
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([
        { type: "error", error: "Tous les fournisseurs IA ont échoué." },
        { type: "done" },
      ])
    );

    const res = await POST(
      makeRequest({ chapterId: "ch-2", targetWords: 2000 }),
      { params: Promise.resolve({}) } as never
    );
    const text = await res.text();
    const events = parseSSE(text);

    expect(res.status).toBe(200);
    expect(events[0].type).toBe("error");
    expect(events[0].error).toBe("Tous les fournisseurs IA ont échoué.");
    expect(mockGenerateCompletion).not.toHaveBeenCalled();
    expect(events.filter((e) => e.type === "done")).toHaveLength(1);
  });
});

// ── Injection compétences livres (canal IA) ──────────────────────────────
describe("POST /api/chapter-draft/stream > injection compétences livres", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChapterFindUnique.mockResolvedValue(mockChapter as never);
    mockReferenceFindMany.mockResolvedValue([]);
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([{ type: "chunk", content: "Brouillon." }, { type: "done" }])
    );
  });

  it("avec 0 compétence active : aucune section COMPÉTENCES LIVRES (CA-3.1)", async () => {
    mockGetActiveBookSkills.mockResolvedValue([]);

    await POST(makeRequest({ chapterId: "ch-2", targetWords: 2000 }), {
      params: Promise.resolve({}) } as never);

    const systemMessage = mockGenerateCompletionStream.mock.calls[0][0].messages.find(
      (m) => m.role === "system"
    );
    expect(systemMessage?.content).not.toContain("COMPÉTENCES LIVRES");
  });

  it("avec ≥ 1 compétence active : section index + contenu + règle de citation (CA-3.2/3.5)", async () => {
    mockGetActiveBookSkills.mockResolvedValue([
      {
        id: "bs-1",
        title: "Méthode du commentaire",
        author: "J. Dupont",
        description: "Quand rédiger un commentaire",
        tags: "méthode",
        source: "Cours 2026",
        content: "Principes du commentaire académique.",
      },
    ]);

    await POST(makeRequest({ chapterId: "ch-2", targetWords: 2000 }), {
      params: Promise.resolve({}) } as never);

    const systemMessage = mockGenerateCompletionStream.mock.calls[0][0].messages.find(
      (m) => m.role === "system"
    );
    const content = systemMessage?.content ?? "";
    expect(content).toContain("COMPÉTENCES LIVRES ACTIVES");
    expect(content).toContain("[L1] Méthode du commentaire");
    expect(content).toContain("Principes du commentaire académique.");
    expect(content).toContain("JAMAIS une source de citations");
    // La section s'insère avant le contexte de thèse
    expect(content.indexOf("COMPÉTENCES LIVRES")).toBeLessThan(
      content.indexOf("CONTEXTE DE LA THÈSE")
    );
  });

  it("la continuation n'embarque pas les compétences livres (CA-3.6)", async () => {
    mockGetActiveBookSkills.mockResolvedValue([
      {
        id: "bs-1",
        title: "Méthode du commentaire",
        content: "x".repeat(50),
      },
    ]);
    mockGenerateCompletionStream.mockResolvedValue(
      sseResponse([
        { type: "chunk", content: "Le chapitre s'ouvre sur une analyse urbaine qui" },
        { type: "done" },
      ])
    );
    mockGenerateCompletion.mockResolvedValue({
      content: "se poursuit jusqu'à la conclusion finale.",
      provider: "test",
      model: "test-model",
    });

    await POST(makeRequest({ chapterId: "ch-2", targetWords: 4000 }), {
      params: Promise.resolve({}) } as never);

    // La relance de continuation passe par generateCompletion
    expect(mockGenerateCompletion).toHaveBeenCalledTimes(1);
    const continuationSystem = mockGenerateCompletion.mock.calls[0][0].messages.find(
      (m) => m.role === "system"
    );
    expect(continuationSystem?.content).toContain("Reprends EXACTEMENT");
    expect(continuationSystem?.content).not.toContain("COMPÉTENCES LIVRES");
  });
});

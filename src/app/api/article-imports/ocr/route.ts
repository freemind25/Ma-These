import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { enqueueJob } from "@/lib/jobs/queue";
import { resolveOcrMaxPages } from "@/lib/articles/ocr";

export const runtime = "nodejs";

// ═══════════════════════════════════════════════════════════════
// POST /api/article-imports/ocr — lancer un OCR asynchrone sur un
// PDF importé (specs/article-ocr-async — CA-1.1, CA-1.5)
//   · garde anti-empilement GLOBALE : un seul job OCR actif à la fois
//   · plafond de pages annoncé (défaut 30, configurable OCR_MAX_PAGES)
// GET ?importedDocId= — état du dernier job OCR du document (CA-1.1)
//   (statut, progression par page, résultat ou erreur lisible)
// ═══════════════════════════════════════════════════════════════

const createSchema = z.object({
  importedDocId: z.string().min(1, "importedDocId requis"),
  lang: z.enum(["fra", "eng", "ara"]).default("fra"),
  maxPages: z.number().int().min(1).max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    const doc = await db.importedDoc.findUnique({
      where: { id: validated.importedDocId },
      select: { id: true, filename: true, fileType: true, scanned: true, data: true },
    });
    if (!doc) {
      return NextResponse.json({ error: "Document importé introuvable." }, { status: 404 });
    }
    if (doc.fileType !== "pdf") {
      return NextResponse.json(
        { error: "L'OCR ne s'applique qu'aux documents PDF." },
        { status: 415 }
      );
    }
    if (!doc.data) {
      return NextResponse.json(
        {
          error:
            "Octets du PDF non conservés pour ce document (import antérieur à l'OCR) — réimportez le PDF puis relancez l'OCR.",
        },
        { status: 422 }
      );
    }
    if (!doc.scanned) {
      return NextResponse.json(
        {
          error:
            "Aucune page scannée détectée sur ce document — le texte est déjà extractible, l'OCR est inutile.",
        },
        { status: 422 }
      );
    }

    // Garde anti-empilement GLOBALE (mémoire : moteur séquentiel, box OOM)
    const inFlight = await db.job.findFirst({
      where: { type: "article-import-ocr", status: { in: ["pending", "running"] } },
      select: { id: true },
    });
    if (inFlight) {
      return NextResponse.json(
        {
          error:
            "Un OCR est déjà en cours — un seul job OCR actif à la fois. Attendez sa fin ou consultez sa progression.",
          jobId: inFlight.id,
        },
        { status: 409 }
      );
    }

    const maxPages = resolveOcrMaxPages(validated.maxPages ?? process.env.OCR_MAX_PAGES ?? null);
    const job = await enqueueJob("article-import-ocr", {
      importedDocId: doc.id,
      lang: validated.lang,
      maxPages,
    });

    return NextResponse.json(
      {
        data: {
          jobId: job.id,
          status: job.status,
          lang: validated.lang,
          maxPages,
          note: `OCR asynchrone lancé — plafond ${maxPages} pages, langue ${validated.lang}. Progression visible dans la carte du document.`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/article-imports/ocr] Error:", error);
    return NextResponse.json({ error: "Erreur lors du lancement de l'OCR." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const importedDocId = searchParams.get("importedDocId");
    if (!importedDocId) {
      return NextResponse.json({ error: "Fournissez ?importedDocId=xxx" }, { status: 400 });
    }
    const job = await db.job.findFirst({
      where: {
        type: "article-import-ocr",
        payload: { contains: importedDocId },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!job) {
      return NextResponse.json({ data: null });
    }
    let result: unknown = null;
    if (job.result) {
      try {
        result = JSON.parse(job.result);
      } catch {
        result = job.result;
      }
    }
    return NextResponse.json({
      data: {
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        progressNote: job.progressNote,
        error: job.error,
        attempts: job.attempts,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        result,
      },
    });
  } catch (error) {
    console.error("[GET /api/article-imports/ocr] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la lecture de l'état OCR." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  detectFileType,
  validateFileSize,
  checkMagicBytes,
  extractDocx,
  extractPdf,
  headingsFromHtml,
  detectScannedPages,
  buildLimits,
  truncatePreview,
  MAX_IMPORT_BYTES,
} from "@/lib/articles/extraction";

export const runtime = "nodejs";

// ═══════════════════════════════════════════════════════════════
// POST /api/article-imports — import d'un mémoire/thèse (FormData)
// Vérifie type réel + taille, extrait, détecte le scanné, consigne
// les limites — et échoue HONNÊTEMENT si l'extraction est impossible.
// GET ?id / GET liste · DELETE ?id
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Pré-contrôle par en-tête (cycle import-size-limit, CA-2) : refuse
    // lisiblement tout upload manifestement > MAX_IMPORT_BYTES AVANT le
    // parsing multipart — sinon un body dépassant le plafond de transport
    // (proxyClientMaxBodySize, 64 Mo) arrive tronqué et échoue en 500
    // générique. Marge 1 Mo pour les en-têtes multipart ; les cas limites
    // (≤ marge) tombent sur le contrôle précis par file.size, plus bas.
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMPORT_BYTES + 1024 * 1024) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux : ${(contentLength / 1024 / 1024).toFixed(1)} Mo reçus (maximum ${MAX_IMPORT_BYTES / 1024 / 1024} Mo).`,
        },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const thesisId = (formData.get("thesisId") as string | null) || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu (champ « file »)." }, { status: 400 });
    }

    const fileType = detectFileType(file.name, file.type);
    if (!fileType) {
      return NextResponse.json(
        { error: `Format non pris en charge : « ${file.name} ». Formats acceptés : DOCX, PDF, TXT/MD.` },
        { status: 415 }
      );
    }

    const sizeCheck = validateFileSize(file.size);
    if (!sizeCheck.ok) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!checkMagicBytes(new Uint8Array(buffer), fileType)) {
      return NextResponse.json(
        { error: `Le contenu du fichier ne correspond pas à un ${fileType.toUpperCase()} valide (fichier corrompu ou renommé ?).` },
        { status: 415 }
      );
    }

    let text = "";
    let headings: { level: number; text: string }[] = [];
    let pages: number | null = null;
    let scanned = false;
    let emptyPages: number[] = [];

    try {
      if (fileType === "docx") {
        const { html, text: t } = await extractDocx(buffer);
        text = t;
        headings = headingsFromHtml(html);
      } else if (fileType === "pdf") {
        const { pages: p } = await extractPdf(buffer);
        const joined = p.join("\n\n");
        text = joined;
        pages = p.length;
        const det = detectScannedPages(p);
        scanned = det.scanned;
        emptyPages = det.emptyPages;
      } else {
        text = buffer.toString("utf-8");
      }
    } catch (e) {
      return NextResponse.json(
        {
          error:
            `Extraction impossible : le fichier est peut-être corrompu ou protégé. ` +
            (e instanceof Error ? e.message : ""),
        },
        { status: 422 }
      );
    }

    if (text.trim().length < 20 && !scanned) {
      return NextResponse.json(
        {
          error:
            "Extraction vide : le document ne contient pas assez de texte exploitable.",
          scanned,
        },
        { status: 422 }
      );
    }
    // Un PDF entièrement scanné est désormais ACCEPTÉ (texte quasi vide +
    // marqueur scanné) : l'OCR asynchrone le rendra exploitable (cycle
    // article-ocr-async). Le rejet 422 reste valable pour les non-scannés.

    const limits = buildLimits({ fileType, scanned, emptyPages, headings, text });

    const doc = await db.importedDoc.create({
      data: {
        thesisId,
        filename: file.name,
        fileType,
        sizeBytes: file.size,
        // Octets conservés pour les PDFs uniquement — l'OCR différé relit le
        // fichier depuis la base (column data Bytes?, cycle article-ocr-async)
        data: fileType === "pdf" ? buffer : null,
        text,
        pages,
        scanned,
        limits: JSON.stringify(limits),
      },
    });

    return NextResponse.json(
      {
        data: {
          id: doc.id,
          filename: doc.filename,
          fileType: doc.fileType,
          sizeBytes: doc.sizeBytes,
          pages: doc.pages,
          scanned: doc.scanned,
          limits,
          headings,
          textLength: text.length,
          preview: truncatePreview(text),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/article-imports] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import du document." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const doc = await db.importedDoc.findUnique({ where: { id } });
      if (!doc) return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
      // Octets exclus de la réponse API (data reste en base, réservé à l'OCR)
      // — data: undefined est retiré par JSON.stringify
      const docSansOctets = { ...doc, data: undefined as unknown };
      return NextResponse.json({ data: { ...docSansOctets, preview: truncatePreview(doc.text) } });
    }
    const docs = await db.importedDoc.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, filename: true, fileType: true, sizeBytes: true,
        pages: true, scanned: true, limits: true, createdAt: true,
      },
    });
    return NextResponse.json({ data: docs, meta: { count: docs.length } });
  } catch (error) {
    console.error("[GET /api/article-imports] Error:", error);
    return NextResponse.json({ error: "Erreur de lecture des imports." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Fournissez ?id=xxx" }, { status: 400 });
    await db.importedDoc.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/article-imports] Error:", error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 404 });
  }
}

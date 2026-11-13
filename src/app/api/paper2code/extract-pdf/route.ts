import { NextRequest, NextResponse } from "next/server";
import {
  detectFileType,
  validateFileSize,
  checkMagicBytes,
  extractPdf,
  detectScannedPages,
  MAX_IMPORT_BYTES,
} from "@/lib/articles/extraction";

export const runtime = "nodejs";

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/paper2code/extract-pdf
// Import PDF du module « Article → Code » : extrait le texte de
// l'article (methodologie, experiences, hyperparametres) pour
// pré-remplir le champ source — SANS persistance (flux éphémère,
// identique au collage manuel).
//
// Garde-fous réutilisés de la maison (src/lib/articles/extraction.ts,
// pattern /api/article-imports) : pré-contrôle content-length,
// PDF seul, 50 Mo, magic bytes %PDF, détection de PDF scanné.
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Pré-contrôle par en-tête (même logique que /api/article-imports) :
    // refuse lisiblement tout upload manifestement > MAX_IMPORT_BYTES AVANT
    // le parsing multipart (marge 1 Mo pour les en-têtes multipart).
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMPORT_BYTES + 1024 * 1024) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux : ${(contentLength / 1024 / 1024).toFixed(1)} Mo reçus (maximum ${MAX_IMPORT_BYTES / 1024 / 1024} Mo).`,
        },
        { status: 413 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      // Multipart invalide/absent (ex. POST sans fichier du tout) : 400 lisible
      // plutôt que 500 générique.
      return NextResponse.json(
        { error: "Aucun fichier reçu (champ « file »)." },
        { status: 400 }
      );
    }
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier reçu (champ « file »)." },
        { status: 400 }
      );
    }

    // PDF seul — la demande de la rubrique est un article scientifique en PDF.
    const fileType = detectFileType(file.name, file.type);
    if (fileType !== "pdf") {
      return NextResponse.json(
        {
          error: `Format non pris en charge : « ${file.name} ». Ce module accepte uniquement un fichier PDF (article scientifique).`,
        },
        { status: 415 }
      );
    }

    const sizeCheck = validateFileSize(file.size);
    if (!sizeCheck.ok) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!checkMagicBytes(new Uint8Array(buffer), "pdf")) {
      return NextResponse.json(
        {
          error: "Le contenu du fichier ne correspond pas à un PDF valide (fichier corrompu ou renommé ?).",
        },
        { status: 415 }
      );
    }

    let pages: string[] = [];
    try {
      pages = (await extractPdf(buffer)).pages;
    } catch (e) {
      return NextResponse.json(
        {
          error:
            "Extraction impossible : le PDF est peut-être corrompu ou protégé par un mot de passe. " +
            (e instanceof Error ? e.message : ""),
        },
        { status: 422 }
      );
    }

    const text = pages.join("\n\n");
    const scanned = detectScannedPages(pages);

    // Honnêteté : un PDF sans texte extractible ne peut pas servir la
    // génération (garde < 200 caractères). On refuse avec un message actionnable.
    if (text.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Extraction vide : ce PDF ne contient pas de texte extractible (scan image ?). " +
            "Utilisez un PDF textuel (article natif) ou collez le texte manuellement.",
          pages: pages.length,
        },
        { status: 422 }
      );
    }

    const warnings: string[] = [];
    if (scanned.scanned) {
      warnings.push(
        `PDF partiellement scanné : ${scanned.emptyPages.length} page(s) sans texte extractible ` +
          `(pages ${scanned.emptyPages.slice(0, 10).join(", ")}${scanned.emptyPages.length > 10 ? "…" : ""}). ` +
          "Ces pages sont absentes du texte importé — vérifiez qu'aucune section clé (methodologie, hyperparametres) ne manque, ou collez le texte manuellement."
      );
    }
    warnings.push(
      "Extraction PDF brute : la mise en page (colonnes, tableaux, formules) peut être mélangée — relisez et corrigez le texte avant génération."
    );

    return NextResponse.json({
      text,
      pages: pages.length,
      chars: text.length,
      warnings,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "Échec de l'import : " + (e instanceof Error ? e.message : "erreur inconnue."),
      },
      { status: 500 }
    );
  }
}

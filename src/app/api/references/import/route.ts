// ═══════════════════════════════════════
// ThesisFrame — POST /api/references/import
// Bulk import references from .bib, .ris, or CSL-JSON files
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseBibTex, parseRIS, parseCSLJSON, detectFormat } from "@/lib/parsers";
import type { ParsedReference } from "@/lib/parsers/bibtex-parser";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_REFERENCES = 500; // Max refs per import

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const formatHint = formData.get("format") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)` },
        { status: 400 }
      );
    }

    const content = await file.text();
    if (!content.trim()) {
      return NextResponse.json(
        { error: "Le fichier est vide" },
        { status: 400 }
      );
    }

    // Detect format
    let format = formatHint as "bibtex" | "ris" | "csl-json" | null;
    if (!format || !["bibtex", "ris", "csl-json"].includes(format)) {
      format = detectFormat(file.name, content);
    }

    if (!format) {
      return NextResponse.json(
        { error: "Format non reconnu. Formats supportés : .bib, .ris, .json (CSL-JSON)" },
        { status: 400 }
      );
    }

    // Parse references
    let parsed: ParsedReference[];
    switch (format) {
      case "bibtex":
        parsed = parseBibTex(content);
        break;
      case "ris":
        parsed = parseRIS(content);
        break;
      case "csl-json":
        parsed = parseCSLJSON(content);
        break;
      default:
        return NextResponse.json(
          { error: "Format non supporté" },
          { status: 400 }
        );
    }

    if (parsed.length === 0) {
      return NextResponse.json(
        { error: `Aucune référence trouvée dans le fichier ${file.name}` },
        { status: 400 }
      );
    }

    if (parsed.length > MAX_REFERENCES) {
      return NextResponse.json(
        { error: `Trop de références (${parsed.length}). Maximum : ${MAX_REFERENCES}` },
        { status: 400 }
      );
    }

    // Determine source tag based on format
    const sourceMap: Record<string, string> = {
      bibtex: "bibtex",
      ris: "ris",
      "csl-json": "csl-json",
    };
    const source = sourceMap[format] || format;

    // Insert into database
    const created: { id: string; title: string; skipped: boolean }[] = [];
    for (const ref of parsed) {
      if (!ref.title || !ref.title.trim()) {
        created.push({ id: "", title: ref.title || "(sans titre)", skipped: true });
        continue;
      }

      try {
        const record = await db.reference.create({
          data: {
            type: ref.type || "article",
            authors: ref.authors || "",
            title: ref.title.trim(),
            year: ref.year,
            journal: ref.journal,
            volume: ref.volume,
            issue: ref.issue,
            pages: ref.pages,
            publisher: ref.publisher,
            doi: ref.doi,
            isbn: ref.isbn,
            url: ref.url,
            abstract: ref.abstract,
            keywords: ref.keywords,
            notes: ref.notes,
            bibtexKey: ref.bibtexKey,
            source,
          },
        });
        created.push({ id: record.id, title: record.title, skipped: false });
      } catch {
        created.push({ id: "", title: ref.title || "(erreur)", skipped: true });
      }
    }

    const imported = created.filter((c) => !c.skipped).length;
    const skipped = created.filter((c) => c.skipped).length;

    return NextResponse.json({
      data: {
        total: parsed.length,
        imported,
        skipped,
        format,
        source,
        references: created.map((c) => ({
          id: c.id || undefined,
          title: c.title,
          imported: !c.skipped,
        })),
      },
    });
  } catch (error) {
    console.error("[References Import Error]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import : " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

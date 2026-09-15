import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/references/bibtex — Export all references as BibTeX
// ═══════════════════════════════════════
export async function GET() {
  try {
    const references = await db.reference.findMany({
      orderBy: [{ authors: "asc" }, { year: "desc" }],
    });

    if (references.length === 0) {
      return NextResponse.json({ error: "Aucune référence à exporter" }, { status: 404 });
    }

    const bibtexEntries = references.map((ref) => {
      const key = ref.bibtexKey || `${ref.authors?.split(";")[0]?.trim().replace(/\s/g, "").toLowerCase()}${ref.year || ""}`;
      const entryType = mapRefTypeToBibtex(ref.type);

      let entry = `@${entryType}{${key},\n`;
      entry += `  author = {${ref.authors}},\n`;
      entry += `  title = {${ref.title}},\n`;

      if (ref.year) entry += `  year = {${ref.year}},\n`;
      if (ref.journal) entry += `  journal = {${ref.journal}},\n`;
      if (ref.volume) entry += `  volume = {${ref.volume}},\n`;
      if (ref.issue) entry += `  number = {${ref.issue}},\n`;
      if (ref.pages) entry += `  pages = {${ref.pages}},\n`;
      if (ref.publisher) entry += `  publisher = {${ref.publisher}},\n`;
      if (ref.doi) entry += `  doi = {${ref.doi}},\n`;
      if (ref.isbn) entry += `  isbn = {${ref.isbn}},\n`;
      if (ref.url) entry += `  url = {${ref.url}},\n`;

      entry += `}\n`;

      return entry;
    });

    const bibtexContent = bibtexEntries.join("\n");

    return new NextResponse(bibtexContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="references.bib"',
      },
    });
  } catch (error) {
    console.error("[GET /api/references/bibtex] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export BibTeX" },
      { status: 500 }
    );
  }
}

function mapRefTypeToBibtex(type: string): string {
  const mapping: Record<string, string> = {
    article: "article",
    book: "book",
    thesis: "phdthesis",
    conference: "inproceedings",
    report: "techreport",
    web: "misc",
    other: "misc",
  };
  return mapping[type] || "misc";
}

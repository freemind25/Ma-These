import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
} from "docx";

export const runtime = "nodejs";

// ═══════════════════════════════════════════════════════════════
// POST /api/articles/export-docx — export DOCX du brouillon (CA-10)
// Titres, sous-titres, paragraphes ; les repères « [À compléter par
// l'auteur] » et « à vérifier » sont PRÉSERVÉS (mis en évidence).
// ═══════════════════════════════════════════════════════════════

interface ArticleSection {
  id: string;
  heading: string;
  content: string;
  sources?: { label: string; kind: string; location?: string | null }[];
}

const HIGHLIGHT = /\[(À compléter par l'auteur|Information non précisée dans le document source|[^\]]*à vérifier[^\]]*)\]/gi;

function contentParagraphs(content: string): Paragraph[] {
  const paras: Paragraph[] = [];
  const blocks = content.split(/\n{2,}/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("### ")) {
      paras.push(new Paragraph({ text: trimmed.slice(4), heading: HeadingLevel.HEADING_3 }));
      continue;
    }
    if (trimmed.startsWith("## ")) {
      paras.push(new Paragraph({ text: trimmed.slice(3), heading: HeadingLevel.HEADING_2 }));
      continue;
    }
    // Découpe en runs pour mettre en évidence les repères « à compléter »
    const runs: TextRun[] = [];
    let last = 0;
    for (const m of trimmed.matchAll(HIGHLIGHT)) {
      const idx = m.index ?? 0;
      if (idx > last) {
        runs.push(new TextRun({ text: trimmed.slice(last, idx), size: 24 }));
      }
      runs.push(new TextRun({ text: m[0], bold: true, color: "B45309", size: 24 }));
      last = idx + m[0].length;
    }
    if (last < trimmed.length) {
      runs.push(new TextRun({ text: trimmed.slice(last), size: 24 }));
    }
    paras.push(
      new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: trimmed, size: 24 })],
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }
  return paras;
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps de la requête JSON invalide" }, { status: 400 });
    }
    const { articleId } = (body as { articleId?: string }) ?? {};
    if (!articleId) {
      return NextResponse.json({ error: "Fournissez articleId." }, { status: 400 });
    }

    const article = await db.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return NextResponse.json({ error: "Article non trouvé." }, { status: 404 });
    }

    const sections = JSON.parse(article.sections || "[]") as ArticleSection[];
    if (sections.length === 0) {
      return NextResponse.json(
        { error: "L'article ne contient encore aucune section générée à exporter." },
        { status: 422 }
      );
    }

    const children: Paragraph[] = [
      new Paragraph({
        text: article.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: "BROUILLON D'AIDE À LA RÉDACTION — à vérifier par les auteurs. Aucune garantie d'acceptation par une revue ni d'absence de similitudes textuelles.",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];
    if (article.authors) {
      children.push(
        new Paragraph({ text: article.authors, alignment: AlignmentType.CENTER, spacing: { after: 400 } })
      );
    }

    for (const section of sections) {
      children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1 }));
      children.push(...contentParagraphs(section.content));
      if (section.sources && section.sources.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text:
                  "Sources utilisées : " +
                  section.sources.map((s) => `${s.label} (${s.kind})`).join(" ; "),
                italics: true,
                size: 20,
                color: "525252",
              }),
            ],
            spacing: { after: 300 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });
    const buffer = await Packer.toBuffer(doc);
    const filename =
      article.title.replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 60) || "article";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}.docx"`,
      },
    });
  } catch (error) {
    console.error("[POST /api/articles/export-docx] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'export DOCX." }, { status: 500 });
  }
}

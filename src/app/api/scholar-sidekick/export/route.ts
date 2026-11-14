// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/scholar-sidekick/export (v1.10.23)
// Export de citations résolues depuis des identifiants : BibTeX,
// RIS, CSL-JSON, EndNote XML, RefWorks, NBIB, RDF, CSV…
// Complète l'export BibTeX natif du module Références.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { exportCitations, ScholarSidekickError, type SsFormatResponse } from "@/lib/scholarly/scholar-sidekick";

const EXPORT_FORMATS = ["txt", "ris", "bibtex", "csl-json", "endnote-xml", "endnote-refer", "refworks", "nbib", "rdf", "csv"] as const;

const exportSchema = z.object({
  text: z.string().min(3).max(20_000),
  format: z.enum(EXPORT_FORMATS).default("bibtex"),
  lang: z.string().max(16).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = exportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await exportCitations(parsed.data);
    return NextResponse.json({ data: result satisfies SsFormatResponse });
  } catch (error) {
    if (error instanceof ScholarSidekickError) {
      console.error("[POST /api/scholar-sidekick/export] Upstream:", error.message);
      return NextResponse.json(
        {
          error: `Scholar Sidekick indisponible : ${error.message}`,
          code: error.code ?? "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }
    console.error("[POST /api/scholar-sidekick/export] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'export des citations" }, { status: 500 });
  }
}

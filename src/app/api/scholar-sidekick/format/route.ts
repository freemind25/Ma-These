// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/scholar-sidekick/format (v1.10.23)
// Formatage de citations : DOI, PMID, PMCID, arXiv, ISBN, ISSN,
// bibcode ADS → citation formatée dans n'importe quel style CSL
// (10 000+ styles). Batch : un identifiant par ligne.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { formatCitations, ScholarSidekickError, type SsFormatResponse } from "@/lib/scholarly/scholar-sidekick";

const formatSchema = z.object({
  /** Un ou plusieurs identifiants (un par ligne) — DOI, PMID, arXiv… */
  text: z.string().min(3).max(20_000),
  /** Identifiant de style CSL (ex. "vancouver", "apa", "ieee") */
  style: z.string().max(64).default("apa"),
  /** Locale de rendu CSL (ex. "fr-FR") */
  lang: z.string().max(16).optional(),
  output: z.enum(["text", "html", "json"]).default("text"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = formatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await formatCitations(parsed.data);
    return NextResponse.json({ data: result satisfies SsFormatResponse });
  } catch (error) {
    if (error instanceof ScholarSidekickError) {
      console.error("[POST /api/scholar-sidekick/format] Upstream:", error.message);
      return NextResponse.json(
        {
          error: `Scholar Sidekick indisponible : ${error.message}`,
          code: error.code ?? "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }
    console.error("[POST /api/scholar-sidekick/format] Error:", error);
    return NextResponse.json({ error: "Erreur lors du formatage des citations" }, { status: 500 });
  }
}

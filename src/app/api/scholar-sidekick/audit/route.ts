// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/scholar-sidekick/audit (v1.10.23)
// Audit anti-hallucination d'une bibliographie complète via Scholar
// Sidekick : verdict par référence (matched / mismatch / ambiguous /
// not_found) + rétractations (Retraction Watch + Crossref).
// Découpage en lots ≤ 25 entrées côté serveur (limite upstream).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { auditBibliography, ScholarSidekickError, type SsAuditMerged } from "@/lib/scholarly/scholar-sidekick";

const auditSchema = z.object({
  /** Bibliographie brute : BibTeX, RIS, CSL-JSON ou une référence par ligne/bloc */
  bibliography: z.string().min(5, "Bibliographie requise (minimum 5 caractères)").max(400_000),
  /** Surcharge du format auto-détecté */
  format: z.enum(["bibtex", "ris", "csl-json"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = auditSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const audit = await auditBibliography(parsed.data.bibliography, { format: parsed.data.format });
    return NextResponse.json({ data: audit satisfies SsAuditMerged });
  } catch (error) {
    if (error instanceof ScholarSidekickError) {
      console.error("[POST /api/scholar-sidekick/audit] Upstream:", error.message);
      return NextResponse.json(
        {
          error: `Scholar Sidekick indisponible : ${error.message}`,
          code: error.code ?? "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }
    console.error("[POST /api/scholar-sidekick/audit] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'audit de la bibliographie" }, { status: 500 });
  }
}

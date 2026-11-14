// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/scholar-sidekick/detect (v1.10.23)
// Détection d'identifiants académiques (DOI, PMID, PMCID, arXiv,
// ISBN, ISSN, bibcode ADS) dans du texte libre — alimente le
// scan de références de l'éditeur de thèse. Texte long découpé
// en fenêtres ≤ 9 500 chars côté serveur, identifiants dédupliqués.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { detectIdentifiers, ScholarSidekickError, type SsDetectResponse } from "@/lib/scholarly/scholar-sidekick";

const detectSchema = z.object({
  text: z.string().min(3).max(400_000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = detectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await detectIdentifiers(parsed.data.text);
    return NextResponse.json({ data: result satisfies SsDetectResponse });
  } catch (error) {
    if (error instanceof ScholarSidekickError) {
      console.error("[POST /api/scholar-sidekick/detect] Upstream:", error.message);
      return NextResponse.json(
        {
          error: `Scholar Sidekick indisponible : ${error.message}`,
          code: error.code ?? "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }
    console.error("[POST /api/scholar-sidekick/detect] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la détection d'identifiants" }, { status: 500 });
  }
}

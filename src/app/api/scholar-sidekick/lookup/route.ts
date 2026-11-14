// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/scholar-sidekick/lookup (v1.10.23)
// Résolution d'un identifiant (DOI, PMID, arXiv, ISBN…) vers les
// métadonnées normalisées (titre, auteurs, année, journal…).
// Utilisé par le détecteur de références de l'éditeur pour préremplir
// une référence avant insertion dans la bibliothèque.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { lookupIdentifier, ScholarSidekickError, type SsLookupResponse } from "@/lib/scholarly/scholar-sidekick";

const lookupSchema = z.object({
  /** Identifiant : "10.1038/nphys1170", "pmid:23456789", "arXiv:1706.03762"… */
  id: z.string().min(3).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = lookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await lookupIdentifier(parsed.data.id);
    return NextResponse.json({ data: result satisfies SsLookupResponse });
  } catch (error) {
    if (error instanceof ScholarSidekickError) {
      console.error("[POST /api/scholar-sidekick/lookup] Upstream:", error.message);
      return NextResponse.json(
        {
          error: `Scholar Sidekick indisponible : ${error.message}`,
          code: error.code ?? "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }
    console.error("[POST /api/scholar-sidekick/lookup] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la résolution de l'identifiant" }, { status: 500 });
  }
}

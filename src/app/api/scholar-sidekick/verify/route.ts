// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/scholar-sidekick/verify (v1.10.23)
// Vérification anti-fabrication d'une citation : compare le titre
// revendiqué au titre réellement résolu par l'identifiant — attrape
// le pattern dominant documenté par Topaz et al. (Lancet 2026) :
// « DOI réel et résolvable + titre inventé », invisible pour un
// simple test d'existence du DOI.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { ScholarSidekickError, verifyCitation, type SsVerifyResponse } from "@/lib/scholarly/scholar-sidekick";

const verifySchema = z.object({
  title: z.string().min(1, "Titre revendiqué requis").max(2000),
  doi: z.string().max(200).optional(),
  pmid: z.string().max(20).optional(),
  pmcid: z.string().max(20).optional(),
  isbn: z.string().max(20).optional(),
  arxiv: z.string().max(40).optional(),
  issn: z.string().max(20).optional(),
  ads: z.string().max(60).optional(),
  year: z.number().int().optional(),
  container: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const result = await verifyCitation(parsed.data);
    return NextResponse.json({ data: result satisfies SsVerifyResponse });
  } catch (error) {
    if (error instanceof ScholarSidekickError) {
      console.error("[POST /api/scholar-sidekick/verify] Upstream:", error.message);
      return NextResponse.json(
        {
          error: `Scholar Sidekick indisponible : ${error.message}`,
          code: error.code ?? "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }
    console.error("[POST /api/scholar-sidekick/verify] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la vérification de la citation" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — GET /api/scholar-sidekick/styles (v1.10.23)
// Recherche paginée parmi 10 000+ styles CSL (Citation Style
// Language) : Vancouver, APA, IEEE, Nature, BMJ, Lancet, styles de
// revues et d'universités…
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { ScholarSidekickError, searchCslStyles, type SsStylesResponse } from "@/lib/scholarly/scholar-sidekick";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.slice(0, 120) ?? "";
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 50), 1), 200);
    const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

    const result = await searchCslStyles(q, limit, offset);
    return NextResponse.json({ data: result satisfies SsStylesResponse });
  } catch (error) {
    if (error instanceof ScholarSidekickError) {
      console.error("[GET /api/scholar-sidekick/styles] Upstream:", error.message);
      return NextResponse.json(
        {
          error: `Scholar Sidekick indisponible : ${error.message}`,
          code: error.code ?? "UPSTREAM_ERROR",
        },
        { status: 502 }
      );
    }
    console.error("[GET /api/scholar-sidekick/styles] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche de styles CSL" }, { status: 500 });
  }
}

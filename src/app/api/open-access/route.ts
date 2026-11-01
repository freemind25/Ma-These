// ═══════════════════════════════════════════════════════════════
// Ma Thèse — GET /api/open-access (v1.10.16)
// Statut d'accès ouvert Unpaywall pour un DOI (lien plein-texte légal).
//   ?doi=10.1038/nature12373 → { oa: { isOa, oaStatus, bestOaUrl, … } }
//   oa: null si le DOI n'est pas connu d'Unpaywall.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getOpenAccessStatus } from "@/lib/scholarly/unpaywall";
import { normalizeDoi } from "@/lib/scholarly/http";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("doi")?.trim() ?? "";
  if (!raw) {
    return NextResponse.json({ error: "Paramètre requis : ?doi=<doi>" }, { status: 400 });
  }

  const doi = normalizeDoi(raw);
  if (!/^10\.\d{4,}\//.test(doi)) {
    return NextResponse.json({ error: "Format de DOI invalide" }, { status: 400 });
  }

  const oa = await getOpenAccessStatus(doi);
  return NextResponse.json({ doi, oa });
}

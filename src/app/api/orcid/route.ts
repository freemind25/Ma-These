// ═══════════════════════════════════════════════════════════════
// Ma Thèse — GET /api/orcid (v1.10.16)
// Fiche auteur ORCID sans clé (API publique, lecture).
//   ?id=0000-0002-1825-0097  → { author, works }
//   ?q=Canguilhem            → { numFound, results[] }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import {
  getOrcidAuthorCard,
  getOrcidWorks,
  searchOrcidAuthors,
} from "@/lib/scholarly/orcid";
import { looksLikeOrcidId } from "@/lib/scholarly/http";

const MAX_WORKS = 15;

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim() ?? "";
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!id && !q) {
    return NextResponse.json(
      { error: "Paramètre requis : ?id=<orcid-iD> ou ?q=<nom>" },
      { status: 400 }
    );
  }

  // Cas 1 : iD direct → fiche complète + travaux
  if (id) {
    if (!looksLikeOrcidId(id)) {
      return NextResponse.json(
        { error: "Format d'ORCID iD invalide (attendu 0000-0000-0000-0000)" },
        { status: 400 }
      );
    }
    const author = await getOrcidAuthorCard(id);
    if (!author) {
      return NextResponse.json(
        { error: "Auteur introuvable ou ORCID indisponible" },
        { status: 404 }
      );
    }
    const works = await getOrcidWorks(id, MAX_WORKS);
    return NextResponse.json({ author, works });
  }

  // Cas 2 : recherche par nom
  if (q.length < 2) {
    return NextResponse.json(
      { error: "Requête trop courte (2 caractères minimum)" },
      { status: 400 }
    );
  }
  const search = await searchOrcidAuthors(q);
  return NextResponse.json(search);
}

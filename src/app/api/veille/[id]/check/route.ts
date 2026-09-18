import { NextRequest, NextResponse } from "next/server";
import {
  runCheckForSavedSearch,
  SourceFetchError,
  VeilleNotFoundError,
} from "@/lib/veille/run-check";

// ═══════════════════════════════════════════════════════════════
// /api/veille/[id]/check — vérification manuelle d'une veille
// specs/veille-academique — T5 · specs/veille-check-auto — T2
//
// Wrapper mince autour de runCheckForSavedSearch (lib commune au
// check manuel et au worker "veille-check") — contrat inchangé :
// 200 { data } · 404 veille inconnue · 502 source en erreur.
// ═══════════════════════════════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await runCheckForSavedSearch(id, request.nextUrl.origin);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof VeilleNotFoundError) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }
    if (error instanceof SourceFetchError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    console.error("[POST /api/veille/[id]/check] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de la veille" },
      { status: 500 }
    );
  }
}

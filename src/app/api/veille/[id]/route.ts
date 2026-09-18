import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

// ═══════════════════════════════════════════════════════════════
// /api/veille/[id] — gestion d'une veille
// PATCH : renommage (CA-1.1) — DELETE : suppression (CA-1.2)
// specs/veille-academique — T4
// ═══════════════════════════════════════════════════════════════

function isNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

// ═══════════════════════════════════════════════════════════════
// PATCH /api/veille/[id] — réglages de la veille
// specs/veille-academique — T4 (renommage CA-1.1)
// specs/veille-check-auto — T3 (autoCheck CA-1.1/1.2)
// Accepte { label? } et/ou { autoCheck? : boolean } — 400 si les deux absents.
// ═══════════════════════════════════════════════════════════════
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as {
      label?: unknown;
      autoCheck?: unknown;
    } | null;

    const hasLabel = !!body && typeof body.label === "string";
    const hasAutoCheck = !!body && "autoCheck" in body;
    const autoCheckValid = !hasAutoCheck || typeof body?.autoCheck === "boolean";

    if (!body || (!hasLabel && !hasAutoCheck)) {
      return NextResponse.json(
        { error: "Fournir un nouveau libellé et/ou le réglage autoCheck" },
        { status: 400 }
      );
    }
    if (hasLabel && !String(body.label).trim()) {
      return NextResponse.json(
        { error: "Le nouveau libellé est requis" },
        { status: 400 }
      );
    }
    if (!autoCheckValid) {
      return NextResponse.json(
        { error: "autoCheck doit être un booléen" },
        { status: 400 }
      );
    }

    const search = await db.savedSearch.update({
      where: { id },
      data: {
        ...(hasLabel ? { label: String(body.label).trim() } : {}),
        ...(hasAutoCheck ? { autoCheck: body.autoCheck as boolean } : {}),
      },
    });

    return NextResponse.json({ data: search });
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }
    console.error("[PATCH /api/veille/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du renommage de la veille" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE /api/veille/[id] — suppression (CA-1.2)
// Les résultats sont supprimés en cascade (onDelete: Cascade).
// ═══════════════════════════════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.savedSearch.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true, id } });
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: "Veille introuvable" }, { status: 404 });
    }
    console.error("[DELETE /api/veille/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la veille" },
      { status: 500 }
    );
  }
}

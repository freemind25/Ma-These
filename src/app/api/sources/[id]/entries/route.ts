import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotebookEntrySchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/sources/[id]/entries — List entries for a source
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify source exists
    const source = await db.researchSource.findUnique({
      where: { id },
    });

    if (!source) {
      return NextResponse.json(
        { error: "Source de recherche introuvable" },
        { status: 404 }
      );
    }

    const entries = await db.notebookEntry.findMany({
      where: { sourceId: id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      data: entries,
      meta: { count: entries.length },
    });
  } catch (error) {
    console.error("[GET /api/sources/[id]/entries] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notes" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/sources/[id]/entries — Create entry for a source
// ═══════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify source exists
    const source = await db.researchSource.findUnique({
      where: { id },
    });

    if (!source) {
      return NextResponse.json(
        { error: "Source de recherche introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = createNotebookEntrySchema.parse(body);

    const entry = await db.notebookEntry.create({
      data: {
        ...validated,
        sourceId: id,
      },
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/sources/[id]/entries] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la note" },
      { status: 500 }
    );
  }
}

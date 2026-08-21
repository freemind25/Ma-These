import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotebookEntrySchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/entries — List all entries across sources
// Supports ?search=xxx&tags=xxx
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const tags = searchParams.get("tags");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { question: { contains: search } },
        { answer: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    if (tags) {
      where.tags = { contains: tags };
    }

    const entries = await db.notebookEntry.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        source: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: entries,
      meta: { count: entries.length },
    });
  } catch (error) {
    console.error("[GET /api/entries] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notes" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/entries — Create a standalone notebook entry
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createNotebookEntrySchema.parse(body);

    const entry = await db.notebookEntry.create({ data: validated });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/entries] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la note" },
      { status: 500 }
    );
  }
}

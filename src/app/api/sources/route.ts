import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createResearchSourceSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/sources — List all research sources
// Supports ?type=article&search=xxx
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (type && type !== "all") {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const sources = await db.researchSource.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });

    return NextResponse.json({
      data: sources,
      meta: { count: sources.length },
    });
  } catch (error) {
    console.error("[GET /api/sources] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sources de recherche" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/sources — Create a research source
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createResearchSourceSchema.parse(body);

    const source = await db.researchSource.create({ data: validated });

    return NextResponse.json({ data: source }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/sources] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la source de recherche" },
      { status: 500 }
    );
  }
}

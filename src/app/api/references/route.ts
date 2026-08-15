import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createReferenceSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/references — List all references
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const favoritesOnly = searchParams.get("favorites") === "true";

    const where: Record<string, unknown> = {};
    if (type && type !== "all") where.type = type;
    if (favoritesOnly) where.isFavorite = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { contains: search } },
        { keywords: { contains: search } },
      ];
    }

    const references = await db.reference.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      data: references,
      meta: { count: references.length },
    });
  } catch (error) {
    console.error("[GET /api/references] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des références" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/references — Create a reference
// ═══════════════════════════════════════


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createReferenceSchema.parse(body);

    const reference = await db.reference.create({ data: validated });

    return NextResponse.json({ data: reference }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/references] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la référence" },
      { status: 500 }
    );
  }
}

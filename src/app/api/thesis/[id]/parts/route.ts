import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPartSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/thesis/[id]/parts — List parts
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parts = await db.part.findMany({
      where: { thesisId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      data: parts,
      meta: { count: parts.length },
    });
  } catch (error) {
    console.error("[GET /api/thesis/[id]/parts] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des parties" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/thesis/[id]/parts — Create part
// ═══════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createPartSchema.parse(body);

    const existingCount = await db.part.count({ where: { thesisId: id } });

    const part = await db.part.create({
      data: {
        thesisId: id,
        title: validated.title,
        sortOrder: validated.sortOrder ?? existingCount,
      },
    });

    return NextResponse.json({ data: part }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/thesis/[id]/parts] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la partie" },
      { status: 500 }
    );
  }
}

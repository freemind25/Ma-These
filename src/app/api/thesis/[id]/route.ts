import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/thesis/[id] — Get a single thesis
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const thesis = await db.thesis.findUnique({
      where: { id },
      include: {
        chapters: { orderBy: { sortOrder: "asc" } },
        parts: { orderBy: { sortOrder: "asc" } },
        cadrages: {
          where: { isActive: true },
          include: { fields: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });

    if (!thesis) {
      return NextResponse.json(
        { error: "Thèse non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: thesis });
  } catch (error) {
    console.error("[GET /api/thesis/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/thesis/[id] — Update a thesis
// ═══════════════════════════════════════
const updateThesisSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  email: z.string().email().optional(),
  institution: z.string().optional(),
  laboratory: z.string().optional(),
  discipline: z.string().optional(),
  directorName: z.string().optional(),
  status: z.string().optional(),
  structureMode: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateThesisSchema.parse(body);

    const thesis = await db.thesis.update({
      where: { id },
      data: validated,
      include: { chapters: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ data: thesis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/thesis/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/thesis/[id] — Delete a thesis
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.thesis.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/thesis/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

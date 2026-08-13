import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateSprintSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/sprints/[id] — Get a single sprint with stories
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sprint = await db.agileSprint.findUnique({
      where: { id },
      include: {
        stories: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!sprint) {
      return NextResponse.json(
        { error: "Sprint non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: sprint });
  } catch (error) {
    console.error("[GET /api/sprints/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du sprint" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/sprints/[id] — Update a sprint
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSprintSchema.parse(body);

    const data: Record<string, unknown> = {};
    if (validated.title !== undefined) data.title = validated.title;
    if (validated.description !== undefined) data.description = validated.description;
    if (validated.startDate !== undefined) data.startDate = new Date(validated.startDate);
    if (validated.endDate !== undefined) data.endDate = new Date(validated.endDate);
    if (validated.status !== undefined) data.status = validated.status;
    if (validated.sortOrder !== undefined) data.sortOrder = validated.sortOrder;

    const sprint = await db.agileSprint.update({
      where: { id },
      data,
      include: {
        stories: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ data: sprint });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/sprints/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du sprint" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/sprints/[id] — Delete a sprint
// Cascade deletes stories via Prisma schema
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sprint = await db.agileSprint.findUnique({ where: { id } });
    if (!sprint) {
      return NextResponse.json(
        { error: "Sprint non trouvé" },
        { status: 404 }
      );
    }

    // Cascade delete is handled by Prisma schema (onDelete: Cascade on stories)
    await db.agileSprint.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/sprints/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du sprint" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createStorySchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/sprints/[id]/stories — List stories for a sprint
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify sprint exists
    const sprint = await db.agileSprint.findUnique({ where: { id } });
    if (!sprint) {
      return NextResponse.json(
        { error: "Sprint non trouvé" },
        { status: 404 }
      );
    }

    const stories = await db.agileStory.findMany({
      where: { sprintId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      data: stories,
      meta: { count: stories.length },
    });
  } catch (error) {
    console.error("[GET /api/sprints/[id]/stories] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des stories" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/sprints/[id]/stories — Create a story
// ═══════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createStorySchema.parse(body);

    // Verify sprint exists
    const sprint = await db.agileSprint.findUnique({ where: { id } });
    if (!sprint) {
      return NextResponse.json(
        { error: "Sprint non trouvé" },
        { status: 404 }
      );
    }

    // Determine next sort order
    const existingCount = await db.agileStory.count({
      where: { sprintId: id },
    });

    const story = await db.agileStory.create({
      data: {
        sprintId: id,
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        storyPoints: validated.storyPoints,
        sortOrder: validated.sortOrder ?? existingCount,
      },
    });

    return NextResponse.json({ data: story }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/sprints/[id]/stories] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la story" },
      { status: 500 }
    );
  }
}

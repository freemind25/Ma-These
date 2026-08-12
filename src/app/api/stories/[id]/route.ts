import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateStorySchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/stories/[id] — Update a story
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateStorySchema.parse(body);

    // Verify story exists
    const story = await db.agileStory.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json(
        { error: "Story non trouvée" },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    if (validated.title !== undefined) data.title = validated.title;
    if (validated.description !== undefined) data.description = validated.description;
    if (validated.status !== undefined) data.status = validated.status;
    if (validated.priority !== undefined) data.priority = validated.priority;
    if (validated.storyPoints !== undefined) data.storyPoints = validated.storyPoints;
    if (validated.sortOrder !== undefined) data.sortOrder = validated.sortOrder;

    const updatedStory = await db.agileStory.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: updatedStory });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/stories/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la story" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/stories/[id] — Delete a story
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify story exists
    const story = await db.agileStory.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json(
        { error: "Story non trouvée" },
        { status: 404 }
      );
    }

    await db.agileStory.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/stories/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la story" },
      { status: 500 }
    );
  }
}

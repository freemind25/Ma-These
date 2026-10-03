import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/book-skills/[id] — Get full book skill content
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skill = await db.customBookSkill.findUnique({
      where: { id },
    });

    if (!skill) {
      return NextResponse.json(
        { error: "Compétence non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: skill });
  } catch (error) {
    console.error("[GET /api/book-skills/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/book-skills/[id] — Update a book skill
// ═══════════════════════════════════════
const updateSchema = z.object({
  title: z.string().min(1, "Le titre ne peut pas être vide").optional(),
  author: z.string().nullish(),
  content: z
    .string()
    .min(10, "Le contenu doit contenir au moins 10 caractères")
    .optional(),
  tags: z.string().nullish(),
  description: z
    .string()
    .max(500, "La description ne doit pas dépasser 500 caractères")
    .nullish(),
  source: z
    .string()
    .max(300, "La source ne doit pas dépasser 300 caractères")
    .nullish(),
  enabled: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de la requête JSON invalide" },
        { status: 400 }
      );
    }

    let validated: z.infer<typeof updateSchema>;
    try {
      validated = updateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Données invalides", details: error.flatten() },
          { status: 400 }
        );
      }
      throw error;
    }

    const { title, author, content, tags, description, source, enabled } =
      validated;

    const skill = await db.customBookSkill.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(author !== undefined && { author }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(description !== undefined && { description }),
        ...(source !== undefined && { source }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json({ data: skill });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Compétence non trouvée" },
        { status: 404 }
      );
    }
    console.error("[PUT /api/book-skills/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/book-skills/[id] — Delete a book skill
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.customBookSkill.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/book-skills/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

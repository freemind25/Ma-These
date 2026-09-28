import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const { title, author, content, tags } = body as Record<string, unknown>;

    const skill = await db.customBookSkill.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title as string }),
        ...(author !== undefined && { author: author as string | null }),
        ...(content !== undefined && { content: content as string }),
        ...(tags !== undefined && { tags: tags as string | null }),
      },
    });

    return NextResponse.json({ data: skill });
  } catch (error) {
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

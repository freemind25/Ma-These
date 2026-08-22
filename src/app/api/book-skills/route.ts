import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/book-skills — List all book skills
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
        { title: { contains: search } },
        { author: { contains: search } },
        { content: { contains: search } },
      ];
    }
    if (tags) {
      where.tags = { contains: tags };
    }

    const skills = await db.customBookSkill.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        author: true,
        tags: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return content preview (first 300 chars) for list view
    const data = skills.map((s) => ({
      ...s,
      contentPreview: s.content.slice(0, 300),
      contentLength: s.content.length,
      content: undefined, // Don't send full content in list
    }));

    return NextResponse.json({
      data,
      meta: { count: skills.length },
    });
  } catch (error) {
    console.error("[GET /api/book-skills] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des compétences" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/book-skills — Create a book skill
// ═══════════════════════════════════════
const createSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().optional(),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  tags: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de la requête JSON invalide" },
        { status: 400 }
      );
    }

    const validated = createSchema.parse(body);

    const skill = await db.customBookSkill.create({
      data: validated,
    });

    return NextResponse.json({ data: skill }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/book-skills] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la compétence" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/book-skills — Delete a book skill
// Query: ?id=xxx  OR  body: { ids: [...] }
// ═══════════════════════════════════════
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await db.customBookSkill.delete({ where: { id } });
      return NextResponse.json({ data: { deleted: true } });
    }

    // Bulk delete by IDs
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const parsed = z.object({
      ids: z.array(z.string()).optional(),
    }).parse(body);

    if (parsed.ids && parsed.ids.length > 0) {
      const result = await db.customBookSkill.deleteMany({
        where: { id: { in: parsed.ids } },
      });
      return NextResponse.json({
        data: { deletedCount: result.count },
      });
    }

    return NextResponse.json(
      { error: "Fournissez ?id=xxx ou { ids: [...] }" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[DELETE /api/book-skills] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

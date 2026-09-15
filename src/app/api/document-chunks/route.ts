import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/document-chunks — List chunks with optional filters
// Supports ?sourceType=chapter&sourceId=xxx&search=xxx
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get("sourceType");
    const sourceId = searchParams.get("sourceId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (sourceType) {
      where.sourceType = sourceType;
    }
    if (sourceId) {
      where.sourceId = sourceId;
    }
    if (search) {
      where.content = { contains: search };
    }

    const chunks = await db.documentChunk.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: chunks,
      meta: { count: chunks.length },
    });
  } catch (error) {
    console.error("[GET /api/document-chunks] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des chunks" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/document-chunks — Delete chunks with optional filters
// Query params: ?sourceType=chapter&sourceId=xxx
// Body (for delete-all): { confirmAll: true }
// ═══════════════════════════════════════
const deleteBodySchema = z.object({
  confirmAll: z.boolean().optional(),
});

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get("sourceType");
    const sourceId = searchParams.get("sourceId");

    const where: Record<string, unknown> = {};
    if (sourceType) {
      where.sourceType = sourceType;
    }
    if (sourceId) {
      where.sourceId = sourceId;
    }

    // If no filters provided, require confirmAll in body
    const hasFilters = sourceType || sourceId;
    if (!hasFilters) {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const validated = deleteBodySchema.parse(body);
      if (!validated.confirmAll) {
        return NextResponse.json(
          { error: "Confirmation requise : passez { confirmAll: true } dans le corps de la requête" },
          { status: 400 }
        );
      }
    }

    const result = await db.documentChunk.deleteMany({ where });

    return NextResponse.json({
      data: { deletedCount: result.count },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[DELETE /api/document-chunks] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des chunks" },
      { status: 500 }
    );
  }
}

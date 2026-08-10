import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateAiConfigSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// PUT /api/ai-config/[id] — Update AI tool configuration
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateAiConfigSchema.parse(body);

    const config = await db.aiToolConfig.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ data: config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/ai-config/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la configuration IA" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/ai-config/[id] — Delete AI tool configuration
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.aiToolConfig.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/ai-config/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la configuration IA" },
      { status: 500 }
    );
  }
}

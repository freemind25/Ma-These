import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAiConfigSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/ai-config — List all AI tool configurations
// ═══════════════════════════════════════
export async function GET() {
  try {
    const configs = await db.aiToolConfig.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: configs,
      meta: { count: configs.length },
    });
  } catch (error) {
    console.error("[GET /api/ai-config] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des configurations IA" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/ai-config — Create AI tool configuration
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createAiConfigSchema.parse(body);

    const config = await db.aiToolConfig.create({ data: validated });

    return NextResponse.json({ data: config }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/ai-config] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la configuration IA" },
      { status: 500 }
    );
  }
}

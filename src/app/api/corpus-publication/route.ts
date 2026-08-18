import { NextRequest, NextResponse } from "next/server";
import { getAllFiches, detectRelevantFiches, getFichesContentForPrompt, getFicheById } from "@/data/corpus-publication";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/corpus-publication — Returns all 6 fiches
// ═══════════════════════════════════════

export async function GET() {
  try {
    const fiches = getAllFiches();
    return NextResponse.json({ data: fiches });
  } catch (error) {
    console.error("[GET /api/corpus-publication] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération du corpus";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// POST /api/corpus-publication — Detect relevant fiches for a message
// Body: { message: string, maxFiches?: number }
// Returns: { ficheIds: string[], fiches: CorpusFiche[], promptContent: string }
// ═══════════════════════════════════════

const corpusPostSchema = z.object({
  message: z.string().min(1),
  maxFiches: z.number().int().min(1).max(6).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = corpusPostSchema.parse(body);

    const ficheIds = detectRelevantFiches(validated.message, validated.maxFiches);
    const promptContent = getFichesContentForPrompt(ficheIds);

    const fiches = ficheIds
      .map((id) => getFicheById(id))
      .filter((f): f is NonNullable<typeof f> => f !== undefined);

    return NextResponse.json({
      data: {
        ficheIds,
        fiches,
        promptContent,
      },
    });
  } catch (error) {
    console.error("[POST /api/corpus-publication] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la détection des fiches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

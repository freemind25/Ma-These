import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/types-analyse — List analysis types
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get("discipline");

    const where: Record<string, unknown> = {};
    if (discipline) where.discipline = discipline;

    const types = await db.typeAnalyseMethodologique.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: types });
  } catch (error) {
    console.error("[GET /api/types-analyse] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la lecture" }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// POST /api/types-analyse — Create analysis type
// ═══════════════════════════════════════
const createSchema = z.object({
  discipline: z.string().min(1),
  nom: z.string().min(1),
  elementsAttendus: z.record(z.unknown()), // structured object
  promptQuestionneur: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    const type = await db.typeAnalyseMethodologique.create({
      data: {
        discipline: validated.discipline,
        nom: validated.nom,
        elementsAttendus: JSON.stringify(validated.elementsAttendus),
        promptQuestionneur: validated.promptQuestionneur || null,
      },
    });

    return NextResponse.json({ data: type }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/types-analyse] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// Journal d'expérimentations — collection
// ═══════════════════════════════════════

const createExperimentSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  question: z.string().min(1, "La question / hypothèse est requise"),
  hypothesisRef: z.string().optional(),
  protocol: z.string().optional(),
  tags: z.string().optional(),
});

// GET /api/experiments — liste des expérimentations avec leurs runs
export async function GET() {
  try {
    const experiments = await db.experiment.findMany({
      include: {
        runs: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ data: experiments });
  } catch (error) {
    console.error("[GET /api/experiments] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des expérimentations" },
      { status: 500 }
    );
  }
}

// POST /api/experiments — créer une expérimentation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createExperimentSchema.parse(body);
    const experiment = await db.experiment.create({ data: validated });
    return NextResponse.json({ data: experiment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/experiments] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'expérimentation" },
      { status: 500 }
    );
  }
}

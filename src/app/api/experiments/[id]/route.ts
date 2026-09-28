import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// Expérimentation individuelle
// ═══════════════════════════════════════

const updateExperimentSchema = z.object({
  title: z.string().min(1).optional(),
  question: z.string().min(1).optional(),
  hypothesisRef: z.string().nullable().optional(),
  protocol: z.string().nullable().optional(),
  status: z.enum(["planned", "running", "concluded"]).optional(),
  conclusion: z.string().nullable().optional(),
  verdict: z.enum(["supported", "refuted", "inconclusive"]).nullable().optional(),
  tags: z.string().nullable().optional(),
});

// GET /api/experiments/[id] — détail avec runs
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const experiment = await db.experiment.findUnique({
      where: { id },
      include: {
        runs: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });
    if (!experiment) {
      return NextResponse.json(
        { error: "Expérimentation non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: experiment });
  } catch (error) {
    console.error("[GET /api/experiments/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'expérimentation" },
      { status: 500 }
    );
  }
}

// PATCH /api/experiments/[id] — mise à jour (statut, verdict, conclusion…)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateExperimentSchema.parse(body);
    const experiment = await db.experiment.update({
      where: { id },
      data: validated,
      include: {
        runs: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });
    return NextResponse.json({ data: experiment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PATCH /api/experiments/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'expérimentation" },
      { status: 500 }
    );
  }
}

// DELETE /api/experiments/[id] — supprimer (cascade runs)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.experiment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/experiments/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'expérimentation" },
      { status: 500 }
    );
  }
}

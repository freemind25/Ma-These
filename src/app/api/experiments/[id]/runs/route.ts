import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// Runs d'une expérimentation
// ═══════════════════════════════════════

const createRunSchema = z.object({
  label: z.string().min(1, "Le libellé du run est requis"),
  variant: z.string().optional(),
  metrics: z.string().optional(), // JSON : [{ name, value }]
  result: z.string().optional(),
  evidenceUrl: z.string().optional(),
  status: z.enum(["pending", "running", "done", "failed"]).default("pending"),
  verdict: z.enum(["confirmed", "refuted", "inconclusive"]).nullable().optional(),
  notes: z.string().optional(),
  startedAt: z.string().datetime().optional(),
});

// POST /api/experiments/[id]/runs — ajouter un run
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createRunSchema.parse(body);

    const experiment = await db.experiment.findUnique({ where: { id } });
    if (!experiment) {
      return NextResponse.json(
        { error: "Expérimentation non trouvée" },
        { status: 404 }
      );
    }

    const run = await db.experimentRun.create({
      data: {
        experimentId: id,
        label: validated.label,
        variant: validated.variant,
        metrics: validated.metrics,
        result: validated.result,
        evidenceUrl: validated.evidenceUrl,
        status: validated.status,
        verdict: validated.verdict ?? null,
        notes: validated.notes,
        startedAt: validated.startedAt ? new Date(validated.startedAt) : new Date(),
        sortOrder: experiment
          ? (await db.experimentRun.count({ where: { experimentId: id } })) + 1
          : 0,
      },
    });
    return NextResponse.json({ data: run }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/experiments/[id]/runs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du run" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// Run individuel
// ═══════════════════════════════════════

const updateRunSchema = z.object({
  label: z.string().min(1).optional(),
  variant: z.string().nullable().optional(),
  metrics: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  evidenceUrl: z.string().nullable().optional(),
  status: z.enum(["pending", "running", "done", "failed"]).optional(),
  verdict: z.enum(["confirmed", "refuted", "inconclusive"]).nullable().optional(),
  notes: z.string().nullable().optional(),
  startedAt: z.string().datetime().nullable().optional(),
});

// PATCH /api/experiments/[id]/runs/[runId] — mise à jour du run
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const validated = updateRunSchema.parse(body);

    const data: Record<string, unknown> = { ...validated };
    if ("startedAt" in data) {
      data.startedAt = validated.startedAt ? new Date(validated.startedAt) : null;
    }

    const run = await db.experimentRun.update({
      where: { id: runId },
      data,
    });
    return NextResponse.json({ data: run });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PATCH /api/experiments/[id]/runs/[runId]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du run" },
      { status: 500 }
    );
  }
}

// DELETE /api/experiments/[id]/runs/[runId] — supprimer le run
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; runId: string }> }
) {
  try {
    const { runId } = await params;
    await db.experimentRun.delete({ where: { id: runId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/experiments/[id]/runs/[runId]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du run" },
      { status: 500 }
    );
  }
}

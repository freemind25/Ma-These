import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { enqueueJob } from "@/lib/jobs/queue";
import { getRegisteredJobTypes } from "@/lib/jobs/worker";

// ═══════════════════════════════════════
// POST /api/jobs — Soumettre une opération longue à la file persistante (A.8)
// GET  /api/jobs — Lister les jobs (suivi d'état)
// ═══════════════════════════════════════

const createSchema = z.object({
  type: z.string().refine(
    (t) => getRegisteredJobTypes().includes(t),
    { message: "Type de job inconnu — voir data.registeredTypes" }
  ),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    const job = await enqueueJob(validated.type, validated.payload);

    return NextResponse.json(
      {
        data: {
          id: job.id,
          type: job.type,
          status: job.status,
          createdAt: job.createdAt,
        },
        registeredTypes: getRegisteredJobTypes(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/jobs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission du job" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);

    const jobs = await db.job.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        attempts: true,
        error: true,
        createdAt: true,
        startedAt: true,
        finishedAt: true,
      },
    });

    return NextResponse.json({ data: jobs });
  } catch (error) {
    console.error("[GET /api/jobs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des jobs" },
      { status: 500 }
    );
  }
}

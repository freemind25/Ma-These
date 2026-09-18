import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/jobs/[id] — État détaillé d'un job (A.8)
// ═══════════════════════════════════════

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await db.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...job,
        payload: safeParse(job.payload),
        result: job.result ? safeParse(job.result) : null,
      },
    });
  } catch (error) {
    console.error("[GET /api/jobs/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du job" },
      { status: 500 }
    );
  }
}

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return json;
  }
}

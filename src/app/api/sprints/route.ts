import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSprintSchema } from "@/lib/api-schemas";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/sprints — List all sprints
// Query params: ?phase=phase_2&status=active
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const phase = searchParams.get("phase");
    const status = searchParams.get("status");

    const where: Record<string, string> = {};
    if (phase) where.phase = phase;
    if (status) where.status = status;

    const sprints = await db.agileSprint.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        _count: {
          select: { stories: true },
        },
      },
    });

    return NextResponse.json({
      data: sprints,
      meta: { count: sprints.length },
    });
  } catch (error) {
    console.error("[GET /api/sprints] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sprints" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/sprints — Create a sprint
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSprintSchema.parse(body);

    const sprint = await db.agileSprint.create({
      data: {
        phase: validated.phase,
        title: validated.title,
        description: validated.description,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        sortOrder: validated.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ data: sprint }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/sprints] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du sprint" },
      { status: 500 }
    );
  }
}

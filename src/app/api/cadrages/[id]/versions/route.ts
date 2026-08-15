import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/cadrages/[id]/versions — List versions for a cadrage
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const versions = await db.thesisCadrageVersion.findMany({
      where: { cadrageId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: versions,
      meta: { count: versions.length },
    });
  } catch (error) {
    console.error("[GET /api/cadrages/[id]/versions] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des versions" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/cadrages/[id]/versions — Snapshot all fields as JSON version
// ═══════════════════════════════════════
const createVersionSchema = z.object({
  label: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createVersionSchema.parse(body);

    // Fetch all fields for the cadrage
    const fields = await db.thesisCadrageField.findMany({
      where: { cadrageId: id },
      orderBy: { sortOrder: "asc" },
    });

    const snapshot = JSON.stringify(fields);

    const version = await db.thesisCadrageVersion.create({
      data: {
        cadrageId: id,
        label: validated.label,
        snapshot,
      },
    });

    return NextResponse.json({ data: version }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/cadrages/[id]/versions] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la version" },
      { status: 500 }
    );
  }
}

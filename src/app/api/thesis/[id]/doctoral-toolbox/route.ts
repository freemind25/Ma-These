import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/thesis/[id]/doctoral-toolbox — Get toolbox for a thesis
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toolbox = await db.doctoralToolbox.findUnique({
      where: { thesisId: id },
    });

    if (!toolbox) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: toolbox });
  } catch (error) {
    console.error("[GET /api/thesis/[id]/doctoral-toolbox] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la boîte doctorale" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/thesis/[id]/doctoral-toolbox — Create toolbox for a thesis
// ═══════════════════════════════════════
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if toolbox already exists
    const existing = await db.doctoralToolbox.findUnique({
      where: { thesisId: id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Une boîte doctorale existe déjà pour cette thèse" },
        { status: 409 }
      );
    }

    const toolbox = await db.doctoralToolbox.create({
      data: {
        thesisId: id,
        checklist: typeof body.checklist === "string" ? body.checklist : JSON.stringify(body.checklist || {}),
        milestones: typeof body.milestones === "string" ? body.milestones : JSON.stringify(body.milestones || []),
        documents: typeof body.documents === "string" ? body.documents : JSON.stringify(body.documents || []),
        contacts: typeof body.contacts === "string" ? body.contacts : JSON.stringify(body.contacts || []),
        notes: body.notes || "",
      },
    });

    return NextResponse.json({ data: toolbox }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/thesis/[id]/doctoral-toolbox] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la boîte doctorale" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/thesis/[id]/doctoral-toolbox — Update toolbox for a thesis
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.doctoralToolbox.findUnique({
      where: { thesisId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Aucune boîte doctorale trouvée pour cette thèse" },
        { status: 404 }
      );
    }

    const toolbox = await db.doctoralToolbox.update({
      where: { thesisId: id },
      data: {
        ...(body.checklist !== undefined && {
          checklist: typeof body.checklist === "string" ? body.checklist : JSON.stringify(body.checklist),
        }),
        ...(body.milestones !== undefined && {
          milestones: typeof body.milestones === "string" ? body.milestones : JSON.stringify(body.milestones),
        }),
        ...(body.documents !== undefined && {
          documents: typeof body.documents === "string" ? body.documents : JSON.stringify(body.documents),
        }),
        ...(body.contacts !== undefined && {
          contacts: typeof body.contacts === "string" ? body.contacts : JSON.stringify(body.contacts),
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json({ data: toolbox });
  } catch (error) {
    console.error("[PUT /api/thesis/[id]/doctoral-toolbox] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la boîte doctorale" },
      { status: 500 }
    );
  }
}

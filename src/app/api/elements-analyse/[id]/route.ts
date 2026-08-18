import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/elements-analyse/[id]
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const element = await db.elementAnalyse.findUnique({ where: { id } });
    if (!element) {
      return NextResponse.json({ error: "Élément non trouvé" }, { status: 404 });
    }
    return NextResponse.json({ data: element });
  } catch (error) {
    console.error("[GET /api/elements-analyse/[id]] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la lecture" }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// PATCH /api/elements-analyse/[id]
// ═══════════════════════════════════════
const patchSchema = z.object({
  nom: z.string().min(1).optional(),
  typeElement: z.string().min(1).optional(),
  natureElement: z.enum(["spatial", "bibliographique", "donnee_enquete", "document"]).optional(),
  sousAnalyse: z.string().nullable().optional(),
  source: z.string().min(1).optional(),
  dateSource: z.string().datetime().nullable().optional(),
  geojson: z.unknown().nullable().optional(),
  styleConfig: z.unknown().nullable().optional(),
  chapitreId: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = patchSchema.parse(body);

    const data: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.nom !== undefined) data.nom = validated.nom;
    if (validated.typeElement !== undefined) data.typeElement = validated.typeElement;
    if (validated.natureElement !== undefined) data.natureElement = validated.natureElement;
    if (validated.sousAnalyse !== undefined) data.sousAnalyse = validated.sousAnalyse;
    if (validated.source !== undefined) data.source = validated.source;
    if (validated.dateSource !== undefined) data.dateSource = validated.dateSource ? new Date(validated.dateSource) : null;
    if (validated.geojson !== undefined) data.geojson = validated.geojson ? JSON.stringify(validated.geojson) : null;
    if (validated.styleConfig !== undefined) data.styleConfig = validated.styleConfig ? JSON.stringify(validated.styleConfig) : null;
    if (validated.chapitreId !== undefined) data.chapitreId = validated.chapitreId;

    const element = await db.elementAnalyse.update({ where: { id }, data });
    return NextResponse.json({ data: element });
  } catch (error) {
    console.error("[PATCH /api/elements-analyse/[id]] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// DELETE /api/elements-analyse/[id]
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.elementAnalyse.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/elements-analyse/[id]] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/elements-analyse — List elements
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteEtudeId = searchParams.get("siteEtudeId");
    const natureElement = searchParams.get("natureElement");
    const sousAnalyse = searchParams.get("sousAnalyse");

    const where: Record<string, unknown> = {};
    if (siteEtudeId) where.siteEtudeId = siteEtudeId;
    if (natureElement) where.natureElement = natureElement;
    if (sousAnalyse) where.sousAnalyse = sousAnalyse;

    // Note: ElementAnalyse doesn't have siteEtudeId directly.
    // We filter by sousAnalyse or natureElement, siteEtudeId filtering
    // is done client-side or via a join. For now use sousAnalyse as the main filter.
    const filterWhere: Record<string, unknown> = {};
    if (natureElement) filterWhere.natureElement = natureElement;
    if (sousAnalyse) filterWhere.sousAnalyse = sousAnalyse;

    const elements = await db.elementAnalyse.findMany({
      where: filterWhere,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: elements });
  } catch (error) {
    console.error("[GET /api/elements-analyse] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la lecture" }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// POST /api/elements-analyse — Create element
// ═══════════════════════════════════════
const createElementSchema = z.object({
  nom: z.string().min(1),
  typeElement: z.string().min(1),
  natureElement: z.enum(["spatial", "bibliographique", "donnee_enquete", "document"]),
  sousAnalyse: z.string().optional(),
  source: z.string().min(1),
  dateSource: z.string().datetime().optional(),
  geojson: z.unknown().optional(),
  styleConfig: z.unknown().optional(),
  chapitreId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createElementSchema.parse(body);

    const element = await db.elementAnalyse.create({
      data: {
        nom: validated.nom,
        typeElement: validated.typeElement,
        natureElement: validated.natureElement,
        sousAnalyse: validated.sousAnalyse || null,
        source: validated.source,
        dateSource: validated.dateSource ? new Date(validated.dateSource) : null,
        geojson: validated.geojson ? JSON.stringify(validated.geojson) : null,
        styleConfig: validated.styleConfig ? JSON.stringify(validated.styleConfig) : null,
        chapitreId: validated.chapitreId || null,
      },
    });

    return NextResponse.json({ data: element }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/elements-analyse] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

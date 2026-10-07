import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/legal-refs/[id] — Entrée complète
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const legalRef = await db.legalRef.findUnique({ where: { id } });

    if (!legalRef) {
      return NextResponse.json({ error: "Entrée non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ data: legalRef });
  } catch (error) {
    console.error("[GET /api/legal-refs/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/legal-refs/[id] — Mise à jour
// ═══════════════════════════════════════
const updateSchema = z.object({
  domaine: z.string().min(1, "Le domaine ne peut pas être vide").optional(),
  reference: z.string().min(1, "La référence ne peut pas être vide").optional(),
  joradp: z.string().max(300).nullish(),
  statut: z.string().max(300).nullish(),
  textesLies: z.string().max(500).nullish(),
  portee: z.string().max(2000).nullish(),
  questions: z.string().max(500).nullish(),
  autorites: z.string().max(300).nullish(),
  derniereVerification: z.string().datetime().nullish(),
  niveauConfiance: z.string().max(50).nullish(),
  enabled: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de la requête JSON invalide" },
        { status: 400 }
      );
    }

    let validated: z.infer<typeof updateSchema>;
    try {
      validated = updateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Données invalides", details: error.flatten() },
          { status: 400 }
        );
      }
      throw error;
    }

    const {
      domaine,
      reference,
      joradp,
      statut,
      textesLies,
      portee,
      questions,
      autorites,
      derniereVerification,
      niveauConfiance,
      enabled,
    } = validated;

    const legalRef = await db.legalRef.update({
      where: { id },
      data: {
        ...(domaine !== undefined && { domaine }),
        ...(reference !== undefined && { reference }),
        ...(joradp !== undefined && { joradp }),
        ...(statut !== undefined && { statut }),
        ...(textesLies !== undefined && { textesLies }),
        ...(portee !== undefined && { portee }),
        ...(questions !== undefined && { questions }),
        ...(autorites !== undefined && { autorites }),
        ...(derniereVerification !== undefined && {
          derniereVerification: derniereVerification
            ? new Date(derniereVerification)
            : null,
        }),
        ...(niveauConfiance !== undefined && { niveauConfiance }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json({ data: legalRef });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/legal-refs/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'entrée" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/legal-refs/[id]
// ═══════════════════════════════════════
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.legalRef.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/legal-refs/[id]] Error:", error);
    return NextResponse.json(
      { error: "Entrée non trouvée ou suppression impossible" },
      { status: 404 }
    );
  }
}

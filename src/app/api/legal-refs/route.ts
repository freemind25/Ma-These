import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/legal-refs — Registre juridique URBANIS-DZ
// Supports ?search=xxx&domaine=xxx
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const domaine = searchParams.get("domaine");

    const s = (v: string) => v.replace(/'/g, "''");

    const rows = await db.$queryRawUnsafe<
      Array<{
        id: string;
        domaine: string;
        reference: string;
        joradp: string | null;
        statut: string | null;
        textesLies: string | null;
        portee: string | null;
        questions: string | null;
        autorites: string | null;
        derniereVerification: string | null;
        niveauConfiance: string | null;
        enabled: boolean;
        createdAt: string;
        updatedAt: string;
      }>
    >(
      `SELECT id, domaine, reference, joradp, statut, "textesLies", portee, questions, autorites,
              "derniereVerification", "niveauConfiance", enabled, "createdAt", "updatedAt"
       FROM LegalRef
       ${search ? `WHERE reference LIKE '%${s(search)}%' OR domaine LIKE '%${s(search)}%' OR portee LIKE '%${s(search)}%'` : ""}
       ${domaine ? (search ? "AND" : "WHERE") + ` domaine = '${s(domaine)}'` : ""}
       ORDER BY "updatedAt" DESC`
    );

    return NextResponse.json({
      data: rows,
      meta: { count: rows.length },
    });
  } catch (error) {
    console.error("[GET /api/legal-refs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du registre juridique" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/legal-refs — Créer une entrée
// ═══════════════════════════════════════
const createSchema = z.object({
  domaine: z.string().min(1, "Le domaine est requis"),
  reference: z.string().min(1, "La référence est requise"),
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

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de la requête JSON invalide" },
        { status: 400 }
      );
    }

    const validated = createSchema.parse(body);
    const data = {
      ...validated,
      // `statut` est NOT NULL (défaut « à vérifier ») : null → absent, le défaut s'applique.
      statut: validated.statut ?? undefined,
      derniereVerification: validated.derniereVerification
        ? new Date(validated.derniereVerification)
        : undefined,
    };

    const legalRef = await db.legalRef.create({ data });

    return NextResponse.json({ data: legalRef }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/legal-refs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entrée" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// DELETE /api/legal-refs — Supprimer
// Query: ?id=xxx  OR  body: { ids: [...] }
// ═══════════════════════════════════════
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await db.legalRef.delete({ where: { id } });
      return NextResponse.json({ data: { deleted: true } });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const parsed = z.object({ ids: z.array(z.string()).optional() }).parse(body);

    if (parsed.ids && parsed.ids.length > 0) {
      const result = await db.legalRef.deleteMany({
        where: { id: { in: parsed.ids } },
      });
      return NextResponse.json({ data: { deletedCount: result.count } });
    }

    return NextResponse.json(
      { error: "Fournissez ?id=xxx ou { ids: [...] }" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[DELETE /api/legal-refs] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// GET /api/thesis — List all theses
// ═══════════════════════════════════════
export async function GET() {
  try {
    const theses = await db.thesis.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        chapters: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, number: true, title: true, wordCount: true, status: true },
        },
      },
    });

    return NextResponse.json({
      data: theses,
      meta: { count: theses.length },
    });
  } catch (error) {
    console.error("[GET /api/thesis] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des thèses" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// POST /api/thesis — Create a new thesis
// ═══════════════════════════════════════
const createThesisSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string().optional(),
  author: z.string().min(1, "L'auteur est requis"),
  email: z.string().email().optional(),
  institution: z.string().optional(),
  laboratory: z.string().optional(),
  discipline: z.string().optional(),
  directorName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createThesisSchema.parse(body);

    // Default chapter structure for a thesis
    const defaultChapters = [
      { number: 1, title: "Introduction", romanNumeral: "I" },
      { number: 2, title: "Revue de littérature", romanNumeral: "II" },
      { number: 3, title: "Cadre théorique", romanNumeral: "III" },
      { number: 4, title: "Méthodologie", romanNumeral: "IV" },
      { number: 5, title: "Résultats", romanNumeral: "V" },
      { number: 6, title: "Discussion", romanNumeral: "VI" },
      { number: 7, title: "Conclusion", romanNumeral: "VII" },
    ];

    const thesis = await db.thesis.create({
      data: {
        title: validated.title,
        subtitle: validated.subtitle,
        author: validated.author,
        email: validated.email,
        institution: validated.institution,
        laboratory: validated.laboratory,
        discipline: validated.discipline,
        directorName: validated.directorName,
        chapters: {
          create: defaultChapters.map((ch) => ({
            number: ch.number,
            title: ch.title,
            romanNumeral: ch.romanNumeral,
            sortOrder: ch.number - 1,
            status: "not_started",
          })),
        },
      },
      include: {
        chapters: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ data: thesis }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/thesis] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la thèse" },
      { status: 500 }
    );
  }
}

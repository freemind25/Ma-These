import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import {
  updateSoutenanceSchema,
  normalizeSoutenanceSlides,
  normalizeSoutenanceQuestions,
  type SoutenanceSlide,
  type SoutenanceQuestionFamily,
} from "@/lib/api-schemas";

// ═══════════════════════════════════════
// Types d'artefacts exposés au client
// (les colonnes Prisma stockent du JSON en String)
// ═══════════════════════════════════════

export interface SoutenanceRecordDto {
  id: string;
  thesisId: string;
  slides: SoutenanceSlide[];
  speech: string;
  speechDurationMin: number;
  questions: SoutenanceQuestionFamily[];
  createdAt: string;
  updatedAt: string;
}

type SoutenancePrepRow = {
  id: string;
  thesisId: string;
  slides: string;
  speech: string;
  speechDurationMin: number;
  questions: string;
  createdAt: Date;
  updatedAt: Date;
};

function parseJsonArray<T>(raw: string): T[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Sérialise la ligne Prisma en DTO structuré (JSON des colonnes désérialisé). */
function serializeSoutenanceRecord(record: SoutenancePrepRow): SoutenanceRecordDto {
  return {
    id: record.id,
    thesisId: record.thesisId,
    slides: parseJsonArray<SoutenanceSlide>(record.slides),
    speech: record.speech,
    speechDurationMin: record.speechDurationMin,
    questions: parseJsonArray<SoutenanceQuestionFamily>(record.questions),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

// ═══════════════════════════════════════
// GET /api/thesis/[id]/soutenance — artefacts de soutenance d'une thèse
// Renvoie { data: null } si rien n'a encore été généré
// ═══════════════════════════════════════
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await db.soutenancePrep.findUnique({
      where: { thesisId: id },
    });

    if (!record) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: serializeSoutenanceRecord(record) });
  } catch (error) {
    console.error("[GET /api/thesis/[id]/soutenance] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la préparation de soutenance" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// PUT /api/thesis/[id]/soutenance — upsert des artefacts
// Chaque artefact est optionnel : seules les clés fournies sont remplacées
// ═══════════════════════════════════════
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSoutenanceSchema.parse(body);

    const thesis = await db.thesis.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!thesis) {
      return NextResponse.json({ error: "Thèse non trouvée" }, { status: 404 });
    }

    const slidesJson =
      validated.slides !== undefined
        ? JSON.stringify(normalizeSoutenanceSlides(validated.slides))
        : undefined;
    const questionsJson =
      validated.questions !== undefined
        ? JSON.stringify(normalizeSoutenanceQuestions(validated.questions))
        : undefined;

    const record = await db.soutenancePrep.upsert({
      where: { thesisId: id },
      update: {
        ...(slidesJson !== undefined && { slides: slidesJson }),
        ...(validated.speech !== undefined && { speech: validated.speech }),
        ...(validated.speechDurationMin !== undefined && {
          speechDurationMin: validated.speechDurationMin,
        }),
        ...(questionsJson !== undefined && { questions: questionsJson }),
      },
      create: {
        thesisId: id,
        slides: slidesJson ?? "[]",
        speech: validated.speech ?? "",
        speechDurationMin: validated.speechDurationMin ?? 15,
        questions: questionsJson ?? "[]",
      },
    });

    return NextResponse.json({ data: serializeSoutenanceRecord(record) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[PUT /api/thesis/[id]/soutenance] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la préparation de soutenance" },
      { status: 500 }
    );
  }
}

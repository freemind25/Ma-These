import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { generateCompletion } from "@/lib/ai/zai-client";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";
import {
  soutenanceGenerateSchema,
  normalizeSoutenanceSlides,
  normalizeSoutenanceQuestions,
  serializeSoutenanceRecord,
  type SoutenanceSlide,
  type SoutenanceQuestionFamily,
} from "@/lib/api-schemas";
import {
  buildSlidesSystemPrompt,
  buildSpeechSystemPrompt,
  buildQuestionsSystemPrompt,
} from "@/lib/ai/prompts/soutenance-prompts";

// ═══════════════════════════════════════
// Génération IA des artefacts de soutenance
// Slides et questions : sortie JSON stricte (extraction + normalisation serveur)
// Discours : texte continu
// L'artefact généré est persisté (upsert SoutenancePrep) et renvoyé.
// ═══════════════════════════════════════

const GENERATION_CONFIG = {
  slides: { maxTokens: 2500 },
  speech: { maxTokens: 8000 },
  questions: { maxTokens: 6000 },
} as const;

const CONTEXT_LIMITS = {
  chapterMaxChars: 1200,
  totalMaxChars: 40_000,
} as const;

/** Nombre de questions demandé à l'IA (fixé par l'itération : 10). */
const QUESTION_COUNT = 10;

type SoutenanceDuration = 10 | 15 | 20;

/** Construit le contexte thèse borné (chapitres tronqués, plafond total prouvé en preuves). */
function buildThesisContext(thesis: {
  title: string;
  subtitle: string | null;
  author: string;
  discipline: string | null;
  directorName: string | null;
  cadrageFields: { label: string; value: string | null }[];
  chapters: { number: number; title: string; plainText: string }[];
}): string {
  const sections: string[] = [];

  const headerLines = [
    `Titre : ${thesis.title}`,
    thesis.subtitle ? `Sous-titre : ${thesis.subtitle}` : null,
    `Auteur : ${thesis.author}`,
    thesis.discipline ? `Discipline : ${thesis.discipline}` : null,
    thesis.directorName ? `Directeur de thèse : ${thesis.directorName}` : null,
  ].filter((line): line is string => line !== null);
  sections.push("## THÈSE\n" + headerLines.join("\n"));

  if (thesis.cadrageFields.length > 0) {
    const cadrageLines = thesis.cadrageFields
      .map((f) => ({ label: f.label, value: (f.value ?? "").trim() }))
      .filter((f) => f.value.length > 0)
      .map((f) => `- ${f.label} : ${f.value}`);
    if (cadrageLines.length > 0) {
      sections.push("## CADRAGE ACTIF\n" + cadrageLines.join("\n"));
    }
  }

  let used = sections.join("\n\n").length + 2;
  const chapterSections: string[] = [];
  let includedChapters = 0;

  for (const chapter of thesis.chapters) {
    const body = (chapter.plainText || "").slice(0, CONTEXT_LIMITS.chapterMaxChars);
    const section = `### Chapitre ${chapter.number} — ${chapter.title}\n${
      body.length > 0 ? body : "(chapitre sans contenu textuel)"
    }`;
    const sectionCost = section.length + 2;
    if (used + sectionCost > CONTEXT_LIMITS.totalMaxChars) {
      const remaining = CONTEXT_LIMITS.totalMaxChars - used;
      if (remaining > 200) {
        chapterSections.push(section.slice(0, remaining));
        includedChapters += 1;
      }
      break;
    }
    chapterSections.push(section);
    used += sectionCost;
    includedChapters += 1;
  }

  if (chapterSections.length > 0) {
    sections.push("## CHAPITRES\n" + chapterSections.join("\n\n"));
  }

  const context = sections.join("\n\n");
  console.log(
    `[POST /api/soutenance/generate] Contexte thèse : ${context.length} caractères ` +
    `(plafond ${CONTEXT_LIMITS.totalMaxChars}, chapitres inclus : ${includedChapters}/${thesis.chapters.length}, ` +
    `champs de cadrage : ${thesis.cadrageFields.length})`
  );
  return context;
}

/**
 * Extrait un bloc JSON d'une réponse IA : bloc ```json … ``` d'abord,
 * sinon premier tableau [...] ou objet {...} parseable.
 */
function extractJsonBlock(raw: string): unknown | null {
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates: string[] = [];
  if (fenced?.[1]) candidates.push(fenced[1]);
  candidates.push(raw);

  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      // extraction partielle ci-dessous
    }
    const arrayStart = trimmed.indexOf("[");
    const objectStart = trimmed.indexOf("{");
    const start =
      arrayStart >= 0 && (objectStart < 0 || arrayStart < objectStart)
        ? arrayStart
        : objectStart;
    if (start >= 0) {
      const end = Math.max(trimmed.lastIndexOf("]"), trimmed.lastIndexOf("}"));
      if (end > start) {
        try {
          return JSON.parse(trimmed.slice(start, end + 1));
        } catch {
          // candidat suivant
        }
      }
    }
  }
  return null;
}

/** Coerce la sortie IA en liste de slides brutes (la normalisation cappe ensuite). */
function coerceSlides(parsed: unknown): SoutenanceSlide[] {
  let list: unknown[] | null = null;
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { slides?: unknown }).slides)) {
    list = (parsed as { slides: unknown[] }).slides;
  }
  if (!list) return [];
  return list
    .map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      return {
        title: typeof obj.title === "string" ? obj.title.trim() : "",
        points: Array.isArray(obj.points)
          ? obj.points.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
          : [],
      };
    })
    .filter((s) => s.title.length > 0);
}

/** Coerce la sortie IA en familles de questions brutes (la normalisation cappe ensuite). */
function coerceQuestions(parsed: unknown): SoutenanceQuestionFamily[] {
  let list: unknown[] | null = null;
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { questions?: unknown }).questions)) {
    list = (parsed as { questions: unknown[] }).questions;
  }
  if (!list) return [];
  return list
    .map((item) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      const items = Array.isArray(obj.items)
        ? obj.items
            .map((q) => {
              const qObj = (q ?? {}) as Record<string, unknown>;
              return {
                question: typeof qObj.question === "string" ? qObj.question.trim() : "",
                angle: typeof qObj.angle === "string" ? qObj.angle.trim() : "",
              };
            })
            .filter((q) => q.question.length > 0)
        : [];
      return {
        family: typeof obj.family === "string" && obj.family.trim().length > 0 ? obj.family.trim() : "Questions du jury",
        items,
      };
    })
    .filter((f) => f.items.length > 0);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = soutenanceGenerateSchema.parse(body);

    const thesis = await db.thesis.findUnique({
      where: { id: validated.thesisId },
      select: {
        id: true,
        title: true,
        subtitle: true,
        author: true,
        discipline: true,
        directorName: true,
        cadrages: {
          where: { isActive: true },
          select: {
            fields: {
              orderBy: { sortOrder: "asc" },
              select: { label: true, value: true },
            },
          },
        },
        chapters: {
          orderBy: { sortOrder: "asc" },
          select: { number: true, title: true, plainText: true },
        },
      },
    });

    if (!thesis) {
      return NextResponse.json({ error: "Thèse non trouvée" }, { status: 404 });
    }

    const context = buildThesisContext({
      title: thesis.title,
      subtitle: thesis.subtitle,
      author: thesis.author,
      discipline: thesis.discipline,
      directorName: thesis.directorName,
      cadrageFields: thesis.cadrages.flatMap((c) => c.fields),
      chapters: thesis.chapters,
    });

    const type = validated.type;
    const durationMin = (validated.durationMin ?? 15) as SoutenanceDuration;

    const systemPrompt =
      type === "slides"
        ? buildSlidesSystemPrompt()
        : type === "speech"
          ? buildSpeechSystemPrompt(durationMin)
          : buildQuestionsSystemPrompt(QUESTION_COUNT);

    const providerConfig = resolveAiConfig(request);

    const result = await generateCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Voici le contenu de ma thèse :\n\n${context}` },
      ],
      temperature: 0.5,
      maxTokens: GENERATION_CONFIG[type].maxTokens,
      providerConfig,
    });

    if (type === "speech") {
      const speech = result.content.trim();
      if (speech.length === 0) {
        return NextResponse.json(
          { error: "Réponse IA non structurée, relancez la génération" },
          { status: 502 }
        );
      }
      const speechJson = speech;
      const record = await db.soutenancePrep.upsert({
        where: { thesisId: thesis.id },
        update: { speech: speechJson, speechDurationMin: durationMin },
        create: { thesisId: thesis.id, speech: speechJson, speechDurationMin: durationMin },
      });
      return NextResponse.json({ data: serializeSoutenanceRecord(record) });
    }

    if (type === "slides") {
      const slides = normalizeSoutenanceSlides(coerceSlides(extractJsonBlock(result.content)));
      if (slides.length === 0) {
        return NextResponse.json(
          { error: "Réponse IA non structurée, relancez la génération" },
          { status: 502 }
        );
      }
      const slidesJson = JSON.stringify(slides);
      const record = await db.soutenancePrep.upsert({
        where: { thesisId: thesis.id },
        update: { slides: slidesJson },
        create: { thesisId: thesis.id, slides: slidesJson },
      });
      return NextResponse.json({ data: serializeSoutenanceRecord(record) });
    }

    // type === "questions"
    const questions = normalizeSoutenanceQuestions(coerceQuestions(extractJsonBlock(result.content)));
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Réponse IA non structurée, relancez la génération" },
        { status: 502 }
      );
    }
    const questionsJson = JSON.stringify(questions);
    const record = await db.soutenancePrep.upsert({
      where: { thesisId: thesis.id },
      update: { questions: questionsJson },
      create: { thesisId: thesis.id, questions: questionsJson },
    });
    return NextResponse.json({ data: serializeSoutenanceRecord(record) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/soutenance/generate] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la génération";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

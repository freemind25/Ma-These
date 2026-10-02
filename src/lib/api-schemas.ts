// ═══════════════════════════════════════
// ThesisFrame — Shared Zod Validation Schemas
// Used by both API routes (server) and forms/hooks (client)
// ═══════════════════════════════════════

import { z } from "zod/v4";

// ═══════════════════════════════════════
// THESIS
// ═══════════════════════════════════════

export const thesisStatuses = ["draft", "in_progress", "review", "completed"] as const;
export const structureModes = ["chapters", "parts"] as const;

export const createThesisSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string().optional(),
  author: z.string().min(1, "L'auteur est requis"),
  email: z.email("Email invalide").optional(),
  institution: z.string().optional(),
  laboratory: z.string().optional(),
  discipline: z.string().optional(),
  directorName: z.string().optional(),
});

export const updateThesisSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  email: z.email().optional(),
  institution: z.string().optional(),
  laboratory: z.string().optional(),
  discipline: z.string().optional(),
  directorName: z.string().optional(),
  status: z.enum(thesisStatuses).optional(),
  structureMode: z.enum(structureModes).optional(),
});

// ═══════════════════════════════════════
// CHAPTER
// ═══════════════════════════════════════

export const chapterStatuses = [
  "not_started",
  "in_progress",
  "draft",
  "review",
  "completed",
] as const;

export const createChapterSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  romanNumeral: z.string().optional(),
  partId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  plainText: z.string().optional(),
  wordCount: z.number().int().min(0).optional(),
  targetWordCount: z.number().int().min(0).optional(),
  status: z.enum(chapterStatuses).optional(),
  directorFeedback: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  romanNumeral: z.string().optional(),
  partId: z.string().optional(),
});

// ═══════════════════════════════════════
// REFERENCE
// ═══════════════════════════════════════

export const referenceTypes = [
  // BibTeX standard
  "article",
  "book",
  "inproceedings",
  "phdthesis",
  "techreport",
  "incollection",
  "misc",
  "online",
  "unpublished",
  "inbook",
  "proceedings",
  "booklet",
  "mastersthesis",
  // RIS standard
  "jour",
  "jfull",
  "chap",
  "thes",
  "diss",
  "conf",
  "cpaper",
  "rprt",
  "elec",
  "ebook",
  "web",
  "generic",
  "art",
  "blog",
  "mpct",
  "hear",
  "pamp",
  "ser",
  "pat",
  "case",
  "unpb",
  // CSL-JSON standard
  "article-journal",
  "article-magazine",
  "article-newspaper",
  "paper-conference",
  "speech",
  "webpage",
  "web-post",
  "post-weblog",
  "entry-dictionary",
  "entry-encyclopedia",
  "manuscript",
  "preprint",
  "dataset",
  "interview",
  "patent",
  "legislation",
  "legal_case",
  "treaty",
  "musical-score",
  "review",
  "review-book",
  // Generic fallback
  "other",
] as const;

export const createReferenceSchema = z.object({
  type: z.enum(referenceTypes).default("article"),
  authors: z.string().min(1, "Les auteurs sont requis"),
  title: z.string().min(1, "Le titre est requis"),
  year: z.number().int().min(1900).max(2100).optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  doi: z.string().optional(),
  isbn: z.string().optional(),
  url: z.string().optional(),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  notes: z.string().optional(),
  bibtexKey: z.string().optional(),
  source: z.string().default("manual"),
});

export const updateReferenceSchema = z.object({
  type: z.enum(referenceTypes).optional(),
  authors: z.string().optional(),
  title: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  doi: z.string().optional(),
  isbn: z.string().optional(),
  url: z.string().optional(),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  notes: z.string().optional(),
  bibtexKey: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

// ═══════════════════════════════════════
// PART
// ═══════════════════════════════════════

export const createPartSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  sortOrder: z.number().int().min(0).optional(),
});

export const updatePartSchema = z.object({
  title: z.string().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ═══════════════════════════════════════
// CADRAGE
// ═══════════════════════════════════════

export const createCadrageSchema = z.object({
  thesisId: z.string().min(1),
  label: z.string().optional(),
  fields: z
    .array(
      z.object({
        fieldKey: z.string().min(1),
        label: z.string().min(1),
        value: z.string().optional(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .optional(),
});

export const updateCadrageSchema = z.object({
  label: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createCadrageFieldSchema = z.object({
  fieldKey: z.string().min(1, "La clé est requise"),
  label: z.string().min(1, "Le libellé est requis"),
  value: z.string().optional(),
  aiSuggestion: z.string().nullable().optional(),
  isLocked: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCadrageFieldSchema = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
  aiSuggestion: z.string().nullable().optional(),
  isLocked: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ═══════════════════════════════════════
// RESEARCH SOURCE / NOTEBOOK
// ═══════════════════════════════════════

export const createResearchSourceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  authors: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  type: z.enum(["article", "book", "thesis", "report"] as const).default("article"),
  url: z.string().optional(),
  notes: z.string().optional(),
});

export const updateResearchSourceSchema = z.object({
  title: z.string().min(1).optional(),
  authors: z.string().optional(),
  year: z.number().int().optional(),
  type: z.enum(["article", "book", "thesis", "report"] as const).optional(),
  url: z.string().optional(),
  notes: z.string().optional(),
});

export const createNotebookEntrySchema = z.object({
  question: z.string().min(1, "La question est requise"),
  answer: z.string().min(1, "La réponse est requise"),
  tags: z.string().optional(),
  sourceId: z.string().optional(),
});

export const updateNotebookEntrySchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().optional(),
  tags: z.string().optional(),
  sourceId: z.string().optional(),
});

// ═══════════════════════════════════════
// AGILE
// ═══════════════════════════════════════

export const sprintPhases = [
  "phase_0",
  "phase_1",
  "phase_2",
  "phase_3",
  "phase_4",
] as const;

export const sprintStatuses = ["planned", "active", "completed"] as const;
export const storyStatuses = ["todo", "in_progress", "done"] as const;
export const storyPriorities = ["low", "medium", "high", "critical"] as const;

export const createSprintSchema = z.object({
  phase: z.enum(sprintPhases),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateSprintSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(sprintStatuses).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createStorySchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  priority: z.enum(storyPriorities).default("medium"),
  storyPoints: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateStorySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(storyStatuses).optional(),
  priority: z.enum(storyPriorities).optional(),
  storyPoints: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ═══════════════════════════════════════
// SOUTENANCE
// ═══════════════════════════════════════

export const soutenanceTypes = ["slides", "speech", "questions"] as const;

/** Plafonds de normalisation serveur (cohérents avec les prompts IA). */
export const SOUTENANCE_LIMITS = {
  maxSlides: 12,
  maxPointsPerSlide: 6,
  maxQuestions: 12,
  maxFamilies: 6,
} as const;

export const soutenanceSlideSchema = z.object({
  title: z.string().min(1).max(200),
  // Le plafond de 6 points est appliqué par normalisation serveur, pas par rejet zod
  points: z.array(z.string().min(1).max(400)),
});

export const soutenanceQuestionItemSchema = z.object({
  question: z.string().min(1).max(500),
  angle: z.string().max(1000),
});

export const soutenanceQuestionFamilySchema = z.object({
  family: z.string().min(1).max(100),
  items: z.array(soutenanceQuestionItemSchema),
});

export const updateSoutenanceSchema = z.object({
  slides: z.array(soutenanceSlideSchema).optional(),
  speech: z.string().max(100_000).optional(),
  speechDurationMin: z.union([z.literal(10), z.literal(15), z.literal(20)]).optional(),
  questions: z.array(soutenanceQuestionFamilySchema).optional(),
});

export const soutenanceGenerateSchema = z.object({
  thesisId: z.string().min(1, "L'identifiant de la thèse est requis"),
  type: z.enum(soutenanceTypes),
  durationMin: z.union([z.literal(10), z.literal(15), z.literal(20)]).optional(),
});

/** Cappe les slides : 12 slides max, 6 points max par slide. */
export function normalizeSoutenanceSlides(slides: SoutenanceSlide[]): SoutenanceSlide[] {
  return slides
    .filter((s) => typeof s.title === "string" && s.title.trim().length > 0)
    .slice(0, SOUTENANCE_LIMITS.maxSlides)
    .map((s) => ({
      title: s.title,
      points: Array.isArray(s.points) ? s.points.slice(0, SOUTENANCE_LIMITS.maxPointsPerSlide) : [],
    }));
}

/** Cappe les questions : 12 questions max toutes familles confondues. */
export function normalizeSoutenanceQuestions(
  families: SoutenanceQuestionFamily[]
): SoutenanceQuestionFamily[] {
  const out: SoutenanceQuestionFamily[] = [];
  let count = 0;
  for (const family of families) {
    if (count >= SOUTENANCE_LIMITS.maxQuestions) break;
    const items = (family.items ?? []).slice(0, SOUTENANCE_LIMITS.maxQuestions - count);
    if (items.length === 0) continue;
    out.push({ family: family.family, items });
    count += items.length;
  }
  return out;
}

/** DTO structuré exposé au client (le modèle Prisma stocke slides/questions en JSON-string). */
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

function parseJsonArray<T>(raw: string): T[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Sérialise une ligne SoutenancePrep en DTO structuré (JSON des colonnes désérialisé). */
export function serializeSoutenanceRecord(record: {
  id: string;
  thesisId: string;
  slides: string;
  speech: string;
  speechDurationMin: number;
  questions: string;
  createdAt: Date;
  updatedAt: Date;
}): SoutenanceRecordDto {
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
// AI TOOL CONFIG
// ═══════════════════════════════════════

export const aiProviders = [
  "openai",
  "anthropic",
  "mistral",
  "routesme",
  "zai",
  "custom",
] as const;

export const createAiConfigSchema = z.object({
  provider: z.enum(aiProviders),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  isActive: z.boolean().default(false),
});

export const updateAiConfigSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ═══════════════════════════════════════
// INFERENCE TYPES
// ═══════════════════════════════════════

export type CreateThesisInput = z.infer<typeof createThesisSchema>;
export type UpdateThesisInput = z.infer<typeof updateThesisSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type CreateReferenceInput = z.infer<typeof createReferenceSchema>;
export type UpdateReferenceInput = z.infer<typeof updateReferenceSchema>;
export type CreateCadrageInput = z.infer<typeof createCadrageSchema>;
export type CreateCadrageFieldInput = z.infer<typeof createCadrageFieldSchema>;
export type UpdateCadrageFieldInput = z.infer<typeof updateCadrageFieldSchema>;
export type CreateResearchSourceInput = z.infer<typeof createResearchSourceSchema>;
export type CreateNotebookEntryInput = z.infer<typeof createNotebookEntrySchema>;
export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type CreateAiConfigInput = z.infer<typeof createAiConfigSchema>;
export type CreatePartInput = z.infer<typeof createPartSchema>;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;
export type SoutenanceType = (typeof soutenanceTypes)[number];
export type SoutenanceSlide = z.infer<typeof soutenanceSlideSchema>;
export type SoutenanceQuestionItem = z.infer<typeof soutenanceQuestionItemSchema>;
export type SoutenanceQuestionFamily = z.infer<typeof soutenanceQuestionFamilySchema>;
export type UpdateSoutenanceInput = z.infer<typeof updateSoutenanceSchema>;
export type SoutenanceGenerateInput = z.infer<typeof soutenanceGenerateSchema>;

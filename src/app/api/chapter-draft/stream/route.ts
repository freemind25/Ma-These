import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import {
  generateCompletionStream,
  generateCompletion,
  type AiMessage,
} from "@/lib/ai/zai-client";
import type { AiProviderConfig } from "@/lib/ai/ai-types";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";

// ═══════════════════════════════════════
// POST /api/chapter-draft/stream — Générateur de brouillon de chapitre (SSE)
//
// Produit un brouillon STRUCTURÉ d'un chapitre entier (introduction, sections
// ## / ###, conclusion) ancré dans la thèse active : titre du chapitre, cadrage
// actif, titres des autres chapitres, références choisies par le doctorant.
//
// Éthique « assister, pas écrire à la place » : les citations proviennent
// EXCLUSIVEMENT de la bibliographie fournie par le doctorant (format
// « (Auteur, année) ») ; sans référence sélectionnée, aucune citation.
//
// Flux : SSE « data: {type:'chunk'} », chunk « done » terminal. maxTokens
// 12 000 (le défaut 4 096 est trop court pour un chapitre) + UNE relance de
// continuation si troncature probable (pattern continueIfTruncated de
// deep-research-pipeline, limité à une passe, reprise sur les 4 000 derniers
// caractères).
// ═══════════════════════════════════════

const DRAFT_TEMPERATURE = 0.6;
const DRAFT_MAX_TOKENS = 12_000;
const CONTINUATION_TAIL_CHARS = 4_000;
const CADRAGE_VALUE_MAX_CHARS = 600;

const draftSchema = z.object({
  chapterId: z.string().min(1, "Le chapitre cible est requis"),
  targetWords: z
    .number()
    .int("La longueur cible doit être un entier")
    .min(300, "La longueur cible minimale est de 300 mots")
    .max(8000, "La longueur cible maximale est de 8 000 mots"),
  referenceIds: z
    .array(z.string())
    .max(20, "20 références maximum")
    .default([]),
  _aiConfig: z.unknown().optional(),
});

/** 1er auteur avant la virgule (pattern generateInTextCitation, APA). */
function firstAuthorSurname(authors: string): string {
  const first = (authors ?? "").split(";")[0]?.trim() ?? "";
  return first.split(",")[0]?.trim() ?? "";
}

/** Bibliographie du prompt : auteur (année) titre. */
function buildBibliography(
  references: { authors: string; title: string; year: number | null; journal: string | null }[]
): string {
  return references
    .map((ref) => {
      const surname = firstAuthorSurname(ref.authors) || "Auteur inconnu";
      const year = ref.year ?? "s.d.";
      const venue = ref.journal ? `. ${ref.journal}` : "";
      return `- ${surname} (${year}). ${ref.title}${venue}`;
    })
    .join("\n");
}

/** Contexte thèse (pattern Chat Directeur) : identité, chapitres, cadrage actif. */
function buildThesisContext(
  thesis: {
    title: string;
    subtitle: string | null;
    author: string;
    discipline: string | null;
    chapters: { number: number; title: string }[];
    cadrages: { label: string | null; fields: { label: string; value: string | null }[] }[];
  },
  targetChapter: { number: number; title: string }
): string {
  const lines: string[] = [
    `Titre : ${thesis.title}${thesis.subtitle ? ` — ${thesis.subtitle}` : ""}`,
    `Auteur : ${thesis.author}`,
    thesis.discipline ? `Discipline : ${thesis.discipline}` : null,
    `Chapitres de la thèse : ${thesis.chapters.map((c) => `${c.number}. ${c.title}`).join(" | ")}`,
    `Chapitre à rédiger : ${targetChapter.number} — ${targetChapter.title}`,
  ].filter((line): line is string => line !== null);

  const cadrage = thesis.cadrages[0];
  if (cadrage) {
    lines.push(`Cadrage actif${cadrage.label ? ` — ${cadrage.label}` : ""} :`);
    for (const field of cadrage.fields) {
      const value = (field.value ?? "").trim().slice(0, CADRAGE_VALUE_MAX_CHARS);
      if (value) lines.push(`- ${field.label} : ${value}`);
    }
  }

  return lines.join("\n");
}

function buildSystemPrompt(thesisContext: string, bibliography: string | null): string {
  const citationRules = bibliography
    ? [
        "- Tu peux citer UNIQUEMENT les références de la BIBLIOGRAPHIE AUTORISÉE ci-dessous, au format « (Auteur, année) » où Auteur est le premier auteur, avant la virgule.",
        "- Interdiction ABSOLUE d'inventer une référence, un auteur, une année ou une œuvre absente de cette bibliographie.",
        "- En cas de doute, écris sans citation plutôt que d'en inventer.",
      ].join("\n")
    : "- Aucune référence n'a été fournie : n'écris AUCUNE citation. Interdiction absolue d'inventer un auteur, une année ou une référence.";

  const bibliographyBlock = bibliography
    ? `\n\nBIBLIOGRAPHIE AUTORISÉE (seules citations permises) :\n${bibliography}`
    : "";

  return [
    "Tu rédiges un brouillon de chapitre académique pour un doctorant. La sortie est le brouillon lui-même, en Markdown pur : aucun bloc de code, aucun commentaire, aucun métadiscours (« Voici… », « En tant qu'IA… »), aucun emoji, aucun titre de niveau 1 (« # »).",
    "",
    "STRUCTURE OBLIGATOIRE :",
    "1. Une introduction du chapitre (2 à 4 paragraphes) qui pose le sujet et annonce le plan du chapitre.",
    "2. Deux à cinq sections de développement, chacune introduite par un sous-titre Markdown « ## » ; utilise « ### » pour d'éventuelles sous-sections.",
    "3. Une conclusion du chapitre qui synthétise l'acquis et ouvre sur la suite de la thèse.",
    "",
    "LONGUEUR : vise environ le nombre de mots demandé par l'utilisateur.",
    "",
    "CITATIONS — RÈGLES ABSOLUES :",
    citationRules,
    "",
    "STYLE : ton doctoral, français académique soutenu, phrases complètes, transitions soignées.",
    "",
    "CONTEXTE DE LA THÈSE :",
    thesisContext,
    bibliographyBlock,
  ].join("\n");
}

/** Reprise sur les 4 000 derniers caractères (adapté de continueIfTruncated, UNE passe). */
const CONTINUATION_SYSTEM_PROMPT =
  "Tu poursuis la rédaction d'un brouillon de chapitre académique déjà écrit. On te donne la FIN du brouillon. Reprends EXACTEMENT là où le texte s'arrête (au milieu de la phrase si nécessaire) et poursuis la rédaction de manière fluide, sans reprendre depuis le début, sans répéter de contenu déjà écrit, sans préambule, en respectant les mêmes règles strictes de citation (uniquement les références autorisées, format « (Auteur, année) »). Le texte que tu produis sera concaténé directement après le fragment fourni.";

/** Détecte l'absence de ponctuation terminale (adapté de deep-research-pipeline). */
function isLikelyTruncated(text: string): boolean {
  const tail = text.replace(/\s+$/, "");
  if (!tail) return false;
  const lastChar = tail.slice(-1);
  const terminal = new Set([".", "!", "?", ":", ";", "»", '"', ")", "]", "*", "`", "—", "-"]);
  const lastLine = (tail.split("\n").pop() || "").trim();
  const isBullet = ["- ", "* ", "• "].some((prefix) => lastLine.startsWith(prefix));
  if (isBullet && !terminal.has(lastChar)) return true;
  return !terminal.has(lastChar);
}

const encodeSSE = (chunk: unknown): Uint8Array =>
  new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`);

/**
 * Relais SSE : retransmet les chunks de la première passe, détecte une
 * troncature probable en fin de flux et lance UNE relance de continuation
 * (contenu émis à la suite), puis termine par un chunk « done ».
 */
async function streamWithContinuation(
  firstPass: Response,
  continuationInput: { providerConfig: AiProviderConfig | undefined }
): Promise<Response> {
  const reader = firstPass.body?.getReader();
  if (!reader) return firstPass;

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";
        let sawError = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              try {
                const parsed = JSON.parse(trimmed.slice(6)) as {
                  type?: string;
                  content?: string;
                  error?: string;
                };
                if (parsed.type === "chunk" && typeof parsed.content === "string") {
                  accumulated += parsed.content;
                  controller.enqueue(encodeSSE(parsed));
                } else if (parsed.type === "error") {
                  sawError = true;
                  controller.enqueue(encodeSSE(parsed));
                } else if (parsed.type === "done") {
                  // Avalé : réémis après l'éventuelle relance.
                }
              } catch {
                // Ligne SSE malformée : ignorée.
              }
            }
          }

          // A.3 adapté : UNE relance maximum si troncature probable.
          if (!sawError && accumulated.length > 0 && isLikelyTruncated(accumulated)) {
            console.warn(
              "[POST /api/chapter-draft/stream] Brouillon probablement tronqué — relance de continuation (1/1)"
            );
            try {
              const continuation = await generateCompletion({
                messages: [
                  { role: "system", content: CONTINUATION_SYSTEM_PROMPT },
                  {
                    role: "user",
                    content: `FIN DU BROUILLON À POURSUIVRE :\n${accumulated.slice(-CONTINUATION_TAIL_CHARS)}`,
                  },
                ],
                temperature: DRAFT_TEMPERATURE,
                maxTokens: DRAFT_MAX_TOKENS,
                providerConfig: continuationInput.providerConfig,
              });
              const extra = continuation.content.trim();
              if (extra) {
                // Concaténation espacée (même convention que deep-research-pipeline).
                controller.enqueue(encodeSSE({ type: "chunk", content: " " }));
                const step = 240;
                for (let i = 0; i < extra.length; i += step) {
                  controller.enqueue(
                    encodeSSE({ type: "chunk", content: extra.slice(i, i + step) })
                  );
                }
              }
            } catch (continuationError) {
              console.error(
                "[POST /api/chapter-draft/stream] Échec de la relance de continuation :",
                continuationError
              );
              // Le brouillon tronqué reste exploitable : on termine proprement.
            }
          }

          controller.enqueue(encodeSSE({ type: "done" }));
        } catch (error) {
          console.error("[POST /api/chapter-draft/stream] Erreur de flux :", error);
          controller.enqueue(
            encodeSSE({ type: "error", error: "Erreur lors de la génération du brouillon" })
          );
          controller.enqueue(encodeSSE({ type: "done" }));
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = draftSchema.parse(body);

    const chapter = await db.chapter.findUnique({
      where: { id: validated.chapterId },
      include: {
        thesis: {
          include: {
            chapters: {
              orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
              select: { number: true, title: true },
            },
            cadrages: {
              where: { isActive: true },
              include: { fields: { orderBy: { sortOrder: "asc" } } },
            },
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapitre non trouvé" }, { status: 404 });
    }

    // Références sélectionnées, réordonnées selon la demande du client.
    let references: { id: string; authors: string; title: string; year: number | null; journal: string | null }[] = [];
    if (validated.referenceIds.length > 0) {
      const found = await db.reference.findMany({
        where: { id: { in: validated.referenceIds } },
      });
      const byId = new Map(found.map((ref) => [ref.id, ref]));
      references = validated.referenceIds
        .map((id) => byId.get(id))
        .filter((ref): ref is (typeof found)[number] => ref !== undefined);
    }

    const thesis = chapter.thesis;
    const thesisContext = buildThesisContext(
      {
        title: thesis.title,
        subtitle: thesis.subtitle,
        author: thesis.author,
        discipline: thesis.discipline,
        chapters: thesis.chapters,
        cadrages: thesis.cadrages.map((cadrage) => ({
          label: cadrage.label,
          fields: cadrage.fields.map((field) => ({ label: field.label, value: field.value })),
        })),
      },
      { number: chapter.number, title: chapter.title }
    );

    const bibliography =
      references.length > 0
        ? buildBibliography(references)
        : null;

    const messages: AiMessage[] = [
      { role: "system", content: buildSystemPrompt(thesisContext, bibliography) },
      {
        role: "user",
        content: `Rédige le brouillon complet du chapitre « ${chapter.title} » (chapitre ${chapter.number} sur ${thesis.chapters.length}). Longueur cible : environ ${validated.targetWords} mots.`,
      },
    ];

    const providerConfig = resolveAiConfig(request, validated._aiConfig);

    const firstPass = await generateCompletionStream({
      messages,
      temperature: DRAFT_TEMPERATURE,
      maxTokens: DRAFT_MAX_TOKENS,
      providerConfig,
    });

    return await streamWithContinuation(firstPass, { providerConfig });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/chapter-draft/stream] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du brouillon" },
      { status: 500 }
    );
  }
}

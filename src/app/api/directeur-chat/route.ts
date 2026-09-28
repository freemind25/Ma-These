import { NextRequest, NextResponse } from "next/server";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { DIRECTEUR_PROMPT } from "@/lib/ai/specializations/directeur";
import { getLevelCalibration, type DoctoralLevel } from "@/lib/ai/prompt-builder";
import { detectRelevantFiches, getFichesContentForPrompt } from "@/data/corpus-publication";
import { z } from "zod/v4";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";

// ═══════════════════════════════════════
// POST /api/directeur-chat — Chat with AI thesis director
// Corpus-aware: injects relevant fiches from the publication corpus
// System prompt centralized in src/lib/ai/specializations/directeur.ts
//
// ── A.9 (annexe technique) — timeout explicite et relance automatique ──
// Pendant le test de production, un appel superviseur a couru plus de 320 s
// avant d'échouer, sans limite ni filet. Correction à la racine :
//   • Timeout EXPLICITE et DOCUMENTÉ (voir DIRECTEUR_TIMEOUT_MS ci-dessous) ;
//   • En cas de dépassement : UNE relance automatique à prompt resserré
//     (contexte tronqué, historique plafonné, consigne de concision) —
//     exactement le geste manuel qui avait débloqué le test ;
//   • Aucun appel ne peut plus courir sans limite.
// ═══════════════════════════════════════

// Timeout nominal de l'appel superviseur (ms) — documenté ici et dans la doc.
// Surcharge d'environnement possible ; borné côté schéma (5 s → 180 s).
const DIRECTEUR_TIMEOUT_MS = Number(process.env.DIRECTEUR_TIMEOUT_MS || 150_000);
// Timeout de la relance à prompt resserré (plus court : la réponse attendue l'est aussi).
const DIRECTEUR_RETRY_TIMEOUT_MS = Number(
  process.env.DIRECTEUR_RETRY_TIMEOUT_MS || 120_000
);

const DOCTORAL_LEVELS = ["debutant", "intermediaire", "avance"] as const;

const directeurChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(20_000, "Un message ne doit pas dépasser 20 000 caractères"),
    })
  ).min(1),
  thesisContext: z.string().max(50_000, "Le contexte de thèse ne doit pas dépasser 50 000 caractères").optional(),
  doctoralLevel: z.enum(DOCTORAL_LEVELS).optional(),
  // A.9 : timeout explicite par appel, sous contrôle du client (borné).
  timeoutMs: z
    .number()
    .int()
    .min(5_000, "Le timeout ne peut pas être inférieur à 5 s")
    .max(180_000, "Le timeout ne peut pas dépasser 180 s")
    .optional(),
  _aiConfig: z.unknown().optional(),
});

/** Détecte une erreur de dépassement de délai (AbortSignal.timeout, réseau). */
function isTimeoutError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "TimeoutError") return true;
  const message = error instanceof Error ? error.message : String(error);
  return /timeout|timed out|aborted|TimeoutError|d[ée]lai.*d[ée]pass[ée]/i.test(message);
}

/** Reconstruit un appel « resserré » : consigne de concision + contexte tronqué + historique plafonné. */
function buildTightenedMessages(
  validated: z.infer<typeof directeurChatSchema>,
  levelCalibration: string
): AiMessage[] {
  const TIGHTEN_NOTE =
    "\n\nMODE REPRISE (l'appel précédent a dépassé le délai) : réponds de manière CONCISE et structurée — environ 600 mots maximum, va droit aux points essentiels, aucun préambule, aucune formule de transition générique.";

  const messages: AiMessage[] = [
    { role: "system", content: DIRECTEUR_PROMPT + TIGHTEN_NOTE + levelCalibration },
  ];

  // Contexte tronqué à l'essentiel (8 000 caractères max)
  if (validated.thesisContext) {
    messages.push({
      role: "system",
      content: `INFORMATIONS SUR LA THÈSE DU DOCTORANT (extrait resserré) :\n${validated.thesisContext.slice(0, 8_000)}`,
    });
  }

  // Historique plafonné : 4 derniers messages, chacun tronqué à 4 000 caractères
  const cappedHistory = validated.messages.slice(-4).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 4_000),
  }));
  messages.push(...cappedHistory);

  return messages;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = directeurChatSchema.parse(body);
    const timeoutMs = validated.timeoutMs ?? DIRECTEUR_TIMEOUT_MS;

    // Extract the latest user message for fiche detection
    const latestUserMessage = [...validated.messages]
      .reverse()
      .find((m) => m.role === "user");

    // Detect relevant fiches from the latest user message
    const relevantFicheIds = latestUserMessage
      ? detectRelevantFiches(latestUserMessage.content)
      : [];

    // Build the system prompt (from centralized specialization), appending fiche content + level calibration
    let systemPrompt = DIRECTEUR_PROMPT;
    if (relevantFicheIds.length > 0) {
      const ficheContent = getFichesContentForPrompt(relevantFicheIds);
      systemPrompt += ficheContent;
    }
    const levelCalibration = getLevelCalibration(validated.doctoralLevel);
    systemPrompt += levelCalibration;

    // Build messages array for AI
    const aiMessages: AiMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add thesis context if provided
    if (validated.thesisContext) {
      aiMessages.push({
        role: "system" as const,
        content: `INFORMATIONS SUR LA THÈSE DU DOCTORANT :\n${validated.thesisContext}`,
      });
    }

    // Add conversation history
    for (const msg of validated.messages) {
      aiMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Resolve AI config from httpOnly cookie (secure) or body (backward compat)
    const providerConfig = resolveAiConfig(request, validated._aiConfig);

    // ── A.9 : appel nominal borné par un timeout explicite ──
    // maxRetriesPerProvider: 0 → le budget total de l'appel est prévisible
    // (timeoutMs + chaîne de fallback éventuelle), pas de multiplication cachée.
    let result;
    let retried = false;
    try {
      result = await generateCompletion({
        messages: aiMessages,
        temperature: 0.7,
        timeoutMs,
        maxRetriesPerProvider: 0,
        providerConfig,
      });
    } catch (firstError) {
      // Autre erreur que timeout → remontée normale
      if (!isTimeoutError(firstError)) throw firstError;

      // ── A.9 : relance automatique unique à prompt resserré ──
      console.warn(
        `[directeur-chat] Dépassement du timeout (${timeoutMs} ms) — relance automatique unique à prompt resserré (${DIRECTEUR_RETRY_TIMEOUT_MS} ms)`
      );
      retried = true;
      result = await generateCompletion({
        messages: buildTightenedMessages(validated, levelCalibration),
        temperature: 0.6,
        timeoutMs: DIRECTEUR_RETRY_TIMEOUT_MS,
        maxRetriesPerProvider: 0,
        providerConfig,
      });
    }

    return NextResponse.json({
      data: {
        content: result.content,
        role: "assistant",
        retried,
        timeoutMs,
      },
    });
  } catch (error) {
    console.error("[POST /api/directeur-chat] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la génération";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { generateCompletionStream, type AiMessage } from "@/lib/ai/zai-client";
import { WRITING_MODES } from "@/data/ai-writing-modes";
import { SPECIALIZATION_PROMPTS } from "@/lib/ai/specializations";
import { getLevelCalibration, type DoctoralLevel } from "@/lib/ai/prompt-builder";
import { getActiveBookSkills } from "@/lib/ai/book-skills-server";
import { buildBookSkillsSection } from "@/lib/ai/book-skills";
import { buildKnowledgeStamp } from "@/lib/ai/knowledge-stamp";
import { KNOWLEDGE_CORE_VERSION } from "@/lib/ai/knowledge-core";
import { z } from "zod/v4";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";

// ═══════════════════════════════════════
// POST /api/ai-writing/stream — Streaming AI writing
// System prompts centralized in src/lib/ai/specializations/
// ═══════════════════════════════════════
const DOCTORAL_LEVELS = ["debutant", "intermediaire", "avance"] as const;

const streamSchema = z.object({
  mode: z.string(),
  prompt: z.string().min(10, "Le prompt doit contenir au moins 10 caractères").max(50_000, "Le prompt ne doit pas dépasser 50 000 caractères"),
  context: z.string().max(100_000, "Le contexte ne doit pas dépasser 100 000 caractères").optional(),
  doctoralLevel: z.enum(DOCTORAL_LEVELS).optional(),
  _aiConfig: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = streamSchema.parse(body);

    const mode = WRITING_MODES.find((m) => m.id === validated.mode);
    if (!mode) {
      return new Response(
        JSON.stringify({ error: "Mode d'écriture non trouvé" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Skip streaming for modes with custom endpoints (e.g. deep-research)
    if (mode.customEndpoint) {
      return new Response(
        JSON.stringify({ error: "Ce mode ne supporte pas le streaming. Utilisez l'endpoint standard." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Resolve system prompt from centralized specializations + level calibration
    const basePrompt = SPECIALIZATION_PROMPTS[validated.mode];
    if (!basePrompt) {
      return new Response(
        JSON.stringify({ error: `Aucun prompt de spécialisation trouvé pour le mode « ${validated.mode} ».` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const levelCalibration = getLevelCalibration(validated.doctoralLevel);
    const systemPrompt = basePrompt + levelCalibration;

    // Canal « compétences livres » : index + contenus des ressources actives
    // (opt-in). Aucun ajout si 0 ressource active — prompt inchangé.
    // Le stamp (provenance des savoirs) voyage HORS prompt vers le client.
    const activeBookSkills = await getActiveBookSkills();
    const bookSkillsSection = buildBookSkillsSection(activeBookSkills);
    const knowledgeStamp = buildKnowledgeStamp({
      coreVersion: KNOWLEDGE_CORE_VERSION,
      skills: activeBookSkills,
      generatedAt: new Date().toISOString(),
    });

    const messages: AiMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    if (bookSkillsSection) {
      messages.push({ role: "system", content: bookSkillsSection });
    }

    if (validated.context) {
      messages.push({
        role: "system",
        content: `CONTEXTE ADDITIONNEL DE LA THÈSE :\n${validated.context}`,
      });
    }

    messages.push({
      role: "user",
      content: validated.prompt,
    });

    const providerConfig = resolveAiConfig(request, validated._aiConfig);

    const upstream = await generateCompletionStream({
      messages,
      temperature: mode.temperature,
      providerConfig,
    });

    // Relais transparent du flux + événement « stamp » en fin (hors prompt,
    // ignoré par les clients qui ne le connaissent pas — CA-1.3, CA-3.1).
    if (!upstream.body) return upstream;
    const reader = upstream.body.getReader();
    const encoder = new TextEncoder();
    const stampSSE = `data: ${JSON.stringify({ type: "stamp", stamp: knowledgeStamp })}\n\n`;
    return new Response(
      new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            controller.enqueue(encoder.encode(stampSSE));
            controller.close();
          }
        },
      }),
      { status: upstream.status, headers: upstream.headers }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Données invalides", details: error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("[POST /api/ai-writing/stream] Error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la génération" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

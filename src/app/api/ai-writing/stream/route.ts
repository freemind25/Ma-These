import { NextRequest } from "next/server";
import { generateCompletionStream, type AiMessage } from "@/lib/ai/zai-client";
import { WRITING_MODES } from "@/data/ai-writing-modes";
import { z } from "zod/v4";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";

// ═══════════════════════════════════════
// POST /api/ai-writing/stream — Streaming AI writing
// ═══════════════════════════════════════
const streamSchema = z.object({
  mode: z.string(),
  prompt: z.string().min(10, "Le prompt doit contenir au moins 10 caractères"),
  context: z.string().optional(),
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

    const messages: AiMessage[] = [
      { role: "system", content: mode.systemPrompt },
    ];

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

    const providerConfig = validated._aiConfig as AiProviderConfig | undefined;

    return await generateCompletionStream({
      messages,
      temperature: mode.temperature,
      providerConfig,
    });
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

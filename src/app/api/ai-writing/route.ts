import { NextRequest, NextResponse } from "next/server";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { WRITING_MODES } from "@/data/ai-writing-modes";
import { z } from "zod/v4";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";

// ═══════════════════════════════════════
// POST /api/ai-writing — Generate AI writing assistance
// ═══════════════════════════════════════
const aiWritingSchema = z.object({
  mode: z.string(),
  prompt: z.string().min(10, "Le prompt doit contenir au moins 10 caractères"),
  context: z.string().optional(),
  _aiConfig: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = aiWritingSchema.parse(body);

    // Find the writing mode
    const mode = WRITING_MODES.find((m) => m.id === validated.mode);
    if (!mode) {
      return NextResponse.json(
        { error: "Mode d'écriture non trouvé", availableModes: WRITING_MODES.map((m) => m.id) },
        { status: 400 }
      );
    }

    // Build messages
    const messages: AiMessage[] = [
      { role: "system", content: mode.systemPrompt },
    ];

    // Add optional context
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

    // Extract AI config if passed from client
    const providerConfig = validated._aiConfig as AiProviderConfig | undefined;

    const result = await generateCompletion({
      messages,
      temperature: mode.temperature,
      providerConfig,
    });

    return NextResponse.json({
      data: {
        content: result.content,
        mode: mode.id,
        model: result.model,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/ai-writing] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la génération";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// GET /api/ai-writing — List available modes
// ═══════════════════════════════════════
export async function GET() {
  return NextResponse.json({
    data: WRITING_MODES.map((m) => ({
      id: m.id,
      label: m.label,
      description: m.description,
      icon: m.icon,
      category: m.category,
      placeholder: m.placeholder,
      ...(m.customEndpoint ? { customEndpoint: m.customEndpoint } : {}),
    })),
  });
}

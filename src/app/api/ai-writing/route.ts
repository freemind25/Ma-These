import { NextRequest, NextResponse } from "next/server";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { WRITING_MODES } from "@/data/ai-writing-modes";
import { SPECIALIZATION_PROMPTS } from "@/lib/ai/specializations";
import { getLevelCalibration, type DoctoralLevel } from "@/lib/ai/prompt-builder";
import { z } from "zod/v4";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";

// ═══════════════════════════════════════
// POST /api/ai-writing — Generate AI writing assistance
// System prompts are centralized in src/lib/ai/specializations/
// ═══════════════════════════════════════
const DOCTORAL_LEVELS = ["debutant", "intermediaire", "avance"] as const;

const aiWritingSchema = z.object({
  mode: z.string(),
  prompt: z.string().min(10, "Le prompt doit contenir au moins 10 caractères").max(50_000, "Le prompt ne doit pas dépasser 50 000 caractères"),
  context: z.string().max(100_000, "Le contexte ne doit pas dépasser 100 000 caractères").optional(),
  doctoralLevel: z.enum(DOCTORAL_LEVELS).optional(),
  _aiConfig: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = aiWritingSchema.parse(body);

    // Find the writing mode (metadata only)
    const mode = WRITING_MODES.find((m) => m.id === validated.mode);
    if (!mode) {
      return NextResponse.json(
        { error: "Mode d'écriture non trouvé", availableModes: WRITING_MODES.map((m) => m.id) },
        { status: 400 }
      );
    }

    // Resolve system prompt from centralized specializations + level calibration
    const basePrompt = SPECIALIZATION_PROMPTS[validated.mode];
    if (!basePrompt) {
      return NextResponse.json(
        { error: `Aucun prompt de spécialisation trouvé pour le mode « ${validated.mode} ».` },
        { status: 400 }
      );
    }
    const levelCalibration = getLevelCalibration(validated.doctoralLevel);
    const systemPrompt = basePrompt + levelCalibration;

    // Build messages
    const messages: AiMessage[] = [
      { role: "system", content: systemPrompt },
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

    // Resolve AI config from httpOnly cookie (secure) or body (backward compat)
    const providerConfig = resolveAiConfig(request, validated._aiConfig);

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
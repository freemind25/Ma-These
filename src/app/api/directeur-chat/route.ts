import { NextRequest, NextResponse } from "next/server";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { DIRECTEUR_SYSTEM_PROMPT } from "@/data/directeur-prompt";
import { z } from "zod/v4";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";

// ═══════════════════════════════════════
// POST /api/directeur-chat — Chat with AI thesis director
// ═══════════════════════════════════════

const directeurChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    })
  ).min(1),
  thesisContext: z.string().optional(),
  _aiConfig: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = directeurChatSchema.parse(body);

    // Build messages array for AI
    const aiMessages: AiMessage[] = [
      { role: "system", content: DIRECTEUR_SYSTEM_PROMPT },
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

    // Extract AI config if passed from client
    const providerConfig = validated._aiConfig as AiProviderConfig | undefined;

    const result = await generateCompletion({
      messages: aiMessages,
      temperature: 0.7,
      providerConfig,
    });

    return NextResponse.json({
      data: {
        content: result.content,
        role: "assistant",
      },
    });
  } catch (error) {
    console.error("[POST /api/directeur-chat] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la génération";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

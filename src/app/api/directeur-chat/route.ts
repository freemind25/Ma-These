import { NextRequest, NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/zai-client";
import { buildDirecteurPrompt } from "@/data/directeur-prompt";
import { db } from "@/lib/db";
import { z } from "zod/v4";

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
  thesisId: z.string().optional(),
});

// Mapping from DB field keys to cadrage snapshot keys
type CadrageSnapshotKey = "thematique" | "problematique" | "questionsRecherche" | "objectifs" | "typeRecherche" | "methodologie" | "revueLitterature" | "cadreTheorique" | "contributionAttendue" | "typeThese";

const FIELD_KEY_TO_SNAPSHOT_KEY: Record<string, CadrageSnapshotKey> = {
  thematique_generale: "thematique",
  problematique: "problematique",
  questions_recherche: "questionsRecherche",
  objectifs: "objectifs",
  type_recherche: "typeRecherche",
  methodologie: "methodologie",
  type_revue_litterature: "revueLitterature",
  cadre_theorique: "cadreTheorique",
  contribution_originalite: "contributionAttendue",
  type_these: "typeThese",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = directeurChatSchema.parse(body);

    // Fetch active cadrage if thesisId is provided
    const activeCadrage = validated.thesisId
      ? await db.thesisCadrage.findFirst({
          where: { thesisId: validated.thesisId, isActive: true },
          include: { fields: { orderBy: { sortOrder: "asc" } } },
        })
      : null;

    // Build cadrage snapshot from DB fields
    let cadrageSnapshot: {
      thematique?: string;
      problematique?: string;
      questionsRecherche?: string;
      objectifs?: string;
      typeRecherche?: string;
      methodologie?: string;
      revueLitterature?: string;
      cadreTheorique?: string;
      contributionAttendue?: string;
      typeThese?: string;
    } | undefined;

    if (activeCadrage) {
      const snapshot: Record<string, string> = {};
      for (const field of activeCadrage.fields) {
        if (!field.value) continue;
        const snapshotKey = FIELD_KEY_TO_SNAPSHOT_KEY[field.fieldKey];
        if (snapshotKey) {
          snapshot[snapshotKey] = field.value;
        }
      }
      // Only set cadrageSnapshot if at least one field matched
      if (Object.keys(snapshot).length > 0) {
        cadrageSnapshot = snapshot as NonNullable<typeof cadrageSnapshot>;
      }
    }

    // Build the system prompt with optional cadrage context
    const systemPrompt = buildDirecteurPrompt({
      cadrageSnapshot,
    });

    // Build messages array for AI
    const aiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add thesis context if provided
    if (validated.thesisContext) {
      aiMessages.push({
        role: "system",
        content: `INFORMATIONS SUR LA THÈSE DU DOCTORANT :\n${validated.thesisContext}`,
      });
    }

    // Add conversation history
    for (const msg of validated.messages) {
      aiMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    const result = await generateCompletion({
      messages: aiMessages,
      temperature: 0.7,
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

import { NextRequest, NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/zai-client";
import { CADRAGE_FIELDS_MAP } from "@/data/cadrage-fields";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// POST /api/cadrage/ai/reformulate-field — Reformulate a single field
// ═══════════════════════════════════════

const reformulateSchema = z.object({
  fieldKey: z.string().min(1),
  currentValue: z.string().optional().default(""),
  allFields: z.record(z.string(), z.string()).optional().default({}),
});

const SYSTEM_PROMPT = `Vous êtes un expert en recherche académique doctoral.
Votre rôle est de reformuler ou améliorer le contenu d'un champ de cadrage de thèse.

RÈGLES STRICTES :
1. Ne JAMAIS inventer de noms d'auteurs, de références bibliographiques.
2. Utiliser un ton hypothétique et académique.
3. Répondre UNIQUEMENT par le texte reformulé, sans commentaire ni explication.
4. Si le champ est de type JSON, retourner le JSON sérialisé en string.
5. Respecter les garde-fous du champ.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = reformulateSchema.parse(body);

    const fieldDef = CADRAGE_FIELDS_MAP[validated.fieldKey];
    if (!fieldDef) {
      return NextResponse.json(
        { error: `Champ « ${validated.fieldKey} » non trouvé` },
        { status: 400 }
      );
    }

    // Build context from other fields
    const contextLines = Object.entries(validated.allFields)
      .filter(([k]) => k !== validated.fieldKey && validated.allFields[k])
      .map(
        ([k, v]) => {
          const strVal = String(v);
          return `- ${k}: ${strVal.length > 200 ? strVal.slice(0, 200) + "…" : strVal}`;
        }
      )
      .join("\n");

    const userPrompt = `Reformulez ou améliorez le contenu du champ suivant.

Champ : ${fieldDef.label} (${validated.fieldKey})
Description : ${fieldDef.description}
${fieldDef.gardeFou ? `Garde-fou : ${fieldDef.gardeFou}` : ""}
${fieldDef.promptAmorce ? `Amorce : ${fieldDef.promptAmorce}` : ""}
${fieldDef.options ? `Options : ${fieldDef.options.join(", ")}` : ""}

Valeur actuelle :
"""${validated.currentValue || "(vide)"}"""

${contextLines ? `Contexte des autres champs :
${contextLines}` : ""}

Retournez UNIQUEMENT le texte reformulé.`;

    const result = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
    });

    let content = result.content.trim();
    // Strip potential markdown code blocks
    if (content.startsWith("```")) {
      content = content.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
    }

    return NextResponse.json({ data: { value: content.trim() } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/cadrage/ai/reformulate-field] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la reformulation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

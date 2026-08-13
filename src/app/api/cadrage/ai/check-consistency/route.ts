import { NextRequest, NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/zai-client";
import { CADRAGE_FIELDS_MAP } from "@/data/cadrage-fields";
import { z } from "zod/v4";

// ═══════════════════════════════════════
// POST /api/cadrage/ai/check-consistency — Check coherence of all fields
// ═══════════════════════════════════════

const checkSchema = z.object({
  fields: z.record(z.string(), z.string()),
});

const SYSTEM_PROMPT = `Vous êtes un expert en méthodologie de recherche doctorale.
Votre rôle est d'analyser la cohérence d'un cadrage de thèse et d'identifier les tensions.

TYPES DE TENSIONS :
- "warning" : incohérence modérée, à améliorer mais non bloquante
- "error" : contradiction forte ou incompatibilité majeure

Pour chaque tension détectée, retournez :
- severity: "warning" ou "error"
- title: un titre court décrivant le problème
- description: une explication détaillée
- concernedFields: un tableau de clés de champs concernés

RÈGLES :
1. Vérifier la cohérence entre problématique, questions de recherche et objectifs
2. Vérifier que le type de recherche est compatible avec la méthodologie
3. Vérifier que les hypothèses (si présentes) sont en lien avec les questions
4. Vérifier que les méthodes de collecte correspondent au type de recherche
5. Vérifier que l'unité d'analyse est cohérente avec le terrain/corpus
6. Vérifier que la revue de littérature est cohérente avec l'état du champ

FORMAT DE RÉPONSE :
Un JSON valide : { "tensions": [ { severity, title, description, concernedFields } ] }
Retournez un tableau vide si tout est cohérent. Maximum 8 tensions.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkSchema.parse(body);

    const fieldEntries = Object.entries(validated.fields)
      .filter(([, v]) => v && v.trim().length > 0)
      .map(([k, v]) => {
        const def = CADRAGE_FIELDS_MAP[k];
        const strVal = String(v);
        return `- ${def?.label ?? k} (${k}): ${strVal.length > 300 ? strVal.slice(0, 300) + "…" : strVal}`;
      })
      .join("\n\n");

    if (!fieldEntries) {
      return NextResponse.json({ data: { tensions: [] } });
    }

    const userPrompt = `Analysez la cohérence du cadrage suivant :

${fieldEntries}

Identifiez les tensions et incohérences. Répondez UNIQUEMENT en JSON.`;

    const result = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    let content = result.content.trim();
    if (content.startsWith("```json")) content = content.slice(7);
    else if (content.startsWith("```")) content = content.slice(3);
    if (content.endsWith("```")) content = content.slice(0, -3);

    const parsed = JSON.parse(content.trim());
    const tensions = parsed.tensions ?? [];

    // Validate tension structure
    const validTensions = tensions
      .filter(
        (t: Record<string, unknown>) =>
          typeof t.severity === "string" &&
          (t.severity === "warning" || t.severity === "error") &&
          typeof t.title === "string" &&
          typeof t.description === "string" &&
          Array.isArray(t.concernedFields)
      )
      .map((t: Record<string, unknown>) => ({
        severity: t.severity as "warning" | "error",
        title: String(t.title),
        description: String(t.description),
        concernedFields: t.concernedFields as string[],
      }));

    return NextResponse.json({ data: { tensions: validTensions } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/cadrage/ai/check-consistency] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la vérification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

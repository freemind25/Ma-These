import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateCompletion } from "@/lib/ai/zai-client";
import {
  CADRAGE_SYSTEM_PROMPT,
  CADRAGE_GENERATION_PROMPT,
} from "@/data/cadrage-prompt";

// ════════════════════════════════════════════════════════════════════════════════
// POST /api/cadrage/ai/generate — Generate all field suggestions from a pitch
// ════════════════════════════════════════════════════════════════════════════════

const generateSchema = z.object({
  pitch: z.string().min(10, "Le pitch doit contenir au moins 10 caractères"),
  thesisContext: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pitch, thesisContext } = generateSchema.parse(body);

    // Build the user prompt by injecting the pitch into the generation template
    const userPrompt = CADRAGE_GENERATION_PROMPT
      .replace("{pitch}", pitch)
      .replace("{laboratoire}", thesisContext ?? "Non renseigné")
      .replace("{ecoleDoctorale}", "Non renseigné")
      .replace("{discipline}", "Non renseigné");

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: CADRAGE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    const result = await generateCompletion({
      messages,
      temperature: 0.7,
    });

    // Parse the JSON response from the AI
    let parsed: Record<string, unknown>;
    try {
      // Strip potential markdown code fences
      const cleaned = result.content
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error:
            "La réponse de l'IA n'a pas pu être interprétée comme du JSON valide.",
          raw: result.content,
        },
        { status: 502 }
      );
    }

    // Transform the AI response into the expected output format
    // AI returns { fields: [{ key, value, remark }, ...], global_remarks: [...] }
    const data: Record<string, { value: string | object; isAiSuggestion: true }> =
      {};

    const fields = parsed.fields as
      | Array<{ key: string; value: string | object; remark?: string | null }>
      | undefined;

    if (Array.isArray(fields)) {
      for (const field of fields) {
        if (field.key && field.value !== undefined) {
          data[field.key] = {
            value: field.value,
            isAiSuggestion: true,
          };
        }
      }
    } else {
      // Fallback: if the response is a flat object keyed by field names
      for (const [key, value] of Object.entries(parsed)) {
        if (key !== "global_remarks" && key !== "fields") {
          data[key] = {
            value: value as string | object,
            isAiSuggestion: true,
          };
        }
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[POST /api/cadrage/ai/generate] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Erreur lors de la génération";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

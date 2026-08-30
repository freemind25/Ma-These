import { NextRequest, NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/zai-client";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text: string;
      context?: string;
      _aiConfig?: unknown;
    };

    const { text, context, _aiConfig } = body;
    const providerConfig = resolveAiConfig(request, _aiConfig);

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ primary: null, alternatives: [] });
    }

    const systemPrompt = `Tu es un assistant de prédiction de texte pour la rédaction académique universitaire (thèse, mémoire, article scientifique).
Ta tâche : compléter le texte fourni par 3 à 12 mots maximum, en gardant exactement le même style, ton et langue.

Règles strictes :
- Réponds UNIQUEMENT avec le texte de complétion, sans explication, sans guillemets, sans préfixe.
- Continue naturellement la phrase en cours.
- Utilise le style académique français approprié.
- Ne répète pas les derniers mots déjà écrits.
- Si le texte est en anglais, complète en anglais avec le même style académique.
- Propose UNE complétion principale (la plus probable) et 2 alternatives.
- Sépare les alternatives par le caractère spécial "|||".
- Chaque complétion doit être différente des autres.
- Chaque complétion doit commencer différemment (pas le même premier mot).

Format de réponse obligatoire : complétion_principale|||alternative_1|||alternative_2

Exemples :
Texte: "Les résultats de cette étude montrent que les effets"
Réponse: significatifs observés sont conformes aux|||mesurés dépassent les attentes|||obtenus valident notre hypothèse de

Texte: "Cette revue de littérature permet de"
Réponse: mettre en évidence les lacunes|||synthétiser les connaissances actuelles|||cadrer notre problématique de recherche`;

    const userPrompt = `Texte à compléter :\n\n${context ? `[Contexte précédent] : ${context}\n\n` : ""}[Texte en cours] : ...${text.slice(-400)}`;

    const result = await generateCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      maxTokens: 120,
      providerConfig,
    });

    const raw = result.content.trim();

    // Parse format: "primary|||alt1|||alt2"
    const parts = raw.split("|||").map((p) => p.trim());
    const primary = parts[0] || null;
    const alternatives = parts
      .slice(1)
      .filter((p) => p && p.length > 0)
      .slice(0, 3);

    // Clean up potential prefixes, quotes, or markdown
    const clean = (s: string) =>
      s
        .replace(/^[«""'`]/, "")
        .replace(/[»""'`]$/, "")
        .trim();

    return NextResponse.json({
      primary: primary ? clean(primary) : null,
      alternatives: alternatives.map(clean),
    });
  } catch (error) {
    console.error("[text-prediction] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur de prédiction";
    return NextResponse.json(
      { error: message, primary: null, alternatives: [] },
      { status: 500 }
    );
  }
}

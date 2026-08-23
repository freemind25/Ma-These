// ═══════════════════════════════════════════════════════════════
// POST /api/deep-research — Pipeline de recherche approfondie
// Inspiré de langchain-ai/open_deep_research
// Pipeline : Brief → Plan → Search → Read → Compress → Report
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import AiSDK from "z-ai-web-dev-sdk";
import { z } from "zod/v4";
import {
  generateCompletion,
  type AiMessage,
} from "@/lib/ai/zai-client";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";

// ── ZAI SDK singleton (web search + page reader) ──────────────────
let zaiInstance: Promise<AiSDK> | null = null;
function getZai(): Promise<AiSDK> {
  if (!zaiInstance) zaiInstance = AiSDK.create();
  return zaiInstance;
}

// ── Validation ──────────────────────────────────────────────────
const schema = z.object({
  prompt: z.string().min(10, "La question doit contenir au moins 10 caractères"),
  context: z.string().optional(),
  _aiConfig: z.unknown().optional(),
});

// ── Types ───────────────────────────────────────────────────────
interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
}

interface SubQuery {
  query: string;
  rationale: string;
}

// ── Pipeline Steps ─────────────────────────────────────────────

/** Step 1: Transform user query into a structured research brief */
async function generateResearchBrief(
  userQuery: string,
  providerConfig?: AiProviderConfig,
  thesisContext?: string,
): Promise<string> {
  const systemPrompt = `Tu es un assistant de recherche académique. Tu transformes une question d'utilisateur en un brief de recherche détaillé et structuré.

RÈGLES :
1. Maximise la spécificité et le détail
2. Si l'utilisateur n'a pas précisé certains aspects, indique-le comme ouvert
3. Ne fais PAS d'hypothèses non justifiées
4. Formule à la première personne (du point de vue du chercheur)
5. Pour les requêtes académiques, privilégie les sources originales et les revues à comité de lecture
6. Si la question est en français, le brief doit être en français

FORMAT : Un paragraphe structuré décrivant la recherche à mener, les dimensions à explorer, et les attentes.`;

  const messages: AiMessage[] = [
    { role: "system", content: systemPrompt },
  ];
  if (thesisContext) {
    messages.push({
      role: "system",
      content: `CONTEXTE DE LA THÈSE DE L'UTILISATEUR :\n${thesisContext}`,
    });
  }
  messages.push({ role: "user", content: userQuery });

  const result = await generateCompletion({
    messages,
    temperature: 0.5,
    providerConfig,
  });
  return result.content;
}

/** Step 2: Plan sub-queries for parallel web search */
async function planSubQueries(
  researchBrief: string,
  providerConfig?: AiProviderConfig,
): Promise<SubQuery[]> {
  const systemPrompt = `Tu es un planificateur de recherche. Tu décomposes un brief de recherche en 3 à 5 sous-requêtes de recherche web indépendantes et parallélisables.

RÈGLES :
- Chaque sous-requête doit cibler un aspect distinct du brief
- Les sous-requêtes doivent être complémentaires, pas redondantes
- Formule les requêtes en français OU en anglais selon ce qui donnera les meilleurs résultats académiques
- Privilégie les termes anglophones pour les sujets scientifiques internationaux
- Chaque requête doit pouvoir être utilisée directement dans un moteur de recherche

RÉPONDS UNIQUEMENT au format JSON suivant, sans aucun texte avant ou après :
{"queries": [{"query": "...", "rationale": "..."}]}

LIMITE : 3 à 5 requêtes maximum.`;

  const result = await generateCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `BRIEF DE RECHERCHE :\n${researchBrief}` },
    ],
    temperature: 0.4,
    providerConfig,
  });

  try {
    const jsonStr = result.content.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    const queries: SubQuery[] = (parsed.queries || []).slice(0, 5);
    return queries;
  } catch {
    // Fallback: use the brief itself as a single query
    return [{ query: researchBrief.substring(0, 200), rationale: "Requête principale" }];
  }
}

/** Step 3: Execute web searches in parallel */
async function executeWebSearches(
  subQueries: SubQuery[],
): Promise<SearchResult[]> {
  const zai = await getZai();
  const allResults: SearchResult[] = [];

  const searchPromises = subQueries.map(async (sq) => {
    try {
      const results = await zai.functions.invoke("web_search", {
        query: sq.query,
        num: 5,
      });
      return (Array.isArray(results) ? results : []).map((r: Record<string, string>) => ({
        url: r.url || "",
        name: r.name || "",
        snippet: r.snippet || "",
        host_name: r.host_name || "",
      }));
    } catch (err) {
      console.error(`[deep-research] Search failed for: ${sq.query}`, err);
      return [] as SearchResult[];
    }
  });

  const searchResults = await Promise.all(searchPromises);

  // Deduplicate by URL
  const seen = new Set<string>();
  for (const results of searchResults) {
    for (const r of results) {
      if (r.url && !seen.has(r.url)) {
        seen.add(r.url);
        allResults.push(r);
      }
    }
  }

  return allResults;
}

/** Step 4: Read top pages and extract content */
async function readTopPages(
  searchResults: SearchResult[],
  maxPages = 6,
): Promise<{ title: string; url: string; content: string }[]> {
  const zai = await getZai();
  const topPages = searchResults.slice(0, maxPages);

  const readPromises = topPages.map(async (page) => {
    try {
      const result = await zai.functions.invoke("page_reader", {
        url: page.url,
      });
      const html = (result as Record<string, string>).html || "";
      // Strip HTML tags for plain text
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      // Truncate to avoid token overflow
      return {
        title: page.name,
        url: page.url,
        content: text.substring(0, 8000),
      };
    } catch (err) {
      console.error(`[deep-research] Failed to read: ${page.url}`, err);
      return null;
    }
  });

  const results = await Promise.all(readPromises);
  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

/** Step 5: Compress all findings into a structured summary */
async function compressFindings(
  researchBrief: string,
  pages: { title: string; url: string; content: string }[],
  searchSnippets: SearchResult[],
  providerConfig?: AiProviderConfig,
): Promise<string> {
  const sources = pages
    .map((p, i) => `[${i + 1}] ${p.title}: ${p.url}`)
    .join("\n");

  const allContent = pages
    .map((p, i) => `--- SOURCE ${i + 1}: ${p.title} ---\n${p.content}`)
    .join("\n\n");

  // Add remaining snippets that weren't fully read
  const readUrls = new Set(pages.map((p) => p.url));
  const extraSnippets = searchSnippets
    .filter((s) => !readUrls.has(s.url))
    .slice(0, 5)
    .map(
      (s, i) =>
        `[${pages.length + i + 1}] ${s.name}: ${s.url}\nRésumé : ${s.snippet}`
    )
    .join("\n\n");

  const systemPrompt = `Tu es un assistant de recherche qui compresse les résultats de recherche. Ton travail est de nettoyer les résultats en préservant TOUTES les informations pertinentes.

<Règles>
1. Conserve TOUTES les informations pertinentes — répète les données clés textuellement
2. Le rapport doit être COMPLET — il sera utilisé pour générer le rapport final
3. Inclus des citations entre crochets [n] pour chaque source
4. Inclue une section "### Sources" à la fin
5. Ne résume PAS au point de perdre des informations
</Règles>

<Format de sortie>
**Requêtes de recherche et sources consultées**
(liste des requêtes)

**Résultats synthétisés**
(contenu détaillé avec citations)

**Liste de toutes les sources**
[1] Titre: URL
[2] Titre: URL
...`;

  const result = await generateCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `BRIEF DE RECHERCHE :\n${researchBrief}\n\nCONTENU DES PAGES LUES :\n${allContent}${extraSnippets ? `\n\nEXTRAITS SUPPLÉMENTAIRES :\n${extraSnippets}` : ""}\n\nSOURCES :\n${sources}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 8000,
    providerConfig,
  });

  return result.content;
}

/** Step 6: Generate final report with citations */
async function generateFinalReport(
  researchBrief: string,
  compressedFindings: string,
  providerConfig?: AiProviderConfig,
): Promise<string> {
  const systemPrompt = `Tu es un chercheur académique expérimenté. Tu rédiges un rapport de recherche approfondi et structuré.

<Règles>
1. Structure le rapport avec des titres (## pour sections, ### pour sous-sections)
2. Inclus des faits spécifiques et des données des sources
3. Réfère les sources avec le format [Titre](URL)
4. Analyse de manière équilibrée et exhaustive
5. N'utilise PAS de langage auto-référentiel (ne dis pas "je vais...")
6. Chaque section doit être aussi longue que nécessaire pour répondre en profondeur
7. Utilise des listes à puces quand c'est pertinent
8. Rédige en français académique
</Règles>

<Citation Rules>
- Assigne un numéro unique [n] à chaque URL dans le texte
- Termine par une section ### Sources avec toutes les références
- Format : [1] Titre de la source: URL
- Chaque source sur une ligne séparée
</Citation Rules>

<Structure possible>
Pour une question comparative :
1. Introduction
2. Vue d'ensemble du sujet A
3. Vue d'ensemble du sujet B
4. Comparaison A vs B
5. Conclusion

Pour une question de synthèse :
1. Introduction
2. Concept 1
3. Concept 2
4. Concept 3
5. Conclusion

Adapte la structure au sujet. Le rapport doit être complet et professionnel.`;

  const result = await generateCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `BRIEF DE RECHERCHE :\n${researchBrief}\n\nRÉSULTATS DE LA RECHERCHE :\n${compressedFindings}`,
      },
    ],
    temperature: 0.5,
    maxTokens: 10000,
    providerConfig,
  });

  return result.content;
}

// ── Main Handler ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    const providerConfig = validated._aiConfig as AiProviderConfig | undefined;

    // ── Step 1: Research Brief ──
    const researchBrief = await generateResearchBrief(
      validated.prompt,
      providerConfig,
      validated.context,
    );

    // ── Step 2: Plan Sub-Queries ──
    const subQueries = await planSubQueries(researchBrief, providerConfig);

    // ── Step 3: Execute Web Searches ──
    const searchResults = await executeWebSearches(subQueries);

    if (searchResults.length === 0) {
      return NextResponse.json({
        data: {
          content:
            "Aucun résultat de recherche trouvé. Veuillez reformuler votre question ou essayer un autre sujet.",
          mode: "deep-research",
          steps: { brief: researchBrief, queries: subQueries, sources: 0 },
        },
      });
    }

    // ── Step 4: Read Top Pages ──
    const pages = await readTopPages(searchResults, 6);

    // ── Step 5: Compress Findings ──
    const compressedFindings = await compressFindings(
      researchBrief,
      pages,
      searchResults,
      providerConfig,
    );

    // ── Step 6: Generate Final Report ──
    const finalReport = await generateFinalReport(
      researchBrief,
      compressedFindings,
      providerConfig,
    );

    return NextResponse.json({
      data: {
        content: finalReport,
        mode: "deep-research",
        steps: {
          brief: researchBrief,
          queriesCount: subQueries.length,
          searchResultsCount: searchResults.length,
          pagesRead: pages.length,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("[POST /api/deep-research] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la recherche";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

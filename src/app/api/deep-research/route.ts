// ═══════════════════════════════════════════════════════════════
// POST /api/deep-research — Pipeline de recherche approfondie
// Inspiré de langchain-ai/open_deep_research
// Pipeline : Brief → Plan → Search → Read → Compress → Report
// v1.9.3 : ajout mode "academic" (OpenAlex + curation déterministe)
//   Inspiration retriever : gpt-researcher (Apache 2.0 — attribution si copie de code)
//   Aucun code copié — architecture inspirée, implémentation originale
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import AiSDK from "z-ai-web-dev-sdk";
import { z } from "zod/v4";
import {
  generateCompletion,
  type AiMessage,
} from "@/lib/ai/zai-client";
import { resolveAiConfig } from "@/lib/ai/resolve-ai-config";
import { type AiProviderConfig } from "@/lib/ai/ai-types";
import {
  searchWorks,
  type CoreWork,
} from "@/lib/core-api";
import {
  searchAcademicWorks,
  formatWorksForPrompt,
  formatWorksAsReferences,
  type CuratedWork,
} from "@/lib/research/openalex";
import {
  curateWorks,
  curationSummary,
  CURATION_THRESHOLD_ACCEPTABLE,
} from "@/lib/research/curation";

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
  sourceMode: z.enum(["web", "academic"]).optional().default("web"),
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

type SourceMode = "web" | "academic";

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

/** Step 2: Plan sub-queries for parallel search */
async function planSubQueries(
  researchBrief: string,
  providerConfig?: AiProviderConfig,
  sourceMode?: SourceMode,
): Promise<SubQuery[]> {
  // En mode academic, on optimise pour les requêtes en anglais
  const modeHint = sourceMode === "academic"
    ? "\n- IMPORTANT : Formule TOUTES les requêtes en ANGLAIS pour optimiser la recherche OpenAlex (base de données anglophone)"
    : "";

  const systemPrompt = `Tu es un planificateur de recherche. Tu décomposes un brief de recherche en 3 à 5 sous-requêtes de recherche indépendantes et parallélisables.

RÈGLES :
- Chaque sous-requête doit cibler un aspect distinct du brief
- Les sous-requêtes doivent être complémentaires, pas redondantes
- Formule les requêtes en français OU en anglais selon ce qui donnera les meilleurs résultats académiques
- Privilégie les termes anglophones pour les sujets scientifiques internationaux${modeHint}
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
    return [{ query: researchBrief.substring(0, 200), rationale: "Requête principale" }];
  }
}

/** Step 3a: Execute web searches in parallel (mode "web") */
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
      return (Array.isArray(results) ? results : []).map((r) => ({
        url: (r as unknown as Record<string, string>).url || "",
        name: (r as unknown as Record<string, string>).name || "",
        snippet: (r as unknown as Record<string, string>).snippet || "",
        host_name: (r as unknown as Record<string, string>).host_name || "",
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

/** Step 3b: Search CORE (open access academic papers) — mode "web" */
async function searchCorePapers(
  subQueries: SubQuery[],
): Promise<CoreWork[]> {
  const allWorks: CoreWork[] = [];
  const seen = new Set<number>();

  const queriesToUse = subQueries.slice(0, 3);

  const corePromises = queriesToUse.map(async (sq) => {
    try {
      const results = await searchWorks(sq.query, 5, 0);
      return results.results;
    } catch (err) {
      console.error(`[deep-research] CORE search failed for: ${sq.query}`, err);
      return [] as CoreWork[];
    }
  });

  const coreResults = await Promise.all(corePromises);

  for (const works of coreResults) {
    for (const w of works) {
      if (!seen.has(w.id)) {
        seen.add(w.id);
        allWorks.push(w);
      }
    }
  }

  return allWorks
    .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
    .slice(0, 8);
}

/** Step 3c: Search OpenAlex + curation déterministe — mode "academic" */
async function searchOpenAlexWorks(
  subQueries: SubQuery[],
): Promise<CuratedWork[]> {
  const allRawWorks = [];
  const seenIds = new Set<string>();

  const queriesToUse = subQueries.slice(0, 4);

  const promises = queriesToUse.map(async (sq) => {
    try {
      const works = await searchAcademicWorks(sq.query, { limit: 15, sort: "cited_by_count:desc" });
      return works;
    } catch (err) {
      console.error(`[deep-research] OpenAlex search failed for: ${sq.query}`, err);
      return [];
    }
  });

  const results = await Promise.all(promises);

  for (const works of results) {
    for (const w of works) {
      if (!seenIds.has(w.id)) {
        seenIds.add(w.id);
        allRawWorks.push(w);
      }
    }
  }

  // Curation déterministe : filtre + score + tri
  const curated = curateWorks(allRawWorks, {
    maxResults: 15,
    minScore: CURATION_THRESHOLD_ACCEPTABLE,
  });

  const summary = curationSummary(curated);
  console.error(
    `[deep-research] OpenAlex curation: ${summary.total} sources (${summary.bons} bons, ${summary.acceptables} acceptables, ${summary.faibles} faibles), score moyen: ${summary.avgScore}`,
  );

  return curated;
}

/** Step 4: Read top pages and extract content (mode "web") */
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
      const html = (result as unknown as Record<string, string>).html || "";
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
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

/** Step 5a: Compress findings (mode "web") */
async function compressWebFindings(
  researchBrief: string,
  pages: { title: string; url: string; content: string }[],
  searchSnippets: SearchResult[],
  corePapers: CoreWork[],
  providerConfig?: AiProviderConfig,
): Promise<string> {
  let sourceIndex = 0;

  const webSources = pages
    .map((p) => { sourceIndex++; return `[${sourceIndex}] ${p.title}: ${p.url}`; })
    .join("\n");

  const allContent = pages
    .map((p) => { const idx = sourceIndex - pages.length + pages.indexOf(p) + 1; return `--- SOURCE ${idx}: ${p.title} ---\n${p.content}`; })
    .join("\n\n");

  const coreSources = corePapers
    .map((w) => {
      sourceIndex++;
      const authors = w.authors.map((a) => a.name).join(", ");
      return `[${sourceIndex}] ${authors} (${w.yearPublished || "s.d."}). ${w.title}
   URL: https://core.ac.uk/works/${w.id}${w.doi ? ` | DOI: ${w.doi}` : ""}
   Abstract: ${(w.abstract || "").substring(0, 1500)}`;
    })
    .join("\n\n");

  const coreSourceList = corePapers
    .map((w) => {
      sourceIndex++;
      const authors = w.authors.map((a) => a.name).join(", ");
      return `[${sourceIndex - corePapers.length}] ${authors} (${w.yearPublished || "s.d."}). ${w.title}: https://core.ac.uk/works/${w.id}`;
    })
    .join("\n");

  const readUrls = new Set(pages.map((p) => p.url));
  const extraSnippets = searchSnippets
    .filter((s) => !readUrls.has(s.url))
    .slice(0, 5)
    .map(
      (s) => {
        sourceIndex++;
        return `[${sourceIndex}] ${s.name}: ${s.url}\nRésumé : ${s.snippet}`;
      }
    )
    .join("\n\n");

  const allSources = [webSources, coreSourceList].filter(Boolean).join("\n");

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
        content: `BRIEF DE RECHERCHE :\n${researchBrief}\n\nCONTENU DES PAGES LUES (WEB) :\n${allContent}${coreSources ? `\n\n--- ARTICLES ACADÉMIQUES (CORE Open Access) ---\n${coreSources}` : ""}${extraSnippets ? `\n\nEXTRAITS SUPPLÉMENTAIRES (WEB) :\n${extraSnippets}` : ""}\n\nSOURCES :\n${allSources}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 8000,
    providerConfig,
  });

  return result.content;
}

/** Step 5b: Compress findings (mode "academic" — OpenAlex curé) */
async function compressAcademicFindings(
  researchBrief: string,
  curatedWorks: CuratedWork[],
  providerConfig?: AiProviderConfig,
): Promise<string> {
  const worksContent = formatWorksForPrompt(curatedWorks);
  const references = formatWorksAsReferences(curatedWorks);

  const curationInfo = curatedWorks
    .map((w, i) => `[${i + 1}] Score: ${w.curationScore} (${w.curationDetails.isPeerReviewed ? "peer-reviewed" : w.type}) | Citations: ${w.citedByCount} | OA: ${w.oaStatus}`)
    .join("\n");

  const systemPrompt = `Tu es un assistant de recherche académique spécialisé dans la synthèse de littérature. Tu reçois des articles académiques déjà filtrés et évalués (curation déterministe).

<Règles>
1. Conserve TOUTES les informations pertinentes — répète les données clés textuellement
2. Le rapport doit être COMPLET — il sera utilisé pour générer le rapport final
3. Inclus des citations entre crochets [n] pour chaque source
4. Organise par thématiques, pas par article
5. Identifie les convergences, divergences et lacunes entre les sources
6. Ne résume PAS au point de perdre des informations
</Règles>

<Format de sortie>
**Requêtes de recherche et sources académiques consultées**
(liste des requêtes)

**Résultats synthétisés par thématique**
(contenu détaillé avec citations [n])

**Convergences et divergences identifiées**
(analyse comparative des sources)

**Lacunes et pistes de recherche**
(gaps identifiés dans la littérature)`;

  const result = await generateCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `BRIEF DE RECHERCHE :\n${researchBrief}\n\n--- SOURCES ACADÉMIQUES CURÉES (OpenAlex) ---\nScores de curation :\n${curationInfo}\n\nDétail des sources :\n${worksContent}\n\nRÉFÉRENCES :\n${references}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 8000,
    providerConfig,
  });

  return result.content;
}

/** Step 6: Generate final report — mode "web" */
async function generateWebReport(
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

/** Step 6: Generate final report — mode "academic" */
async function generateAcademicReport(
  researchBrief: string,
  compressedFindings: string,
  curatedWorks: CuratedWork[],
  providerConfig?: AiProviderConfig,
): Promise<string> {
  const references = formatWorksAsReferences(curatedWorks);

  const systemPrompt = `Tu es un chercheur académique expérimenté. Tu rédiges une synthèse de littérature structurée à partir de sources académiques peer-reviewed.

<Règles>
1. Structure la synthèse avec des titres (## pour thématiques, ### pour sous-thèmes)
2. Inclus des faits spécifiques et des données des sources
3. Réfère les sources avec le format (Auteur, Année) et numérotation [n]
4. Analyse de manière équilibrée et exhaustive
5. N'utilise PAS de langage auto-référentiel
6. Chaque section doit être aussi longue que nécessaire pour répondre en profondeur
7. Utilise des listes à puces quand c'est pertinent
8. Rédige en français académique
9. Signale explicitement les convergences et divergences entre auteurs
10. Identifie les lacunes dans la littérature (research gaps)
</Règles>

<Citation Rules>
- Assigne un numéro unique [n] à chaque source dans le texte
- Utilise le format (Auteur, Année) dans le corps du texte
- Termine par une section ### Références avec toutes les références complètes
- Format : [1] Auteurs (Année). Titre. Venue. DOI.
</Citation Rules>

<Structure attendue>
1. Introduction et périmètre de la synthèse
2. Thématiques identifiées (2-4 sections)
3. Synthèse comparative et convergences/divergences
4. Lacunes et pistes de recherche
5. Conclusion`;

  const result = await generateCompletion({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `BRIEF DE RECHERCHE :\n${researchBrief}\n\nRÉSULTATS DE LA RECHERCHE ACADÉMIQUE :\n${compressedFindings}\n\nRÉFÉRENCES COMPLÈTES :\n${references}`,
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
    const providerConfig = resolveAiConfig(request, validated._aiConfig);
    const sourceMode = validated.sourceMode as SourceMode;

    // ── Step 1: Research Brief ──
    const researchBrief = await generateResearchBrief(
      validated.prompt,
      providerConfig,
      validated.context,
    );

    // ── Step 2: Plan Sub-Queries ──
    const subQueries = await planSubQueries(researchBrief, providerConfig, sourceMode);

    // ── Step 3+4+5+6: Branch by source mode ──
    if (sourceMode === "academic") {
      // ── Mode académique : OpenAlex + curation déterministe ──
      const curatedWorks = await searchOpenAlexWorks(subQueries);

      if (curatedWorks.length === 0) {
        return NextResponse.json({
          data: {
            content:
              "Aucune source académique pertinente trouvée via OpenAlex. Essayez de reformuler votre question en termes plus spécifiques, ou utilisez le mode Web pour élargir la recherche.",
            mode: "deep-research",
            sourceMode: "academic",
            steps: { brief: researchBrief, queries: subQueries, curatedSources: 0 },
          },
        });
      }

      const summary = curationSummary(curatedWorks);
      const compressedFindings = await compressAcademicFindings(
        researchBrief,
        curatedWorks,
        providerConfig,
      );

      const finalReport = await generateAcademicReport(
        researchBrief,
        compressedFindings,
        curatedWorks,
        providerConfig,
      );

      return NextResponse.json({
        data: {
          content: finalReport,
          mode: "deep-research",
          sourceMode: "academic",
          steps: {
            brief: researchBrief,
            queriesCount: subQueries.length,
            curatedSources: summary.total,
            curatedBon: summary.bons,
            curatedAcceptable: summary.acceptables,
            avgCurationScore: summary.avgScore,
          },
        },
      });
    }

    // ── Mode web (existant, inchangé) : Tavily + CORE ──
    const [searchResults, corePapers] = await Promise.all([
      executeWebSearches(subQueries),
      searchCorePapers(subQueries),
    ]);

    if (searchResults.length === 0 && corePapers.length === 0) {
      return NextResponse.json({
        data: {
          content:
            "Aucun résultat de recherche trouvé. Veuillez reformuler votre question ou essayer un autre sujet.",
          mode: "deep-research",
          sourceMode: "web",
          steps: { brief: researchBrief, queries: subQueries, sources: 0 },
        },
      });
    }

    const pages = await readTopPages(searchResults, 6);

    const compressedFindings = await compressWebFindings(
      researchBrief,
      pages,
      searchResults,
      corePapers,
      providerConfig,
    );

    const finalReport = await generateWebReport(
      researchBrief,
      compressedFindings,
      providerConfig,
    );

    return NextResponse.json({
      data: {
        content: finalReport,
        mode: "deep-research",
        sourceMode: "web",
        steps: {
          brief: researchBrief,
          queriesCount: subQueries.length,
          searchResultsCount: searchResults.length,
          corePapersCount: corePapers.length,
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

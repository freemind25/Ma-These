// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Pipeline deep-research (extrait de la route, v2)
// Inspiré de langchain-ai/open_deep_research
// Pipeline : Brief → Plan → Search → Read → Compress → Report
// Mode "web" : recherche web + CORE + (A.3) rapport robuste
// Mode "academic" : OpenAlex + curation déterministe
//   + (A.2) repli automatique CrossRef + HAL avec triangulation
// Extrait en module pour être exécuté aussi par le worker de la
// file de tâches persistante (A.8) — la route n'est qu'un wrapper.
// ═══════════════════════════════════════════════════════════════

import {
  generateCompletion,
  type AiMessage,
} from "@/lib/ai/zai-client";
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
  type OpenAlexWork,
} from "@/lib/research/openalex";
import {
  curateWorks,
  curationSummary,
  CURATION_THRESHOLD_ACCEPTABLE,
} from "@/lib/research/curation";
import {
  fallbackAcademicSearch,
  fallbackSummary,
} from "@/lib/research/academic-fallback";

// ── ZAI SDK singleton (web search + page reader) ──────────────────
// Dynamic import — SDK is serverExternalPackages, may not exist in standalone/desktop
interface ZaiClient {
  functions: {
    invoke(name: string, args: Record<string, unknown>): Promise<unknown>;
  };
}
let zaiInstance: Promise<ZaiClient> | null = null;
let _sdkLoadFailed = false;
async function getZai(): Promise<ZaiClient> {
  if (_sdkLoadFailed) throw new Error("Le mode de recherche web nécessite l'environnement z.ai (non disponible en mode bureau). Utilisez le mode académique.");
  if (!zaiInstance) {
    try {
      const SDK = await import("z-ai-web-dev-sdk");
      zaiInstance = SDK.default.create() as Promise<ZaiClient>;
    } catch {
      _sdkLoadFailed = true;
      throw new Error("Le mode de recherche web nécessite l'environnement z.ai (non disponible en mode bureau). Utilisez le mode académique.");
    }
  }
  return zaiInstance;
}

// ── Types ───────────────────────────────────────────────────────

export interface DeepResearchInput {
  prompt: string;
  context?: string;
  sourceMode: "web" | "academic";
  providerConfig?: AiProviderConfig;
}

export interface DeepResearchResult {
  content: string;
  mode: "deep-research";
  sourceMode: "web" | "academic";
  steps: Record<string, unknown>;
}

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

/** Source consultée, pour la section Sources déterministe (A.3). */
interface ReportSource {
  label: string;
  url: string;
}

// ── A.3 : utilitaires de robustesse du rapport ──────────────────

/** Détecte un rapport probablement tronqué (fin sans ponctuation terminale). */
function isLikelyTruncated(report: string): boolean {
  const tail = report.replace(/\s+$/, "");
  if (tail.length === 0) return true;
  const lastChar = tail.slice(-1);
  const terminal = new Set([".", "!", "?", ":", ";", "»", '"', ")", "]", "*", "`", "—", "-"]);
  // Une liste à puces peut légitimement se terminer sans point → on vérifie
  // aussi que la dernière ligne n'est pas une puce inachevée.
  const lastLine = (tail.split("\n").pop() || "").trim();
  // TS2695 : un tuple ("a", "b", "c") passé à startsWith ne teste que "c"
  // (le côté gauche de la virgule est jeté) — il faut tester chaque préfixe.
  const isBullet = ["- ", "* ", "• "].some((prefix) => lastLine.startsWith(prefix));
  if (isBullet && !terminal.has(lastChar)) return true;
  return !terminal.has(lastChar);
}

/** Détecte une section Sources / Références dans le rapport. */
function hasSourcesSection(report: string): boolean {
  return /#{2,3}\s*(sources|références|references)\b/i.test(report);
}

/**
 * A.3 — Prolonge un rapport tronqué par passes de continuation (max 2).
 * Chaque passe reprend EXACTEMENT à la dernière phrase écrite.
 */
async function continueIfTruncated(
  report: string,
  researchBrief: string,
  providerConfig: AiProviderConfig | undefined,
  maxTokens: number,
  maxPasses = 2
): Promise<string> {
  let current = report;
  for (let pass = 0; pass < maxPasses && isLikelyTruncated(current); pass++) {
    const head = current.slice(-4_000);
    console.warn(
      `[deep-research] Rapport probablement tronqué (passe de continuation ${pass + 1}/${maxPasses})`
    );
    const result = await generateCompletion({
      messages: [
        {
          role: "system",
          content:
            "Tu poursuis la rédaction d'un rapport de recherche déjà écrit. On te donne la FIN du rapport. Reprends EXACTEMENT là où le texte s'arrête (au milieu de la phrase si nécessaire) et poursuis la rédaction de manière fluide, sans reprendre depuis le début, sans répéter de contenu déjà écrit, sans préambule. Le texte que tu produis sera concaténé directement après le fragment fourni.",
        },
        {
          role: "user",
          content: `BRIEF (contexte) :\n${researchBrief.slice(0, 1_000)}\n\nFIN DU RAPPORT À POURSUIVER :\n${head}`,
        },
      ],
      temperature: 0.4,
      maxTokens,
      providerConfig,
    });
    const continuation = result.content.trim();
    if (!continuation) break;
    current = `${current.replace(/\s+$/, "")} ${continuation}`;
  }
  return current;
}

/**
 * A.3 — Garantit la section Sources : relance automatique si absente,
 * puis ajout déterministe (liste réelle des sources consultées) en dernier recours.
 */
async function ensureSourcesSection(
  report: string,
  sources: ReportSource[],
  mode: SourceMode,
  providerConfig: AiProviderConfig | undefined
): Promise<{ report: string; mechanism: "present" | "relance" | "deterministe" }> {
  if (hasSourcesSection(report)) {
    return { report, mechanism: "present" };
  }

  console.warn("[deep-research] Section Sources absente — relance automatique demandée");
  const sectionHeader = mode === "academic" ? "### Références" : "### Sources";
  const relance = await generateCompletion({
    messages: [
      {
        role: "system",
        content: `Tu produis UNIQUEMENT une section "${sectionHeader}" pour un rapport de recherche. RÈGLE ABSOLUE : chaque ligne cite une source RÉELLE fournie ci-dessous, au format Markdown "[n] [Titre](URL)", une source par ligne, sans aucune invention, sans aucun texte d'introduction. Sortie = la section seule, commençant par "${sectionHeader}".`,
      },
      {
        role: "user",
        content: `FIN DU RAPPORT (pour le contexte de style) :\n${report.slice(-2_000)}\n\nLISTE RÉELLE DES SOURCES CONSULTÉES (ne citer QUE celles-ci) :\n${sources
          .map((s, i) => `[${i + 1}] ${s.label}: ${s.url}`)
          .join("\n")}`,
      },
    ],
    temperature: 0.2,
    maxTokens: 4_000,
    providerConfig,
  });

  const relanceText = relance.content.trim();
  const looksLikeSection =
    /#{2,3}\s*(sources|références|references)\b/i.test(relanceText) ||
    /\[\d+\]/.test(relanceText);

  if (looksLikeSection) {
    return { report: `${report.replace(/\s+$/, "")}\n\n${relanceText}`, mechanism: "relance" };
  }

  // Dernier recours DÉTERMINISTE : la liste réelle, sans aucun LLM (liens Markdown).
  console.warn("[deep-research] Relance Sources inexploitable — ajout déterministe de la liste réelle");
  const deterministic = `${sectionHeader}\n${sources
    .map((s, i) => `[${i + 1}] [${s.label}](${s.url})`)
    .join("\n")}`;
  return {
    report: `${report.replace(/\s+$/, "")}\n\n${deterministic}`,
    mechanism: "deterministe",
  };
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

// ── Step 3c : mode académique (A.2) ─────────────────────────────

export interface OpenAlexSearchStatus {
  curated: CuratedWork[];
  /** Au moins une requête OpenAlex a échoué (429, budget, réseau…) */
  failureDetected: boolean;
  /** Le message d'échec évoque un 429 / budget / rate-limit */
  budgetLikeError: boolean;
  /** Message d'erreur consolidé (traçabilité) */
  errorMessages: string;
}

/** Step 3c: Search OpenAlex + curation déterministe — mode "academic".
 *  A.2 : remonte l'état d'échec au lieu de l'avaler, pour déclencher le repli. */
async function searchOpenAlexWorks(
  subQueries: SubQuery[],
): Promise<OpenAlexSearchStatus> {
  const allRawWorks: OpenAlexWork[] = [];
  const seenIds = new Set<string>();
  const errors: string[] = [];

  const queriesToUse = subQueries.slice(0, 4);

  const promises = queriesToUse.map(async (sq) => {
    try {
      const works = await searchAcademicWorks(sq.query, { limit: 15, sort: "cited_by_count:desc" });
      return { ok: true as const, works, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[deep-research] OpenAlex search failed for: ${sq.query} — ${message}`);
      return { ok: false as const, works: [], error: message };
    }
  });

  const results = await Promise.all(promises);

  for (const r of results) {
    if (!r.ok && r.error) errors.push(r.error);
    for (const w of r.works) {
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

  const failureDetected = errors.length > 0;
  const budgetLikeError = errors.some((e) => /429|rate.?limit|budget/i.test(e));

  return {
    curated,
    failureDetected,
    budgetLikeError,
    errorMessages: errors.join(" | ").slice(0, 500),
  };
}

/** Step 3c-bis : repli CrossRef + HAL avec triangulation (A.2). */
async function searchWithFallback(
  subQueries: SubQuery[],
  status: OpenAlexSearchStatus,
): Promise<{ curated: CuratedWork[]; fallback: Record<string, unknown> | null }> {
  const shouldFallback =
    status.curated.length === 0 ||
    status.failureDetected;

  if (!shouldFallback) {
    return { curated: status.curated, fallback: null };
  }

  const reason = status.budgetLikeError
    ? "OpenAlex indisponible (budget API épuisé / rate-limit)"
    : status.failureDetected
      ? `OpenAlex indisponible (${status.errorMessages.slice(0, 120)})`
      : "OpenAlex : aucun résultat curé pour ces requêtes";

  console.warn(`[deep-research] ${reason} — bascule automatique vers CrossRef + HAL (triangulation)`);

  const outcome = await fallbackAcademicSearch(subQueries);
  console.warn(`[deep-research] ${fallbackSummary(outcome)}`);

  return {
    curated: outcome.works,
    fallback: {
      triggered: true,
      reason,
      providers: ["CrossRef", "HAL"],
      sourcesCurated: outcome.works.length,
      corroboratedDois: outcome.corroboratedDois,
      crossRefHits: outcome.crossRefHits,
      halHits: outcome.halHits,
      errors: outcome.errors.slice(0, 5),
    },
  };
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
4. Incluse une section "### Sources" à la fin
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

/** Step 5b: Compress findings (mode "academic" — sources curées) */
async function compressAcademicFindings(
  researchBrief: string,
  curatedWorks: CuratedWork[],
  providerConfig?: AiProviderConfig,
  sourceLabel = "OpenAlex",
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
        content: `BRIEF DE RECHERCHE :\n${researchBrief}\n\n--- SOURCES ACADÉMIQUES CURÉES (${sourceLabel}) ---\nScores de curation :\n${curationInfo}\n\nDétail des sources :\n${worksContent}\n\nRÉFÉRENCES :\n${references}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 8000,
    providerConfig,
  });

  return result.content;
}

/** Step 6: Generate final report — mode "web" (A.3 : robuste) */
async function generateWebReport(
  researchBrief: string,
  compressedFindings: string,
  providerConfig?: AiProviderConfig,
): Promise<string> {
  const systemPrompt = `Tu es un chercheur académique expérimenté. Tu rédiges un rapport de recherche approfondi et structuré.

<Règles>
1. Structure le rapport avec des titres (## pour sections, ### pour sous-sections)
2. Inclus des faits spécifiques et des données des sources
3. Cite les sources dans le corps avec leur numéro [n]
4. Analyse de manière équilibrée et exhaustive
5. N'utilise PAS de langage auto-référentiel (ne dis pas "je vais...")
6. Chaque section doit être aussi longue que nécessaire pour répondre en profondeur
7. Utilise des listes à puces quand c'est pertinent
8. Rédige en français académique
</Règles>

<Citation Rules>
- Assigne un numéro unique [n] à chaque source dans le texte
- Termine par une section ### Sources : une ligne par source, au format [n] [Titre de la source](URL)
- Chaque source sur une ligne séparée, avec son URL en lien Markdown
</Citation Rules>

<RÈGLES DE FIN DE RAPPORT — OBLIGATOIRES>
- La section "### Sources" est OBLIGATOIRE en fin de rapport, même si le corps doit être condensé pour la laisser place
- Chaque phrase doit être COMPLÈTE — le rapport ne doit JAMAIS se terminer au milieu d'une phrase ou d'une liste
- Si tu approches de la limite de longueur, clos proprement : conclus, ajoute la section Sources
</RÈGLES DE FIN DE RAPPORT>

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
    maxTokens: 12000,
    providerConfig,
  });

  return result.content;
}

/** Step 6: Generate final report — mode "academic" (A.3 : robuste aussi) */
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

<RÈGLES DE FIN DE SYNTHÈSE — OBLIGATOIRES>
- La section "### Références" est OBLIGATOIRE en fin de synthèse
- Chaque phrase doit être COMPLÈTE — jamais de texte coupé en fin de document
</RÈGLES DE FIN DE SYNTHÈSE>

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
    maxTokens: 12000,
    providerConfig,
  });

  return result.content;
}

// ── Orchestration ───────────────────────────────────────────────

/**
 * Pipeline complet de deep-research. Utilisé par la route /api/deep-research
 * ET par le worker de la file de tâches persistante (A.8).
 */
export async function runDeepResearch(
  input: DeepResearchInput
): Promise<DeepResearchResult> {
  const { prompt, context, providerConfig } = input;
  const sourceMode = input.sourceMode;

  // ── Step 1: Research Brief ──
  const researchBrief = await generateResearchBrief(
    prompt,
    providerConfig,
    context,
  );

  // ── Step 2: Plan Sub-Queries ──
  const subQueries = await planSubQueries(researchBrief, providerConfig, sourceMode);

  // ── Step 3+4+5+6: Branch by source mode ──
  if (sourceMode === "academic") {
    // ── Mode académique : OpenAlex + curation, repli CrossRef+HAL (A.2) ──
    const status = await searchOpenAlexWorks(subQueries);
    const { curated: curatedWorks, fallback } = await searchWithFallback(subQueries, status);

    if (curatedWorks.length === 0) {
      const noSourceMsg = fallback
        ? `Aucune source académique trouvée, y compris via le repli automatique CrossRef + HAL (${(fallback as { reason?: string }).reason}). Essayez de reformuler votre question, ou utilisez le mode Web pour élargir la recherche.`
        : "Aucune source académique pertinente trouvée via OpenAlex. Essayez de reformuler votre question en termes plus spécifiques, ou utilisez le mode Web pour élargir la recherche.";
      return {
        content: noSourceMsg,
        mode: "deep-research",
        sourceMode: "academic",
        steps: { brief: researchBrief, queries: subQueries, curatedSources: 0, fallback },
      };
    }

    const summary = curationSummary(curatedWorks);
    const sourceLabel = fallback ? "repli CrossRef + HAL" : "OpenAlex";
    const compressedFindings = await compressAcademicFindings(
      researchBrief,
      curatedWorks,
      providerConfig,
      sourceLabel,
    );

    let finalReport = await generateAcademicReport(
      researchBrief,
      compressedFindings,
      curatedWorks,
      providerConfig,
    );

    // A.3 (robustesse étendue) : continuation si tronqué + section Références garantie
    finalReport = await continueIfTruncated(
      finalReport,
      researchBrief,
      providerConfig,
      12_000
    );
    const academicSources: ReportSource[] = curatedWorks
      .filter((w) => w.title)
      .map((w) => ({
        label: `${w.authors} (${w.year}). ${w.title}`,
        url: w.doi || w.openAccessUrl || "",
      }));
    const { report: guaranteedReport, mechanism } = await ensureSourcesSection(
      finalReport,
      academicSources,
      "academic",
      providerConfig
    );
    finalReport = guaranteedReport;

    // A.2 : notice visible de repli, sans message d'erreur brut
    if (fallback) {
      const fb = fallback as { reason?: string; corroboratedDois?: number; sourcesCurated?: number };
      const notice = `> **Repli automatique** : ${fb.reason}. La recherche a été menée via CrossRef + HAL avec triangulation des DOI (${fb.sourcesCurated} sources curées, ${fb.corroboratedDois} DOI corroborés par les deux registres). Le rapport ci-dessous repose exclusivement sur ces sources.\n\n`;
      finalReport = notice + finalReport;
    }

    return {
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
        fallback,
        sourcesGuarantee: mechanism,
      },
    };
  }

  // ── Mode web : recherche web + CORE ──
  const [searchResults, corePapers] = await Promise.all([
    executeWebSearches(subQueries),
    searchCorePapers(subQueries),
  ]);

  if (searchResults.length === 0 && corePapers.length === 0) {
    return {
      content:
        "Aucun résultat de recherche trouvé. Veuillez reformuler votre question ou essayer un autre sujet.",
      mode: "deep-research",
      sourceMode: "web",
      steps: { brief: researchBrief, queries: subQueries, sources: 0 },
    };
  }

  const pages = await readTopPages(searchResults, 6);

  const compressedFindings = await compressWebFindings(
    researchBrief,
    pages,
    searchResults,
    corePapers,
    providerConfig,
  );

  let finalReport = await generateWebReport(
    researchBrief,
    compressedFindings,
    providerConfig,
  );

  // ── A.3 : robustesse post-génération ──
  // 1) continuation si le rapport est tronqué (max 2 passes)
  finalReport = await continueIfTruncated(
    finalReport,
    researchBrief,
    providerConfig,
    12_000
  );

  // 2) section Sources garantie : relance automatique, puis ajout déterministe
  //    construit depuis la liste RÉELLE des sources consultées.
  const realSources: ReportSource[] = [
    ...pages.map((p) => ({ label: p.title || p.url, url: p.url })),
    ...corePapers.map((w) => ({
      label: `${w.authors.map((a) => a.name).join(", ")} (${w.yearPublished || "s.d."}). ${w.title}`,
      url: w.doi ? `https://doi.org/${w.doi}` : `https://core.ac.uk/works/${w.id}`,
    })),
    ...searchResults
      .filter((s) => !pages.some((p) => p.url === s.url))
      .slice(0, 5)
      .map((s) => ({ label: s.name || s.host_name, url: s.url })),
  ];

  const { report: guaranteedReport, mechanism } = await ensureSourcesSection(
    finalReport,
    realSources,
    "web",
    providerConfig
  );
  finalReport = guaranteedReport;

  return {
    content: finalReport,
    mode: "deep-research",
    sourceMode: "web",
    steps: {
      brief: researchBrief,
      queriesCount: subQueries.length,
      searchResultsCount: searchResults.length,
      corePapersCount: corePapers.length,
      pagesRead: pages.length,
      sourcesGuarantee: mechanism,
    },
  };
}

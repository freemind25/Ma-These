// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/paper2code/generate
// Streaming 3-stage pipeline: Planning → Analyzing → Coding
// Inspired by Paper2Code (ICLR 2026) — going-doer/paper2code
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import {
  type AiProviderId,
  PROVIDER_BASE_URLS,
} from "@/lib/ai/ai-types";
import { getProviderExtraHeaders } from "@/lib/ai/ai-provider";
import { gatewayFetch } from "@/lib/ai/gateway-fetch";
import { getHardcodedKey } from "@/lib/ai/hardcoded-keys";
import { generateCompletion } from "@/lib/ai/zai-client";
import { getAiConfigFromRequest } from "@/lib/ai/config-cookie";

// ─── Types ───────────────────────────────────────────────

interface GenerateRequest {
  paperText: string;
  provider: AiProviderId;
  model: string;
}

interface PlanResult {
  overview: string;
  file_list: string[];
  class_diagram: string;
  sequence_diagram: string;
  task_descriptions: Record<string, string>;
  config_yaml: string;
  required_packages: string[];
}

// ─── Prompts ─────────────────────────────────────────────

const PLANNING_SYSTEM = `You are an expert ML researcher and Python software architect. Given a research paper, create a comprehensive plan to reproduce its method as a Python codebase.`;

function planningPrompt(paperText: string): string {
  return `Read this research paper and create a detailed reproduction plan.

PAPER:\n${paperText}

Return a JSON object with EXACTLY these fields:
1. "overview" (string): Thorough summary of methodology, architecture, loss functions, datasets, hyperparameters, evaluation metrics, and experimental setup. Extract ALL numerical values from the paper.

2. "file_list" (string[]): Python filenames to create, ordered by dependency (e.g. ["dataset.py", "model.py", "train.py", "evaluate.py", "main.py"]). ALWAYS include a main.py entry point.

3. "class_diagram" (string): Mermaid classDiagram code showing ALL classes with __init__ signatures, public methods with parameters and return types, and relationships (-->, ..>). Use PEP8 naming. Example:\n  classDiagram\n    class DataLoader {\n        +__init__(config: dict)\n        +get_train_loader() DataLoader\n        +get_test_loader() DataLoader\n    }\n    class Model {\n        +__init__(hidden_size: int, num_layers: int)\n        +forward(x: Tensor) Tensor\n    }\n    class Trainer {\n        +__init__(model: Model, config: dict)\n        +train() None\n        +evaluate() dict\n    }\n    Trainer --> Model\n    Trainer --> DataLoader

4. "sequence_diagram" (string): Mermaid sequenceDiagram showing the full program flow from main.py through all components.

5. "task_descriptions" (object): Map each filename to a detailed description of what it should implement, including key algorithms, formulas, and interactions.

6. "config_yaml" (string): A YAML configuration block with ALL hyperparameters and settings explicitly mentioned in the paper (learning rates, batch sizes, epochs, model dimensions, optimizer settings, etc.), PLUS every input the code needs to run once: data paths, entity lists required by the analysis (e.g. cities, datasets, documents), output paths. Use nested structure. Example:\n  model:\n    hidden_size: 256\n    num_layers: 6\n  training:\n    learning_rate: 0.001\n    batch_size: 32\n    epochs: 100\n    optimizer: adam\n  data:\n    input_path: ./data/input.csv\n    output_dir: ./results\n    cities: [Paris, London, New York]

7. "required_packages" (string[]): pip packages needed, with version pins if specified in the paper (e.g. ["torch>=2.0", "numpy", "transformers>=4.30"]).

IMPORTANT RULES:
- Extract EVERY numerical value from the paper (no approximations)
- The classDiagram must be COMPLETE with ALL methods
- file_list must include config.yaml handling in main.py
- Be specific about optimizer, scheduler, loss function names
- config_yaml MUST be runnable as-is: every required field has a plausible, NON-EMPTY example value (no null, no [], no "", no placeholder). The user should be able to run the code right after editing only paths/inputs.
- Return ONLY valid JSON, no markdown fences, no extra text`;
}

const ANALYZING_SYSTEM = `You are an expert ML researcher analyzing a paper to write production-ready Python code. Provide detailed, actionable logic analysis.`;

function analyzingPrompt(plan: PlanResult, filename: string): string {
  const desc = plan.task_descriptions[filename] || filename;
  return `Analyze the file "${filename}" for implementation.

## Paper Summary
${plan.overview}

## Architecture
${plan.class_diagram}

## Task
${desc}

## Configuration
${plan.config_yaml}

Provide a thorough logic analysis for implementing "${filename}":
1. All classes with complete method signatures (params, return types)
2. Key algorithms and mathematical formulas (with LaTeX-style notation)
3. Data structures and their transformations
4. How this file imports/uses other files from: ${plan.file_list.join(", ")}
5. Edge cases, validation, and error handling
6. Specific tensor shapes and dimensions at each step`;
}

const CODING_SYSTEM = `You are an expert Python developer writing production-ready ML code. Write clean, well-documented code following PEP 8 and Google style guidelines.`;

function codingPrompt(
  plan: PlanResult,
  filename: string,
  fileAnalysis: string,
  previousCode: string
): string {
  return `Write complete Python code for: ${filename}

## Paper Summary
${plan.overview}

## Architecture
${plan.class_diagram}

## Configuration (config.yaml)
${plan.config_yaml}

## Logic Analysis for ${filename}
${fileAnalysis}

${previousCode ? `## Previously Generated Files\n${previousCode}` : ""}

STRICT RULES:
1. Write ONLY the file "${filename}". Do NOT write other files.
2. Follow the classDiagram EXACTLY — use the exact class names and method signatures.
3. Import all needed modules at the top. Use relative imports for project files.
4. Set default values for ALL parameters from config.yaml. Use strong typing everywhere.
5. COMPLETE implementation — no TODO, no pass, no "...". Write every line.
6. Use config values from config.yaml via a load_config() helper or argparse defaults.
7. Include docstrings for all classes and public methods.
8. Handle device placement (CPU/GPU) properly with torch.
9. If a required configuration field or input is missing/empty at runtime, raise a ValueError that names the EXACT config.yaml field to edit and gives an example value (e.g. "No cities specified for analysis - add a 'cities:' list of city names to config.yaml, e.g. cities: [Paris, London]").

Output Python code only, no explanation, no markdown fences.`;
}

// ─── Helpers ─────────────────────────────────────────────

// Plafond du texte article envoyé au LLM. La voie de planification est le
// SEUL appel qui porte le texte intégral (analyse/codage travaillent sur le
// plan résumé) — un mémoire/thèse de plusieurs centaines de pages y entre
// sans garde-fou aujourd'hui, et les très gros corps augmentent la
// probabilité de coupure du flux de transport (undici « Error in input
// stream »). 60 000 caractères ≈ 15 000 tokens : largement assez pour
// méthodologie + hyperparamètres + résultats d'un article, tête (abstract,
// intro) et fin (résultats, conclusion) conservées en priorité.
const MAX_PAPER_CHARS = 60_000;

/**
 * Nettoie un texte extrait de PDF avant l'appel LLM :
 * - normalisation NFC (accents composés stables) ;
 * - surrogates UTF-16 isolés → U+FFFD (un surrogate non apparié survit à
 *   JSON.stringify et produit un corps de requête invalide — coupure
 *   « Error in input stream » côté transport) ;
 * - caractères de contrôle C0/C1 hors \n \r \t → espace.
 */
function sanitizePaperText(raw: string): string {
  let s = raw.normalize("NFC");
  s = s.replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    "\uFFFD"
  );
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ");
  return s;
}

/**
 * Plafonne le texte pour l'appel IA : 75 % tête + 25 % queue, marqueur
 * explicite au milieu (l'abstract et les résultats restent visibles).
 */
function capPaperText(s: string, max: number = MAX_PAPER_CHARS): { text: string; truncated: boolean } {
  if (s.length <= max) return { text: s, truncated: false };
  const head = s.slice(0, Math.floor(max * 0.75));
  const tail = s.slice(-Math.floor(max * 0.25));
  const omitted = s.length - head.length - tail.length;
  return {
    text: `${head}\n\n[… document tronqué pour l'appel IA : ${omitted.toLocaleString("fr-FR")} caractères omis au milieu …]\n\n${tail}`,
    truncated: true,
  };
}

// Bornes des sections dérivées du plan / des analyses. Le LLM peut renvoyer
// des champs démesurés (un overview de 40k caractères, un classDiagram de
// 30k…) : sans borne, le corps de la requête d'analyse/codage grossit sans
// limite et déclenche des coupures de transport (« Error in input stream »
// de Bun/undici). Ces plafonds bornent chaque requête à ~60k caractères.
const CAP_PLAN_OVERVIEW = 16_000;
const CAP_PLAN_DIAGRAM = 16_000;
const CAP_PLAN_CONFIG = 8_000;
const CAP_TASK_DESC = 8_000;
const CAP_ANALYSIS = 20_000;
const CAP_PREV_CODE_PER_FILE = 8_000;
const CAP_PREV_CODE_TOTAL = 40_000;

/** Troncature dure d'une section de prompt avec marqueur explicite. */
function capSection(label: string, s: string, max: number): string {
  if (!s || s.length <= max) return s || "";
  const omitted = (s.length - max).toLocaleString("fr-FR");
  return `${s.slice(0, max)}\n\n[… ${label} tronqué : ${omitted} caractères omis …]`;
}

/**
 * Traduit les erreurs brutes de transport en messages actionnables.
 * « Error in input stream » (undici/bun fetch) = coupure du flux de
 * transport vers le fournisseur — transitoire dans la grande majorité
 * des cas, aggravée par les très gros corps de requête.
 */
function translateAiError(msg: string): string {
  if (/input stream/i.test(msg)) {
    return (
      "Le flux IA s'est interrompu pendant l'appel au fournisseur (coupure réseau ou interruption temporaire). " +
      "Les tentatives automatiques ont échoué. Réessayez : si l'erreur revient, réduisez le texte source " +
      "(document très long) ou changez de fournisseur/modèle."
    );
  }
  return msg;
}

/**
 * Appel LLM avec relance visible : au premier échec, l'utilisateur est
 * informé dans la zone de progression puis une 2e tentative est lancée
 * après un court backoff. Les coupures de transport (« Error in input
 * stream », reset TLS, 5xx) sont majoritairement transitoires — une seule
 * relance bien visible suffit et borne le pire cas à 2 × timeout.
 */
async function callLLMResilient(
  label: string,
  systemPrompt: string,
  userMessage: string,
  provider: AiProviderId,
  model: string,
  apiKey: string,
  notify: (message: string) => void,
  restoreProgress: () => void
): Promise<string> {
  try {
    return await callLLM(systemPrompt, userMessage, provider, model, apiKey);
  } catch (firstErr) {
    const firstMsg = translateAiError(firstErr instanceof Error ? firstErr.message : String(firstErr));
    console.warn(`[paper2code/generate] ${label} échouée, relance:`, firstMsg);
    notify(`⚠️ ${label} : ${firstMsg} — nouvelle tentative...`);

    // Disjoncteur ouvert (« trop d'échecs consécutifs… Réessayez dans Xs ») :
    // la relance à +3 s heurterait un circuit encore ouvert et échouerait
    // instantanément sans même essayer — on attend la fin du cooldown
    // (le message du disjoncteur donne le temps restant).
    const waitMatch = /Réessayez dans (\d+)s/.exec(firstErr instanceof Error ? firstErr.message : String(firstErr));
    const backoffMs = waitMatch ? Math.min((parseInt(waitMatch[1], 10) + 2) * 1000, 35_000) : 3_000;
    if (waitMatch) {
      console.warn(`[paper2code/generate] ${label} : circuit ouvert, relance dans ${Math.round(backoffMs / 1000)}s`);
      notify(`⏳ ${label} : fournisseur temporairement en cooldown — relance automatique dans ${Math.round(backoffMs / 1000)} s...`);
    }
    await new Promise((r) => setTimeout(r, backoffMs));
    restoreProgress();
    return await callLLM(systemPrompt, userMessage, provider, model, apiKey);
  }
}

function getApiKey(provider: AiProviderId, userKey?: string): string {
  if (userKey) return userKey;
  // Fournisseur natif z.ai : SDK sandbox sans clé (zai-client) — pas de
  // clé env attendue. Dans l'app Tauri (SDK absent), le message ci-dessous
  // reste honnête : configurer un fournisseur réel.
  if (provider === "zai") return "sdk-sandbox";
  const hardcoded = getHardcodedKey(provider);
  if (hardcoded) return hardcoded;
  throw new Error(`Aucune clé API pour ${provider}. Configurez un fournisseur avec clé.`);
}

async function callLLM(
  systemPrompt: string,
  userMessage: string,
  provider: AiProviderId,
  model: string,
  apiKey: string
): Promise<string> {
  // Fournisseur natif z.ai : SDK sandbox (zai-client, sans clé, circuit
  // breaker). L'app Tauri n'embarque pas le SDK — generateCompletion lèvera
  // une erreur explicite dans ce cas. maxRetriesPerProvider 0 : les
  // reprises sont gérées au niveau du pipeline (callLLMResilient) avec un
  // backoff visible côté utilisateur, sinon un échec de transport peut
  // multiplier silencieusement les appels (3×180 s = 9 min figées).
  if (provider === "zai") {
    const result = await generateCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model,
      temperature: 0.2,
      maxTokens: 16384,
      maxRetriesPerProvider: 0,
      // La planification sur un gros document peut courir 60-90 s : le
      // timeout global du zai-client (60 s) tuerait un appel légitime avec
      // « Délai de la requête IA dépassé ». 3 min pour la voie pipeline.
      timeoutMs: 180_000,
      providerConfig: { provider: "zai", model },
    });
    return result.content;
  }

  const baseUrl = PROVIDER_BASE_URLS[provider];
  if (!baseUrl) throw new Error(`Pas d'URL de base pour ${provider}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  Object.assign(headers, getProviderExtraHeaders(provider));

  const url = `${baseUrl}/chat/completions`;
  const res = await gatewayFetch(provider, url, {
    method: "POST",
    headers,
    // Timeout dur : sans signal, un appel qui pend (hôte qui n'acquitte
    // pas, connexion HS mais ouverte) fige le pipeline INDÉFINIMENT —
    // l'utilisateur voit « Étape 1/6 » immobile pendant que le stade
    // analyse attend un socket mort. 3 min alignées sur la voie z.ai.
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 16384,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LLM error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices?.[0]?.message?.content || "";
}

/** Extract JSON from LLM response (handles markdown fences, [CONTENT] tags, etc.) */
function extractJson(text: string): Record<string, unknown> {
  // Try [CONTENT]...[/CONTENT] extraction (Paper2Code pattern)
  const contentMatch = text.match(/\[CONTENT\]([\s\S]*?)\[\/CONTENT\]/);
  if (contentMatch) {
    try { return JSON.parse(contentMatch[1].trim()); } catch { /* fall through */ }
  }

  // Try ```json ... ``` extraction
  const jsonFence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonFence) {
    try { return JSON.parse(jsonFence[1].trim()); } catch { /* fall through */ }
  }

  // Try direct parse
  try { return JSON.parse(text.trim()); } catch { /* fall through */ }

  // Try to find JSON object in text
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch { /* fall through */ }
  }

  throw new Error("Impossible d'extraire le JSON de la réponse LLM");
}

/** Extract Python code from markdown fences or raw text */
function extractCode(text: string): string {
  // Try ```python ... ``` first
  const pyFence = text.match(/```python\s*([\s\S]*?)```/);
  if (pyFence) return pyFence[1].trim();

  // Try any code fence
  const anyFence = text.match(/```\w*\s*([\s\S]*?)```/);
  if (anyFence) return anyFence[1].trim();

  return text.trim();
}


// ─── Job store (in-memory) ──────────────────────────────────
//
// ARCHITECTURE JOB + POLLING (remplace le flux NDJSON long) :
// la passerelle de prévisualisation (et tout proxy intermédiaire) coupe
// les réponses longues (~50-60 s observé) malgré les heartbeats — le
// frontend perdait la génération en plein travail (« La connexion au
// serveur s'est interrompue »). Désormais :
//   POST   → démarre un job (pipeline en tâche de fond) et renvoie {jobId}
//   GET    → polling : {status, events nouveaux depuis cursor, cursor}
//   DELETE → annulation demandée
// Chaque requête est courte (< 2 s) : plus aucune connexion longue à
// couper. Un redémarrage du serveur perd les jobs (404 → message
// explicite côté client, la génération est relancable).

type JobStatus = "running" | "done" | "error" | "cancelled";

interface GenerateJob {
  id: string;
  status: JobStatus;
  events: Array<Record<string, unknown>>;
  cancelRequested: boolean;
  createdAt: number;
}

const jobs = new Map<string, GenerateJob>();
const JOB_TTL_MS = 2 * 60 * 60 * 1000; // 2 h
const MAX_JOBS = 20;

function pruneJobs(): void {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) jobs.delete(id);
  }
  while (jobs.size > MAX_JOBS) {
    let oldestId: string | null = null;
    let oldestAt = Infinity;
    for (const [id, job] of jobs) {
      if (job.createdAt < oldestAt) {
        oldestAt = job.createdAt;
        oldestId = id;
      }
    }
    if (!oldestId) break;
    jobs.delete(oldestId);
  }
}

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Pipeline (tâche de fond d'un job) ──────────────────────

interface RunArgs {
  job: GenerateJob;
  paperText: string;
  llmPaperText: string;
  paperTruncated: boolean;
  provider: AiProviderId;
  model: string;
  apiKey: string;
}

async function runGenerateJob(args: RunArgs): Promise<void> {
  const { job } = args;
  let callCount = 0;

  function emit(event: Record<string, unknown>): void {
    job.events.push(event);
  }
  function isCancelled(): boolean {
    return job.cancelRequested;
  }

  try {
    // ═══════════════════════════════════════
    // STAGE 1: PLANNING
    // ═══════════════════════════════════════
    emit({
      type: "progress",
      stage: "planning",
      step: 0,
      total: 1,
      message: "📋 Planification en cours...",
    });

    if (args.paperTruncated) {
      emit({
        type: "progress",
        stage: "planning",
        step: 0,
        total: 1,
        message: `📄 Document très long (${args.paperText.length.toLocaleString("fr-FR")} caractères) — texte plafonné à ${MAX_PAPER_CHARS.toLocaleString("fr-FR")} pour l'appel IA (tête + fin conservées).`,
      });
    }

    // La planification est le seul appel fatal du pipeline : les
    // interruptions de transport sont majoritairement transitoires → une
    // relance explicite avec un backoff plus long, sous les yeux de
    // l'utilisateur (les événements sont poussés dans le job, le client
    // les voit au tick de polling suivant).
    let planRaw: string;
    try {
      planRaw = await callLLM(
        PLANNING_SYSTEM,
        planningPrompt(args.llmPaperText),
        args.provider,
        args.model,
        args.apiKey
      );
    } catch (firstErr) {
      if (isCancelled()) { job.status = "cancelled"; return; }
      const firstMsg = translateAiError(firstErr instanceof Error ? firstErr.message : String(firstErr));
      console.warn("[paper2code/generate] planification échouée, relance:", firstMsg);
      emit({
        type: "progress",
        stage: "planning",
        step: 0,
        total: 1,
        message: `⚠️ ${firstMsg} — nouvelle tentative...`,
      });
      await new Promise((r) => setTimeout(r, 4_000));
      if (isCancelled()) { job.status = "cancelled"; return; }
      planRaw = await callLLM(
        PLANNING_SYSTEM,
        planningPrompt(args.llmPaperText),
        args.provider,
        args.model,
        args.apiKey
      );
    }
    callCount++;

    if (isCancelled()) { job.status = "cancelled"; return; }

    let plan: PlanResult;
    try {
      plan = extractJson(planRaw) as unknown as PlanResult;
    } catch {
      emit({ type: "error", message: "Échec de l'extraction du plan JSON. Réessayez." });
      job.status = "error";
      return;
    }

    // Ensure required fields + bornage des sections (un plan démesuré
    // gonfle TOUS les prompts d'analyse/codage qui en dérivent — voir
    // les constantes CAP_*).
    plan.file_list = Array.isArray(plan.file_list) ? plan.file_list : ["main.py"];
    plan.task_descriptions = plan.task_descriptions || {};
    plan.config_yaml = plan.config_yaml || "# Configuration\nmodel:\n  name: default\n";
    plan.required_packages = Array.isArray(plan.required_packages) ? plan.required_packages : [];
    plan.overview = plan.overview || "";
    plan.class_diagram = plan.class_diagram || "";
    plan.sequence_diagram = plan.sequence_diagram || "";
    plan.overview = capSection("résumé", plan.overview, CAP_PLAN_OVERVIEW);
    plan.class_diagram = capSection("diagramme de classes", plan.class_diagram, CAP_PLAN_DIAGRAM);
    plan.sequence_diagram = capSection("diagramme de séquence", plan.sequence_diagram, CAP_PLAN_DIAGRAM);
    plan.config_yaml = capSection("configuration", plan.config_yaml, CAP_PLAN_CONFIG);
    for (const [k, v] of Object.entries(plan.task_descriptions)) {
      plan.task_descriptions[k] = capSection(`description de ${k}`, String(v ?? ""), CAP_TASK_DESC);
    }

    emit({ type: "progress", stage: "planning", step: 1, total: 1, message: "Planification terminée ✓" });
    emit({ type: "result", stage: "planning", data: plan });

    // ═══════════════════════════════════════
    // STAGE 2: ANALYZING
    // ═══════════════════════════════════════
    const codeFiles = plan.file_list.filter((f) => f.endsWith(".py"));
    const totalAnalyze = codeFiles.length;
    const analyses: Record<string, string> = {};

    emit({
      type: "progress",
      stage: "analyzing",
      step: 0,
      total: totalAnalyze,
      message: `🔍 Analyse de ${totalAnalyze} fichiers...`,
    });

    for (let i = 0; i < codeFiles.length; i++) {
      if (isCancelled()) { job.status = "cancelled"; return; }
      const filename = codeFiles[i];
      emit({
        type: "progress",
        stage: "analyzing",
        step: i + 1,
        total: totalAnalyze,
        message: `Analyse de ${filename}...`,
      });

      try {
        const analysis = await callLLMResilient(
          `Analyse de ${filename}`,
          ANALYZING_SYSTEM,
          analyzingPrompt(plan, filename),
          args.provider,
          args.model,
          args.apiKey,
          (m) => emit({ type: "progress", stage: "analyzing", step: i + 1, total: totalAnalyze, message: m }),
          () => emit({ type: "progress", stage: "analyzing", step: i + 1, total: totalAnalyze, message: `Analyse de ${filename}...` })
        );
        callCount++;
        analyses[filename] = analysis;
        emit({ type: "result", stage: "analyzing", file: filename, content: analysis });
      } catch (err) {
        const msg = translateAiError(err instanceof Error ? err.message : String(err));
        analyses[filename] = `[ERREUR] ${msg}`;
        emit({ type: "result", stage: "analyzing", file: filename, content: `[ERREUR] ${msg}` });
        // Visible aussi dans la zone de progression (l'utilisateur ne
        // lit pas forcément l'onglet Analyse) — sans stopper le pipeline.
        emit({
          type: "progress",
          stage: "analyzing",
          step: i + 1,
          total: totalAnalyze,
          message: `⚠️ Analyse de ${filename} échouée (${msg}) — le pipeline continue.`,
        });
      }
    }

    // ═══════════════════════════════════════
    // STAGE 3: CODING
    // ═══════════════════════════════════════
    const codes: Record<string, string> = {};
    const doneFiles: string[] = [];

    emit({
      type: "progress",
      stage: "coding",
      step: 0,
      total: codeFiles.length,
      message: `💻 Génération de ${codeFiles.length} fichiers...`,
    });

    for (let i = 0; i < codeFiles.length; i++) {
      if (isCancelled()) { job.status = "cancelled"; return; }
      const filename = codeFiles[i];
      emit({
        type: "progress",
        stage: "coding",
        step: i + 1,
        total: codeFiles.length,
        message: `Génération de ${filename}...`,
      });

      // Contexte des fichiers déjà générés — chaque fichier plafonné,
      // total plafonné : sans borne, le prompt du dernier fichier porte
      // TOUT le code précédent et le corps de requête explose.
      const prevCodeParts: string[] = [];
      let prevCodeLen = 0;
      for (const f of doneFiles) {
        const body = capSection(`code de ${f}`, codes[f] || "", CAP_PREV_CODE_PER_FILE);
        const block = `### ${f}\n\`\`\`python\n${body}\n\`\`\`\n`;
        if (prevCodeLen + block.length > CAP_PREV_CODE_TOTAL) break;
        prevCodeParts.push(block);
        prevCodeLen += block.length;
      }
      const prevCode = prevCodeParts.join("\n");

      try {
        const raw = await callLLMResilient(
          `Génération de ${filename}`,
          CODING_SYSTEM,
          codingPrompt(
            plan,
            filename,
            capSection(`analyse de ${filename}`, analyses[filename] || "", CAP_ANALYSIS),
            prevCode
          ),
          args.provider,
          args.model,
          args.apiKey,
          (m) => emit({ type: "progress", stage: "coding", step: i + 1, total: codeFiles.length, message: m }),
          () => emit({ type: "progress", stage: "coding", step: i + 1, total: codeFiles.length, message: `Génération de ${filename}...` })
        );
        callCount++;
        const code = extractCode(raw);
        codes[filename] = code;
        doneFiles.push(filename);
        emit({ type: "result", stage: "coding", file: filename, content: code });
      } catch (err) {
        const msg = translateAiError(err instanceof Error ? err.message : String(err));
        codes[filename] = `# Erreur de génération\n# ${msg}`;
        doneFiles.push(filename);
        emit({ type: "result", stage: "coding", file: filename, content: `# Erreur\n${msg}` });
        emit({
          type: "progress",
          stage: "coding",
          step: i + 1,
          total: codeFiles.length,
          message: `⚠️ Génération de ${filename} échouée (${msg}) — le pipeline continue.`,
        });
      }
    }

    // ═══════════════════════════════════════
    // DONE
    // ═══════════════════════════════════════
    emit({
      type: "done",
      stats: {
        files: codeFiles.length,
        calls: callCount,
        plan,
        codes,
        analyses,
      },
    });
    job.status = "done";
  } catch (err) {
    const msg = translateAiError(err instanceof Error ? err.message : String(err));
    emit({ type: "error", message: msg });
    job.status = "error";
  }
}

// ─── Handlers ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Partial<GenerateRequest>;
  try {
    body = (await request.json()) as Partial<GenerateRequest>;
  } catch {
    return jsonResponse({ error: "Corps de requête invalide (JSON attendu)." }, 400);
  }

  // Réglages IA (cookie httpOnly) : fournisseur + modèle + clé utilisateur.
  // Le message d'erreur historique invite à configurer la clé « dans les
  // réglages IA » — cette route doit donc honorer cette clé (sinon seule
  // une clé env fonctionnerait, en contradiction avec le message).
  const cookieConfig = getAiConfigFromRequest(request);
  // Nettoyage AVANT tout (garde < 200 car, prompts, transport) : les textes
  // d'import PDF peuvent contenir des caractères de contrôle ou des
  // surrogates isolés qui cassent le corps JSON de la requête LLM.
  const paperText = sanitizePaperText(body.paperText || "");
  const provider = (body.provider || cookieConfig?.provider || "groq") as AiProviderId;
  const model = body.model || cookieConfig?.model || "llama-3.3-70b-versatile";

  if (paperText.length < 200) {
    return jsonResponse({ error: "Texte de l'article trop court (minimum 200 caractères)." }, 400);
  }

  // A1L3B-01 : l'absence de clé est une configuration manquante, PAS un crash —
  // réponse JSON explicite (503) au lieu d'un 500 corps vide masquant l'erreur.
  let apiKey: string;
  try {
    apiKey = getApiKey(provider, cookieConfig?.apiKey);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse(
      {
        error: `${msg} Aucune clé n'est configurée pour ce fournisseur — configurez-la dans les réglages IA ou le fichier .env du serveur. (Cause externe : configuration, non défaut applicatif.)`,
      },
      503
    );
  }

  pruneJobs();
  const job: GenerateJob = {
    id: crypto.randomUUID(),
    status: "running",
    events: [],
    cancelRequested: false,
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);

  // Texte réellement envoyé au LLM (plafonné) — l'analyse et le codage
  // n'utilisent pas paperText, seul l'appel de planification le porte.
  const { text: llmPaperText, truncated: paperTruncated } = capPaperText(paperText);

  // Tâche de fond : le pipeline vit dans le processus serveur, découplé de
  // la connexion HTTP qui l'a déclenché. Aucune requête longue ne transite
  // par la passerelle — le client suit l'avancement par polling.
  void runGenerateJob({
    job,
    paperText,
    llmPaperText,
    paperTruncated,
    provider,
    model,
    apiKey,
  }).catch((err) => {
    console.error("[paper2code/generate] job crash:", err);
    if (job.status === "running") {
      job.events.push({ type: "error", message: "Erreur interne du pipeline de génération." });
      job.status = "error";
    }
  });

  return jsonResponse({ jobId: job.id }, 200);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId") || "";
  const cursorParam = Number(url.searchParams.get("cursor") || 0);
  const cursor = Number.isFinite(cursorParam) && cursorParam > 0 ? Math.floor(cursorParam) : 0;

  const job = jobs.get(jobId);
  if (!job) {
    return jsonResponse(
      { error: "Tâche de génération introuvable (serveur redémarré ?). Relancez la génération." },
      404
    );
  }

  return jsonResponse(
    {
      status: job.status,
      events: job.events.slice(cursor),
      cursor: job.events.length,
    },
    200
  );
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId") || "";
  const job = jobs.get(jobId);
  if (!job) {
    return jsonResponse({ error: "Tâche introuvable." }, 404);
  }
  // Annulation : le pipeline s'arrête entre deux appels LLM (l'appel en
  // cours, borné par le timeout de 3 min, s'achève mais son résultat est
  // ignoré). Statut passé à « cancelled » immédiatement : le client arrête
  // son polling au tick suivant.
  job.cancelRequested = true;
  if (job.status === "running") job.status = "cancelled";
  return jsonResponse({ ok: true }, 200);
}

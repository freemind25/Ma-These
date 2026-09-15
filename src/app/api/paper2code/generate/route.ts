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
import { getHardcodedKey } from "@/lib/ai/hardcoded-keys";

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

6. "config_yaml" (string): A YAML configuration block with ALL hyperparameters and settings explicitly mentioned in the paper (learning rates, batch sizes, epochs, model dimensions, optimizer settings, etc.). Use nested structure. Example:\n  model:\n    hidden_size: 256\n    num_layers: 6\n  training:\n    learning_rate: 0.001\n    batch_size: 32\n    epochs: 100\n    optimizer: adam

7. "required_packages" (string[]): pip packages needed, with version pins if specified in the paper (e.g. ["torch>=2.0", "numpy", "transformers>=4.30"]).

IMPORTANT RULES:
- Extract EVERY numerical value from the paper (no approximations)
- The classDiagram must be COMPLETE with ALL methods
- file_list must include config.yaml handling in main.py
- Be specific about optimizer, scheduler, loss function names
- Return ONLY valid JSON, no markdown fences, no extra text`;
}

const ANALYZING_SYSTEM = `You are an expert ML researcher analyzing a paper to write production-ready Python code. Provide detailed, actionable logic analysis.`;

function analyzingPrompt(paperText: string, plan: PlanResult, filename: string): string {
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
  paperText: string,
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

Output Python code only, no explanation, no markdown fences.`;
}

// ─── Helpers ─────────────────────────────────────────────

function getApiKey(provider: AiProviderId, userKey?: string): string {
  if (userKey) return userKey;
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
  const baseUrl = PROVIDER_BASE_URLS[provider];
  if (!baseUrl) throw new Error(`Pas d'URL de base pour ${provider}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  Object.assign(headers, getProviderExtraHeaders(provider));

  const url = `${baseUrl}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers,
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

// ─── Main Handler ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<GenerateRequest>;
  const paperText = body.paperText || "";
  const provider = (body.provider || "groq") as AiProviderId;
  const model = body.model || "llama-3.3-70b-versatile";

  if (paperText.length < 200) {
    return new Response(
      JSON.stringify({ error: "Texte de l'article trop court (minimum 200 caractères)." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = getApiKey(provider);

  const encoder = new TextEncoder();
  let callCount = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        // ═══════════════════════════════════════
        // STAGE 1: PLANNING
        // ═══════════════════════════════════════
        send({
          type: "progress",
          stage: "planning",
          step: 0,
          total: 1,
          message: "📋 Planification en cours...",
        });

        const planRaw = await callLLM(
          PLANNING_SYSTEM,
          planningPrompt(paperText),
          provider,
          model,
          apiKey
        );
        callCount++;

        let plan: PlanResult;
        try {
          plan = extractJson(planRaw) as unknown as PlanResult;
        } catch {
          send({ type: "error", message: "Échec de l'extraction du plan JSON. Réessayez." });
          controller.close();
          return;
        }

        // Ensure required fields
        plan.file_list = Array.isArray(plan.file_list) ? plan.file_list : ["main.py"];
        plan.task_descriptions = plan.task_descriptions || {};
        plan.config_yaml = plan.config_yaml || "# Configuration\nmodel:\n  name: default\n";
        plan.required_packages = Array.isArray(plan.required_packages) ? plan.required_packages : [];
        plan.overview = plan.overview || "";
        plan.class_diagram = plan.class_diagram || "";
        plan.sequence_diagram = plan.sequence_diagram || "";

        send({ type: "progress", stage: "planning", step: 1, total: 1, message: "Planification terminée ✓" });
        send({ type: "result", stage: "planning", data: plan });

        // ═══════════════════════════════════════
        // STAGE 2: ANALYZING
        // ═══════════════════════════════════════
        const codeFiles = plan.file_list.filter((f) => f.endsWith(".py"));
        const totalAnalyze = codeFiles.length;
        const analyses: Record<string, string> = {};

        send({
          type: "progress",
          stage: "analyzing",
          step: 0,
          total: totalAnalyze,
          message: `🔍 Analyse de ${totalAnalyze} fichiers...`,
        });

        for (let i = 0; i < codeFiles.length; i++) {
          const filename = codeFiles[i];
          send({
            type: "progress",
            stage: "analyzing",
            step: i + 1,
            total: totalAnalyze,
            message: `Analyse de ${filename}...`,
          });

          try {
            const analysis = await callLLM(
              ANALYZING_SYSTEM,
              analyzingPrompt(paperText, plan, filename),
              provider,
              model,
              apiKey
            );
            callCount++;
            analyses[filename] = analysis;
            send({ type: "result", stage: "analyzing", file: filename, content: analysis });
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            analyses[filename] = `[ERREUR] ${msg}`;
            send({ type: "result", stage: "analyzing", file: filename, content: `[ERREUR] ${msg}` });
          }
        }

        // ═══════════════════════════════════════
        // STAGE 3: CODING
        // ═══════════════════════════════════════
        const codes: Record<string, string> = {};
        const doneFiles: string[] = [];

        send({
          type: "progress",
          stage: "coding",
          step: 0,
          total: codeFiles.length,
          message: `💻 Génération de ${codeFiles.length} fichiers...`,
        });

        for (let i = 0; i < codeFiles.length; i++) {
          const filename = codeFiles[i];
          send({
            type: "progress",
            stage: "coding",
            step: i + 1,
            total: codeFiles.length,
            message: `Génération de ${filename}...`,
          });

          // Build context of previously generated code
          const prevCode = doneFiles
            .map((f) => `### ${f}\n\`\`\`python\n${codes[f]}\n\`\`\`\n`)
            .join("\n");

          try {
            const raw = await callLLM(
              CODING_SYSTEM,
              codingPrompt(paperText, plan, filename, analyses[filename] || "", prevCode),
              provider,
              model,
              apiKey
            );
            callCount++;
            const code = extractCode(raw);
            codes[filename] = code;
            doneFiles.push(filename);
            send({ type: "result", stage: "coding", file: filename, content: code });
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            codes[filename] = `# Erreur de génération\n# ${msg}`;
            doneFiles.push(filename);
            send({ type: "result", stage: "coding", file: filename, content: `# Erreur\n${msg}` });
          }
        }

        // ═══════════════════════════════════════
        // DONE
        // ═══════════════════════════════════════
        send({
          type: "done",
          stats: {
            files: codeFiles.length,
            calls: callCount,
            plan,
            codes,
            analyses,
          },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ type: "error", message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

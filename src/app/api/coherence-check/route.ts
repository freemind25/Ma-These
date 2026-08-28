import { NextRequest, NextResponse } from "next/server";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";
import { getKnowledgeCore } from "@/lib/ai/knowledge-core";
import { COHERENCE_CHECKS } from "@/lib/data/coherence-data";
import { z } from "zod/v4";

// ═══════════════════════════════════════════════════════════════
// POST /api/coherence-check — AI-powered thesis coherence analysis
// ═══════════════════════════════════════════════════════════════

const coherenceSchema = z.object({
  mode: z.string(),
  sections: z.record(z.string(), z.string().min(20, "Chaque section doit contenir au moins 20 caract\u00e8res")),
  focusedChecks: z.array(z.string()).optional(),
  _aiConfig: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = coherenceSchema.parse(body);

    const providerConfig = validated._aiConfig as AiProviderConfig | undefined;
    const { mode, sections, focusedChecks } = validated;

    const systemPrompt = buildSystemPrompt(mode, focusedChecks);
    const userPrompt = buildUserPrompt(mode, sections);

    const messages: AiMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const result = await generateCompletion({
      messages,
      temperature: 0.15,
      maxTokens: 6000,
      providerConfig,
    });

    let parsed;
    try {
      const raw = result.content.trim();
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
      parsed = JSON.parse(jsonMatch[1] || raw);
    } catch {
      return NextResponse.json({
        error: "La r\u00e9ponse de l\u2019IA n\u2019a pas pu \u00eatre interpr\u00e9t\u00e9e. R\u00e9essayez.",
        raw: result.content,
      });
    }

    const enriched = enrichResults(parsed, focusedChecks);
    return NextResponse.json({ data: enriched });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donn\u00e9es invalides", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/coherence-check] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de l\u2019analyse.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// Prompt builders
// ═══════════════════════════════════════════════════════════════

function buildSystemPrompt(mode: string, focusedChecks?: string[]): string {
  let checksToInclude = COHERENCE_CHECKS;

  if (focusedChecks && focusedChecks.length > 0) {
    checksToInclude = COHERENCE_CHECKS.filter((c) => focusedChecks.includes(c.id));
  }

  if (mode === "intro-discussion") {
    checksToInclude = checksToInclude.filter(
      (c) =>
        c.category === "intro-discussion" ||
        c.category === "argumentative" ||
        c.category === "referentielle"
    );
  } else if (mode === "methodo-resultats") {
    checksToInclude = checksToInclude.filter(
      (c) =>
        c.category === "numerique" ||
        c.category === "argumentative" ||
        c.category === "structurelle"
    );
  }

  const checksList = checksToInclude
    .map((c) => `  - [${c.id}] ${c.label} (${c.severity}) : ${c.description}`)
    .join("\n");

  const jsonFormat =
    '{\n' +
    '  "checks": [\n' +
    '    {\n' +
    '      "id": "identifiant-du-controle",\n' +
    '      "pass": false,\n' +
    '      "severity": "critical",\n' +
    '      "message": "Explication courte du probl\u00e8me d\u00e9tect\u00e9 (ou Aucun probl\u00e8me si pass=true)",\n' +
    '      "excerpt": "Extrait exact du texte probl\u00e9matique (max 200 car.)",\n' +
    '      "suggestion": "Conseil concret pour corriger (max 200 car.)"\n' +
    '    }\n' +
    '  ],\n' +
    '  "global_score": 78,\n' +
    '  "summary": "R\u00e9sum\u00e9 global en 2-3 phrases",\n' +
    '  "truthmark": true,\n' +
    '  "truthmark_message": "Message : le sceau est accord\u00e9 ou refus\u00e9",\n' +
    '  "strengths": ["force 1", "force 2"],\n' +
    '  "recommendations": ["recommandation 1", "recommandation 2"]\n' +
    '}';

  // Option B : le savoir vient du knowledge-core, le format de sortie reste dans la route
  const knowledgeBase = getKnowledgeCore(["coherence"]);

  return (
    "Tu es un expert en r\u00e9daction acad\u00e9mique sp\u00e9cialis\u00e9 dans la v\u00e9rification de coh\u00e9rence des th\u00e8ses de doctorat. " +
    "Tu agis comme un \u00ab sceau de v\u00e9rit\u00e9 \u00bb (truthmark) qui certifie la coh\u00e9rence interne d\u2019un manuscrit.\n\n" +
    "Savoir de r\u00e9f\u00e9rence (knowledge-core) :\n" +
    "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n" +
    knowledgeBase +
    "\n\nGrille de contr\u00f4le structur\u00e9e (les cat\u00e9gories ci-dessous d\u00e9rivent des principes du noyau) :\n\n" +
    checksList +
    "\n\nPour chaque contr\u00f4le, \u00e9value si un probl\u00e8me est d\u00e9tect\u00e9 ou non. " +
    "Si un probl\u00e8me est d\u00e9tect\u00e9, fournis un extrait du texte probl\u00e9matique et une suggestion de correction. " +
    "Appuie ton analyse sur les crit\u00e8res du savoir de r\u00e9f\u00e9rence ci-dessus.\n\n" +
    "R\u00e9ponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires. Format exact :\n" +
    jsonFormat +
    "\n\nR\u00e8gles d\u2019\u00e9valuation :\n" +
    "- \"pass\": true si le contr\u00f4le est r\u00e9ussi (pas de probl\u00e8me), false si un probl\u00e8me est d\u00e9tect\u00e9\n" +
    "- \"severity\": \"ok\" si pass=true, sinon \"critical\"/\"major\"/\"minor\" selon la gravit\u00e9\n" +
    "- \"global_score\": note globale de coh\u00e9rence de 0 \u00e0 100\n" +
    "- \"truthmark\": true si global_score >= 70, false sinon\n" +
    "- Ne PAS inventer des probl\u00e8mes : si le texte est coh\u00e9rent, indique pass=true\n" +
    "- Analysez TOUS les contr\u00f4les list\u00e9s ci-dessus"
  );
}

function buildUserPrompt(mode: string, sections: Record<string, string>): string {
  const sectionLabels: Record<string, string> = {
    introduction: "INTRODUCTION",
    discussion: "DISCUSSION",
    conclusion: "CONCLUSION",
    methodologie: "M\u00c9THODOLOGIE",
    resultats: "R\u00c9SULTATS",
  };

  const sectionsText = Object.entries(sections)
    .map(([key, value]) => `[${sectionLabels[key] || key.toUpperCase()}]\n${value}`)
    .join("\n\n---\n\n");

  if (mode === "global") {
    return (
      "Voici le texte \u00e0 analyser (plusieurs sections d\u2019une th\u00e8se) :\n\n---\n" +
      sectionsText +
      "\n---\n\nAnalyse la coh\u00e9rence interne de ce texte selon les contr\u00f4les demand\u00e9s. R\u00e9ponds en JSON valide."
    );
  }

  const modeDescriptions: Record<string, string> = {
    "intro-discussion":
      "V\u00e9rification crois\u00e9e entre l\u2019INTRODUCTION et la DISCUSSION. " +
      "V\u00e9rifie que chaque question/hypoth\u00e8se de l\u2019intro re\u00e7oit une r\u00e9ponse explicite dans la discussion. " +
      "Identifie les questions orphelines, les r\u00e9sultats orphelins, et la structure en entonnoir.",
    "methodo-resultats":
      "V\u00e9rification crois\u00e9e entre la M\u00c9THODOLOGIE et les R\u00c9SULTATS. " +
      "V\u00e9rifie que les m\u00e9thodes annonc\u00e9es correspondent aux analyses pr\u00e9sent\u00e9es, " +
      "que les chiffres sont coh\u00e9rents, et que les donn\u00e9es rapport\u00e9es sont compatibles avec l\u2019\u00e9chantillon d\u00e9crit.",
    "trio-complet":
      "V\u00e9rification compl\u00e8te crois\u00e9e entre l\u2019INTRODUCTION, les R\u00c9SULTATS et la DISCUSSION. " +
      "V\u00e9rifie l\u2019alignement int\u00e9gral : questions \u2192 m\u00e9thodes \u2192 r\u00e9sultats \u2192 discussion \u2192 conclusion.",
  };

  const desc = modeDescriptions[mode] || "Analyse de coh\u00e9rence.";

  return (
    desc +
    "\n\n---\n" +
    sectionsText +
    "\n---\n\nAnalyse la coh\u00e9rence selon les contr\u00f4les demand\u00e9s. R\u00e9ponds en JSON valide."
  );
}

// ═══════════════════════════════════════════════════════════════
// Result enrichment
// ═══════════════════════════════════════════════════════════════

interface EnrichedCheck {
  id: string;
  pass: boolean;
  severity: string;
  message: string;
  excerpt?: string;
  suggestion?: string;
  label?: string;
  category?: string;
  description?: string;
}

interface EnrichedResult {
  checks: EnrichedCheck[];
  global_score: number;
  summary: string;
  truthmark: boolean;
  truthmark_message: string;
  strengths: string[];
  recommendations: string[];
  categoryScores: Record<string, { passed: number; total: number; score: number }>;
}

function enrichResults(
  parsed: Record<string, unknown>,
  _focusedChecks?: string[]
): EnrichedResult {
  const rawChecks = (parsed.checks || []) as Array<Record<string, unknown>>;

  const checks: EnrichedCheck[] = rawChecks.map((c) => {
    const checkDef = COHERENCE_CHECKS.find((def) => def.id === c.id);
    const pass = !!c.pass;
    return {
      id: String(c.id || "unknown"),
      pass,
      severity: pass
        ? "ok"
        : String(c.severity || checkDef?.severity || "minor"),
      message: String(c.message || ""),
      excerpt: c.excerpt ? String(c.excerpt) : undefined,
      suggestion: c.suggestion ? String(c.suggestion) : undefined,
      label: checkDef?.label || String(c.id),
      category: checkDef?.category || "",
      description: checkDef?.description || "",
    };
  });

  const categoryScores: Record<string, { passed: number; total: number; score: number }> = {};
  for (const check of checks) {
    const cat = check.category || "other";
    if (!categoryScores[cat]) {
      categoryScores[cat] = { passed: 0, total: 0, score: 0 };
    }
    categoryScores[cat].total++;
    if (check.pass) categoryScores[cat].passed++;
  }
  for (const cat of Object.keys(categoryScores)) {
    const { passed, total } = categoryScores[cat];
    categoryScores[cat].score = total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  const globalScore = Math.min(100, Math.max(0, Math.round(Number(parsed.global_score) || 0)));

  return {
    checks,
    global_score: globalScore,
    summary: String(parsed.summary || ""),
    truthmark: globalScore >= 70,
    truthmark_message: String(
      parsed.truthmark_message ||
        (globalScore >= 70
          ? "Sceau de coh\u00e9rence accord\u00e9 : votre texte pr\u00e9sente un bon niveau de coh\u00e9rence interne."
          : "Sceau de coh\u00e9rence refus\u00e9 : des incoh\u00e9rences significatives ont \u00e9t\u00e9 d\u00e9tect\u00e9es.")
    ),
    strengths: (parsed.strengths || []) as string[],
    recommendations: (parsed.recommendations || []) as string[],
    categoryScores,
  };
}

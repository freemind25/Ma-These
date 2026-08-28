import { NextRequest, NextResponse } from "next/server";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";
import { COHERENCE_CHECK_PROMPT, COHERENCE_AUDIT_PROMPT } from "@/lib/ai/specializations/coherence";
import { COHERENCE_CHECKS } from "@/lib/data/coherence-data";
import { z } from "zod/v4";

// ═══════════════════════════════════════════════════════════════
// POST /api/coherence-check — AI-powered thesis coherence analysis
// Pattern Multi-Agent Counter-Audit (version C : 2 passes)
//   Passe 1 : analyse complète (spécialisation + grille + texte)
//   Passe 2 : contre-audit adversarial (uniquement verdicts EN DÉFAUT)
// Spécialisation : src/lib/ai/specializations/coherence.ts
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

    // ── Passe 1 : analyse compl\u00e8te ──────────────────────────────
    const passe1System = buildPasse1SystemPrompt(mode, focusedChecks);
    const userPrompt = buildUserPrompt(mode, sections);

    const messages: AiMessage[] = [
      { role: "system", content: passe1System },
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
        error: "La r\u00e9ponse de l'IA n'a pas pu \u00eatre interpr\u00e9t\u00e9e. R\u00e9essayez.",
        raw: result.content,
      });
    }

    // ── Passe 2 : contre-audit adversarial ──────────────────────
    const failedChecks = ((parsed.checks || []) as Array<Record<string, unknown>>)
      .filter((c) => c.pass === false || c.pass === 'false');

    let auditResults: AuditVerdict[] = [];
    if (failedChecks.length > 0) {
      auditResults = await runCounterAudit(failedChecks, providerConfig);
    }

    // ── Enrichissement + fusion audit ───────────────────────────
    const enriched = enrichResults(parsed, focusedChecks, auditResults);

    // ── \u00c9tape 3 : logging pour mesure ───────────────────────────
    logAuditMetrics(mode, failedChecks.length, auditResults);

    return NextResponse.json({ data: enriched });
  } catch (zodError) {
    if (zodError instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donn\u00e9es invalides", details: zodError.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/coherence-check] Error:", zodError);
    const message =
      zodError instanceof Error ? zodError.message : "Erreur lors de l'analyse.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// Passe 1 : prompt builder (sp\u00e9cialisation + grille mode-d\u00e9pendante)
// ═══════════════════════════════════════════════════════════════

function buildPasse1SystemPrompt(mode: string, focusedChecks?: string[]): string {
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

  // La sp\u00e9cialisation COHERENCE_CHECK_PROMPT contient le r\u00f4le + format JSON.
  // On y append la grille de contr\u00f4les (Option B : grille dans la route).
  return (
    COHERENCE_CHECK_PROMPT +
    "\n\nGrille de contr\u00f4les structur\u00e9e (les cat\u00e9gories ci-dessous d\u00e9rivent des principes du noyau) :\n\n" +
    checksList
  );
}

// ═══════════════════════════════════════════════════════════════
// Passe 2 : contre-audit adversarial
// ═══════════════════════════════════════════════════════════════

interface AuditVerdict {
  checkId: string;
  verdict: 'CONFIRMED' | 'AMBIGU';
  reason: string;
}

async function runCounterAudit(
  failedChecks: Array<Record<string, unknown>>,
  providerConfig?: AiProviderConfig
): Promise<AuditVerdict[]> {
  // Construire le payload pour l'auditeur : uniquement les verdicts EN D\u00c9FAUT + extraits
  const checksPayload = failedChecks
    .map((c) => ({
      id: String(c.id || 'unknown'),
      message: String(c.message || ''),
      excerpt: c.excerpt ? String(c.excerpt) : '',
      severity: String(c.severity || 'unknown'),
    }))
    .map((c) =>
      `  { "id": "${c.id}", "message": ${JSON.stringify(c.message)}, "excerpt": ${JSON.stringify(c.excerpt)}, "severity": "${c.severity}" }`
    )
    .join(',\n');

  const auditUserPrompt =
    `Verdicts EN D\u00c9FAUT \u00e0 auditer :\n[\n${checksPayload}\n]\n\n` +
    `Pour chaque verdict, indique CONFIRMED ou AMBIGU avec justification si AMBIGU.`;

  try {
    const auditResult = await generateCompletion({
      messages: [
        { role: 'system', content: COHERENCE_AUDIT_PROMPT },
        { role: 'user', content: auditUserPrompt },
      ],
      temperature: 0.15,
      maxTokens: 2000,
      providerConfig,
    });

    const raw = auditResult.content.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    const parsed = JSON.parse(jsonMatch[1] || raw);
    const audits: AuditVerdict[] = (parsed.audits || []).map((a: Record<string, unknown>) => ({
      checkId: String(a.checkId || ''),
      verdict: (a.verdict === 'AMBIGU' ? 'AMBIGU' : 'CONFIRMED') as 'CONFIRMED' | 'AMBIGU',
      reason: String(a.reason || ''),
    }));

    return audits;
  } catch (error) {
    // Si le contre-audit \u00e9choue, on retourne un audit vide (passe 1 seule)
    console.warn('[coherence-audit] Counter-audit failed, using passe 1 only:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// \u00c9tape 3 : logging pour mesure pr\u00e9alable
// ═══════════════════════════════════════════════════════════════

function logAuditMetrics(
  mode: string,
  totalFailed: number,
  audits: AuditVerdict[]
): void {
  if (totalFailed === 0 || audits.length === 0) return;

  const confirmed = audits.filter((a) => a.verdict === 'CONFIRMED').length;
  const downgraded = audits.filter((a) => a.verdict === 'AMBIGU').length;
  const rate = audits.length > 0 ? Math.round((downgraded / audits.length) * 100) : 0;

  // Structured log \u2014 collectable pour analyse ult\u00e9rieure
  console.log(
    `[coherence-audit] mode=${mode} failed=${totalFailed} confirmed=${confirmed} downgraded=${downgraded} rate=${rate}%`
  );

  // Log d\u00e9taill\u00e9 des r\u00e9trogradations (pour diagnostic)
  for (const a of audits) {
    if (a.verdict === 'AMBIGU') {
      console.log(`  [downgraded] ${a.checkId}: ${a.reason}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// User prompt builder (inchang\u00e9)
// ═══════════════════════════════════════════════════════════════

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
      "Voici le texte \u00e0 analyser (plusieurs sections d'une th\u00e8se) :\n\n---\n" +
      sectionsText +
      "\n---\n\nAnalyse la coh\u00e9rence interne de ce texte selon les contr\u00f4les demand\u00e9s. R\u00e9ponds en JSON valide."
    );
  }

  const modeDescriptions: Record<string, string> = {
    "intro-discussion":
      "V\u00e9rification crois\u00e9e entre l'INTRODUCTION et la DISCUSSION. " +
      "V\u00e9rifie que chaque question/hypoth\u00e8se de l'intro re\u00e7oit une r\u00e9ponse explicite dans la discussion. " +
      "Identifie les questions orphelines, les r\u00e9sultats orphelins, et la structure en entonnoir.",
    "methodo-resultats":
      "V\u00e9rification crois\u00e9e entre la M\u00c9THODOLOGIE et les R\u00c9SULTATS. " +
      "V\u00e9rifie que les m\u00e9thodes annonc\u00e9es correspondent aux analyses pr\u00e9sent\u00e9es, " +
      "que les chiffres sont coh\u00e9rents, et que les donn\u00e9es rapport\u00e9es sont compatibles avec l'\u00e9chantillon d\u00e9crit.",
    "trio-complet":
      "V\u00e9rification compl\u00e8te crois\u00e9e entre l'INTRODUCTION, les R\u00c9SULTATS et la DISCUSSION. " +
      "V\u00e9rifie l'alignement int\u00e9gral : questions \u2192 m\u00e9thodes \u2192 r\u00e9sultats \u2192 discussion \u2192 conclusion.",
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
// Result enrichment (\u00e9tendu avec audit)
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
  /** Verdict du contre-audit : 'CONFIRMED' | 'AMBIGU' | undefined (pas audit\u00e9) */
  auditVerdict?: 'CONFIRMED' | 'AMBIGU';
  /** Justification de r\u00e9trogradation (si AMBIGU) */
  auditReason?: string;
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
  /** R\u00e9sultats du contre-audit adversarial (passe 2) */
  audit: AuditVerdict[];
  /** Taux de r\u00e9trogradation (pour mesure \u00c9tape 3) */
  auditMetrics?: { totalFailed: number; confirmed: number; downgraded: number; rate: number };
}

function enrichResults(
  parsed: Record<string, unknown>,
  _focusedChecks: string[] | undefined,
  auditResults: AuditVerdict[]
): EnrichedResult {
  const rawChecks = (parsed.checks || []) as Array<Record<string, unknown>>;

  // Build audit lookup
  const auditMap = new Map<string, AuditVerdict>();
  for (const a of auditResults) {
    auditMap.set(a.checkId, a);
  }

  const checks: EnrichedCheck[] = rawChecks.map((c) => {
    const checkDef = COHERENCE_CHECKS.find((def) => def.id === c.id);
    const pass = !!c.pass;
    const audit = auditMap.get(String(c.id));

    // Si l'audit a r\u00e9trograd\u00e9 \u00e0 AMBIGU, le check est trait\u00e9 comme ambigu
    // (ne compte pas comme \u00e9chec pour le scoring)
    const isAmbigu = audit?.verdict === 'AMBIGU';

    return {
      id: String(c.id || 'unknown'),
      pass,
      severity: isAmbigu
        ? 'ambiguous'
        : pass
          ? 'ok'
          : String(c.severity || checkDef?.severity || 'minor'),
      message: String(c.message || ''),
      excerpt: c.excerpt ? String(c.excerpt) : undefined,
      suggestion: c.suggestion ? String(c.suggestion) : undefined,
      label: checkDef?.label || String(c.id),
      category: checkDef?.category || '',
      description: checkDef?.description || '',
      auditVerdict: audit?.verdict,
      auditReason: audit?.reason,
    };
  });

  // Scores par cat\u00e9gorie (les checks AMBIGU ne comptent pas comme \u00e9checs)
  const categoryScores: Record<string, { passed: number; total: number; score: number }> = {};
  for (const check of checks) {
    const cat = check.category || 'other';
    if (!categoryScores[cat]) {
      categoryScores[cat] = { passed: 0, total: 0, score: 0 };
    }
    categoryScores[cat].total++;
    if (check.pass || check.severity === 'ambiguous') categoryScores[cat].passed++;
  }
  for (const cat of Object.keys(categoryScores)) {
    const { passed, total } = categoryScores[cat];
    categoryScores[cat].score = total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  const globalScore = Math.min(100, Math.max(0, Math.round(Number(parsed.global_score) || 0)));

  // Audit metrics
  const totalFailed = auditResults.length;
  const confirmed = auditResults.filter((a) => a.verdict === 'CONFIRMED').length;
  const downgraded = auditResults.filter((a) => a.verdict === 'AMBIGU').length;
  const rate = totalFailed > 0 ? Math.round((downgraded / totalFailed) * 100) : 0;

  return {
    checks,
    global_score: globalScore,
    summary: String(parsed.summary || ''),
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
    audit: auditResults,
    auditMetrics: { totalFailed, confirmed, downgraded, rate },
  };
}

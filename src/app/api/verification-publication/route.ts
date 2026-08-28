import { NextRequest, NextResponse } from "next/server";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";
import { getKnowledgeCore } from "@/lib/ai/knowledge-core";

// ═══════════════════════════════════════════════════════════════════
// POST /api/verification-publication
// Publication-specific verification features (rule-based + LLM hybrid)
// ═══════════════════════════════════════════════════════════════════

type ActionId =
  | "intro-discussion-coherence"
  | "table-quality"
  | "paragraph-structure"
  | "text-table-redundancy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action || typeof action !== "string") {
      return NextResponse.json(
        { error: "Le paramètre 'action' est requis." },
        { status: 400 }
      );
    }

    const providerConfig = body._aiConfig as AiProviderConfig | undefined;

    switch (action as ActionId) {
      case "intro-discussion-coherence":
        return handleIntroDiscussionCoherence(body, providerConfig);
      case "table-quality":
        return handleTableQuality(body, providerConfig);
      case "paragraph-structure":
        return handleParagraphStructure(body, providerConfig);
      case "text-table-redundancy":
        return handleTextTableRedundancy(body, providerConfig);
      default:
        return NextResponse.json(
          { error: `Action « ${action} » non reconnue.` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[POST /api/verification-publication] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la vérification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════
// Action 1: intro-discussion-coherence
// ═══════════════════════════════════════════════════════════════════

async function handleIntroDiscussionCoherence(
  body: {
    introductionText: string;
    discussionText: string;
  },
  providerConfig?: AiProviderConfig
) {
  const { introductionText, discussionText } = body;

   if (!introductionText || !discussionText) {
    return NextResponse.json(
      { error: "Les champs 'introductionText' et 'discussionText' sont requis." },
      { status: 400 }
    );
  }

  const criteria = getKnowledgeCore(['coherence', 'publication']);

  const systemPrompt = `${criteria}

Tu es un expert en rédaction scientifique académique. Tu analyses la cohérence entre l'introduction et la discussion d'un article de recherche.

Ta tâche :
1. Extraire TOUTES les questions de recherche et/ou hypothèses formulées dans l'introduction.
2. Pour chaque question/hypothèse, vérifier si la discussion y répond EXPLICITEMENT (cf. critères de cohérence intro/discussion ci-dessus).
3. Identifier les résultats « orphelins » dans la discussion : des résultats mentionnés qui ne sont reliés à AUCUNE question de l'introduction.
4. Évaluer la structure en entonnoir inversé de la discussion (résultats spécifiques → implications plus larges).

Tu dois répondre UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires. Format :
{
  "questions": [
    {
      "question": "...la question ou hypothèse exacte...",
      "answered": true/false,
      "evidence": "...citation courte de la discussion qui répond (ou explication si non répondu)..."
    }
  ],
  "orphanResults": ["...description de chaque résultat orphelin..."],
  "funnelStructure": {
    "score": 0-10,
    "comment": "...explication de la structure identifiée..."
  },
  "overallCoherence": 0-10
}`;

  const userPrompt = `Voici l'INTRODUCTION de l'article :
---
${introductionText}
---

Voici la DISCUSSION de l'article :
---
${discussionText}
---

Analyse la cohérence entre ces deux sections selon les 4 points demandés. Réponds en JSON valide.`;

  const messages: AiMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let result: Awaited<ReturnType<typeof generateCompletion>>;
  try {
    result = await generateCompletion({
      messages,
      temperature: 0.2,
      maxTokens: 4096,
      providerConfig,
    });
  } catch (aiError) {
    const msg = aiError instanceof Error ? aiError.message : "Erreur lors de l'appel à l'IA.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Parse the LLM JSON response
  let parsed;
  try {
    const raw = result.content.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    parsed = JSON.parse(jsonMatch[1] || raw);
  } catch {
    return NextResponse.json({
      error: "La réponse de l'IA n'a pas pu être interprétée. Réessayez.",
      raw: result.content,
    });
  }

  return NextResponse.json({ data: parsed });
}

// ═══════════════════════════════════════════════════════════════════
// Action 2: table-quality (rule-based + LLM hybrid)
// ═══════════════════════════════════════════════════════════════════

interface TableSignal {
  signalId: string;
  label: string;
  detected: boolean;
  detail: string;
}

/**
 * Parse table text into rows and columns.
 * Handles markdown tables (| col | col |), tab-separated, and CSV-like formats.
 */
function parseTable(tableData: string): string[][] {
  const lines = tableData
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Detect separator
  const firstLine = lines[0];
  let separator = "|";
  if (firstLine.includes("\t")) {
    separator = "\t";
  } else if (!firstLine.includes("|")) {
    separator = ",";
  }

  // Skip markdown separator rows (e.g. |---|---|)
  const rows: string[][] = [];
  for (const line of lines) {
    // Skip separator-only rows
    if (/^[|\t,\s]*[-:]+[|\t,\s]*[-:]*/.test(line)) continue;

    let cells: string[];
    if (separator === "|") {
      cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
    } else {
      cells = line
        .split(separator)
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

/**
 * Signal 1: Detect columns where >70% of values are identical.
 */
function checkIdenticalColumns(rows: string[][]): TableSignal {
  if (rows.length < 2) {
    return {
      signalId: "signal-1",
      label: "Colonnes remplies de valeurs identiques",
      detected: false,
      detail: "Tableau trop petit pour cette analyse.",
    };
  }

  const numCols = Math.max(...rows.map((r) => r.length));
  const flaggedColumns: number[] = [];

  for (let col = 0; col < numCols; col++) {
    // Skip header row (first row)
    const values = rows
      .slice(1)
      .map((r) => (col < r.length ? r[col].trim() : ""))
      .filter((v) => v.length > 0);

    if (values.length === 0) continue;

    // Count frequency of each value
    const freq: Record<string, number> = {};
    for (const v of values) {
      freq[v] = (freq[v] || 0) + 1;
    }

    // Find the most common value
    const maxFreq = Math.max(...Object.values(freq));
    const ratio = maxFreq / values.length;

    if (ratio > 0.7) {
      flaggedColumns.push(col + 1);
    }
  }

  if (flaggedColumns.length > 0) {
    return {
      signalId: "signal-1",
      label: "Colonnes remplies de valeurs identiques",
      detected: true,
      detail: `Colonnes ${flaggedColumns.join(", ")} contiennent plus de 70 % de valeurs identiques. Cette information pourrait être résumée en une phrase.`,
    };
  }

  return {
    signalId: "signal-1",
    label: "Colonnes remplies de valeurs identiques",
    detected: false,
    detail: "Aucune colonne ne présente une dominance de valeurs identiques (>70 %).",
  };
}

/**
 * Signal 2: Detect if >70% of data cells are binary symbols (+, -, +/-).
 */
function checkBinarySymbols(rows: string[][]): TableSignal {
  // Exclude header row
  const dataRows = rows.slice(1);
  if (dataRows.length === 0) {
    return {
      signalId: "signal-2",
      label: "Symboles binaires répétés",
      detected: false,
      detail: "Aucune donnée à analyser.",
    };
  }

  const binaryPattern = /^[+\-]{1,3}$/; // matches +, -, +/-, +-, -/+
  let totalCells = 0;
  let binaryCells = 0;

  for (const row of dataRows) {
    for (const cell of row) {
      const trimmed = cell.trim();
      if (trimmed.length === 0) continue;
      totalCells++;
      if (binaryPattern.test(trimmed)) {
        binaryCells++;
      }
    }
  }

  if (totalCells === 0) {
    return {
      signalId: "signal-2",
      label: "Symboles binaires répétés",
      detected: false,
      detail: "Aucune cellule de données trouvée.",
    };
  }

  const ratio = binaryCells / totalCells;

  if (ratio > 0.7) {
    return {
      signalId: "signal-2",
      label: "Symboles binaires répétés",
      detected: true,
      detail: `${Math.round(ratio * 100)} % des cellules contiennent uniquement des symboles binaires (+, -, +/-). Ce tableau apporte peu d'information quantitative.`,
    };
  }

  return {
    signalId: "signal-2",
    label: "Symboles binaires répétés",
    detected: false,
    detail: `${Math.round(ratio * 100)} % de symboles binaires — seuil non atteint (>70 %).`,
  };
}

/**
 * Signal 3: Detect mentions of non-significant results.
 */
function checkNonSignificant(rows: string[][]): TableSignal {
  const fullText = rows.map((r) => r.join(" ")).join(" ");
  const patterns = [
    /non significatif/i,
    /\bns\b/i,
    /p\s*>\s*0\.05/i,
    /p\s*>\s*0,05/i,
  ];

  const matches: string[] = [];
  for (const pattern of patterns) {
    const m = fullText.match(pattern);
    if (m) matches.push(m[0]);
  }

  if (matches.length > 0) {
    return {
      signalId: "signal-3",
      label: "Résultats non significatifs",
      detected: true,
      detail: `Détection de résultats non significatifs : « ${matches.join(", ")} ». Vérifiez que ces résultats sont justifiés dans le texte et non pas présentés comme positifs.`,
    };
  }

  return {
    signalId: "signal-3",
    label: "Résultats non significatifs",
    detected: false,
    detail: "Aucun résultat non significatif détecté dans le tableau.",
  };
}

/**
 * Calculate overall score from rule-based signals (0-10).
 */
function calculateOverallScore(signals: TableSignal[]): number {
  const detectedCount = signals.filter((s) => s.detected).length;
  // 0 signals detected = 10, 1 = 7, 2 = 4, 3 = 1
  return Math.max(0, 10 - detectedCount * 3);
}

async function handleTableQuality(
  body: { tableData: string },
  providerConfig?: AiProviderConfig
) {
  const { tableData } = body;

  if (!tableData || typeof tableData !== "string") {
    return NextResponse.json(
      { error: "Le champ 'tableData' est requis." },
      { status: 400 }
    );
  }

  // ── Rule-based checks ──
  const rows = parseTable(tableData);

  const signal1 = checkIdenticalColumns(rows);
  const signal2 = checkBinarySymbols(rows);
  const signal3 = checkNonSignificant(rows);

  const ruleSignals: TableSignal[] = [signal1, signal2, signal3];
  const ruleScore = calculateOverallScore(ruleSignals);

  // ── LLM check (if table has enough content to be worth analyzing) ──
  let llmVerdict = {
    justified: true,
    alternative: "",
  };

  const totalCells = rows.reduce((sum, r) => sum + r.length, 0);

  // Only call LLM if table has meaningful content and at least one signal or table is large
  if (totalCells > 6) {
    try {
      const criteria = getKnowledgeCore(['publication']);

      const systemPrompt = `${criteria}

Tu es un expert en rédaction scientifique. Tu évalues si un tableau de données est justifié ou s'il pourrait être remplacé par une phrase sans perte d'information.

Applique les critères de qualité des tableaux et de redondance texte/tableau du socle ci-dessus.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "justified": true/false,
  "alternative": "...si non justifié, propose une phrase alternative qui remplace le tableau..."
}

Si le tableau est justifié (apporte une valeur visuelle, compare plusieurs dimensions, ou contient des données complexes), mets "justified": true et "alternative": "".
Si le tableau pourrait être remplacé par une simple phrase, mets "justified": false et rédige la phrase de remplacement.`;

      const userPrompt = `Voici le tableau à analyser :
---
${tableData}
---

Ce tableau est-il justifié ou pourrait-il être remplacé par une phrase ? Réponds en JSON.`;

      const result = await generateCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        maxTokens: 1024,
        providerConfig,
      });

      try {
        const raw = result.content.trim();
        const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
        const parsed = JSON.parse(jsonMatch[1] || raw);
        llmVerdict = {
          justified: !!parsed.justified,
          alternative: typeof parsed.alternative === "string" ? parsed.alternative : "",
        };
      } catch {
        // LLM response unparseable — keep default (justified: true)
        llmVerdict = {
          justified: true,
          alternative: "Impossible d'analyser automatiquement ce tableau.",
        };
      }
    } catch {
      // LLM unavailable — skip this part, rule-based results are sufficient
      llmVerdict = {
        justified: true,
        alternative: "Analyse IA non disponible.",
      };
    }
  }

  // Compute final score: average of rule score and LLM verdict
  const llmScore = llmVerdict.justified ? 10 : 3;
  const overallScore = Math.round((ruleScore + llmScore) / 2);

  return NextResponse.json({
    data: {
      signals: ruleSignals,
      llmVerdict,
      overallScore,
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
// Action 3: paragraph-structure
// ═══════════════════════════════════════════════════════════════════

async function handleParagraphStructure(
  body: { text: string },
  providerConfig?: AiProviderConfig
) {
  const { text } = body;

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Le champ 'text' est requis." },
      { status: 400 }
    );
  }

  // Split by double newline into paragraphs
  const rawParagraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20); // ignore very short fragments

  if (rawParagraphs.length === 0) {
    return NextResponse.json({
      data: { paragraphs: [] },
    });
  }

  // Build numbered paragraphs for LLM
  const numberedText = rawParagraphs
    .map((p, i) => `[PARAGRAPHE ${i + 1}]\n${p}`)
    .join("\n\n");

  const criteria = getKnowledgeCore(['style', 'publication']);

  const systemPrompt = `${criteria}

Tu es un expert en rédaction académique de niveau L2 (deuxième langue). Tu identifies les paragraphes qui ont un problème de structure.

Pour chaque paragraphe, évalue :
1. Le paragraphe commence-t-il DIRECTEMENT par l'idée principale (phrase-topic, cf. critères de style ci-dessus) ? Ou l'ouverture est-elle indirecte, enfouie après des circonstancielles, des rappels, ou des transitions inutiles ?
2. Le paragraphe tourne-t-il autour du point sans l'atteindre ? (circonlocutions, répétitions, manque de progression logique)

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "paragraphs": [
    {
      "index": 1,
      "hasDirectOpening": true,
      "issue": null
    }
  ]
}

- "index" : numéro du paragraphe (tel qu'indiqué dans [PARAGRAPHE X])
- "hasDirectOpening" : true si le paragraphe commence directement par son idée principale, false sinon
- "issue" : null si pas de problème, sinon une brève description du problème en français (max 100 caractères)

Analyse TOUS les paragraphes fournis.`;

  const userPrompt = `Voici le texte à analyser, avec les paragraphes numérotés :
---
${numberedText}
---

Pour chaque paragraphe, indique s'il a une ouverture directe ou un problème de structure. Réponds en JSON.`;

  const messages: AiMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let result: Awaited<ReturnType<typeof generateCompletion>>;
  try {
    result = await generateCompletion({
      messages,
      temperature: 0.2,
      maxTokens: 4096,
      providerConfig,
    });
  } catch (aiError) {
    const msg = aiError instanceof Error ? aiError.message : "Erreur lors de l'appel à l'IA.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  let parsed;
  try {
    const raw = result.content.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    parsed = JSON.parse(jsonMatch[1] || raw);
  } catch {
    return NextResponse.json({
      error: "La réponse de l'IA n'a pas pu être interprétée. Réessayez.",
      raw: result.content,
    });
  }

  // Enrich with preview (first 80 chars of each paragraph)
  const enrichedParagraphs = (parsed.paragraphs || []).map(
    (p: {
      index: number;
      hasDirectOpening: boolean;
      issue: string | null;
    }) => ({
      index: p.index,
      preview:
        rawParagraphs[p.index - 1]?.slice(0, 80) ||
        "(paragraphe introuvable)",
      hasDirectOpening: !!p.hasDirectOpening,
      issue: p.issue || null,
    })
  );

  return NextResponse.json({
    data: { paragraphs: enrichedParagraphs },
  });
}

// ═══════════════════════════════════════════════════════════════════
// Action 4: text-table-redundancy
// ═══════════════════════════════════════════════════════════════════

async function handleTextTableRedundancy(
  body: { text: string; tableOrFigureDescription: string },
  providerConfig?: AiProviderConfig
) {
  const { text, tableOrFigureDescription } = body;

  if (!text || !tableOrFigureDescription) {
    return NextResponse.json(
      {
        error:
          "Les champs 'text' et 'tableOrFigureDescription' sont requis.",
      },
      { status: 400 }
    );
  }

  const criteria = getKnowledgeCore(['coherence', 'publication']);

  const systemPrompt = `${criteria}

Tu es un expert en rédaction scientifique. Tu vérifies si un texte reformule de manière redondante ce qu'un tableau ou une figure montre déjà.

Applique les critères de redondance texte/tableau du socle ci-dessus.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "isRedundant": true/false,
  "redundantPhrases": ["...phrase redondante extraite du texte..."],
  "suggestion": "...conseil pour améliorer (en français, max 200 caractères)..."
}`;

  const userPrompt = `Voici le TEXTE à analyser :
---
${text}
---

Voici la DESCRIPTION DU TABLEAU OU DE LA FIGURE :
---
${tableOrFigureDescription}
---

Le texte reformule-t-il redondamment ce que le tableau/la figure montre déjà ? Réponds en JSON.`;

  const messages: AiMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let result: Awaited<ReturnType<typeof generateCompletion>>;
  try {
    result = await generateCompletion({
      messages,
      temperature: 0.2,
      maxTokens: 2048,
      providerConfig,
    });
  } catch (aiError) {
    const msg = aiError instanceof Error ? aiError.message : "Erreur lors de l'appel à l'IA.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  let parsed;
  try {
    const raw = result.content.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    parsed = JSON.parse(jsonMatch[1] || raw);
  } catch {
    return NextResponse.json({
      error: "La réponse de l'IA n'a pas pu être interprétée. Réessayez.",
      raw: result.content,
    });
  }

  return NextResponse.json({
    data: {
      isRedundant: !!parsed.isRedundant,
      redundantPhrases: Array.isArray(parsed.redundantPhrases)
        ? parsed.redundantPhrases
        : [],
      suggestion:
        typeof parsed.suggestion === "string" ? parsed.suggestion : "",
    },
  });
}

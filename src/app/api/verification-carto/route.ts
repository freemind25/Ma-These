import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateCompletion, type AiMessage } from "@/lib/ai/zai-client";
import { z } from "zod/v4";
import { type AiProviderConfig } from "@/lib/ai/ai-provider";
import {
  isGeoMcpAvailable,
  geocodeForContext,
  validateCoordsForContext,
  distanceForContext,
  elevationForContext,
  bboxForContext,
  validateGeojsonForContext,
  areaForContext,
} from "@/lib/geo-mcp-client";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ReferentielPhase {
  id: string;
  label: string;
  elements: { typeElement: string; label: string }[];
}

interface ReferentielData {
  prealable?: { elements: { typeElement: string; label: string }[] };
  phases?: ReferentielPhase[];
}

// ═══════════════════════════════════════
// Module A — Rule-based completeness check (NO LLM)
// ═══════════════════════════════════════

function verifierCompletude(
  typeElementsRenseignes: string[],
  referentiel: ReferentielData
) {
  // 1. Check prerequisite (blocking)
  if (referentiel.prealable) {
    const prealableAttendus = referentiel.prealable.elements.map((e) => e.typeElement);
    const prealableManquants = prealableAttendus.filter(
      (e) => !typeElementsRenseignes.includes(e)
    );
    if (prealableManquants.length > 0) {
      return {
        complet: false,
        etape: "prealable" as const,
        manquants: referentiel.prealable.elements
          .filter((e) => prealableManquants.includes(e.typeElement))
          .map((e) => ({ typeElement: e.typeElement, label: e.label })),
        bloquant: true,
      };
    }
  }

  // 2. Evaluate all phases
  const phases = referentiel.phases || [];
  const tousAttendus = phases.flatMap((p) => p.elements);
  const tousAttendusIds = tousAttendus.map((e) => e.typeElement);
  const manquants = tousAttendus
    .filter((e) => !typeElementsRenseignes.includes(e.typeElement))
    .map((e) => ({ typeElement: e.typeElement, label: e.label }));

  return {
    complet: manquants.length === 0,
    etape: "analyse" as const,
    manquants,
    bloquant: false,
    presents: typeElementsRenseignes.filter((te) => tousAttendusIds.includes(te)),
  };
}

// ═══════════════════════════════════════
// Module B — Socratic questioner (LLM)
// ═══════════════════════════════════════

const PROMPT_GENERIQUE = `Tu es un module de vérification méthodologique pour ThesisFrame, un environnement de rédaction de thèse.

RÔLE STRICT :
Tu poses UNIQUEMENT des questions ouvertes sur les éléments méthodologiques que le chercheur te soumet. Tu ne fais JAMAIS d'affirmation sur l'objet d'étude, tu ne proposes JAMAIS de lecture, d'interprétation, ou de conclusion.

INTERDICTIONS ABSOLUES :
- Aucune phrase déclarative sur l'objet d'étude ("cette zone présente...", "on observe une...", "ce corpus semble...")
- Aucune suggestion de cause ou d'explication ("cela pourrait indiquer...", "probablement dû à...")
- Aucune évaluation de qualité du travail ("bon exemple de...", "cas typique de...")

CE QUE TU DOIS FAIRE :
- Identifier les incohérences méthodologiques possibles (dates de sources différentes, échelles incompatibles, éléments manquants par rapport à l'objectif déclaré) et les formuler EXCLUSIVEMENT sous forme de question
- Une question à la fois, ou une liste courte de questions (3 maximum)
- Rester neutre : la question doit pouvoir recevoir n'importe quelle réponse du chercheur sans que tu aies présupposé laquelle est correcte

FORMAT DE SORTIE : JSON strict
{"questions": ["...", "..."]}`;

const DECLARATIVE_PATTERNS = [
  /^(cette?|ce|ces|un|une|le|la|les)\s+(zone|ville|site|aire|quartier|rue|espace|corridor|îlot|bassin|réseau|trame|parcell|gabarit|ensemble|secteur|district|agglomération|région|pays|territoire)\s+(est|présente|montre|dispose|caractérise|semble|apparaît|connaît)/i,
  /^(on observe|on note|on constate|on remarque|il apparaît|il ressort|il en ressort)/i,
  /^(cela|ceci|ça)\s+(montre|indique|suggère|pourrait|révèle|démontre|prouve)/i,
];

function filtrerQuestionsValides(questions: string[]): string[] {
  return questions.filter((q) => {
    // Must end with ?
    if (!q.trim().endsWith("?")) return false;
    // Must not start with a declarative pattern
    for (const pattern of DECLARATIVE_PATTERNS) {
      if (pattern.test(q)) return false;
    }
    return true;
  });
}

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
}

// ═══════════════════════════════════════
// POST /api/verification-carto
// ═══════════════════════════════════════

const verificationSchema = z.object({
  action: z.enum(["completude", "questionneur", "save-session", "geo-enrich"]),
  siteEtudeId: z.string().min(1),
  typeAnalyseId: z.string().min(1),
  // For completude
  typeElementsRenseignes: z.array(z.string()).optional(),
  // For questionneur
  elements: z.array(z.object({
    typeElement: z.string(),
    nom: z.string(),
    source: z.string(),
    dateSource: z.string().optional(),
    geojson: z.unknown().optional(),
  })).optional(),
  typeAnalyseNom: z.string().optional(),
  // For save-session
  elementsManquants: z.unknown().optional(),
  questionsPosees: z.unknown().optional(),
  reponses: z.unknown().optional(),
  // For geo-enrich
  geoContext: z.unknown().optional(),
  _aiConfig: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const v = verificationSchema.parse(body);

    // Fetch the analysis type with referential
    const typeAnalyse = await db.typeAnalyseMethodologique.findUnique({
      where: { id: v.typeAnalyseId },
    });
    if (!typeAnalyse) {
      return NextResponse.json({ error: "Type d'analyse non trouvé" }, { status: 404 });
    }

    const referentiel: ReferentielData = JSON.parse(typeAnalyse.elementsAttendus);
    const providerConfig = v._aiConfig as AiProviderConfig | undefined;

    // ─── ACTION: completude (Module A, rule-based, NO LLM) ───
    if (v.action === "completude") {
      const typeElementsRenseignes = v.typeElementsRenseignes || [];
      const result = verifierCompletude(typeElementsRenseignes, referentiel);

      // Save session
      await db.sessionVerification.create({
        data: {
          siteEtudeId: v.siteEtudeId,
          typeAnalyseId: v.typeAnalyseId,
          elementsManquants: JSON.stringify(result),
          questionsPosees: "[]",
        },
      });

      return NextResponse.json({ data: result });
    }

    // ─── ACTION: questionneur (Module B, LLM) ───
    if (v.action === "questionneur") {
      if (!v.elements || v.elements.length === 0) {
        return NextResponse.json({ error: "Aucun élément fourni" }, { status: 400 });
      }

      const promptSysteme = typeAnalyse.promptQuestionneur || PROMPT_GENERIQUE;

      const messages: AiMessage[] = [
        { role: "system", content: promptSysteme },
        {
          role: "user",
          content: JSON.stringify({
            elements: v.elements,
            typeAnalyse: v.typeAnalyseNom || typeAnalyse.nom,
          }),
        },
      ];

      const result = await generateCompletion({
        messages,
        temperature: 0.3,
        providerConfig,
      });

      // Parse JSON response
      let questions: string[] = [];
      try {
        const raw = stripFences(result.content);
        const parsed = JSON.parse(raw);
        questions = parsed.questions || [];
      } catch {
        // If parsing fails, return empty (spec says: show nothing rather than auto-correct)
        questions = [];
      }

      // Apply post-processing guardrails
      const validQuestions = filtrerQuestionsValides(questions);

      // Save to session
      await db.sessionVerification.create({
        data: {
          siteEtudeId: v.siteEtudeId,
          typeAnalyseId: v.typeAnalyseId,
          elementsManquants: "[]",
          questionsPosees: JSON.stringify(validQuestions),
        },
      });

      return NextResponse.json({
        data: {
          questions: validQuestions,
          filtered: questions.length - validQuestions.length,
          total: questions.length,
        },
      });
    }

    // ─── ACTION: save-session ───
    if (v.action === "save-session") {
      const session = await db.sessionVerification.create({
        data: {
          siteEtudeId: v.siteEtudeId,
          typeAnalyseId: v.typeAnalyseId,
          elementsManquants: JSON.stringify(v.elementsManquants || []),
          questionsPosees: JSON.stringify(v.questionsPosees || []),
          reponses: v.reponses ? JSON.stringify(v.reponses) : null,
        },
      });
      return NextResponse.json({ data: session }, { status: 201 });
    }

    // ─── ACTION: geo-enrich (Module C — MCP geographic enrichment) ───
    if (v.action === "geo-enrich") {
      const mcpAvailable = await isGeoMcpAvailable();
      const enrichments: Array<{ type: string; label: string; value: string; tool: string }> = [];

      if (mcpAvailable && v.elements) {
        // Enrich each spatial element with MCP geographic data
        const spatialElements = v.elements.filter(
          (e) => e.typeElement.includes('perimetre') ||
                 e.typeElement.includes('situation') ||
                 e.nom.match(/\d+\.\d+.*\d+\.\d+/) || // contains coordinates
                 e.geojson
        );

        for (const elem of spatialElements.slice(0, 5)) { // Limit to 5 for performance
          // Try to extract coordinates from name or geojson
          const coordMatch = elem.nom.match(/(-?\d+\.\d+)\s*[,;\s]\s*(-?\d+\.\d+)/);
          const geojson = elem.geojson as Record<string, unknown> | undefined;

          if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lon = parseFloat(coordMatch[2]);
            const coordInfo = await validateCoordsForContext(lat, lon);
            if (coordInfo) enrichments.push({ type: 'coords', label: elem.nom, value: coordInfo, tool: 'validate_coords' });

            const elevInfo = await elevationForContext(lat, lon);
            if (elevInfo) enrichments.push({ type: 'elevation', label: elem.nom, value: elevInfo, tool: 'elevation_query' });
          }

          if (geojson && geojson.type) {
            const validInfo = await validateGeojsonForContext(geojson);
            if (validInfo) enrichments.push({ type: 'geojson', label: elem.nom, value: validInfo, tool: 'geojson_validate' });

            if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
              const areaInfo = await areaForContext(geojson);
              if (areaInfo) enrichments.push({ type: 'area', label: elem.nom, value: areaInfo, tool: 'compute_area' });
            }

            if (geojson.coordinates) {
              const coords = geojson.coordinates as number[][];
              if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number' && coords.length >= 2) {
                const bboxInfo = await bboxForContext(coords);
                if (bboxInfo) enrichments.push({ type: 'bbox', label: elem.nom, value: bboxInfo, tool: 'compute_bbox' });
              }
            }
          }

          // Try geocoding the element name if it looks like a place
          if (!coordMatch && !geojson && elem.nom.length > 3 && elem.nom.length < 100) {
            const geoInfo = await geocodeForContext(elem.nom);
            if (geoInfo) enrichments.push({ type: 'geocode', label: elem.nom, value: geoInfo, tool: 'geocode' });
          }
        }

        // If we have two spatial elements, compute distance
        if (spatialElements.length >= 2) {
          const first = spatialElements[0];
          const second = spatialElements[1];
          const m1 = first.nom.match(/(-?\d+\.\d+)\s*[,;\s]\s*(-?\d+\.\d+)/);
          const m2 = second.nom.match(/(-?\d+\.\d+)\s*[,;\s]\s*(-?\d+\.\d+)/);
          if (m1 && m2) {
            const distInfo = await distanceForContext(
              parseFloat(m1[1]), parseFloat(m1[2]),
              parseFloat(m2[1]), parseFloat(m2[2])
            );
            if (distInfo) enrichments.push({ type: 'distance', label: `${first.nom} → ${second.nom}`, value: distInfo, tool: 'distance_between' });
          }
        }
      }

      return NextResponse.json({
        data: {
          mcp_available: mcpAvailable,
          enrichments,
          count: enrichments.length,
        },
      });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/verification-carto] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// GET /api/verification-carto — List sessions
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteEtudeId = searchParams.get("siteEtudeId");
    const typeAnalyseId = searchParams.get("typeAnalyseId");

    const where: Record<string, unknown> = {};
    if (siteEtudeId) where.siteEtudeId = siteEtudeId;
    if (typeAnalyseId) where.typeAnalyseId = typeAnalyseId;

    const sessions = await db.sessionVerification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error("[GET /api/verification-carto] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la lecture" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/paper2code/extract-structured (chantier B)
// Extraction structurée de l'article via Datalab Extract (fast) :
// schéma PRÉDÉFINI côté serveur (coût contrôlé, aucun schéma arbitraire
// du client) — méthodologie, données, hyperparamètres, résultats…
// Réponse : valeurs + citations par champ + scores de confiance (1-5).
// Tarif upstream : ≈ 6 $/1 000 pages (fast) ; > 50 pages : tarif accurate
// appliqué par Datalab (le panneau UI l'affiche).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { resolveDatalabApiKey } from "@/lib/datalab/config";
import { DatalabError, datalabExtract, type DatalabFile } from "@/lib/datalab/client";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;

/** Schéma d'extraction prédéfini — « Article → Code » (8 champs, ≤ 750 autorisés). */
const PAPER2CODE_SCHEMA = {
  type: "object",
  properties: {
    titre: { type: "string", description: "Titre complet de l'article" },
    auteurs: { type: "array", items: { type: "string" }, description: "Liste des auteurs dans l'ordre" },
    objectif: { type: "string", description: "Objectif scientifique et question de recherche de l'article" },
    methodologie: { type: "string", description: "Méthodologie complète : design, modèle/algorithme proposé, protocole expérimental étapes par étapes" },
    donnees: { type: "array", items: { type: "string" }, description: "Jeux de données utilisés : nom, taille, caractéristiques, prétraitement" },
    hyperparametres: { type: "array", items: { type: "string" }, description: "Hyperparamètres avec leurs valeurs exactes (learning rate, batch size, epochs, seeds, etc.)" },
    resultats: { type: "array", items: { type: "string" }, description: "Résultats clés chiffrés : métriques, baselines comparées, tableaux principaux" },
    limites: { type: "string", description: "Limites et biais mentionnés par les auteurs (section discussion/limitation)" },
  },
  required: ["titre", "methodologie"],
};

/** Champ de réponse normalisé pour l'UI. */
interface ExtractedField {
  name: string;
  value: unknown;
  citation: string | null;
  score: number | null;
  reasoning: string | null;
}

/** Normalise la réponse Datalab : valeurs + _score/_citation par champ. */
function normalizeFields(extracted: Record<string, unknown>, names: string[]): {
  fields: ExtractedField[];
  missing: string[];
} {
  const fields: ExtractedField[] = [];
  const missing: string[] = [];
  for (const name of names) {
    const raw = extracted[name];
    if (raw === undefined || raw === null) {
      missing.push(name);
      continue;
    }
    // Datalab peut envelopper chaque champ : { value, _score: {score, reasoning}, citation? }
    let value: unknown = raw;
    let score: number | null = null;
    let reasoning: string | null = null;
    let citation: string | null = null;
    if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
      const obj = raw as Record<string, unknown>;
      if ("value" in obj) value = obj.value;
      const scoreObj = (obj._score ?? obj.score) as Record<string, unknown> | number | undefined;
      if (typeof scoreObj === "number") score = scoreObj;
      else if (scoreObj && typeof scoreObj === "object") {
        if (typeof scoreObj.score === "number") score = scoreObj.score;
        if (typeof scoreObj.reasoning === "string") reasoning = scoreObj.reasoning;
      }
      if (typeof obj._citation === "string") citation = obj._citation;
      else if (typeof obj.citation === "string") citation = obj.citation;
      // _meta balanced/accurate : extraction_status / verification — ignorés en fast
    }
    fields.push({ name, value, citation, score, reasoning });
  }
  return { fields, missing };
}

const FIELD_NAMES = Object.keys(PAPER2CODE_SCHEMA.properties);

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveDatalabApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Aucune clé Datalab configurée — ajoutez-la dans Paramètres → Datalab pour utiliser l'extraction structurée.",
          code: "NO_KEY",
        },
        { status: 403 }
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES + 1024 * 1024) {
      return NextResponse.json(
        { error: `Fichier trop volumineux : ${(contentLength / 1024 / 1024).toFixed(1)} Mo reçus (maximum ${MAX_BYTES / 1024 / 1024} Mo).` },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu (champ « file »)." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop volumineux : ${(file.size / 1024 / 1024).toFixed(1)} Mo (maximum ${MAX_BYTES / 1024 / 1024} Mo).` },
        { status: 413 }
      );
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "L'extraction structurée accepte uniquement un fichier PDF (article scientifique)." },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dlFile: DatalabFile = { name: file.name, type: file.type, buffer };

    const result = await datalabExtract(apiKey, dlFile, {
      pageSchema: JSON.stringify(PAPER2CODE_SCHEMA),
      extractionMode: "fast",
      signal: request.signal,
    });

    const { fields, missing } = normalizeFields(result.extracted, FIELD_NAMES);
    return NextResponse.json({
      data: {
        fields,
        missing,
        scoreAverage: result.scoreAverage,
        note:
          "Extraction Datalab fast : citations par champ + scores de confiance 1-5. Au-delà de 50 pages, Datalab applique automatiquement le tarif accurate.",
      },
    });
  } catch (error) {
    if (error instanceof DatalabError) {
      console.error("[POST /api/paper2code/extract-structured] Upstream:", error.code, error.message);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status === 401 || error.status === 402 || error.status === 429 ? error.status : 502 }
      );
    }
    console.error("[POST /api/paper2code/extract-structured] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'extraction structurée" }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Analyse des sources d'un article (option B)
// Bibliothèque PURE — déterministe, sans IA. Rapport honnête :
// volumes, sections repérées, études détectées, éléments manquants,
// qualité globale, risque de fragmentation.
// ═══════════════════════════════════════════════════════════════

import type { SourceBlock } from "./prompts";

export interface SourceStat {
  label: string;
  kind: string;
  chars: number;
}

export interface SourceAnalysis {
  totalChars: number;
  bySource: SourceStat[];
  headings: string[];
  studies: { label: string; question?: string; verdict?: string }[];
  missing: string[];
  quality: "complète" | "partielle" | "insuffisante";
}

/** Détection honnête des titres dans un bloc (lignes courtes sans point final). */
export function detectHeadings(text: string): string[] {
  const lines = text.split("\n").map((l) => l.trim());
  const out: string[] = [];
  for (const line of lines) {
    if (
      line.length >= 3 &&
      line.length <= 90 &&
      !/[.!?;]$/.test(line) &&
      /^[A-ZÀ-ÖØ-Þ0-9]/.test(line) &&
      out.length < 40
    ) {
      out.push(line);
    }
  }
  return out;
}

/** Analyse pure des blocs sources. */
export function analyzeSources(blocks: SourceBlock[]): SourceAnalysis {
  const bySource: SourceStat[] = blocks.map((b) => ({
    label: b.label,
    kind: b.kind,
    chars: b.content.length,
  }));
  const totalChars = bySource.reduce((a, s) => a + s.chars, 0);

  const headings: string[] = [];
  for (const b of blocks) {
    if (b.kind === "imported" || b.kind === "projet") {
      for (const h of detectHeadings(b.content)) {
        if (!headings.includes(h)) headings.push(h);
      }
    }
  }

  const studies = blocks
    .filter((b) => b.kind === "experiment")
    .map((b) => {
      const question = b.content.match(/Question\/hypothèse : ([^\n]+)/)?.[1];
      const verdict = b.content.match(/Verdict : ([^\n]+)/)?.[1];
      return { label: b.label, question, verdict };
    });

  const joined = blocks.map((b) => b.content).join("\n").toLowerCase();
  const missing: string[] = [];
  if (!/(méthodologie|méthode|protocole|échantillon|enquête|matériel et méthodes)/.test(joined)) {
    missing.push("Méthodologie : aucune description de méthode repérée dans les sources.");
  }
  if (!/(résultats|résultat|conclusion|verdict|corrélation|régression)/.test(joined)) {
    missing.push("Résultats : aucun résultat ou conclusion repéré dans les sources.");
  }
  if (!/(bibliographie|références|references)/.test(joined)) {
    missing.push("Bibliographie : aucune section de références repérée — les citations seront « à vérifier ».");
  }
  if (blocks.filter((b) => b.kind === "reference").length === 0) {
    missing.push("Références du projet non sélectionnées : la bibliographie de l'article n'aura aucune source vérifiable.");
  }

  let quality: SourceAnalysis["quality"] = "complète";
  if (missing.length >= 2 || totalChars < 3_000) quality = "partielle";
  if (missing.length >= 3 || totalChars < 800) quality = "insuffisante";

  return { totalChars, bySource, headings, studies, missing, quality };
}

/** Garde-fou anti-fragmentation (cahier des charges : jamais automatique). */
export function fragmentationRisk(input: {
  studiesCount: number;
  anglesCount: number;
}): { risk: boolean; message: string } {
  if (input.studiesCount >= 2 && input.anglesCount >= 2) {
    return {
      risk: true,
      message:
        `${input.studiesCount} études détectées et ${input.anglesCount} angles proposés : ` +
        "le fractionnement en plusieurs articles doit rester une décision explicite de l'auteur. " +
        "Plusieurs articles issus de la même thèse risquent des redondances et une fragmentation artificielle des résultats — " +
        "un seul angle est retenu pour cet article.",
    };
  }
  return { risk: false, message: "" };
}

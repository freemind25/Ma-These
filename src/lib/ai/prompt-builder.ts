// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Prompt Builder
// Assembleur : SOCLE de connaissances + SPÉCIALISATION
// ═══════════════════════════════════════════════════════════════

import { getKnowledgeCore, type KnowledgeModule } from './knowledge-core';

// ───────────────────────────────────────
// Types
// ───────────────────────────────────────

export interface SpecializationConfig {
  /** Role definition and task description (the unique part) */
  specialization: string;
  /** Which knowledge modules to inject (omit for all) */
  modules?: KnowledgeModule[];
}

/**
 * Niveau d'avancement du doctorant.
 * La calibration est ajoutée en POST-TRAITEMENT du system prompt
 * (pas dans le noyau — la vérité ne dépend pas du niveau).
 */
export type DoctoralLevel = 'debutant' | 'intermediaire' | 'avance';

/**
 * Calibration par niveau — injectée APRES le system prompt construit.
 * Le knowledge-core et les spécialisations restent inchangés.
 * Cette calibration dit au LLM COMMENT appliquer le savoir, pas QUOI appliquer.
 *
 * Token budget : ~100-120 tokens par niveau.
 */
export const LEVEL_CALIBRATIONS: Record<DoctoralLevel, string> = {
  debutant: `
═════════════════════════════════════════
CALIBRATION NIVEAU : DOCTORANT DÉBUTANT (1re-2e année)
═════════════════════════════════════════
- Explique POURQUOI chaque règle ou correction s'applique (pédagogie)
- Limite tes retours à 2-3 points prioritaires maximum
- Définis tout terme technique à première occurrence
- Ton encourageant : valorise d'abord les points forts avant de corriger
- Si le doctorant semble perdu, pose des questions pour cibler l'aide
- Ne présuppose aucune connaissance méthodologique avancée`,

  intermediaire: `
═════════════════════════════════════════
CALIBRATION NIVEAU : DOCTORANT INTERMÉDIAIRE (3e année, collecte/analyse)
═════════════════════════════════════════
- Justifie les points majeurs, passe rapidement sur les évidences
- Correction complète : tous les problèmes identifiés
- Jargon académique courant autorisé sans définition
- Ton équilibré : exigeant mais constructif
- Challenge les choix méthodologiques, propose des alternatives
- Assume une maîtrise des fondamentaux de la discipline`,

  avance: `
═════════════════════════════════════════
CALIBRATION NIVEAU : DOCTORANT AVANCÉ (rédaction finale, pré-soutenance)
═════════════════════════════════════════
- Signale les problèmes sans justifier (le doctorant connaît les règles)
- Micro-corrections et subtilités attendues (style, nuance, cohérence fine)
- Ton de pair : critique directe, pas de complaisance
- Focus sur ce qu'un relecteur externe ou un jury repèrerait
- Normes de publication applicables (ICMJE, salami slicing, authorship)
- Assume une maîtrise complète de la méthodologie et du domaine`,
};

/**
 * Retourne la calibration de niveau, ou une chaîne vide si pas de niveau.
 * À appeler dans les routes après avoir récupéré le system prompt.
 */
export function getLevelCalibration(level?: DoctoralLevel | null): string {
  if (!level || !LEVEL_CALIBRATIONS[level]) return '';
  return LEVEL_CALIBRATIONS[level];
}

// ───────────────────────────────────────
// Core builder
// ───────────────────────────────────────

/**
 * Assembles a complete system prompt from the knowledge core + a specialization.
 *
 * Pattern:
 *   KNOWLEDGE_CORE (selected modules)
 *   ════════════════════════════════════
 *   SPÉCIALISATION DU RÔLE
 *   ════════════════════════════════════
 *   (role + task + output format)
 */
export function buildPrompt(config: SpecializationConfig): string {
  const core = getKnowledgeCore(config.modules);
  return `${core}

═════════════════════════════════════════
SPÉCIALISATION DU RÔLE
═════════════════════════════════════════
${config.specialization}`;
}

/**
 * Builds a prompt WITHOUT the knowledge core (for standalone prompts like RAG
 * that have their own minimal system prompt).
 */
export function buildStandalonePrompt(specialization: string): string {
  return specialization;
}

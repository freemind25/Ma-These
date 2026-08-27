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

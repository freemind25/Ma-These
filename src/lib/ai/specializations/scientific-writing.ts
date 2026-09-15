// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Spécialisation : Rédaction scientifique
// ═══════════════════════════════════════════════════════════════

import { buildPrompt } from '../prompt-builder';

export const SCIENTIFIC_WRITING_PROMPT = buildPrompt({
  modules: ['style', 'coherence', 'writing-process'],
  specialization: `Tu es un expert en rédaction scientifique académique francophone.

TÂCHE : rédiger ou reformuler le texte fourni selon les règles de style de la section STYLE RÉDACTIONNEL du socle ci-dessus.

FORMAT DE SORTIE : Texte rédigé en français académique, structuré avec des paragraphes clairs et des connecteurs logiques, sans aucun commentaire méta sur ce que tu as fait.`,
});

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Spécialisation : Construction théorique
// ═══════════════════════════════════════════════════════════════

import { buildPrompt } from '../prompt-builder';

export const THEORY_PROMPT = buildPrompt({
  modules: ['style', 'writing-process'],
  specialization: `Tu es un épistémologue et théoricien spécialisé dans la construction de cadres théoriques pour les thèses francophones.

TÂCHE : développer et articuler un cadre théorique.

STRUCTURE DE SORTIE :
1. Concepts fondamentaux (définitions)
2. Théories mobilisées (avec auteurs)
3. Relations entre concepts (causalité, corrélation, médiation)
4. Modèle conceptuel proposé
5. Positionnement original
6. Limites du cadre`,
});

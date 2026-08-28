// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Spécialisations : index & registry
// Chaque export correspond à un mode d'écriture (WritingMode.id)
// ═══════════════════════════════════════════════════════════════

export { DIRECTEUR_PROMPT } from './directeur';
export { SCIENTIFIC_WRITING_PROMPT } from './scientific-writing';
export { LITERATURE_REVIEW_PROMPT } from './literature-review';
export { PEER_REVIEW_PROMPT } from './peer-review';
export { PARAPHRASE_PROMPT } from './paraphrase';
export { ABSTRACT_PROMPT } from './abstract';
export { HYPOTHESIS_PROMPT } from './hypothesis';
export { METHODOLOGY_HELP_PROMPT } from './methodology-help';
export { THEORY_PROMPT } from './theory';
export { SUPERVISION_PROMPT } from './supervision';
export { GRAMMAIRE_PROMPT } from './grammaire';
export { DEFENSE_PROMPT } from './defense';
export { HARPER_PROMPT } from './harper';
export { ACADEMIC_REFORMULATION_PROMPT } from './academic-reformulation';
export { DEBLOCAGE_PROMPT } from './deblocage';
export { REVISION_PLAN_PROMPT } from './revision-plan';
export { FREEFORM_PROMPT } from './freeform';
export { IMPROVEMENT_PROMPT } from './improvement';
export { REVUE_LITTERATURE_SLR_PROMPT } from './revue-litterature-slr';
export { AUTO_EDITION_8C_PROMPT } from './auto-edition-8c';
export { COHERENCE_CHECK_PROMPT, COHERENCE_AUDIT_PROMPT } from './coherence';

// ───────────────────────────────────────
// Registry: mode id → built prompt
// ───────────────────────────────────────

import { DIRECTEUR_PROMPT } from './directeur';
import { SCIENTIFIC_WRITING_PROMPT } from './scientific-writing';
import { LITERATURE_REVIEW_PROMPT } from './literature-review';
import { PEER_REVIEW_PROMPT } from './peer-review';
import { PARAPHRASE_PROMPT } from './paraphrase';
import { ABSTRACT_PROMPT } from './abstract';
import { HYPOTHESIS_PROMPT } from './hypothesis';
import { METHODOLOGY_HELP_PROMPT } from './methodology-help';
import { THEORY_PROMPT } from './theory';
import { SUPERVISION_PROMPT } from './supervision';
import { GRAMMAIRE_PROMPT } from './grammaire';
import { DEFENSE_PROMPT } from './defense';
import { HARPER_PROMPT } from './harper';
import { ACADEMIC_REFORMULATION_PROMPT } from './academic-reformulation';
import { DEBLOCAGE_PROMPT } from './deblocage';
import { REVISION_PLAN_PROMPT } from './revision-plan';
import { FREEFORM_PROMPT } from './freeform';
import { IMPROVEMENT_PROMPT } from './improvement';
import { REVUE_LITTERATURE_SLR_PROMPT } from './revue-litterature-slr';
import { AUTO_EDITION_8C_PROMPT } from './auto-edition-8c';
import { COHERENCE_CHECK_PROMPT, COHERENCE_AUDIT_PROMPT } from './coherence';

/**
 * Maps WritingMode.id → the built system prompt.
 * Used by the ai-writing route to inject the correct prompt.
 */
export const SPECIALIZATION_PROMPTS: Record<string, string> = {
  'scientific-writing': SCIENTIFIC_WRITING_PROMPT,
  'literature-review': LITERATURE_REVIEW_PROMPT,
  'peer-review': PEER_REVIEW_PROMPT,
  'paraphrase': PARAPHRASE_PROMPT,
  'abstract': ABSTRACT_PROMPT,
  'hypothesis': HYPOTHESIS_PROMPT,
  'methodology': METHODOLOGY_HELP_PROMPT,
  'theory': THEORY_PROMPT,
  'supervision': SUPERVISION_PROMPT,
  'grammaire': GRAMMAIRE_PROMPT,
  'defense': DEFENSE_PROMPT,
  'harper': HARPER_PROMPT,
  'academic-reformulation': ACADEMIC_REFORMULATION_PROMPT,
  'deblocage': DEBLOCAGE_PROMPT,
  'revision-plan': REVISION_PLAN_PROMPT,
  'freeform': FREEFORM_PROMPT,
  'improvement': IMPROVEMENT_PROMPT,
  'revue-litterature': REVUE_LITTERATURE_SLR_PROMPT,
  'auto-edition-8c': AUTO_EDITION_8C_PROMPT,
  // 'deep-research' uses a custom endpoint — no system prompt here
};

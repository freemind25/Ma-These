// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Stamp « Provenance des savoirs »
// Bibliothèque PURE — aucun import db, aucun effet sur le prompt.
// Le stamp documente CE QUI a nourri une génération (noyau version
// + compétences livres avec leur mode d'injection) pour le
// doctorant — specs/sceau-provenance-savoirs. Il n'entre JAMAIS
// dans le prompt (non-régression byte-identique, CA-1.3).
// ═══════════════════════════════════════════════════════════════

import {
  selectBookSkills,
  BOOK_SKILLS_CONTENT_BUDGET_CHARS,
  type BookSkillInput,
} from "./book-skills";

/** Mode d'injection d'une compétence livre pour une génération donnée. */
export type BookSkillStampMode = "integral" | "index-only";

export interface KnowledgeStampSkill {
  id: string;
  title: string;
  mode: BookSkillStampMode;
}

/** Objet sérialisable en JSON, persisté sur Chapter / ChapterVersion. */
export interface KnowledgeStamp {
  coreVersion: string;
  skills: KnowledgeStampSkill[];
  /** ISO 8601 — horodatage de la génération (fourni par l'appelant). */
  generatedAt: string;
}

/**
 * Construit le stamp de provenance d'une génération.
 * `skills` = les compétences ACTIVES dans l'ordre d'injection (récence
 * d'abord) — le même tableau que celui passé à buildBookSkillsSection.
 * Le mode est dérivé de la sélection réelle (plafond 12 000 car.).
 */
export function buildKnowledgeStamp(input: {
  coreVersion: string;
  skills: BookSkillInput[];
  generatedAt: string;
  contentBudgetChars?: number;
}): KnowledgeStamp {
  const selection = selectBookSkills(
    input.skills,
    input.contentBudgetChars ?? BOOK_SKILLS_CONTENT_BUDGET_CHARS
  );
  const injectedIds = new Set(selection.injected.map((s) => s.id));
  return {
    coreVersion: input.coreVersion,
    skills: input.skills.map((s) => ({
      id: s.id,
      title: s.title,
      mode: injectedIds.has(s.id) ? "integral" : "index-only",
    })),
    generatedAt: input.generatedAt,
  };
}

/** Ligne de résumé (toujours visible) : noyau + nombre de compétences. */
export function formatKnowledgeStampSummary(stamp: KnowledgeStamp): string {
  const n = stamp.skills.length;
  if (n === 0) {
    return `noyau de connaissance v${stamp.coreVersion} — aucune compétence livre active`;
  }
  const pluriel = n > 1 ? "s" : "";
  return `noyau de connaissance v${stamp.coreVersion} + ${n} compétence${pluriel} livre${pluriel}`;
}

/** Détail dépliable : une ligne par compétence, avec son mode. */
export function formatKnowledgeStampDetail(stamp: KnowledgeStamp): string[] {
  return stamp.skills.map(
    (s, i) =>
      `[L${i + 1}] ${s.title} — ${
        s.mode === "integral"
          ? "injectée en intégral"
          : "index seulement (budget)"
      }`
  );
}

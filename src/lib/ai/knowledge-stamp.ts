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
import {
  selectLegalRefs,
  LEGAL_REFS_CONTENT_BUDGET_CHARS,
  type LegalRefInput,
} from "./legal-refs";

/** Mode d'injection d'une compétence livre pour une génération donnée. */
export type BookSkillStampMode = "integral" | "index-only";

export interface KnowledgeStampSkill {
  id: string;
  title: string;
  mode: BookSkillStampMode;
}

/** Entrée de registre juridique au stamp (cycle urbanis-dz-registre). */
export interface KnowledgeStampLegalRef {
  id: string;
  reference: string;
  mode: BookSkillStampMode;
}

/** Objet sérialisable en JSON, persisté sur Chapter / ChapterVersion. */
export interface KnowledgeStamp {
  coreVersion: string;
  skills: KnowledgeStampSkill[];
  /** Optionnel — registre juridique URBANIS-DZ injecté (absent = aucun). */
  legalRefs?: KnowledgeStampLegalRef[];
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
  /** Registre juridique actif (ordre d'injection) — absent = aucun. */
  legalRefs?: LegalRefInput[];
  legalRefsBudgetChars?: number;
}): KnowledgeStamp {
  const selection = selectBookSkills(
    input.skills,
    input.contentBudgetChars ?? BOOK_SKILLS_CONTENT_BUDGET_CHARS
  );
  const injectedIds = new Set(selection.injected.map((s) => s.id));
  const legalRefs =
    input.legalRefs && input.legalRefs.length > 0
      ? (() => {
          const legalSelection = selectLegalRefs(
            input.legalRefs,
            input.legalRefsBudgetChars ?? LEGAL_REFS_CONTENT_BUDGET_CHARS
          );
          const legalInjectedIds = new Set(legalSelection.injected.map((r) => r.id));
          return input.legalRefs.map((r) => ({
            id: r.id,
            reference: r.reference,
            mode: legalInjectedIds.has(r.id) ? ("integral" as const) : ("index-only" as const),
          }));
        })()
      : undefined;
  return {
    coreVersion: input.coreVersion,
    skills: input.skills.map((s) => ({
      id: s.id,
      title: s.title,
      mode: injectedIds.has(s.id) ? "integral" : "index-only",
    })),
    ...(legalRefs ? { legalRefs } : {}),
    generatedAt: input.generatedAt,
  };
}

/** Ligne de résumé (toujours visible) : noyau + nombre de compétences. */
export function formatKnowledgeStampSummary(stamp: KnowledgeStamp): string {
  const n = stamp.skills.length;
  const base =
    n === 0
      ? `noyau de connaissance v${stamp.coreVersion} — aucune compétence livre active`
      : (() => {
          const pluriel = n > 1 ? "s" : "";
          return `noyau de connaissance v${stamp.coreVersion} + ${n} compétence${pluriel} livre${pluriel}`;
        })();
  const lr = stamp.legalRefs?.length ?? 0;
  if (lr === 0) return base;
  const plurielR = lr > 1 ? "s" : "";
  return `${base} + ${lr} entrée${plurielR} du registre juridique`;
}

/** Détail dépliable : une ligne par compétence, avec son mode. */
export function formatKnowledgeStampDetail(stamp: KnowledgeStamp): string[] {
  const lines = stamp.skills.map(
    (s, i) =>
      `[L${i + 1}] ${s.title} — ${
        s.mode === "integral"
          ? "injectée en intégral"
          : "index seulement (budget)"
      }`
  );
  if (stamp.legalRefs && stamp.legalRefs.length > 0) {
    lines.push(
      ...stamp.legalRefs.map(
        (r, i) =>
          `[R${i + 1}] ${r.reference} — ${
            r.mode === "integral"
              ? "injectée en intégral"
              : "index seulement (budget)"
          }`
      )
    );
  }
  return lines;
}

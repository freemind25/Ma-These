// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Canal « Registre juridique URBANIS-DZ » (injection IA)
// Bibliothèque PURE — aucun import db.
// Accès serveur : src/lib/ai/legal-refs-server.ts
// Couche documentaire du pack URBANIS-DZ (§7) : entrées structurées
// à 11 champs, fidèles aux vigilances du pack. Mécanique calquée sur
// book-skills (sélection déterministe, plafonds, index/intégral).
// ═══════════════════════════════════════════════════════════════

/** Plafond de l'index léger (caractères). */
export const LEGAL_REFS_INDEX_BUDGET_CHARS = 1_500;

/** Plafond du contenu intégral injecté (caractères). */
export const LEGAL_REFS_CONTENT_BUDGET_CHARS = 8_000;

/** Entrée de registre active telle que remontée de la base. */
export interface LegalRefInput {
  id: string;
  domaine: string;
  reference: string;
  joradp?: string | null;
  statut?: string | null;
  textesLies?: string | null;
  portee?: string | null;
  questions?: string | null;
  autorites?: string | null;
  niveauConfiance?: string | null;
}

export interface LegalRefSelection {
  /** Entrées dont le bloc détaillé est injecté. */
  injected: LegalRefInput[];
  /** Entrées actives non injectées (budget dépassé) — restent dans l'index. */
  skipped: LegalRefInput[];
  /** Nombre de caractères réellement injectés. */
  injectedChars: number;
}

/**
 * Texte d'une entrée, composé depuis ses champs (le registre §7 est
 * de la métadonnée structurée — aucune colonne de contenu libre).
 * La vigilance (statut tel que formulé) est conservée verbatim.
 */
export function composeLegalRefText(ref: LegalRefInput): string {
  const meta: string[] = [];
  if (ref.joradp) meta.push(`JORADP : ${ref.joradp}`);
  if (ref.statut) meta.push(`Statut : ${ref.statut}`);
  if (ref.textesLies) meta.push(`Textes liés : ${ref.textesLies}`);
  if (ref.autorites) meta.push(`Autorités : ${ref.autorites}`);
  if (ref.niveauConfiance) meta.push(`Niveau de confiance : ${ref.niveauConfiance}`);
  const metaLine = meta.length > 0 ? meta.join(" | ") : "";
  const portee = ref.portee ? `\nPortée : ${ref.portee}` : "";
  const questions = ref.questions ? `\nQuestions couvertes : ${ref.questions}` : "";
  return `[${ref.domaine}] ${ref.reference}${portee}${questions}${metaLine ? "\n" + metaLine : ""}`;
}

/** Sélection déterministe — même algorithme que selectBookSkills. */
export function selectLegalRefs(
  refs: LegalRefInput[],
  budgetChars: number = LEGAL_REFS_CONTENT_BUDGET_CHARS
): LegalRefSelection {
  const injected: LegalRefInput[] = [];
  const skipped: LegalRefInput[] = [];
  let used = 0;
  for (const ref of refs) {
    const size = composeLegalRefText(ref).length;
    if (used + size <= budgetChars) {
      injected.push(ref);
      used += size;
    } else {
      skipped.push(ref);
    }
  }
  return { injected, skipped, injectedChars: used };
}

/** Index numéroté [R1]…[Rn] de toutes les entrées actives. */
export function buildLegalRefsIndex(
  refs: LegalRefInput[],
  selection: LegalRefSelection,
  budgetChars: number = LEGAL_REFS_INDEX_BUDGET_CHARS
): string {
  const skippedIds = new Set(selection.skipped.map((r) => r.id));
  const lines = refs.map((ref, i) => {
    const skippedSuffix = skippedIds.has(ref.id) ? " — contenu non injecté (budget)" : "";
    return `[R${i + 1}] (${ref.domaine}) ${ref.reference}${skippedSuffix}`;
  });
  let text = lines.join("\n");
  if (text.length > budgetChars) {
    text = text.slice(0, budgetChars).replace(/\n?[^\n]*$/, "") + "\n… (index tronqué)";
  }
  return text;
}

/**
 * Bloc complet injecté dans le prompt du mode URBANIS-DZ — ou `null`
 * s'il n'existe aucune entrée active (non-régression byte-identique, CA-2.2).
 * Garde-fous (règles transverses de la spec) : appui documentaire,
 * jamais une autorisation, jamais une source de citations, vigilances
 * et non-opposabilité conservées.
 */
export function buildLegalRefsSection(
  refs: LegalRefInput[],
  contentBudgetChars: number = LEGAL_REFS_CONTENT_BUDGET_CHARS
): string | null {
  if (refs.length === 0) return null;

  const selection = selectLegalRefs(refs, contentBudgetChars);
  const index = buildLegalRefsIndex(refs, selection);

  const contents = selection.injected
    .map((ref) => {
      const header = `──── R${refs.indexOf(ref) + 1} ────`;
      return `${header}\n${composeLegalRefText(ref)}`;
    })
    .join("\n\n");

  return [
    "REGISTRE JURIDIQUE ACTIF — référentiel documentaire URBANIS-DZ :",
    "- Ces entrées sont un appui documentaire pour cadrer tes réponses : identifie les textes applicables et leurs vigilances.",
    "- Elles ne constituent JAMAIS une autorisation, jamais une citation bibliographique, et ne remplacent jamais la vérification des textes.",
    "- Conserve les vigilances telles quelles (« À vérifier au JORADP », « Modifié et complété ; vérifier »…) — ne les convertis jamais en affirmation de statut.",
    "- Rappel permanent : avis technique non opposable — toute règle juridique doit être vérifiée au JORADP.",
    "",
    "INDEX DU REGISTRE :",
    index,
    "",
    "ENTRÉES DÉTAILLÉES SÉLECTIONNÉES :",
    contents,
  ].join("\n");
}

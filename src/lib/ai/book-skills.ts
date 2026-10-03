// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Canal « Compétences livres » (injection IA)
// Bibliothèque PURE — aucun import db.
// Accès serveur : src/lib/ai/book-skills-server.ts
// Principe (inspiration SKILL.md / skills.sh) : un savoir jamais
// chargé ne sert à rien ; une description d'usage décide quand le
// charger ; le contenu intégral ne se charge que dans un budget.
// ═══════════════════════════════════════════════════════════════

/** Plafond de l'index léger (caractères). */
export const BOOK_SKILLS_INDEX_BUDGET_CHARS = 1_500;

/** Plafond du contenu intégral injecté (caractères, ≈ 3 000 tokens). */
export const BOOK_SKILLS_CONTENT_BUDGET_CHARS = 12_000;

/** Ressource active telle que remontée de la base (via book-skills-server). */
export interface BookSkillInput {
  id: string;
  title: string;
  author?: string | null;
  description?: string | null;
  tags?: string | null;
  source?: string | null;
  content: string;
}

export interface BookSkillSelection {
  /** Ressources dont le contenu intégral est injecté. */
  injected: BookSkillInput[];
  /** Ressources actives non injectées (budget dépassé) — restent dans l'index. */
  skipped: BookSkillInput[];
  /** Nombre de caractères de contenu réellement injecté. */
  injectedChars: number;
}

/**
 * Sélection déterministe (décision déléguée n°2 de la spec) : l'ordre fourni
 * fait foi (récence d'abord côté serveur) ; chaque ressource est prise
 * entière tant que le plafond cumulé n'est pas dépassé ; une ressource trop
 * grande passe en « skipped » et l'on continue avec les suivantes.
 */
export function selectBookSkills(
  skills: BookSkillInput[],
  budgetChars: number = BOOK_SKILLS_CONTENT_BUDGET_CHARS
): BookSkillSelection {
  const injected: BookSkillInput[] = [];
  const skipped: BookSkillInput[] = [];
  let used = 0;
  for (const skill of skills) {
    if (used + skill.content.length <= budgetChars) {
      injected.push(skill);
      used += skill.content.length;
    } else {
      skipped.push(skill);
    }
  }
  return { injected, skipped, injectedChars: used };
}

/** Index numéroté [L1]…[Ln] de toutes les compétences actives. */
export function buildBookSkillsIndex(
  skills: BookSkillInput[],
  selection: BookSkillSelection,
  budgetChars: number = BOOK_SKILLS_INDEX_BUDGET_CHARS
): string {
  const skippedIds = new Set(selection.skipped.map((s) => s.id));
  const lines = skills.map((skill, i) => {
    const label = `[L${i + 1}] ${skill.title}`;
    const meta: string[] = [];
    if (skill.description) meta.push(skill.description);
    if (skill.tags) meta.push(skill.tags);
    const metaSuffix = meta.length > 0 ? ` — ${meta.join(" · ")}` : "";
    const skippedSuffix = skippedIds.has(skill.id)
      ? " — contenu non injecté (budget)"
      : "";
    return `${label}${metaSuffix}${skippedSuffix}`;
  });
  let text = lines.join("\n");
  if (text.length > budgetChars) {
    text = text.slice(0, budgetChars).replace(/\n?[^\n]*$/, "") + "\n… (index tronqué)";
  }
  return text;
}

/**
 * Bloc complet injecté dans le prompt système — ou `null` s'il n'existe
 * aucune compétence active (non-régression byte-identique, CA-3.1).
 * Règle d'intégrité (CA-3.5) : appui rédactionnel, JAMAIS source de citations.
 */
export function buildBookSkillsSection(
  skills: BookSkillInput[],
  contentBudgetChars: number = BOOK_SKILLS_CONTENT_BUDGET_CHARS
): string | null {
  if (skills.length === 0) return null;

  const selection = selectBookSkills(skills, contentBudgetChars);
  const index = buildBookSkillsIndex(skills, selection);

  const contents = selection.injected
    .map((skill) => {
      const header = `──── L${skills.indexOf(skill) + 1} : ${skill.title} ────`;
      const meta: string[] = [];
      if (skill.author) meta.push(`auteur : ${skill.author}`);
      if (skill.source) meta.push(`provenance : ${skill.source}`);
      const metaLine = meta.length > 0 ? meta.join(" | ") + "\n" : "";
      return `${header}\n${metaLine}${skill.content}`;
    })
    .join("\n\n");

  return [
    "COMPÉTENCES LIVRES ACTIVES — savoirs personnels mobilisables :",
    "- Ces savoirs sont un appui rédactionnel et méthodologique : applique leurs principes et leurs garde-fous.",
    "- Ils ne sont JAMAIS une source de citations : n'en tire AUCUNE référence bibliographique, aucune mention « (Auteur, année) », aucune œuvre inventée à partir d'eux.",
    "- En cas de conflit avec les règles de citation ou le contexte de la thèse, ces règles priment.",
    "",
    "INDEX DES COMPÉTENCES :",
    index,
    "",
    "CONTENU INTÉGRAL DES COMPÉTENCES SÉLECTIONNÉES :",
    contents,
  ].join("\n");
}

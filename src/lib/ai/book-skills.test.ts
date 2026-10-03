// ═══════════════════════════════════════════════════════════════
// Tests du canal « Compétences livres » — fonctions pures
// Couverture : null si vide (CA-3.1), section + règle de citation
// (CA-3.2/3.5), budget et mention « non injecté » (CA-3.3), ordre
// déterministe, plafond d'index, exclusion des désactivées côté
// appelant (CA-3.4 — intégration).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  buildBookSkillsSection,
  buildBookSkillsIndex,
  selectBookSkills,
  BOOK_SKILLS_CONTENT_BUDGET_CHARS,
  BOOK_SKILLS_INDEX_BUDGET_CHARS,
  type BookSkillInput,
} from "./book-skills";

const skill = (over: Partial<BookSkillInput> = {}): BookSkillInput => ({
  id: "s1",
  title: "Méthode du commentaire",
  author: "J. Dupont",
  description: "Quand rédiger un commentaire de texte",
  tags: "méthode, rédaction",
  source: "Cours magistral 2026",
  content: "Contenu de la compétence.",
  ...over,
});

describe("buildBookSkillsSection — non-régression", () => {
  it("retourne null pour 0 compétence active (CA-3.1)", () => {
    expect(buildBookSkillsSection([])).toBeNull();
  });
});

describe("buildBookSkillsSection — section injectée", () => {
  const section = buildBookSkillsSection([skill()]) ?? "";

  it("produit une section titrée « COMPÉTENCES LIVRES » (CA-3.2)", () => {
    expect(section).toContain("COMPÉTENCES LIVRES ACTIVES");
  });

  it("contient l'index avec titre, description et tags (CA-3.2)", () => {
    expect(section).toContain("[L1] Méthode du commentaire");
    expect(section).toContain("Quand rédiger un commentaire de texte");
    expect(section).toContain("méthode, rédaction");
  });

  it("contient le contenu intégral et les métadonnées (CA-3.2)", () => {
    expect(section).toContain("Contenu de la compétence.");
    expect(section).toContain("auteur : J. Dupont");
    expect(section).toContain("provenance : Cours magistral 2026");
  });

  it("instruit que les savoirs ne sont jamais une source de citations (CA-3.5)", () => {
    expect(section).toContain("JAMAIS une source de citations");
    expect(section).toContain("aucune mention « (Auteur, année) »");
  });
});

describe("selectBookSkills — budget déterministe (CA-3.3)", () => {
  const a = skill({ id: "a", title: "A", content: "x".repeat(8_000) });
  const b = skill({ id: "b", title: "B", content: "y".repeat(8_000) });
  const c = skill({ id: "c", title: "C", content: "z".repeat(2_000) });

  it("s'arrête au plafond cumulé et marque la suivante skipped", () => {
    const sel = selectBookSkills([a, b], 12_000);
    expect(sel.injected.map((s) => s.id)).toEqual(["a"]);
    expect(sel.skipped.map((s) => s.id)).toEqual(["b"]);
    expect(sel.injectedChars).toBe(8_000);
  });

  it("continue avec les suivantes après un saut", () => {
    const sel = selectBookSkills([a, b, c], 12_000);
    expect(sel.injected.map((s) => s.id)).toEqual(["a", "c"]);
    expect(sel.skipped.map((s) => s.id)).toEqual(["b"]);
  });

  it("l'ordre fourni fait foi (récence côté serveur)", () => {
    const sel = selectBookSkills([b, a], 12_000);
    expect(sel.injected.map((s) => s.id)).toEqual(["b"]);
    expect(sel.skipped.map((s) => s.id)).toEqual(["a"]);
  });

  it("plafond par défaut = 12 000 caractères", () => {
    expect(BOOK_SKILLS_CONTENT_BUDGET_CHARS).toBe(12_000);
  });
});

describe("buildBookSkillsIndex — mention budget et plafond", () => {
  it("mentionne « contenu non injecté (budget) » pour les sautées (CA-3.3)", () => {
    const a = skill({ id: "a", title: "A", content: "x".repeat(8_000) });
    const b = skill({ id: "b", title: "B", content: "y".repeat(8_000) });
    const sel = selectBookSkills([a, b], 12_000);
    const index = buildBookSkillsIndex([a, b], sel);
    expect(index).toContain("[L2] B");
    expect(index).toContain("contenu non injecté (budget)");
    expect(index).not.toContain("[L1] A — contenu non injecté");
  });

  it("tronque l'index au plafond de 1 500 caractères", () => {
    const many = Array.from({ length: 60 }, (_, i) =>
      skill({
        id: `s${i}`,
        title: `Compétence numéro ${i} avec un titre volontairement long`,
        description: "Description d'usage détaillée",
        content: "x",
      })
    );
    const sel = selectBookSkills(many);
    const index = buildBookSkillsIndex(many, sel);
    expect(index.length).toBeLessThanOrEqual(
      BOOK_SKILLS_INDEX_BUDGET_CHARS + "… (index tronqué)".length + 1
    );
    expect(index).toContain("(index tronqué)");
  });
});

// ═══════════════════════════════════════════════════════════════
// Tests du canal « Registre juridique URBANIS-DZ » — fonctions pures.
// Couverture : sélection budget (CA-2.3), index tronqué propre,
// section nulle à 0 active (CA-2.2), garde-fous, composition
// d'entrée avec vigilance verbatim (CA-3.2).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  LEGAL_REFS_CONTENT_BUDGET_CHARS,
  LEGAL_REFS_INDEX_BUDGET_CHARS,
  composeLegalRefText,
  selectLegalRefs,
  buildLegalRefsIndex,
  buildLegalRefsSection,
  type LegalRefInput,
} from "./legal-refs";

const ref = (id: string, reference: string, extra: Partial<LegalRefInput> = {}): LegalRefInput => ({
  id,
  domaine: "Urbanisme",
  reference,
  ...extra,
});

describe("composeLegalRefText", () => {
  it("compose l'entrée depuis ses champs avec la vigilance verbatim (CA-3.2)", () => {
    const text = composeLegalRefText(
      ref("r1", "Arrêté interministériel du 14 septembre 2014", {
        portee: "Modalités d'examen et d'approbation des études de danger.",
        statut: "À vérifier au JORADP.",
      })
    );
    expect(text).toContain("[Urbanisme] Arrêté interministériel du 14 septembre 2014");
    expect(text).toContain("Portée : Modalités d'examen et d'approbation des études de danger.");
    expect(text).toContain("Statut : À vérifier au JORADP.");
  });

  it("tolère une entrée minimale (domaine + référence seuls)", () => {
    const text = composeLegalRefText(ref("r2", "Loi n° 90-29"));
    expect(text).toBe("[Urbanisme] Loi n° 90-29");
  });
});

describe("selectLegalRefs", () => {
  it("prend chaque entrée entière tant que le plafond cumulé tient", () => {
    const refs = [ref("a", "Loi A"), ref("b", "Loi B"), ref("c", "Loi C")];
    const selection = selectLegalRefs(refs, composeLegalRefText(refs[0]).length);
    expect(selection.injected.map((r) => r.id)).toEqual(["a"]);
    expect(selection.skipped.map((r) => r.id)).toEqual(["b", "c"]);
  });

  it("respecte le budget par défaut (constante exportée)", () => {
    expect(LEGAL_REFS_CONTENT_BUDGET_CHARS).toBe(8_000);
    expect(LEGAL_REFS_INDEX_BUDGET_CHARS).toBe(1_500);
  });
});

describe("buildLegalRefsIndex", () => {
  it("numérote [R1]…[Rn] et marque les entrées hors budget", () => {
    const refs = [ref("a", "Loi A"), ref("b", "Loi B")];
    const selection = selectLegalRefs(refs, 1); // tout hors budget
    const index = buildLegalRefsIndex(refs, selection);
    expect(index).toContain("[R1] (Urbanisme) Loi A — contenu non injecté (budget)");
    expect(index).toContain("[R2] (Urbanisme) Loi B — contenu non injecté (budget)");
  });

  it("tronque proprement sur une limite de ligne", () => {
    const refs = Array.from({ length: 40 }, (_, i) => ref(`r${i}`, `Loi n° ${i} du 1er décembre 1990 portant loi de finances`));
    const index = buildLegalRefsIndex(refs, selectLegalRefs(refs, 1), 300);
    expect(index.length).toBeLessThanOrEqual(320);
    expect(index.endsWith("… (index tronqué)")).toBe(true);
  });
});

describe("buildLegalRefsSection", () => {
  it("retourne null à 0 entrée active (CA-2.2)", () => {
    expect(buildLegalRefsSection([])).toBeNull();
  });

  it("porte les garde-fous : appui, jamais autorisation, jamais citation, JORADP", () => {
    const section = buildLegalRefsSection([ref("r1", "Loi n° 90-29")]);
    expect(section).toContain("REGISTRE JURIDIQUE ACTIF");
    expect(section).toContain("JAMAIS une autorisation");
    expect(section).toContain("jamais une citation bibliographique");
    expect(section).toContain("vérifiée au JORADP");
    expect(section).toContain("ne les convertis jamais en affirmation de statut");
  });

  it("inclut les entrées détaillées et l'index", () => {
    const section = buildLegalRefsSection([ref("r1", "Loi A", { portee: "Portée A" })]);
    expect(section).toContain("──── R1 ────");
    expect(section).toContain("Portée : Portée A");
    expect(section).toContain("[R1] (Urbanisme) Loi A");
  });
});

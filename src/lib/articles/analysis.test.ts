import { describe, it, expect } from "vitest";
import { analyzeSources, detectHeadings, fragmentationRisk } from "./analysis";
import { buildAnglesPrompt, parseAnglesResponse, type SourceBlock } from "./prompts";

const block = (label: string, kind: string, content: string): SourceBlock => ({
  label,
  kind: kind as SourceBlock["kind"],
  content,
});

describe("analysis — analyse pure des sources (CA-B1)", () => {
  it("calcule les volumes, titres et qualité", () => {
    const a = analyzeSources([
      block("Chapitre — Méthodologie", "projet", "Méthodologie de l'enquête\nÉchantillon de 42 techniciens\nEnquête par questionnaire." + " Détail du protocole et des outils d'analyse statistique mobilisés pour l'étude.".repeat(60)),
      block("Mémoire importé", "imported", "Résultats principaux.\nCorrélation observée.\n\nBibliographie\n[1] Auteur."),
      block("Références (12)", "reference", "[REF] Titre — Auteur"),
    ]);
    expect(a.totalChars).toBeGreaterThan(100);
    expect(a.bySource).toHaveLength(3);
    expect(a.headings).toContain("Méthodologie de l'enquête");
    expect(a.missing).toHaveLength(0);
    expect(a.quality).toBe("complète");
  });

  it("signale honnêtement les manquants (méthodo, résultats, biblio)", () => {
    const a = analyzeSources([block("Notes", "notebook", "Question → réponse courte.")]);
    const kinds = a.missing.map((m) => m.split(" :")[0]);
    expect(kinds).toContain("Méthodologie");
    expect(kinds).toContain("Résultats");
    expect(kinds).toContain("Bibliographie");
    expect(a.quality).not.toBe("complète");
  });

  it("détecte les études via les blocs experiment (CA-B2)", () => {
    const a = analyzeSources([
      block("Expérimentation — SIG", "experiment", "Question/hypothèse : Les SIG réduisent-ils les délais ?\nVerdict : supported"),
      block("Expérimentation — Permis", "experiment", "Question/hypothèse : Le numérique améliore-t-il la conformité ?\nVerdict : inconclusive"),
    ]);
    expect(a.studies).toHaveLength(2);
    expect(a.studies[0].verdict).toBe("supported");
  });

  it("detectHeadings borne la sortie", () => {
    const h = detectHeadings("Intro valide\nphrase avec point final.\n\nRésultats");
    expect(h).toContain("Intro valide");
    expect(h).toContain("Résultats");
    expect(h).not.toContain("phrase avec point final.");
  });
});

describe("analysis — anti-fragmentation (CA-B2/B3)", () => {
  it("avertit quand plusieurs études ET plusieurs angles", () => {
    const r = fragmentationRisk({ studiesCount: 3, anglesCount: 4 });
    expect(r.risk).toBe(true);
    expect(r.message).toContain("fragmentation artificielle");
    expect(r.message).toContain("un seul angle");
  });
  it("pas d'avertissement en dessous des seuils", () => {
    expect(fragmentationRisk({ studiesCount: 1, anglesCount: 3 }).risk).toBe(false);
    expect(fragmentationRisk({ studiesCount: 3, anglesCount: 1 }).risk).toBe(false);
  });
});

describe("prompts — angles (option B)", () => {
  it("prompt JSON strict + parse borné à 4", () => {
    const meta = { title: "T", articleType: "empirique", targetLang: "fr", targetWords: 6000, biblioStyle: "APA" };
    const p = buildAnglesPrompt(meta, [block("X", "projet", "contenu")]);
    expect(p).toContain('"angles":[{"angle"');
    expect(p).toContain("JAMAIS un plan complet");
    const raw = '```json\n{"angles":[' +
      Array.from({ length: 6 }, (_, i) => `{"angle":"A${i}","rationale":"r","coverage":"c"}`).join(",") +
      ']}\n```';
    const angles = parseAnglesResponse(raw);
    expect(angles).toHaveLength(4);
    expect(angles[0].angle).toBe("A0");
    expect(() => parseAnglesResponse('{"angles":[]}')).toThrow();
  });
});

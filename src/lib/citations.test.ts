// ═══════════════════════════════════════════════════════════════
// citations — tests unitaires (Vitest)
// Couverture : détection parenthétique (simple, multiple « ; », et al.),
// narrative, appariement (année exacte puis approximative, sans match),
// collectFootnotes (unicité des ids, ordre de première apparition),
// replaceCitationsWithMarks (HTML réaliste, citation inconnue, attributs).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  buildFootnoteRawMap,
  buildReferenceIndex,
  collectFootnotes,
  extractCitationsFromText,
  findMatchingReference,
  replaceCitationsWithMarks,
  splitTextAtCitations,
  CitationReference,
  ExtractedCitation,
} from "./citations";

function ref(partial: Partial<CitationReference> & { id: string }): CitationReference {
  return {
    authors: "Smith",
    title: "Titre",
    year: 2020,
    type: "book",
    journal: null,
    volume: null,
    issue: null,
    pages: null,
    publisher: null,
    doi: null,
    url: null,
    ...partial,
  };
}

// ── Détection : citations parenthétiques ──────────────────────────────
describe("extractCitationsFromText > parenthétiques", () => {
  it("détecte une citation parenthétique simple (Auteur, année)", () => {
    const citations = extractCitationsFromText("Une avancée majeure (Smith, 2020) ici.");
    expect(citations).toHaveLength(1);
    expect(citations[0].raw).toBe("(Smith, 2020)");
    expect(citations[0].author).toBe("Smith");
    expect(citations[0].authorKey).toBe("smith");
    expect(citations[0].year).toBe(2020);
    expect(citations[0].kind).toBe("parenthetical");
  });

  it("détecte plusieurs citations séparées par « ; »", () => {
    const citations = extractCitationsFromText(
      "Résultats convergents (Smith, 2020 ; Jones, 2021) dans la littérature."
    );
    expect(citations).toHaveLength(2);
    expect(citations[0].author).toBe("Smith");
    expect(citations[0].year).toBe(2020);
    expect(citations[1].author).toBe("Jones");
    expect(citations[1].year).toBe(2021);
  });

  it("détecte « et al. » dans une citation parenthétique", () => {
    const citations = extractCitationsFromText("Confirmation récente (Martin et al., 2022).");
    expect(citations).toHaveLength(1);
    expect(citations[0].author).toBe("Martin et al.");
    expect(citations[0].authorKey).toBe("martin");
    expect(citations[0].display).toBe("Martin et al. (2022)");
  });

  it("détecte la forme « Auteur & Auteur, année »", () => {
    const citations = extractCitationsFromText("Une paire d'auteurs (Bernard & Colin, 2019).");
    expect(citations).toHaveLength(1);
    expect(citations[0].authorKey).toBe("bernard");
    expect(citations[0].display).toBe("Bernard & Colin (2019)");
  });

  it("déduplique les citations identiques", () => {
    const citations = extractCitationsFromText(
      "(Smith, 2020) puis à nouveau (Smith, 2020) plus loin."
    );
    expect(citations).toHaveLength(1);
  });
});

// ── Détection : citations narratives ──────────────────────────────────
describe("extractCitationsFromText > narratives", () => {
  it("détecte une citation narrative « Auteur (année) »", () => {
    const citations = extractCitationsFromText("Comme l'a montré Smith (2020), le phénomène.");
    expect(citations).toHaveLength(1);
    expect(citations[0].raw).toBe("Smith (2020)");
    expect(citations[0].kind).toBe("narrative");
    expect(citations[0].year).toBe(2020);
  });

  it("détecte « Auteur et al. (année) »", () => {
    const citations = extractCitationsFromText("Martin et al. (2021) concluent différemment.");
    expect(citations).toHaveLength(1);
    expect(citations[0].author).toBe("Martin et al.");
    expect(citations[0].kind).toBe("narrative");
  });

  it("respecte l'ordre de première apparition entre narrative et parenthétique", () => {
    const citations = extractCitationsFromText(
      "Smith (2020) d'abord, puis (Jones, 2021) ensuite."
    );
    expect(citations.map((c) => c.authorKey)).toEqual(["smith", "jones"]);
  });

  it("cumule les formes littérales d'une même citation (narrative + parenthétique)", () => {
    const citations = extractCitationsFromText(
      "Smith (2020) d'abord, puis (Smith, 2020) à nouveau."
    );
    expect(citations).toHaveLength(1);
    expect(citations[0].occurrences.map((o) => o.raw)).toEqual([
      "Smith (2020)",
      "(Smith, 2020)",
    ]);
  });
});

// ── Appariement aux références ────────────────────────────────────────
describe("buildReferenceIndex / findMatchingReference", () => {
  const references = [
    ref({ id: "r1", authors: "Smith", year: 2020, title: "Œuvre de 2020" }),
    ref({ id: "r2", authors: "Smith", year: 2018, title: "Œuvre de 2018" }),
    ref({ id: "r3", authors: "Doe, J.", year: 2019 }),
  ];
  const index = buildReferenceIndex(references);

  it("préfère la correspondance d'année exacte", () => {
    const citation: ExtractedCitation = {
      raw: "(Smith, 2018)",
      occurrences: [{ raw: "(Smith, 2018)", kind: "parenthetical" }],
      author: "Smith",
      authorKey: "smith",
      year: 2018,
      display: "Smith (2018)",
      kind: "parenthetical",
    };
    expect(findMatchingReference(citation, index)?.id).toBe("r2");
  });

  it("retombe sur la première référence de l'auteur si l'année ne correspond pas", () => {
    const citation: ExtractedCitation = {
      raw: "(Smith, 1999)",
      occurrences: [{ raw: "(Smith, 1999)", kind: "parenthetical" }],
      author: "Smith",
      authorKey: "smith",
      year: 1999,
      display: "Smith (1999)",
      kind: "parenthetical",
    };
    const matched = findMatchingReference(citation, index);
    expect(matched?.id).toBe("r1");
  });

  it("indexe plusieurs clés d'auteurs par référence (séparés par « ; »)", () => {
    const multi = buildReferenceIndex([
      ref({ id: "rm", authors: "Dubois; Martin, A.", year: 2001 }),
    ]);
    const c1: ExtractedCitation = {
      raw: "(Dubois, 2001)",
      occurrences: [],
      author: "Dubois",
      authorKey: "dubois",
      year: 2001,
      display: "Dubois (2001)",
      kind: "parenthetical",
    };
    const c2: ExtractedCitation = {
      raw: "(A. Martin, 2001)",
      occurrences: [],
      author: "A. Martin",
      authorKey: "martin_a",
      year: 2001,
      display: "A. Martin (2001)",
      kind: "parenthetical",
    };
    expect(findMatchingReference(c1, multi)?.id).toBe("rm");
    expect(findMatchingReference(c2, multi)?.id).toBe("rm");
  });

  it("ne matche pas une citation sans référence correspondante (année sans match, auteur inconnu)", () => {
    const citation: ExtractedCitation = {
      raw: "(Ghost, 2021)",
      occurrences: [{ raw: "(Ghost, 2021)", kind: "parenthetical" }],
      author: "Ghost",
      authorKey: "ghost",
      year: 2021,
      display: "Ghost (2021)",
      kind: "parenthetical",
    };
    expect(findMatchingReference(citation, index)).toBeNull();
  });
});

// ── collectFootnotes ──────────────────────────────────────────────────
describe("collectFootnotes", () => {
  const references = [
    ref({ id: "r-smith", authors: "Smith", year: 2020, title: "Comprendre" }),
    ref({ id: "r-doe", authors: "Doe", year: 2019, title: "Méthodologie" }),
  ];

  it("numérote les notes à partir de 1, dans l'ordre de première apparition", () => {
    const entries = collectFootnotes(
      ["Texte (Doe, 2019) puis (Smith, 2020)."],
      references
    );
    expect(entries.map((e) => e.id)).toEqual([1, 2]);
    expect(entries[0].reference.id).toBe("r-doe");
    expect(entries[1].reference.id).toBe("r-smith");
    expect(entries[0].firstAuthor).toBe("Doe");
    expect(entries[0].year).toBe(2019);
  });

  it("crée UNE note unique par référence, partagée par toutes ses citations (CA-1.5)", () => {
    const entries = collectFootnotes(
      ["Smith (2020) d'abord, (Smith, 2020) ensuite, sur deux chapitres."],
      references
    );
    const chap2 = collectFootnotes(["Encore (Smith, 2020)."], references);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(1);
    expect(entries[0].citations).toHaveLength(1);
    expect(entries[0].citations[0].occurrences).toHaveLength(2);
    expect(chap2[0].id).toBe(1);
  });

  it("assure une numérotation continue à travers plusieurs chapitres", () => {
    const entries = collectFootnotes(
      ["Chapitre un cite (Smith, 2020).", "Chapitre deux cite (Doe, 2019) puis (Smith, 2020)."],
      references
    );
    expect(entries.map((e) => e.id)).toEqual([1, 2]);
    expect(entries[0].citations).toHaveLength(2); // Smith : chapitre 1 + chapitre 2
  });

  it("ignore les citations sans correspondance dans la bibliothèque (CA-1.3)", () => {
    const entries = collectFootnotes(
      ["Une citation inconnue (Ghost, 2021) et une connue (Smith, 2020)."],
      references
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].reference.id).toBe("r-smith");
  });

  it("retourne une liste vide sans correspondance ni références", () => {
    expect(collectFootnotes(["(Ghost, 2021)"], references)).toEqual([]);
    expect(collectFootnotes(["(Smith, 2020)"], [])).toEqual([]);
    expect(collectFootnotes([], references)).toEqual([]);
  });
});

// ── Remplacement dans le HTML ─────────────────────────────────────────
describe("replaceCitationsWithMarks / splitTextAtCitations", () => {
  const references = [
    ref({ id: "r-smith", authors: "Smith", year: 2020, title: "Comprendre" }),
    ref({ id: "r-doe", authors: "Doe", year: 2019, title: "Méthodologie" }),
  ];
  const entries = collectFootnotes(
    ["Smith (2020) d'abord, puis (Smith, 2020) et (Doe, 2019)."],
    references
  );

  it("remplace une citation dans un paragraphe contenant du gras", () => {
    const html = "<p>Un <strong>point important</strong> (Smith, 2020) ici.</p>";
    const out = replaceCitationsWithMarks(html, entries);
    expect(out).toBe(
      '<p>Un <strong>point important</strong> <sup class="footnote-ref" id="fn-ref-1">1</sup> ici.</p>'
    );
  });

  it("marque toutes les occurrences de la même citation du même numéro", () => {
    const html = "<p>(Doe, 2019) et encore (Doe, 2019) plus loin.</p>";
    const out = replaceCitationsWithMarks(html, entries);
    expect(out).toBe(
      '<p><sup class="footnote-ref" id="fn-ref-2">2</sup> et encore <sup class="footnote-ref" id="fn-ref-2">2</sup> plus loin.</p>'
    );
  });

  it("conserve le nom d'auteur devant l'exposant pour une citation narrative", () => {
    const html = "<p>Comme le montre Smith (2020), cela tient.</p>";
    const out = replaceCitationsWithMarks(html, entries);
    expect(out).toBe(
      '<p>Comme le montre Smith<sup class="footnote-ref" id="fn-ref-1">1</sup>, cela tient.</p>'
    );
  });

  it("laisse intacte une citation sans correspondance (CA-1.3)", () => {
    const html = "<p>Une citation (Ghost, 2021) inconnue.</p>";
    expect(replaceCitationsWithMarks(html, entries)).toBe(html);
  });

  it("ne remplace jamais dans un attribut de balise", () => {
    const html = '<p><a href="/source-(Doe, 2019)">voir (Doe, 2019)</a></p>';
    const out = replaceCitationsWithMarks(html, entries);
    expect(out).toBe(
      '<p><a href="/source-(Doe, 2019)">voir <sup class="footnote-ref" id="fn-ref-2">2</sup></a></p>'
    );
  });

  it("retourne le HTML inchangé sans entrées", () => {
    const html = "<p>(Smith, 2020)</p>";
    expect(replaceCitationsWithMarks(html, [])).toBe(html);
  });

  it("découpe un texte brut aux positions des citations (usage DOCX)", () => {
    const map = buildFootnoteRawMap(entries);
    const segments = splitTextAtCitations("Avant (Doe, 2019) après.", map);
    expect(segments).toEqual([
      { text: "Avant ", footnoteId: null },
      { text: "", footnoteId: 2 },
      { text: " après.", footnoteId: null },
    ]);
  });
});

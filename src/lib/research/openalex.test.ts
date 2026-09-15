import { describe, it, expect } from "vitest";
import { reconstructAbstract, openAlexWorkToFormatted, formatWorksAsReferences, formatWorksForPrompt } from "./openalex";
import type { OpenAlexWork, CuratedWork } from "./openalex";

// ═══════════════════════════════════════════════════
// OpenAlex — Tests unitaires (fonctions pures, pas de réseau)
// ═══════════════════════════════════════════════════

describe("reconstructAbstract", () => {
  it("reconstruit un abstract simple", () => {
    const index = {
      "This": [0],
      "is": [1],
      "a": [2],
      "test.": [3],
    };
    expect(reconstructAbstract(index)).toBe("This is a test.");
  });

  it("gère les mots multiples positions", () => {
    const index = {
      "the": [0, 4],
      "cat": [1],
      "sat": [2],
      "on": [3],
      "mat.": [5],
    };
    expect(reconstructAbstract(index)).toBe("the cat sat on the mat.");
  });

  it("retourne chaîne vide pour undefined", () => {
    expect(reconstructAbstract(undefined)).toBe("");
  });

  it("retourne chaîne vide pour objet vide", () => {
    expect(reconstructAbstract({})).toBe("");
  });

  it("gère l'abstract réel d'OpenAlex (mots avec positions non contiguës)", () => {
    // Exemple simplifié d'un vrai index inversé
    const index = {
      "We": [0],
      "propose": [1],
      "a": [2, 8],
      "novel": [3],
      "framework": [4],
      "for": [5, 10],
      "urban": [6],
      "analysis.": [7],
      "comprehensive": [9],
      "study.": [11],
    };
    expect(reconstructAbstract(index)).toBe(
      "We propose a novel framework for urban analysis. a comprehensive for study.",
    );
  });
});

describe("openAlexWorkToFormatted", () => {
  it("extrait les métadonnées complètes", () => {
    const work: OpenAlexWork = {
      id: "https://openalex.org/W1234567890",
      doi: "https://doi.org/10.1234/test.2023",
      title: "Urban Planning Methodology",
      publication_year: 2023,
      type: "journal-article",
      cited_by_count: 42,
      open_access: {
        is_oa: true,
        oa_status: "gold",
        oa_url: "https://example.com/paper.pdf",
      },
      authorships: [
        { author: { display_name: "Doe, John" } },
        { author: { display_name: "Smith, Jane" } },
      ],
      primary_location: {
        source: { display_name: "Journal of Urban Studies" },
      },
      topics: [
        { id: "t1", display_name: "Urban Planning", score: 0.9 },
        { id: "t2", display_name: "Spatial Analysis", score: 0.7 },
      ],
      abstract_inverted_index: {
        "This": [0], "paper": [1], "studies": [2], "urban": [3], "planning.": [4],
      },
    };

    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.title).toBe("Urban Planning Methodology");
    expect(formatted.doi).toBe("https://doi.org/10.1234/test.2023");
    expect(formatted.authors).toBe("Doe, John, Smith, Jane");
    expect(formatted.year).toBe(2023);
    expect(formatted.venue).toBe("Journal of Urban Studies");
    expect(formatted.citedByCount).toBe(42);
    expect(formatted.openAccessUrl).toBe("https://example.com/paper.pdf");
    expect(formatted.oaStatus).toBe("gold");
    expect(formatted.type).toBe("journal-article");
    expect(formatted.concepts).toEqual(["Urban Planning", "Spatial Analysis"]);
    expect(formatted.abstract).toBe("This paper studies urban planning.");
    expect(formatted.openalexId).toBe("https://openalex.org/W1234567890");
  });

  it("utilise display_name si title absent", () => {
    const work: OpenAlexWork = {
      id: "W999",
      display_name: "Fallback Title",
      publication_year: 2020,
    };
    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.title).toBe("Fallback Title");
  });

  it("extrait l'année depuis publication_date si publication_year absent", () => {
    const work: OpenAlexWork = {
      id: "W998",
      title: "Test",
      publication_date: "2019-06-15",
    };
    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.year).toBe(2019);
  });

  it("auteurs vides → chaîne vide", () => {
    const work: OpenAlexWork = {
      id: "W997",
      title: "Test",
      publication_year: 2022,
      authorships: [],
    };
    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.authors).toBe("");
  });

  it("auteurs manquants → chaîne vide", () => {
    const work: OpenAlexWork = {
      id: "W996",
      title: "Test",
      publication_year: 2022,
    };
    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.authors).toBe("");
  });

  it("OA URL fallback vers primary_location pdf_url", () => {
    const work: OpenAlexWork = {
      id: "W995",
      title: "Test",
      publication_year: 2022,
      open_access: { is_oa: true, oa_status: "green" },
      primary_location: {
        source: { display_name: "Venue" },
        pdf_url: "https://fallback.org/paper.pdf",
      },
    };
    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.openAccessUrl).toBe("https://fallback.org/paper.pdf");
  });

  it("OA status closed par défaut", () => {
    const work: OpenAlexWork = { id: "W994", title: "T" };
    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.oaStatus).toBe("closed");
  });

  it("concepts fallback depuis concepts si topics absent", () => {
    const work: OpenAlexWork = {
      id: "W993",
      title: "Test",
      concepts: [
        { id: "c1", display_name: "Concept1", score: 0.8 },
        { id: "c2", display_name: "Concept2", score: 0.6 },
        { id: "c3", display_name: "Concept3", score: 0.4 },
        { id: "c4", display_name: "Concept4", score: 0.3 },
        { id: "c5", display_name: "Concept5", score: 0.2 },
        { id: "c6", display_name: "Concept6", score: 0.1 }, // 6ème = tronqué
      ],
    };
    const formatted = openAlexWorkToFormatted(work);
    expect(formatted.concepts).toHaveLength(5);
  });
});

describe("formatWorksAsReferences", () => {
  it("formate correctement avec tous les champs", () => {
    const works: CuratedWork[] = [
      {
        id: "W1", doi: "https://doi.org/10.1000/a", title: "Paper A",
        authors: "Doe, J.", year: 2023, venue: "Nature", citedByCount: 10,
        openAccessUrl: "", abstract: "", oaStatus: "gold", type: "journal-article",
        concepts: [], openalexId: "W1", curationScore: 0.8,
        curationDetails: {
          hasDoi: true, isPeerReviewed: true, venueIdentified: true,
          citationScore: 0.5, recencyScore: 0.5, oaScore: 0.5, typeScore: 0.5,
        },
      },
      {
        id: "W2", doi: "", title: "Paper B",
        authors: "Smith, S.", year: 2020, venue: "", citedByCount: 0,
        openAccessUrl: "", abstract: "", oaStatus: "closed", type: "preprint",
        concepts: [], openalexId: "W2", curationScore: 0.3,
        curationDetails: {
          hasDoi: false, isPeerReviewed: false, venueIdentified: false,
          citationScore: 0.1, recencyScore: 0.3, oaScore: 0.2, typeScore: 0.4,
        },
      },
    ];
    const refs = formatWorksAsReferences(works);
    expect(refs).toContain("[1] Doe, J. (2023). Paper A. Nature. https://doi.org/10.1000/a");
    expect(refs).toContain("[2] Smith, S. (2020). Paper B.");
  });

  it("liste vide → chaîne vide", () => {
    expect(formatWorksAsReferences([])).toBe("");
  });
});

describe("formatWorksForPrompt", () => {
  it("inclut DOI et venue quand présents", () => {
    const works: CuratedWork[] = [
      {
        id: "W1", doi: "https://doi.org/10.1000/x", title: "Test",
        authors: "Author", year: 2024, venue: "Science", citedByCount: 100,
        openAccessUrl: "https://oa.org/p.pdf", abstract: "Abstract text here",
        oaStatus: "gold", type: "journal-article",
        concepts: ["Topic1"], openalexId: "W1", curationScore: 0.9,
        curationDetails: {
          hasDoi: true, isPeerReviewed: true, venueIdentified: true,
          citationScore: 0.9, recencyScore: 0.99, oaScore: 1.0, typeScore: 1.0,
        },
      },
    ];
    const prompt = formatWorksForPrompt(works);
    expect(prompt).toContain("[1] Author (2024). Test");
    expect(prompt).toContain("DOI : https://doi.org/10.1000/x");
    expect(prompt).toContain("Venue : Science");
    expect(prompt).toContain("Citations : 100");
    expect(prompt).toContain("OA : gold");
    expect(prompt).toContain("URL : https://oa.org/p.pdf");
    expect(prompt).toContain("Résumé : Abstract text here");
  });

  it("omet les lignes vides (pas de DOI, pas de venue, etc.)", () => {
    const works: CuratedWork[] = [
      {
        id: "W1", doi: "", title: "Minimal",
        authors: "A", year: 2022, venue: "", citedByCount: 0,
        openAccessUrl: "", abstract: "", oaStatus: "closed", type: "journal-article",
        concepts: [], openalexId: "W1", curationScore: 0.5,
        curationDetails: {
          hasDoi: false, isPeerReviewed: true, venueIdentified: false,
          citationScore: 0, recencyScore: 0.5, oaScore: 0.2, typeScore: 1.0,
        },
      },
    ];
    const prompt = formatWorksForPrompt(works);
    expect(prompt).toContain("[1] A (2022). Minimal");
    expect(prompt).not.toContain("DOI :");
    expect(prompt).not.toContain("Venue :");
    expect(prompt).not.toContain("Citations :");
    expect(prompt).not.toContain("OA :");
  });
});

import { describe, it, expect } from "vitest";
import {
  computeCurationScore,
  curateWorks,
  classifyWork,
  curationSummary,
  CURATION_THRESHOLD_GOOD,
  CURATION_THRESHOLD_ACCEPTABLE,
} from "./curation";
import type { CuratedWork } from "./openalex";

// ═══════════════════════════════════════════════════
// Curation déterministe — Tests unitaires
// ═══════════════════════════════════════════════════

// ── Helpers ───────────────────────────────────────────────────────

function makeWork(overrides: Partial<{
  doi: string; venue: string; type: string;
  citedByCount: number; year: number; oaStatus: string;
}> = {}, year = 2023): {
  doi: string; venue: string; type: string;
  citedByCount: number; year: number; oaStatus: string;
} {
  return {
    doi: "https://doi.org/10.1000/test",
    venue: "Nature",
    type: "journal-article",
    citedByCount: 50,
    year,
    oaStatus: "gold",
    ...overrides,
  };
}

describe("computeCurationScore", () => {
  it("score parfait : DOI + venue + journal-article + citations + OA + récent", () => {
    const { score, details } = computeCurationScore(makeWork(), 2024);
    expect(score).toBeGreaterThan(0.7);
    expect(details.hasDoi).toBe(true);
    expect(details.isPeerReviewed).toBe(true);
    expect(details.venueIdentified).toBe(true);
  });

  it("sans DOI → pénalité", () => {
    const { score, details } = computeCurationScore(makeWork({ doi: "" }), 2024);
    expect(details.hasDoi).toBe(false);
    // Un article parfait sans DOI ne peut pas dépasser 0.85 (poids DOI = 0.15)
    expect(score).toBeLessThan(0.86);
  });

  it("sans venue → pénalité", () => {
    const { score, details } = computeCurationScore(makeWork({ venue: "" }), 2024);
    expect(details.venueIdentified).toBe(false);
    expect(score).toBeLessThan(0.86);
  });

  it("venue générique → pénalité partielle", () => {
    const { score, details } = computeCurationScore(makeWork({ venue: "unknown" }), 2024);
    expect(details.venueIdentified).toBe(true); // Non vide = identifiée
  });

  it("type preprint → pénalité vs journal-article même métadonnées", () => {
    const preprint = computeCurationScore(
      makeWork({ type: "preprint" }),
      2024,
    );
    const article = computeCurationScore(
      makeWork({ type: "journal-article" }),
      2024,
    );
    expect(preprint.details.isPeerReviewed).toBe(false);
    expect(article.details.isPeerReviewed).toBe(true);
    // Le preprint a un score strictement inférieur (poids type = 0.10)
    expect(preprint.score).toBeLessThan(article.score);
  });

  it("citations normalisées par âge : même count, année différente → scores différents", () => {
    const recent = computeCurationScore(makeWork({ citedByCount: 20, year: 2023 }), 2024);
    const old = computeCurationScore(makeWork({ citedByCount: 20, year: 2010 }), 2024);
    // 20 citations en 1 an > 20 citations en 14 ans
    expect(recent.score).toBeGreaterThan(old.score);
  });

  it("article très cité très ancien : score citation élevé malgré l'âge", () => {
    const { score, details } = computeCurationScore(
      makeWork({ citedByCount: 500, year: 2005 }),
      2024,
    );
    expect(details.citationScore).toBeGreaterThan(0.8);
  });

  it("année 0 → pas de crash, score citation bas", () => {
    const { score } = computeCurationScore(makeWork({ year: 0, citedByCount: 0 }), 2024);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("OA gold vs closed → écart de score", () => {
    const gold = computeCurationScore(makeWork({ oaStatus: "gold" }), 2024);
    const closed = computeCurationScore(makeWork({ oaStatus: "closed" }), 2024);
    expect(gold.score).toBeGreaterThan(closed.score);
  });

  it("récence : article de l'année > article de 15+ ans", () => {
    const recent = computeCurationScore(makeWork({ year: 2024 }), 2024);
    const old = computeCurationScore(makeWork({ year: 2008 }), 2024);
    expect(recent.score).toBeGreaterThan(old.score);
  });

  it("score total toujours dans [0, 1]", () => {
    const testCases = [
      makeWork(),
      makeWork({ doi: "", venue: "", type: "dataset", citedByCount: 0, year: 1990, oaStatus: "closed" }),
      makeWork({ citedByCount: 10000, year: 2024, oaStatus: "gold" }),
    ];
    for (const tc of testCases) {
      const { score } = computeCurationScore(tc, 2024);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});

describe("classifyWork", () => {
  it("score >= BON threshold → BON", () => {
    expect(classifyWork(CURATION_THRESHOLD_GOOD)).toBe("BON");
  });

  it("score au seuil ACCEPTABLE → ACCEPTABLE", () => {
    expect(classifyWork(CURATION_THRESHOLD_ACCEPTABLE)).toBe("ACCEPTABLE");
  });

  it("score < seuil ACCEPTABLE → FAIBLE", () => {
    expect(classifyWork(CURATION_THRESHOLD_ACCEPTABLE - 0.01)).toBe("FAIBLE");
  });

  it("score entre les deux seuils → ACCEPTABLE", () => {
    const mid = (CURATION_THRESHOLD_ACCEPTABLE + CURATION_THRESHOLD_GOOD) / 2;
    expect(classifyWork(mid)).toBe("ACCEPTABLE");
  });
});

describe("curateWorks", () => {
  function toWork(overrides: Record<string, unknown> = {}): CuratedWork {
    return {
      id: "https://openalex.org/W123",
      doi: "https://doi.org/10.1000/test",
      title: "Test Paper",
      authors: "Doe, John",
      year: 2023,
      venue: "Nature",
      citedByCount: 50,
      openAccessUrl: "",
      abstract: "",
      oaStatus: "gold",
      type: "journal-article",
      concepts: [],
      openalexId: "https://openalex.org/W123",
      curationScore: 0.8,
      curationDetails: {
        hasDoi: true,
        isPeerReviewed: true,
        venueIdentified: true,
        citationScore: 0.9,
        recencyScore: 0.95,
        oaScore: 1.0,
        typeScore: 1.0,
      },
      ...overrides,
    };
  }

  // Mock d'OpenAlexWork pour le test de curateWorks
  function toRawWork(overrides: Record<string, unknown> = {}) {
    return {
      id: "https://openalex.org/W123",
      title: "Test Paper",
      doi: "https://doi.org/10.1000/test",
      publication_year: 2023,
      type: "journal-article",
      cited_by_count: 50,
      open_access: { is_oa: true, oa_status: "gold" },
      authorships: [{ author: { display_name: "Doe, John" } }],
      primary_location: { source: { display_name: "Nature" } },
      abstract_inverted_index: undefined,
      ...overrides,
    } as unknown as import("./openalex").OpenAlexWork;
  }

  it("filtre les travaux rétractés", () => {
    const works = [
      toRawWork({ id: "W1", is_retracted: false }),
      toRawWork({ id: "W2", is_retracted: true }),
      toRawWork({ id: "W3", is_retracted: false }),
    ];
    const curated = curateWorks(works);
    expect(curated).toHaveLength(2);
    expect(curated.every((w) => w.id !== "W2")).toBe(true);
  });

  it("trie par score décroissant", () => {
    const works = [
      toRawWork({ id: "W-low", cited_by_count: 1, doi: "" }),
      toRawWork({ id: "W-high", cited_by_count: 1000 }),
    ];
    const curated = curateWorks(works);
    // Le tri est par curationScore décroissant, le plus cité doit être premier
    expect(curated[0].curationScore).toBeGreaterThanOrEqual(curated[1].curationScore);
  });

  it("respecte maxResults", () => {
    const works = Array.from({ length: 20 }, (_, i) =>
      toRawWork({ id: `W${i}`, cited_by_count: 100 - i }),
    );
    const curated = curateWorks(works, { maxResults: 5 });
    expect(curated).toHaveLength(5);
  });

  it("exclut les travaux sous minScore", () => {
    // Un travail sans DOI, sans venue, type dataset, 0 citations, ancien, closed
    const badWork = toRawWork({
      id: "W-bad",
      doi: undefined,
      type: "dataset",
      cited_by_count: 0,
      publication_year: 2000,
      open_access: { is_oa: false, oa_status: "closed" },
      primary_location: { source: { display_name: "" } },
    });
    const curated = curateWorks([badWork], { minScore: CURATION_THRESHOLD_ACCEPTABLE });
    // Le score d'un tel travail devrait être très bas
    if (curated.length > 0) {
      expect(curated[0].curationScore).toBeGreaterThanOrEqual(CURATION_THRESHOLD_ACCEPTABLE);
    }
  });

  it("maxResults par défaut = 15", () => {
    const works = Array.from({ length: 20 }, (_, i) =>
      toRawWork({ id: `W${i}`, cited_by_count: 100 - i }),
    );
    const curated = curateWorks(works);
    expect(curated).toHaveLength(15);
  });
});

describe("curationSummary", () => {
  it("résumé vide pour liste vide", () => {
    const summary = curationSummary([]);
    expect(summary).toEqual({
      total: 0, bons: 0, acceptables: 0, faibles: 0, avgScore: 0,
    });
  });

  it("compte correctement chaque catégorie", () => {
    const works = [
      { ...mockCurated(0.8) },  // BON
      { ...mockCurated(0.4) },  // ACCEPTABLE
      { ...mockCurated(0.2) },  // FAIBLE
    ] as CuratedWork[];
    const summary = curationSummary(works);
    expect(summary.total).toBe(3);
    expect(summary.bons).toBe(1);
    expect(summary.acceptables).toBe(1);
    expect(summary.faibles).toBe(1);
    expect(summary.avgScore).toBeCloseTo(0.467, 2);
  });
});

// ── Helper local ────────────────────────────────────────────────────

function mockCurated(score: number): CuratedWork {
  return {
    id: `W-${score}`,
    doi: "https://doi.org/10.1000/test",
    title: "Test",
    authors: "Author",
    year: 2023,
    venue: "Venue",
    citedByCount: 10,
    openAccessUrl: "",
    abstract: "",
    oaStatus: "gold",
    type: "journal-article",
    concepts: [],
    openalexId: `W-${score}`,
    curationScore: score,
    curationDetails: {
      hasDoi: true,
      isPeerReviewed: true,
      venueIdentified: true,
      citationScore: 0.5,
      recencyScore: 0.5,
      oaScore: 0.5,
      typeScore: 0.5,
    },
  };
}

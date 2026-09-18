import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// ────────────────────────────────────────────────────────────────────────
// Non-régression annexe A.1 — encodage des requêtes vers HAL
// Épingle les trois mécanismes prouvés par specs/hal-search-encoding/assess.md :
//   M1 — paramètres fq répétés natifs (jamais de `&` interne encodé %26)
//   M2 — normalisation du tri (%2B et + → espace, forme acceptée par HAL)
//   M3 — encodage final : espaces en %20, aucun `+` littéral vers HAL
// Aucun appel réseau réel : global.fetch est mocké et capture l'URL construite.
// ────────────────────────────────────────────────────────────────────────

function mockDoc(id: string, title: string, year: number) {
  return {
    docid: id,
    title_s: [title],
    authFullName_s: ["Auteur Test"],
    publicationDateY_i: year,
    abstract_s: [],
    uri_s: `https://hal.science/${id}`,
    level0_domain_s: ["shs"],
    domain_s: [],
    keyword_s: ["mot-clé"],
  };
}

function halResponse(numFound: number, docs: unknown[]) {
  return new Response(
    JSON.stringify({ response: { numFound, start: 0, docs } }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function makeGetRequest(query: string) {
  return new NextRequest(
    `http://localhost:3000/api/theses-en-ligne/search?${query}`
  );
}

let capturedUrl = "";
let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  capturedUrl = "";
  mockFetch = vi.fn().mockImplementation(async (url: string) => {
    capturedUrl = url;
    return halResponse(
      2,
      [mockDoc("1", "Thèse A", 2024), mockDoc("2", "Thesis B", 2023)]
    );
  });
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── M1 : fq répétés ──────────────────────────────────────────────────

describe("M1 — paramètres fq répétés vers HAL", () => {
  it("émet un paramètre fq par filtre (docType + domaine + bornes d'années)", async () => {
    const res = await GET(
      makeGetRequest("q=urbanisme&domain=shs&yearMin=2020&yearMax=2024")
    );
    expect(res.status).toBe(200);
    const fq = new URL(capturedUrl).searchParams.getAll("fq");
    expect(fq).toEqual([
      "docType_s:THESE",
      "level0_domain_s:shs",
      "publicationDateY_i:[2020 TO *]",
      "publicationDateY_i:[* TO 2024]",
    ]);
  });

  it("ne contient jamais de & interne encodé (%26) dans un fq", async () => {
    await GET(makeGetRequest("q=urbanisme&domain=shs"));
    const fq = new URL(capturedUrl).searchParams.getAll("fq");
    for (const f of fq) {
      expect(f).not.toContain("&");
      expect(f).not.toContain("%26");
    }
    expect(capturedUrl).not.toContain("%26fq%3D");
  });

  it("garde le filtre docType_s:THESE seul quand aucun filtre optionnel", async () => {
    await GET(makeGetRequest("q=urbanisme"));
    expect(new URL(capturedUrl).searchParams.getAll("fq")).toEqual([
      "docType_s:THESE",
    ]);
  });

  it("ignore une valeur de domaine inconnue (pas de fq parasite)", async () => {
    await GET(makeGetRequest("q=urbanisme&domain=code-inexistant"));
    expect(new URL(capturedUrl).searchParams.getAll("fq")).toEqual([
      "docType_s:THESE",
    ]);
  });
});

// ── M2 : normalisation du tri ────────────────────────────────────────

describe("M2 — normalisation du tri (%2B et + → espace)", () => {
  it.each([
    ["sort=publicationDateY_i%2Bdesc"],
    ["sort=publicationDateY_i+desc"],
    ["sort=publicationDateY_i%20desc"],
  ])(
    "normalise « %s » en 'publicationDateY_i desc' upstream",
    async (query) => {
      await GET(makeGetRequest(`q=urbanisme&${query}`));
      const sort = new URL(capturedUrl).searchParams.get("sort");
      expect(sort).toBe("publicationDateY_i desc");
    }
  );

  it("applique le tri par défaut sans paramètre sort", async () => {
    await GET(makeGetRequest("q=urbanisme"));
    expect(new URL(capturedUrl).searchParams.get("sort")).toBe(
      "publicationDateY_i desc"
    );
  });

  it("normalise le tri par pertinence du frontend (score desc)", async () => {
    await GET(makeGetRequest("q=urbanisme&sort=score+desc"));
    expect(new URL(capturedUrl).searchParams.get("sort")).toBe("score desc");
  });
});

// ── M3 : encodage final %20 ──────────────────────────────────────────

describe("M3 — encodage final : espaces en %20, jamais de + littéral", () => {
  it("n'envoie aucun + littéral à HAL sur une requête filtrée complète", async () => {
    await GET(
      makeGetRequest(
        "q=ville+intelligente&domain=shs&yearMin=2020&sort=publicationDateY_i+desc"
      )
    );
    expect(capturedUrl).not.toMatch(/\+/);
  });

  it("encode les espaces du terme cherché en %20", async () => {
    await GET(makeGetRequest("q=ville+intelligente"));
    expect(capturedUrl).toContain("q=ville%20intelligente");
  });

  it("encode les espaces des bornes d'années Solr en %20", async () => {
    await GET(makeGetRequest("q=urbanisme&yearMin=2020"));
    expect(capturedUrl).toContain(
      "fq=publicationDateY_i%3A%5B2020%20TO%20*%5D"
    );
  });

  it("préserve un + littéral du terme cherché (transport %2B, jamais converti en espace)", async () => {
    // q=C%2B%2B → décodé "C++" → ré-encodé %2B%2B par URLSearchParams ;
    // le remplacement global + → %20 ne doit pas altérer les séquences %2B
    await GET(makeGetRequest("q=C%2B%2B"));
    expect(capturedUrl).toContain("q=C%2B%2B");
    expect(capturedUrl).not.toContain("q=C%20%20");
  });
});

// ── Cohérence générale (sanity du mock et du mapping) ─────────────────

describe("réponse HAL → réponse de la route", () => {
  it("retourne 200 et mappe les docs HAL en thèses", async () => {
    const res = await GET(makeGetRequest("q=urbanisme"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(2);
    expect(data.theses).toHaveLength(2);
    expect(data.theses[0]).toMatchObject({
      id: "1",
      title: "Thèse A",
      year: 2024,
      source: "hal",
    });
  });
});

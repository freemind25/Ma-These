import { describe, it, expect } from "vitest";
import {
  applyRetention,
  diffResults,
  parseFiltersJson,
  type FetchedItem,
  type StoredItem,
} from "./check-core";

// ────────────────────────────────────────────────────────────────────────
// Veille académique — noyau de diff (T11 — specs/veille-academique)
// Fonctions pures : zéro réseau, zéro db.
//   diffResults    — CA-2.1 (premier check sans « nouveau »)
//                    CA-2.2 (diff par externalId, jamais re-marqués)
//   applyRetention — décision n°4 (fenêtre glissante 200, les plus
//                    récents conservés)
// ────────────────────────────────────────────────────────────────────────

function fetched(externalId: string, title = `Titre ${externalId}`): FetchedItem {
  return {
    externalId,
    title,
    authors: "Auteur A ; Auteur B",
    year: 2024,
    url: `https://exemple.org/${externalId}`,
    abstract: `Résumé de ${externalId}`,
  };
}

function stored(externalId: string, seen = true): StoredItem {
  return { externalId, seen };
}

describe("diffResults", () => {
  it("CA-2.1 — premier check : base vide → aucun « nouveau », newItems vide", () => {
    const result = diffResults([], [fetched("hal-1"), fetched("hal-2"), fetched("hal-3")]);

    expect(result.isFirstCheck).toBe(true);
    expect(result.newItems).toEqual([]);
  });

  it("CA-2.1 — premier check même sans résultat récupéré", () => {
    const result = diffResults([], []);

    expect(result.isFirstCheck).toBe(true);
    expect(result.newItems).toEqual([]);
  });

  it("CA-2.2 — checks suivants : seuls les externalId inconnus sont marqués nouveaux", () => {
    const base = [stored("hal-1"), stored("hal-2")];
    const result = diffResults(base, [fetched("hal-1"), fetched("hal-2"), fetched("hal-3"), fetched("hal-4")]);

    expect(result.isFirstCheck).toBe(false);
    expect(result.newItems.map((item) => item.externalId)).toEqual(["hal-3", "hal-4"]);
  });

  it("CA-2.2 — résultats déjà connus jamais re-marqués (jeu identique)", () => {
    const base = [stored("hal-1", false), stored("hal-2", true)];
    const result = diffResults(base, [fetched("hal-1"), fetched("hal-2")]);

    expect(result.isFirstCheck).toBe(false);
    expect(result.newItems).toEqual([]);
  });

  it("CA-2.2 — un résultat marqué vu ou non vu est également « connu » (le seen n'influence pas le diff)", () => {
    const base = [stored("hal-1", false), stored("hal-2", true)];
    const result = diffResults(base, [fetched("hal-2")]);

    expect(result.newItems).toEqual([]);
  });

  it("ignore les entrées récupérées sans externalId (identifiant vide)", () => {
    const base = [stored("hal-1")];
    const result = diffResults(base, [fetched("hal-1"), fetched("")]);

    expect(result.newItems).toEqual([]);
  });

  it("ne mute ni les entrées stockées ni celles récupérées", () => {
    const base = [stored("hal-1")];
    const fetchedItems = [fetched("hal-2")];
    diffResults(base, fetchedItems);

    expect(base).toEqual([stored("hal-1")]);
    expect(fetchedItems).toEqual([fetched("hal-2")]);
  });
});

describe("applyRetention", () => {
  function items(count: number, fromDaysAgo = 100): { id: string; firstSeenAt: Date }[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `res-${i + 1}`,
      firstSeenAt: new Date(Date.parse("2026-01-01T00:00:00Z") - (fromDaysAgo - i) * 86_400_000),
    }));
  }

  it("décision n°4 — sous la limite : tout est conservé, rien à supprimer", () => {
    const all = items(200);
    const { kept, removed } = applyRetention(all, 200);

    expect(kept).toHaveLength(200);
    expect(removed).toEqual([]);
  });

  it("décision n°4 — au-delà de la limite : les 200 plus récents conservés", () => {
    const all = items(210);
    const { kept, removed } = applyRetention(all, 200);

    expect(kept).toHaveLength(200);
    expect(removed).toHaveLength(10);
    // Tri desc (plus récents d'abord) : kept[0] = le plus récent
    expect(kept[0].id).toBe("res-210");
    expect(kept[199].id).toBe("res-11");
    // Les plus anciens (res-1 … res-10) sont évincés
    expect(removed.map((r) => r.id)).toEqual(["res-10", "res-9", "res-8", "res-7", "res-6", "res-5", "res-4", "res-3", "res-2", "res-1"]);
  });

  it("la limite par défaut est 200 (appel sans argument)", () => {
    const all = items(201);
    const { kept, removed } = applyRetention(all);

    expect(kept).toHaveLength(200);
    expect(removed).toHaveLength(1);
    expect(removed[0].id).toBe("res-1");
  });

  it("tri par firstSeenAt indépendant de l'ordre d'entrée (dates en chaîne ISO acceptées)", () => {
    const all = [
      { id: "ancien", firstSeenAt: "2026-01-01T00:00:00Z" },
      { id: "recent", firstSeenAt: "2026-06-01T00:00:00Z" },
      { id: "moyen", firstSeenAt: "2026-03-01T00:00:00Z" },
    ];
    const { kept, removed } = applyRetention(all, 2);

    // Tri desc : le plus récent d'abord
    expect(kept.map((r) => r.id)).toEqual(["recent", "moyen"]);
    expect(removed.map((r) => r.id)).toEqual(["ancien"]);
  });

  it("ne mute pas la liste d'entrée", () => {
    const all = items(210);
    const snapshot = [...all];
    applyRetention(all, 200);

    expect(all).toEqual(snapshot);
  });

  it("liste vide : rien à faire", () => {
    const { kept, removed } = applyRetention([], 200);

    expect(kept).toEqual([]);
    expect(removed).toEqual([]);
  });
});

describe("parseFiltersJson", () => {
  it("parse un objet de filtres valid (valeurs non-chaîne ignorées)", () => {
    expect(
      parseFiltersJson(JSON.stringify({ domain: "shs", yearMin: "2020", nested: { a: 1 }, empty: "" }))
    ).toEqual({ domain: "shs", yearMin: "2020" });
  });

  it("retourne un objet vide sur JSON malformé (jamais d'exception)", () => {
    expect(parseFiltersJson("{invalid")).toEqual({});
  });

  it("retourne un objet vide sur chaîne vide ou non-objet", () => {
    expect(parseFiltersJson("")).toEqual({});
    expect(parseFiltersJson('"texte"')).toEqual({});
    expect(parseFiltersJson("[1,2]")).toEqual({});
  });
});

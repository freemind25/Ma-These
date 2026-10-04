// ═══════════════════════════════════════════════════════════════
// Tests du stamp « Provenance des savoirs » — fonctions pures.
// Couverture : 0 compétence (CA-1.2), modes intégral / index-only
// (CA-1.1/1.3), ordre préservé, sérialisation JSON, format lisible.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  buildKnowledgeStamp,
  formatKnowledgeStampSummary,
  formatKnowledgeStampDetail,
} from "./knowledge-stamp";
import { KNOWLEDGE_CORE_VERSION } from "./knowledge-core";
import { BOOK_SKILLS_CONTENT_BUDGET_CHARS, type BookSkillInput } from "./book-skills";

const skill = (
  id: string,
  contentLength: number,
  title = `Compétence ${id}`
): BookSkillInput => ({
  id,
  title,
  content: "x".repeat(contentLength),
});

const AT = "2026-10-03T16:39:00.000Z";

describe("buildKnowledgeStamp", () => {
  it("produit un stamp avec 0 compétence active (CA-1.2)", () => {
    const stamp = buildKnowledgeStamp({
      coreVersion: KNOWLEDGE_CORE_VERSION,
      skills: [],
      generatedAt: AT,
    });
    expect(stamp.coreVersion).toBe(KNOWLEDGE_CORE_VERSION);
    expect(stamp.skills).toEqual([]);
    expect(stamp.generatedAt).toBe(AT);
  });

  it("marque « integral » les compétences sous le plafond cumulé", () => {
    const stamp = buildKnowledgeStamp({
      coreVersion: KNOWLEDGE_CORE_VERSION,
      skills: [skill("a", 100), skill("b", 200)],
      generatedAt: AT,
    });
    expect(stamp.skills.map((s) => s.mode)).toEqual(["integral", "integral"]);
  });

  it("marque « index-only » une compétence trop volumineuse seule (CA-1.3)", () => {
    const stamp = buildKnowledgeStamp({
      coreVersion: KNOWLEDGE_CORE_VERSION,
      skills: [skill("géante", BOOK_SKILLS_CONTENT_BUDGET_CHARS + 1)],
      generatedAt: AT,
    });
    expect(stamp.skills).toHaveLength(1);
    expect(stamp.skills[0].mode).toBe("index-only");
  });

  it("marque « index-only » les compétences au-delà du plafond cumulé", () => {
    const stamp = buildKnowledgeStamp({
      coreVersion: KNOWLEDGE_CORE_VERSION,
      skills: [
        skill("a", 7_000),
        skill("b", 4_500),
        skill("c", 2_000), // 7 000 + 4 500 = 11 500 ; +2 000 > 12 000
      ],
      generatedAt: AT,
    });
    expect(stamp.skills.map((s) => s.mode)).toEqual([
      "integral",
      "integral",
      "index-only",
    ]);
  });

  it("préserve l'ordre fourni (récence d'abord)", () => {
    const stamp = buildKnowledgeStamp({
      coreVersion: KNOWLEDGE_CORE_VERSION,
      skills: [skill("première", 10), skill("deuxième", 10)],
      generatedAt: AT,
    });
    expect(stamp.skills.map((s) => s.id)).toEqual(["première", "deuxième"]);
  });

  it("est sérialisable en JSON (persistance Chapter/ChapterVersion)", () => {
    const stamp = buildKnowledgeStamp({
      coreVersion: KNOWLEDGE_CORE_VERSION,
      skills: [skill("a", 100)],
      generatedAt: AT,
    });
    const parsed = JSON.parse(JSON.stringify(stamp));
    expect(parsed).toEqual(stamp);
  });
});

describe("formatKnowledgeStampSummary", () => {
  it("mentionne « aucune compétence livre active » à 0 (CA-1.2)", () => {
    const summary = formatKnowledgeStampSummary({
      coreVersion: "2026-10-03",
      skills: [],
      generatedAt: AT,
    });
    expect(summary).toBe(
      "noyau de connaissance v2026-10-03 — aucune compétence livre active"
    );
  });

  it("accorde en nombre au-delà de 1", () => {
    const one = formatKnowledgeStampSummary({
      coreVersion: "2026-10-03",
      skills: [{ id: "a", title: "A", mode: "integral" }],
      generatedAt: AT,
    });
    const two = formatKnowledgeStampSummary({
      coreVersion: "2026-10-03",
      skills: [
        { id: "a", title: "A", mode: "integral" },
        { id: "b", title: "B", mode: "index-only" },
      ],
      generatedAt: AT,
    });
    expect(one).toBe("noyau de connaissance v2026-10-03 + 1 compétence livre");
    expect(two).toBe(
      "noyau de connaissance v2026-10-03 + 2 compétences livres"
    );
  });
});

describe("formatKnowledgeStampDetail", () => {
  it("liste chaque compétence avec son mode, indexée [L1]…", () => {
    const detail = formatKnowledgeStampDetail({
      coreVersion: "2026-10-03",
      skills: [
        { id: "a", title: "Guide de rédaction", mode: "integral" },
        { id: "b", title: "Gros ouvrage", mode: "index-only" },
      ],
      generatedAt: AT,
    });
    expect(detail).toEqual([
      "[L1] Guide de rédaction — injectée en intégral",
      "[L2] Gros ouvrage — index seulement (budget)",
    ]);
  });

  it("retourne un tableau vide à 0 compétence", () => {
    expect(
      formatKnowledgeStampDetail({
        coreVersion: "2026-10-03",
        skills: [],
        generatedAt: AT,
      })
    ).toEqual([]);
  });
});

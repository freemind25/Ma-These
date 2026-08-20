import { describe, it, expect } from "vitest";
import {
  thesisStatuses,
  structureModes,
  chapterStatuses,
  referenceTypes,
  sprintPhases,
  sprintStatuses,
  storyStatuses,
  storyPriorities,
  aiProviders,
  createThesisSchema,
  updateThesisSchema,
  createChapterSchema,
  updateChapterSchema,
  createReferenceSchema,
  updateReferenceSchema,
  createCadrageSchema,
  updateCadrageSchema,
  createCadrageFieldSchema,
  updateCadrageFieldSchema,
  createResearchSourceSchema,
  updateResearchSourceSchema,
  createNotebookEntrySchema,
  updateNotebookEntrySchema,
  createSprintSchema,
  updateSprintSchema,
  createStorySchema,
  updateStorySchema,
  createAiConfigSchema,
  updateAiConfigSchema,
} from "./api-schemas";

// ═══════════════════════════════════════
// CONST ENUM ARRAYS
// ═══════════════════════════════════════

describe("const enum arrays", () => {
  it("thesisStatuses has expected values", () => {
    expect(thesisStatuses).toEqual([
      "draft",
      "in_progress",
      "review",
      "completed",
    ]);
  });

  it("structureModes has expected values", () => {
    expect(structureModes).toEqual(["chapters", "parts"]);
  });

  it("chapterStatuses has expected values", () => {
    expect(chapterStatuses).toEqual([
      "not_started",
      "in_progress",
      "draft",
      "review",
      "completed",
    ]);
  });

  it("referenceTypes includes BibTeX types", () => {
    expect(referenceTypes).toContain("article");
    expect(referenceTypes).toContain("book");
    expect(referenceTypes).toContain("inproceedings");
    expect(referenceTypes).toContain("phdthesis");
    expect(referenceTypes).toContain("techreport");
  });

  it("referenceTypes includes RIS types", () => {
    expect(referenceTypes).toContain("jour");
    expect(referenceTypes).toContain("chap");
    expect(referenceTypes).toContain("conf");
    expect(referenceTypes).toContain("ebook");
  });

  it("referenceTypes includes CSL-JSON types", () => {
    expect(referenceTypes).toContain("article-journal");
    expect(referenceTypes).toContain("paper-conference");
    expect(referenceTypes).toContain("webpage");
    expect(referenceTypes).toContain("legislation");
  });

  it("referenceTypes includes other fallback", () => {
    expect(referenceTypes).toContain("other");
  });

  it("sprintPhases has 5 phases", () => {
    expect(sprintPhases).toHaveLength(5);
    expect(sprintPhases).toEqual([
      "phase_0",
      "phase_1",
      "phase_2",
      "phase_3",
      "phase_4",
    ]);
  });

  it("sprintStatuses has expected values", () => {
    expect(sprintStatuses).toEqual(["planned", "active", "completed"]);
  });

  it("storyStatuses has expected values", () => {
    expect(storyStatuses).toEqual(["todo", "in_progress", "done"]);
  });

  it("storyPriorities has expected values", () => {
    expect(storyPriorities).toEqual(["low", "medium", "high", "critical"]);
  });

  it("aiProviders has expected values", () => {
    expect(aiProviders).toEqual([
      "openai",
      "anthropic",
      "mistral",
      "routesme",
      "zai",
      "custom",
    ]);
  });
});

// ═══════════════════════════════════════
// createThesisSchema
// ═══════════════════════════════════════

describe("createThesisSchema", () => {
  const validMinimal = { title: "My Thesis", author: "Jane Doe" };
  const validFull = {
    title: "My Thesis",
    subtitle: "A Subtitle",
    author: "Jane Doe",
    email: "jane@example.com",
    institution: "University of Paris",
    laboratory: "Lab X",
    discipline: "Computer Science",
    directorName: "Prof. Smith",
  };

  it("accepts valid minimal data", () => {
    expect(createThesisSchema.parse(validMinimal)).toEqual(validMinimal);
  });

  it("accepts valid full data", () => {
    expect(createThesisSchema.parse(validFull)).toEqual(validFull);
  });

  it("rejects missing title", () => {
    expect(() =>
      createThesisSchema.parse({ author: "Jane Doe" })
    ).toThrow();
  });

  it("rejects missing author", () => {
    expect(() =>
      createThesisSchema.parse({ title: "My Thesis" })
    ).toThrow();
  });

  it("rejects empty title", () => {
    expect(() =>
      createThesisSchema.parse({ title: "", author: "Jane" })
    ).toThrow();
  });

  it("rejects empty author", () => {
    expect(() =>
      createThesisSchema.parse({ title: "T", author: "" })
    ).toThrow();
  });

  it("rejects wrong type for title (number)", () => {
    expect(() =>
      createThesisSchema.parse({ title: 42, author: "Jane" })
    ).toThrow();
  });

  it("rejects wrong type for author (boolean)", () => {
    expect(() =>
      createThesisSchema.parse({ title: "T", author: true })
    ).toThrow();
  });

  it("accepts valid email", () => {
    const result = createThesisSchema.parse({
      title: "T",
      author: "A",
      email: "user@domain.com",
    });
    expect(result.email).toBe("user@domain.com");
  });

  it("rejects invalid email", () => {
    expect(() =>
      createThesisSchema.parse({
        title: "T",
        author: "A",
        email: "not-an-email",
      })
    ).toThrow();
  });

  it("accepts empty string for optional subtitle", () => {
    const result = createThesisSchema.parse({
      ...validMinimal,
      subtitle: "",
    });
    expect(result.subtitle).toBe("");
  });

  it("rejects empty object", () => {
    expect(() => createThesisSchema.parse({})).toThrow();
  });

  it("rejects null input", () => {
    expect(() => createThesisSchema.parse(null)).toThrow();
  });

  it("rejects undefined input", () => {
    expect(() => createThesisSchema.parse(undefined)).toThrow();
  });

  it("accepts very long title string", () => {
    const longTitle = "A".repeat(5000);
    const result = createThesisSchema.parse({
      title: longTitle,
      author: "Author",
    });
    expect(result.title).toBe(longTitle);
  });

  it("allows undefined for optional fields", () => {
    const result = createThesisSchema.parse({
      title: "T",
      author: "A",
      email: undefined,
      institution: undefined,
    });
    expect(result.email).toBeUndefined();
    expect(result.institution).toBeUndefined();
  });
});

// ═══════════════════════════════════════
// updateThesisSchema
// ═══════════════════════════════════════

describe("updateThesisSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateThesisSchema.parse({})).toEqual({});
  });

  it("accepts valid status enum values", () => {
    for (const status of thesisStatuses) {
      expect(updateThesisSchema.parse({ status }).status).toBe(status);
    }
  });

  it("rejects invalid status enum", () => {
    expect(() =>
      updateThesisSchema.parse({ status: "published" })
    ).toThrow();
  });

  it("accepts valid structureMode enum values", () => {
    for (const mode of structureModes) {
      expect(updateThesisSchema.parse({ structureMode: mode }).structureMode).toBe(
        mode
      );
    }
  });

  it("rejects invalid structureMode enum", () => {
    expect(() =>
      updateThesisSchema.parse({ structureMode: "sections" })
    ).toThrow();
  });

  it("rejects empty title (min(1))", () => {
    expect(() => updateThesisSchema.parse({ title: "" })).toThrow();
  });

  it("accepts title with min(1)", () => {
    expect(updateThesisSchema.parse({ title: "A" }).title).toBe("A");
  });

  it("validates email when provided", () => {
    expect(() =>
      updateThesisSchema.parse({ email: "bad" })
    ).toThrow();
  });

  it("accepts valid email when provided", () => {
    expect(updateThesisSchema.parse({ email: "a@b.com" }).email).toBe(
      "a@b.com"
    );
  });

  it("rejects wrong type for title (number)", () => {
    expect(() => updateThesisSchema.parse({ title: 123 })).toThrow();
  });

  it("rejects wrong type for status (number)", () => {
    expect(() => updateThesisSchema.parse({ status: 1 })).toThrow();
  });
});

// ═══════════════════════════════════════
// createChapterSchema
// ═══════════════════════════════════════

describe("createChapterSchema", () => {
  it("accepts valid minimal data (title only)", () => {
    expect(createChapterSchema.parse({ title: "Chapter 1" })).toEqual({
      title: "Chapter 1",
    });
  });

  it("accepts valid full data", () => {
    const data = {
      title: "Chapter 1",
      romanNumeral: "I",
      parentId: "parent-123",
      sortOrder: 0,
    };
    expect(createChapterSchema.parse(data)).toEqual(data);
  });

  it("rejects missing title", () => {
    expect(() => createChapterSchema.parse({})).toThrow();
  });

  it("rejects empty title", () => {
    expect(() => createChapterSchema.parse({ title: "" })).toThrow();
  });

  it("rejects negative sortOrder", () => {
    expect(() =>
      createChapterSchema.parse({ title: "Ch", sortOrder: -1 })
    ).toThrow();
  });

  it("rejects float sortOrder", () => {
    expect(() =>
      createChapterSchema.parse({ title: "Ch", sortOrder: 1.5 })
    ).toThrow();
  });

  it("accepts sortOrder of zero", () => {
    expect(
      createChapterSchema.parse({ title: "Ch", sortOrder: 0 }).sortOrder
    ).toBe(0);
  });

  it("accepts positive integer sortOrder", () => {
    expect(
      createChapterSchema.parse({ title: "Ch", sortOrder: 10 }).sortOrder
    ).toBe(10);
  });

  it("rejects wrong type for sortOrder (string)", () => {
    expect(() =>
      createChapterSchema.parse({ title: "Ch", sortOrder: "first" })
    ).toThrow();
  });

  it("accepts empty string for optional romanNumeral", () => {
    const result = createChapterSchema.parse({
      title: "Ch",
      romanNumeral: "",
    });
    expect(result.romanNumeral).toBe("");
  });
});

// ═══════════════════════════════════════
// updateChapterSchema
// ═══════════════════════════════════════

describe("updateChapterSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateChapterSchema.parse({})).toEqual({});
  });

  it("accepts valid status enum values", () => {
    for (const status of chapterStatuses) {
      expect(updateChapterSchema.parse({ status }).status).toBe(status);
    }
  });

  it("rejects invalid status enum", () => {
    expect(() =>
      updateChapterSchema.parse({ status: "deleted" })
    ).toThrow();
  });

  it("rejects empty title (min(1))", () => {
    expect(() => updateChapterSchema.parse({ title: "" })).toThrow();
  });

  it("accepts title with min(1)", () => {
    expect(updateChapterSchema.parse({ title: "A" }).title).toBe("A");
  });

  it("rejects negative wordCount", () => {
    expect(() => updateChapterSchema.parse({ wordCount: -1 })).toThrow();
  });

  it("rejects float wordCount", () => {
    expect(() =>
      updateChapterSchema.parse({ wordCount: 10.5 })
    ).toThrow();
  });

  it("accepts zero wordCount", () => {
    expect(updateChapterSchema.parse({ wordCount: 0 }).wordCount).toBe(0);
  });

  it("rejects negative targetWordCount", () => {
    expect(() =>
      updateChapterSchema.parse({ targetWordCount: -5 })
    ).toThrow();
  });

  it("rejects negative sortOrder", () => {
    expect(() => updateChapterSchema.parse({ sortOrder: -1 })).toThrow();
  });

  it("accepts content as string", () => {
    const html = "<h1>Title</h1><p>Content</p>";
    expect(updateChapterSchema.parse({ content: html }).content).toBe(html);
  });

  it("accepts plainText as string", () => {
    expect(updateChapterSchema.parse({ plainText: "some text" }).plainText).toBe(
      "some text"
    );
  });

  it("accepts directorFeedback as string", () => {
    expect(
      updateChapterSchema.parse({
        directorFeedback: "Good work",
      }).directorFeedback
    ).toBe("Good work");
  });
});

// ═══════════════════════════════════════
// createReferenceSchema
// ═══════════════════════════════════════

describe("createReferenceSchema", () => {
  const validMinimal = { authors: "Doe J", title: "A Paper" };
  const validFull = {
    type: "article",
    authors: "Doe J, Smith K",
    title: "Great Paper",
    year: 2024,
    journal: "Nature",
    volume: "12",
    issue: "3",
    pages: "1-15",
    publisher: "Springer",
    doi: "10.1234/example",
    isbn: "978-3-16-148410-0",
    url: "https://example.com",
    abstract: "This is an abstract.",
    keywords: "AI, ML",
    notes: "Some notes",
    bibtexKey: "doe2024",
    source: "doi",
  };

  it("accepts valid minimal data (authors + title)", () => {
    const result = createReferenceSchema.parse(validMinimal);
    expect(result.authors).toBe("Doe J");
    expect(result.title).toBe("A Paper");
  });

  it("applies default type 'article'", () => {
    expect(createReferenceSchema.parse(validMinimal).type).toBe("article");
  });

  it("applies default source 'manual'", () => {
    expect(createReferenceSchema.parse(validMinimal).source).toBe("manual");
  });

  it("accepts valid full data", () => {
    expect(createReferenceSchema.parse(validFull)).toEqual(validFull);
  });

  it("rejects missing authors", () => {
    expect(() => createReferenceSchema.parse({ title: "T" })).toThrow();
  });

  it("rejects missing title", () => {
    expect(() => createReferenceSchema.parse({ authors: "A" })).toThrow();
  });

  it("rejects empty authors", () => {
    expect(() =>
      createReferenceSchema.parse({ authors: "", title: "T" })
    ).toThrow();
  });

  it("rejects empty title", () => {
    expect(() =>
      createReferenceSchema.parse({ authors: "A", title: "" })
    ).toThrow();
  });

  it("rejects year below 1900", () => {
    expect(() =>
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        year: 1899,
      })
    ).toThrow();
  });

  it("rejects year above 2100", () => {
    expect(() =>
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        year: 2101,
      })
    ).toThrow();
  });

  it("accepts year at boundary 1900", () => {
    expect(
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        year: 1900,
      }).year
    ).toBe(1900);
  });

  it("accepts year at boundary 2100", () => {
    expect(
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        year: 2100,
      }).year
    ).toBe(2100);
  });

  it("rejects float year", () => {
    expect(() =>
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        year: 2024.5,
      })
    ).toThrow();
  });

  it("accepts BibTeX reference type 'book'", () => {
    expect(
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        type: "book",
      }).type
    ).toBe("book");
  });

  it("accepts RIS reference type 'jour'", () => {
    expect(
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        type: "jour",
      }).type
    ).toBe("jour");
  });

  it("accepts CSL-JSON reference type 'article-journal'", () => {
    expect(
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        type: "article-journal",
      }).type
    ).toBe("article-journal");
  });

  it("rejects invalid reference type", () => {
    expect(() =>
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        type: "nonexistent",
      })
    ).toThrow();
  });

  it("rejects empty object", () => {
    expect(() => createReferenceSchema.parse({})).toThrow();
  });

  it("accepts doi as optional string", () => {
    const result = createReferenceSchema.parse({
      authors: "A",
      title: "T",
      doi: "10.1000/xyz123",
    });
    expect(result.doi).toBe("10.1000/xyz123");
  });

  it("accepts url as optional string", () => {
    const result = createReferenceSchema.parse({
      authors: "A",
      title: "T",
      url: "https://example.com/paper",
    });
    expect(result.url).toBe("https://example.com/paper");
  });

  it("accepts 'other' as reference type", () => {
    expect(
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        type: "other",
      }).type
    ).toBe("other");
  });

  it("allows overriding default source", () => {
    expect(
      createReferenceSchema.parse({
        authors: "A",
        title: "T",
        source: "doi",
      }).source
    ).toBe("doi");
  });
});

// ═══════════════════════════════════════
// updateReferenceSchema
// ═══════════════════════════════════════

describe("updateReferenceSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateReferenceSchema.parse({})).toEqual({});
  });

  it("accepts isFavorite true", () => {
    expect(updateReferenceSchema.parse({ isFavorite: true }).isFavorite).toBe(
      true
    );
  });

  it("accepts isFavorite false", () => {
    expect(updateReferenceSchema.parse({ isFavorite: false }).isFavorite).toBe(
      false
    );
  });

  it("rejects isFavorite as string", () => {
    expect(() =>
      updateReferenceSchema.parse({ isFavorite: "yes" })
    ).toThrow();
  });

  it("accepts valid type enum", () => {
    expect(updateReferenceSchema.parse({ type: "book" }).type).toBe("book");
  });

  it("rejects invalid type enum", () => {
    expect(() =>
      updateReferenceSchema.parse({ type: "invalid-type" })
    ).toThrow();
  });

  it("rejects year below 1900", () => {
    expect(() => updateReferenceSchema.parse({ year: 1800 })).toThrow();
  });

  it("rejects year above 2100", () => {
    expect(() => updateReferenceSchema.parse({ year: 3000 })).toThrow();
  });

  it("accepts year at boundary 1900", () => {
    expect(updateReferenceSchema.parse({ year: 1900 }).year).toBe(1900);
  });

  it("accepts year at boundary 2100", () => {
    expect(updateReferenceSchema.parse({ year: 2100 }).year).toBe(2100);
  });

  it("rejects float year", () => {
    expect(() => updateReferenceSchema.parse({ year: 2000.5 })).toThrow();
  });

  it("accepts multiple fields at once", () => {
    const result = updateReferenceSchema.parse({
      authors: "Smith",
      title: "New Title",
      year: 2023,
      isFavorite: true,
    });
    expect(result).toEqual({
      authors: "Smith",
      title: "New Title",
      year: 2023,
      isFavorite: true,
    });
  });
});

// ═══════════════════════════════════════
// createCadrageSchema
// ═══════════════════════════════════════

describe("createCadrageSchema", () => {
  it("accepts valid minimal data (thesisId only)", () => {
    const result = createCadrageSchema.parse({ thesisId: "t-123" });
    expect(result.thesisId).toBe("t-123");
  });

  it("accepts valid data with label", () => {
    const result = createCadrageSchema.parse({
      thesisId: "t-123",
      label: "Cadrage v1",
    });
    expect(result.label).toBe("Cadrage v1");
  });

  it("accepts valid data with fields array", () => {
    const data = {
      thesisId: "t-123",
      fields: [
        { fieldKey: "problematic", label: "Problématique", value: "Some text" },
        { fieldKey: "methodology", label: "Méthodologie", sortOrder: 1 },
      ],
    };
    expect(createCadrageSchema.parse(data)).toEqual(data);
  });

  it("accepts empty fields array", () => {
    const result = createCadrageSchema.parse({
      thesisId: "t-123",
      fields: [],
    });
    expect(result.fields).toEqual([]);
  });

  it("rejects missing thesisId", () => {
    expect(() => createCadrageSchema.parse({})).toThrow();
  });

  it("rejects empty thesisId", () => {
    expect(() => createCadrageSchema.parse({ thesisId: "" })).toThrow();
  });

  it("rejects fields array item with missing fieldKey", () => {
    expect(() =>
      createCadrageSchema.parse({
        thesisId: "t-123",
        fields: [{ label: "Label" }],
      })
    ).toThrow();
  });

  it("rejects fields array item with empty fieldKey", () => {
    expect(() =>
      createCadrageSchema.parse({
        thesisId: "t-123",
        fields: [{ fieldKey: "", label: "Label" }],
      })
    ).toThrow();
  });

  it("rejects fields array item with missing label", () => {
    expect(() =>
      createCadrageSchema.parse({
        thesisId: "t-123",
        fields: [{ fieldKey: "key" }],
      })
    ).toThrow();
  });

  it("rejects fields array item with empty label", () => {
    expect(() =>
      createCadrageSchema.parse({
        thesisId: "t-123",
        fields: [{ fieldKey: "key", label: "" }],
      })
    ).toThrow();
  });

  it("rejects fields array item with negative sortOrder", () => {
    expect(() =>
      createCadrageSchema.parse({
        thesisId: "t-123",
        fields: [{ fieldKey: "k", label: "L", sortOrder: -1 }],
      })
    ).toThrow();
  });

  it("rejects fields array item with float sortOrder", () => {
    expect(() =>
      createCadrageSchema.parse({
        thesisId: "t-123",
        fields: [{ fieldKey: "k", label: "L", sortOrder: 1.5 }],
      })
    ).toThrow();
  });

  it("accepts fields array item with zero sortOrder", () => {
    const result = createCadrageSchema.parse({
      thesisId: "t-123",
      fields: [{ fieldKey: "k", label: "L", sortOrder: 0 }],
    });
    expect(result.fields![0].sortOrder).toBe(0);
  });

  it("rejects fields array item with wrong type fieldKey (number)", () => {
    expect(() =>
      createCadrageSchema.parse({
        thesisId: "t-123",
        fields: [{ fieldKey: 123, label: "L" }],
      })
    ).toThrow();
  });

  it("rejects non-array fields", () => {
    expect(() =>
      createCadrageSchema.parse({ thesisId: "t-123", fields: "not-array" })
    ).toThrow();
  });
});

// ═══════════════════════════════════════
// updateCadrageSchema
// ═══════════════════════════════════════

describe("updateCadrageSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateCadrageSchema.parse({})).toEqual({});
  });

  it("accepts isActive true", () => {
    expect(updateCadrageSchema.parse({ isActive: true }).isActive).toBe(true);
  });

  it("accepts isActive false", () => {
    expect(updateCadrageSchema.parse({ isActive: false }).isActive).toBe(false);
  });

  it("rejects isActive as string", () => {
    expect(() => updateCadrageSchema.parse({ isActive: "true" })).toThrow();
  });

  it("accepts label as string", () => {
    expect(updateCadrageSchema.parse({ label: "NewLabel" }).label).toBe(
      "NewLabel"
    );
  });
});

// ═══════════════════════════════════════
// createCadrageFieldSchema
// ═══════════════════════════════════════

describe("createCadrageFieldSchema", () => {
  it("accepts valid minimal data (fieldKey + label)", () => {
    expect(createCadrageFieldSchema.parse({
      fieldKey: "problematic",
      label: "Problématique",
    })).toEqual({ fieldKey: "problematic", label: "Problématique" });
  });

  it("accepts valid full data", () => {
    const data = {
      fieldKey: "context",
      label: "Contexte",
      value: "Some value",
      aiSuggestion: "AI suggestion",
      isLocked: true,
      sortOrder: 2,
    };
    expect(createCadrageFieldSchema.parse(data)).toEqual(data);
  });

  it("rejects missing fieldKey", () => {
    expect(() => createCadrageFieldSchema.parse({ label: "L" })).toThrow();
  });

  it("rejects empty fieldKey", () => {
    expect(() =>
      createCadrageFieldSchema.parse({ fieldKey: "", label: "L" })
    ).toThrow();
  });

  it("rejects missing label", () => {
    expect(() =>
      createCadrageFieldSchema.parse({ fieldKey: "k" })
    ).toThrow();
  });

  it("rejects empty label", () => {
    expect(() =>
      createCadrageFieldSchema.parse({ fieldKey: "k", label: "" })
    ).toThrow();
  });

  it("accepts isLocked true", () => {
    expect(
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        isLocked: true,
      }).isLocked
    ).toBe(true);
  });

  it("accepts isLocked false", () => {
    expect(
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        isLocked: false,
      }).isLocked
    ).toBe(false);
  });

  it("rejects isLocked as string", () => {
    expect(() =>
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        isLocked: "yes",
      })
    ).toThrow();
  });

  it("rejects negative sortOrder", () => {
    expect(() =>
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        sortOrder: -1,
      })
    ).toThrow();
  });

  it("rejects float sortOrder", () => {
    expect(() =>
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        sortOrder: 1.5,
      })
    ).toThrow();
  });

  it("accepts zero sortOrder", () => {
    expect(
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        sortOrder: 0,
      }).sortOrder
    ).toBe(0);
  });

  it("accepts value as string", () => {
    expect(
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        value: "some content",
      }).value
    ).toBe("some content");
  });

  it("accepts aiSuggestion as string", () => {
    expect(
      createCadrageFieldSchema.parse({
        fieldKey: "k",
        label: "L",
        aiSuggestion: "AI says hello",
      }).aiSuggestion
    ).toBe("AI says hello");
  });

  it("rejects wrong type for fieldKey (number)", () => {
    expect(() =>
      createCadrageFieldSchema.parse({ fieldKey: 42, label: "L" })
    ).toThrow();
  });
});

// ═══════════════════════════════════════
// updateCadrageFieldSchema
// ═══════════════════════════════════════

describe("updateCadrageFieldSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateCadrageFieldSchema.parse({})).toEqual({});
  });

  it("accepts valid label update", () => {
    expect(updateCadrageFieldSchema.parse({ label: "New Label" }).label).toBe(
      "New Label"
    );
  });

  it("accepts valid value update", () => {
    expect(
      updateCadrageFieldSchema.parse({ value: "new value" }).value
    ).toBe("new value");
  });

  it("accepts isLocked toggle", () => {
    expect(updateCadrageFieldSchema.parse({ isLocked: true }).isLocked).toBe(
      true
    );
  });

  it("rejects isLocked as string", () => {
    expect(() =>
      updateCadrageFieldSchema.parse({ isLocked: "false" })
    ).toThrow();
  });

  it("rejects negative sortOrder", () => {
    expect(() =>
      updateCadrageFieldSchema.parse({ sortOrder: -1 })
    ).toThrow();
  });

  it("rejects float sortOrder", () => {
    expect(() =>
      updateCadrageFieldSchema.parse({ sortOrder: 2.5 })
    ).toThrow();
  });

  it("accepts sortOrder zero", () => {
    expect(updateCadrageFieldSchema.parse({ sortOrder: 0 }).sortOrder).toBe(0);
  });
});

// ═══════════════════════════════════════
// createResearchSourceSchema
// ═══════════════════════════════════════

describe("createResearchSourceSchema", () => {
  it("accepts valid minimal data (title only)", () => {
    const result = createResearchSourceSchema.parse({ title: "A Source" });
    expect(result.title).toBe("A Source");
  });

  it("applies default type 'article'", () => {
    expect(createResearchSourceSchema.parse({ title: "T" }).type).toBe(
      "article"
    );
  });

  it("accepts valid full data", () => {
    const data = {
      title: "Deep Learning",
      authors: "LeCun Y, Bengio Y",
      year: 2015,
      type: "book",
      url: "https://example.com",
      notes: "Important reference",
    };
    expect(createResearchSourceSchema.parse(data)).toEqual(data);
  });

  it("rejects missing title", () => {
    expect(() => createResearchSourceSchema.parse({})).toThrow();
  });

  it("rejects empty title", () => {
    expect(() => createResearchSourceSchema.parse({ title: "" })).toThrow();
  });

  it("rejects year below 1900", () => {
    expect(() =>
      createResearchSourceSchema.parse({ title: "T", year: 1800 })
    ).toThrow();
  });

  it("rejects year above 2100", () => {
    expect(() =>
      createResearchSourceSchema.parse({ title: "T", year: 2200 })
    ).toThrow();
  });

  it("accepts year at boundary 1900", () => {
    expect(
      createResearchSourceSchema.parse({ title: "T", year: 1900 }).year
    ).toBe(1900);
  });

  it("accepts year at boundary 2100", () => {
    expect(
      createResearchSourceSchema.parse({ title: "T", year: 2100 }).year
    ).toBe(2100);
  });

  it("rejects float year", () => {
    expect(() =>
      createResearchSourceSchema.parse({ title: "T", year: 2020.5 })
    ).toThrow();
  });

  it("accepts type 'thesis'", () => {
    expect(
      createResearchSourceSchema.parse({ title: "T", type: "thesis" }).type
    ).toBe("thesis");
  });

  it("accepts type 'report'", () => {
    expect(
      createResearchSourceSchema.parse({ title: "T", type: "report" }).type
    ).toBe("report");
  });

  it("rejects invalid type", () => {
    expect(() =>
      createResearchSourceSchema.parse({ title: "T", type: "website" })
    ).toThrow();
  });

  it("accepts url as optional string", () => {
    expect(
      createResearchSourceSchema.parse({
        title: "T",
        url: "https://example.com",
      }).url
    ).toBe("https://example.com");
  });

  it("accepts notes as optional string", () => {
    expect(
      createResearchSourceSchema.parse({ title: "T", notes: "my notes" }).notes
    ).toBe("my notes");
  });

  it("rejects wrong type for title (number)", () => {
    expect(() => createResearchSourceSchema.parse({ title: 123 })).toThrow();
  });

  it("allows overriding default type", () => {
    expect(
      createResearchSourceSchema.parse({ title: "T", type: "book" }).type
    ).toBe("book");
  });
});

// ═══════════════════════════════════════
// updateResearchSourceSchema
// ═══════════════════════════════════════

describe("updateResearchSourceSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateResearchSourceSchema.parse({})).toEqual({});
  });

  it("rejects empty title (min(1))", () => {
    expect(() => updateResearchSourceSchema.parse({ title: "" })).toThrow();
  });

  it("accepts title with min(1)", () => {
    expect(updateResearchSourceSchema.parse({ title: "A" }).title).toBe("A");
  });

  it("accepts year as optional integer", () => {
    expect(updateResearchSourceSchema.parse({ year: 2023 }).year).toBe(2023);
  });

  it("rejects float year", () => {
    expect(() => updateResearchSourceSchema.parse({ year: 2023.5 })).toThrow();
  });

  it("accepts valid type enum values", () => {
    const types = ["article", "book", "thesis", "report"] as const;
    for (const type of types) {
      expect(updateResearchSourceSchema.parse({ type }).type).toBe(type);
    }
  });

  it("rejects invalid type enum", () => {
    expect(() =>
      updateResearchSourceSchema.parse({ type: "website" })
    ).toThrow();
  });

  it("accepts multiple optional fields", () => {
    const result = updateResearchSourceSchema.parse({
      title: "Updated",
      authors: "New Author",
      year: 2024,
      type: "book",
    });
    expect(result).toEqual({
      title: "Updated",
      authors: "New Author",
      year: 2024,
      type: "book",
    });
  });
});

// ═══════════════════════════════════════
// createNotebookEntrySchema
// ═══════════════════════════════════════

describe("createNotebookEntrySchema", () => {
  it("accepts valid minimal data (question + answer)", () => {
    expect(
      createNotebookEntrySchema.parse({
        question: "What is AI?",
        answer: "Artificial Intelligence.",
      })
    ).toEqual({ question: "What is AI?", answer: "Artificial Intelligence." });
  });

  it("accepts valid full data", () => {
    const data = {
      question: "Q",
      answer: "A",
      tags: "ai, ml",
      sourceId: "src-123",
    };
    expect(createNotebookEntrySchema.parse(data)).toEqual(data);
  });

  it("rejects missing question", () => {
    expect(() =>
      createNotebookEntrySchema.parse({ answer: "A" })
    ).toThrow();
  });

  it("rejects empty question", () => {
    expect(() =>
      createNotebookEntrySchema.parse({ question: "", answer: "A" })
    ).toThrow();
  });

  it("rejects missing answer", () => {
    expect(() =>
      createNotebookEntrySchema.parse({ question: "Q" })
    ).toThrow();
  });

  it("rejects empty answer", () => {
    expect(() =>
      createNotebookEntrySchema.parse({ question: "Q", answer: "" })
    ).toThrow();
  });

  it("rejects wrong type for question (number)", () => {
    expect(() =>
      createNotebookEntrySchema.parse({ question: 42, answer: "A" })
    ).toThrow();
  });

  it("rejects wrong type for answer (boolean)", () => {
    expect(() =>
      createNotebookEntrySchema.parse({ question: "Q", answer: true })
    ).toThrow();
  });

  it("accepts empty string for optional tags", () => {
    expect(
      createNotebookEntrySchema.parse({
        question: "Q",
        answer: "A",
        tags: "",
      }).tags
    ).toBe("");
  });

  it("rejects empty object", () => {
    expect(() => createNotebookEntrySchema.parse({})).toThrow();
  });

  it("accepts sourceId as optional string", () => {
    expect(
      createNotebookEntrySchema.parse({
        question: "Q",
        answer: "A",
        sourceId: "src-456",
      }).sourceId
    ).toBe("src-456");
  });
});

// ═══════════════════════════════════════
// updateNotebookEntrySchema
// ═══════════════════════════════════════

describe("updateNotebookEntrySchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateNotebookEntrySchema.parse({})).toEqual({});
  });

  it("rejects empty question (min(1))", () => {
    expect(() => updateNotebookEntrySchema.parse({ question: "" })).toThrow();
  });

  it("accepts question with min(1)", () => {
    expect(updateNotebookEntrySchema.parse({ question: "Q" }).question).toBe(
      "Q"
    );
  });

  it("accepts answer as optional string", () => {
    expect(
      updateNotebookEntrySchema.parse({ answer: "New answer" }).answer
    ).toBe("New answer");
  });

  it("accepts tags as optional string", () => {
    expect(updateNotebookEntrySchema.parse({ tags: "a, b" }).tags).toBe(
      "a, b"
    );
  });

  it("accepts sourceId as optional string", () => {
    expect(
      updateNotebookEntrySchema.parse({ sourceId: "src-789" }).sourceId
    ).toBe("src-789");
  });
});

// ═══════════════════════════════════════
// createSprintSchema
// ═══════════════════════════════════════

describe("createSprintSchema", () => {
  it("accepts valid minimal data (phase + title)", () => {
    expect(
      createSprintSchema.parse({ phase: "phase_0", title: "Sprint 1" })
    ).toEqual({ phase: "phase_0", title: "Sprint 1" });
  });

  it("accepts valid full data with datetime strings", () => {
    const data = {
      phase: "phase_1",
      title: "Sprint 2",
      description: "Description text",
      startDate: "2024-06-01T00:00:00Z",
      endDate: "2024-06-30T23:59:59Z",
      sortOrder: 2,
    };
    expect(createSprintSchema.parse(data)).toEqual(data);
  });

  it("rejects missing phase", () => {
    expect(() => createSprintSchema.parse({ title: "T" })).toThrow();
  });

  it("rejects missing title", () => {
    expect(() => createSprintSchema.parse({ phase: "phase_0" })).toThrow();
  });

  it("rejects empty title", () => {
    expect(() =>
      createSprintSchema.parse({ phase: "phase_0", title: "" })
    ).toThrow();
  });

  it("rejects invalid phase enum", () => {
    expect(() =>
      createSprintSchema.parse({ phase: "phase_5", title: "T" })
    ).toThrow();
  });

  it("accepts all valid phase enum values", () => {
    for (const phase of sprintPhases) {
      expect(createSprintSchema.parse({ phase, title: "T" }).phase).toBe(phase);
    }
  });

  it("accepts valid ISO datetime for startDate", () => {
    const result = createSprintSchema.parse({
      phase: "phase_0",
      title: "T",
      startDate: "2024-01-15T10:30:00Z",
    });
    expect(result.startDate).toBe("2024-01-15T10:30:00Z");
  });

  it("rejects invalid datetime for startDate", () => {
    expect(() =>
      createSprintSchema.parse({
        phase: "phase_0",
        title: "T",
        startDate: "not-a-date",
      })
    ).toThrow();
  });

  it("rejects invalid datetime for endDate", () => {
    expect(() =>
      createSprintSchema.parse({
        phase: "phase_0",
        title: "T",
        endDate: "2024-13-01",
      })
    ).toThrow();
  });

  it("rejects negative sortOrder", () => {
    expect(() =>
      createSprintSchema.parse({ phase: "phase_0", title: "T", sortOrder: -1 })
    ).toThrow();
  });

  it("rejects float sortOrder", () => {
    expect(() =>
      createSprintSchema.parse({ phase: "phase_0", title: "T", sortOrder: 1.5 })
    ).toThrow();
  });

  it("accepts sortOrder zero", () => {
    expect(
      createSprintSchema.parse({ phase: "phase_0", title: "T", sortOrder: 0 })
        .sortOrder
    ).toBe(0);
  });

  it("rejects wrong type for phase (number)", () => {
    expect(() =>
      createSprintSchema.parse({ phase: 0, title: "T" })
    ).toThrow();
  });

  it("accepts description as optional string", () => {
    expect(
      createSprintSchema.parse({
        phase: "phase_0",
        title: "T",
        description: "A long description here",
      }).description
    ).toBe("A long description here");
  });

  it("rejects empty object", () => {
    expect(() => createSprintSchema.parse({})).toThrow();
  });
});

// ═══════════════════════════════════════
// updateSprintSchema
// ═══════════════════════════════════════

describe("updateSprintSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateSprintSchema.parse({})).toEqual({});
  });

  it("accepts valid status enum values", () => {
    for (const status of sprintStatuses) {
      expect(updateSprintSchema.parse({ status }).status).toBe(status);
    }
  });

  it("rejects invalid status enum", () => {
    expect(() => updateSprintSchema.parse({ status: "cancelled" })).toThrow();
  });

  it("rejects empty title (min(1))", () => {
    expect(() => updateSprintSchema.parse({ title: "" })).toThrow();
  });

  it("accepts title with min(1)", () => {
    expect(updateSprintSchema.parse({ title: "A" }).title).toBe("A");
  });

  it("accepts valid ISO datetime for startDate", () => {
    expect(
      updateSprintSchema.parse({
        startDate: "2024-01-01T00:00:00Z",
      }).startDate
    ).toBe("2024-01-01T00:00:00Z");
  });

  it("rejects invalid datetime for endDate", () => {
    expect(() =>
      updateSprintSchema.parse({ endDate: "not-datetime" })
    ).toThrow();
  });

  it("rejects negative sortOrder", () => {
    expect(() => updateSprintSchema.parse({ sortOrder: -1 })).toThrow();
  });

  it("rejects float sortOrder", () => {
    expect(() => updateSprintSchema.parse({ sortOrder: 2.5 })).toThrow();
  });

  it("accepts sortOrder zero", () => {
    expect(updateSprintSchema.parse({ sortOrder: 0 }).sortOrder).toBe(0);
  });

  it("accepts description as string", () => {
    expect(
      updateSprintSchema.parse({ description: "Updated desc" }).description
    ).toBe("Updated desc");
  });
});

// ═══════════════════════════════════════
// createStorySchema
// ═══════════════════════════════════════

describe("createStorySchema", () => {
  it("accepts valid minimal data (title only)", () => {
    const result = createStorySchema.parse({ title: "User Story 1" });
    expect(result.title).toBe("User Story 1");
  });

  it("applies default priority 'medium'", () => {
    expect(createStorySchema.parse({ title: "T" }).priority).toBe("medium");
  });

  it("accepts valid full data", () => {
    const data = {
      title: "Story",
      description: "As a user I want...",
      priority: "high",
      storyPoints: 5,
      sortOrder: 3,
    };
    expect(createStorySchema.parse(data)).toEqual(data);
  });

  it("rejects missing title", () => {
    expect(() => createStorySchema.parse({})).toThrow();
  });

  it("rejects empty title", () => {
    expect(() => createStorySchema.parse({ title: "" })).toThrow();
  });

  it("rejects invalid priority enum", () => {
    expect(() =>
      createStorySchema.parse({ title: "T", priority: "urgent" })
    ).toThrow();
  });

  it("accepts all valid priority enum values", () => {
    for (const priority of storyPriorities) {
      expect(createStorySchema.parse({ title: "T", priority }).priority).toBe(
        priority
      );
    }
  });

  it("rejects negative storyPoints", () => {
    expect(() =>
      createStorySchema.parse({ title: "T", storyPoints: -1 })
    ).toThrow();
  });

  it("rejects float storyPoints", () => {
    expect(() =>
      createStorySchema.parse({ title: "T", storyPoints: 2.5 })
    ).toThrow();
  });

  it("accepts zero storyPoints", () => {
    expect(createStorySchema.parse({ title: "T", storyPoints: 0 }).storyPoints).toBe(
      0
    );
  });

  it("accepts positive integer storyPoints", () => {
    expect(createStorySchema.parse({ title: "T", storyPoints: 13 }).storyPoints).toBe(
      13
    );
  });

  it("rejects negative sortOrder", () => {
    expect(() =>
      createStorySchema.parse({ title: "T", sortOrder: -1 })
    ).toThrow();
  });

  it("rejects float sortOrder", () => {
    expect(() =>
      createStorySchema.parse({ title: "T", sortOrder: 1.5 })
    ).toThrow();
  });

  it("accepts sortOrder zero", () => {
    expect(createStorySchema.parse({ title: "T", sortOrder: 0 }).sortOrder).toBe(
      0
    );
  });

  it("accepts description as optional string", () => {
    expect(
      createStorySchema.parse({
        title: "T",
        description: "A description",
      }).description
    ).toBe("A description");
  });

  it("allows overriding default priority", () => {
    expect(
      createStorySchema.parse({ title: "T", priority: "critical" }).priority
    ).toBe("critical");
  });

  it("rejects wrong type for title (number)", () => {
    expect(() => createStorySchema.parse({ title: 42 })).toThrow();
  });

  it("rejects wrong type for priority (number)", () => {
    expect(() => createStorySchema.parse({ title: "T", priority: 1 })).toThrow();
  });
});

// ═══════════════════════════════════════
// updateStorySchema
// ═══════════════════════════════════════

describe("updateStorySchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateStorySchema.parse({})).toEqual({});
  });

  it("accepts valid status enum values", () => {
    for (const status of storyStatuses) {
      expect(updateStorySchema.parse({ status }).status).toBe(status);
    }
  });

  it("rejects invalid status enum", () => {
    expect(() => updateStorySchema.parse({ status: "cancelled" })).toThrow();
  });

  it("accepts valid priority enum values", () => {
    for (const priority of storyPriorities) {
      expect(updateStorySchema.parse({ priority }).priority).toBe(priority);
    }
  });

  it("rejects invalid priority enum", () => {
    expect(() => updateStorySchema.parse({ priority: "urgent" })).toThrow();
  });

  it("rejects empty title (min(1))", () => {
    expect(() => updateStorySchema.parse({ title: "" })).toThrow();
  });

  it("accepts title with min(1)", () => {
    expect(updateStorySchema.parse({ title: "A" }).title).toBe("A");
  });

  it("rejects negative storyPoints", () => {
    expect(() => updateStorySchema.parse({ storyPoints: -1 })).toThrow();
  });

  it("rejects float storyPoints", () => {
    expect(() => updateStorySchema.parse({ storyPoints: 3.5 })).toThrow();
  });

  it("accepts zero storyPoints", () => {
    expect(updateStorySchema.parse({ storyPoints: 0 }).storyPoints).toBe(0);
  });

  it("rejects negative sortOrder", () => {
    expect(() => updateStorySchema.parse({ sortOrder: -1 })).toThrow();
  });

  it("rejects float sortOrder", () => {
    expect(() => updateStorySchema.parse({ sortOrder: 1.5 })).toThrow();
  });

  it("accepts sortOrder zero", () => {
    expect(updateStorySchema.parse({ sortOrder: 0 }).sortOrder).toBe(0);
  });

  it("accepts multiple fields at once", () => {
    const result = updateStorySchema.parse({
      title: "Updated",
      status: "done",
      priority: "high",
      storyPoints: 8,
    });
    expect(result).toEqual({
      title: "Updated",
      status: "done",
      priority: "high",
      storyPoints: 8,
    });
  });
});

// ═══════════════════════════════════════
// createAiConfigSchema
// ═══════════════════════════════════════

describe("createAiConfigSchema", () => {
  it("accepts valid minimal data (provider only)", () => {
    const result = createAiConfigSchema.parse({ provider: "openai" });
    expect(result.provider).toBe("openai");
  });

  it("applies default isActive false", () => {
    expect(createAiConfigSchema.parse({ provider: "openai" }).isActive).toBe(
      false
    );
  });

  it("accepts valid full data", () => {
    const data = {
      provider: "anthropic",
      apiKey: "sk-ant-xxx",
      model: "claude-3-opus",
      isActive: true,
    };
    expect(createAiConfigSchema.parse(data)).toEqual(data);
  });

  it("rejects missing provider", () => {
    expect(() => createAiConfigSchema.parse({})).toThrow();
  });

  it("rejects invalid provider enum", () => {
    expect(() =>
      createAiConfigSchema.parse({ provider: "google" })
    ).toThrow();
  });

  it("accepts all valid provider enum values", () => {
    for (const provider of aiProviders) {
      expect(createAiConfigSchema.parse({ provider }).provider).toBe(provider);
    }
  });

  it("accepts isActive true", () => {
    expect(createAiConfigSchema.parse({ provider: "zai", isActive: true }).isActive).toBe(
      true
    );
  });

  it("rejects isActive as string", () => {
    expect(() =>
      createAiConfigSchema.parse({ provider: "zai", isActive: "true" })
    ).toThrow();
  });

  it("accepts apiKey as optional string", () => {
    expect(
      createAiConfigSchema.parse({
        provider: "openai",
        apiKey: "sk-12345",
      }).apiKey
    ).toBe("sk-12345");
  });

  it("accepts model as optional string", () => {
    expect(
      createAiConfigSchema.parse({
        provider: "openai",
        model: "gpt-4o",
      }).model
    ).toBe("gpt-4o");
  });

  it("accepts empty string for apiKey", () => {
    expect(
      createAiConfigSchema.parse({
        provider: "openai",
        apiKey: "",
      }).apiKey
    ).toBe("");
  });

  it("rejects wrong type for provider (number)", () => {
    expect(() => createAiConfigSchema.parse({ provider: 1 })).toThrow();
  });

  it("allows overriding default isActive to true", () => {
    expect(
      createAiConfigSchema.parse({ provider: "custom", isActive: true }).isActive
    ).toBe(true);
  });
});

// ═══════════════════════════════════════
// updateAiConfigSchema
// ═══════════════════════════════════════

describe("updateAiConfigSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateAiConfigSchema.parse({})).toEqual({});
  });

  it("accepts isActive true", () => {
    expect(updateAiConfigSchema.parse({ isActive: true }).isActive).toBe(true);
  });

  it("accepts isActive false", () => {
    expect(updateAiConfigSchema.parse({ isActive: false }).isActive).toBe(false);
  });

  it("rejects isActive as string", () => {
    expect(() => updateAiConfigSchema.parse({ isActive: "yes" })).toThrow();
  });

  it("accepts apiKey as string", () => {
    expect(updateAiConfigSchema.parse({ apiKey: "new-key" }).apiKey).toBe(
      "new-key"
    );
  });

  it("accepts model as string", () => {
    expect(updateAiConfigSchema.parse({ model: "gpt-4-turbo" }).model).toBe(
      "gpt-4-turbo"
    );
  });

  it("accepts multiple fields at once", () => {
    const result = updateAiConfigSchema.parse({
      apiKey: "key-xxx",
      model: "claude-3",
      isActive: true,
    });
    expect(result).toEqual({
      apiKey: "key-xxx",
      model: "claude-3",
      isActive: true,
    });
  });
});

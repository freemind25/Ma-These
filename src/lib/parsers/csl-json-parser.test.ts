import { describe, it, expect } from "vitest";
import { parseCSLJSON } from "./csl-json-parser";
import type { ParsedReference } from "./bibtex-parser";

// ═══════════════════════════════════════
// CSL-JSON Parser Tests
// ═══════════════════════════════════════

describe("parseCSLJSON", () => {
  // ─── Happy path: basic array input ─────────────────────────────
  describe("basic array input", () => {
    it("parses a minimal article-journal record", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          id: "doe2024",
          title: "A Study on Something",
          author: [{ family: "Doe", given: "John" }],
          issued: { "date-parts": [[2024]] },
          "container-title": "Journal of Studies",
        },
      ]);
      const result = parseCSLJSON(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject<Partial<ParsedReference>>({
        type: "article-journal",
        title: "A Study on Something",
        authors: "Doe, John",
        year: 2024,
        journal: "Journal of Studies",
      });
    });

    it("parses a record with all common fields", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          id: "smith2023",
          title: "Deep Learning in Practice",
          author: [
            { family: "Smith", given: "Jane" },
            { family: "Brown", given: "Robert" },
          ],
          issued: { "date-parts": [[2023, 5]] },
          "container-title": "Nature Machine Intelligence",
          volume: "5",
          issue: "3",
          page: "210-225",
          publisher: "Springer",
          DOI: "10.1038/s42256-023-00601-1",
          ISBN: "978-0-123-45678-9",
          URL: "https://example.com/paper",
          abstract: "This paper explores deep learning.",
          keyword: ["deep learning", "neural networks"],
          note: "Accepted for publication",
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r.type).toBe("article-journal");
      expect(r.title).toBe("Deep Learning in Practice");
      expect(r.authors).toBe("Smith, Jane; Brown, Robert");
      expect(r.year).toBe(2023);
      expect(r.journal).toBe("Nature Machine Intelligence");
      expect(r.volume).toBe("5");
      expect(r.issue).toBe("3");
      expect(r.pages).toBe("210-225");
      expect(r.publisher).toBe("Springer");
      expect(r.doi).toBe("10.1038/s42256-023-00601-1");
      expect(r.isbn).toBe("978-0-123-45678-9");
      expect(r.url).toBe("https://example.com/paper");
      expect(r.abstract).toBe("This paper explores deep learning.");
      expect(r.keywords).toBe("deep learning, neural networks");
      expect(r.notes).toBe("Accepted for publication");
    });
  });

  // ─── Single object input ────────────────────────────────────────
  describe("single object input", () => {
    it("wraps a single record in array", () => {
      const input = JSON.stringify({
        type: "book",
        title: "Test Book",
        author: [{ family: "Author", given: "Test" }],
        issued: { "date-parts": [[2020]] },
      });
      const result = parseCSLJSON(input);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("book");
      expect(result[0].title).toBe("Test Book");
    });

    it("wraps a single record with all fields", () => {
      const input = JSON.stringify({
        type: "article-journal",
        title: "Single Record",
        author: [{ family: "Doe", given: "Jane" }],
        issued: { "date-parts": [[2022]] },
        "container-title": "Nature",
        volume: "10",
        DOI: "10.1234/test",
      });
      const r = parseCSLJSON(input)[0];
      expect(r.title).toBe("Single Record");
      expect(r.journal).toBe("Nature");
      expect(r.doi).toBe("10.1234/test");
    });
  });

  // ─── Author handling ────────────────────────────────────────────
  describe("author handling", () => {
    it("formats family+given author", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [{ family: "Doe", given: "John" }],
        },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("Doe, John");
    });

    it("uses literal author when provided", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [{ literal: "Anonymous Author" }],
        },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("Anonymous Author");
    });

    it("prefers literal over family+given", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [{ family: "Doe", given: "John", literal: "J. Doe (ed.)" }],
        },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("J. Doe (ed.)");
    });

    it("handles family-only author", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [{ family: "Aristotle" }],
        },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("Aristotle");
    });

    it("handles given-only author", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [{ given: "First Name" }],
        },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("First Name");
    });

    it("handles author with no family, no given, no literal", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [{}],
        },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("");
    });

    it("joins multiple authors with semicolon", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [
            { family: "Smith", given: "Jane" },
            { family: "Brown", given: "Robert" },
            { family: "Lee", given: "Sara" },
          ],
        },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("Smith, Jane; Brown, Robert; Lee, Sara");
    });

    it("returns undefined when no author field", () => {
      const input = JSON.stringify([
        { type: "article-journal", title: "T" },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBeUndefined();
    });

    it("returns empty string when author is empty array", () => {
      const input = JSON.stringify([
        { type: "article-journal", title: "T", author: [] },
      ]);
      // Empty array is truthy, so map+join produces empty string
      expect(parseCSLJSON(input)[0].authors).toBe("");
    });
  });

  // ─── Type mapping ───────────────────────────────────────────────
  describe("type mapping", () => {
    it("maps 'article' to 'article-journal'", () => {
      const input = JSON.stringify([{ type: "article" }]);
      expect(parseCSLJSON(input)[0].type).toBe("article-journal");
    });

    it("maps 'chapter' to 'incollection'", () => {
      const input = JSON.stringify([{ type: "chapter" }]);
      expect(parseCSLJSON(input)[0].type).toBe("incollection");
    });

    it("maps 'thesis' to 'phdthesis'", () => {
      const input = JSON.stringify([{ type: "thesis" }]);
      expect(parseCSLJSON(input)[0].type).toBe("phdthesis");
    });

    it("maps 'phd-thesis' to 'phdthesis'", () => {
      const input = JSON.stringify([{ type: "phd-thesis" }]);
      expect(parseCSLJSON(input)[0].type).toBe("phdthesis");
    });

    it("maps 'master-thesis' to 'mastersthesis'", () => {
      const input = JSON.stringify([{ type: "master-thesis" }]);
      expect(parseCSLJSON(input)[0].type).toBe("mastersthesis");
    });

    it("maps 'post' to 'post-weblog'", () => {
      const input = JSON.stringify([{ type: "post" }]);
      expect(parseCSLJSON(input)[0].type).toBe("post-weblog");
    });

    it("maps 'entry' to 'entry-dictionary'", () => {
      const input = JSON.stringify([{ type: "entry" }]);
      expect(parseCSLJSON(input)[0].type).toBe("entry-dictionary");
    });

    it("keeps 'book' as 'book'", () => {
      const input = JSON.stringify([{ type: "book" }]);
      expect(parseCSLJSON(input)[0].type).toBe("book");
    });

    it("keeps 'article-journal' as 'article-journal'", () => {
      const input = JSON.stringify([{ type: "article-journal" }]);
      expect(parseCSLJSON(input)[0].type).toBe("article-journal");
    });

    it("normalizes case (Article-Journal → article-journal)", () => {
      const input = JSON.stringify([{ type: "Article-Journal" }]);
      expect(parseCSLJSON(input)[0].type).toBe("article-journal");
    });

    it("normalizes case (BOOK → book)", () => {
      const input = JSON.stringify([{ type: "BOOK" }]);
      expect(parseCSLJSON(input)[0].type).toBe("book");
    });

    it("maps 'techreport' to 'techreport'", () => {
      const input = JSON.stringify([{ type: "techreport" }]);
      expect(parseCSLJSON(input)[0].type).toBe("techreport");
    });
  });

  // ─── Keyword handling ───────────────────────────────────────────
  describe("keyword handling", () => {
    it("joins keyword array with commas", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          keyword: ["ai", "ml", "deep learning"],
        },
      ]);
      expect(parseCSLJSON(input)[0].keywords).toBe("ai, ml, deep learning");
    });

    it("passes string keyword as-is", () => {
      const input = JSON.stringify([
        { type: "article-journal", keyword: "single keyword" },
      ]);
      expect(parseCSLJSON(input)[0].keywords).toBe("single keyword");
    });

    it("returns undefined when no keyword field", () => {
      const input = JSON.stringify([{ type: "article-journal" }]);
      expect(parseCSLJSON(input)[0].keywords).toBeUndefined();
    });
  });

  // ─── Year / date-parts parsing ─────────────────────────────────
  describe("year parsing", () => {
    it("extracts year from date-parts[0][0]", () => {
      const input = JSON.stringify([
        { type: "article-journal", issued: { "date-parts": [[2024]] } },
      ]);
      expect(parseCSLJSON(input)[0].year).toBe(2024);
    });

    it("extracts year from date-parts with month", () => {
      const input = JSON.stringify([
        { type: "article-journal", issued: { "date-parts": [[2024, 3]] } },
      ]);
      expect(parseCSLJSON(input)[0].year).toBe(2024);
    });

    it("extracts year from date-parts with month and day", () => {
      const input = JSON.stringify([
        { type: "article-journal", issued: { "date-parts": [[2024, 3, 15]] } },
      ]);
      expect(parseCSLJSON(input)[0].year).toBe(2024);
    });

    it("returns undefined when no issued field", () => {
      const input = JSON.stringify([{ type: "article-journal" }]);
      expect(parseCSLJSON(input)[0].year).toBeUndefined();
    });

    it("returns undefined when issued has no date-parts", () => {
      const input = JSON.stringify([
        { type: "article-journal", issued: {} },
      ]);
      expect(parseCSLJSON(input)[0].year).toBeUndefined();
    });

    it("returns undefined when date-parts is empty array", () => {
      const input = JSON.stringify([
        { type: "article-journal", issued: { "date-parts": [] } },
      ]);
      expect(parseCSLJSON(input)[0].year).toBeUndefined();
    });
  });

  // ─── Editor field (not mapped but accepted in CSL) ──────────────
  describe("editor field", () => {
    it("does not use editor as author (editor is separate)", () => {
      const input = JSON.stringify([
        {
          type: "book",
          title: "Edited Book",
          editor: [{ family: "Editor", given: "Name" }],
        },
      ]);
      // Editor is not mapped to authors in the current implementation
      const r = parseCSLJSON(input)[0];
      expect(r.authors).toBeUndefined();
    });
  });

  // ─── Multiple records ──────────────────────────────────────────
  describe("multiple records", () => {
    it("parses array with two records", () => {
      const input = JSON.stringify([
        { type: "article-journal", title: "Paper 1" },
        { type: "book", title: "Book 1" },
      ]);
      const result = parseCSLJSON(input);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("article-journal");
      expect(result[1].type).toBe("book");
    });

    it("parses many records (15+)", () => {
      const records = Array.from({ length: 20 }, (_, i) => ({
        type: "article-journal",
        id: `ref${i}`,
        title: `Title ${i}`,
        issued: { "date-parts": [[2010 + i]] },
      }));
      const input = JSON.stringify(records);
      const result = parseCSLJSON(input);
      expect(result).toHaveLength(20);
      expect(result[19].year).toBe(2029);
    });
  });

  // ─── Filter: records without type ──────────────────────────────
  describe("filtering records without type", () => {
    it("filters out records with no type", () => {
      const input = JSON.stringify([
        { type: "article-journal", title: "Valid" },
        { title: "No type" },
        { type: "book", title: "Also Valid" },
      ]);
      const result = parseCSLJSON(input);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Valid");
      expect(result[1].title).toBe("Also Valid");
    });

    it("returns empty array when all records lack type", () => {
      const input = JSON.stringify([
        { title: "No type 1" },
        { title: "No type 2" },
      ]);
      expect(parseCSLJSON(input)).toEqual([]);
    });
  });

  // ─── Error / invalid input handling ────────────────────────────
  describe("error and invalid input handling", () => {
    it("returns empty array for invalid JSON", () => {
      expect(parseCSLJSON("not json")).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      expect(parseCSLJSON("")).toEqual([]);
    });

    it("returns empty array for JSON number", () => {
      expect(parseCSLJSON("42")).toEqual([]);
    });

    it("returns empty array for JSON string", () => {
      expect(parseCSLJSON('"hello"')).toEqual([]);
    });

    it("returns empty array for JSON null", () => {
      expect(parseCSLJSON("null")).toEqual([]);
    });

    it("returns empty array for empty JSON array", () => {
      expect(parseCSLJSON("[]")).toEqual([]);
    });

    it("returns empty array for empty JSON object (no type)", () => {
      expect(parseCSLJSON("{}")).toEqual([]);
    });

    it("returns empty array for JSON boolean", () => {
      expect(parseCSLJSON("true")).toEqual([]);
    });

    it("returns empty array for truncated JSON", () => {
      expect(parseCSLJSON('{"type":')).toEqual([]);
    });

    it("returns empty array for JSON array of non-objects", () => {
      expect(parseCSLJSON('[1, 2, 3]')).toEqual([]);
    });

    it("returns empty array for whitespace-only string", () => {
      expect(parseCSLJSON("   ")).toEqual([]);
    });
  });

  // ─── Unicode and special characters ────────────────────────────
  describe("unicode and special characters", () => {
    it("handles Unicode in title", () => {
      const input = JSON.stringify([
        { type: "article-journal", title: "Über die Quantenmechanik" },
      ]);
      expect(parseCSLJSON(input)[0].title).toBe("Über die Quantenmechanik");
    });

    it("handles CJK characters", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "日本語のタイトル",
          author: [{ family: "田中", given: "太郎" }],
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r.title).toBe("日本語のタイトル");
      expect(r.authors).toBe("田中, 太郎");
    });

    it("handles emoji in abstract", () => {
      const input = JSON.stringify([
        { type: "article-journal", abstract: "Results: 🎉 Success!" },
      ]);
      expect(parseCSLJSON(input)[0].abstract).toBe("Results: 🎉 Success!");
    });

    it("handles accented characters in author names", () => {
      const input = JSON.stringify([
        { type: "article-journal", author: [{ family: "Lévy", given: "Pierre" }] },
      ]);
      expect(parseCSLJSON(input)[0].authors).toBe("Lévy, Pierre");
    });
  });

  // ─── Real-world CSL-JSON examples ──────────────────────────────
  describe("real-world examples", () => {
    it("parses a typical Zotero-exported article", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          id: "knuth-1984",
          title: "Literate Programming",
          author: [{ family: "Knuth", given: "Donald E." }],
          issued: { "date-parts": [[1984]] },
          "container-title": "The Computer Journal",
          volume: "27",
          issue: "2",
          page: "97-111",
          publisher: "Oxford University Press",
          DOI: "10.1093/comjnl/27.2.97",
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r.title).toBe("Literate Programming");
      expect(r.authors).toBe("Knuth, Donald E.");
      expect(r.journal).toBe("The Computer Journal");
      expect(r.year).toBe(1984);
      expect(r.volume).toBe("27");
      expect(r.issue).toBe("2");
      expect(r.pages).toBe("97-111");
    });

    it("parses a typical Mendeley book export", () => {
      const input = JSON.stringify([
        {
          type: "book",
          title: "A Discipline of Programming",
          author: [{ family: "Dijkstra", given: "Edsger W." }],
          issued: { "date-parts": [[1976]] },
          publisher: "Prentice-Hall",
          ISBN: "0-13-215871-X",
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r.type).toBe("book");
      expect(r.isbn).toBe("0-13-215871-X");
      expect(r.publisher).toBe("Prentice-Hall");
    });

    it("parses a thesis record", () => {
      const input = JSON.stringify([
        {
          type: "thesis",
          title: "On the Nature of Computation",
          author: [{ family: "Doe", given: "Jane" }],
          issued: { "date-parts": [[2020]] },
          publisher: "MIT",
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r.type).toBe("phdthesis");
    });

    it("parses a webpage/online resource", () => {
      const input = JSON.stringify([
        {
          type: "webpage",
          title: "Vite Documentation",
          URL: "https://vitejs.dev",
          issued: { "date-parts": [[2024]] },
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r.type).toBe("webpage");
      expect(r.url).toBe("https://vitejs.dev");
    });
  });

  // ─── Boundary / stress ─────────────────────────────────────────
  describe("boundary cases", () => {
    it("handles very long title", () => {
      const longTitle = "A".repeat(1000);
      const input = JSON.stringify([{ type: "article-journal", title: longTitle }]);
      expect(parseCSLJSON(input)[0].title).toBe(longTitle);
    });

    it("handles record with minimal fields (only type)", () => {
      const input = JSON.stringify([{ type: "article-journal" }]);
      const r = parseCSLJSON(input)[0];
      expect(r.type).toBe("article-journal");
      expect(r.title).toBeUndefined();
      expect(r.year).toBeUndefined();
      expect(r.authors).toBeUndefined();
    });

    it("handles record with extra/unknown fields (ignored gracefully)", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "Test",
          unknownField: "ignored",
          anotherField: 42,
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r.title).toBe("Test");
      expect(r.type).toBe("article-journal");
    });

    it("handles many authors (20+)", () => {
      const authors = Array.from({ length: 25 }, (_, i) => ({
        family: `Author${i}`,
        given: `Name${i}`,
      }));
      const input = JSON.stringify([
        { type: "article-journal", title: "Big Collaboration", author: authors },
      ]);
      const result = parseCSLJSON(input)[0].authors;
      expect(result).toContain("Author0, Name0");
      expect(result).toContain("Author24, Name24");
      expect(result!.split("; ")).toHaveLength(25);
    });

    it("handles JSON with pretty-printing (multiline)", () => {
      const input = `[
  {
    "type": "article-journal",
    "title": "Pretty Printed"
  }
]`;
      const result = parseCSLJSON(input);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Pretty Printed");
    });
  });

  // ─── Output type structure ─────────────────────────────────────
  describe("output type structure", () => {
    it("returns objects with ParsedReference shape", () => {
      const input = JSON.stringify([
        {
          type: "article-journal",
          title: "T",
          author: [{ family: "F", given: "G" }],
          issued: { "date-parts": [[2024]] },
          "container-title": "J",
          volume: "V",
          issue: "I",
          page: "P",
          publisher: "Pub",
          DOI: "doi",
          ISBN: "isbn",
          URL: "url",
          abstract: "abs",
          keyword: "kw",
          note: "note",
        },
      ]);
      const r = parseCSLJSON(input)[0];
      expect(r).toHaveProperty("type");
      expect(r).not.toHaveProperty("bibtexKey");
      expect(r).toHaveProperty("authors");
      expect(r).toHaveProperty("title");
      expect(r).toHaveProperty("year");
      expect(r).toHaveProperty("journal");
      expect(r).toHaveProperty("volume");
      expect(r).toHaveProperty("issue");
      expect(r).toHaveProperty("pages");
      expect(r).toHaveProperty("publisher");
      expect(r).toHaveProperty("doi");
      expect(r).toHaveProperty("isbn");
      expect(r).toHaveProperty("url");
      expect(r).toHaveProperty("abstract");
      expect(r).toHaveProperty("keywords");
      expect(r).toHaveProperty("notes");
    });

    it("year is a number when present", () => {
      const input = JSON.stringify([
        { type: "article-journal", issued: { "date-parts": [[2024]] } },
      ]);
      expect(typeof parseCSLJSON(input)[0].year).toBe("number");
    });
  });
});

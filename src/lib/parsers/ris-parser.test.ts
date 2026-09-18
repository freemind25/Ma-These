import { describe, it, expect } from "vitest";
import { parseRIS } from "./ris-parser";
import type { ParsedReference } from "./bibtex-parser";

// ═══════════════════════════════════════
// RIS Parser Tests
// ═══════════════════════════════════════

describe("parseRIS", () => {
  // ─── Happy path: basic JOUR ───────────────────────────────────
  describe("basic journal article", () => {
    it("parses a minimal JOUR record", () => {
      const input = `TY  - JOUR
AU  - Doe, John
TI  - A Study on Something
PY  - 2024
JO  - Journal of Studies
ER  -
`;
      const result = parseRIS(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject<Partial<ParsedReference>>({
        type: "jour",
        authors: "Doe, John",
        title: "A Study on Something",
        year: 2024,
        journal: "Journal of Studies",
      });
    });

    it("parses a full JOUR record with all fields", () => {
      const input = `TY  - JOUR
AU  - Smith, Jane
AU  - Brown, Robert
TI  - Deep Learning in Practice
PY  - 2023
JO  - Nature Machine Intelligence
VL  - 5
IS  - 3
SP  - 210-225
PB  - Springer
DO  - 10.1038/s42256-023-00601-1
AB  - This paper explores deep learning.
KW  - deep learning; neural networks
N1  - Accepted for publication
SN  - 978-0-123-45678-9
UR  - https://example.com/paper
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.type).toBe("jour");
      expect(r.authors).toBe("Smith, Jane; Brown, Robert");
      expect(r.title).toBe("Deep Learning in Practice");
      expect(r.year).toBe(2023);
      expect(r.journal).toBe("Nature Machine Intelligence");
      expect(r.volume).toBe("5");
      expect(r.issue).toBe("3");
      expect(r.pages).toBe("210-225");
      expect(r.publisher).toBe("Springer");
      expect(r.doi).toBe("10.1038/s42256-023-00601-1");
      expect(r.abstract).toBe("This paper explores deep learning.");
      expect(r.keywords).toBe("deep learning; neural networks");
      expect(r.notes).toBe("Accepted for publication");
      expect(r.isbn).toBe("978-0-123-45678-9");
      expect(r.url).toBe("https://example.com/paper");
    });
  });

  // ─── Type mapping ──────────────────────────────────────────────
  describe("type mapping", () => {
    it("maps TB to rprt", () => {
      const input = `TY  - TB
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].type).toBe("rprt");
    });

    it("maps EBOOK to elec", () => {
      const input = `TY  - EBOOK
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].type).toBe("elec");
    });

    it("keeps JOUR as jour", () => {
      const input = `TY  - JOUR
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].type).toBe("jour");
    });

    it("keeps BOOK as book", () => {
      const input = `TY  - BOOK
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].type).toBe("book");
    });

    it("keeps THES as thes", () => {
      const input = `TY  - THES
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].type).toBe("thes");
    });

    it("keeps CONF as conf", () => {
      const input = `TY  - CONF
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].type).toBe("conf");
    });

    it("keeps CHAP as chap", () => {
      const input = `TY  - CHAP
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].type).toBe("chap");
    });
  });

  // ─── Multiple authors ──────────────────────────────────────────
  describe("author handling", () => {
    it("joins multiple AU lines with semicolon", () => {
      const input = `TY  - JOUR
AU  - Alice, A.
AU  - Bob, B.
AU  - Carol, C.
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].authors).toBe("Alice, A.; Bob, B.; Carol, C.");
    });

    it("handles single author", () => {
      const input = `TY  - JOUR
AU  - Doe, John
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].authors).toBe("Doe, John");
    });

    it("returns undefined when no AU field", () => {
      const input = `TY  - JOUR
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].authors).toBeUndefined();
    });

    it("trims whitespace from author names", () => {
      const input = `TY  - JOUR
AU  -   Doe, John  
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].authors).toBe("Doe, John");
    });

    it("filters empty author entries", () => {
      const input = `TY  - JOUR
AU  - Doe, John
AU  -  
AU  - Smith, Jane
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].authors).toBe("Doe, John; Smith, Jane");
    });
  });

  // ─── Year parsing ──────────────────────────────────────────────
  describe("year parsing", () => {
    it("parses plain 4-digit year", () => {
      const input = `TY  - JOUR
PY  - 2024
ER  -
`;
      expect(parseRIS(input)[0].year).toBe(2024);
    });

    it("parses Y1 field as year fallback", () => {
      const input = `TY  - JOUR
Y1  - 2020
ER  -
`;
      expect(parseRIS(input)[0].year).toBe(2020);
    });

    it("parses year from '2024//2024' format", () => {
      const input = `TY  - JOUR
PY  - 2024//2024
ER  -
`;
      expect(parseRIS(input)[0].year).toBe(2024);
    });

    it("parses year from '2024/2024' format", () => {
      const input = `TY  - JOUR
PY  - 2024/2024
ER  -
`;
      expect(parseRIS(input)[0].year).toBe(2024);
    });

    it("returns undefined when no year field", () => {
      const input = `TY  - JOUR
TI  - Test
ER  -
`;
      expect(parseRIS(input)[0].year).toBeUndefined();
    });

    it("prefers PY over Y1", () => {
      const input = `TY  - JOUR
PY  - 2023
Y1  - 2020
ER  -
`;
      expect(parseRIS(input)[0].year).toBe(2023);
    });
  });

  // ─── Journal field alternatives ────────────────────────────────
  describe("journal field alternatives", () => {
    it("uses JO field for journal", () => {
      const input = `TY  - JOUR
TI  - Test
JO  - Journal A
ER  -
`;
      expect(parseRIS(input)[0].journal).toBe("Journal A");
    });

    it("falls back to JF for journal", () => {
      const input = `TY  - JOUR
TI  - Test
JF  - Journal B
ER  -
`;
      expect(parseRIS(input)[0].journal).toBe("Journal B");
    });

    it("falls back to T2 for journal", () => {
      const input = `TY  - JOUR
TI  - Test
T2  - Journal C
ER  -
`;
      expect(parseRIS(input)[0].journal).toBe("Journal C");
    });

    it("prefers JO over JF and T2", () => {
      const input = `TY  - JOUR
TI  - Test
JO  - Priority Journal
JF  - Secondary Journal
T2  - Tertiary Journal
ER  -
`;
      expect(parseRIS(input)[0].journal).toBe("Priority Journal");
    });
  });

  // ─── Abstract field alternatives ───────────────────────────────
  describe("abstract field alternatives", () => {
    it("uses AB field for abstract", () => {
      const input = `TY  - JOUR
TI  - Test
AB  - Primary abstract
ER  -
`;
      expect(parseRIS(input)[0].abstract).toBe("Primary abstract");
    });

    it("falls back to N2 for abstract", () => {
      const input = `TY  - JOUR
TI  - Test
N2  - Secondary abstract
ER  -
`;
      expect(parseRIS(input)[0].abstract).toBe("Secondary abstract");
    });

    it("prefers AB over N2", () => {
      const input = `TY  - JOUR
TI  - Test
AB  - Primary
N2  - Secondary
ER  -
`;
      expect(parseRIS(input)[0].abstract).toBe("Primary");
    });
  });

  // ─── Multiple records ──────────────────────────────────────────
  describe("multiple records", () => {
    it("parses two records", () => {
      const input = `TY  - JOUR
TI  - First Paper
PY  - 2020
ER  -
TY  - BOOK
TI  - Second Book
PY  - 2021
ER  -
`;
      const result = parseRIS(input);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("jour");
      expect(result[1].type).toBe("book");
    });

    it("parses many records (10+)", () => {
      const records = Array.from({ length: 15 }, (_, i) =>
        `TY  - JOUR\nAU  - Author ${i}\nTI  - Title ${i}\nPY  - ${2010 + i}\nER  -`
      ).join("\n");
      const result = parseRIS(records);
      expect(result).toHaveLength(15);
      expect(result[14].year).toBe(2024);
    });

    it("preserves record order", () => {
      const input = `TY  - JOUR
TI  - First
ER  -
TY  - BOOK
TI  - Second
ER  -
TY  - THES
TI  - Third
ER  -
`;
      const result = parseRIS(input);
      expect(result[0].title).toBe("First");
      expect(result[1].title).toBe("Second");
      expect(result[2].title).toBe("Third");
    });
  });

  // ─── Continuation lines ────────────────────────────────────────
  describe("continuation lines", () => {
    it("appends continuation line to previous field", () => {
      const input = `TY  - JOUR
TI  - This is a long title
  that continues on next line
PY  - 2024
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.title).toContain("This is a long title");
      expect(r.title).toContain("that continues on next line");
    });

    it("handles multiple continuation lines", () => {
      const input = `TY  - JOUR
AB  - Line one
  Line two
  Line three
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.abstract).toContain("Line one");
      expect(r.abstract).toContain("Line two");
      expect(r.abstract).toContain("Line three");
    });
  });

  // ─── ER delimiter variations ───────────────────────────────────
  describe("ER delimiter variations", () => {
    it("handles ER with trailing spaces", () => {
      const input = `TY  - JOUR
TI  - Test
ER  -   
`;
      expect(parseRIS(input)).toHaveLength(1);
    });

    it("handles ER with no value after dash", () => {
      const input = `TY  - JOUR
TI  - Test
ER  -
`;
      expect(parseRIS(input)).toHaveLength(1);
    });
  });

  // ─── Skipped records ───────────────────────────────────────────
  describe("skipped records", () => {
    it("skips record without TY field", () => {
      const input = `AU  - Doe, John
TI  - No Type Record
ER  -
`;
      expect(parseRIS(input)).toHaveLength(0);
    });

    it("skips empty block between ER markers", () => {
      const input = `ER  -
ER  -
`;
      expect(parseRIS(input)).toHaveLength(0);
    });
  });

  // ─── Empty / edge cases ────────────────────────────────────────
  describe("empty and edge cases", () => {
    it("returns empty array for empty string", () => {
      expect(parseRIS("")).toEqual([]);
    });

    it("returns empty array for whitespace-only string", () => {
      expect(parseRIS("   \n\n  \t  ")).toEqual([]);
    });

    it("returns empty array for plain text", () => {
      expect(parseRIS("Just some random text")).toEqual([]);
    });

    it("handles record with only TY field", () => {
      const input = `TY  - JOUR\nER  -\n`;
      const result = parseRIS(input);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("jour");
      expect(result[0].title).toBeUndefined();
    });
  });

  // ─── Special characters and Unicode ────────────────────────────
  describe("special characters and Unicode", () => {
    it("handles Unicode in title", () => {
      const input = `TY  - JOUR
AU  - Müller, Hans
TI  - Über die Quantenmechanik
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.authors).toBe("Müller, Hans");
      expect(r.title).toBe("Über die Quantenmechanik");
    });

    it("handles CJK characters", () => {
      const input = `TY  - JOUR
AU  - 田中太郎
TI  - 日本語のタイトル
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.authors).toBe("田中太郎");
      expect(r.title).toBe("日本語のタイトル");
    });

    it("handles French accented characters", () => {
      const input = `TY  - JOUR
AU  - Lévy, Pierre
TI  - Les technologies de l'intelligence
ER  -
`;
      expect(parseRIS(input)[0].authors).toBe("Lévy, Pierre");
    });

    it("handles emoji in title", () => {
      const input = `TY  - JOUR
TI  - A study on 🧬 DNA
ER  -
`;
      expect(parseRIS(input)[0].title).toBe("A study on 🧬 DNA");
    });

    it("handles special RIS characters like slashes in DOI", () => {
      const input = `TY  - JOUR
DO  - 10.1000/xyz123
ER  -
`;
      expect(parseRIS(input)[0].doi).toBe("10.1000/xyz123");
    });
  });

  // ─── Real-world RIS examples ───────────────────────────────────
  describe("real-world examples", () => {
    it("parses a typical Zotero-exported journal article", () => {
      const input = `TY  - JOUR
AU  - Knuth, Donald E.
TI  - Literate Programming
JO  - The Computer Journal
PY  - 1984
VL  - 27
IS  - 2
SP  - 97-111
PB  - Oxford University Press
DO  - 10.1093/comjnl/27.2.97
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.authors).toBe("Knuth, Donald E.");
      expect(r.title).toBe("Literate Programming");
      expect(r.journal).toBe("The Computer Journal");
      expect(r.year).toBe(1984);
      expect(r.volume).toBe("27");
      expect(r.issue).toBe("2");
      expect(r.pages).toBe("97-111");
    });

    it("parses a typical EndNote book export", () => {
      const input = `TY  - BOOK
AU  - Dijkstra, Edsger W.
TI  - A Discipline of Programming
PY  - 1976
PB  - Prentice-Hall
SN  - 0-13-215871-X
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.type).toBe("book");
      expect(r.isbn).toBe("0-13-215871-X");
    });

    it("parses a thesis record", () => {
      const input = `TY  - THES
AU  - Doe, Jane
TI  - On the Nature of Computation
PY  - 2020
PB  - MIT
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.type).toBe("thes");
      expect(r.publisher).toBe("MIT");
    });

    it("parses a Mendeley-style conference paper", () => {
      const input = `TY  - CONF
AU  - Turing, Alan M.
TI  - Computing Machinery and Intelligence
PY  - 1950
T2  - Mind
DO  - 10.1093/mind/LIX.236.433
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.type).toBe("conf");
      expect(r.journal).toBe("Mind");
    });
  });

  // ─── Boundary / stress ─────────────────────────────────────────
  describe("boundary cases", () => {
    it("handles very long field value", () => {
      const longTitle = "A".repeat(500);
      const input = `TY  - JOUR\nTI  - ${longTitle}\nER  -\n`;
      expect(parseRIS(input)[0].title).toBe(longTitle);
    });

    it("handles tag with no value after dash", () => {
      const input = `TY  - JOUR
TI  -
ER  -
`;
      const r = parseRIS(input)[0];
      // Empty string is falsy, so fields.TI || fields.T1 yields undefined
      expect(r.title).toBeUndefined();
    });

    it("handles mixed line endings", () => {
      const input = "TY  - JOUR\r\nAU  - Doe, John\r\nTI  - Test\r\nER  -\r\n";
      const result = parseRIS(input);
      expect(result).toHaveLength(1);
    });

    it("handles blank lines within a record", () => {
      const input = `TY  - JOUR
AU  - Doe, John

TI  - Test Title

PY  - 2024
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.authors).toBe("Doe, John");
      expect(r.title).toBe("Test Title");
      expect(r.year).toBe(2024);
    });

    it("handles record with many fields", () => {
      const input = `TY  - JOUR
AU  - Author One
AU  - Author Two
AU  - Author Three
TI  - Complex Title
JO  - Journal of Everything
PY  - 2023
VL  - 42
IS  - 7
SP  - 1-100
PB  - Big Publisher
DO  - 10.1234/test.2023
SN  - 978-0-000-00000-0
UR  - https://example.com
AB  - A very long abstract text
KW  - kw1, kw2, kw3, kw4
N1  - Some important note
ER  -
`;
      const r = parseRIS(input)[0];
      expect(r.authors).toBe("Author One; Author Two; Author Three");
      expect(r.doi).toBe("10.1234/test.2023");
      expect(r.isbn).toBe("978-0-000-00000-0");
      expect(r.url).toBe("https://example.com");
    });
  });

  // ─── Tag format variations ─────────────────────────────────────
  describe("tag format variations", () => {
    it("handles 2-character numeric tags", () => {
      // Some RIS files use numeric tags like "A2"
      const input = `TY  - JOUR
A2  - Editor Name
TI  - Test
ER  -
`;
      // Should parse without error; A2 is not a mapped field so it's ignored
      const result = parseRIS(input);
      expect(result).toHaveLength(1);
    });

    it("handles tags with varying whitespace around dash", () => {
      const input = `TY  - JOUR
TI  -Test
PY  -  2020
ER  -
`;
      const r = parseRIS(input)[0];
      // Extra whitespace before value is trimmed by the parser
      expect(r.title).toBeDefined();
      expect(r.year).toBe(2020);
    });
  });

  // ─── Type case normalization ────────────────────────────────────
  describe("type case normalization", () => {
    it("normalizes type to lowercase with whitespace trim", () => {
      const input = `TY  -  JOUR  \nTI  - Test\nER  -\n`;
      expect(parseRIS(input)[0].type).toBe("jour");
    });

    it("normalizes uppercase type", () => {
      const input = `TY  - BOOK\nTI  - Test\nER  -\n`;
      expect(parseRIS(input)[0].type).toBe("book");
    });
  });
});

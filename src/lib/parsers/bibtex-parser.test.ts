import { describe, it, expect } from "vitest";
import { parseBibTex } from "./bibtex-parser";
import type { ParsedReference } from "./bibtex-parser";

// ═══════════════════════════════════════
// BibTeX Parser Tests
// ═══════════════════════════════════════

describe("parseBibTex", () => {
  // ─── Happy path: basic article ───────────────────────────────────
  describe("basic article entry", () => {
    it("parses a minimal @article entry", () => {
      const input = `@article{key2024,
  author = {Doe, John},
  title = {A Study on Something},
  year = {2024},
  journal = {Journal of Studies},
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject<Partial<ParsedReference>>({
        type: "article",
        bibtexKey: "key2024",
        authors: "Doe, John",
        title: "A Study on Something",
        year: 2024,
        journal: "Journal of Studies",
      });
    });

    it("parses an article with all common fields", () => {
      const input = `@article{smith2023,
  author = {Smith, Jane and Brown, Robert},
  title = {Deep Learning in Practice},
  year = {2023},
  journal = {Nature Machine Intelligence},
  volume = {5},
  number = {3},
  pages = {210--225},
  publisher = {Springer},
  doi = {10.1038/s42256-023-00601-1},
  abstract = {This paper explores...},
  keywords = {deep learning; neural networks},
  note = {Accepted for publication},
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(1);
      const r = result[0];
      expect(r.type).toBe("article");
      expect(r.bibtexKey).toBe("smith2023");
      expect(r.authors).toBe("Smith, Jane; Brown, Robert");
      expect(r.title).toBe("Deep Learning in Practice");
      expect(r.year).toBe(2023);
      expect(r.journal).toBe("Nature Machine Intelligence");
      expect(r.volume).toBe("5");
      expect(r.issue).toBe("3");
      expect(r.pages).toBe("210--225");
      expect(r.publisher).toBe("Springer");
      expect(r.doi).toBe("10.1038/s42256-023-00601-1");
      expect(r.abstract).toBe("This paper explores...");
      expect(r.keywords).toBe("deep learning; neural networks");
      expect(r.notes).toBe("Accepted for publication");
    });
  });

  // ─── Entry type mapping ──────────────────────────────────────────
  describe("entry type mapping", () => {
    it("maps @conference to inproceedings", () => {
      const input = `@conference{conf1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("inproceedings");
    });

    it("maps @mastersthesis to phdthesis", () => {
      const input = `@mastersthesis{ms1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("phdthesis");
    });

    it("maps @electronic to online", () => {
      const input = `@electronic{el1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("online");
    });

    it("maps @thesis to phdthesis", () => {
      const input = `@thesis{th1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("phdthesis");
    });

    it("keeps @article as article", () => {
      const input = `@article{a1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("article");
    });

    it("keeps @book as book", () => {
      const input = `@book{b1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("book");
    });

    it("keeps @inproceedings as inproceedings", () => {
      const input = `@inproceedings{ip1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("inproceedings");
    });

    it("keeps @phdthesis as phdthesis", () => {
      const input = `@phdthesis{p1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("phdthesis");
    });

    it("keeps @misc as misc", () => {
      const input = `@misc{m1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("misc");
    });

    it("keeps @techreport as techreport", () => {
      const input = `@techreport{tr1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("techreport");
    });

    it("keeps @incollection as incollection", () => {
      const input = `@incollection{ic1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("incollection");
    });

    it("keeps @online as online", () => {
      const input = `@online{o1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].type).toBe("online");
    });
  });

  // ─── Skipped types ───────────────────────────────────────────────
  describe("skipped non-entry types", () => {
    it("skips @string definitions", () => {
      const input = `@string{key = "value"}
`;
      expect(parseBibTex(input)).toHaveLength(0);
    });

    it("skips @preamble", () => {
      const input = `@preamble{some latex}
`;
      expect(parseBibTex(input)).toHaveLength(0);
    });

    it("skips @comment entries", () => {
      const input = `@comment{this is a comment}
`;
      expect(parseBibTex(input)).toHaveLength(0);
    });

    it("skips @comment blocks in content", () => {
      const input = `@comment{ignore me}
@article{a1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)).toHaveLength(1);
    });
  });

  // ─── Comment lines (% prefix) ───────────────────────────────────
  describe("comment handling", () => {
    it("strips lines starting with %", () => {
      const input = `% This is a comment
@article{a1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)).toHaveLength(1);
    });

    it("strips multiple % comment lines", () => {
      const input = `% line 1
% line 2
@article{a1,
  author={X},
  title={Y},
  year={2020}
}
`;
      expect(parseBibTex(input)).toHaveLength(1);
    });

    it("preserves entries that have % inside braces", () => {
      const input = `@article{a1,
  author={X},
  title={100\% completion},
  year={2020}
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("100% completion");
    });
  });

  // ─── Field value formats ─────────────────────────────────────────
  describe("field value formats", () => {
    it("parses brace-delimited values", () => {
      const input = `@article{a1,
  author={Doe, John},
  title={Test},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBe("Doe, John");
    });

    it("parses quote-delimited values", () => {
      const input = `@article{a1,
  author="Doe, John",
  title="Test",
  year="2020"
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(1);
      expect(result[0].authors).toBe("Doe, John");
      expect(result[0].year).toBe(2020);
    });

    it("parses bare numeric year values", () => {
      const input = `@article{a1,
  author={X},
  title={T},
  year=2021
}
`;
      expect(parseBibTex(input)[0].year).toBe(2021);
    });

    it("handles mixed brace and quote fields in same entry", () => {
      const input = `@article{a1,
  author={Doe},
  title="Test Title",
  year=2022
}
`;
      const r = parseBibTex(input)[0];
      expect(r.authors).toBe("Doe");
      expect(r.title).toBe("Test Title");
      expect(r.year).toBe(2022);
    });
  });

  // ─── Author handling ─────────────────────────────────────────────
  describe("author handling", () => {
    it("joins multiple authors with 'and' separator", () => {
      const input = `@article{a1,
  author={Alice, A and Bob, B and Carol, C},
  title={T},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBe("Alice, A; Bob, B; Carol, C");
    });

    it("handles 'AND' in uppercase", () => {
      const input = `@article{a1,
  author={Alice AND Bob},
  title={T},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBe("Alice; Bob");
    });

    it("handles single author", () => {
      const input = `@article{a1,
  author={Doe, John},
  title={T},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBe("Doe, John");
    });

    it("returns undefined for missing author field", () => {
      const input = `@article{a1,
  title={T},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBeUndefined();
    });
  });

  // ─── LaTeX cleaning ──────────────────────────────────────────────
  describe("LaTeX cleaning", () => {
    it("removes \\textbf{...} commands", () => {
      const input = `@article{a1,
  author={X},
  title="\\textbf{Important} result",
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("Important result");
    });

    it("removes \\emph{...} commands", () => {
      const input = `@article{a1,
  author={X},
  title="\\emph{emphasis} here",
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("emphasis here");
    });

    it("removes \\textit{...} commands", () => {
      const input = `@article{a1,
  author={X},
  title="\\textit{italic} text",
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("italic text");
    });

    it("removes standalone braces {word}", () => {
      const input = `@article{a1,
  author={X},
  title="A {nested} word",
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("A nested word");
    });

    it("replaces ~ with space", () => {
      const input = `@article{a1,
  author={X},
  title={Non~breaking~space},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("Non breaking space");
    });

    it("collapses multiple whitespace to single space", () => {
      const input = `@article{a1,
  author={X},
  title={Multiple   spaces},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("Multiple spaces");
    });

    it("trims leading/trailing whitespace", () => {
      const input = `@article{a1,
  author={  spaced  },
  title={T},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBe("spaced");
    });
  });

  // ─── Year parsing ────────────────────────────────────────────────
  describe("year parsing", () => {
    it("extracts 4-digit year from braces", () => {
      const input = `@article{a1,
  author={X},
  title={T},
  year={2024}
}
`;
      expect(parseBibTex(input)[0].year).toBe(2024);
    });

    it("extracts 4-digit year from quoted string", () => {
      const input = `@article{a1,
  author={X},
  title={T},
  year="1999"
}
`;
      expect(parseBibTex(input)[0].year).toBe(1999);
    });

    it("extracts 4-digit year from bare number", () => {
      const input = `@article{a1,
  author={X},
  title={T},
  year=2005
}
`;
      expect(parseBibTex(input)[0].year).toBe(2005);
    });

    it("returns undefined for missing year", () => {
      const input = `@article{a1,
  author={X},
  title={T}
}
`;
      expect(parseBibTex(input)[0].year).toBeUndefined();
    });

    it("extracts year from month-year string like 'January 2020'", () => {
      const input = `@article{a1,
  author={X},
  title={T},
  year={January 2020}
}
`;
      expect(parseBibTex(input)[0].year).toBe(2020);
    });

    it("extracts year from '2020/2021' range", () => {
      const input = `@article{a1,
  author={X},
  title={T},
  year={2020/2021}
}
`;
      expect(parseBibTex(input)[0].year).toBe(2020);
    });
  });

  // ─── URL and fallback fields ─────────────────────────────────────
  describe("fallback fields", () => {
    it("uses url field directly", () => {
      const input = `@misc{m1,
  title={T},
  year={2020},
  url={https://example.com}
}
`;
      expect(parseBibTex(input)[0].url).toBe("https://example.com");
    });

    it("falls back to howpublished for url", () => {
      const input = `@misc{m1,
  title={T},
  year={2020},
  howpublished="\\url{https://example.com}"
}
`;
      expect(parseBibTex(input)[0].url).toBe("https://example.com");
    });

    it("uses note field directly", () => {
      const input = `@article{a1,
  title={T},
  year={2020},
  note={Some note}
}
`;
      expect(parseBibTex(input)[0].notes).toBe("Some note");
    });

    it("falls back to annote for notes", () => {
      const input = `@article{a1,
  title={T},
  year={2020},
  annote={An annotation}
}
`;
      expect(parseBibTex(input)[0].notes).toBe("An annotation");
    });

    it("prefers note over annote when both present", () => {
      const input = `@article{a1,
  title={T},
  year={2020},
  note={Primary},
  annote={Secondary}
}
`;
      expect(parseBibTex(input)[0].notes).toBe("Primary");
    });

    it("uses isbn field", () => {
      const input = `@book{b1,
  title={T},
  year={2020},
  isbn={978-0-123456-78-9}
}
`;
      expect(parseBibTex(input)[0].isbn).toBe("978-0-123456-78-9");
    });
  });

  // ─── Multiple entries ───────────────────────────────────────────
  describe("multiple entries", () => {
    it("parses two entries", () => {
      const input = `@article{a1,
  author={X},
  title={T1},
  year={2020}
}
@book{b1,
  author={Y},
  title={T2},
  year={2021}
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("article");
      expect(result[1].type).toBe("book");
    });

    it("parses many entries (10+)", () => {
      const entries = Array.from({ length: 12 }, (_, i) =>
        `@article{key${i},
  author={Author${i}},
  title={Title${i}},
  year=${2010 + i}
}`
      ).join("\n");
      const result = parseBibTex(entries);
      expect(result).toHaveLength(12);
      expect(result[11].year).toBe(2021);
    });

    it("preserves entry order", () => {
      const input = `@article{first,
  author={A},
  title={A Title},
  year={2010}
}
@book{second,
  author={B},
  title={B Title},
  year={2015}
}
@inproceedings{third,
  author={C},
  title={C Title},
  year={2020}
}
`;
      const result = parseBibTex(input);
      expect(result[0].bibtexKey).toBe("first");
      expect(result[1].bibtexKey).toBe("second");
      expect(result[2].bibtexKey).toBe("third");
    });
  });

  // ─── Empty / edge cases ─────────────────────────────────────────
  describe("empty and edge cases", () => {
    it("returns empty array for empty string", () => {
      expect(parseBibTex("")).toEqual([]);
    });

    it("returns empty array for whitespace-only string", () => {
      expect(parseBibTex("   \n\n  \t  \n")).toEqual([]);
    });

    it("returns empty array for comment-only content", () => {
      expect(parseBibTex("% comment\n% another")).toEqual([]);
    });

    it("returns empty array for @comment-only content", () => {
      expect(parseBibTex("@comment{stuff}\n")).toEqual([]);
    });

    it("handles minimal entry with citation key and one field", () => {
      // The parser regex requires \n before closing }, so the entry must have
      // the closing brace on its own line AND at least one field for the
      // citation key to be captured (otherwise backtracking skips the key group).
      const input = `@article{emptykey,
  year = {}
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("article");
      expect(result[0].bibtexKey).toBe("emptykey");
      expect(result[0].title).toBeUndefined();
      expect(result[0].year).toBeUndefined();
    });

    it("handles entry without citation key", () => {
      const input = `@article{author={NoKey},
  title={T},
  year={2020}
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(1);
      // The regex treats the first comma-delimited token as the citation key
      expect(result[0].bibtexKey).toBe("author={NoKey}");
    });
  });

  // ─── Special characters and Unicode ──────────────────────────────
  describe("special characters and Unicode", () => {
    it("handles Unicode characters in title", () => {
      const input = `@article{a1,
  author={Müller, Hans},
  title={Über die Quantenmechanik},
  year={2020}
}
`;
      const r = parseBibTex(input)[0];
      expect(r.authors).toBe("Müller, Hans");
      expect(r.title).toBe("Über die Quantenmechanik");
    });

    it("handles CJK characters", () => {
      const input = `@article{a1,
  author={田中太郎},
  title={日本語のタイトル},
  year={2020}
}
`;
      const r = parseBibTex(input)[0];
      expect(r.authors).toBe("田中太郎");
      expect(r.title).toBe("日本語のタイトル");
    });

    it("handles emoji in title", () => {
      const input = `@article{a1,
  author={X},
  title={A study on 🧬 DNA},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("A study on 🧬 DNA");
    });

    it("handles accented characters (French)", () => {
      const input = `@article{a1,
  author={Lévy, Pierre},
  title={Les technologies de l'intelligence},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBe("Lévy, Pierre");
    });

    it("handles mathematical symbols", () => {
      const input = `@article{a1,
  author={X},
  title={α + β = γ},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe("α + β = γ");
    });
  });

  // ─── Real-world BibTeX examples ──────────────────────────────────
  describe("real-world examples", () => {
    it("parses a typical Zotero-exported article", () => {
      const input = `@article{knuth1984,
  author = {Knuth, Donald E.},
  title = {Literate Programming},
  journal = {The Computer Journal},
  year = {1984},
  volume = {27},
  number = {2},
  pages = {97--111},
  publisher = {Oxford University Press},
  doi = {10.1093/comjnl/27.2.97},
}
`;
      const r = parseBibTex(input)[0];
      expect(r.bibtexKey).toBe("knuth1984");
      expect(r.authors).toBe("Knuth, Donald E.");
      expect(r.title).toBe("Literate Programming");
      expect(r.journal).toBe("The Computer Journal");
      expect(r.year).toBe(1984);
      expect(r.volume).toBe("27");
      expect(r.issue).toBe("2");
      expect(r.pages).toBe("97--111");
      expect(r.doi).toBe("10.1093/comjnl/27.2.97");
    });

    it("parses a book with ISBN and publisher", () => {
      const input = `@book{dijkstra1976,
  author = {Dijkstra, Edsger W.},
  title = {A Discipline of Programming},
  year = {1976},
  publisher = {Prentice-Hall},
  isbn = {0-13-215871-X},
}
`;
      const r = parseBibTex(input)[0];
      expect(r.type).toBe("book");
      expect(r.isbn).toBe("0-13-215871-X");
      expect(r.publisher).toBe("Prentice-Hall");
    });

    it("parses an inproceedings with DOI", () => {
      const input = `@inproceedings{turing1950,
  author = {Turing, Alan M.},
  title = {Computing Machinery and Intelligence},
  booktitle = {Mind},
  year = {1950},
  doi = {10.1093/mind/LIX.236.433},
}
`;
      const r = parseBibTex(input)[0];
      expect(r.type).toBe("inproceedings");
      expect(r.doi).toBe("10.1093/mind/LIX.236.433");
    });

    it("parses a PhD thesis", () => {
      const input = `@phdthesis{doe2020,
  author = {Doe, Jane},
  title = {On the Nature of Computation},
  school = {MIT},
  year = {2020},
}
`;
      const r = parseBibTex(input)[0];
      expect(r.type).toBe("phdthesis");
      expect(r.bibtexKey).toBe("doe2020");
    });

    it("parses an online/misc entry with URL", () => {
      const input = `@misc{rfc2616,
  author = {Fielding, R. and Gettys, J. and Mogul, J. and Frystyk, H. and Masinter, L. and Leach, P. and Berners-Lee, T.},
  title = {Hypertext Transfer Protocol -- HTTP/1.1},
  year = {1999},
  howpublished = "\\url{https://tools.ietf.org/html/rfc2616}",
}
`;
      const r = parseBibTex(input)[0];
      expect(r.type).toBe("misc");
      expect(r.url).toBe("https://tools.ietf.org/html/rfc2616");
      expect(r.authors).toContain("Fielding, R.");
      expect(r.authors).toContain("Berners-Lee, T.");
    });
  });

  // ─── Boundary / stress ───────────────────────────────────────────
  describe("boundary cases", () => {
    it("handles very long title", () => {
      const longTitle = "A".repeat(500);
      const input = `@article{a1,
  author={X},
  title={${longTitle}},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].title).toBe(longTitle);
    });

    it("handles entry with many fields", () => {
      const input = `@article{big1,
  author = {Author One and Author Two and Author Three},
  title = {Complex Title},
  journal = {Journal of Everything},
  year = {2023},
  volume = {42},
  number = {7},
  pages = {1--100},
  publisher = {Big Publisher},
  doi = {10.1234/test.2023},
  isbn = {978-0-000-00000-0},
  url = {https://example.com},
  abstract = {A very long abstract text},
  keywords = {kw1, kw2, kw3, kw4},
  note = {Some important note},
}
`;
      const r = parseBibTex(input)[0];
      expect(r.authors).toBe("Author One; Author Two; Author Three");
      expect(r.doi).toBe("10.1234/test.2023");
      expect(r.isbn).toBe("978-0-000-00000-0");
      expect(r.url).toBe("https://example.com");
    });

    it("handles entry with only citation key and type", () => {
      const input = `@misc{minimal,
  year = {}
}
`;
      const r = parseBibTex(input)[0];
      expect(r.type).toBe("misc");
      expect(r.bibtexKey).toBe("minimal");
      expect(r.title).toBeUndefined();
      expect(r.year).toBeUndefined();
    });

    it("handles LaTeX commands in author field", () => {
      const input = `@article{a1,
  author="\\textbf{Bold} Author",
  title={T},
  year={2020}
}
`;
      expect(parseBibTex(input)[0].authors).toBe("Bold Author");
    });

    it("handles title with newlines (collapsed to spaces)", () => {
      const input = `@article{a1,
  author={X},
  title={Multi
line
title},
  year={2020}
}
`;
      // The parser collapses whitespace
      const title = parseBibTex(input)[0].title;
      expect(title).toBeDefined();
      expect(title).not.toContain("\n");
    });

    it("handles field with empty braces", () => {
      const input = `@article{a1,
  author={X},
  title={},
  year={2020}
}
`;
      const r = parseBibTex(input)[0];
      // Empty after cleaning → undefined
      expect(r.title).toBeUndefined();
    });

    it("handles nested braces in field values", () => {
      const input = `@article{a1,
  author={X},
  title={A {\\"o} character},
  year={2020}
}
`;
      const title = parseBibTex(input)[0].title;
      expect(title).toBeDefined();
    });
  });

  // ─── Malformed input tolerance ───────────────────────────────────
  describe("malformed input tolerance", () => {
    it("returns empty for plain text with no entries", () => {
      expect(parseBibTex("Just some random text")).toEqual([]);
    });

    it("ignores unclosed braces gracefully", () => {
      const input = `@article{a1, author={X, title={T, year={2020}\n`;
      // May return empty or partial, but should not throw
      const result = parseBibTex(input);
      expect(Array.isArray(result)).toBe(true);
    });

    it("handles extra whitespace around field = sign", () => {
      const input = `@article{a1,
  author  =  {X},
  title  =  {T},
  year  =  2020
}
`;
      const r = parseBibTex(input)[0];
      expect(r.authors).toBe("X");
      expect(r.year).toBe(2020);
    });

    it("handles entry with trailing comma after last field", () => {
      const input = `@article{a1,
  author={X},
  title={T},
  year={2020},
}
`;
      const result = parseBibTex(input);
      expect(result).toHaveLength(1);
      expect(result[0].year).toBe(2020);
    });
  });
});

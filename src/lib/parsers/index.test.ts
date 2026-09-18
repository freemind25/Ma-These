import { describe, it, expect } from "vitest";
import {
  parseBibTex,
  parseRIS,
  parseCSLJSON,
  detectFormat,
  IMPORT_FORMATS,
  type ImportFormat,
  type ParsedReference,
} from "./index";

// ═══════════════════════════════════════
// Parser Index / Re-exports Tests
// ═══════════════════════════════════════

describe("parser index exports", () => {
  // ─── Function re-exports ──────────────────────────────────────
  describe("function re-exports", () => {
    it("exports parseBibTex function", () => {
      expect(typeof parseBibTex).toBe("function");
    });

    it("exports parseRIS function", () => {
      expect(typeof parseRIS).toBe("function");
    });

    it("exports parseCSLJSON function", () => {
      expect(typeof parseCSLJSON).toBe("function");
    });

    it("exports detectFormat function", () => {
      expect(typeof detectFormat).toBe("function");
    });
  });

  // ─── Type exports ──────────────────────────────────────────────
  describe("type exports", () => {
    // We can't directly test type exports at runtime,
    // but we can verify the functions work with the expected types
    it("parseBibTex returns ParsedReference[]", () => {
      const result: ParsedReference[] = parseBibTex(
        `@article{a1,
  author={X},
  title={T},
  year={2020}
}
`
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("type");
      expect(result[0]).toHaveProperty("title");
    });

    it("parseRIS returns ParsedReference[]", () => {
      const result: ParsedReference[] = parseRIS(
        `TY  - JOUR\nTI  - T\nER  -\n`
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("type");
    });

    it("parseCSLJSON returns ParsedReference[]", () => {
      const result: ParsedReference[] = parseCSLJSON(
        JSON.stringify([{ type: "article-journal", title: "T" }])
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("type");
    });
  });

  // ─── IMPORT_FORMATS constant ───────────────────────────────────
  describe("IMPORT_FORMATS", () => {
    it("is an array with 3 entries", () => {
      expect(IMPORT_FORMATS).toHaveLength(3);
    });

    it("contains bibtex format definition", () => {
      const bib = IMPORT_FORMATS.find((f) => f.value === "bibtex");
      expect(bib).toBeDefined();
      expect(bib!.label).toBe("BibTeX");
      expect(bib!.extension).toBe(".bib");
    });

    it("contains ris format definition", () => {
      const ris = IMPORT_FORMATS.find((f) => f.value === "ris");
      expect(ris).toBeDefined();
      expect(ris!.label).toBe("RIS");
      expect(ris!.extension).toBe(".ris");
    });

    it("contains csl-json format definition", () => {
      const csl = IMPORT_FORMATS.find((f) => f.value === "csl-json");
      expect(csl).toBeDefined();
      expect(csl!.label).toBe("CSL-JSON");
      expect(csl!.extension).toBe(".json");
    });

    it("each format has value, label, extension, and description", () => {
      for (const fmt of IMPORT_FORMATS) {
        expect(fmt).toHaveProperty("value");
        expect(fmt).toHaveProperty("label");
        expect(fmt).toHaveProperty("extension");
        expect(fmt).toHaveProperty("description");
        expect(typeof fmt.value).toBe("string");
        expect(typeof fmt.label).toBe("string");
        expect(typeof fmt.extension).toBe("string");
        expect(typeof fmt.description).toBe("string");
      }
    });

    it("values are valid ImportFormat type literals", () => {
      const validValues: ImportFormat[] = ["bibtex", "ris", "csl-json"];
      const actualValues = IMPORT_FORMATS.map((f) => f.value);
      for (const v of actualValues) {
        expect(validValues).toContain(v);
      }
    });

    it("extensions include leading dot", () => {
      for (const fmt of IMPORT_FORMATS) {
        expect(fmt.extension).toMatch(/^\.[a-z]+$/);
      }
    });

    it("descriptions are non-empty strings", () => {
      for (const fmt of IMPORT_FORMATS) {
        expect(fmt.description.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── detectFormat ──────────────────────────────────────────────
  describe("detectFormat", () => {
    // Extension-based detection
    describe("extension-based detection", () => {
      it("detects .bib as bibtex", () => {
        expect(detectFormat("refs.bib", "")).toBe("bibtex");
      });

      it("detects .bibtex as bibtex", () => {
        expect(detectFormat("refs.bibtex", "")).toBe("bibtex");
      });

      it("detects .ris as ris", () => {
        expect(detectFormat("refs.ris", "")).toBe("ris");
      });

      it("detects .json as csl-json", () => {
        expect(detectFormat("refs.json", "")).toBe("csl-json");
      });

      it("handles uppercase extensions (.BIB → bibtex)", () => {
        expect(detectFormat("refs.BIB", "")).toBe("bibtex");
      });

      it("handles mixed-case extensions (.Ris → ris)", () => {
        expect(detectFormat("refs.Ris", "")).toBe("ris");
      });

      it("handles mixed-case extensions (.Json → csl-json)", () => {
        expect(detectFormat("refs.Json", "")).toBe("csl-json");
      });

      it("extracts extension from filename with multiple dots", () => {
        expect(detectFormat("my.refs.bib", "")).toBe("bibtex");
      });

      it("handles filename with path separators", () => {
        expect(detectFormat("/path/to/refs.bib", "")).toBe("bibtex");
      });

      it("returns null for unknown extension with empty content", () => {
        expect(detectFormat("refs.xml", "")).toBeNull();
      });

      it("returns null for extensionless filename with empty content", () => {
        expect(detectFormat("refs", "")).toBeNull();
      });

      it("returns null for empty filename with empty content", () => {
        expect(detectFormat("", "")).toBeNull();
      });

      it("extension takes priority over content", () => {
        // File is .bib but content looks like RIS
        const content = "TY  - JOUR\nTI  - Test\nER  -";
        expect(detectFormat("file.bib", content)).toBe("bibtex");
      });
    });

    // Content-based detection
    describe("content-based detection", () => {
      it("detects BibTeX from @-prefixed content", () => {
        expect(detectFormat("file.txt", "@article{key, author={X}}")).toBe("bibtex");
      });

      it("detects BibTeX from @article content", () => {
        expect(detectFormat("unknown", "@book{b1, title={T}}")).toBe("bibtex");
      });

      it("detects RIS from TY- content", () => {
        expect(detectFormat("file.txt", "TY  - JOUR\nTI  - Test\nER  -")).toBe("ris");
      });

      it("detects RIS with case-insensitive TY match", () => {
        expect(detectFormat("file.txt", "ty  - JOUR")).toBe("ris");
      });

      it("detects CSL-JSON from array content", () => {
        const content = JSON.stringify([{ type: "article-journal" }]);
        expect(detectFormat("file.txt", content)).toBe("csl-json");
      });

      it("detects CSL-JSON from single-object content", () => {
        const content = JSON.stringify({ type: "article-journal", title: "T" });
        expect(detectFormat("file.txt", content)).toBe("csl-json");
      });

      it("does not detect CSL-JSON from array without type", () => {
        const content = JSON.stringify([{ title: "No type" }]);
        expect(detectFormat("file.txt", content)).toBeNull();
      });

      it("does not detect CSL-JSON from object without type", () => {
        const content = JSON.stringify({ title: "No type" });
        expect(detectFormat("file.txt", content)).toBeNull();
      });
    });

    // Return null cases
    describe("returns null", () => {
      it("returns null for plain text", () => {
        expect(detectFormat("file.txt", "Just some plain text")).toBeNull();
      });

      it("returns null for numeric-only content", () => {
        expect(detectFormat("file.txt", "12345")).toBeNull();
      });

      it("returns null for CSV content", () => {
        expect(detectFormat("file.txt", "name,year,title\nDoe,2020,Test")).toBeNull();
      });

      it("returns null for XML content", () => {
        expect(detectFormat("file.xml", "<root><item>test</item></root>")).toBeNull();
      });

      it("returns null for empty content with unknown extension", () => {
        expect(detectFormat("file.txt", "")).toBeNull();
      });

      it("returns null for whitespace-only content with unknown extension", () => {
        expect(detectFormat("file.txt", "   \n  ")).toBeNull();
      });
    });

    // Priority testing
    describe("detection priority", () => {
      it("BibTeX content detected before JSON array content", () => {
        // Content starts with @, so bibtex wins even though it could be JSON-ish
        const content = "@article{key, title={T}}";
        expect(detectFormat("file.txt", content)).toBe("bibtex");
      });

      it("RIS content detected before JSON", () => {
        const content = "TY  - JOUR";
        expect(detectFormat("file.txt", content)).toBe("ris");
      });

      it("CSL-JSON detected when content is valid JSON with type", () => {
        const content = JSON.stringify([{ type: "book" }]);
        expect(detectFormat("file.dat", content)).toBe("csl-json");
      });
    });

    // Whitespace handling
    describe("whitespace handling", () => {
      it("detects BibTeX with leading spaces (trimmed)", () => {
        expect(detectFormat("file.txt", "  @article{key, title={T}}")).toBe("bibtex");
      });

      it("handles content with only whitespace after trim", () => {
        expect(detectFormat("file.txt", "   \n\n  ")).toBeNull();
      });

      it("detects BibTeX with leading whitespace trimmed", () => {
        expect(detectFormat("file.txt", "  \n@article{key, title={T}}")).toBe("bibtex");
      });

      it("detects RIS with leading whitespace trimmed", () => {
        expect(detectFormat("file.txt", "  \nTY  - JOUR")).toBe("ris");
      });
    });

    // Type safety
    describe("return type", () => {
      it("returns ImportFormat literal or null", () => {
        const result: ImportFormat | null = detectFormat("refs.bib", "");
        expect(result === "bibtex" || result === "ris" || result === "csl-json" || result === null).toBe(true);
      });
    });
  });

  // ─── Cross-parser consistency ──────────────────────────────────
  describe("cross-parser consistency", () => {
    it("all parsers return ParsedReference[] for valid input", () => {
      const bibResult = parseBibTex(`@article{a1,
  title={T},
  year={2020}
}
`);
      const risResult = parseRIS(`TY  - JOUR\nTI  - T\nPY  - 2020\nER  -\n`);
      const cslResult = parseCSLJSON(
        JSON.stringify([{ type: "article-journal", title: "T", issued: { "date-parts": [[2020]] } }])
      );

      for (const r of [...bibResult, ...risResult, ...cslResult]) {
        expect(r).toHaveProperty("type");
        expect(typeof r.type).toBe("string");
      }
    });

    it("all parsers return empty array for empty input", () => {
      expect(parseBibTex("")).toEqual([]);
      expect(parseRIS("")).toEqual([]);
      expect(parseCSLJSON("")).toEqual([]);
    });

    it("all parsers return array type", () => {
      expect(Array.isArray(parseBibTex("invalid"))).toBe(true);
      expect(Array.isArray(parseRIS("invalid"))).toBe(true);
      expect(Array.isArray(parseCSLJSON("invalid"))).toBe(true);
    });
  });
});

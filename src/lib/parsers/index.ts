// ═══════════════════════════════════════
// ThesisFrame — Reference Parsers Index
// Unified import for all parser types
// ═══════════════════════════════════════

export { parseBibTex, type ParsedReference } from "./bibtex-parser";
export { parseRIS } from "./ris-parser";
export { parseCSLJSON } from "./csl-json-parser";

export type ImportFormat = "bibtex" | "ris" | "csl-json";

export const IMPORT_FORMATS: { value: ImportFormat; label: string; extension: string; description: string }[] = [
  {
    value: "bibtex",
    label: "BibTeX",
    extension: ".bib",
    description: "Mendeley, Zotero, JabRef, LaTeX",
  },
  {
    value: "ris",
    label: "RIS",
    extension: ".ris",
    description: "Mendeley, EndNote, Zotero",
  },
  {
    value: "csl-json",
    label: "CSL-JSON",
    extension: ".json",
    description: "Zotero, Mendeley, Citation.js",
  },
];

/**
 * Detect the format from file extension or content.
 */
export function detectFormat(filename: string, content: string): ImportFormat | null {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "bib" || ext === "bibtex") return "bibtex";
  if (ext === "ris") return "ris";
  if (ext === "json") return "csl-json";

  // Auto-detect from content
  if (content.trim().startsWith("@")) return "bibtex";
  if (/^TY\s+-/im.test(content)) return "ris";

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed[0]?.type) return "csl-json";
    if (parsed?.type) return "csl-json";
  } catch { /* not JSON */ }

  return null;
}

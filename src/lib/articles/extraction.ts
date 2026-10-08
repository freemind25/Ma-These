// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Extraction de documents importés (mémoire/thèse)
// Logique pure ; parseurs (mammoth, unpdf) chargés dynamiquement
// côté serveur. Cahier des charges : vérifier type réel + taille ;
// détecter les PDF scannés ; signaler les limites au lieu de
// prétendre que tout s'est bien passé.
// ═══════════════════════════════════════════════════════════════

/** Taille maximale d'un fichier importé (constante configurable). */
export const MAX_IMPORT_BYTES = 50 * 1024 * 1024; // 50 Mo — couvre les scans réels (44,2 Mo constatés)

export type ImportFileType = "docx" | "pdf" | "txt";

export interface ExtractionLimit {
  kind: "scanned" | "ocr" | "no-headings" | "no-biblio" | "parse-error";
  detail: string;
}

export interface DocHeading {
  level: number;
  text: string;
}

/** Détecte le type du fichier (nom + type MIME). */
export function detectFileType(filename: string, mimeType?: string | null): ImportFileType | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return "txt";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType?.startsWith("text/")) return "txt";
  return null;
}

/** Valide la taille (configurable via MAX_IMPORT_BYTES). */
export function validateFileSize(sizeBytes: number): { ok: boolean; error?: string } {
  if (sizeBytes <= 0) return { ok: false, error: "Fichier vide (0 octet)." };
  if (sizeBytes > MAX_IMPORT_BYTES) {
    return {
      ok: false,
      error: `Fichier trop volumineux : ${(sizeBytes / 1024 / 1024).toFixed(1)} Mo (maximum ${MAX_IMPORT_BYTES / 1024 / 1024} Mo).`,
    };
  }
  return { ok: true };
}

/** Signature binaire minimale (anti-renommage : %PDF, ZIP/DOCX). */
export function checkMagicBytes(bytes: Uint8Array, expected: ImportFileType): boolean {
  const head = Array.from(bytes.slice(0, 4))
    .map((b) => String.fromCharCode(b))
    .join("");
  if (expected === "pdf") return head.startsWith("%PDF");
  if (expected === "docx") return head.startsWith("PK"); // conteneur zip
  return true;
}

/** DOCX → HTML + texte (mammoth, dynamique, serveur uniquement). */
export async function extractDocx(buffer: Buffer): Promise<{ html: string; text: string }> {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { html, text };
}

/** PDF → texte par page (unpdf, dynamique, serveur uniquement). */
export async function extractPdf(buffer: Buffer): Promise<{ pages: string[] }> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [String(text)];
  return { pages };
}

/** Titres depuis le HTML mammoth (h1-h6). */
export function headingsFromHtml(html: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const re = /<h([1-6])[^>]*>(.*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    if (text) headings.push({ level: Number(m[1]), text });
  }
  return headings;
}

/** Détection de PDF scanné : pages sans texte extractible (< 10 car.). */
export function detectScannedPages(pages: string[]): {
  scanned: boolean;
  emptyPages: number[];
} {
  const emptyPages = pages
    .map((p, i) => (p.trim().length < 10 ? i + 1 : 0))
    .filter((n) => n > 0);
  return { scanned: emptyPages.length > 0, emptyPages };
}

/** Heuristique bibliographie (fin de document). */
export function hasBibliography(text: string): boolean {
  const tail = text.slice(-Math.max(2000, Math.floor(text.length * 0.15)));
  return /(bibliographie|références|references|bibliography|works cited)/i.test(tail);
}

/** Construit la liste honnête des limites de l'extraction. */
export function buildLimits(input: {
  fileType: ImportFileType;
  scanned: boolean;
  emptyPages: number[];
  headings: DocHeading[];
  text: string;
}): ExtractionLimit[] {
  const limits: ExtractionLimit[] = [];
  if (input.scanned) {
    limits.push({
      kind: "scanned",
      detail:
        `PDF probablement scanné : ${input.emptyPages.length} page(s) sans texte extractible ` +
        `(pages ${input.emptyPages.slice(0, 10).join(", ")}${input.emptyPages.length > 10 ? "…" : ""}). ` +
        "Un OCR est disponible : lancez-le depuis la liste des sources (langue au choix, plafond 30 pages par job, exécution asynchrone) — relecture humaine exigée ensuite.",
    });
  }
  if (input.fileType === "pdf") {
    limits.push({
      kind: "no-headings",
      detail: "PDF : structure de titres non garantie (extraction texte brute) — la segmentation se fera sur le contenu.",
    });
  }
  if (input.fileType === "docx" && input.headings.length === 0) {
    limits.push({ kind: "no-headings", detail: "Aucun titre de section détecté dans le document DOCX." });
  }
  if (!hasBibliography(input.text)) {
    limits.push({ kind: "no-biblio", detail: "Aucune bibliographie repérée en fin de document." });
  }
  return limits;
}

/** Aperçu tronqué pour l'étape « confirmer l'extraction ». */
export function truncatePreview(text: string, maxChars = 2000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n… (aperçu tronqué — texte intégral conservé)";
}

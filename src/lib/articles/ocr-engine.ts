// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Moteur OCR côté serveur (cycle article-ocr-async)
//
// Serveur uniquement. Les librairies lourdes (pngjs, tesseract.js) sont
// chargées DYNAMIQUEMENT — le module reste léger à l'import (motif
// mammoth/unpdf du dépôt).
//
// Garanties mémoire (box OOM confirmée — étude § 6.2) :
//   - 1 worker tesseract par page, TERMINÉ systématiquement (CA-1.5) ;
//   - réduction entière au-dessus du plafond de pixels (ocr.ts) ;
//   - données de langue lues depuis vendor/tessdata — zéro réseau (CA-1.6).
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import {
  bitmapToRgba,
  computeDownscaleFactor,
  downscaleNearest,
  type OcrBitmap,
  type OcrLang,
} from "./ocr";

/** Résout le dossier des données de langue (fra/eng/ara embarqués). */
export function resolveTessdataPath(): string {
  const candidates = [
    process.env.TESSDATA_PATH,
    path.join(process.cwd(), "vendor", "tessdata"),
    // runtime `next start` standalone : le cwd est .next/standalone
    path.join(process.cwd(), "..", "..", "vendor", "tessdata"),
  ].filter((c): c is string => typeof c === "string" && c.length > 0);
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "fra.traineddata.gz"))) return candidate;
  }
  throw new Error(
    "Données de langue OCR introuvables (vendor/tessdata) — vérifiez que le dossier est présent."
  );
}

/** Encode un bitmap décodé en PNG (pngjs, pur JS) avec réduction si nécessaire. */
export async function bitmapToPng(img: OcrBitmap): Promise<Buffer> {
  const { PNG } = await import("pngjs");
  const factor = computeDownscaleFactor(img.width, img.height);
  const scaled = downscaleNearest(img, factor);
  const rgba = bitmapToRgba(scaled);
  const png = new PNG({ width: scaled.width, height: scaled.height });
  png.data = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength);
  return PNG.sync.write(png);
}

/** Reconnaît UNE page : worker créé puis terminé (garantie mémoire CA-1.5). */
export async function ocrPage(
  png: Buffer,
  lang: OcrLang
): Promise<{ text: string; confidence: number }> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(lang, 1, {
    langPath: resolveTessdataPath(),
    cacheMethod: "none", // lecture fs locale, aucune écriture, aucun réseau
    logger: () => {},
  });
  try {
    const { data } = await worker.recognize(png);
    return {
      text: (data.text ?? "").trim(),
      confidence: typeof data.confidence === "number" ? data.confidence : 0,
    };
  } finally {
    // Libération systématique du moteur entre les pages — même en cas d'erreur
    await worker.terminate();
  }
}

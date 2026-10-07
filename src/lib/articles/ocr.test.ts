import { describe, it, expect } from "vitest";
import {
  OCR_LANGS,
  OCR_MAX_PAGES_DEFAULT,
  OCR_TARGET_PIXELS,
  bitmapToRgba,
  buildOcrBlock,
  computeDownscaleFactor,
  downscaleNearest,
  hasOcrBlock,
  isOcrLang,
  mergeOcrIntoLimits,
  mergeOcrIntoText,
  pickMainImage,
  planOcrPages,
  resolveOcrMaxPages,
  type OcrPageResult,
} from "./ocr";

// ── resolveOcrMaxPages (CA-1.5 : plafond défaut 30, configurable) ────────
describe("resolveOcrMaxPages", () => {
  it("renvoie 30 par défaut", () => {
    expect(resolveOcrMaxPages(null)).toBe(OCR_MAX_PAGES_DEFAULT);
    expect(resolveOcrMaxPages(undefined)).toBe(30);
  });
  it("ignore les valeurs invalides", () => {
    expect(resolveOcrMaxPages("abc")).toBe(30);
    expect(resolveOcrMaxPages("0")).toBe(30);
    expect(resolveOcrMaxPages("-5")).toBe(30);
  });
  it("bornes la valeur lue entre 1 et 200", () => {
    expect(resolveOcrMaxPages("45")).toBe(45);
    expect(resolveOcrMaxPages(12)).toBe(12);
    expect(resolveOcrMaxPages("999")).toBe(200);
    expect(resolveOcrMaxPages(3.7)).toBe(3);
  });
});

// ── bitmap → RGBA (canaux 1/3/4, extractImages unpdf) ────────────────────
describe("bitmapToRgba / downscale / pickMainImage", () => {
  it("convertit un bitmap 1 canal (masque JBIG2) en RGBA", () => {
    const rgba = bitmapToRgba({ data: new Uint8Array([10, 200, 30]), width: 3, height: 1, channels: 1 });
    expect(Array.from(rgba)).toEqual([10, 10, 10, 255, 200, 200, 200, 255, 30, 30, 30, 255]);
  });
  it("convertit un bitmap 3 canaux en RGBA opaque", () => {
    const rgba = bitmapToRgba({ data: new Uint8Array([1, 2, 3, 4, 5, 6]), width: 2, height: 1, channels: 3 });
    expect(Array.from(rgba)).toEqual([1, 2, 3, 255, 4, 5, 6, 255]);
  });
  it("conserve un bitmap 4 canaux tel quel", () => {
    const src = new Uint8Array([1, 2, 3, 128]);
    const rgba = bitmapToRgba({ data: src, width: 1, height: 1, channels: 4 });
    expect(Array.from(rgba)).toEqual([1, 2, 3, 128]);
  });
  it("réduit par facteur entier en échantillonnant (plus proche voisin)", () => {
    // 4×2 gris : ligne 0 = [0 10 20 30], ligne 1 = [40 50 60 70] — facteur 2
    // → 2×1 : échantillonne (x=0,y=0) et (x=2,y=0) de la ligne 0
    const img = { data: new Uint8Array([0, 10, 20, 30, 40, 50, 60, 70]), width: 4, height: 2, channels: 1 as const };
    const out = downscaleNearest(img, 2);
    expect(out.width).toBe(2);
    expect(out.height).toBe(1);
    expect(Array.from(out.data)).toEqual([0, 20]);
  });
  it("facteur 1 = identité (pas de copie)", () => {
    const img = { data: new Uint8Array([1, 2]), width: 2, height: 1, channels: 1 as const };
    const out = downscaleNearest(img, 1);
    expect(out.data).toBe(img.data);
  });
  it("calcule un facteur entier ≥ 1 sous le plafond de pixels", () => {
    expect(computeDownscaleFactor(2480, 3508)).toBe(1); // A4 300 dpi ≈ 8,7 Mpx < 9 Mpx
    expect(computeDownscaleFactor(4960, 7016)).toBeGreaterThan(1); // 600 dpi → réduit
    expect(computeDownscaleFactor(1, 1)).toBe(1);
    expect(computeDownscaleFactor(4960, 7016) * 4960 * 7016).toBeGreaterThanOrEqual(OCR_TARGET_PIXELS);
  });
  it("sélectionne la plus grande image de la page, null si aucune", () => {
    const small = { data: new Uint8Array(4), width: 10, height: 10, channels: 4 as const };
    const big = { data: new Uint8Array(4), width: 800, height: 600, channels: 4 as const };
    expect(pickMainImage([])).toBeNull();
    expect(pickMainImage([small, big])).toBe(big);
    expect(pickMainImage([big, small])).toBe(big);
  });
});

// ── planOcrPages (plafond + reste consigné) ──────────────────────────────
describe("planOcrPages", () => {
  it("trie et plafonne au maximum annoncé, le reste est consigné", () => {
    const { pagesToOcr, remaining } = planOcrPages([7, 2, 9, 1], 3);
    expect(pagesToOcr).toEqual([1, 2, 7]);
    expect(remaining).toEqual([9]);
  });
  it("plafond supérieur au nombre de pages = tout est traité", () => {
    const plan = planOcrPages([3, 1], 30);
    expect(plan.pagesToOcr).toEqual([1, 3]);
    expect(plan.remaining).toEqual([]);
  });
  it("plafond 0 = aucune page", () => {
    const plan = planOcrPages([1, 2], 0);
    expect(plan.pagesToOcr).toEqual([]);
    expect(plan.remaining).toEqual([1, 2]);
  });
});

// ── buildOcrBlock (bloc marqué, confiance, données-seulement CA-1.2/1.4) ─
describe("buildOcrBlock", () => {
  const ok: OcrPageResult[] = [
    { page: 3, text: "Première ligne reconnue.", confidence: 84.2, error: null },
    { page: 4, text: "Deuxième ligne.", confidence: 78.8, error: null },
  ];
  it("encadre le bloc avec des marqueurs explicites + règle données", () => {
    const block = buildOcrBlock(ok, { lang: "fra" });
    expect(block).toContain("=== TEXTE OCR — RECONNAISSANCE AUTOMATIQUE (relecture requise) ===");
    expect(block).toContain("=== FIN TEXTE OCR ===");
    expect(block).toContain("DONNÉES");
    expect(block).toContain("Langue : fra");
    expect(block).toContain("Confiance moyenne : 82 %"); // (84.2+78.8)/2 = 81.5 → 82
    expect(block).toContain("Pages OCR : 3–4");
  });
  it("étiquette chaque page avec sa confiance, et les échecs honnêtement", () => {
    const block = buildOcrBlock(
      [...ok, { page: 5, text: "", confidence: null, error: "aucune image exploitable sur cette page" }],
      { lang: "eng" }
    );
    expect(block).toContain("[OCR · page 3 · confiance 84 %]");
    expect(block).toContain("[OCR · page 5 — aucune image exploitable sur cette page]");
    expect(block).toContain("Première ligne reconnue.");
  });
  it("confiance non calculable si aucun succès", () => {
    const block = buildOcrBlock(
      [{ page: 1, text: "", confidence: null, error: "aucun texte reconnu" }],
      { lang: "ara" }
    );
    expect(block).toContain("Confiance moyenne : non calculable");
  });
});

// ── mergeOcrIntoText (idempotent, texte natif intact CA-1.2) ─────────────
describe("mergeOcrIntoText", () => {
  const block1 = buildOcrBlock([{ page: 2, text: "Version un.", confidence: 80, error: null }], { lang: "fra" });
  const block2 = buildOcrBlock([{ page: 2, text: "Version deux.", confidence: 90, error: null }], { lang: "fra" });

  it("ajoute le bloc à la fin sans toucher au texte natif", () => {
    const merged = mergeOcrIntoText("Texte natif du document.", block1);
    expect(merged.startsWith("Texte natif du document.")).toBe(true);
    expect(merged).toContain("Version un.");
  });
  it("est IDEMPOTENT : un second run remplace l'ancien bloc (aucun doublon)", () => {
    const once = mergeOcrIntoText("Texte natif.", block1);
    const twice = mergeOcrIntoText(once, block2);
    expect(twice).toContain("Version deux.");
    expect(twice).not.toContain("Version un.");
    expect((twice.match(/=== TEXTE OCR/g) ?? []).length).toBe(1);
    expect(twice.startsWith("Texte natif.")).toBe(true);
  });
  it("gère un texte natif vide", () => {
    const merged = mergeOcrIntoText("", block1);
    expect(merged).toContain("Version un.");
  });
  it("hasOcrBlock détecte un bloc existant", () => {
    expect(hasOcrBlock(mergeOcrIntoText("abc", block1))).toBe(true);
    expect(hasOcrBlock("Texte sans OCR")).toBe(false);
  });
});

// ── mergeOcrIntoLimits (l'entrée scanned devient ocr — CA-1.3) ───────────
describe("mergeOcrIntoLimits", () => {
  const scannedLimits = [
    {
      kind: "scanned",
      detail: "PDF probablement scanné : 2 page(s) sans texte extractible (pages 1, 2).",
    },
    { kind: "no-biblio", detail: "Aucune bibliographie repérée en fin de document." },
  ];
  it("remplace l'entrée scanned par une entrée ocr avec pages résolues/restantes", () => {
    const out = mergeOcrIntoLimits(scannedLimits as never, {
      lang: "fra",
      pagesProcessed: 2,
      pagesNoImage: 0,
      pagesNoText: 0,
      remaining: [],
      overLimit: 0,
      avgConfidence: 81.4,
    });
    expect(out.find((l) => l.kind === "scanned")).toBeUndefined();
    const ocr = out.find((l) => l.kind === "ocr");
    expect(ocr).toBeDefined();
    expect(ocr?.detail).toContain("2 page(s) traitée(s) par OCR (langue fra)");
    expect(ocr?.detail).toContain("confiance moyenne 81 %");
    expect(ocr?.detail).toContain("relecture humaine requise");
    expect(out.find((l) => l.kind === "no-biblio")).toBeDefined(); // les autres limites intactes
  });
  it("consigne honnêtement les pages sans image / hors plafond", () => {
    const out = mergeOcrIntoLimits(scannedLimits as never, {
      lang: "ara",
      pagesProcessed: 4,
      pagesNoImage: 1,
      pagesNoText: 0,
      remaining: [31, 32],
      overLimit: 2,
      avgConfidence: null,
    });
    const ocr = out.find((l) => l.kind === "ocr");
    expect(ocr?.detail).toContain("1 sans image exploitable");
    expect(ocr?.detail).toContain("2 page(s) hors plafond");
    expect(ocr?.detail).not.toContain("confiance moyenne");
  });
});

// ── garde-fous langue ────────────────────────────────────────────────────
describe("langues OCR", () => {
  it("fra/eng/ara uniquement (embarquées localement — CA-1.6)", () => {
    expect(OCR_LANGS).toEqual(["fra", "eng", "ara"]);
    expect(isOcrLang("fra")).toBe(true);
    expect(isOcrLang("deu")).toBe(false);
    expect(isOcrLang(42)).toBe(false);
  });
});

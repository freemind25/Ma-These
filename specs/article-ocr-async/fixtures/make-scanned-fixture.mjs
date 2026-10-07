// ═══════════════════════════════════════════════════════════════
// Générateur de fixture « PDF scanné » — banc d'essai OCR
// (specs/article-ocr-async — plan.md § Stratégie de vérification)
//
// Produit scan-fixture.pdf : une page A4 (612×792 pt) dont le contenu
// est une UNIQUE image pleine page (DeviceRGB, FlateDecode) portant
// le texte "OCR TEST 1234" — aucun texte vectoriel : la page est
// donc « scannée » au sens de detectScannedPages (< 10 car.).
//
// Auto-vérification (aucune confiance accordée au générateur) :
//   1. unpdf extractText → 0 page avec ≥ 10 caractères
//   2. unpdf extractImages page 1 → 1 image, dimensions attendues
//
// Usage : bun specs/article-ocr-async/fixtures/make-scanned-fixture.mjs
// ═══════════════════════════════════════════════════════════════

import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

// ── Police bitmap 5×7 (glyphes nécessaires au texte de test) ──────
const FONT = {
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  3: [".###.", "#...#", "....#", "..##.", "....#", "#...#", ".###."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

const TEXT = "OCR TEST 1234";
const SCALE = 8; // glyphe 5×7 → 40×56 px
const W = 1275; // A4 @150 dpi
const H = 1650;

function rasterize() {
  const px = Buffer.alloc(W * H * 3, 255); // fond blanc (DeviceRGB)
  const glyphW = 6 * SCALE; // 5 colonnes + 1 espace inter-glyphe
  const totalW = TEXT.length * glyphW;
  let x0 = Math.floor((W - totalW) / 2);
  const y0 = Math.floor((H - 7 * SCALE) / 2);
  for (const ch of TEXT) {
    const g = FONT[ch];
    if (g) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (g[r][c] !== "#") continue;
          for (let dy = 0; dy < SCALE; dy++) {
            for (let dx = 0; dx < SCALE; dx++) {
              const px_ = x0 + c * SCALE + dx;
              const py = y0 + r * SCALE + dy;
              const i = (W * py + px_) * 3;
              px[i] = px[i + 1] = px[i + 2] = 0;
            }
          }
        }
      }
    }
    x0 += glyphW;
  }
  return px;
}

// ── PDF minimaliste (image XObject FlateDecode, xref exact) ───────
function buildPdf(rawRgb) {
  const image = zlib.deflateSync(rawRgb, { level: 9 });
  const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q\n", "latin1");

  const objects = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"), // 1
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"), // 2
    Buffer.from(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " +
        "/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"
    ), // 3
    Buffer.concat([
      Buffer.from(
        `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${image.length} >>\nstream\n`
      ),
      image,
      Buffer.from("\nendstream"),
    ]), // 4
    Buffer.concat([
      Buffer.from(`<< /Length ${content.length} >>\nstream\n`),
      content,
      Buffer.from("\nendstream"),
    ]), // 5
  ];

  const chunks = [Buffer.from("%PDF-1.4\n")];
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(Buffer.concat(chunks)));
    chunks.push(Buffer.from(`${i + 1} 0 obj\n`), body, Buffer.from("\nendobj\n"));
  });
  const xrefStart = Buffer.byteLength(Buffer.concat(chunks));
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  chunks.push(
    Buffer.from(
      xref +
        `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
    )
  );
  return Buffer.concat(chunks);
}

// ── Génération + auto-vérification unpdf ──────────────────────────
const outPath = path.join(import.meta.dirname, "scan-fixture.pdf");
const pdf = buildPdf(rasterize());
fs.writeFileSync(outPath, pdf);
console.log(`PDF écrit : ${outPath} (${pdf.length} octets)`);

const { extractText, extractImages, getDocumentProxy } = await import("unpdf");
const proxy = await getDocumentProxy(new Uint8Array(pdf));
const { text } = await extractText(proxy, { mergePages: false });
const pages = Array.isArray(text) ? text : [String(text)];
const empty = pages.map((p) => p.trim().length < 10);
const imgs = await extractImages(proxy, 1);

const checks = {
  pages: pages.length,
  pagesSansTexte: empty.every(Boolean),
  imagesPage1: imgs.length,
  dims: imgs.length ? { w: imgs[0].width, h: imgs[0].height, ch: imgs[0].channels } : null,
};
console.log("Auto-vérification :", JSON.stringify(checks));
if (!checks.pagesSansTexte || checks.imagesPage1 !== 1) {
  console.error("ÉCHEC — fixture non conforme");
  process.exit(1);
}
console.log("Fixture CONFORME (page scannée : sans texte, 1 image pleine page)");

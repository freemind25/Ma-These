import { PDFDocument } from "pdf-lib";
import { PNG } from "pngjs";
import { writeFileSync } from "fs";

// PNG bruité (incompressible) — base ~8,4 Mo ; N embeds DISTINCTS => PDF ~ N × 8,4 Mo
function noisePng(w, h) {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < png.data.length; i++) png.data[i] = Math.floor(Math.random() * 256);
  return PNG.sync.write(png);
}

async function make(png, nEmbeds, out) {
  const doc = await PDFDocument.create();
  const imgs = [];
  for (let k = 0; k < nEmbeds; k++) imgs.push(await doc.embedPng(png)); // N objets image distincts
  for (let k = 0; k < nEmbeds; k++) {
    const page = doc.addPage([2000, 1400]);
    page.drawImage(imgs[k], { x: 0, y: 0, width: 2000, height: 1400 });
  }
  const bytes = await doc.save();
  writeFileSync(out, bytes);
  console.log(out, "→", (bytes.length / 1048576).toFixed(2), "Mo,", nEmbeds, "pages");
}

const png = noisePng(2000, 1400);
console.log("png base:", (png.length / 1048576).toFixed(2), "Mo");
await make(png, 2, "/tmp/big-21.pdf"); // ~21 Mo : > 10 Mo transport, ≤ 50 Mo applicatif (CA-1)
await make(png, 5, "/tmp/big-53.pdf"); // ~53 Mo : > 50 Mo applicatif, < 64 Mo transport (CA-2, refus lisible)
await make(png, 7, "/tmp/big-75.pdf"); // ~75 Mo : > 64 Mo transport (cas pathologique, documenté)

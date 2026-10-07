import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { bitmapToPng, resolveTessdataPath } from "./ocr-engine";

// ── resolveTessdataPath (CA-1.6 : données de langue embarquées localement) ─
describe("resolveTessdataPath", () => {
  it("résout vendor/tessdata avec les 3 langues embarquées (fra/eng/ara)", () => {
    const dir = resolveTessdataPath();
    expect(fs.existsSync(path.join(dir, "fra.traineddata.gz"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "eng.traineddata.gz"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "ara.traineddata.gz"))).toBe(true);
  });
  it("respecte la surcharge TESSDATA_PATH", () => {
    const prev = process.env.TESSDATA_PATH;
    process.env.TESSDATA_PATH = path.resolve("vendor/tessdata");
    try {
      expect(resolveTessdataPath()).toBe(path.resolve("vendor/tessdata"));
    } finally {
      if (prev === undefined) delete process.env.TESSDATA_PATH;
      else process.env.TESSDATA_PATH = prev;
    }
  });
});

// ── bitmapToPng : bitmap décodé (extractImages) → PNG encodable/relisible ─
describe("bitmapToPng", () => {
  it("encode un bitmap RGB en PNG relisible (dimensions + pixels)", async () => {
    const { PNG } = await import("pngjs");
    const w = 64;
    const h = 32;
    const data = new Uint8ClampedArray(w * h * 3);
    // fond blanc, carré noir central
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = x > 24 && x < 40 && y > 8 && y < 24 ? 0 : 255;
        const i = (w * y + x) * 3;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
    }
    const png = await bitmapToPng({ data, width: w, height: h, channels: 3 });
    expect(png.slice(1, 4).toString("latin1")).toBe("PNG");

    const back = PNG.sync.read(png);
    expect(back.width).toBe(w);
    expect(back.height).toBe(h);
    // pixel blanc (coin) et pixel noir (centre) vérifiés après aller-retour
    const corner = (w * 0 + 0) << 2;
    const center = (w * 16 + 32) << 2;
    expect(back.data[corner]).toBe(255);
    expect(back.data[center]).toBe(0);
  });

  it("réduit les images géantes (plafond pixels — garde mémoire OOM)", async () => {
    const { PNG } = await import("pngjs");
    // 4960×7016 serait 34,8 Mpx — on teste avec un multiple réduit mais > cible :
    // 3200×3400 = 10,88 Mpx > 9 Mpx → facteur 2 → 1600×1700
    const w = 3200;
    const h = 3400;
    const png = await bitmapToPng({
      data: new Uint8ClampedArray(w * h * 3).fill(200),
      width: w,
      height: h,
      channels: 3,
    });
    const back = PNG.sync.read(png);
    expect(back.width).toBeLessThan(w);
    expect(back.width).toBeGreaterThanOrEqual(Math.floor(w / 2));
  });

  it("convertit un masque 1 canal (JBIG2/CCITT) en PNG RGBA lisible", async () => {
    const { PNG } = await import("pngjs");
    const png = await bitmapToPng({
      data: new Uint8Array([0, 255, 255, 0]),
      width: 2,
      height: 2,
      channels: 1,
    });
    const back = PNG.sync.read(png);
    expect(back.width).toBe(2);
    expect(back.height).toBe(2);
  });
});

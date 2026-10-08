// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Banc de mesure RSS par page pendant un job OCR
// (cycle specs/ocr-rss-purge — T1, CA-1)
//
// Usage :
//   node specs/ocr-rss-purge/banc/echantillonneur.mjs \
//        --pid <pid next-server> --csv <fichier.csv> \
//        [--job-id <id du job>] [--max-min 25]
//
// Principe : le handler `article-import-ocr` écrit `progressNote`
// (« Page i/total … ») en base à CHAQUE page (CA-1.1) — l'échantillonnage
// externe (1 s) aligne donc la courbe RSS sur l'avancement du job, sans
// aucune instrumentation du code applicatif (zéro diff pendant T1/T2).
//
// IMPORTANT : passer --job-id — sans filtre, l'échantillonneur peut lire un
// ancien job « done » et s'arrêter prématurément (leçon du 2026-10-08 : la
// base contient l'historique des recettes précédentes).
//
// Sortie CSV : horodatage;status;progress;page;rss_kB
// Arrêt : job terminé (done/failed) puis 30 s d'échantillonnage « après ».
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

// ── Arguments ──────────────────────────────────────────────────
function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const PID = Number(arg("pid", 0));
const CSV = path.resolve(arg("csv", "banc-rss.csv"));
const JOB_ID = arg("job-id", null);
const MAX_MS = Number(arg("max-min", 25)) * 60_000;

if (!PID || !fs.existsSync(`/proc/${PID}/status`)) {
  console.error(`PID invalide ou introuvable : ${PID}`);
  process.exit(1);
}

function readRssKb() {
  try {
    const status = fs.readFileSync(`/proc/${PID}/status`, "utf8");
    const m = status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
    return m ? Number(m[1]) : null;
  } catch {
    return null; // processus disparu (OOM kill ?) — consigné comme trou
  }
}

function extractPage(note) {
  if (!note) return "";
  const m = note.match(/Page (\d+)\/(\d+)/);
  return m ? `${m[1]}/${m[2]}` : "";
}

const db = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const POST_DONE_MS = 30_000; // échantillonnage après fin de job
let finished = false;
let finishedAt = 0;

console.log(`Échantillonnage RSS du PID ${PID} → ${CSV}`);
const t0 = Date.now();
let lastRss = null;
let maxRss = 0;
let firstRss = null;

while (Date.now() - t0 < MAX_MS) {
  const rss = readRssKb();
  let status = "job-absent";
  let progress = "";
  let note = "";
  let page = "";
  if (rss !== null) {
    if (firstRss === null) firstRss = rss;
    lastRss = rss;
    if (rss > maxRss) maxRss = rss;
  }
  try {
    const job = await db.job.findFirst({
      where: JOB_ID ? { id: JOB_ID } : { type: "article-import-ocr" },
      orderBy: { createdAt: "desc" },
      select: { status: true, progress: true, progressNote: true },
    });
    if (job) {
      status = job.status;
      progress = job.progress ?? "";
      note = (job.progressNote ?? "").replaceAll(";", ",");
      page = extractPage(note);
    }
  } catch {
    /* lecture DB tolérée à l'échec — ligne suivante */
  }
  const ts = new Date().toISOString();
  fs.appendFileSync(CSV, `${ts};${status};${progress};${page};${rss ?? "GONE"}\n`);
  if (rss === null) {
    console.warn(`${ts} — processus ${PID} disparu (kill OOM ?) — arrêt du banc.`);
    break;
  }
  if (!finished && (status === "done" || status === "failed")) {
    finished = true;
    finishedAt = Date.now();
    console.log(`${ts} — job ${status}, poursuite de l'échantillonnage ${POST_DONE_MS / 1000} s…`);
  }
  if (finished && Date.now() - finishedAt >= POST_DONE_MS) break;
  await sleep(1000);
}

await db.$disconnect();

// ── Résumé console ─────────────────────────────────────────────
const fmt = (kb) => (kb / 1024 / 1024).toFixed(2) + " Go";
console.log("─".repeat(60));
console.log(`RSS départ    : ${firstRss ? fmt(firstRss) : "?"}`);
console.log(`RSS fin       : ${lastRss ? fmt(lastRss) : "?"}`);
console.log(`RSS max       : ${maxRss ? fmt(maxRss) : "?"}`);
console.log(
  `Croissance    : ${firstRss && lastRss ? fmt(lastRss - firstRss) : "?"} (fin − départ)`
);
console.log(`CSV           : ${CSV}`);

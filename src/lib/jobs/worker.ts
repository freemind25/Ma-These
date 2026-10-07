// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Worker de la file de tâches (A.8)
// Démarré par src/instrumentation.ts au lancement du serveur Node.
// Boucle : récupération des jobs orphelins → revendication du plus
// ancien job "pending" → exécution par le handler enregistré →
// done/failed persistés. Toutes les opérations longues doivent
// passer par cette file au lieu de nohup.
// ═══════════════════════════════════════════════════════════════

import { db } from "@/lib/db";
import {
  claimNextJob,
  completeJob,
  enqueueJob,
  failJob,
  requeueStaleJobs,
} from "@/lib/jobs/queue";
import { runDeepResearch } from "@/lib/research/deep-research-pipeline";
import {
  AUTO_CHECK_INTERVAL_MS,
  isDueForAutoCheck,
} from "@/lib/veille/check-core";
import { runCheckForSavedSearch } from "@/lib/veille/run-check";
import { detectScannedPages } from "@/lib/articles/extraction";
import {
  buildOcrBlock,
  isOcrLang,
  mergeOcrIntoLimits,
  mergeOcrIntoText,
  pickMainImage,
  planOcrPages,
  resolveOcrMaxPages,
  type OcrPageResult,
} from "@/lib/articles/ocr";

/** Registre des handlers — tout type de job long doit s'y enregistrer. */
type JobHandler = (
  payload: Record<string, unknown>,
  job: { id: string }
) => Promise<unknown>;

const HANDLERS: Record<string, JobHandler> = {
  // Job technique minimal (preuves de bout en bout de la file)
  noop: async (payload) => ({ ok: true, echo: payload }),

  // Recherche approfondie longue — exécutable hors requête HTTP
  "deep-research": async (payload) => {
    const prompt = String(payload.prompt ?? "");
    if (prompt.length < 10) throw new Error("prompt manquant (min 10 caractères)");
    const result = await runDeepResearch({
      prompt,
      context: typeof payload.context === "string" ? payload.context : undefined,
      sourceMode: payload.sourceMode === "academic" ? "academic" : "web",
      // Worker sans requête HTTP : configuration IA par défaut de l'instance
      providerConfig: undefined,
    });
    return result;
  },

  // Vérification automatique d'une veille (specs/veille-check-auto T4) —
  // même séquence que le check manuel (run-check) ; VeilleNotFoundError /
  // SourceFetchError sont enregistrées comme échecs de job (CA-2.3).
  "veille-check": async (payload) => {
    const savedSearchId = String(payload.savedSearchId ?? "");
    if (!savedSearchId) throw new Error("savedSearchId manquant");
    return runCheckForSavedSearch(savedSearchId, VEILLE_CHECK_ORIGIN);
  },

  // OCR des pages scannées d'un PDF importé (specs/article-ocr-async) —
  // séquentiel strict : 1 page à la fois, moteur terminé entre chaque page
  // (CA-1.5), progression écrite dans le job (CA-1.1), bloc marqué fusionné
  // au texte sans écraser le natif (CA-1.2), limites mises à jour (CA-1.3).
  "article-import-ocr": async (payload, job) => {
    const importedDocId = String(payload.importedDocId ?? "");
    if (!importedDocId) throw new Error("importedDocId manquant");
    const lang = isOcrLang(payload.lang) ? payload.lang : "fra";
    const maxPages = resolveOcrMaxPages(
      typeof payload.maxPages === "number" ? payload.maxPages : (process.env.OCR_MAX_PAGES ?? null)
    );

    const doc = await db.importedDoc.findUnique({ where: { id: importedDocId } });
    if (!doc) throw new Error("Document importé introuvable — il a peut-être été supprimé.");
    if (doc.fileType !== "pdf")
      throw new Error("L'OCR ne s'applique qu'aux documents PDF.");
    if (!doc.data)
      throw new Error(
        "Octets du PDF non conservés pour ce document (import antérieur à l'OCR) — réimportez le PDF puis relancez l'OCR."
      );

    // Pages réellement sans texte, recalculées depuis le fichier conservé
    const { extractPdf } = await import("@/lib/articles/extraction");
    const { pages } = await extractPdf(Buffer.from(doc.data));
    const { emptyPages } = detectScannedPages(pages);
    if (emptyPages.length === 0)
      throw new Error(
        "Aucune page scannée détectée — le texte est déjà extractible, l'OCR est inutile."
      );
    const plan = planOcrPages(emptyPages, maxPages);

    const { getDocumentProxy, extractImages } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(Buffer.from(doc.data)));
    const { bitmapToPng, ocrPage } = await import("@/lib/articles/ocr-engine");

    const results: OcrPageResult[] = [];
    const total = plan.pagesToOcr.length;
    for (let i = 0; i < total; i++) {
      const pageNo = plan.pagesToOcr[i];
      await db.job.update({
        where: { id: job.id },
        data: {
          progress: Math.round((i / total) * 100),
          progressNote: `Page ${i + 1}/${total} (page PDF ${pageNo}) en cours…`,
        },
      });
      try {
        const images = await extractImages(pdf, pageNo);
        const main = pickMainImage(
          images.map((img) => ({
            data: img.data,
            width: img.width,
            height: img.height,
            channels: img.channels,
          }))
        );
        if (!main) {
          results.push({
            page: pageNo,
            text: "",
            confidence: null,
            error: "aucune image exploitable sur cette page",
          });
          continue;
        }
        const png = await bitmapToPng(main);
        const ocr = await ocrPage(png, lang);
        results.push({
          page: pageNo,
          text: ocr.text,
          confidence: ocr.confidence,
          error: ocr.text.length === 0 ? "aucun texte reconnu" : null,
        });
      } catch (e) {
        // Honnêteté par page : l'échec d'une page n'annule pas les autres
        results.push({
          page: pageNo,
          text: "",
          confidence: null,
          error: e instanceof Error ? e.message.slice(0, 200) : "erreur inconnue",
        });
      }
    }

    const succeeded = results.filter((r) => r.error === null);
    if (total > 0 && succeeded.length === 0) {
      throw new Error(
        `OCR échoué sur toutes les pages (${total}) — premier motif : ${results[0]?.error ?? "inconnu"}`
      );
    }

    const avgConfidence =
      succeeded.length > 0
        ? succeeded.reduce((s, r) => s + (r.confidence ?? 0), 0) / succeeded.length
        : null;
    const block = buildOcrBlock(results, { lang });
    const newText = mergeOcrIntoText(doc.text, block);
    const limits = mergeOcrIntoLimits(parseLimitsSafe(doc.limits), {
      lang,
      pagesProcessed: results.length,
      pagesNoImage: results.filter((r) => r.error === "aucune image exploitable sur cette page").length,
      pagesNoText: results.filter((r) => r.error === "aucun texte reconnu").length,
      remaining: plan.remaining,
      overLimit: plan.remaining.length,
      avgConfidence,
    });
    await db.importedDoc.update({
      where: { id: importedDocId },
      data: { text: newText, limits: JSON.stringify(limits) },
    });

    // Clôture de la progression (CA-1.1) — le completeJob du worker ne
    // connaît pas la sémantique OCR de ces colonnes
    await db.job.update({
      where: { id: job.id },
      data: {
        progress: 100,
        progressNote: `Terminé — ${results.length} page(s) OCR (${lang}), confiance moyenne ${
          avgConfidence !== null ? `${Math.round(avgConfidence)} %` : "non calculable"
        }`,
      },
    });

    return {
      lang,
      pagesProcessed: results.length,
      pagesWithText: succeeded.filter((r) => r.text.length > 0).length,
      pagesFailed: results.filter((r) => r.error !== null).map((r) => r.page),
      remainingPages: plan.remaining.length,
      avgConfidence: avgConfidence !== null ? Math.round(avgConfidence) : null,
      textLength: newText.length,
    };
  },
};

function parseLimitsSafe(limitsJson: string): { kind: string; detail: string }[] {
  try {
    const parsed = JSON.parse(limitsJson || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRegisteredJobTypes(): string[] {
  return Object.keys(HANDLERS);
}

const POLL_INTERVAL_MS = 3_000;
const STALE_SWEEP_EVERY_MS = 60_000;
const VEILLE_SWEEP_EVERY_MS = 60_000; // specs/veille-check-auto — balayage de planification

/** Origine interne pour les auto-fetch du worker (aucune requête HTTP entrante ici). */
const VEILLE_CHECK_ORIGIN = `http://127.0.0.1:${process.env.PORT ?? 3000}`;

interface WorkerState {
  started: boolean;
  timer: NodeJS.Timeout | null;
  lastSweep: number;
  lastVeilleSweep: number;
}

// Cache global — survit aux recompilations HMR du module
const globalForWorker = globalThis as unknown as {
  __tfJobWorker?: WorkerState;
};

/**
 * Balayage de planification des vérifications automatiques (specs/veille-check-auto T4).
 * Chaque veille `autoCheck=true` échue reçoit AU PLUS UN job "veille-check" en
 * attente/en cours (garde anti-empilement CA-2.2) — le handler exécute exactement
 * la même séquence que le check manuel (CA-2.1).
 */
async function sweepDueVeilleChecks(): Promise<void> {
  const now = new Date();
  const candidates = await db.savedSearch.findMany({
    where: { autoCheck: true },
    select: { id: true, lastCheckedAt: true },
  });
  for (const veille of candidates) {
    if (!isDueForAutoCheck(true, veille.lastCheckedAt, now, AUTO_CHECK_INTERVAL_MS)) {
      continue;
    }
    // Anti-empilement : un job pending/running pour cette veille suffit.
    const inFlight = await db.job.findFirst({
      where: {
        type: "veille-check",
        status: { in: ["pending", "running"] },
        payload: { contains: veille.id },
      },
      select: { id: true },
    });
    if (inFlight) continue;
    await enqueueJob("veille-check", { savedSearchId: veille.id });
    console.warn(`[job-worker] Vérification automatique programmée pour la veille ${veille.id}`);
  }
}

async function processOneJob(): Promise<boolean> {
  const job = await claimNextJob();
  if (!job) return false;

  const handler = HANDLERS[job.type];
  if (!handler) {
    await failJob(job.id, `Type de job inconnu : ${job.type}`);
    return true;
  }

  console.warn(`[job-worker] Exécution du job ${job.id} (${job.type})`);
  try {
    const payload = JSON.parse(job.payload || "{}") as Record<string, unknown>;
    const result = await handler(payload, { id: job.id });
    await completeJob(job.id, result);
    console.warn(`[job-worker] Job ${job.id} (${job.type}) terminé`);
  } catch (error) {
    await failJob(job.id, error);
    console.error(`[job-worker] Job ${job.id} (${job.type}) échoué :`, error);
  }
  return true;
}

export function startJobWorker(): void {
  const state: WorkerState = (globalForWorker.__tfJobWorker ??= {
    started: false,
    timer: null,
    lastSweep: 0,
    lastVeilleSweep: 0,
  });
  if (state.started) return;
  state.started = true;

  console.warn("[job-worker] Démarrage — file de tâches persistante (A.8)");

  // Reprise des jobs orphelins dès le démarrage (crash / redémarrage)
  requeueStaleJobs()
    .then((n) => {
      if (n > 0) console.warn(`[job-worker] ${n} job(s) orphelin(s) requalifié(s) en attente`);
    })
    .catch(() => undefined);

  const tick = async () => {
    try {
      const now = Date.now();
      if (now - state.lastSweep > STALE_SWEEP_EVERY_MS) {
        state.lastSweep = now;
        const n = await requeueStaleJobs();
        if (n > 0) console.warn(`[job-worker] ${n} job(s) orphelin(s) requalifié(s) en attente`);
      }
      if (now - state.lastVeilleSweep > VEILLE_SWEEP_EVERY_MS) {
        state.lastVeilleSweep = now;
        await sweepDueVeilleChecks();
      }
      // Traite au plus un job par tick — la boucle suivante enchaîne s'il y en a d'autres
      await processOneJob();
    } catch (error) {
      console.error("[job-worker] Erreur de boucle :", error);
    }
  };

  state.timer = setInterval(tick, POLL_INTERVAL_MS);
  // Ne bloque pas l'arrêt propre du processus
  if (typeof state.timer.unref === "function") state.timer.unref();
}

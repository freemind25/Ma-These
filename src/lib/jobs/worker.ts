// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Worker de la file de tâches (A.8)
// Démarré par src/instrumentation.ts au lancement du serveur Node.
// Boucle : récupération des jobs orphelins → revendication du plus
// ancien job "pending" → exécution par le handler enregistré →
// done/failed persistés. Toutes les opérations longues doivent
// passer par cette file au lieu de nohup.
// ═══════════════════════════════════════════════════════════════

import {
  claimNextJob,
  completeJob,
  failJob,
  requeueStaleJobs,
} from "@/lib/jobs/queue";
import { runDeepResearch } from "@/lib/research/deep-research-pipeline";

/** Registre des handlers — tout type de job long doit s'y enregistrer. */
type JobHandler = (payload: Record<string, unknown>) => Promise<unknown>;

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
};

export function getRegisteredJobTypes(): string[] {
  return Object.keys(HANDLERS);
}

const POLL_INTERVAL_MS = 3_000;
const STALE_SWEEP_EVERY_MS = 60_000;

interface WorkerState {
  started: boolean;
  timer: NodeJS.Timeout | null;
  lastSweep: number;
}

// Cache global — survit aux recompilations HMR du module
const globalForWorker = globalThis as unknown as {
  __tfJobWorker?: WorkerState;
};

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
    const result = await handler(payload);
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

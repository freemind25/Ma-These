// ═══════════════════════════════════════════════════════════════
// Instrumentation Next.js — démarrage du worker de la file de
// tâches persistante (A.8, annexe technique) au boot du serveur.
// Le worker reprend les jobs "pending" et récupère les jobs
// "running" orphelins après un redémarrage.
// ═══════════════════════════════════════════════════════════════

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startJobWorker } = await import("@/lib/jobs/worker");
    startJobWorker();
  }
}

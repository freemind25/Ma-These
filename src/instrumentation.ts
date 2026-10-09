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
    // C-1 / AUD-GOV-001 : sauvegarde quotidienne de la base
    // (VACUUM INTO, rotation 7 j, non bloquant — cf. src/lib/backup.ts)
    const { startDailyBackup } = await import("@/lib/backup");
    startDailyBackup();
  }
}

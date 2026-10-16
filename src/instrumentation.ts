// ═══════════════════════════════════════════════════════════════
// Instrumentation Next.js — démarrage du worker de la file de
// tâches persistante (A.8, annexe technique) au boot du serveur.
// Le worker reprend les jobs "pending" et récupère les jobs
// "running" orphelins après un redémarrage.
// ═══════════════════════════════════════════════════════════════

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // C2-E3 : migration de schéma au boot, AVANT le worker — compare la base
    // utilisateur au template embarqué (TAURI_TEMPLATE_DB) et applique le diff
    // en DDL idempotents après sauvegarde (non destructif). Sans cela, une
    // base d'une version antérieure n'était jamais migrée → P2021/P2022.
    try {
      const { ensureSchemaUpToDate } = await import("@/lib/db/schema-migrate");
      await ensureSchemaUpToDate();
    } catch (e) {
      console.error("[instrumentation] C2-E3: migration de schéma échouée:", e);
    }
    const { startJobWorker } = await import("@/lib/jobs/worker");
    startJobWorker();
    // C-1 / AUD-GOV-001 : sauvegarde quotidienne de la base
    // (VACUUM INTO, rotation 7 j, non bloquant — cf. src/lib/backup.ts)
    const { startDailyBackup } = await import("@/lib/backup");
    startDailyBackup();
  }
}

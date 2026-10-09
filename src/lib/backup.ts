// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Sauvegarde quotidienne de la base (C-1 / AUD-GOV-001)
// Cycle : audit-remediation-p1 · Roadmap baseline audit v1.0 §10
//
// - Snapshot cohérent à chaud via SQLite `VACUUM INTO` (ne bloque
//   pas le serveur, ne modifie pas la base live, compacté).
// - 1 sauvegarde/jour au boot du serveur + re-vérification toutes
//   les 6 h (serveur de longue durée à cheval sur minuit).
// - Rotation 7 jours (fichiers custom-YYYY-MM-DD.db).
// - Miroir optionnel hors arbre git (TF_BACKUP_MIRROR_DIR).
// - Jamais bloquant pour le démarrage : erreurs journalisées only.
// ═══════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

const RETENTION_DAYS = 7;
const RECHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 h

export function backupDir(): string {
  return process.env.TF_BACKUP_DIR || path.join(process.cwd(), "backups");
}

async function ensureDailyBackup(): Promise<string | null> {
  const dir = backupDir();
  fs.mkdirSync(dir, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const dest = path.join(dir, `custom-${today}.db`);
  if (fs.existsSync(dest)) return null; // déjà faite aujourd'hui

  // VACUUM INTO exige que la cible N'EXISTE PAS → fichier temporaire
  // puis rename atomique.
  const tmp = `${dest}.tmp-${process.pid}`;
  await db.$executeRawUnsafe(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
  fs.renameSync(tmp, dest);

  rotate(dir);
  mirror(dest);
  return dest;
}

function rotate(dir: string): void {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  for (const f of fs.readdirSync(dir)) {
    if (!/^custom-\d{4}-\d{2}-\d{2}\.db$/.test(f)) continue;
    const p = path.join(dir, f);
    try {
      if (fs.statSync(p).mtimeMs < cutoff) fs.unlinkSync(p);
    } catch {
      // fichier déjà parti — rotation best-effort
    }
  }
}

function mirror(file: string): void {
  const mirrorDir = process.env.TF_BACKUP_MIRROR_DIR;
  if (!mirrorDir) return;
  try {
    fs.mkdirSync(mirrorDir, { recursive: true });
    fs.copyFileSync(file, path.join(mirrorDir, path.basename(file)));
  } catch (e) {
    console.error("[backup] miroir impossible (non bloquant):", e);
  }
}

/** Démarrage anti-HMR (même pattern que le worker de jobs). */
export function startDailyBackup(): void {
  const g = globalThis as unknown as { __tfBackupStarted?: boolean };
  if (g.__tfBackupStarted) return;
  g.__tfBackupStarted = true;

  ensureDailyBackup()
    .then((f) => {
      if (f) console.log(`[backup] sauvegarde quotidienne créée : ${f}`);
      else console.log("[backup] sauvegarde du jour déjà présente");
    })
    .catch((e) =>
      console.error("[backup] échec initial (non bloquant):", e)
    );

  const timer = setInterval(() => {
    ensureDailyBackup()
      .then((f) => {
        if (f) console.log(`[backup] sauvegarde quotidienne créée : ${f}`);
      })
      .catch((e) =>
        console.error("[backup] échec périodique (non bloquant):", e)
      );
  }, RECHECK_INTERVAL_MS);
  timer.unref?.();
}

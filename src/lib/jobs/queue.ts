// ═══════════════════════════════════════════════════════════════
// ThesisFrame — File de tâches persistante (A.8, annexe technique)
// Les opérations longues étaient lancées ad hoc (nohup) et tuées
// entre les sessions. Correction à la racine : file persistante en
// base (modèle Job) — un job survit au processus qui l'a créé et le
// worker le reprend, y compris après redémarrage du serveur.
// ═══════════════════════════════════════════════════════════════

import { db } from "@/lib/db";

export type JobStatus = "pending" | "running" | "done" | "failed";

export interface JobRecord {
  id: string;
  type: string;
  status: JobStatus;
  payload: string;
  result: string | null;
  error: string | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
}

/**
 * Plafond de tentatives par job (audit C2 — écart « treadmill sans plafond »).
 * Chaque claimNextJob incrémente attempts ; au-delà de ce plafond, un job
 * orphelin n'est plus requalifié : il passe définitivement en échec.
 * Prévient la boucle infinie de requalification et la saturation mémoire
 * d'un job systématiquement bloqué.
 */
export const MAX_JOB_ATTEMPTS = 5;

/** Crée un job persistant — renvoie immédiatement, exécution par le worker. */
export async function enqueueJob(type: string, payload: unknown = {}): Promise<JobRecord> {
  const job = await db.job.create({
    data: {
      type,
      payload: JSON.stringify(payload ?? {}),
      status: "pending",
    },
  });
  return job as JobRecord;
}

/**
 * Réserve atomiquement le prochain job en attente.
 * Le `updateMany` conditionnel garantit qu'un seul worker s'approprie le job
 * (compteur conditionnel = verrou optimiste, sûr même en multi-instances).
 * La progression héritée d'une tentative précédente est réinitialisée au
 * claim (audit C2 — écart « observabilité ») : entre le claim et la première
 * mise à jour du handler, l'interface reflète un état neuf.
 */
export async function claimNextJob(): Promise<JobRecord | null> {
  const candidate = await db.job.findFirst({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!candidate) return null;

  const claimed = await db.job.updateMany({
    where: { id: candidate.id, status: "pending" },
    data: {
      status: "running",
      startedAt: new Date(),
      attempts: { increment: 1 },
      progress: 0,
      progressNote: null,
    },
  });
  if (claimed.count === 0) return null; // un autre worker l'a pris

  return (await db.job.findUnique({ where: { id: candidate.id } })) as JobRecord | null;
}

/** Termine un job avec succès. */
export async function completeJob(id: string, result: unknown): Promise<void> {
  await db.job.update({
    where: { id },
    data: {
      status: "done",
      result: JSON.stringify(result ?? null),
      finishedAt: new Date(),
    },
  });
}

/** Marque un job comme échoué. */
export async function failJob(id: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  await db.job.update({
    where: { id },
    data: {
      status: "failed",
      error: message.slice(0, 2_000),
      finishedAt: new Date(),
    },
  });
}

/**
 * Récupère les jobs orphelins : status "running" mais processus disparu
 * (crash / redémarrage). Appelé périodiquement par le worker — c'est ce qui
 * garantit la reprise après arrêt, propriété que nohup ne fournissait pas.
 *
 * Deux sorties (audit C2 — écarts « treadmill » et « observabilité ») :
 *  - attempts >= MAX_JOB_ATTEMPTS → échec définitif (failed), plus aucune
 *    requalification : le job ne peut plus boucler ni saturer la mémoire ;
 *  - attempts < MAX_JOB_ATTEMPTS → requalification (pending) avec
 *    réinitialisation de la progression : l'interface affiche un état
 *    « en attente de reprise », pas les informations résiduelles de la
 *    tentative abandonnée.
 */
export async function requeueStaleJobs(staleThresholdMs = 10 * 60 * 1_000): Promise<number> {
  const threshold = new Date(Date.now() - staleThresholdMs);

  // 1) Plafond atteint — échec définitif, plus aucune reprise automatique.
  const abandoned = await db.job.updateMany({
    where: {
      status: "running",
      startedAt: { lt: threshold },
      attempts: { gte: MAX_JOB_ATTEMPTS },
    },
    data: {
      status: "failed",
      error:
        `Interrompu en cours d'exécution lors de ${MAX_JOB_ATTEMPTS} tentatives successives ` +
        `(crash, arrêt ou blocage de l'application). Relancez la tâche manuellement.`,
      finishedAt: new Date(),
    },
  });

  // 2) Sous le plafond — requalification propre (anti-treadmill : attempts < MAX).
  const requeued = await db.job.updateMany({
    where: {
      status: "running",
      startedAt: { lt: threshold },
      attempts: { lt: MAX_JOB_ATTEMPTS },
    },
    data: {
      status: "pending",
      startedAt: null,
      progress: 0,
      progressNote: "En attente de reprise (tentative précédente interrompue)",
    },
  });

  return abandoned.count + requeued.count;
}

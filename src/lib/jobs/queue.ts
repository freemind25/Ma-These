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
 */
export async function requeueStaleJobs(staleThresholdMs = 10 * 60 * 1_000): Promise<number> {
  const threshold = new Date(Date.now() - staleThresholdMs);
  const result = await db.job.updateMany({
    where: {
      status: "running",
      startedAt: { lt: threshold },
    },
    data: { status: "pending", startedAt: null },
  });
  return result.count;
}

/**
 * concurrency.ts
 * ─────────────────────────────────────────────
 * Sémaphore et file d'attente pour limiter la concurrence des appels AI.
 * 
 * Usage :
 *   import { aiSemaphore, runWithConcurrencyLimit } from '@/lib/concurrency'
 *   const results = await runWithConcurrencyLimit(tasks, 2)
 */

// ─── Semaphore ──────────────────────────────────────────────────

export class Semaphore {
  private running = 0
  private queue: Array<() => void> = []

  constructor(private max: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.max) {
      this.running++
      return
    }
    return new Promise<void>(resolve => this.queue.push(resolve))
  }

  release(): void {
    this.running--
    const next = this.queue.shift()
    if (next) {
      this.running++
      next()
    }
  }
}

// ─── Global AI semaphore ────────────────────────────────────────
export const aiSemaphore = new Semaphore(2)

// ─── Helper: run a task under the semaphore ─────────────────────

export async function withAISemaphore<T>(fn: () => Promise<T>): Promise<T> {
  await aiSemaphore.acquire()
  try {
    return await fn()
  } finally {
    aiSemaphore.release()
  }
}

// ─── Helper: run multiple tasks with a concurrency limit ─────────

/**
 * Exécute un tableau de tâches async avec une limite de concurrence.
 * 
 * @param tasks    Fonctions async à exécuter
 * @param limit    Nombre max de tâches en parallèle (défaut : 2)
 * @returns        Tableau des résultats dans le même ordre que les tâches
 */
export async function runWithConcurrencyLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number = 2
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let nextIndex = 0

  const semaphore = new Semaphore(limit)

  async function worker(): Promise<void> {
    while (true) {
      const index = nextIndex++
      if (index >= tasks.length) break

      await semaphore.acquire()
      try {
        results[index] = await tasks[index]()
      } finally {
        semaphore.release()
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker()
  )

  await Promise.all(workers)
  return results
}

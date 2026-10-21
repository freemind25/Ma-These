import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────
// Convention du dépôt : @/lib/db est mocké (décision propriétaire 2026-10-14,
// src/lib/test-isolation.ts — aucun test n'écrit dans une base réelle).
vi.mock("@/lib/db", () => ({
  db: {
    job: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import {
  enqueueJob,
  claimNextJob,
  completeJob,
  failJob,
  requeueStaleJobs,
  MAX_JOB_ATTEMPTS,
} from "./queue";

const mockCreate = vi.mocked(db.job.create);
const mockFindFirst = vi.mocked(db.job.findFirst);
const mockFindUnique = vi.mocked(db.job.findUnique);
const mockUpdateMany = vi.mocked(db.job.updateMany);
const mockUpdate = vi.mocked(db.job.update);

/** Lecture typée-souple des arguments d'appel (signatures Prisma complexes). */
function callArgs<T>(fn: { mock: { calls: unknown[] } }, index = 0): T {
  return (fn.mock.calls[index] as unknown[] | undefined)?.[0] as T;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Plafond de tentatives (audit C2 — écart « treadmill sans plafond ») ──
describe("MAX_JOB_ATTEMPTS", () => {
  it("vaut 5 — plafond de reprises automatiques exigé par l'audit C2", () => {
    expect(MAX_JOB_ATTEMPTS).toBe(5);
  });
});

// ── claimNextJob ─────────────────────────────────────────────────────────
describe("claimNextJob", () => {
  it("incrémente attempts et réinitialise la progression héritée (audit C2 — écart « observabilité »)", async () => {
    mockFindFirst.mockResolvedValue({ id: "job-1" } as never);
    mockUpdateMany.mockResolvedValue({ count: 1 } as never);
    mockFindUnique.mockResolvedValue({ id: "job-1", status: "running", attempts: 3 } as never);

    const job = await claimNextJob();

    expect(job?.attempts).toBe(3);
    const args = callArgs<{ where: Record<string, unknown>; data: Record<string, unknown> }>(
      mockUpdateMany
    );
    expect(args.where).toEqual({ id: "job-1", status: "pending" });
    expect(args.data).toMatchObject({
      status: "running",
      attempts: { increment: 1 },
      progress: 0,
      progressNote: null,
    });
    expect(args.data.startedAt).toBeInstanceOf(Date);
  });

  it("renvoie null quand aucun job n'est en attente", async () => {
    mockFindFirst.mockResolvedValue(null as never);
    expect(await claimNextJob()).toBeNull();
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("renvoie null quand un autre worker a déjà pris le job (verrou optimiste)", async () => {
    mockFindFirst.mockResolvedValue({ id: "job-1" } as never);
    mockUpdateMany.mockResolvedValue({ count: 0 } as never);
    expect(await claimNextJob()).toBeNull();
  });
});

// ── requeueStaleJobs : deux voies selon le plafond (audit C2) ────────────
describe("requeueStaleJobs", () => {
  it("voie 1 — plafond atteint : échec définitif avec message lisible, plus aucune requalification", async () => {
    mockUpdateMany
      .mockResolvedValueOnce({ count: 1 } as never) // abandons (plafond)
      .mockResolvedValueOnce({ count: 0 } as never); // requalifications

    const total = await requeueStaleJobs();

    expect(total).toBe(1);
    const failCall = callArgs<{ where: Record<string, unknown>; data: Record<string, unknown> }>(
      mockUpdateMany,
      0
    );
    expect(failCall.where.status).toBe("running");
    expect(failCall.where.attempts).toEqual({ gte: MAX_JOB_ATTEMPTS });
    expect(failCall.data.status).toBe("failed");
    expect(failCall.data.error).toContain("tentatives");
    expect(failCall.data.finishedAt).toBeInstanceOf(Date);
    expect(mockUpdateMany).toHaveBeenCalledTimes(2);
  });

  it("voie 2 — sous le plafond : pending + progression réinitialisée + note « en attente de reprise »", async () => {
    mockUpdateMany
      .mockResolvedValueOnce({ count: 0 } as never)
      .mockResolvedValueOnce({ count: 2 } as never);

    const total = await requeueStaleJobs();

    expect(total).toBe(2);
    const requeueCall = callArgs<{ where: Record<string, unknown>; data: Record<string, unknown> }>(
      mockUpdateMany,
      1
    );
    expect(requeueCall.where.status).toBe("running");
    expect(requeueCall.where.attempts).toEqual({ lt: MAX_JOB_ATTEMPTS });
    expect(requeueCall.data.status).toBe("pending");
    expect(requeueCall.data.startedAt).toBeNull();
    expect(requeueCall.data.progress).toBe(0);
    expect(requeueCall.data.progressNote).toContain("En attente de reprise");
  });

  it("retourne la somme des deux voies (abandons + requalifications)", async () => {
    mockUpdateMany
      .mockResolvedValueOnce({ count: 3 } as never)
      .mockResolvedValueOnce({ count: 4 } as never);
    expect(await requeueStaleJobs()).toBe(7);
  });
});

// ── Non-régression des autres opérations de la queue ─────────────────────
describe("enqueueJob / completeJob / failJob", () => {
  it("enqueueJob — crée un job pending avec payload sérialisé", async () => {
    mockCreate.mockResolvedValue({ id: "job-new", status: "pending" } as never);
    const job = await enqueueJob("article-import-ocr", { importedDocId: "doc-1", lang: "fra" });
    expect(job.id).toBe("job-new");
    const args = callArgs<{ data: { type: string; payload: string; status: string } }>(mockCreate);
    expect(args.data.type).toBe("article-import-ocr");
    expect(args.data.status).toBe("pending");
    expect(JSON.parse(args.data.payload)).toEqual({ importedDocId: "doc-1", lang: "fra" });
  });

  it("completeJob — done + résultat sérialisé + finishedAt", async () => {
    await completeJob("job-1", { ok: true });
    const args = callArgs<{ where: { id: string }; data: Record<string, unknown> }>(mockUpdate);
    expect(args.where.id).toBe("job-1");
    expect(args.data.status).toBe("done");
    expect(args.data.result).toBe(JSON.stringify({ ok: true }));
    expect(args.data.finishedAt).toBeInstanceOf(Date);
  });

  it("failJob — failed + message tronqué à 2000 caractères + finishedAt", async () => {
    await failJob("job-1", new Error("x".repeat(3000)));
    const args = callArgs<{ where: { id: string }; data: { status: string; error: string } }>(
      mockUpdate
    );
    expect(args.data.status).toBe("failed");
    expect(args.data.error).toHaveLength(2_000);
  });
});

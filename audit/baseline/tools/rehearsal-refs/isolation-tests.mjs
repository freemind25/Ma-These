#!/usr/bin/env bun
/**
 * isolation-tests.mjs — Tests d'isolation 2 thèses sur la COPIE (répétition générale).
 *
 * Usage : DATABASE_URL="file:/tmp/rehearsal-refs/rehearsal.db" bun isolation-tests.mjs <export-before.json> <output-json>
 *
 * Prouve, via le client Prisma ad hoc (schéma amendé) :
 *   (a) une requête scopée thèse A (propriétaire) ne voit pas les références
 *       attribuées à la thèse B — et vice-versa (contrat futur GET ?thesisId=X) ;
 *   (b) les références globales (thesisId NULL) restent visibles des deux côtés ;
 *   (c) la suppression de la thèse de test B déclenche la CASCADE de ses
 *       références (et de ses chapitres) uniquement ;
 *   (d) les références du propriétaire restent strictement intactes
 *       (diff ligne à ligne vs export réversible : seul thesisId diffère).
 *   Bonus : simulation du contrat API 404 (édition/suppression cross-contexte
 *   = 0 ligne affectée, objet intact) au niveau DB.
 *
 * Nettoyage en fin : les objets de test restants (réf globale REHEARSAL-)
 * sont supprimés — net nul sur la copie avant rollback.
 */
import { PrismaClient } from "/tmp/rehearsal-refs/client/index.js";
import { readFileSync, writeFileSync } from "node:fs";

const [exportPath, outPath] = process.argv.slice(2);
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const R = { startedAtUTC: new Date().toISOString(), tests: [], summary: {} };
const assert = (name, condition, detail) => {
  R.tests.push({ name, verdict: condition ? "PASS" : "FAIL", detail });
  if (!condition) R.summary.failed = (R.summary.failed ?? 0) + 1;
  console.log(`${condition ? "✅ PASS" : "❌ FAIL"} — ${name} :: ${JSON.stringify(detail)}`);
};

// Re-dump identique à export-references.mjs (mêmes colonnes, même ordre)
const dumpRefs = () =>
  prisma.reference.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true, type: true, authors: true, title: true, year: true, journal: true, volume: true,
      issue: true, pages: true, publisher: true, doi: true, isbn: true, url: true, abstract: true,
      keywords: true, notes: true, bibtexKey: true, source: true, isFavorite: true,
      createdAt: true, updatedAt: true, thesisId: true,
    },
  });
const norm = (r) => ({
  ...r,
  year: r.year ?? null,
  journal: r.journal ?? null, volume: r.volume ?? null, issue: r.issue ?? null, pages: r.pages ?? null,
  publisher: r.publisher ?? null, doi: r.doi ?? null, isbn: r.isbn ?? null, url: r.url ?? null,
  abstract: r.abstract ?? null, keywords: r.keywords ?? null, notes: r.notes ?? null, bibtexKey: r.bibtexKey ?? null,
  // Normalisation de REPRÉSENTATION (mêmes valeurs) : SQLite exporte des entiers
  // (booléen 0/1, DateTime en ms epoch), Prisma client renvoie boolean/Date.
  isFavorite: r.isFavorite ? 1 : 0,
  createdAt: typeof r.createdAt === "number" ? r.createdAt : new Date(r.createdAt).getTime(),
  updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : new Date(r.updatedAt).getTime(),
});

try {
  const owner = await prisma.thesis.findFirst({ orderBy: { createdAt: "asc" } });
  const thesisB = await prisma.thesis.findFirst({ where: { title: { startsWith: "REHEARSAL-TH-B" } } });
  assert("pré-requis : thèse propriétaire + thèse B présentes", !!owner && !!thesisB, { owner: owner?.id, thesisB: thesisB?.id });

  const refB = await prisma.reference.findMany({ where: { thesisId: thesisB.id }, orderBy: { id: "asc" } });
  const refGlobal = await prisma.reference.findFirst({ where: { title: { startsWith: "REHEARSAL-GLOBAL" } } });
  assert("pré-requis : 2 réf. attribuées à B + 1 réf. globale", refB.length === 2 && !!refGlobal, { refB: refB.map((r) => r.id), refGlobal: refGlobal?.id });

  // ── (a) Isolation stricte A vs B ─────────────────────────────────────────
  const scopeA = await prisma.reference.findMany({ where: { thesisId: owner.id }, select: { id: true } });
  const scopeB = await prisma.reference.findMany({ where: { thesisId: thesisB.id }, select: { id: true } });
  assert("(a1) requête scopée thèse A = 4 réf. du propriétaire", scopeA.length === 4, { count: scopeA.length, ids: scopeA.map((r) => r.id) });
  assert("(a2) requête scopée thèse A ne voit AUCUNE réf. de B", scopeA.every((r) => !refB.some((b) => b.id === r.id)), { refB: refB.map((r) => r.id) });
  assert("(a3) requête scopée thèse B = 2 réf. de B", scopeB.length === 2, { count: scopeB.length });
  assert("(a4) requête scopée thèse B ne voit AUCUNE réf. du propriétaire", scopeB.every((r) => !scopeA.some((a) => a.id === r.id)), {});

  // Vue « bibliothèque d'une thèse » inclusive (globales + scopées) — état transitoire des globales
  const viewA = await prisma.reference.findMany({ where: { OR: [{ thesisId: owner.id }, { thesisId: null }] }, select: { id: true } });
  const viewB = await prisma.reference.findMany({ where: { OR: [{ thesisId: thesisB.id }, { thesisId: null }] }, select: { id: true } });
  assert("(a5) vue inclusive A ne contient aucune réf. attribuée B", viewA.every((r) => !refB.some((b) => b.id === r.id)), { viewACount: viewA.length });
  assert("(a6) vue inclusive B ne contient aucune réf. attribuée A", viewB.every((r) => !scopeA.some((a) => a.id === r.id)), { viewBCount: viewB.length });

  // ── (b) Les globales restent visibles des deux côtés ─────────────────────
  assert("(b1) réf. globale visible côté A (vue inclusive)", viewA.some((r) => r.id === refGlobal.id), { refGlobal: refGlobal.id });
  assert("(b2) réf. globale visible côté B (vue inclusive)", viewB.some((r) => r.id === refGlobal.id), { refGlobal: refGlobal.id });

  // ── Simulation du contrat API 404 (niveau DB : garde par contexte) ──────
  const crossUpdate = await prisma.reference.updateMany({
    where: { id: refB[0].id, thesisId: owner.id }, // contexte = thèse A alors que la réf. appartient à B
    data: { title: "TENTATIVE D'ÉCRITURE CROSS-THÈSE — NE DOIT JAMAIS S'APPLIQUER" },
  });
  const refB0After = await prisma.reference.findUnique({ where: { id: refB[0].id } });
  assert("(a7) UPDATE cross-contexte (garde thesisId=owner sur réf. de B) → 0 ligne modifiée, réf. intacte", crossUpdate.count === 0 && refB0After.title === refB[0].title, { changed: crossUpdate.count, titleUnchanged: refB0After.title === refB[0].title });

  // ── (c) Suppression de la thèse B → cascade de SES références uniquement ─
  const countsBeforeDelete = {
    referencesTotal: await prisma.reference.count(),
    refBCount: refB.length,
    chaptersB: await prisma.chapter.count({ where: { thesisId: thesisB.id } }),
    globalCount: await prisma.reference.count({ where: { thesisId: null } }),
    ownerRefCount: await prisma.reference.count({ where: { thesisId: owner.id } }),
  };
  await prisma.thesis.delete({ where: { id: thesisB.id } });
  const afterDelete = {
    refBRemaining: await prisma.reference.count({ where: { id: { in: refB.map((r) => r.id) } } }),
    chaptersBRemaining: await prisma.chapter.count({ where: { thesisId: thesisB.id } }),
    thesisBRemaining: await prisma.thesis.count({ where: { id: thesisB.id } }),
    globalRemaining: await prisma.reference.count({ where: { id: refGlobal.id } }),
    ownerRefCount: await prisma.reference.count({ where: { thesisId: owner.id } }),
  };
  assert("(c1) DELETE thèse B → 0 chapitre B restant (cascade)", afterDelete.thesisBRemaining === 0 && afterDelete.chaptersBRemaining === 0, afterDelete);
  assert("(c2) CASCADE : les 2 réf. attribuées à B sont supprimées avec elle", afterDelete.refBRemaining === 0, { refBIds: refB.map((r) => r.id) });
  assert("(c3) la réf. globale (thesisId NULL) SURVIT à la suppression de B", afterDelete.globalRemaining === 1, { refGlobal: refGlobal.id });
  assert("(c4) les réf. du propriétaire ne changent pas de nombre (4)", countsBeforeDelete.ownerRefCount === 4 && afterDelete.ownerRefCount === 4, { before: countsBeforeDelete.ownerRefCount, after: afterDelete.ownerRefCount });

  // ── (d) Intégrité stricte des 4 réf. du propriétaire vs export réversible ─
  const exportBefore = JSON.parse(readFileSync(exportPath, "utf8"));
  const beforeById = new Map(exportBefore.references.map((r) => [r.id, r]));
  const current = (await dumpRefs()).filter((r) => beforeById.has(r.id)).map(norm);
  const diffs = [];
  for (const cur of current) {
    const before = beforeById.get(cur.id);
    for (const k of Object.keys(cur)) {
      const bv = before[k] === undefined ? null : before[k];
      if (String(bv) !== String(cur[k])) diffs.push({ id: cur.id, field: k, before: bv, after: cur[k] });
    }
  }
  const onlyThesisId = diffs.length > 0 && diffs.every((d) => d.field === "thesisId");
  assert("(d1) diff vs export réversible (représentations normalisées) : les 4 réf. propriétaire présentes, modifiées UNIQUEMENT sur thesisId", current.length === 4 && onlyThesisId, { comparedRows: current.length, diffFields: [...new Set(diffs.map((d) => d.field))], diff: diffs });

  // ── Nettoyage : net nul des objets de test restants sur la copie ────────
  const cleanupGlobal = await prisma.reference.deleteMany({ where: { title: { startsWith: "REHEARSAL-" } } });
  const cleanupThesis = await prisma.thesis.deleteMany({ where: { title: { startsWith: "REHEARSAL-TH-" } } });
  R.cleanup = { globalRefsDeleted: cleanupGlobal.count, testThesesDeleted: cleanupThesis.count };
  R.finalState = {
    referencesTotal: await prisma.reference.count(),
    ownerReferences: await prisma.reference.count({ where: { thesisId: owner.id } }),
    referencesNull: await prisma.reference.count({ where: { thesisId: null } }),
    thesisCount: await prisma.thesis.count(),
  };
  R.finishedAtUTC = new Date().toISOString();
  R.summary.total = R.tests.length;
  R.summary.failed = R.summary.failed ?? 0;
  R.summary.allPass = R.summary.failed === 0;
  writeFileSync(outPath, JSON.stringify(R, null, 2) + "\n");
  console.log("\n" + JSON.stringify({ summary: R.summary, cleanup: R.cleanup, finalState: R.finalState }, null, 2));
} catch (e) {
  R.error = String(e);
  writeFileSync(outPath, JSON.stringify(R, null, 2) + "\n");
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

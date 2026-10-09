/* Script de preuve (reproductibilité comptages) — console volontaire : sortie du rapport de comptage */
/* eslint-disable no-console */
// W1-8 (A2 lot 1) — comptages DB LECTURE SEULE (état propriétaire)
// Usage : node audit/baseline/evidence/tmp-w18-counts.mjs > a2-lot1-db-<avant|apres>.json
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [theses, chapters, chapterVersions, references, importedDocs, jobs,
    researchSources, notebookEntries, experiments, experimentRuns,
    elementAnalyses, typeAnalyses] = await Promise.all([
    db.thesis.count(),
    db.chapter.count(),
    db.chapterVersion.count(),
    db.reference.count(),
    db.importedDoc.count(),
    db.job.count(),
    db.researchSource.count(),
    db.notebookEntry.count(),
    db.experiment.count(),
    db.experimentRun.count(),
    db.elementAnalyse.count(),
    db.typeAnalyseMethodologique.count(),
  ]);

  const thesis = await db.thesis.findFirst({
    select: { id: true, title: true },
    orderBy: { createdAt: "asc" },
  });
  const words = await db.chapter.aggregate({ _sum: { wordCount: true } });
  const auditSources = await db.researchSource.findMany({
    where: { title: { contains: "AUDIT-A2-" } },
    select: { id: true, title: true },
  });
  const auditEntries = await db.notebookEntry.findMany({
    where: { question: { contains: "AUDIT-A2-" } },
    select: { id: true, question: true },
  });
  const auditExps = await db.experiment.findMany({
    where: { title: { contains: "AUDIT-A2-" } },
    select: { id: true, title: true, _count: { select: { runs: true } } },
  });
  const auditElems = await db.elementAnalyse.findMany({
    where: { nom: { contains: "AUDIT-A2-" } },
    select: { id: true, nom: true },
  });

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    counts: {
      Thesis: theses, Chapter: chapters, ChapterVersion: chapterVersions,
      Reference: references, ImportedDoc: importedDocs, Job: jobs,
      ResearchSource: researchSources, NotebookEntry: notebookEntries,
      Experiment: experiments, ExperimentRun: experimentRuns,
      ElementAnalyse: elementAnalyses, TypeAnalyse: typeAnalyses,
    },
    thesis: thesis ? { id: thesis.id, title: thesis.title } : null,
    thesisWords: words._sum.wordCount ?? 0,
    objetsAuditA2: {
      sources: auditSources, entries: auditEntries, experiments: auditExps,
      elements: auditElems,
    },
  }, null, 2));
}

main()
  .catch((e) => { console.error("COUNT_ERROR", e); process.exit(1); })
  .finally(() => db.$disconnect());

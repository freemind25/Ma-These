/* Script de preuve (reproductibilité comptages) — console volontaire : sortie du rapport de comptage */
/* eslint-disable no-console */
// W1-8b (A2 lot 2) — comptages DB LECTURE SEULE (état propriétaire)
// Usage : node audit/baseline/evidence/tmp-w18b-counts.mjs > a2-lot2-db-<before|after>.json
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [
    theses, chapters, chapterVersions, references, importedDocs, jobs,
    researchSources, notebookEntries, experiments, experimentRuns,
    elementAnalyses, typeAnalyses,
    articles, articleVersions, researchTabs, agileSprints, agileStories, legalRefs,
  ] = await Promise.all([
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
    db.article.count(),
    db.articleVersion.count(),
    db.researchTab.count(),
    db.agileSprint.count(),
    db.agileStory.count(),
    db.legalRef.count(),
  ]);

  const allTheses = await db.thesis.findMany({
    select: { id: true, title: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "asc" },
  });
  const words = await db.chapter.aggregate({ _sum: { wordCount: true } });
  const auditTabs = await db.researchTab.findMany({
    where: { title: { contains: "AUDIT-A2" } },
    select: { id: true, title: true, thesisId: true },
  });
  const auditArticles = await db.article.findMany({
    where: { title: { contains: "AUDIT-A2" } },
    select: { id: true, title: true },
  });
  const auditSprints = await db.agileSprint.findMany({
    where: { title: { contains: "AUDIT-A2" } },
    select: { id: true, title: true, _count: { select: { stories: true } } },
  });
  const auditStories = await db.agileStory.findMany({
    where: { title: { contains: "AUDIT-A2" } },
    select: { id: true, title: true, sprintId: true },
  });
  const auditLegalRefs = await db.legalRef.findMany({
    where: { reference: { contains: "AUDIT-A2" } },
    select: { id: true, reference: true },
  });
  // ImportedDocs liés à un article de test ? ImportedDoc n'a pas articleId — vérif par filename
  const auditDocs = await db.importedDoc.findMany({
    where: { filename: { contains: "AUDIT-A2" } },
    select: { id: true, filename: true },
  });
  const auditLegalByDomaine = await db.legalRef.findMany({
    where: { domaine: { contains: "AUDIT" } },
    select: { id: true, reference: true, domaine: true },
  });

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    counts: {
      Thesis: theses, Chapter: chapters, ChapterVersion: chapterVersions,
      Reference: references, ImportedDoc: importedDocs, Job: jobs,
      ResearchSource: researchSources, NotebookEntry: notebookEntries,
      Experiment: experiments, ExperimentRun: experimentRuns,
      ElementAnalyse: elementAnalyses, TypeAnalyse: typeAnalyses,
      Article: articles, ArticleVersion: articleVersions,
      ResearchTab: researchTabs, AgileSprint: agileSprints,
      AgileStory: agileStories, LegalRef: legalRefs,
    },
    theses: allTheses.map(t => ({ id: t.id, title: t.title })),
    thesisWords: words._sum.wordCount ?? 0,
    objetsAuditA2b: {
      tabs: auditTabs, articles: auditArticles, sprints: auditSprints,
      stories: auditStories, legalRefs: auditLegalRefs,
      legalRefsParDomaine: auditLegalByDomaine, importedDocs: auditDocs,
    },
  }, null, 2));
}

main()
  .catch((e) => { console.error("COUNT_ERROR", e); process.exit(1); })
  .finally(() => db.$disconnect());

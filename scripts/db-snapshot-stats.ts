// ThesisFrame — Statistiques d'intégrité d'une base (C-1 / AUD-GOV-001)
// Usage : bun scripts/db-snapshot-stats.ts file:/chemin/vers/base.db
// Sortie JSON : integrity_check, foreign_key_check, comptages par table, corpus.
// Utilisée pour comparer une sauvegarde/restauration à la base live.
import { PrismaClient } from '@prisma/client';

async function main() {
  const target = process.argv[2];
  if (!target || !target.startsWith('file:')) {
    console.error('usage: bun scripts/db-snapshot-stats.ts file:/chemin/base.db');
    process.exit(2);
  }
  const db = new PrismaClient({ datasources: { db: { url: target } } });
  try {
    const integrity = await db.$queryRawUnsafe<{ integrity_check: string }[]>(
      `PRAGMA integrity_check`
    );
    const fk = await db.$queryRawUnsafe<unknown[]>(`PRAGMA foreign_key_check`);
    const counts = await db.$queryRawUnsafe<{ tbl: string; n: number }[]>(`
      SELECT 'Thesis' AS tbl, COUNT(*) AS n FROM Thesis
      UNION ALL SELECT 'Chapter', COUNT(*) FROM Chapter
      UNION ALL SELECT 'Part', COUNT(*) FROM Part
      UNION ALL SELECT 'ImportedDoc', COUNT(*) FROM ImportedDoc
      UNION ALL SELECT 'Reference', COUNT(*) FROM Reference
      UNION ALL SELECT 'Job', COUNT(*) FROM Job
      UNION ALL SELECT 'ElementAnalyse', COUNT(*) FROM ElementAnalyse
      UNION ALL SELECT 'SavedSearch', COUNT(*) FROM SavedSearch
      UNION ALL SELECT 'ResearchTab', COUNT(*) FROM ResearchTab
      UNION ALL SELECT 'ChapterVersion', COUNT(*) FROM ChapterVersion
    `);
    const corpus = await db.$queryRawUnsafe<{
      docs: number; chars: number; blobs: number; bytes: number;
    }[]>(`
      SELECT COUNT(*) AS docs,
             COALESCE(SUM(LENGTH(text)), 0) AS chars,
             COALESCE(SUM(CASE WHEN data IS NOT NULL THEN 1 ELSE 0 END), 0) AS blobs,
             COALESCE(SUM(sizeBytes), 0) AS bytes
      FROM ImportedDoc
    `);
    const chapters = await db.$queryRawUnsafe<{ words: number }[]>(`
      SELECT COALESCE(SUM(wordCount), 0) AS words FROM Chapter
    `);
    const thesisSample = await db.$queryRawUnsafe<{ title: string }[]>(
      `SELECT title FROM Thesis ORDER BY createdAt LIMIT 5`
    );
    // SQLite COUNT()/SUM() → BigInt : conversion Number pour JSON
    console.log(
      JSON.stringify(
        {
          target,
          integrity: integrity[0]?.integrity_check ?? 'UNKNOWN',
          fkViolations: fk.length,
          counts: counts.map((c) => ({ tbl: c.tbl, n: Number(c.n) })),
          corpus: {
            docs: Number(corpus[0]?.docs ?? 0),
            chars: Number(corpus[0]?.chars ?? 0),
            blobs: Number(corpus[0]?.blobs ?? 0),
            bytes: Number(corpus[0]?.bytes ?? 0),
          },
          thesisWords: Number(chapters[0]?.words ?? 0),
          thesisTitles: thesisSample.map((t) => t.title),
        },
        null,
        2
      )
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error('STATS_FAILED', e instanceof Error ? e.message : e);
  process.exit(1);
});

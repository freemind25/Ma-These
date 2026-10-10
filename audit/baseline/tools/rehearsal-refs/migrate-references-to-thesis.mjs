#!/usr/bin/env bun
/**
 * migrate-references-to-thesis.mjs — Attribution des références existantes (proposition-technique.md §3.3).
 *
 * Usage : bun migrate-references-to-thesis.mjs <db-path> <journal-output.json>
 *         (DATABASE_URL non utilisé : accès direct SQLite, transactionnel, idempotent)
 *
 * RÈGLE APPLIQUÉE (à la lettre, aucune heuristique hors proposition) :
 *   - Cas UNIVOQUE (exactement 1 thèse dans la base) : toutes les références
 *     non attribuées (thesisId NULL) sont attribuées à cette unique thèse —
 *     l'appartenance est non ambiguë par définition (un seul candidat possible).
 *     Journal d'attribution consigné ligne par ligne.
 *   - Cas MULTI-THÈSES : AUCUNE attribution automatique — toute référence non
 *     attribuée est considérée ambiguë (aucun contexte de création fiable en
 *     base : pas d'historique d'usage, createdAt non déterminant pour le
 *     rattachement) → thesisId reste NULL + listée dans le rapport d'ambiguïté
 *     (résolution manuelle via le futur filtre « non attribuées »).
 *     ÉCART DOCUMENTÉ vs proposition §3.3 (« attribution à la thèse active du
 *     moment ») : la règle impérative du propriétaire prime — attribution
 *     automatique UNIQUEMENT si appartenance non ambiguë ; il n'existe par
 *     ailleurs aucun champ « thèse active » en base.
 *   - IDEMPOTENT : les références déjà attribuées ne sont jamais touchées ;
 *     ré-exécuter ne change rien (0 ligne modifiée au 2e passage).
 *   - Les références non attribuables ne sont JAMAIS supprimées.
 *
 * Sûreté : ouverture SQLite en lecture-écriture sur la base CIBLE PASSÉE EN
 * ARGUMENT UNIQUEMENT (en répétition : la copie /tmp ; en exécution réelle :
 * db/custom.db après sauvegarde + export validés et GO explicite du propriétaire).
 */
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dbPath = resolve(process.argv[2]);
const journalPath = resolve(process.argv[3]);
if (!dbPath || !journalPath) {
  console.error("Usage: bun migrate-references-to-thesis.mjs <db-path> <journal-output.json>");
  process.exit(1);
}
const sha256 = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

const db = new Database(dbPath);
db.exec("PRAGMA foreign_keys = ON");

const runId = `MIGREF-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;

const theses = db.query(`SELECT id, title FROM "Thesis" ORDER BY createdAt ASC`).all();
const refsNull = db
  .query(`SELECT id, title, createdAt FROM "Reference" WHERE "thesisId" IS NULL ORDER BY createdAt ASC, id ASC`)
  .all();
const refsAttributed = db
  .query(`SELECT id, title, "thesisId" FROM "Reference" WHERE "thesisId" IS NOT NULL`)
  .all();

const before = {
  runId,
  startedAtUTC: new Date().toISOString(),
  dbPath,
  dbSha256Before: sha256(dbPath),
  thesisCount: theses.length,
  theses: theses.map((t) => ({ id: t.id, title: t.title })),
  referenceTotal: refsNull.length + refsAttributed.length,
  referenceAlreadyAttributed: refsAttributed.length,
  referenceNull: refsNull.length,
  ruleApplied: null,
  ambiguityReport: [],
  attributionJournal: [],
  rowsUpdated: 0,
};

if (theses.length === 0) {
  // Aucune thèse : impossible d'attribuer — tout reste NULL (non-attribuables, jamais supprimés).
  before.ruleApplied = "AUCUNE_THÈSE — 0 attribution automatique ; références laissées thesisId=NULL (à résoudre manuellement)";
  before.ambiguityReport = refsNull.map((r) => ({
    referenceId: r.id,
    title: r.title,
    reason: "aucune thèse existante — appartenance indéterminable",
  }));
} else if (theses.length === 1) {
  // CAS UNIVOQUE (proposition §3.3) : une seule thèse = appartenance non ambiguë.
  before.ruleApplied = `CAS_UNIVOQUE (1 thèse) — attribution de toutes les références thesisId=NULL à la thèse unique ${theses[0].id} (« ${theses[0].title} »)`;
  const attribute = db.transaction(() => {
    for (const r of refsNull) {
      // NB : updatedAt est VOLONTAIREMENT préservé (pas d'écriture) — l'export
      // réversible doit différer de l'état migré UNIQUEMENT par thesisId
      // (exigence de contrôle post-migration, Task ID 3).
      const res = db
        .prepare(`UPDATE "Reference" SET "thesisId" = ? WHERE id = ? AND "thesisId" IS NULL`)
        .run(theses[0].id, r.id);
      if (res.changes === 1) {
        before.attributionJournal.push({
          referenceId: r.id,
          title: r.title,
          thesisIdFrom: null,
          thesisIdTo: theses[0].id,
          thesisTitleTo: theses[0].title,
          reason: "cas univoque : base ne contenant qu'une seule thèse (proposition-technique.md §3.3)",
          decidedAtUTC: new Date().toISOString(),
        });
        before.rowsUpdated += 1;
      }
    }
  });
  attribute();
} else {
  // CAS MULTI-THÈSES : ambiguïté → 0 attribution automatique, tout listé, NULL conservé.
  before.ruleApplied =
    "CAS_MULTI-THÈSES — 0 attribution automatique (règle impérative propriétaire : attribution UNIQUEMENT si appartenance non ambiguë) ; références laissées thesisId=NULL et listées";
  before.ambiguityReport = refsNull.map((r) => ({
    referenceId: r.id,
    title: r.title,
    createdAt: new Date(r.createdAt).toISOString(),
    reason: `plusieurs thèses présentes (${theses.length}) — aucun contexte de création/usage déterminant en base ; l'« attribution à la thèse active du moment » (proposition §3.3) est écartée par la règle impérative du propriétaire (ambigu = NULL + listé)`,
  }));
}

const after = {
  referenceTotal: db.query(`SELECT COUNT(*) AS n FROM "Reference"`).get().n,
  referenceAttributed: db.query(`SELECT COUNT(*) AS n FROM "Reference" WHERE "thesisId" IS NOT NULL`).get().n,
  referenceNull: db.query(`SELECT COUNT(*) AS n FROM "Reference" WHERE "thesisId" IS NULL`).get().n,
  dbSha256After: sha256(dbPath),
  integrityCheck: db.query("PRAGMA integrity_check").get()?.integrity_check ?? null,
  fkViolations: db.query("PRAGMA foreign_key_check").all().length,
  finishedAtUTC: new Date().toISOString(),
};

// Contrôle d'idempotence interne : toute valeur thesisId attribuée pointe vers une thèse existante
const dangling = db
  .query(
    `SELECT r.id, r."thesisId" FROM "Reference" r LEFT JOIN "Thesis" t ON t.id = r."thesisId"
     WHERE r."thesisId" IS NOT NULL AND t.id IS NULL`
  )
  .all();

const journal = { before, after, danglingReferences: dangling, idempotentGuarantee: "les références déjà attribuées ne sont jamais modifiées (clause WHERE thesisId IS NULL)" };
writeFileSync(journalPath, JSON.stringify(journal, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      runId,
      ruleApplied: before.ruleApplied,
      before: { thesisCount: before.thesisCount, referenceTotal: before.referenceTotal, referenceNull: before.referenceNull, referenceAlreadyAttributed: before.referenceAlreadyAttributed },
      rowsUpdated: before.rowsUpdated,
      attributionJournalEntries: before.attributionJournal.length,
      ambiguityReportEntries: before.ambiguityReport.length,
      ambiguity: before.ambiguityReport,
      after,
      danglingReferences: dangling.length,
      journalPath,
    },
    null,
    2
  )
);
db.close();

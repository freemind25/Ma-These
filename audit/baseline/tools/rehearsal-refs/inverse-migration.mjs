#!/usr/bin/env bun
/**
 * inverse-migration.mjs — Rollback SURGICAL via l'export réversible (proposition §3.4, voie 2).
 *
 * Usage : bun inverse-migration.mjs <db-path> <journal-run1.json> <output-json>
 *
 * Inverse l'attribution consignée dans le journal : pour chaque entrée du
 * journal (referenceId, thesisIdFrom=null, thesisIdTo=X), remet thesisId=NULL
 * UNIQUEMENT si la ligne est toujours attribuée à X (garde d'intégrité :
 * aucune attribution concurrente n'est écrasée). updatedAt préservé.
 * L'autre voie (restauration byte-identique complète depuis la sauvegarde,
 * procédure C-1) est démontrée séparément — c'est la voie recommandée.
 */
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [dbPathArg, journalPathArg, outPathArg] = process.argv.slice(2);
const dbPath = resolve(dbPathArg);
const sha256 = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const journal = JSON.parse(readFileSync(journalPathArg, "utf8"));

const db = new Database(dbPath);
db.exec("PRAGMA foreign_keys = ON");
const reverted = [];
const skipped = [];

const inverse = db.transaction(() => {
  for (const entry of journal.before.attributionJournal) {
    const res = db
      .prepare(`UPDATE "Reference" SET "thesisId" = NULL WHERE id = ? AND "thesisId" = ?`)
      .run(entry.referenceId, entry.thesisIdTo);
    if (res.changes === 1) reverted.push({ referenceId: entry.referenceId, title: entry.title, thesisId: entry.thesisIdTo, restoredTo: null });
    else skipped.push({ referenceId: entry.referenceId, reason: "ligne non dans l'état attendu (garde d'intégrité) — non touchée" });
  }
});
inverse();

const after = {
  referenceTotal: db.query(`SELECT COUNT(*) AS n FROM "Reference"`).get().n,
  attributed: db.query(`SELECT COUNT(*) AS n FROM "Reference" WHERE "thesisId" IS NOT NULL`).get().n,
  nullThesisId: db.query(`SELECT COUNT(*) AS n FROM "Reference" WHERE "thesisId" IS NULL`).get().n,
  integrityCheck: db.query("PRAGMA integrity_check").get()?.integrity_check ?? null,
  fkViolations: db.query("PRAGMA foreign_key_check").all().length,
  dbSha256After: sha256(dbPath),
};
db.close();

const result = {
  invertedAtUTC: new Date().toISOString(),
  dbPath,
  journalRunId: journal.before.runId,
  journalEntries: journal.before.attributionJournal.length,
  revertedCount: reverted.length,
  reverted,
  skipped,
  after,
};
if (outPathArg) writeFileSync(outPathArg, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));

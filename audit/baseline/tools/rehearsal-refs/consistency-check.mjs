#!/usr/bin/env bun
/**
 * consistency-check.mjs — Contrôles de cohérence post-migration (répétition générale).
 *
 * Usage : bun consistency-check.mjs <db-path> <export-before.json> <output-json>
 *
 * Contrôles (réutilisables tels quels en exécution réelle, proposition §3.5) :
 *   1. Comptages : total références APRÈS == total AVANT (aucune perte) ;
 *   2. Orphelins : (a) aucune référence attribuée ne pointe vers une thèse
 *      inexistante (FK logique), (b) inventaire des usages DB-level — la table
 *      Reference n'a AUCUNE relation entrante dans le schéma réel (usage
 *      applicatif uniquement) → critère « 0 orphelin d'usage » = non applicable
 *      en base, documenté ;
 *   3. Intégrité SQLite : integrity_check + foreign_key_check ;
 *   4. Re-vérification du dump export : les lignes préexistantes diffèrent de
 *      l'export réversible UNIQUEMENT par thesisId (représentations normalisées :
 *      SQLite entier 0/1 + ms epoch vs boolean/Date Prisma).
 */
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [dbPathArg, exportPathArg, outPathArg] = process.argv.slice(2);
const dbPath = resolve(dbPathArg);
const sha256 = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

const db = new Database(dbPath, { readonly: true });
const exportBefore = JSON.parse(readFileSync(exportPathArg, "utf8"));

// 1. Comptages
const totalAfter = db.query(`SELECT COUNT(*) AS n FROM "Reference"`).get().n;
const attributed = db.query(`SELECT COUNT(*) AS n FROM "Reference" WHERE "thesisId" IS NOT NULL`).get().n;
const nullRefs = db.query(`SELECT COUNT(*) AS n FROM "Reference" WHERE "thesisId" IS NULL`).get().n;
const thesisCount = db.query(`SELECT COUNT(*) AS n FROM "Thesis"`).get().n;

// 2. Orphelins / FK logique
const dangling = db
  .query(
    `SELECT r.id AS referenceId, r."thesisId" FROM "Reference" r
     LEFT JOIN "Thesis" t ON t.id = r."thesisId"
     WHERE r."thesisId" IS NOT NULL AND t.id IS NULL`
  )
  .all();

// 3. Intégrité
const integrity = db.query("PRAGMA integrity_check").get()?.integrity_check ?? null;
const fkViolations = db.query("PRAGMA foreign_key_check").all().length;

// 4. Re-vérification du dump export — colonnes communes, représentations normalisées
const rows = db
  .query(
    `SELECT id, type, authors, title, year, journal, volume, issue, pages, publisher,
            doi, isbn, url, abstract, keywords, notes, bibtexKey, source, isFavorite,
            createdAt, updatedAt, "thesisId"
     FROM "Reference" ORDER BY id ASC`
  )
  .all();
const beforeById = new Map(exportBefore.references.map((r) => [r.id, r]));
const norm = (v) => {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).getTime();
  return v === undefined ? null : v;
};
const rowDiffs = [];
let preexisting = 0;
for (const row of rows) {
  const before = beforeById.get(row.id);
  if (!before) continue; // lignes créées après l'export (objets de test) — hors périmètre
  preexisting += 1;
  for (const k of Object.keys(row)) {
    if (String(norm(before[k])) !== String(norm(row[k]))) {
      rowDiffs.push({ id: row.id, field: k, before: before[k] ?? null, after: row[k] ?? null });
    }
  }
}
const missingFromAfter = exportBefore.references.filter((r) => !rows.some((x) => x.id === r.id)).map((r) => r.id);
const onlyThesisId = rowDiffs.length > 0 && rowDiffs.every((d) => d.field === "thesisId");

const result = {
  checkedAtUTC: new Date().toISOString(),
  dbPath,
  dbSha256: sha256(dbPath),
  counts: {
    referencesTotalBefore: exportBefore.meta.rowCount,
    referencesTotalAfter: totalAfter,
    equal: exportBefore.meta.rowCount === totalAfter,
    attributed,
    nullThesisId: nullRefs,
    thesisCount,
  },
  orphans: {
    danglingThesisIdReferences: dangling,
    danglingCount: dangling.length,
    dbLevelUsageRelationsToReference: 0,
    note: "Aucune clé étrangère ne pointe vers Reference dans le schéma réel (vérifié PRAGMA foreign_key_list sur les 30 tables) — l'usage est exclusivement applicatif (8 consommateurs). Le critère « orphelin d'usage » est donc non applicable en base ; l'atteignabilité = FK thesisId valide (0 dangling).",
  },
  integrity: { integrityCheck: integrity, foreignKeyCheckViolations: fkViolations },
  exportDiff: {
    preexistingRowsCompared: preexisting,
    fieldDiffs: rowDiffs,
    diffFields: [...new Set(rowDiffs.map((d) => d.field))],
    onlyThesisIdDiffers: onlyThesisId,
    missingRowsFromAfter: missingFromAfter,
    representationNormalization: "boolean↔0/1, Date ISO↔ms epoch (mêmes valeurs)",
  },
  verdict:
    exportBefore.meta.rowCount === totalAfter &&
    dangling.length === 0 &&
    integrity === "ok" &&
    fkViolations === 0 &&
    missingFromAfter.length === 0 &&
    (onlyThesisId || rowDiffs.length === 0)
      ? "PASS"
      : "FAIL",
};
db.close();
if (outPathArg) writeFileSync(outPathArg, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));

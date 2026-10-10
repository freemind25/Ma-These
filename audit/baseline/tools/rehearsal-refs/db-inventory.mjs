#!/usr/bin/env bun
/**
 * db-inventory.mjs — Inventaire lecture seule d'une base (comptages + intégrité).
 *
 * Usage : bun audit/baseline/tools/rehearsal-refs/db-inventory.mjs <db-path> [output-json]
 *
 * - Ouverture SQLite READONLY : aucune écriture possible.
 * - Comptages de toutes les tables + intégrité + FK check + liste thèses/références (résumé).
 * - Réutilisable pour l'exécution réelle (compteurs pré/post exigés par la proposition §3.2/§3.5).
 */
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

const dbPath = resolve(process.argv[2]);
const outPath = process.argv[3] ? resolve(process.argv[3]) : null;
const sha256 = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");

const db = new Database(dbPath, { readonly: true });

const tables = db
  .query(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
  .all()
  .map((r) => r.name);

const counts = {};
for (const t of tables) {
  counts[t] = db.query(`SELECT COUNT(*) AS n FROM "${t}"`).get().n;
}

const theses = db
  .query(`SELECT id, title, author, status, structureMode, createdAt, updatedAt FROM "Thesis" ORDER BY createdAt ASC`)
  .all();

const referencesSummary = db
  .query(`SELECT id, title, type, source, isFavorite, createdAt, updatedAt FROM "Reference" ORDER BY id ASC`)
  .all();

// Colonnes réelles de Reference (réalité du schéma en base, pas seulement le fichier prisma)
const referenceColumns = db.query(`PRAGMA table_info("Reference")`).all().map((c) => ({
  name: c.name,
  type: c.type,
  notnull: !!c.notnull,
  pk: !!c.pk,
}));

// Index de la table Reference (réalité en base)
const referenceIndexes = db
  .query(`SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='Reference'`)
  .all();

// Clés étrangères pointant VERS Reference ou depuis Reference (réalité en base)
const foreignKeysToReference = [];
for (const t of tables) {
  const fks = db.query(`PRAGMA foreign_key_list("${t}")`).all();
  for (const fk of fks) {
    if (fk.table === "Reference") {
      foreignKeysToReference.push({ fromTable: t, fromColumn: fk.from, toTable: fk.table, toColumn: fk.to, onUpdate: fk.on_update, onDelete: fk.on_delete });
    }
  }
}
const referenceForeignKeysOut = db.query(`PRAGMA foreign_key_list("Reference")`).all();

const result = {
  meta: {
    inventoriedAtUTC: new Date().toISOString(),
    dbPath,
    dbSha256: sha256(dbPath),
    dbBytes: statSync(dbPath).size,
    readonlyMode: true,
  },
  tableCount: tables.length,
  counts,
  theses,
  referencesSummary,
  referenceColumns,
  referenceIndexes,
  foreignKeysToReference,
  referenceForeignKeysOut,
  integrityCheck: db.query("PRAGMA integrity_check").get()?.integrity_check ?? null,
  foreignKeyCheckViolations: db.query("PRAGMA foreign_key_check").all().length,
};

db.close();

if (outPath) writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));

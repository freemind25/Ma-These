#!/usr/bin/env bun
/**
 * export-references.mjs — Export réversible de la table `Reference` (toutes colonnes).
 *
 * Usage : bun audit/baseline/tools/rehearsal-refs/export-references.mjs <db-path> <output-json>
 *
 * - Ouverture SQLite en READONLY (SQLITE_OPEN_READONLY) : aucune écriture possible sur la base.
 * - Dump complet, ordonné par id, toutes les colonnes du modèle Reference (schéma prisma v1.10.8).
 * - Métadonnées : horodatage UTC, chemin source, SHA-256 du fichier base, nb de lignes.
 * - Réutilisable tel quel pour l'exécution réelle (export « before » exigé par la proposition §3.1).
 *
 * Aucun secret ; aucune écriture sur la base source.
 */
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dbPath = resolve(process.argv[2]);
const outPath = resolve(process.argv[3]);

if (!dbPath || !outPath) {
  console.error("Usage: bun export-references.mjs <db-path> <output-json>");
  process.exit(1);
}

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

// READONLY : la base ne peut pas être modifiée (ni données ni schéma ni journal).
const db = new Database(dbPath, { readonly: true });

const rows = db
  .query(
    `SELECT id, type, authors, title, year, journal, volume, issue, pages, publisher,
            doi, isbn, url, abstract, keywords, notes, bibtexKey, source, isFavorite,
            createdAt, updatedAt
     FROM "Reference" ORDER BY id ASC`
  )
  .all();

const integrity = db.query("PRAGMA integrity_check").get();
const fkCheck = db.query("PRAGMA foreign_key_check").all();

const payload = {
  meta: {
    artifact: "rehearsal-refs-export-before",
    purpose: "Export réversible de la table Reference — préalable exigé (proposition-technique.md §3.1)",
    exportedAtUTC: new Date().toISOString(),
    sourceDbPath: dbPath,
    sourceDbSha256: sha256(dbPath),
    sourceDbBytes: statSync(dbPath).size,
    sqliteIntegrityCheck: integrity?.integrity_check ?? null,
    foreignKeyCheckViolations: fkCheck.length,
    rowCount: rows.length,
    columnsDumped: [
      "id", "type", "authors", "title", "year", "journal", "volume", "issue", "pages",
      "publisher", "doi", "isbn", "url", "abstract", "keywords", "notes", "bibtexKey",
      "source", "isFavorite", "createdAt", "updatedAt",
    ],
    orderedBy: "id ASC",
    readonlyMode: true,
  },
  references: rows,
};

writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      exportPath: outPath,
      sourceDbSha256: payload.meta.sourceDbSha256,
      rowCount: rows.length,
      integrityCheck: payload.meta.sqliteIntegrityCheck,
      fkViolations: payload.meta.foreignKeyCheckViolations,
      exportedAtUTC: payload.meta.exportedAtUTC,
    },
    null,
    2
  )
);
db.close();

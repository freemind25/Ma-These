/* Inventaire LECTURE SEULE d'une base SQLite — outil standard du runbook doc 46 (ré-synchronisation urbanisme-test.db).
 * Usage : bun audit/baseline/evidence/resync-testdb-inventory.mjs <chemin-base>  (sortie JSON sur stdout)
 * Garanties : connexion readonly + PRAGMA query_only=1 → aucune écriture possible, y compris accidentelle.
 * Utilisé AVANT (§2.7) et APRÈS (§4.3/§4.4/§4.5) le push — les deux sorties doivent être identiques
 * sur les 25 tables préexistantes (seules 5 tables nouvelles à 0 ligne s'ajoutent après push).
 */
/* eslint-disable no-console */
import { Database } from "bun:sqlite";

const path = process.argv[2];
if (!path) {
  console.error("USAGE: bun resync-testdb-inventory.mjs <chemin-base>");
  process.exit(64);
}

// readonly: true → la connexion ne peut ni écrire ni créer le fichier ; mode ro en plus par robustesse.
const db = new Database(path, { readonly: true });
db.run("PRAGMA query_only = 1");

const tables = db
  .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((r) => r.name);

const counts = {};
for (const t of tables) {
  counts[t] = db.query(`SELECT COUNT(*) AS n FROM "${t}"`).get().n;
}

const integrity = db.query("PRAGMA integrity_check").all().map((r) => Object.values(r)[0]);
const fkViolations = db.query("PRAGMA foreign_key_check").all();
const journalMode = db.query("PRAGMA journal_mode").get();
const pageCount = db.query("PRAGMA page_count").get();
const pageSize = db.query("PRAGMA page_size").get();
const indexes = db
  .query("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all();

const out = {
  timestamp: new Date().toISOString(),
  base: path,
  tableCount: tables.length,
  tables,
  counts,
  integrity_check: integrity,
  foreign_key_violations: fkViolations.length,
  foreign_key_details: fkViolations,
  journal_mode: Object.values(journalMode ?? {})[0] ?? null,
  page_count: Object.values(pageCount ?? {})[0] ?? null,
  page_size: Object.values(pageSize ?? {})[0] ?? null,
  indexes: indexes.map((i) => `${i.tbl_name}:${i.name}`),
};

console.log(JSON.stringify(out, null, 2));
db.close();

/* SUITE DE TESTS SYNTHÉTIQUES du comparateur de contenu — revue technique vague 26 (demande du propriétaire)
 * + série E ajoutée en vague 30 (levée de gel ciblée autorisée par le propriétaire après l'arrêt §4.3bis — doc 49
 * option 1) : couverture des AJOUTS DE COLONNES du DDL gelé par le comparateur v2.2.
 * Usage : bun audit/baseline/evidence/resync-testdb-contenu-tests.mjs
 * NE TOUCHE AUCUNE BASE RÉELLE : toutes les bases de test sont créées dans /tmp/v26-tests (jetables).
 * Couverture demandée :
 *   A — indépendance de l'ordre physique : même données insérées dans un ordre différent → vidages identiques,
 *       sur tables couvrant NULL, nombres/chaînes, BLOB, clé primaire composée, table sans clé primaire,
 *       lignes identiques en doublon ;
 *   B — absence de faux positifs / faux négatifs : (1) bases identiques → PASS ; (2) cellule modifiée, comptage
 *       inchangé → FAIL ; (3) ligne supprimée → FAIL ; (4) ligne ajoutée → FAIL ; (5) NULL remplacé par '' →
 *       FAIL ; (6) donnée binaire modifiée → FAIL ; plus : réel non fini (Infinity) → FAIL détecté, INTEGER hors
 *       plage JS-safe → REFUS de vidage (exit 2), note « comptages identiques mais contenu divergent » ;
 *   D — scénario R2 : préexistantes + 5 nouvelles vides → PASS ; 5 nouvelles dont une non vide → FAIL ;
 *       table inattendue → FAIL ;
 *   E — AJOUTS DE COLONNES du DDL gelé (v2.2) : ajout prévu, toutes NULL → PASS ; valeur non null (y compris
 *       '') dans une colonne ajoutée → FAIL ; colonne ajoutée hors DDL → FAIL ; colonne insérée (ordre rompu)
 *       → FAIL ; valeur préexistante modifiée malgré l'ajout → FAIL ; application DDL partielle → FAIL ;
 *       deux colonnes ajoutées → PASS ; ligne ajoutée malgré l'ajout → FAIL.
 * Chaque cas vérifie le code de sortie ET le verdict JSON ; les divergences doivent être identifiées (table + motif).
 */
/* eslint-disable no-console */
import { Database } from "bun:sqlite";
import { rmSync, mkdirSync, writeFileSync } from "node:fs";

const DIR = "/tmp/v26-tests";
rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });

const DUMP = "audit/baseline/evidence/resync-testdb-rows-dump.mjs";
const COMP = "audit/baseline/evidence/resync-testdb-compare-contenu.mjs";

const results = [];
const check = (nom, attendu, obtenu, detail) => {
  const ok = attendu === obtenu;
  results.push({ nom, attendu, obtenu, ok, detail });
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${nom} — attendu ${attendu}, obtenu ${obtenu}${detail ? ` — ${detail}` : ""}`);
};

const runDump = (db) => {
  const p = Bun.spawnSync(["bun", DUMP, db], { stdout: "pipe", stderr: "pipe" });
  return { exit: p.exitCode, out: p.stdout.toString(), err: p.stderr.toString() };
};
const runCompare = (a, b) => {
  const p = Bun.spawnSync(["bun", COMP, a, b], { stdout: "pipe", stderr: "pipe" });
  let json = null;
  try { json = JSON.parse(p.stdout.toString()); } catch { /* sortie non JSON */ }
  return { exit: p.exitCode, json, out: p.stdout.toString(), err: p.stderr.toString() };
};

const SCHEMA = `
CREATE TABLE t_nulls (id INTEGER PRIMARY KEY, a TEXT, b REAL);
CREATE TABLE t_nums (id INTEGER PRIMARY KEY, i INTEGER, r REAL, s TEXT);
CREATE TABLE t_blobs (id INTEGER PRIMARY KEY, b BLOB);
CREATE TABLE t_composite (a INTEGER, b TEXT, c REAL, PRIMARY KEY(a, b));
CREATE TABLE t_nopk (x TEXT, y INTEGER);
`;
const ROWS = {
  t_nulls: [[1, null, 1.5], [2, "x", null], [3, "", 0]],
  t_nums: [[1, 0, 0, "0"], [2, -1, -1, "-1"], [3, 42, 2.5, "txt"]],
  t_blobs: [[1, Buffer.alloc(0)], [2, Buffer.from([0x00, 0xff])], [3, null]],
  t_composite: [[1, "x", 1], [1, "y", 2], [2, "x", 3]],
  t_nopk: [["dup", 1], ["dup", 1], ["dup", 2]],
};
const TABLES = ["t_nulls", "t_nums", "t_blobs", "t_composite", "t_nopk"];
const NEW_TABLES = ["Article", "ArticleVersion", "ImportedDoc", "LegalRef", "SoutenancePrep"];

const build = (name, { reverse = false, mutate = null, addNew = null, addUnexpected = null, extraSchema = "" } = {}) => {
  const path = `${DIR}/${name}.db`;
  const db = new Database(path);
  db.run(SCHEMA + extraSchema);
  for (const t of TABLES) {
    const rows = reverse ? [...ROWS[t]].reverse() : ROWS[t];
    for (const row of rows) {
      const ph = row.map(() => "?").join(", ");
      db.query(`INSERT INTO "${t}" VALUES (${ph})`).run(...row);
    }
  }
  if (mutate) mutate(db);
  if (addNew) {
    for (const t of NEW_TABLES) {
      db.run(`CREATE TABLE "${t}" (id INTEGER PRIMARY KEY, thesisId TEXT)`);
      const rows = addNew[t] ?? [];
      for (const row of rows) db.query(`INSERT INTO "${t}" VALUES (?, ?)`).run(...row);
    }
  }
  if (addUnexpected) db.run(`CREATE TABLE t_zzz (q TEXT)`);
  db.close();
  return path;
};

const dumpOf = (name, opts) => {
  const path = build(name, opts);
  const r = runDump(path);
  if (r.exit !== 0) throw new Error(`dump ${name} a échoué (exit ${r.exit}) : ${r.err}`);
  const out = `${DIR}/${name}.json`;
  writeFileSync(out, r.out);
  return out;
};

console.log("=== SUITE DE TESTS SYNTHÉTIQUES — comparateur de contenu (vagues 26 + 30 : A/B/D inchangés + série E v2.2) — bases en /tmp, AUCUNE base réelle ===\n");

// --- A. Indépendance de l'ordre physique ---
const dumpA = dumpOf("base", {});
const dumpB = dumpOf("base_reversed", { reverse: true });
{
  const a = JSON.parse(await Bun.file(dumpA).text());
  const b = JSON.parse(await Bun.file(dumpB).text());
  check("A1 empreinte globale identique (ordre d'insertion inverse)", a.globalContentSha256, b.globalContentSha256);
  const cmp = runCompare(dumpA, dumpB);
  check("A2 comparaison ordre-inverse → PASS/exit 0", "0|PASS", `${cmp.exit}|${cmp.json?.verdict}`);
}
// Couverture de types : vérifier la canonisation dans le vidage lui-même
{
  const a = JSON.parse(await Bun.file(dumpA).text());
  const ligneNulls = a.tables.t_nulls.rows.find((r) => JSON.parse(r)[0] === 1);
  check("A3 NULL canonisé en null distinct de ''", ligneNulls.includes("null"), true, ligneNulls);
  const ligneNums = a.tables.t_nums.rows.map((r) => JSON.parse(r));
  const zeroInt = ligneNums.find((r) => r[0] === 1);
  check("A4 INTEGER 0 / REAL 0 / TEXT '0' distincts", JSON.stringify(zeroInt) === `[1,0,0,"0"]`, true, JSON.stringify(zeroInt));
  const blob = a.tables.t_blobs.rows.map((r) => JSON.parse(r)).find((r) => r[0] === 2);
  check("A5 BLOB canonisé en base64 étiqueté", JSON.stringify(blob) === `[2,{"__blob_b64":"AP8="}]`, true, JSON.stringify(blob));
  const blobVide = a.tables.t_blobs.rows.map((r) => JSON.parse(r)).find((r) => r[0] === 1);
  check("A6 BLOB vide ≠ NULL", JSON.stringify(blobVide) === `[1,{"__blob_b64":""}]`, true, JSON.stringify(blobVide));
  const dup = a.tables.t_nopk.rows;
  check("A7 doublons identiques préservés (3 lignes, 2 identiques)", dup.length === 3 && dup[0] === dup[1], true, `${dup.length} lignes triées`);
}

// --- B. Faux positifs / faux négatifs ---
const cmpVariant = (label, opts, expectedExit, extra = null) => {
  const d = dumpOf(label, opts);
  const cmp = runCompare(dumpA, d);
  check(`B ${label} → ${expectedExit === 0 ? "PASS" : "FAIL"}/${expectedExit}`, `${expectedExit}|${expectedExit === 0 ? "PASS" : "FAIL"}`, `${cmp.exit}|${cmp.json?.verdict}`, extra?.(cmp) ?? cmp.json?.divergences?.[0]?.table);
};
cmpVariant("var_identique", {}, 0);
cmpVariant("var_cellule_modifiee", { mutate: (db) => db.run(`UPDATE t_nulls SET a='y' WHERE id=2`) }, 1, (c) => `note: ${c.json?.note?.slice(0, 60)}…`);
cmpVariant("var_ligne_supprimee", { mutate: (db) => db.run(`DELETE FROM t_nopk WHERE y=2`) }, 1);
cmpVariant("var_ligne_ajoutee", { mutate: (db) => db.query(`INSERT INTO t_nopk VALUES (?,?)`).run("dup", 1) }, 1);
cmpVariant("var_null_vers_chaine_vide", { mutate: (db) => db.run(`UPDATE t_nulls SET a='' WHERE id=1`) }, 1);
cmpVariant("var_blob_modifie", { mutate: (db) => db.run(`UPDATE t_blobs SET b=x'00fe' WHERE id=2`) }, 1);
cmpVariant("var_infinity", { mutate: (db) => db.run(`UPDATE t_nums SET r=9e999 WHERE id=3`) }, 1);

// Garde INTEGER hors plage JS-safe → refus de vidage (exit 2), aucune comparaison incertaine
{
  const path = `${DIR}/var_bigint.db`;
  const db = new Database(path);
  db.run(`CREATE TABLE t_big (v INTEGER)`);
  db.query(`INSERT INTO t_big VALUES (?)`).run(9007199254740993); // 2^53 → arrondi côté JS si lu tel quel
  db.close();
  const r = runDump(path);
  check("B garde INTEGER hors plage → REFUS exit 2", 2, r.exit, r.err.slice(0, 80));
}

// --- D. Scénario R2 (préexistantes + 5 nouvelles vides) ---
{
  const d = dumpOf("var_r2_ok", { addNew: {} });
  const cmp = runCompare(dumpA, d);
  check("D1 préexistantes + 5 nouvelles vides → PASS/exit 0", "0|PASS", `${cmp.exit}|${cmp.json?.verdict}`);
}
{
  const d = dumpOf("var_r2_non_vide", { addNew: { Article: [[1, "t1"]] } });
  const cmp = runCompare(dumpA, d);
  const detail = cmp.json?.checks?.find((x) => x.nom === "r4_nouvelles_tables_vides_si_presentes")?.detail;
  check("D2 nouvelle table non vide → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, detail);
}
{
  const d = dumpOf("var_r2_inattendue", { addNew: {}, addUnexpected: true });
  const cmp = runCompare(dumpA, d);
  const detail = cmp.json?.checks?.find((x) => x.nom === "r5_aucune_table_inattendue")?.detail;
  check("D3 table inattendue → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, detail);
}

// --- E. Ajouts de colonnes par le DDL gelé (vague 30 — comparateur v2.2, levée de gel ciblée) ---
// Les tables portent les NOMS RÉELS du DDL gelé (Chapter, Job) afin d'exercer la liste DDL_ADDED_COLUMNS du v2.2 :
// Chapter: ["stamp"] · ChapterVersion: ["stamp"] · Job: ["progress", "progressNote"] (doc 46 §3.1).
// Le vidage de référence est constitué avec l'outil de vidage gelé (resync-testdb-rows-dump.mjs, inchangé).
const buildTables = (name, tableDefs) => {
  const path = `${DIR}/${name}.db`;
  const db = new Database(path);
  for (const { name: tn, columns, rows } of tableDefs) {
    db.run(`CREATE TABLE "${tn}" (${columns.map(([c, ty]) => `"${c}" ${ty}`).join(", ")})`);
    for (const row of rows) {
      const ph = row.map(() => "?").join(", ");
      db.query(`INSERT INTO "${tn}" VALUES (${ph})`).run(...row);
    }
  }
  db.close();
  const r = runDump(path);
  if (r.exit !== 0) throw new Error(`dump ${name} a échoué (exit ${r.exit}) : ${r.err}`);
  const out = `${DIR}/${name}.json`;
  writeFileSync(out, r.out);
  return out;
};

const eDumpAvant = buildTables("e_avant", [
  { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"]], rows: [[1, "t1", 1], [2, "t2", 2]] },
  { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
]);
const motifDe = (cmp) => cmp.json?.divergences?.[0]?.motif;

// E1 — ajout PRÉVU par le DDL, toutes NULL → PASS (tolérance structurelle documentée)
{
  const d = buildTables("e1_ddl_ok", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"], ["stamp", "TEXT"]], rows: [[1, "t1", 1, null], [2, "t2", 2, null]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  const detail = cmp.json?.checks?.find((x) => x.nom === "r2bis_ajouts_structurels_ddl_uniquement")?.detail;
  check("E1 colonne DDL ajoutée, toutes NULL → PASS/exit 0", "0|PASS", `${cmp.exit}|${cmp.json?.verdict}`, detail);
}
// E2 — valeur NON NULL dans une colonne ajoutée → divergence réelle (colonne nullable sans défaut)
{
  const d = buildTables("e2_ddl_non_null", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"], ["stamp", "TEXT"]], rows: [[1, "t1", 1, null], [2, "t2", 2, "brouillon"]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  check("E2 valeur non null dans colonne ajoutée → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, motifDe(cmp));
}
// E2b — '' (chaîne vide) dans une colonne ajoutée → non null → FAIL (≠ NULL)
{
  const d = buildTables("e2b_ddl_vide", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"], ["stamp", "TEXT"]], rows: [[1, "t1", 1, ""], [2, "t2", 2, null]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  check("E2b chaîne vide '' dans colonne ajoutée → FAIL/exit 1 (≠ NULL)", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, motifDe(cmp));
}
// E3 — colonne ajoutée HORS DDL → FAIL
{
  const d = buildTables("e3_hors_ddl", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"], ["extra", "TEXT"]], rows: [[1, "t1", 1, null], [2, "t2", 2, null]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  check("E3 colonne ajoutée hors DDL → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, motifDe(cmp));
}
// E4 — colonne DDL INSÉRÉE au milieu (préfixe rompu — pas un ADD COLUMN) → FAIL
{
  const d = buildTables("e4_inseree", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["stamp", "TEXT"], ["title", "TEXT"], ["ord", "INTEGER"]], rows: [[1, null, "t1", 1], [2, null, "t2", 2]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  check("E4 colonne DDL insérée au milieu → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, motifDe(cmp));
}
// E5 — valeur préexistante MODIFIÉE malgré l'ajout DDL → FAIL (comparaison exacte maintenue)
{
  const d = buildTables("e5_valeur_modifiee", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"], ["stamp", "TEXT"]], rows: [[1, "t1", 1, null], [2, "T2", 2, null]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  check("E5 valeur préexistante modifiée + colonne DDL → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, `${motifDe(cmp)} (${cmp.json?.divergences?.[0]?.table})`);
}
// E6 — application DDL PARTIELLE (progress sans progressNote) → FAIL
{
  const d = buildTables("e6_ddl_partiel", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"]], rows: [[1, "t1", 1], [2, "t2", 2]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"], ["progress", "INTEGER"]], rows: [[1, null]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  check("E6 application DDL partielle → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, motifDe(cmp));
}
// E7 — DEUX colonnes DDL ajoutées (progress + progressNote), toutes NULL → PASS
{
  const d = buildTables("e7_ddl_double", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"]], rows: [[1, "t1", 1], [2, "t2", 2]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"], ["progress", "INTEGER"], ["progressNote", "TEXT"]], rows: [[1, null, null]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  const detail = cmp.json?.checks?.find((x) => x.nom === "r2bis_ajouts_structurels_ddl_uniquement")?.detail;
  check("E7 deux colonnes DDL ajoutées, toutes NULL → PASS/exit 0", "0|PASS", `${cmp.exit}|${cmp.json?.verdict}`, detail);
}
// E8 — ligne AJOUTÉE malgré la présence des colonnes DDL → FAIL (motif rowCount)
{
  const d = buildTables("e8_ligne_ajoutee", [
    { name: "Chapter", columns: [["id", "INTEGER PRIMARY KEY"], ["title", "TEXT"], ["ord", "INTEGER"], ["stamp", "TEXT"]], rows: [[1, "t1", 1, null], [2, "t2", 2, null], [3, "t3", 3, null]] },
    { name: "Job", columns: [["id", "INTEGER PRIMARY KEY"]], rows: [[1]] },
  ]);
  const cmp = runCompare(eDumpAvant, d);
  check("E8 ligne ajoutée + colonnes DDL présentes → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, `${motifDe(cmp)} (${cmp.json?.divergences?.[0]?.table})`);
}

// E9-E11 — RECONSTRUCTION CustomBookSkill du DDL gelé (v2.2 complément reprise — angle mort v2.1 sur table vide)
// Tolérance strictement encadrée : liste de colonnes EXACTE du DDL gelé + table VIDE des deux côtés obligatoire.
const erDumpAvant = buildTables("er_avant", [
  { name: "CustomBookSkill", columns: [["id", "TEXT PRIMARY KEY"], ["title", "TEXT"], ["author", "TEXT"], ["content", "TEXT"], ["tags", "TEXT"], ["createdAt", "DATETIME"], ["updatedAt", "DATETIME"]], rows: [] },
]);
{
  // E9 — reconstruction conforme au DDL gelé (10 colonnes exactes, 0 ligne des deux côtés) → PASS
  const d = buildTables("e9_rebuild_ok", [
    { name: "CustomBookSkill", columns: [["id", "TEXT PRIMARY KEY"], ["title", "TEXT"], ["author", "TEXT"], ["content", "TEXT"], ["tags", "TEXT"], ["description", "TEXT"], ["source", "TEXT"], ["enabled", "BOOLEAN"], ["createdAt", "DATETIME"], ["updatedAt", "DATETIME"]], rows: [] },
  ]);
  const cmp = runCompare(erDumpAvant, d);
  const detail = cmp.json?.checks?.find((x) => x.nom === "r2bis_ajouts_structurels_ddl_uniquement")?.detail;
  check("E9 reconstruction CustomBookSkill conforme au DDL, 0 ligne → PASS/exit 0", "0|PASS", `${cmp.exit}|${cmp.json?.verdict}`, detail);
}
{
  // E10 — reconstruction MAIS une ligne présente APRÈS → divergence réelle (l'INSERT de copie doit être fidèle)
  const d = buildTables("e10_rebuild_non_vide", [
    { name: "CustomBookSkill", columns: [["id", "TEXT PRIMARY KEY"], ["title", "TEXT"], ["author", "TEXT"], ["content", "TEXT"], ["tags", "TEXT"], ["description", "TEXT"], ["source", "TEXT"], ["enabled", "BOOLEAN"], ["createdAt", "DATETIME"], ["updatedAt", "DATETIME"]], rows: [["x", "t", null, "c", null, null, null, 0, "2026-01-01 00:00:00", "2026-01-01 00:00:00"]] },
  ]);
  const cmp = runCompare(erDumpAvant, d);
  check("E10 reconstruction avec ligne APRÈS (0 AVANT) → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, motifDe(cmp));
}
{
  // E11 — reconstruction avec liste de colonnes ≠ DDL gelé (enabled absente) → FAIL
  const d = buildTables("e11_rebuild_colonnes", [
    { name: "CustomBookSkill", columns: [["id", "TEXT PRIMARY KEY"], ["title", "TEXT"], ["author", "TEXT"], ["content", "TEXT"], ["tags", "TEXT"], ["description", "TEXT"], ["source", "TEXT"], ["createdAt", "DATETIME"], ["updatedAt", "DATETIME"]], rows: [] },
  ]);
  const cmp = runCompare(erDumpAvant, d);
  check("E11 reconstruction avec colonnes ≠ DDL → FAIL/exit 1", "1|FAIL", `${cmp.exit}|${cmp.json?.verdict}`, motifDe(cmp));
}

// Synthèse
const echecs = results.filter((r) => !r.ok);
console.log(`\n=== SYNTHÈSE : ${results.length - echecs.length}/${results.length} tests conformes aux attentes${echecs.length ? ` — ÉCHECS: ${echecs.map((e) => e.nom).join(", ")}` : " — SUITE VALIDÉE"} ===`);
process.exit(echecs.length ? 1 : 0);

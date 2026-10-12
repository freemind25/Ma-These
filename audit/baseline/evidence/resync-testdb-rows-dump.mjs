/* Vidage de CONTENU ligne à ligne, LECTURE SEULE — outil du runbook doc 46 (ré-synchronisation urbanisme-test.db).
 * v2 (revue technique vague 26) — Usage : bun audit/baseline/evidence/resync-testdb-rows-dump.mjs <chemin-base>
 * Sortie JSON sur stdout · exit 0 = vidage constitué · exit 2 = refus de vidage (cas non certifié) → ARRÊT.
 * Garanties : connexion readonly + PRAGMA query_only=1 → aucune écriture possible, y compris accidentelle.
 *
 * v1 (vague 25) : canonisation JSON par ligne (colonnes en ordre table_info, lignes triées lexicographiquement
 * → ordre déterministe indépendant du stockage physique), SHA-256 par table + empreinte globale.
 * v2 (vague 26 — revue du propriétaire) :
 *   - réels NON FINIS encodés de façon distincte (JSON.stringify(Infinity) = "null" entrerait en collision avec
 *     NULL → faux négatif) : {__real:"Infinity"|-Infinity|NaN} — note : SQLite stocke NaN comme NULL ;
 *   - GARDE de précision entière : les INTEGER hors plage JS-safe (|v| > 2^53-1) seraient arrondis à la lecture
 *     JS (bun:sqlite ne dispose ni de readBigInts ni de as("bigint") en 1.3.14) → détectés par une requête SQL
 *     exacte 64-bit (typeof(col)='integer' et hors plage) ; tout résultat non nul = REFUS de vidage (exit 2) ;
 *   - BLOB → base64 étiqueté {__blob_b64} ; -0.0 et 0.0 sont numériquement égaux (SQLite les compare égaux).
 * Comparaison APRÈS via resync-testdb-compare-contenu.mjs v2 (exit 0 = contenu identique, 1 = divergence → ARRÊT).
 * Motif (arbitrage du propriétaire, vague 25) : deux tables peuvent avoir le MÊME nombre de lignes tout en
 * contenant des données DIFFÉRENTES — la préservation se prouve sur le CONTENU, pas seulement les comptages.
 */
/* eslint-disable no-console */
import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";

const path = process.argv[2];
if (!path) {
  console.error("USAGE: bun resync-testdb-rows-dump.mjs <chemin-base>");
  process.exit(64);
}

const JS_SAFE_MAX = 9007199254740991n;

const canon = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") return `${v.toString()}n`;
  if (typeof v === "number" && !Number.isFinite(v)) return { __real: String(v) }; // collision avec NULL impossible désormais
  if (v instanceof Uint8Array) return { __blob_b64: Buffer.from(v).toString("base64") };
  return v;
};

const db = new Database(path, { readonly: true });
db.run("PRAGMA query_only = 1");

const tables = db
  .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((r) => r.name);

// GARDE v2 — précision entière : détection SQL exacte (64-bit) des INTEGER hors plage JS-safe.
// bun:sqlite 1.3.14 renvoie des number : une valeur hors plage serait arrondie SILENCIEUSEMENT (faux négatif).
// Refus explicite plutôt que comparaison incertaine.
const gardeHorsPlage = [];
for (const t of tables) {
  const cols = db.query(`PRAGMA table_info("${t}")`).all().map((c) => c.name);
  for (const c of cols) {
    const n = db
      .query(
        `SELECT COUNT(*) AS n FROM "${t}" WHERE typeof("${c}")='integer' AND ("${c}" > ${JS_SAFE_MAX} OR "${c}" < -${JS_SAFE_MAX})`,
      )
      .get().n;
    if (n > 0) gardeHorsPlage.push(`${t}.${c} (${n} valeur(s))`);
  }
}
if (gardeHorsPlage.length > 0) {
  console.error(
    `REFUS DE VIDAGE (exit 2) — INTEGER hors plage JS-safe détecté (précision JS non garantie) : ${gardeHorsPlage.join(", ")} — ARRÊT (runbook §6 : analyse + décision écrite).`,
  );
  db.close();
  process.exit(2);
}

const content = {};
for (const t of tables) {
  const cols = db.query(`PRAGMA table_info("${t}")`).all().map((c) => c.name);
  const select = `SELECT ${cols.map((c) => `"${c}"`).join(", ")} FROM "${t}"`;
  const rawRows = db.query(select).all();
  const canonRows = rawRows.map((r) => JSON.stringify(cols.map((c) => canon(r[c]))));
  canonRows.sort(); // ordre déterministe indépendant de l'ordre physique ; doublons identiques → adjacents égaux
  const sha256 = createHash("sha256").update(canonRows.join("\n")).digest("hex");
  content[t] = { columns: cols, rowCount: canonRows.length, rows: canonRows, sha256 };
}

const out = {
  timestamp: new Date().toISOString(),
  base: path,
  tool: "resync-testdb-rows-dump.mjs v2 (vague 26)",
  tableCount: tables.length,
  globalContentSha256: createHash("sha256")
    .update(tables.map((t) => `${t}:${content[t].sha256}`).join("\n"))
    .digest("hex"),
  tables: content,
};

console.log(JSON.stringify(out, null, 2));
db.close();

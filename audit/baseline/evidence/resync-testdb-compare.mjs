/* Comparateur structuré AVANT/APRÈS — runbook doc 46 (ré-synchronisation urbanisme-test.db, §4.3 / §5).
 * Usage : bun audit/baseline/evidence/resync-testdb-compare.mjs <inventaire-avant.json> <inventaire-après.json>
 * Sortie : verdict JSON sur stdout ; exit 0 = PASS, 1 = FAIL (bloquant → ARRÊT + restauration doc 46 §6).
 * Règles (gap additif doc 45 §2 / DDL gelé doc 46 §3.1) :
 *   - integrity_check = ok sur les deux inventaires ; foreign_key violations = 0 sur les deux ;
 *   - tables APRÈS = tables AVANT + exactement les 5 nouvelles (aucune table inattendue, aucune absente) ;
 *   - comptages IDENTIQUES sur chaque table préexistante (préservation table par table) ;
 *   - les 5 nouvelles tables = 0 ligne (créées vides) ;
 *   - les 6 index attendus sont présents APRÈS.
 */
/* eslint-disable no-console */
import process from "node:process";

const [avantPath, apresPath] = process.argv.slice(2);
if (!avantPath || !apresPath) {
  console.error("USAGE: bun resync-testdb-compare.mjs <avant.json> <apres.json>");
  process.exit(64);
}

const avant = JSON.parse(await Bun.file(avantPath).text());
const apres = JSON.parse(await Bun.file(apresPath).text());

const NEW_TABLES = ["Article", "ArticleVersion", "ImportedDoc", "LegalRef", "SoutenancePrep"];
const NEW_INDEXES = [
  "Article:Article_thesisId_idx",
  "ArticleVersion:ArticleVersion_articleId_idx",
  "ImportedDoc:ImportedDoc_thesisId_idx",
  "LegalRef:LegalRef_domaine_idx",
  "SoutenancePrep:SoutenancePrep_thesisId_key",
  "SoutenancePrep:SoutenancePrep_thesisId_idx",
];

const checks = [];
const add = (nom, ok, detail) => checks.push({ nom, ok, detail });

add("integrity_avant", avant.integrity_check.join(",") === "ok", avant.integrity_check.join(","));
add("integrity_apres", apres.integrity_check.join(",") === "ok", apres.integrity_check.join(","));
add("fk_avant_0", avant.foreign_key_violations === 0, String(avant.foreign_key_violations));
add("fk_apres_0", apres.foreign_key_violations === 0, String(apres.foreign_key_violations));

const expectedTables = [...avant.tables, ...NEW_TABLES].sort();
add(
  "tables_apres_conformes",
  JSON.stringify(apres.tables) === JSON.stringify(expectedTables),
  `APRÈS ${apres.tables.length} tables / attendu ${expectedTables.length}`,
);

const countDivergences = avant.tables.filter((t) => apres.counts[t] !== avant.counts[t]);
add(
  "comptages_preexistants_identiques",
  countDivergences.length === 0,
  countDivergences.length === 0
    ? `${avant.tables.length} tables comparées`
    : `divergences: ${countDivergences.map((t) => `${t} ${avant.counts[t]}→${apres.counts[t]}`).join(", ")}`,
);

const nouvellesNonVides = NEW_TABLES.filter((t) => (apres.counts[t] ?? -1) !== 0);
add(
  "nouvelles_tables_vides",
  nouvellesNonVides.length === 0,
  nouvellesNonVides.length === 0 ? NEW_TABLES.join(", ") : `non vides: ${nouvellesNonVides.join(", ")}`,
);

const indexManquants = NEW_INDEXES.filter((i) => !apres.indexes.includes(i));
add(
  "index_attendus_presents",
  indexManquants.length === 0,
  indexManquants.length === 0 ? `${NEW_INDEXES.length} index présents` : `manquants: ${indexManquants.join(", ")}`,
);

const verdict = checks.every((c) => c.ok) ? "PASS" : "FAIL";
console.log(JSON.stringify({ verdict, avant: avantPath, apres: apresPath, checks }, null, 2));
process.exitCode = verdict === "PASS" ? 0 : 1;

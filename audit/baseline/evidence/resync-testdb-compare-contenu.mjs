/* Comparateur de CONTENU AVANT/APRÈS (ligne à ligne) — runbook doc 46 §4.3bis (arbitrage du propriétaire, vague 25).
 * Usage :
 *   bun audit/baseline/evidence/resync-testdb-compare-contenu.mjs <vidage-avant.json> <vidage-après.json>
 * Sortie : verdict JSON sur stdout ; exit 0 = PASS (contenu identique), 1 = FAIL (bloquant → ARRÊT + restauration doc 46 §6).
 *
 * v2.2 — LEVÉE DE GEL CIBLÉE autorisée par écrit par le propriétaire après l'arrêt §4.3bis du 2026-10-11
 * (doc 49 option 1 ; décision consignée evidence/GO-REPRISE-COMPARATEUR-proprietaire-20261011.md) :
 *   - CAUSE RACINE du faux positif v2.1 (doc 49 §6) : le DDL GELÉ (resync-testdb-ddl-attendu.sql,
 *     SHA ab2c312b…e3355) ajoute 4 colonnes sur 3 tables préexistantes — Chapter.stamp, ChapterVersion.stamp,
 *     Job.progress + Job.progressNote (ALTER TABLE … ADD COLUMN, nullables, sans défaut). v2.1 comparait les
 *     lignes canonisées COLONNE PAR COLONNE : l'ajout de colonnes prévu par le DDL apparaissait donc comme une
 *     divergence de contenu, alors que toutes les valeurs préexistantes étaient intactes (preuve doc 49 §6).
 *   - CORRECTION (complétée au cours de la reprise — voir ci-dessous) : les SEULES différences structurelles
 *     tolérées sont celles du DDL gelé :
 *       (1) colonnes ajoutées par ALTER TABLE ADD COLUMN (DDL_ADDED_COLUMNS ci-dessous), à condition TOUTES
 *           vérifiées : (a) les colonnes AVANT restent un PRÉFIXE exact des colonnes APRÈS (sémantique ADD
 *           COLUMN de SQLite : ajout en fin de liste, ordre conservé) ; (b) les colonnes ajoutées correspondent
 *           EXACTEMENT à la liste du DDL gelé (application partielle = FAIL) ; (c) elles sont NULL sur TOUTES
 *           les lignes préexistantes (colonne nullable sans défaut — toute valeur non null, y compris '' =
 *           divergence réelle) ; (d) TOUTES les colonnes préexistantes restent comparées EXACTEMENT, ligne par
 *           ligne, valeur par valeur (aucun masquage possible) ;
 *       (2) RECONSTRUCTION CustomBookSkill (motif SQLite standard du DDL gelé §3bis — CREATE new_ → INSERT
 *           copie → DROP → RENAME), détectée par la v2.2 plus stricte lors de la reprise (angle mort de la
 *           v2.1 : aucune divergence de lignes n'était détectable sur une table VIDE). Tolérance strictement
 *           encadrée (DDL_REBUILT_COLUMNS) : la liste de colonnes APRÈS doit être EXACTEMENT celle produite
 *           par le DDL gelé, et la table doit être VIDE des DEUX côtés (0 ligne AVANT et APRÈS — toute ligne
 *           = divergence réelle). Vérification faite contre le DDL : colonnes et contraintes identiques,
 *           0 ligne des deux côtés (inventaire §2.7/§4.2).
 *   - La référence de DONNÉES (vidages) n'est PAS modifiée — la correction porte uniquement sur la logique de
 *     comparaison (consigne du propriétaire : « conserver le snapshot historique intact »).
 *   - R3 est recalculée sur les formes RESTREINTES aux colonnes préexistantes (les colonnes ajoutées sont
 *     structurelles). R1, R4, R5 et la note « COMPTAGES IDENTIQUES MAIS CONTENU DIVERGENT » sont inchangées.
 *
 * v2 — scénario R2 corrigé (revue du propriétaire, point D) : après push la base contient les 25 tables
 * préexistantes + 5 NOUVELLES créées vides ; le comparateur accepte exactement cet ajout (sinon faux positif
 * sur le scénario nominal), et vérifie séparément que les 5 nouvelles sont présentes ET vides (§4.4).
 * Règles (toutes bloquantes) :
 *   R1 — chaque table AVANT existe APRÈS ;
 *   R2 — contenu de chaque table préexistante IDENTIQUE ligne à ligne (valeurs colonne par colonne,
 *        comparaison exacte des lignes canonisées restreintes aux colonnes préexistantes, PAS seulement les SHA ;
 *        jusqu'à 5 divergences rapportées) ;
 *   R3 — empreinte globale recalculée des deux côtés, restreinte aux tables préexistantes ET aux colonnes
 *        préexistantes (recalculée des deux côtés) ;
 *   R4 — CONDITIONNELLE (v2.1) : si au moins l'une des 5 nouvelles tables est présente APRÈS, elles doivent
 *        être TOUTES présentes ET VIDES (rowCount 0) — comparaison post-push ; si AUCUNE n'est présente
 *        (comparaison AVANT/AVANT, contrôle de contenu pur sur base pré-push), la règle est satisfaite —
 *        la présence des 5 nouvelles et leur vacuité au post-push restent par ailleurs contrôlées par §4.2/§4.4
 *        (inventaire 30 tables + comptages) ; la présente règle les redouble dès qu'elles existent ;
 *   R5 — aucune table inattendue APRÈS (hors tables AVANT + les 5 nouvelles).
 * Note : le vidage AVANT doit être constitué AVANT le push (§2.7bis) — s'il contenait déjà l'une des 5
 * nouvelles tables, elle serait traitée comme préexistante (l'anomalie est de toute façon détectée en amont
 * par le contrôle §2.7 contre l'inventaire gelé resync-testdb-before.json).
 * Ce comparateur COMPLETE et ne remplace AUCUN autre contrôle (§4.1-4.7 : custom.db, intégrité, FK,
 * tables/index attendus, staging, drift ×2, garde-fou CI).
 */
/* eslint-disable no-console */
import process from "node:process";
import { createHash } from "node:crypto";

const [avantPath, apresPath] = process.argv.slice(2);
if (!avantPath || !apresPath) {
  console.error("USAGE: bun resync-testdb-compare-contenu.mjs <avant.json> <apres.json>");
  process.exit(64);
}

const NEW_TABLES = ["Article", "ArticleVersion", "ImportedDoc", "LegalRef", "SoutenancePrep"];

// v2.2 — Colonnes ajoutées par le DDL GELÉ (doc 46 §3.1 — resync-testdb-ddl-attendu.sql, SHA ab2c312b…e3355).
// Vérifiées conformes au DDL figé (prévol R2 : diff octet pour octet). SEULE tolérance structurelle du comparateur.
const DDL_ADDED_COLUMNS = {
  Chapter: ["stamp"],
  ChapterVersion: ["stamp"],
  Job: ["progress", "progressNote"],
};

// v2.2 (complément reprise) — Table RECONSTRUITE par le DDL gelé (motif SQLite 5 étapes, doc 46 §3bis) :
// liste EXACTE des colonnes APRÈS reconstruction (créées par CREATE TABLE "new_CustomBookSkill" du DDL gelé)
// + la table doit être VIDE des deux côtés (l'INSERT du DDL copie les lignes existantes — 0 ligne AVANT ⇒ 0 APRÈS).
const DDL_REBUILT_COLUMNS = {
  CustomBookSkill: ["id", "title", "author", "content", "tags", "description", "source", "enabled", "createdAt", "updatedAt"],
};

const avant = JSON.parse(await Bun.file(avantPath).text());
const apres = JSON.parse(await Bun.file(apresPath).text());

const checks = [];
const add = (nom, ok, detail) => checks.push({ nom, ok, detail });
const tablesAvant = Object.keys(avant.tables).sort();
const tablesApres = Object.keys(apres.tables).sort();

// R1 — tables préexistantes toutes présentes APRÈS
const manquantes = tablesAvant.filter((t) => !tablesApres.includes(t));
add(
  "r1_tables_preexistantes_presents",
  manquantes.length === 0,
  manquantes.length === 0 ? `${tablesAvant.length} tables préexistantes présentes APRÈS` : `absentes APRÈS: ${manquantes.join(", ")}`,
);

// R2 — contenu identique ligne à ligne sur chaque table préexistante (v2.2 : tolérance structurelle DDL uniquement)
const divergences = [];
let comptagesTousIdentiques = true;
const structurellesAcceptees = [];
const shaRestreinteApres = {}; // SHA recalculé sur les colonnes préexistantes uniquement (pour R3)
for (const t of tablesAvant) {
  const a = avant.tables[t];
  const b = apres.tables[t];
  if (!b) continue;
  shaRestreinteApres[t] = b.sha256; // défaut (cas sans ajout : recalcul identique) ; écrasé ci-dessous si applicable
  const allowed = DDL_ADDED_COLUMNS[t] ?? [];

  // (0) v2.2 complément — table RECONSTRUITE par le DDL gelé (liste exacte + VIDE des deux côtés obligatoire)
  const rebuiltAttendu = DDL_REBUILT_COLUMNS[t];
  if (rebuiltAttendu) {
    const colonnesOk = b.columns.join("\u0000") === rebuiltAttendu.join("\u0000");
    const sousSequence = a.columns.every((c) => rebuiltAttendu.includes(c)) &&
      (() => { let k = 0; for (const c of a.columns) { k = rebuiltAttendu.indexOf(c, k); if (k === -1) return false; k++; } return true; })();
    if (!colonnesOk || !sousSequence) {
      divergences.push({
        table: t,
        motif: "colonnes",
        detail: "reconstruction DDL : liste de colonnes APRÈS ≠ liste exacte produite par le DDL gelé (ou colonnes préexistantes non conservées dans l'ordre)",
        avant: a.columns,
        attenduApres: rebuiltAttendu,
        apres: b.columns,
      });
      continue;
    }
    if (a.rowCount !== 0 || b.rowCount !== 0) {
      comptagesTousIdentiques = false;
      divergences.push({
        table: t,
        motif: "table_reconstruite_non_vide",
        detail: `reconstruction DDL : lignes AVANT=${a.rowCount} / APRÈS=${b.rowCount} — l'INSERT de copie du DDL doit reproduire EXACTEMENT les lignes existantes (0 attendu des deux côtés) — divergence réelle`,
        avant: a.rowCount,
        apres: b.rowCount,
      });
      continue;
    }
    structurellesAcceptees.push(`${t}: reconstruite selon DDL gelé (3 colonnes ajoutées: description, source, enabled) — 0 ligne AVANT et APRÈS`);
    continue; // table vide des deux côtés : aucune donnée à comparer
  }

  // (i) structure — préfixe exact (colonnes AVANT intactes, dans l'ordre)
  const prefixeOk = b.columns.length >= a.columns.length && a.columns.every((c, i) => b.columns[i] === c);
  if (!prefixeOk) {
    divergences.push({
      table: t,
      motif: "colonnes",
      detail: "colonnes préexistantes absentes ou réordonnées (la liste AVANT doit être un préfixe exact de la liste APRÈS)",
      avant: a.columns,
      apres: b.columns,
    });
    continue;
  }
  const addedCols = b.columns.slice(a.columns.length);

  // (ii) les ajouts constatés doivent correspondre EXACTEMENT au DDL gelé (application partielle = FAIL)
  if (addedCols.length > 0 && addedCols.join("\u0000") !== allowed.join("\u0000")) {
    const partiel = addedCols.length < allowed.length && allowed.slice(0, addedCols.length).join("\u0000") === addedCols.join("\u0000");
    divergences.push({
      table: t,
      motif: "colonnes",
      detail: partiel
        ? `application DDL partielle : ajoutées [${addedCols.join(", ")}] ≠ autorisées par le DDL gelé [${allowed.join(", ")}]`
        : `colonnes ajoutées [${addedCols.join(", ")}] ≠ colonnes autorisées par le DDL gelé [${allowed.join(", ")}] (ou ajout hors DDL)`,
      avant: a.columns,
      apres: b.columns,
    });
    continue;
  }
  if (addedCols.length > 0) structurellesAcceptees.push(`${t}: +${addedCols.join(", +")} (DDL gelé §3.1)`);

  // (iii) colonnes ajoutées → NULL obligatoire sur toutes les lignes préexistantes (nullable, sans défaut)
  if (addedCols.length > 0) {
    const idxAjoutees = addedCols.map((c) => b.columns.indexOf(c));
    const nonNull = [];
    for (let i = 0; i < b.rows.length && nonNull.length < 3; i++) {
      const v = JSON.parse(b.rows[i]);
      for (const j of idxAjoutees) {
        if (v[j] !== null) nonNull.push({ ligneTriee: i, colonne: b.columns[j], valeur: v[j] });
      }
    }
    if (nonNull.length > 0) {
      divergences.push({
        table: t,
        motif: "colonne_ajoutee_non_null",
        detail: "valeur NON NULL dans une colonne ajoutée par le DDL gelé (attendu : null sur toutes les lignes préexistantes — colonne nullable sans défaut) — divergence réelle",
        exemples: nonNull,
      });
      continue;
    }
  }

  // (iv) comparaison EXACTE ligne à ligne, restreinte aux colonnes préexistantes
  if (a.rowCount !== b.rowCount) {
    comptagesTousIdentiques = false;
    divergences.push({ table: t, motif: "rowCount", avant: a.rowCount, apres: b.rowCount });
    continue;
  }
  const rowsRestreintes = b.rows.map((r) => JSON.stringify(JSON.parse(r).slice(0, a.columns.length)));
  rowsRestreintes.sort(); // re-tri dans l'espace de clés préexistant (l'ajout de colonnes peut modifier l'ordre lexicographique)
  const shaA = createHash("sha256").update(a.rows.join("\n")).digest("hex");
  const shaB = createHash("sha256").update(rowsRestreintes.join("\n")).digest("hex");
  shaRestreinteApres[t] = shaB;
  for (let i = 0; i < a.rows.length; i++) {
    if (a.rows[i] !== rowsRestreintes[i]) {
      divergences.push({ table: t, motif: "contenu", ligneTriee: i, avant: a.rows[i], apres: rowsRestreintes[i] });
      break; // une divergence rapportée par table suffit
    }
  }
  if (!divergences.some((d) => d.table === t) && shaA !== shaB) {
    divergences.push({ table: t, motif: "sha", avant: shaA, apres: shaB });
  }
}
add(
  "r2_contenu_preexistant_identique",
  divergences.length === 0,
  divergences.length === 0
    ? `${tablesAvant.length} tables — contenu ligne à ligne identique (colonnes préexistantes comparées exactement)`
    : `${divergences.length} table(s) divergente(s)`,
);
// v2.2 — transparence : consigner les tolérances structurelles réellement appliquées (déjà garanties ⊆ DDL gelé)
add(
  "r2bis_ajouts_structurels_ddl_uniquement",
  true,
  structurellesAcceptees.length === 0
    ? "aucune colonne ajoutée — comparaison strictement structurellement identique"
    : structurellesAcceptees.join(" · "),
);

// R3 — empreinte globale recalculée des deux côtés, restreinte aux tables préexistantes ET aux colonnes préexistantes
const globalOf = (tables, shaOf) =>
  createHash("sha256")
    .update(
      tables
        .filter((t) => shaOf(t) !== undefined)
        .map((t) => `${t}:${shaOf(t)}`)
        .join("\n"),
    )
    .digest("hex");
const gAvant = globalOf(tablesAvant, (t) => avant.tables[t]?.sha256);
const gApres = globalOf(tablesAvant, (t) => shaRestreinteApres[t]);
add("r3_empreinte_globale_preexistante_identique", gAvant === gApres, `${gAvant} vs ${gApres}`);

// R4 (conditionnelle v2.1) — nouvelles tables : présentes → toutes présentes et vides ; absentes → règle satisfaite
const nouvellesPresents = NEW_TABLES.filter((t) => apres.tables[t]);
const nouvellesAbsentes = NEW_TABLES.filter((t) => !apres.tables[t]);
const nouvellesProblemes =
  nouvellesPresents.length === 0
    ? []
    : [
        ...nouvellesAbsentes.map((t) => `${t}: ABSENTE (partielle — les autres sont présentes)`),
        ...nouvellesPresents
          .map((t) => {
            const b = apres.tables[t];
            return b.rowCount !== 0 ? `${t}: ${b.rowCount} ligne(s) (attendu 0)` : null;
          })
          .filter(Boolean),
      ];
add(
  "r4_nouvelles_tables_vides_si_presentes",
  nouvellesProblemes.length === 0,
  nouvellesProblemes.length === 0
    ? nouvellesPresents.length === 0
      ? "aucune nouvelle table présente (comparaison de contenu pré-push) — présence+vacuité au post-push contrôlées par §4.2/§4.4"
      : `${NEW_TABLES.length} nouvelles tables présentes et vides`
    : nouvellesProblemes.join(" · "),
);

// R5 — aucune table inattendue APRÈS
const inattendues = tablesApres.filter((t) => !tablesAvant.includes(t) && !NEW_TABLES.includes(t));
add(
  "r5_aucune_table_inattendue",
  inattendues.length === 0,
  inattendues.length === 0 ? "aucune table hors préexistantes + 5 nouvelles" : `inattendues: ${inattendues.join(", ")}`,
);

const verdict = checks.every((c) => c.ok) ? "PASS" : "FAIL";
const note =
  verdict === "FAIL" && comptagesTousIdentiques && divergences.length > 0
    ? "COMPTAGES IDENTIQUES MAIS CONTENU DIVERGENT — cas exact signalé par le propriétaire (vague 25) : la vérification de comptages seule est insuffisante"
    : undefined;
console.log(
  JSON.stringify({ verdict, outil: "resync-testdb-compare-contenu.mjs v2.2 (levée de gel ciblée, vague 30)", avant: avantPath, apres: apresPath, note, divergences: divergences.slice(0, 5), checks }, null, 2),
);
process.exitCode = verdict === "PASS" ? 0 : 1;

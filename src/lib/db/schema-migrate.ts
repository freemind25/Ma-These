// ═══════════════════════════════════════════════════════════════
// C2-E3 — Migration de schéma SQLite à la mise à jour de l'app.
// Historique (audit 2026-10-16) : lib.rs ne copiait le template de
// base que si le fichier était ABSENT (if !db_path.exists) → une
// base d'une version antérieure n'était JAMAIS migrée → P2021/P2022
// silencieux au premier lancement après mise à jour (écart E3,
// gravité haute — c'est le scénario même d'une release R2).
//
// Stratégie NON destructive : comparer la structure de la base
// utilisateur au TEMPLATE embarqué (ressource db/custom.db, livré à
// jour avec chaque version de l'app, passé via TAURI_TEMPLATE_DB)
// et appliquer le DIFF en DDL idempotents :
//   1. CREATE TABLE IF NOT EXISTS  (tables manquantes)
//   2. ALTER TABLE ADD COLUMN      (colonnes manquantes)
//   3. CREATE INDEX IF NOT EXISTS  (index manquants)
// — après sauvegarde du fichier .db (jamais d'écrasement de données).
// Appelé depuis src/instrumentation.ts (boot du serveur, AVANT le
// worker de jobs qui bouclait sur P2021 en cas de base obsolète).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { PrismaClient } from "@prisma/client";

const SKIP_TABLES = new Set(["_app_meta", "_prisma_migrations"]);

interface TableInfo {
  name: string;
  sql: string | null;
}

interface ColumnInfo {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

interface IndexInfo {
  name: string;
  sql: string | null;
}

function dbFileFromUrl(url: string | undefined): string | null {
  if (!url || !url.startsWith("file:")) return null;
  return url.slice("file:".length);
}

async function listTables(client: PrismaClient): Promise<TableInfo[]> {
  return client.$queryRawUnsafe<TableInfo[]>(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
}

async function listIndexes(client: PrismaClient): Promise<IndexInfo[]> {
  return client.$queryRawUnsafe<IndexInfo[]>(
    "SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND sql != ''"
  );
}

async function listColumns(
  client: PrismaClient,
  table: string
): Promise<ColumnInfo[]> {
  // NB : « notnull » est refusé comme identifiant nu dans un SELECT
  // (parsé comme les tokens NOT NULL) → SELECT * sur la table-valuée.
  return client.$queryRawUnsafe<ColumnInfo[]>(
    `SELECT * FROM pragma_table_info('${table.replace(/'/g, "''")}')`
  );
}

/** DEFAULT de repli pour une colonne NOT NULL sans défaut explicite (SQLite refuse sinon). */
function defaultFor(type: string): string {
  const t = type.toUpperCase();
  if (t.includes("INT") || t.includes("REAL") || t.includes("FLOA") || t.includes("DOUB") || t.includes("NUM") || t.includes("DEC")) {
    return "0";
  }
  return "''";
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

export async function ensureSchemaUpToDate(): Promise<void> {
  const userDbFile = dbFileFromUrl(process.env.DATABASE_URL);
  const templateDbFile = dbFileFromUrl(process.env.TAURI_TEMPLATE_DB);

  // Dev / sandbox : pas de template Tauri → rien à faire.
  if (!userDbFile || !templateDbFile) return;
  if (!fs.existsSync(templateDbFile)) {
    console.warn("[schema-migrate] C2-E3: template introuvable:", templateDbFile);
    return;
  }
  if (!fs.existsSync(userDbFile)) {
    console.warn(
      "[schema-migrate] C2-E3: base utilisateur absente — lib.rs copie le template, rien à migrer."
    );
    return;
  }

  const user = new PrismaClient({
    datasources: { db: { url: `file:${userDbFile}` } },
  });
  const template = new PrismaClient({
    datasources: { db: { url: `file:${templateDbFile}` } },
  });

  try {
    const [userTables, tplTables, tplIndexes] = await Promise.all([
      listTables(user),
      listTables(template),
      listIndexes(template),
    ]);

    const userTableNames = new Set(userTables.map((t) => t.name));

    // 1. Tables manquantes
    const missingTables = tplTables.filter(
      (t) => !SKIP_TABLES.has(t.name) && !userTableNames.has(t.name)
    );

    // 2. Colonnes manquantes sur les tables communes
    const missingColumns: { table: string; column: ColumnInfo }[] = [];
    const commonTables = tplTables.filter(
      (t) => !SKIP_TABLES.has(t.name) && userTableNames.has(t.name)
    );
    for (const t of commonTables) {
      const [userCols, tplCols] = await Promise.all([
        listColumns(user, t.name),
        listColumns(template, t.name),
      ]);
      const userColNames = new Set(userCols.map((c) => c.name));
      for (const c of tplCols) {
        if (!userColNames.has(c.name)) missingColumns.push({ table: t.name, column: c });
      }
    }

    // 3. Index manquants (les index sont des entrées sqlite_master séparées
    //    du CREATE TABLE — ils ne viennent pas « avec » la table recréée)
    const userIndexes = await listIndexes(user);
    const userIndexNames = new Set(userIndexes.map((i) => i.name));
    const missingIndexes = tplIndexes.filter(
      (i) => !userIndexNames.has(i.name) && !SKIP_TABLES.has(i.name)
    );

    const needsMigration =
      missingTables.length > 0 ||
      missingColumns.length > 0 ||
      missingIndexes.length > 0;

    if (!needsMigration) {
      console.warn("[schema-migrate] C2-E3: schéma à jour (aucun diff).");
      return;
    }

    console.warn(
      `[schema-migrate] C2-E3: diff détecté — ${missingTables.length} table(s), ${missingColumns.length} colonne(s), ${missingIndexes.length} index(s) à ajouter.`
    );

    // Sauvegarde AVANT toute écriture — jamais destructif.
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const backupFile = `${userDbFile}.sauvegarde-pre-update-${stamp}`;
    fs.copyFileSync(userDbFile, backupFile);
    console.log(`[schema-migrate] C2-E3: sauvegarde → ${backupFile}`);

    let applied = 0;

    for (const t of missingTables) {
      let ddl = t.sql ?? "";
      if (ddl && !/IF\s+NOT\s+EXISTS/i.test(ddl)) {
        ddl = ddl.replace(/^\s*CREATE\s+TABLE/i, "CREATE TABLE IF NOT EXISTS");
      }
      if (ddl) {
        await user.$executeRawUnsafe(ddl);
        applied++;
        console.log(`[schema-migrate] C2-E3: +table ${t.name}`);
      }
    }

    for (const { table, column } of missingColumns) {
      const notNull = column.notnull ? " NOT NULL" : "";
      const dflt =
        column.dflt_value != null
          ? ` DEFAULT ${column.dflt_value}`
          : notNull
            ? ` DEFAULT ${defaultFor(column.type)}`
            : "";
      await user.$executeRawUnsafe(
        `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent(column.name)} ${column.type}${notNull}${dflt}`
      );
      applied++;
      console.log(`[schema-migrate] C2-E3: +colonne ${table}.${column.name}`);
    }

    for (const i of missingIndexes) {
      let ddl = i.sql ?? "";
      if (ddl && !/IF\s+NOT\s+EXISTS/i.test(ddl)) {
        if (/^\s*CREATE\s+UNIQUE\s+INDEX/i.test(ddl)) {
          ddl = ddl.replace(/^\s*CREATE\s+UNIQUE\s+INDEX/i, "CREATE UNIQUE INDEX IF NOT EXISTS");
        } else {
          ddl = ddl.replace(/^\s*CREATE\s+INDEX/i, "CREATE INDEX IF NOT EXISTS");
        }
      }
      if (ddl) {
        await user.$executeRawUnsafe(ddl);
        applied++;
        console.log(`[schema-migrate] C2-E3: +index ${i.name}`);
      }
    }

    // Marqueur de version (suivi/diagnostic) : mtime du template qui a servi.
    await user.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "_app_meta" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL)`
    );
    const tplStat = fs.statSync(templateDbFile);
    await user.$executeRawUnsafe(
      `INSERT OR REPLACE INTO "_app_meta" ("key", "value") VALUES ('schemaVersion', '${tplStat.mtime.toISOString()}')`
    );

    console.log(`[schema-migrate] C2-E3: migration terminée (${applied} DDL appliqués).`);
  } catch (e) {
    // Ne bloque pas le démarrage : les routes renverront des 503 explicites
    // (C2-E2) et l'utilisateur verra le problème au lieu d'un silence.
    console.error("[schema-migrate] C2-E3: ÉCHEC de la migration de schéma:", e);
    console.error(
      "[schema-migrate] L'application continue, mais certaines opérations peuvent échouer avec un message explicite."
    );
  } finally {
    await user.$disconnect().catch(() => {});
    await template.$disconnect().catch(() => {});
  }
}

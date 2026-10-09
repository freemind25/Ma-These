// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Restauration de la base (C-1 / AUD-GOV-001)
//
// Usage :
//   bun scripts/restore-db.ts <sauvegarde.db> [--target file:/chemin/base.db]
//   (cible par défaut : file:<cwd>/db/custom.db)
//
// Procédure sécurisée :
//   1. copie de sécurité de la base courante (.pre-restore-<ts>)
//   2. écrasement par la sauvegarde
//   3. vérification : PRAGMA integrity_check + comptage ImportedDoc
//
// ⚠️ Pour restaurer la base LIVE, arrêter d'abord le serveur dev
//    (cf. docs/SAUVEGARDE-RESTAURATION.md). Avec --target vers un
//    répertoire de test, aucune coordination nécessaire.
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

async function main() {
  const args = process.argv.slice(2);
  const backup = args[0];
  const targetIdx = args.indexOf("--target");
  const targetUrl =
    targetIdx >= 0 && args[targetIdx + 1]
      ? args[targetIdx + 1]
      : `file:${path.join(process.cwd(), "db", "custom.db")}`;

  if (!backup) {
    console.error(
      "usage: bun scripts/restore-db.ts <backup.db> [--target file:/chemin/base.db]"
    );
    process.exit(2);
  }
  if (!fs.existsSync(backup)) {
    console.error("RESTORE_FAILED : sauvegarde introuvable :", backup);
    process.exit(1);
  }

  const targetPath = targetUrl.replace(/^file:/, "");
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  // 1) copie de sécurité de l'existant (jamais d'écrasement aveugle)
  let safetyCopy: string | null = null;
  if (fs.existsSync(targetPath)) {
    safetyCopy = `${targetPath}.pre-restore-${Date.now()}`;
    fs.copyFileSync(targetPath, safetyCopy);
  }

  // 2) restauration
  fs.copyFileSync(backup, targetPath);

  // 3) vérification sur le fichier restauré
  const db = new PrismaClient({
    datasources: { db: { url: `file:${targetPath}` } },
  });
  const integrity = await db.$queryRawUnsafe<{ integrity_check: string }[]>(
    `PRAGMA integrity_check`
  );
  const docs = await db.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT COUNT(*) AS n FROM ImportedDoc`
  );
  const theses = await db.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT COUNT(*) AS n FROM Thesis`
  );
  await db.$disconnect();

  console.log(
    JSON.stringify(
      {
        restored: targetPath,
        from: backup,
        safetyCopy,
        integrity: integrity[0]?.integrity_check ?? "UNKNOWN",
        importedDocs: Number(docs[0]?.n ?? 0),
        theses: Number(theses[0]?.n ?? 0),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(
    "RESTORE_FAILED",
    e instanceof Error ? e.message : e
  );
  process.exit(1);
});

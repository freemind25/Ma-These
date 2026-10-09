// ThesisFrame — Sauvegarde de la base SQLite (cycle audit-remediation-p1, C-1 / AUD-GOV-001)
// Usage : bun scripts/backup-db.ts /chemin/vers/custom-YYYYMMDD-HHMM.db
// Mécanisme : SQLite VACUUM INTO = snapshot cohérent à chaud (serveur en marche),
// compacté, atomique — ne modifie PAS la base live.
import { PrismaClient } from '@prisma/client';

async function main() {
  const dest = process.argv[2];
  if (!dest || !dest.endsWith('.db')) {
    console.error('usage: bun scripts/backup-db.ts <dest.db>');
    process.exit(2);
  }
  const db = new PrismaClient();
  try {
    await db.$executeRawUnsafe(`VACUUM INTO '${dest}'`);
    console.log('BACKUP_OK', dest);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error('BACKUP_FAILED', e instanceof Error ? e.message : e);
  process.exit(1);
});

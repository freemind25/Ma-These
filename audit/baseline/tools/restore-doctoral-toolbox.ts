/**
 * T5 — Restauration (ROLLBACK) du résidu DoctoralToolbox depuis l'export JSON
 * ═══════════════════════════════════════════════════════════════════════════
 * Statut : script PRÊT mais NE DOIT ÊTRE EXÉCUTÉ qu'en cas de rollback explicite
 * après une suppression (voir audit/baseline/19_RESIDU_DOCTORALTOOLBOX.md §3.4).
 *
 * Principe : ré-insertion à l'IDENTIQUE de la ligne exportée par
 * residu-doctoral-toolbox-export.json (même id, même thesisId, mêmes valeurs
 * brutes checklist/milestones/documents/contacts/notes, même createdAt).
 *
 * Garanties :
 *  - Mode DRY-RUN par défaut ; l'exécution réelle exige `--execute`.
 *  - Refuse de s'exécuter si une ligne existe déjà avec le même id OU le même
 *    thesisId (create simple, JAMAIS d'upsert).
 *  - Vérifie que la thèse cible existe (clé étrangère).
 *  - Contrôle post : les 5 champs re-lus sont identiques octet pour octet à
 *    l'export (sinon échec explicite).
 *  - Seule limite connue : `updatedAt` est porté par @updatedAt (Prisma) et
 *    vaudra l'horodatage de la restauration — comportement normal, documenté.
 *  - DATABASE_URL est lu depuis l'environnement ou .env et jamais journalisé
 *    (variable explicite = répétition possible sur une COPIE de la base).
 *
 * Usage :
 *   bun run audit/baseline/tools/restore-doctoral-toolbox.ts             (dry-run)
 *   bun run audit/baseline/tools/restore-doctoral-toolbox.ts --execute   (réel)
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dir, "..", "..", "..");
const EXPORT_PATH = resolve(PROJECT_ROOT, "audit/baseline/evidence/residu-doctoral-toolbox-export.json");
const EXECUTE = process.argv.includes("--execute");

type ExportRow = {
  id: string;
  thesisId: string;
  createdAt: string;
  raw: { checklist: string; milestones: string; documents: string; contacts: string; notes: string };
};

function fail(msg: string): never {
  console.error(`[ABANDON] ${msg}`);
  process.exit(1);
}

// ── 0. DATABASE_URL (lu, jamais journalisé) ──
// Priorité : variable d'environnement explicite (permet une répétition sur COPIE
// de la base) sinon .env du projet.
if (!process.env.DATABASE_URL) {
  const envText = readFileSync(resolve(PROJECT_ROOT, ".env"), "utf8");
  const m = envText.match(/^DATABASE_URL=(.*)$/m);
  if (!m || !m[1].trim()) fail("DATABASE_URL introuvable (ni env, ni .env)");
  process.env.DATABASE_URL = m[1].trim();
}

// ── 1. Export de référence ──
const evidence = JSON.parse(readFileSync(EXPORT_PATH, "utf8"));
if (!Array.isArray(evidence.rows) || evidence.rows.length !== 1) fail("l'export doit contenir exactement 1 ligne");
const ref: ExportRow = evidence.rows[0];

const prisma = new PrismaClient();

async function main() {
  console.log(`[MODE] ${EXECUTE ? "EXÉCUTION RÉELLE (--execute)" : "DRY-RUN (aucune écriture)"}`);
  console.log(`[CIBLE] id=${ref.id} thesisId=${ref.thesisId} (createdAt exporté : ${ref.createdAt})`);

  // ── 2. Pré-vol : aucune ligne existante (même id ou même thesisId), thèse présente ──
  const existingById = await prisma.doctoralToolbox.findUnique({ where: { id: ref.id } });
  if (existingById) fail("une ligne avec le même id existe déjà — restauration inutile ou export obsolète");
  const existingByThesis = await prisma.doctoralToolbox.findUnique({ where: { thesisId: ref.thesisId } });
  if (existingByThesis) fail("une toolbox existe déjà pour cette thèse (thesisId unique) — restauration refusée (pas d'upsert)");
  const thesis = await prisma.thesis.findUnique({ where: { id: ref.thesisId }, select: { id: true, title: true } });
  if (!thesis) fail(`thèse ${ref.thesisId} introuvable — clé étrangère violée`);
  console.log(`[THÈSE] "${thesis.title}" présente — restauration possible`);

  // ── 3. Ré-insertion à l'identique ──
  if (EXECUTE) {
    const created = await prisma.doctoralToolbox.create({
      data: {
        id: ref.id,
        thesisId: ref.thesisId,
        checklist: ref.raw.checklist,
        milestones: ref.raw.milestones,
        documents: ref.raw.documents,
        contacts: ref.raw.contacts,
        notes: ref.raw.notes,
        createdAt: new Date(ref.createdAt),
      },
    });
    console.log(`[CREATE] ligne restaurée id=${created.id}`);
  } else {
    console.log("[DRY-RUN] ré-insertion simulée (create avec id/thesisId/5 champs bruts/createdAt de l'export)");
  }

  // ── 4. Contrôles post : identité octet pour octet avec l'export ──
  const back = await prisma.doctoralToolbox.findUnique({ where: { id: ref.id } });
  if (!back) fail("ligne introuvable après restauration");
  const checks: [string, boolean][] = [
    ["checklist", back.checklist === ref.raw.checklist],
    ["milestones", back.milestones === ref.raw.milestones],
    ["documents", back.documents === ref.raw.documents],
    ["contacts", back.contacts === ref.raw.contacts],
    ["notes", back.notes === ref.raw.notes],
  ];
  for (const [name, ok] of checks) console.log(`[POST] champ ${name} : ${ok ? "IDENTIQUE" : "DIFFÉRENT"}`);
  if (checks.some(([, ok]) => !ok)) fail("contenu restauré ≠ export — investiguer");
  const total = await prisma.doctoralToolbox.count();
  console.log(`[POST] DoctoralToolbox count = ${total} (attendu 1)`);
  console.log(`[NOTE] updatedAt restauré = ${back.updatedAt.toISOString()} (porté par @updatedAt — horodatage de la restauration, seul champ non restaurable par conception Prisma)`);
  console.log(EXECUTE ? "[FIN] restauration conforme" : "[FIN] dry-run terminé, AUCUNE écriture effectuée");
}

main()
  .catch((e) => { console.error("[ERREUR]", e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());

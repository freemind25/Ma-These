/**
 * T5 — Suppression ciblée du résidu DoctoralToolbox (PROPOSÉE — NON EXÉCUTÉE)
 * ═══════════════════════════════════════════════════════════════════════════
 * Statut : script PRÊT mais NE DOIT ÊTRE EXÉCUTÉ qu'après décision explicite du
 * propriétaire (voir audit/baseline/19_RESIDU_DOCTORALTOOLBOX.md §3).
 *
 * Cible : l'unique ligne DoctoralToolbox de db/custom.db, identifiée comme
 * résidu d'auto-création applicative (AUD-ISO-003), contenu = template
 * INITIAL_* pur (preuve : audit/baseline/evidence/residu-doctoral-toolbox-export.json).
 *
 * Garanties :
 *  - Mode DRY-RUN par défaut. La suppression réelle exige le drapeau `--execute`.
 *  - Suppression par id EXACT + thesisId EXACT (deleteMany à double critère ;
 *    le décompte supprimé doit valoir exactement 1).
 *  - Garde anti-données-utilisateur : avant toute suppression, les 5 champs de
 *    la ligne en base sont comparés octet par octet à l'export JSON de
 *    référence. TOUT écart = ABANDON (la ligne contiendrait autre chose que le
 *    template — re-caractériser avant toute décision).
 *  - Aucune autre table lue ou écrite ; aucune valeur de secret manipulée.
 *  - DATABASE_URL est lu depuis l'environnement ou .env et jamais journalisé.
 *    Une variable explicite permet la répétition sur une COPIE de la base
 *    (répétition recommandée avant toute exécution réelle, cf. §3.1).
 *
 * Usage :
 *   bun run audit/baseline/tools/delete-doctoral-toolbox.ts             (dry-run)
 *   bun run audit/baseline/tools/delete-doctoral-toolbox.ts --execute   (réel)
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dir, "..", "..", "..");
const EXPORT_PATH = resolve(PROJECT_ROOT, "audit/baseline/evidence/residu-doctoral-toolbox-export.json");
const EXECUTE = process.argv.includes("--execute");

// ── Constantes de ciblage (issues de la caractérisation T5, lecture seule 2026-10-10) ──
const EXPECTED_ID = "cmv26kryu001oq7vhdotgwrc1";
const EXPECTED_THESIS_ID = "cmsmyrdfs0000pa2sews4vo90";

type ExportRow = {
  id: string;
  thesisId: string;
  raw: { checklist: string; milestones: string; documents: string; contacts: string; notes: string };
};

function fail(msg: string): never {
  console.error(`[ABANDON] ${msg}`);
  process.exit(1);
}

// ── 0. DATABASE_URL (lu, jamais journalisé) ──
// Priorité : variable d'environnement explicite (permet une répétition sur COPIE
// de la base, ex. DATABASE_URL="file:/tmp/copie.db" bun run ...) sinon .env du projet.
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
if (ref.id !== EXPECTED_ID || ref.thesisId !== EXPECTED_THESIS_ID) {
  fail(`export incohérent avec les constantes (export id=${ref.id}, thesisId=${ref.thesisId})`);
}
const refFields = ref.raw;

const prisma = new PrismaClient();

async function main() {
  console.log(`[MODE] ${EXECUTE ? "EXÉCUTION RÉELLE (--execute)" : "DRY-RUN (aucune écriture)"}`);

  // ── 2. Pré-vol : la cible existe, est unique, et n'a pas changé depuis l'export ──
  const count = await prisma.doctoralToolbox.count();
  if (count !== 1) fail(`DoctoralToolbox count=${count} (attendu 1) — re-caractériser avant toute suppression`);

  const row = await prisma.doctoralToolbox.findUnique({ where: { id: EXPECTED_ID } });
  if (!row) fail(`ligne ${EXPECTED_ID} introuvable`);
  if (row.thesisId !== EXPECTED_THESIS_ID) fail(`thesisId inattendu : ${row.thesisId}`);

  const current = {
    checklist: row.checklist, milestones: row.milestones,
    documents: row.documents, contacts: row.contacts, notes: row.notes,
  };
  for (const k of Object.keys(current) as (keyof typeof current)[]) {
    if (current[k] !== (refFields as Record<string, string>)[k]) {
      fail(`champ « ${k} » DIFFÉRENT de l'export de référence — données potentiellement utilisateur, suppression INTERDITE (re-caractériser, cf. 19_RESIDU_DOCTORALTOOLBOX.md §3.0)`);
    }
  }
  console.log("[GARDE] contenu en base identique octet pour octet au template INITIAL_* exporté — suppression autorisée par les gardes");

  const thesisBefore = await prisma.thesis.findUnique({
    where: { id: EXPECTED_THESIS_ID },
    select: { id: true, title: true, updatedAt: true },
  });
  if (!thesisBefore) fail(`thèse ${EXPECTED_THESIS_ID} introuvable`);
  console.log(`[THÈSE] "${thesisBefore.title}" updatedAt avant : ${thesisBefore.updatedAt.toISOString()}`);

  // ── 3. Suppression ciblée (id EXACT + thesisId EXACT) ──
  if (EXECUTE) {
    const deleted = await prisma.doctoralToolbox.deleteMany({
      where: { id: EXPECTED_ID, thesisId: EXPECTED_THESIS_ID },
    });
    if (deleted.count !== 1) fail(`deleteMany a supprimé ${deleted.count} ligne(s) (attendu exactement 1) — ROLLBACK requis (restore-doctoral-toolbox.ts)`);
    console.log("[DELETE] 1 ligne supprimée (id + thesisId exacts)");
  } else {
    console.log("[DRY-RUN] suppression simulée : deleteMany({ where: { id: '" + EXPECTED_ID + "', thesisId: '" + EXPECTED_THESIS_ID + "' } })");
  }

  // ── 4. Contrôles post ──
  const countAfter = await prisma.doctoralToolbox.count();
  console.log(`[POST] DoctoralToolbox count = ${countAfter} (attendu 0)`);
  if (EXECUTE && countAfter !== 0) fail("le compte post-suppression n'est pas 0 — investiguer");

  const thesisAfter = await prisma.thesis.findUnique({
    where: { id: EXPECTED_THESIS_ID },
    select: { id: true, title: true, updatedAt: true, chapters: { select: { id: true } } },
  });
  if (!thesisAfter) fail("thèse introuvable après suppression (ne devrait jamais arriver)");
  const unchanged = thesisAfter.updatedAt.toISOString() === thesisBefore.updatedAt.toISOString();
  console.log(`[POST] thèse intacte : title="${thesisAfter.title}", ${thesisAfter.chapters.length} chapitre(s), updatedAt ${unchanged ? "INCHANGÉ" : "MODIFIÉ (" + thesisAfter.updatedAt.toISOString() + ")"}`);
  if (!unchanged) fail("updatedAt de la thèse a changé — hors périmètre attendu, investiguer");

  console.log(EXECUTE
    ? "[FIN] suppression conforme — rollback disponible : bun run audit/baseline/tools/restore-doctoral-toolbox.ts --execute"
    : "[FIN] dry-run terminé, AUCUNE écriture effectuée");
}

main()
  .catch((e) => { console.error("[ERREUR]", e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());

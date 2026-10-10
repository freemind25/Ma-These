#!/usr/bin/env bun
/**
 * setup-test-thesis.mjs — Scénario 2 thèses sur la COPIE (répétition générale).
 *
 * Usage : DATABASE_URL="file:/tmp/rehearsal-refs/rehearsal.db" bun setup-test-thesis.mjs <output-json>
 *
 * Crée via le client Prisma ad hoc (/tmp/rehearsal-refs/client) :
 *   - 1 thèse de test « REHEARSAL-TH-B — Thèse test répétition migration refs »
 *     + 2 chapitres (contenu préfixé REHEARSAL-),
 *   - 2 références ATTRIBUÉES à la thèse B dès la création (thesisId=B —
 *     comportement exigé pour la future API : thesisId obligatoire),
 *   - 1 référence GLOBALE (thesisId NULL) — témoin pour la visibilité
 *     inter-thèses ET pour la branche « ambigu » du script de migration.
 *
 * Ne touche JAMAIS aux données du propriétaire (lecture seule sur la thèse A).
 */
import { PrismaClient } from "/tmp/rehearsal-refs/client/index.js";
import { writeFileSync } from "node:fs";

const outPath = process.argv[2] ?? "/tmp/rehearsal-refs/results/05-setup-test-thesis.json";
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const log = { startedAtUTC: new Date().toISOString(), created: {}, warnings: [] };

try {
  const owner = await prisma.thesis.findFirst({ orderBy: { createdAt: "asc" } });
  if (!owner) throw new Error("Aucune thèse existante — scénario invalide");
  log.ownerThesis = { id: owner.id, title: owner.title };

  const thesisB = await prisma.thesis.create({
    data: {
      title: "REHEARSAL-TH-B — Thèse test répétition migration refs",
      author: "Agent Répétition",
      status: "draft",
      structureMode: "chapters",
      chapters: {
        create: [
          { number: 1, title: "REHEARSAL-B Chapitre 1 — Introduction test", content: "Contenu REHEARSAL-B chapitre 1 (jetable, copie de répétition)." },
          { number: 2, title: "REHEARSAL-B Chapitre 2 — État de l'art test", content: "Contenu REHEARSAL-B chapitre 2 (jetable, copie de répétition)." },
        ],
      },
    },
    include: { chapters: true },
  });
  log.created.thesisB = { id: thesisB.id, title: thesisB.title, chapters: thesisB.chapters.map((c) => c.id) };

  const refB1 = await prisma.reference.create({
    data: {
      type: "article",
      authors: "Répétition, A.",
      title: "REHEARSAL-B Réf 1 — attribuée thèse B (test isolation)",
      year: 2026,
      journal: "Journal de Répétition",
      source: "manual",
      thesisId: thesisB.id, // attribution à la création = futur contrat API (thesisId obligatoire)
    },
  });
  const refB2 = await prisma.reference.create({
    data: {
      type: "book",
      authors: "Répétition, B.",
      title: "REHEARSAL-B Réf 2 — attribuée thèse B (test isolation)",
      year: 2025,
      publisher: "Éditions Répétition",
      source: "manual",
      thesisId: thesisB.id,
    },
  });
  const refGlobal = await prisma.reference.create({
    data: {
      type: "web",
      authors: "Répétition, C.",
      title: "REHEARSAL-GLOBAL Réf ambigue — thesisId NULL (témoin visibilité + branche ambigu)",
      url: "https://example.org/rehearsal",
      source: "manual",
      // thesisId volontairement absent (NULL) : visible des deux thèses aujourd'hui,
      // et « ambiguë » pour le script de migration en contexte multi-thèses.
    },
  });
  log.created.references = {
    refB1: { id: refB1.id, thesisId: refB1.thesisId, title: refB1.title },
    refB2: { id: refB2.id, thesisId: refB2.thesisId, title: refB2.title },
    refGlobal: { id: refGlobal.id, thesisId: refGlobal.thesisId, title: refGlobal.title },
  };

  const ownerRefsAfter = await prisma.reference.findMany({ where: { thesisId: owner.id }, select: { id: true, title: true } });
  log.ownerReferencesUntouched = ownerRefsAfter.length;
  log.finishedAtUTC = new Date().toISOString();
  writeFileSync(outPath, JSON.stringify(log, null, 2) + "\n");
  console.log(JSON.stringify(log, null, 2));
} catch (e) {
  log.warnings.push(String(e));
  writeFileSync(outPath, JSON.stringify(log, null, 2) + "\n");
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

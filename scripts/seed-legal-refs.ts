// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Alimentation initiale du registre juridique URBANIS-DZ
// 26 entrées §3 (référentiel minimal) + §4 (sous-référentiel risques)
// du pack URBANIS-DZ v1.1 — vigilances conservées VERBATIM.
// Idempotent : skip si le registre n'est pas vide.
// Exécution : bun scripts/seed-legal-refs.ts
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type SeedRef = {
  domaine: string;
  reference: string;
  portee: string;
  statut: string;
  textesLies?: string;
};

const RISQUES = "Risques";

// ── §3. Référentiel juridique minimal (13 entrées) ──
const SECTION_3: SeedRef[] = [
  {
    domaine: "Urbanisme",
    reference: "Loi n° 90-29 du 1er décembre 1990 relative à l'aménagement et à l'urbanisme",
    portee: "PDAU, POS, actes, servitudes, sanctions.",
    statut: "En vigueur ; version consolidée à vérifier.",
  },
  {
    domaine: "Urbanisme",
    reference: "Loi n° 04-05 du 14 août 2004",
    portee: "Modifie et complète la loi n° 90-29 ; risques, constructibilité, professionnels.",
    statut: "Texte modificatif.",
    textesLies: "Loi n° 90-29",
  },
  {
    domaine: "Urbanisme",
    reference: "Décret exécutif n° 91-175 du 28 mai 1991",
    portee: "Règles générales d'aménagement, d'urbanisme et de construction.",
    statut: "À vérifier dans sa version à jour.",
  },
  {
    domaine: "Urbanisme",
    reference: "Décrets exécutifs n° 91-177 et n° 91-178 du 28 mai 1991",
    portee: "Procédures et contenu du PDAU puis du POS.",
    statut: "À vérifier dans leurs versions à jour.",
  },
  {
    domaine: "Construction",
    reference: "Loi n° 08-15 du 20 juillet 2008",
    portee: "Mise en conformité et achèvement des constructions.",
    statut: "Vérifier modifications, prorogations et éligibilité.",
  },
  {
    domaine: "Ville",
    reference: "Loi n° 06-06 du 20 février 2006",
    portee: "Politique de la ville, cadre bâti, agglomérations.",
    statut: "Version consolidée à vérifier.",
  },
  {
    domaine: "Territoire",
    reference: "Loi n° 01-20 du 12 décembre 2001 ; loi n° 10-02 du 29 juin 2010",
    portee: "Aménagement durable ; SNAT.",
    statut: "Vérifier mise à jour et déclinaisons locales.",
  },
  {
    domaine: "Patrimoine",
    reference: "Loi n° 98-04 du 15 juin 1998 ; décret n° 03-324 du 5 octobre 2003",
    portee: "Patrimoine culturel, secteurs sauvegardés, PPSMVSS.",
    statut: "Vérifier périmètre, règlement et approbation locale.",
  },
  {
    domaine: "Foncier",
    reference: "Lois n° 90-25, n° 90-30, n° 91-11 ; loi n° 23-17 du 15 novembre 2023",
    portee: "Orientation foncière, domaine national, expropriation, foncier économique.",
    statut: "Toujours vérifier parcelle, titres et procédures.",
  },
  {
    domaine: "Promotion",
    reference: "Loi n° 11-04 du 17 février 2011 ; décrets n° 12-84, 13-431, 14-99",
    portee: "Promotion immobilière, agrément, vente sur plans, copropriété.",
    statut: "Version consolidée et actes applicables à vérifier.",
  },
  {
    domaine: "Collectivités",
    reference: "Lois n° 11-10 du 22 juin 2011 et n° 12-07 du 21 février 2012",
    portee: "Compétences de la commune et de la wilaya.",
    statut: "Versions consolidées à vérifier.",
  },
  {
    domaine: "Environnement",
    reference: "Loi n° 03-10 du 19 juillet 2003",
    portee: "Protection de l'environnement, pollutions, évaluations environnementales.",
    statut: "Version consolidée à vérifier.",
  },
  {
    domaine: "Données personnelles",
    reference: "Loi n° 18-07 du 10 juin 2018, modifiée notamment par la loi n° 25-11 du 24 juillet 2025",
    portee: "Données personnelles, enquêtes, photos et fichiers.",
    statut: "Version consolidée à vérifier.",
  },
];

// ── §4. Sous-référentiel risques (13 entrées) — couche transversale ──
const SECTION_4: SeedRef[] = [
  {
    domaine: `${RISQUES} — Cadre national`,
    reference: "Loi n° 24-04 du 26 février 2024",
    portee:
      "Prévention, intervention et réduction des risques de catastrophes ; inclut notamment risques sismiques, géologiques, inondations, événements climatiques extrêmes et feux de forêt.",
    statut: "En vigueur.",
  },
  {
    domaine: `${RISQUES} — Plans de prévention`,
    reference: "Décret exécutif n° 25-132 du 27 avril 2025",
    portee: "Élaboration, amendement, mise à jour et exécution des plans généraux de prévention des risques de catastrophes.",
    statut: "En vigueur.",
  },
  {
    domaine: `${RISQUES} — Plans d'intervention`,
    reference: "Décret exécutif n° 25-63 du 28 janvier 2025",
    portee: "Conditions et modalités des plans d'intervention.",
    statut: "En vigueur.",
  },
  {
    domaine: `${RISQUES} — Confortement`,
    reference: "Décret exécutif n° 25-60 du 28 janvier 2025",
    portee: "Plans de confortement priorisés pour infrastructures et bâtiments stratégiques ou patrimoniaux.",
    statut: "En vigueur.",
  },
  {
    domaine: `${RISQUES} — Dégâts / décombres`,
    reference: "Décrets exécutifs n° 25-61 et n° 25-62 du 28 janvier 2025",
    portee: "Évaluation des dégâts ; gestion des décombres, résidus et déchets post-catastrophe.",
    statut: "En vigueur.",
  },
  {
    domaine: `${RISQUES} — Protection civile`,
    reference: "Décret exécutif n° 24-198 du 11 juin 2024",
    portee: "Missions, organisation et fonctionnement de la direction générale de la protection civile.",
    statut: "En vigueur.",
  },
  {
    domaine: `${RISQUES} — Sismique / géologique`,
    reference: "Loi n° 24-04 ; loi n° 90-29 ; loi n° 04-05 ; RPA 99/version 2003 et DTR",
    portee:
      "Séisme, glissements, effondrements, affaissements, instabilités de pente, ravinement ; intégration dans planification et conception.",
    statut: "Études géotechniques et structurelles obligatoirement renvoyées aux spécialistes.",
  },
  {
    domaine: `${RISQUES} — Inondation / ruissellement`,
    reference: "Loi n° 24-04 ; décret n° 25-132 ; loi n° 90-29 ; loi n° 03-10",
    portee:
      "Bassin versant, talwegs, capacité pluviale, exutoires, imperméabilisation et gestion à l'aval.",
    statut: "Étude hydraulique et avis compétent nécessaires.",
  },
  {
    domaine: `${RISQUES} — Feux de forêt`,
    reference: "Loi n° 23-21 du 23 décembre 2023 relative aux forêts et richesses forestières",
    portee: "Prévention, lutte, interfaces habitat-forêt, pistes, pare-feux, points d'eau.",
    statut: "Vérifier plans et service forestier compétent.",
  },
  {
    domaine: `${RISQUES} — Installations classées`,
    reference: "Décret exécutif n° 06-198 du 31 mai 2006, modifié et complété ; décrets n° 22-167 et n° 24-196",
    portee: "Réglementation applicable aux établissements classés ; étude de danger, autorisations et contrôles.",
    statut: "Version consolidée obligatoire.",
  },
  {
    domaine: `${RISQUES} — Nomenclature / impact`,
    reference: "Décrets exécutifs n° 07-144 et n° 07-145 du 19 mai 2007",
    portee: "Nomenclature des installations classées ; études et notices d'impact.",
    statut: "Vérifier versions et procédures.",
  },
  {
    domaine: `${RISQUES} — Études de danger`,
    reference: "Arrêté interministériel du 14 septembre 2014",
    portee: "Modalités d'examen et d'approbation des études de danger.",
    statut: "À vérifier au JORADP.",
  },
  {
    domaine: `${RISQUES} — Produits dangereux`,
    reference: "Décret exécutif n° 03-451 du 1er décembre 2003",
    portee: "Sécurité liée aux matières et produits chimiques dangereux et récipients de gaz sous pression.",
    statut: "Modifié et complété ; vérifier.",
  },
  {
    domaine: `${RISQUES} — Déchets`,
    reference:
      "Loi n° 01-19 du 12 décembre 2001, modifiée par loi n° 25-02 du 20 février 2025 ; décret n° 04-409 du 14 décembre 2004",
    portee: "Déchets, déchets spéciaux et dangereux ; transport des déchets spéciaux dangereux.",
    statut: "Versions consolidées à vérifier.",
  },
];

async function main() {
  const existing = await db.legalRef.count();
  if (existing > 0) {
    console.log(`SKIP: registre déjà alimenté (${existing} entrées) — idempotent.`);
    return;
  }
  const all = [...SECTION_3, ...SECTION_4];
  await db.legalRef.createMany({
    data: all.map((r) => ({
      domaine: r.domaine,
      reference: r.reference,
      portee: r.portee,
      statut: r.statut,
      textesLies: r.textesLies ?? null,
      enabled: true, // décision déléguée n°2 (spec) — révisable à la recette
    })),
  });
  console.log(`SEED: ${all.length} entrées créées (§3: ${SECTION_3.length}, §4: ${SECTION_4.length}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

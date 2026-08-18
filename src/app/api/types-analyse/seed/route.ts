import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// POST /api/types-analyse/seed — Seed analyse_urbaine
// ═══════════════════════════════════════

const PROMPT_GENERIQUE = `Tu es un module de vérification méthodologique pour ThesisFrame, un environnement de rédaction de thèse.

RÔLE STRICT :
Tu poses UNIQUEMENT des questions ouvertes sur les éléments méthodologiques que le chercheur te soumet. Tu ne fais JAMAIS d'affirmation sur l'objet d'étude, tu ne proposes JAMAIS de lecture, d'interprétation, ou de conclusion.

INTERDICTIONS ABSOLUES :
- Aucune phrase déclarative sur l'objet d'étude ("cette zone présente...", "on observe une...", "ce corpus semble...")
- Aucune suggestion de cause ou d'explication ("cela pourrait indiquer...", "probablement dû à...")
- Aucune évaluation de qualité du travail ("bon exemple de...", "cas typique de...")

CE QUE TU DOIS FAIRE :
- Identifier les incohérences méthodologiques possibles (dates de sources différentes, échelles incompatibles, éléments manquants par rapport à l'objectif déclaré) et les formuler EXCLUSIVEMENT sous forme de question
- Une question à la fois, ou une liste courte de questions (3 maximum)
- Rester neutre : la question doit pouvoir recevoir n'importe quelle réponse du chercheur sans que tu aies présupposé laquelle est correcte

FORMAT DE SORTIE : JSON strict
{"questions": ["...", "..."]}`;

const PROMPT_ANALYSE_URBAINE = `${PROMPT_GENERIQUE}

CONTEXTE DISCIPLINAIRE : analyse urbaine et territoriale. Les éléments soumis sont des couches cartographiques (dates de source, échelle, périmètre).

EXEMPLES :

Entrée : éléments "occupation_sol (2023)" + "flux_mobilite (2019)"
Sortie correcte :
{"questions": ["Avez-vous vérifié la cohérence temporelle entre votre couche d'occupation du sol (2023) et votre couche de mobilité (2019) ?"]}

Sortie INTERDITE (ne jamais produire ceci) :
{"questions": ["Cette zone semble avoir connu une évolution significative entre 2019 et 2023, ce qui pourrait expliquer..."]}`;

const REFERENTIEL_ANALYSE_URBAINE = {
  prealable: {
    id: "phase-1-cadrage",
    label: "Phase 1 — Cadrage et délimitation",
    elements: [
      { typeElement: "situation_generale", label: "Situation générale" },
      { typeElement: "perimetre_urbain", label: "Périmètre urbain" },
      { typeElement: "perimetre_administratif", label: "Périmètre administratif" },
      { typeElement: "perimetre_etude", label: "Périmètre d'étude retenu" },
    ],
  },
  phases: [
    {
      id: "phase-1b-entites",
      label: "Phase 1B — Entités homogènes (zonage)",
      elements: [
        { typeElement: "zonage_fonctionnel", label: "Zonage fonctionnel" },
        { typeElement: "zonage_typo_morphologique", label: "Zonage typo-morphologique" },
        { typeElement: "zonage_social_environnemental", label: "Zonage social-environnemental" },
      ],
    },
    {
      id: "phase-2a-anatomie",
      label: "Phase 2A — Anatomie : structure spatiale et physique",
      elements: [
        { typeElement: "releve_cartes_anciennes", label: "Relevé cartes anciennes" },
        { typeElement: "releve_cartes_actuelles", label: "Relevé cartes actuelles" },
        { typeElement: "traces_urbaines", label: "Traces urbaines" },
        { typeElement: "foncier_public", label: "Foncier public" },
        { typeElement: "foncier_prive", label: "Foncier privé" },
        { typeElement: "friches", label: "Friches" },
        { typeElement: "dents_creuses", label: "Dents creuses" },
        { typeElement: "trame_viaire", label: "Trame viaire" },
        { typeElement: "parcellaire", label: "Parcellaire" },
        { typeElement: "gabarit_bati", label: "Gabarit du bâti" },
        { typeElement: "typologie_bati", label: "Typologie du bâti" },
        { typeElement: "espaces_publics", label: "Espaces publics" },
        { typeElement: "reseau_mobilite", label: "Réseau de mobilité" },
        { typeElement: "noeuds_transport", label: "Nœuds de transport" },
        { typeElement: "flux_pietons", label: "Flux piétons" },
        { typeElement: "points_repere", label: "Points de repère" },
        { typeElement: "elements_paysagers_remarquables", label: "Éléments paysagers remarquables" },
      ],
    },
    {
      id: "phase-2b-physiologie",
      label: "Phase 2B — Physiologie : données socio-économiques",
      elements: [
        { typeElement: "pyramide_ages", label: "Pyramide des âges" },
        { typeElement: "taux_croissance", label: "Taux de croissance" },
        { typeElement: "composition_menages", label: "Composition des ménages" },
        { typeElement: "structure_emploi", label: "Structure de l'emploi" },
        { typeElement: "taux_chomage", label: "Taux de chômage" },
        { typeElement: "poles_attractivite", label: "Pôles d'attractivité" },
        { typeElement: "deficit_surplus_logements", label: "Déficit/surplus de logements" },
        { typeElement: "etat_parc", label: "État du parc" },
        { typeElement: "taux_occupation", label: "Taux d'occupation" },
      ],
    },
    {
      id: "phase-2c-transversales",
      label: "Phase 2C — Approches contemporaines et transversales",
      elements: [
        { typeElement: "occupation_sol", label: "Occupation du sol" },
        { typeElement: "risques_naturels", label: "Risques naturels" },
        { typeElement: "corridors_ecologiques", label: "Corridors écologiques" },
        { typeElement: "ilots_chaleur", label: "Îlots de chaleur" },
        { typeElement: "bassins_visuels", label: "Bassins visuels" },
      ],
    },
  ],
};

export async function POST() {
  try {
    // Check if already seeded
    const existing = await db.typeAnalyseMethodologique.findFirst({
      where: { discipline: "analyse_urbaine" },
    });
    if (existing) {
      return NextResponse.json({ data: existing, seeded: false });
    }

    // Create the referential
    const created = await db.typeAnalyseMethodologique.create({
      data: {
        discipline: "analyse_urbaine",
        nom: "Diagnostic morphologique complet",
        elementsAttendus: JSON.stringify(REFERENTIEL_ANALYSE_URBAINE),
        promptQuestionneur: PROMPT_ANALYSE_URBAINE,
      },
    });

    return NextResponse.json({ data: created, seeded: true });
  } catch (error) {
    console.error("[POST /api/types-analyse/seed] Error:", error);
    return NextResponse.json({ error: "Erreur lors du seed" }, { status: 500 });
  }
}
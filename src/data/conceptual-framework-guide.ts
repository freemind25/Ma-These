/**
 * Guide en 5 étapes pour rédiger un cadre conceptuel
 * Adapté de Proofreadingepic — traduit et enrichi pour le contexte doctoral francophone.
 *
 * Complète le guide d'opérationnalisation (Lazarsfeld) dans methodology-guide.ts
 * qui se concentre sur la mesure, tandis que celui-ci se concentre sur
 * la rédaction et la justification du diagramme de variables.
 */

export interface FrameworkStep {
  id: string
  step: number
  title: string
  description: string
  template: string
  templateLabels?: { [key: string]: string }
  tips: string[]
}

export const CONCEPTUAL_FRAMEWORK_STEPS: FrameworkStep[] = [
  {
    id: 'step-1-purpose',
    step: 1,
    title: 'Introduire le propos du cadre',
    description: 'Expliquez ce que le cadre conceptuel représente et son rôle dans votre recherche.',
    template: 'Le cadre conceptuel illustre la relation entre la/les variable(s) indépendante(s) et la variable dépendante dans cette étude. Il est développé à partir de la théorie retenue et des études empiriques antérieures.',
    tips: [
      'Le diagramme seul ne suffit pas — le texte d\'explication est obligatoire.',
      'Le cadre n\'est pas une simple liste de variables : il montre les relations attendues entre elles.',
      'Placez cette introduction AVANT de présenter le diagramme.',
    ],
  },
  {
    id: 'step-2-variables',
    step: 2,
    title: 'Présenter chaque variable',
    description: 'Définissez brièvement chaque variable du cadre.',
    template: 'La variable indépendante est [X], qui désigne [définition]. La variable dépendante est [Y], qui mesure [définition].',
    templateLabels: {
      X: 'Nom de la variable indépendante (ex. : la qualité de service perçue)',
      Y: 'Nom de la variable dépendante (ex. : la satisfaction client)',
    },
    tips: [
      'Si vous avez des variables médiatrices ou modératrices, définissez-les aussi.',
      'Utilisez les définitions opérationnelles (comment la variable est mesurée).',
      'Chaque variable doit être liée à un construct théorique ou à une définition de la littérature.',
    ],
  },
  {
    id: 'step-3-relationships',
    title: 'Expliquer les relations',
    step: 3,
    description: 'Justifiez chaque lien du cadre en vous appuyant sur des études antérieures.',
    template: 'Des études antérieures ont rapporté que [VI] influence positivement [VD]. Par conséquent, la présente étude propose qu\'une relation similaire existe.',
    templateLabels: {
      VI: 'Variable indépendante',
      VD: 'Variable dépendante',
    },
    tips: [
      'Chaque flèche du diagramme doit être justifiée par au moins une référence.',
      'Précisez le sens attendu de la relation (positif, négatif, curvilinéaire).',
      'Si vous proposez une relation médiate ou modératrice, expliquez le mécanisme théorique.',
      'Distinguez les relations empiriquement démontrées des relations hypothétiques que vous testez.',
    ],
  },
  {
    id: 'step-4-theory',
    step: 4,
    title: 'Lier à la théorie',
    description: 'Expliquez comment la théorie retenue soutient le cadre conceptuel.',
    template: 'Cette relation est soutenue par la théorie de [Nom de la théorie], qui explique que [principe clé de la théorie appliqué à vos variables].',
    templateLabels: {
      'Nom de la théorie': 'Ex. : l\'autodétermination, la théorie des échanges sociaux, TAM, …',
    },
    tips: [
      'La théorie est le « pourquoi » — la raison pour laquelle les variables sont liées.',
      'Si vous utilisez plusieurs théories, expliquez comment elles se complètent.',
      'Évitez de nommer une théorie sans expliquer son mécanisme dans le contexte de votre étude.',
      'Le choix de la théorie doit être justifié (pourquoi celle-ci plutôt qu\'une autre ?).',
    ],
  },
  {
    id: 'step-5-conclude',
    step: 5,
    title: 'Conclure avec les hypothèses',
    description: 'Terminez en déduisant les hypothèses de recherche du cadre.',
    template: 'Sur la base du cadre conceptuel, les hypothèses suivantes seront testées dans cette étude :\nH1 : [VI] a un effet positif sur [VD].\nH2 : [Médiateur] médie la relation entre [VI] et [VD].',
    templateLabels: {
      VI: 'Variable indépendante',
      VD: 'Variable dépendante',
      'Médiateur': 'Variable médiatrice (si applicable)',
    },
    tips: [
      'Chaque hypothèse doit correspondre à une flèche du diagramme.',
      'Les hypothèses doivent être testables et falsifiables.',
      'Le nombre d\'hypothèses doit rester gérable (3 à 7 est raisonnable).',
      'Numérotez les hypothèses en cohérence avec l\'ordre du diagramme.',
    ],
  },
]

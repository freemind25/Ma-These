/**
 * Grilles d'appréciation critique de la qualité méthodologique
 * (Accompagne le Protocole #05bis du skill analyse-documentaire-scientifique)
 *
 * Repères paraphrasés pour l'appréciation critique par type de design.
 * Ne reproduit aucune grille protégée verbatim.
 * Pour un usage formel et certifié : CASP, MMAT, Cochrane RoB2, Newcastle-Ottawa.
 */

export interface QualityDimension {
  id: string
  question: string
  applicableTo: string[]
}

export interface QualityGrid {
  id: string
  label: string
  description: string
  dimensions: QualityDimension[]
}

export const QUALITY_GRIDS: QualityGrid[] = [
  {
    id: 'quantitatif-experimental',
    label: 'Études quantitatives expérimentales',
    description: 'Essais contrôlés, quasi-expériences, expériences randomisées.',
    dimensions: [
      {
        id: 'qe-1',
        question: 'La méthode d\'allocation des groupes permet-elle d\'éviter un biais de sélection ?',
        applicableTo: ['essai', 'quasi-experience', 'rct'],
      },
      {
        id: 'qe-2',
        question: 'L\'échantillon est-il suffisamment grand et bien décrit pour soutenir les conclusions ?',
        applicableTo: ['essai', 'quasi-experience', 'rct'],
      },
      {
        id: 'qe-3',
        question: 'Les mesures de résultat sont-elles définies et appliquées de façon cohérente entre groupes ?',
        applicableTo: ['essai', 'quasi-experience', 'rct'],
      },
      {
        id: 'qe-4',
        question: 'Les analyses statistiques sont-elles adaptées au design et clairement rapportées ?',
        applicableTo: ['essai', 'quasi-experience', 'rct'],
      },
      {
        id: 'qe-5',
        question: 'Les pertes de suivi ou données manquantes sont-elles documentées et leur impact discuté ?',
        applicableTo: ['essai', 'quasi-experience', 'rct'],
      },
    ],
  },
  {
    id: 'observationnel',
    label: 'Études observationnelles',
    description: 'Cohortes, études cas-témoins, transversales.',
    dimensions: [
      {
        id: 'obs-1',
        question: 'La sélection des participants/cas introduit-elle un biais identifiable ?',
        applicableTo: ['cohort', 'cas-temoin', 'transversal'],
      },
      {
        id: 'obs-2',
        question: 'Les facteurs de confusion principaux sont-ils mesurés et pris en compte ?',
        applicableTo: ['cohort', 'cas-temoin', 'transversal'],
      },
      {
        id: 'obs-3',
        question: 'La mesure de l\'exposition et du résultat est-elle fiable et comparable entre groupes ?',
        applicableTo: ['cohort', 'cas-temoin', 'transversal'],
      },
      {
        id: 'obs-4',
        question: 'La durée de suivi est-elle suffisante pour observer l\'effet étudié ?',
        applicableTo: ['cohort', 'cas-temoin'],
      },
    ],
  },
  {
    id: 'qualitatif',
    label: 'Études qualitatives',
    description: 'Entretiens, observations, ethnographie, analyse thématique.',
    dimensions: [
      {
        id: 'qual-1',
        question: 'Le cadre conceptuel et la question de recherche sont-ils cohérents avec la méthode de collecte choisie ?',
        applicableTo: ['entretien', 'observation', 'ethnographie', 'analyse-thematique'],
      },
      {
        id: 'qual-2',
        question: 'L\'échantillonnage est-il justifié par rapport à l\'objectif de l\'étude (saturation, diversité) ?',
        applicableTo: ['entretien', 'observation', 'ethnographie'],
      },
      {
        id: 'qual-3',
        question: 'Le processus d\'analyse des données est-il rendu suffisamment transparent pour être audité ?',
        applicableTo: ['entretien', 'observation', 'ethnographie', 'analyse-thematique'],
      },
      {
        id: 'qual-4',
        question: 'Les auteurs font-ils preuve de réflexivité sur leur propre position et son influence possible sur les résultats ?',
        applicableTo: ['entretien', 'observation', 'ethnographie'],
      },
    ],
  },
  {
    id: 'revue-meta',
    label: 'Revues et méta-analyses',
    description: 'Revues systématiques, méta-analyses, revues de portée.',
    dimensions: [
      {
        id: 'rev-1',
        question: 'La stratégie de recherche documentaire est-elle décrite avec une précision suffisante pour être reproduite ?',
        applicableTo: ['revue-systematique', 'meta-analyse', 'scoping'],
      },
      {
        id: 'rev-2',
        question: 'Les critères d\'inclusion/exclusion sont-ils explicites et appliqués de façon cohérente ?',
        applicableTo: ['revue-systematique', 'meta-analyse', 'scoping'],
      },
      {
        id: 'rev-3',
        question: 'Le risque de biais de publication (études négatives non publiées) est-il discuté ?',
        applicableTo: ['revue-systematique', 'meta-analyse'],
      },
      {
        id: 'rev-4',
        question: 'En cas de synthèse quantitative, l\'hétérogénéité entre études est-elle évaluée et expliquée ?',
        applicableTo: ['meta-analyse'],
      },
    ],
  },
]

/** Niveaux de risque de biais (Protocole #05bis) */
export const BIAS_RISK_LEVELS = [
  {
    id: 'faible',
    label: 'Faible',
    color: 'emerald',
    description: 'Peu de préoccupations sur les dimensions ci-dessus ; conclusions globalement fiables.',
  },
  {
    id: 'modere',
    label: 'Modéré',
    color: 'amber',
    description: 'Quelques préoccupations identifiées ; conclusions à interpréter avec prudence.',
  },
  {
    id: 'serieux',
    label: 'Sérieux',
    color: 'orange',
    description: 'Préoccupations multiples ou majeures ; conclusions fragiles.',
  },
  {
    id: 'critique',
    label: 'Critique',
    color: 'red',
    description: 'Failles méthodologiques compromettant la validité des conclusions.',
  },
  {
    id: 'non-evaluable',
    label: 'Non évaluable',
    color: 'slate',
    description:
      'Informations insuffisantes pour juger — à signaler comme limite, jamais à combler par supposition.',
  },
] as const

/** Niveaux de certitude des preuves (Protocole #09bis — approche GRADE) */
export const CERTAINTY_LEVELS = [
  {
    id: 'elevee',
    label: 'Élevée',
    color: 'emerald',
    description: 'Preuves solides et convergentes issues d\'études de haute qualité méthodologique.',
  },
  {
    id: 'moderee',
    label: 'Modérée',
    color: 'amber',
    description: 'Preuves convergentes mais avec quelques limitations méthodologiques.',
  },
  {
    id: 'faible',
    label: 'Faible',
    color: 'orange',
    description: 'Preuves limitées : peu d\'études, qualité modérée, ou hétérogénéité importante.',
  },
  {
    id: 'tres-faible',
    label: 'Très faible',
    color: 'red',
    description: 'Preuves très insuffisantes : une seule étude, qualité faible, ou contradictions non résolues.',
  },
] as const

/** Règle de dégradation du Protocole #09bis */
export const CERTAINTY_DEGRADATION_RULES = [
  {
    condition: 'Risque de biais sérieux dominant',
    consequence: 'La certitude descend d\'un niveau.',
  },
  {
    condition: 'Forte hétérogénéité non expliquée entre études',
    consequence: 'La certitude descend d\'un niveau.',
  },
  {
    condition: 'Une seule étude porte l\'affirmation',
    consequence: 'Certitude maximale = Faible (jamais Élevée ni Modérée).',
  },
  {
    condition: 'Convergence d\'études biaisées de la même façon',
    consequence: 'La convergence ne constitue pas une preuve solide.',
  },
] as const

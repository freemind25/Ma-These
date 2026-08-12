/**
 * Protocoles d'analyse documentaire scientifique — Niveau Classe A / Q1
 *
 * Skill : analyse-documentaire-scientifique
 * 12 protocoles pour produire une synthèse traçable, falsifiable et pondérée par la qualité des preuves.
 */

export interface Protocol {
  id: string
  number: string
  title: string
  status: 'conserve' | 'renforce' | 'ajoute'
  description: string
  objectif: string
  livrable: string
  nouveaute?: string
  icon?: string
}

export const SCIENTIFIC_ANALYSIS_PROTOCOLS: Protocol[] = [
  {
    id: 'proto-00-cadrage',
    number: '00',
    title: 'Protocole de cadrage',
    status: 'ajoute',
    description:
      'Fixer et valider le type de revue (PRISMA/PRISMA-ScR/SANRA/Intégrative), la question de recherche PICO(S), les critères d\'inclusion/exclusion et la stratégie de recherche.',
    objectif:
      'Documenter les choix méthodologiques avant toute analyse — un corpus sans critères d\'inclusion documentés est le premier point de rejet en relecture de classe A.',
    livrable: '00_Protocole_cadrage.md',
    nouveaute:
      'Obligatoire même si le corpus est déjà fourni par l\'utilisateur — exécuté sous forme allégée (3 questions fermées).',
    icon: 'ClipboardCheck',
  },
  {
    id: 'proto-01-structurant',
    number: '01',
    title: 'Tableau structurant + clusters',
    status: 'conserve',
    description:
      'Structurer le corpus en clusters thématiques. Extraire pour chaque article : question de recherche, méthodologie, résultats principaux, limites, positionnement.',
    objectif: 'Base de structuration du corpus en axes thématiques.',
    livrable: '01_Protocole_analyse.md',
    icon: 'LayoutGrid',
  },
  {
    id: 'proto-02-contradictions',
    number: '02',
    title: 'Détecteur de contradictions',
    status: 'conserve',
    description:
      'Identifier les contradictions explicites et implicites entre les articles du corpus. Distinguer contradictions factuelles, méthodologiques et interprétatives.',
    objectif: 'Détecter les points de désaccord dans la littérature.',
    livrable: '02_Detecteur_contradictions.md',
    icon: 'GitCompareArrows',
  },
  {
    id: 'proto-03-citations',
    number: '03',
    title: 'Chaîne de citations (historiographie des concepts)',
    status: 'conserve',
    description:
      'Reconstituer la généalogie des concepts clés : qui cite qui, quel concept est né où, comment il a évolué à travers le corpus.',
    objectif: 'Cartographier l\'historique intellectuel des concepts clés.',
    livrable: '03_Chaine_citations.md',
    icon: 'Link',
  },
  {
    id: 'proto-04-lacunes',
    number: '04',
    title: 'Scanner de lacunes (Research Gaps)',
    status: 'conserve',
    description:
      'Identifier les lacunes de recherche : sujets non étudiés, populations sous-représentées, méthodes non appliquées, résultats non répliqués.',
    objectif: 'Localiser les zones d\'incertitude dans la littérature.',
    livrable: '04_Scanner_lacunes.md',
    icon: 'Search',
  },
  {
    id: 'proto-05-audit',
    number: '05',
    title: 'Audit méthodologique',
    status: 'renforce',
    description:
      'Identifier pour chaque étude : design, typologie, taille d\'échantillon, limites principales. Cet audit est renforcé par le Protocole 05bis.',
    objectif: 'Évaluer la rigueur méthodologique de surface de chaque étude.',
    livrable: '05_Audit_methodologique.md',
    icon: 'ShieldAlert',
  },
  {
    id: 'proto-05bis-grille',
    number: '05bis',
    title: 'Grille d\'appréciation critique de la qualité',
    status: 'ajoute',
    description:
      'Transformer l\'audit méthodologique de surface en évaluation de la qualité des preuves. Appliquer une grille adaptée au design (quantitatif, qualitatif, mixte, revue). Attribuer un niveau de risque de biais : Faible / Modéré / Sérieux / Critique.',
    objectif:
      'Sans grille standardisée (type CASP, MMAT, Cochrane RoB2, Newcastle-Ottawa), "limite principale" en une ligne ne suffit pas : un comité de lecture exige un score ou un niveau de risque de biais par étude.',
    livrable: '05bis_Grille_qualite.md',
    nouveaute:
      'Crucial : sans ce protocole, la synthèse traite les preuves faibles et fortes à égalité, ce qu\'aucun comité de lecture n\'accepte.',
    icon: 'Scale',
  },
  {
    id: 'proto-06-synthese',
    number: '06',
    title: 'Synthèse maîtresse (pondérée par qualité)',
    status: 'renforce',
    description:
      'Synthèse de 400 mots des résultats principaux du corpus. Chaque affirmation est pondérée par la qualité des études qui la soutiennent (cf. 05bis), pas par simple comptage d\'articles.',
    objectif: 'Produire la synthèse centrale, traçable et pondérée.',
    livrable: '06_Synthese_maitresse.md',
    nouveaute: 'Pondération obligatoire par qualité des preuves (05bis).',
    icon: 'FileText',
  },
  {
    id: 'proto-07-hypotheses',
    number: '07',
    title: 'Tueur d\'hypothèses tacites',
    status: 'conserve',
    description:
      'Identifier les hypothèses non formulées que les articles du corpus présupposent implicitement. Tester leur robustesse.',
    objectif: 'Révéler les biais de confirmation et les angles morts du corpus.',
    livrable: '07_Tueur_hypotheses.md',
    icon: 'Lightbulb',
  },
  {
    id: 'proto-08-carte',
    number: '08',
    title: 'Carte de connaissances (pondérée par qualité)',
    status: 'renforce',
    description:
      'Carte conceptuelle des résultats du corpus avec "piliers de soutien" indiquant le niveau de qualité des preuves qui les portent.',
    objectif: 'Visualiser la structure des connaissances du corpus.',
    livrable: '08_Carte_connaissances.md',
    nouveaute: 'Les "piliers de soutien" doivent indiquer le niveau de qualité des preuves.',
    icon: 'GitBranch',
  },
  {
    id: 'proto-09bis-certitude',
    number: '09bis',
    title: 'Certitude des preuves (échelle graduée)',
    status: 'ajoute',
    description:
      'Pour chaque affirmation clé : attribuer un niveau de certitude Élevée / Modérée / Faible / Très faible en fonction de la cohérence inter-études, du nombre d\'études et de leur qualité méthodologique. Inspiré de l\'approche GRADE.',
    objectif:
      'L\'élément le plus souvent absent des synthèses non publiables. La certitude descend d\'un niveau si risque de biais sérieux dominant, forte hétérogénéité, ou une seule étude.',
    livrable: '09bis_Certitude_preuves.md',
    nouveaute:
      'Sans échelle de certitude, aucune synthèse ne peut prétendre au niveau classe A.',
    icon: 'Gauge',
  },
  {
    id: 'proto-09-test',
    number: '09',
    title: 'Test "Et alors ?"',
    status: 'conserve',
    description:
      'Pour chaque résultat principal : tester la portée pratique. Si ce résultat est vrai, que change-t-il concrètement dans la discipline ?',
    objectif: 'Évaluer l\'impact pratique des conclusions du corpus.',
    livrable: '09_Test_et_alors.md',
    icon: 'ArrowRight',
  },
  {
    id: 'proto-10-limites',
    number: '10',
    title: 'Limites et réflexivité',
    status: 'ajoute',
    description:
      'Livrable en 4 points : (1) Limites du corpus, (2) Limites méthodologiques, (3) Limites de l\'IA générative + recommandation de vérification humaine, (4) Conflits d\'intérêts identifiés.',
    objectif:
      'Toute revue de classe A exige une section limites explicite, incluant la déclaration que l\'analyse a été réalisée par IA générative.',
    livrable: '10_Limites_reflexivite.md',
    nouveaute:
      'Exigé par tout comité de lecture — transparence méthodologique complète.',
    icon: 'AlertTriangle',
  },
]

/** Types de revue possibles (Phase 0) */
export const REVIEW_TYPES = [
  {
    id: 'prisma',
    label: 'Revue systématique',
    standard: 'PRISMA 2020',
    description: 'Exhaustivité maximale, critères explicites, flux de sélection documenté.',
  },
  {
    id: 'prisma-scr',
    label: 'Scoping Review',
    standard: 'PRISMA-ScR',
    description: 'Explorer l\'étendue de la recherche sur un sujet émergent.',
  },
  {
    id: 'sanra',
    label: 'Revue narrative structurée',
    standard: 'SANRA',
    description: 'Revue narrative avec structure explicite et critères de sélection.',
  },
  {
    id: 'integrative',
    label: 'Revue intégrative',
    standard: '—',
    description: 'Combine données empiriques, théoriques et méthodologiques.',
  },
] as const

/** Profondeur d'analyse */
export const DEPTH_LEVELS = [
  {
    id: 'rapide',
    label: 'Rapide',
    description: 'Sans grille de qualité ni certitude des preuves. Mention "niveau insuffisant pour classe A".',
    protocoles: 9,
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Inclut la grille d\'appréciation critique (05bis). 10 protocoles.',
    protocoles: 10,
  },
  {
    id: 'approfondi',
    label: 'Approfondi (Classe A)',
    description: '12 protocoles complets avec certitude des preuves et limites/réflexivité.',
    protocoles: 12,
  },
] as const

/** Structure du livrable final */
export const DELIVERABLE_STRUCTURE = [
  '00_Protocole_cadrage.md',
  '00_Resume_executif.md',
  '01_Protocole_analyse.md',
  '02_Detecteur_contradictions.md',
  '03_Chaine_citations.md',
  '04_Scanner_lacunes.md',
  '05_Audit_methodologique.md',
  '05bis_Grille_qualite.md',
  '06_Synthese_maitresse.md',
  '07_Tueur_hypotheses.md',
  '08_Carte_connaissances.md',
  '09_Test_et_alors.md',
  '09bis_Certitude_preuves.md',
  '10_Limites_reflexivite.md',
  'Annexes/Journal_exclusions.md',
  'Annexes/Tableaux_corpus.csv',
  'Annexes/Visualisations_suggerees.md',
  'README.md',
] as const

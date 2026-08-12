// ─── Types pour le module Cadrage préalable (ThesisFrame) ────────

/** Clés des champs du cadrage */
export const CADRAGE_FIELD_KEYS = [
  'thematique',
  'problematique',
  'questions_recherche',
  'objectifs',
  'hypotheses',
  'type_recherche',
  'methodologie',
  'type_revue_litterature',
  'cadre_theorique',
  'mots_cles',
  'contribution_attendue',
  'type_these',
] as const

export type CadrageFieldKey = (typeof CADRAGE_FIELD_KEYS)[number]

/** Champs obligatoires pour considérer le cadrage « complet » */
export const REQUIRED_FIELDS: CadrageFieldKey[] = [
  'thematique',
  'problematique',
  'questions_recherche',
  'objectifs',
  'type_recherche',
  'methodologie',
  'type_revue_litterature',
  'type_these',
]

/** Métadonnées d'affichage pour chaque champ */
export interface CadrageFieldDef {
  key: CadrageFieldKey
  label: string
  description: string
  placeholder: string
  required: boolean
  multiLine: boolean
  /** Pour les champs à sous-structure JSON (questions_recherche, objectifs, etc.) */
  hasSubFields?: boolean
  /** Champ masquable (ex: hypothèses en qualitatif) */
  optional?: boolean
  optionalCondition?: string
}

/** Définition complète des 12 champs */
export const CADRAGE_FIELDS: CadrageFieldDef[] = [
  {
    key: 'thematique',
    label: 'Thématique générale',
    description: 'Le champ disciplinaire et le sujet général, en une phrase.',
    placeholder: 'En une phrase, de quoi traite votre recherche ?',
    required: true,
    multiLine: false,
  },
  {
    key: 'problematique',
    label: 'Problématique',
    description: 'La tension, le manque ou le problème non résolu qui justifie la recherche — distinct de la question de recherche.',
    placeholder: 'Qu\'est-ce qui, dans l\'état actuel des connaissances ou des pratiques, ne fonctionne pas, manque, ou reste contesté ?',
    required: true,
    multiLine: true,
  },
  {
    key: 'questions_recherche',
    label: 'Question(s) de recherche',
    description: 'La ou les questions précises, opérationnalisables, auxquelles la thèse répond.',
    placeholder: 'Si votre thèse ne répondait qu\'à une seule question, laquelle serait-ce ?',
    required: true,
    multiLine: true,
    hasSubFields: true,
  },
  {
    key: 'objectifs',
    label: 'Objectifs',
    description: 'Objectif général + objectifs spécifiques (déclinaison opérationnelle).',
    placeholder: 'Que cherchez-vous à accomplir concrètement ?',
    required: true,
    multiLine: true,
    hasSubFields: true,
  },
  {
    key: 'hypotheses',
    label: 'Hypothèses',
    description: 'Propositions à tester (optionnel en recherche qualitative exploratoire).',
    placeholder: 'Quelles propositions cherchez-vous à tester ou vérifier ?',
    required: false,
    multiLine: true,
    optional: true,
    optionalCondition: 'Non obligatoire en recherche qualitative exploratoire.',
  },
  {
    key: 'type_recherche',
    label: 'Type de recherche',
    description: 'Quantitative, qualitative, mixte ou recherche par le projet.',
    placeholder: 'Quel type de recherche avez-vous choisi et pourquoi ?',
    required: true,
    multiLine: true,
    hasSubFields: true,
  },
  {
    key: 'methodologie',
    label: 'Méthodologie envisagée',
    description: 'Méthodes de collecte, unité d\'analyse, terrain/corpus, limites anticipées.',
    placeholder: 'Comment allez-vous collecter et analyser vos données ?',
    required: true,
    multiLine: true,
    hasSubFields: true,
  },
  {
    key: 'type_revue_litterature',
    label: 'Type de revue de littérature',
    description: 'Narrative, systématique (PRISMA), scoping review, thématique/critique ou méta-synthèse qualitative.',
    placeholder: 'Voulez-vous couvrir exhaustivement un sous-champ (systématique) ou construire un dialogue argumenté (narrative/thématique) ?',
    required: true,
    multiLine: true,
    hasSubFields: true,
  },
  {
    key: 'cadre_theorique',
    label: 'Cadre théorique / conceptuel',
    description: 'Cadres, concepts ou auteurs de référence mobilisés. L\'IA ne nommera jamais d\'auteurs précis non vérifiés.',
    placeholder: 'Quels cadres ou familles d\'approches allez-vous mobiliser ?',
    required: false,
    multiLine: true,
  },
  {
    key: 'mots_cles',
    label: 'Mots-clés',
    description: '5 à 8 termes disciplinaires larges et spécifiques au projet.',
    placeholder: 'Quels termes seraient utiles pour indexer et rechercher votre travail ?',
    required: false,
    multiLine: false,
  },
  {
    key: 'contribution_attendue',
    label: 'Contribution attendue / originalité',
    description: 'Ce que la thèse apportera qui n\'existe pas encore (empirique, théorique, méthodologique ou pratique).',
    placeholder: 'Qu\'apporterez-vous de nouveau ?',
    required: false,
    multiLine: true,
  },
  {
    key: 'type_these',
    label: 'Type de thèse / contraintes institutionnelles',
    description: 'Classique monographique, par articles/compilation, par thème ou format spécifique.',
    placeholder: 'Quel format de thèse vous est imposé ou avez-vous choisi ?',
    required: true,
    multiLine: false,
  },
]

/** Valeur d'un champ côté frontend */
export interface CadrageFieldValue {
  key: CadrageFieldKey
  value: string
  meta?: string // JSON for sub-fields
  isAiSuggestion: boolean
  editedByUser: boolean
}

/** État complet du cadrage côté frontend */
export interface CadrageData {
  id: string
  thesisId: string
  status: 'provisoire' | 'valide' | 'revise'
  version: number
  fields: CadrageFieldValue[]
  coherenceRemarks?: CoherenceRemark[]
}

/** Remarque de cohérence retournée par l'IA */
export interface CoherenceRemark {
  field: string
  severity: 'info' | 'warning' | 'error'
  message: string
}

/** Sous-structure pour questions de recherche */
export interface QuestionsRecherche {
  principale: string
  secondaires: string[]
}

/** Sous-structure pour objectifs */
export interface ObjectifsCadrage {
  general: string
  specifiques: string[]
}

/** Sous-structure pour type de recherche */
export interface TypeRecherche {
  type: 'quantitative' | 'qualitative' | 'mixte' | 'recherche_projet'
  justification: string
}

/** Sous-structure pour méthodologie */
export interface MethodologieCadrage {
  methodes_collecte: string[]
  unite_analyse: string
  justification_unite_analyse: string
  terrain_corpus: string
  limites_anticipees: string
}

/** Sous-structure pour type de revue de littérature */
export interface TypeRevueLitterature {
  type: 'narrative' | 'systematique' | 'scoping' | 'thematique' | 'meta_synthese'
  justification: string
}

/** Sous-structure pour mots-clés */
export interface MotsCles {
  disciplinaires: string[]
  specifiques_projet: string[]
}

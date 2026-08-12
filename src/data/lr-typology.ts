/**
 * Typologie des revues de littérature — données structurées extraites de la
 * comparison framework LR / SLR / Meta-Analysis.
 *
 * Source inspirée : lymphoedemaeducation.com.au
 *
 * Utilisée par :
 *   - Le mode « systematic-review » dans /api/ai-writing
 *   - Le mode « lr-audit » dans /api/directeur-chat
 *   - La fiche de guidance FICHE_REVUE_LITTERATURE
 */

export type LRType = 'narrative' | 'systematic' | 'meta-analysis'

export interface LRDimension {
  id: string
  label: string
  narrative: string
  systematic: string
  metaAnalysis: string
}

/**
 * Comparaison structurée des 3 types de revue sur 6 dimensions clés.
 */
export const LR_DIMENSIONS: LRDimension[] = [
  {
    id: 'purpose',
    label: 'Objectif',
    narrative: 'Vue d\'ensemble complète et analyse critique pour cartographier l\'état des connaissances, identifier les lacunes et offrir des perspectives.',
    systematic: 'Répondre à une question de recherche spécifique de manière rigoureuse et reproductible.',
    metaAnalysis: 'Répondre à une question de recherche spécifique en produisant une estimation quantitative précise d\'un effet (taille d\'effet).',
  },
  {
    id: 'scope',
    label: 'Périmètre',
    narrative: 'Peut être large. Inclut divers types d\'études. Vise à informer sur l\'état du domaine plutôt qu\'à répondre à une question ciblée.',
    systematic: 'Répondre à une question particulière en identifiant, évaluant et synthétisant systématiquement toutes les études pertinentes.',
    metaAnalysis: 'Même approche que la revue systématique, mais se concentre exclusivement sur les études fournissant des données quantitatives extractibles.',
  },
  {
    id: 'search',
    label: 'Processus de recherche et méthodologie',
    narrative: 'La sélection des études repose sur le jugement du chercheur. Processus souple et moins structuré.',
    systematic: 'Processus de recherche exhaustif et hautement structuré suivant un protocole reproductible (ex. PRISMA).',
    metaAnalysis: 'Processus de recherche exhaustif et hautement structuré (ex. PRISMA), combiné à une analyse statistique des données collectées.',
  },
  {
    id: 'inclusion',
    label: 'Critères d\'inclusion',
    narrative: 'Inclusion basée sur la pertinence ou la discrétion de l\'auteur.',
    systematic: 'Critères d\'inclusion et d\'exclusion stricts, appliqués de manière cohérente à toutes les études identifiées pour réduire le biais et garantir des preuves de haute qualité.',
    metaAnalysis: 'Mêmes critères stricts que la revue systématique, avec une exigence supplémentaire : seuls les études fournissant des données quantitatives extractibles sont retenues.',
  },
  {
    id: 'synthesis',
    label: 'Analyse et synthèse',
    narrative: 'Synthèse narrative et critique des études incluses.',
    systematic: 'Synthèse narrative hautement structurée et qualitative des études incluses.',
    metaAnalysis: 'Synthèse narrative qualitative ET synthèse quantitative des données de multiples études via des procédures statistiques (taille d\'effet pondérée, hétérogénéité).',
  },
  {
    id: 'publication',
    label: 'Format de publication',
    narrative: 'Généralement publié comme article de revue ou chapitre de thèse.',
    systematic: 'Publié comme article de revue ou article de recherche, sous des lignes directrices de rapport strictes (PRISMA).',
    metaAnalysis: 'Publié au sein d\'une revue systématique ou comme article quantitatif autonome.',
  },
]

/**
 * Critères PRISMA 2020 — checklist minimale pour une revue systématique.
 * Utilisée par le mode « systematic-review » et le mode « lr-audit ».
 */
export const PRISMA_CHECKLIST = [
  { id: 'title', label: 'Titre', description: 'Identifier le rapport comme revue systématique, méta-analyse, ou les deux.' },
  { id: 'abstract', label: 'Résumé (Abstract)', description: 'Résumé structuré incluant : contexte, objectif, sources de données, critères de sélection, participants/interventions, appraisal/synthèse, résultats, limites, conclusions, numéro d\'enregistrement.' },
  { id: 'protocol', label: 'Protocole et enregistrement', description: 'Indiquer si un protocole existe, s\'il a été enregistré (ex. PROSPERO), et s\'il est accessible.' },
  { id: 'eligibility', label: 'Critères d\'éligibilité', description: 'Spécifier les critères d\'inclusion et d\'exclusion et les justifier (caractéristiques des participants, interventions, comparateurs, résultats, designs d\'étude).' },
  { id: 'info-sources', label: 'Sources d\'information', description: 'Décrire toutes les bases de données consultées, les dates de recherche, les filtres linguistiques.' },
  { id: 'search-strategy', label: 'Stratégie de recherche', description: 'Présenter la stratégie de recherche complète avec tous les termes, opérateurs booléens et filtres pour au moins une base.' },
  { id: 'study-selection', label: 'Sélection des études', description: 'Décrire le processus de sélection (dédoublonnage, criblage, éligibilité) et le nombre d\'études à chaque étape (flow diagram).' },
  { id: 'data-items', label: 'Items de collecte de données', description: 'Lister et définir toutes les variables collectées (ex. PICO, caractéristiques de l\'échantillon, résultats).' },
  { id: 'risk-bias', label: 'Évaluation du risque de biais', description: 'Décrire les méthodes utilisées pour évaluer le risque de biais individuel des études incluses.' },
  { id: 'synthesis-results', label: 'Synthèse des résultats', description: 'Présenter les résultats de la synthèse qualitative et/ou quantitative (forêt plot, hétérogénéité I²).' },
  { id: 'reporting-bias', label: 'Biais de rapport', description: 'Évaluer la probabilité de biais de publication (funnel plot, test d\'Egger) et son impact.' },
  { id: 'certainty-evidence', label: 'Certitude des preuves', description: 'Évaluer la certitude du corps de preuves (ex. GRADE) pour chaque résultat principal.' },
] as const

/**
 * Profiles de comportement — comment l\'IA doit adapter sa réponse
 * en fonction du type de revue de littérature déclaré par le doctorant.
 */
export const LR_TYPE_PROFILE: Record<LRType, {
  label: string
  description: string
  synthesisStyle: string
  citationExpectation: string
  structureGuidance: string
  commonPitfalls: string[]
}> = {
  narrative: {
    label: 'Revue de littérature narrative',
    description: 'Vue d\'ensemble critique d\'un domaine, sans protocole de recherche formel. Souvent utilisée comme chapitre introductoire de thèse.',
    synthesisStyle: 'Synthèse narrative thématique, chronologique ou conceptuelle. L\'auteur organise les études par thèmes, écoles de pensée ou périodes.',
    citationExpectation: 'Citations sélectives mais pertinentes. L\'auteur privilégie les travaux fondateurs, les revues récentes et les études emblématiques. Le hedging académique est essentiel.',
    structureGuidance: '1. Introduction au domaine\n2. Organisation thématique ou chronologique\n3. Synthèse des convergences et divergences\n4. Identification des lacunes\n5. Transition vers la problématique de l\'étude',
    commonPitfalls: [
      'Empiler des résumés d\'articles sans synthèse ni critique',
      'Manquer de structure logique (pas de fil conducteur)',
      'Ignorer les contre-preuves et les débats internes au domaine',
      'Confondre revue narrative et revue systématique dans la méthode décrite',
    ],
  },
  systematic: {
    label: 'Revue systématique de littérature (SLR)',
    description: 'Méthode rigoureuse et reproductible conçue pour répondre à une question de recherche spécifique via un protocole structuré (PRISMA).',
    synthesisStyle: 'Synthèse narrative hautement structurée suivant le protocole PRISMA. Chaque étape du processus de recherche doit être documentée et reproductible.',
    citationExpectation: 'Citations exhaustives et systématiques. Chaque critère méthodologique doit être étayé par une référence méthodologique (ex. Cochrane Handbook).',
    structureGuidance: '1. Protocole (objectif, question PICO, critères d\'éligibilité)\n2. Stratégie de recherche (bases, termes, filtres)\n3. Processus de sélection (flow diagram PRISMA)\n4. Extraction des données\n5. Évaluation de la qualité (risque de biais)\n6. Synthèse et interprétation\n7. Limites et perspectives',
    commonPitfalls: [
      'Appeler la revue « systématique » sans suivre PRISMA',
      'Critères d\'éligibilité vagues ou non justifiés',
      'Absence de flow diagram documentant le processus de sélection',
      'Ne pas évaluer le risque de biais des études incluses',
      'Manquer de reproductibilité dans la stratégie de recherche',
    ],
  },
  'meta-analysis': {
    label: 'Méta-analyse',
    description: 'Technique statistique quantitative appliquée au sein d\'une revue systématique pour produire une estimation combinée de la taille d\'effet.',
    synthesisStyle: 'Synthèse quantitative utilisant des procédures statistiques : calcul des tailles d\'effet pondérées, test d\'hétérogénéité (I², Q de Cochran), forêt plot, analyse de sous-groupes, méta-régression.',
    citationExpectation: 'Citations des études primaires (données quantitatives) ET des références méthodologiques (Higgins & Green, Cochrane Handbook, Borenstein et al.).',
    structureGuidance: '1. Protocole + question PICO\n2. Stratégie de recherche (comme SLR)\n3. Sélection et extraction (comme SLR)\n4. Évaluation du risque de biais\n5. Extraction des données quantitatives (tailles d\'effet)\n6. Analyse statistique (modèle à effets fixes/aléatoires, hétérogénéité)\n7. Analyse de sensibilité\n8. Biais de publication (funnel plot)\n9. Certitude des preuves (GRADE)\n10. Synthèse et conclusions',
    commonPitfalls: [
      'Combiner des études hétérogènes sans justification (I² élevé ignoré)',
      'Ne pas rapporter l\'hétérogénéité ni les modèles utilisés (fixes vs aléatoires)',
      'Oublier l\'analyse de sensibilité et le biais de publication',
      'Confondre la méta-analyse avec une simple revue systématique narrative',
      'Ne pas utiliser l\'échelle GRADE pour évaluer la certitude des preuves',
    ],
  },
}

/**
 * Question PICO — structure standard pour formuler une question de recherche
 * en revue systématique / méta-analyse.
 */
export const PICO_FRAMEWORK = {
  P: { label: 'Population / Participants', description: 'Qui sont les sujets ou l\'objet d\'étude ?', examples: ['Patients adultes diabétiques de type 2', 'Étudiants universitaires en sciences sociales', 'Entreprises de moins de 50 employés'] },
  I: { label: 'Intervention / Exposition / Phénomène étudié', description: 'Quelle est l\'intervention, le facteur ou le phénomène investigué ?', examples: ['Programme d\'éducation thérapeutique', 'Utilisation d\'outils IA dans l\'enseignement', 'Transition numérique des PME'] },
  C: { label: 'Comparateur / Contrôle', description: 'À quoi l\'intervention est-elle comparée ?', examples: ['Prise en charge standard', 'Absence d\'intervention', 'Méthode traditionnelle'] },
  O: { label: 'Résultats (Outcomes)', description: 'Quels sont les critères de jugement mesurés ?', examples: ['Hémoglobine glyquée (HbA1c)', 'Performance académique', 'Taux de survie à 5 ans'] },
} as const

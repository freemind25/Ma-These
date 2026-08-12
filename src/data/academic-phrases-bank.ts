/**
 * Banque de phrases académiques — phrases prêtes à l'emploi pour la rédaction.
 *
 * Sources (adaptées du français) :
 *   - 10 Academic Phrases to Compare Journal Articles (Proofreadingepic)
 *   - Literature Review Paragraph Structure (Proofreadingepic)
 *   - literature-review-template-20.docx (UCT)
 *   - Research Objective Writing Template (Proofreadingepic)
 */

export interface PhraseCategory {
  id: string
  title: string
  description: string
  icon: string
  color: string
  phrases: PhraseItem[]
}

export interface PhraseItem {
  id: string
  phrase: string
  example?: string
  usage: 'comparaison' | 'contraste' | 'support' | 'transition' | 'introduction' | 'objectif' | 'conclusion'
}

// ─── 1. Phrases pour comparer des études ────────────────────────

const COMPARISON_PHRASES: PhraseItem[] = [
  {
    id: 'similarly',
    phrase: 'De même, {auteur} ({année}) a constaté que…',
    example: 'De même, Tan et al. (2023) ont constaté que la qualité de service influençait significativement la satisfaction client.',
    usage: 'comparaison',
  },
  {
    id: 'consistent-with',
    phrase: 'Ces résultats sont conformes aux conclusions de {auteur} ({année}).',
    example: 'Ces résultats sont conformes aux conclusions de Ahmad et al. (2021).',
    usage: 'comparaison',
  },
  {
    id: 'likewise',
    phrase: 'De la même manière, {auteur} ({année}) ont observé des tendances similaires…',
    example: 'De la même manière, Lee et Wong (2020) ont observé des tendances similaires parmi les consommateurs malaisiens.',
    usage: 'comparaison',
  },
  {
    id: 'previous-demonstrated',
    phrase: 'Des études antérieures ont démontré que…',
    example: 'Des études antérieures ont démontré que la satisfaction client affectait positivement l\'intention de rachat.',
    usage: 'comparaison',
  },
  {
    id: 'this-finding-supports',
    phrase: 'Ce résultat appuie le travail de {auteur} ({année}), qui a soutenu que…',
    example: 'Ce résultat appuie le travail de Smith (2022), qui a soutenu que la confiance est un prédicteur clé de la fidélité.',
    usage: 'support',
  },
  {
    id: 'in-line-with',
    phrase: 'Ces résultats vont dans le sens de…',
    example: 'Ces résultats vont dans le sens des travaux précédents sur le rôle médiateur de l\'engagement.',
    usage: 'comparaison',
  },
]

// ─── 2. Phrases pour opposer / nuancer ────────────────────────

const CONTRAST_PHRASES: PhraseItem[] = [
  {
    id: 'in-contrast',
    phrase: 'En revanche, {auteur} ({année}) n\'a trouvé aucune relation significative entre…',
    example: 'En revanche, Lim (2022) n\'a trouvé aucune relation significative entre les deux variables.',
    usage: 'contraste',
  },
  {
    id: 'contrary-to',
    phrase: 'Contrairement aux études précédentes, cette recherche a trouvé que…',
    example: 'Contrairement aux études précédentes, cette recherche a trouvé que le prix n\'avait aucun effet significatif sur l\'intention d\'achat.',
    usage: 'contraste',
  },
  {
    id: 'however',
    phrase: 'Cependant, plusieurs chercheurs ont rapporté des résultats contradictoires.',
    usage: 'contraste',
  },
  {
    id: 'on-the-other-hand',
    phrase: 'D\'un autre côté, {auteur} ({année}) a suggéré que…',
    example: 'D\'un autre côté, Johnson (2021) a suggéré que la valeur perçue avait une influence plus forte que la qualité de service.',
    usage: 'contraste',
  },
  {
    id: 'despite-similarities',
    phrase: 'Malgré ces similitudes, la présente étude diffère en termes de…',
    example: 'Malgré ces similitudes, la présente étude diffère en termes de cadre et de population cible.',
    usage: 'contraste',
  },
  {
    id: 'whereas',
    phrase: 'Alors que {auteur} ({année}) a trouvé…, les présents résultats montrent…',
    usage: 'contraste',
  },
]

// ─── 3. Structure de paragraphe de revue de littérature ─────────

const LR_PARAGRAPH_STRUCTURE: PhraseItem[] = [
  {
    id: 'lr-topic-sentence',
    phrase: '[Phrase d\'ancrage] — Introduisez le thème ou la variable.',
    example: 'La qualité de service est largement reconnue comme l\'un des déterminants clés de la satisfaction client.',
    usage: 'introduction',
  },
  {
    id: 'lr-evidence',
    phrase: '[Preuves] — Résumez 2 à 3 études pertinentes.',
    example: 'Ahmad et al. (2023) ont trouvé que la qualité de service influençait positivement la satisfaction des acheteurs en ligne. De même, Lim et Tan (2022) ont rapporté une relation significative dans le commerce de détail malaisien.',
    usage: 'comparaison',
  },
  {
    id: 'lr-compare',
    phrase: '[Comparaison] — Ne vous contentez pas de résumer, comparez.',
    example: 'Cependant, Wong (2024) a trouvé que la qualité de service n\'avait qu\'une faible influence chez les jeunes consommateurs, suggérant que les différences démographiques pourraient affecter la relation.',
    usage: 'contraste',
  },
  {
    id: 'lr-critical',
    phrase: '[Analyse critique] — Que signifient ces résultats ?',
    example: 'Ces résultats incohérents indiquent que la relation pourrait varier selon les secteurs et les caractéristiques des répondants.',
    usage: 'conclusion',
  },
  {
    id: 'lr-link',
    phrase: '[Lien vers votre étude] — Connectez à votre recherche.',
    example: 'Par conséquent, une investigation plus poussée est nécessaire pour examiner cette relation chez les étudiants universitaires malaisiens.',
    usage: 'transition',
  },
]

// ─── 4. Modèles d'objectifs de recherche ────────────────────────

const RESEARCH_OBJECTIVE_TEMPLATES: PhraseItem[] = [
  {
    id: 'obj-relationship',
    phrase: 'Examiner la relation entre [Variable Indépendante] et [Variable Dépendante] au sein de [Population cible].',
    usage: 'objectif',
  },
  {
    id: 'obj-effect',
    phrase: 'Déterminer l\'effet de [Variable Indépendante] sur [Variable Dépendante] au sein de [Population cible].',
    usage: 'objectif',
  },
  {
    id: 'obj-comparison',
    phrase: 'Comparer [Variable] entre [Groupe A] et [Groupe B].',
    usage: 'objectif',
  },
  {
    id: 'obj-mediation',
    phrase: 'Examiner l\'effet médiateur de [Médiateur] sur la relation entre [VI] et [VD].',
    usage: 'objectif',
  },
  {
    id: 'obj-moderation',
    phrase: 'Investiguer si [Modérateur] modère la relation entre [VI] et [VD].',
    usage: 'objectif',
  },
]

// ─── 5. Phrases d'introduction de section ────────────────────────

const INTRO_SECTION_PHRASES: PhraseItem[] = [
  {
    id: 'recent-work',
    phrase: 'Les travaux récents dans le domaine montrent que…',
    usage: 'introduction',
  },
  {
    id: 'generally-assumed',
    phrase: 'Il est généralement admis que…',
    usage: 'introduction',
  },
  {
    id: 'this-review-considers',
    phrase: 'Cette revue examine…',
    usage: 'introduction',
  },
  {
    id: 'this-discussion-focuses',
    phrase: 'Cette discussion se concentre sur…',
    usage: 'introduction',
  },
  {
    id: 'outline-structure',
    phrase: 'La revue est divisée en trois sections principales. Premièrement, … est examiné ; deuxièmement, … est analysé ; enfin, … est discuté.',
    usage: 'introduction',
  },
]

// ─── Assemblage des catégories ───────────────────────────────────

export const ACADEMIC_PHRASE_CATEGORIES: PhraseCategory[] = [
  {
    id: 'comparison',
    title: 'Comparer des études',
    description: 'Phrases pour aligner vos résultats ou votre revue avec des études précédentes.',
    icon: 'GitCompareArrows',
    color: 'emerald',
    phrases: COMPARISON_PHRASES,
  },
  {
    id: 'contrast',
    title: 'Opposer / Nuancer',
    description: 'Phrases pour signaler des divergences ou des contradictions dans la littérature.',
    icon: 'GitBranch',
    color: 'amber',
    phrases: CONTRAST_PHRASES,
  },
  {
    id: 'lr-paragraph',
    title: 'Structure d\'un paragraphe de RL',
    description: 'Le modèle en 5 parties pour chaque paragraphe de votre revue de littérature.',
    icon: 'AlignLeft',
    color: 'violet',
    phrases: LR_PARAGRAPH_STRUCTURE,
  },
  {
    id: 'objectives',
    title: 'Modèles d\'objectifs de recherche',
    description: 'Formules types pour rédiger des objectifs clairs selon le type de relation étudiée.',
    icon: 'Target',
    color: 'rose',
    phrases: RESEARCH_OBJECTIVE_TEMPLATES,
  },
  {
    id: 'intro-section',
    title: 'Phrases d\'introduction de section',
    description: 'Formules pour ouvrir une section de revue ou introduire un thème.',
    icon: 'Type',
    color: 'sky',
    phrases: INTRO_SECTION_PHRASES,
  },
]

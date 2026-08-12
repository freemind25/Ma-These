/**
 * Guide de méthodologie de recherche
 * Guide général de méthodologie scientifique
 */

export interface MethodoStep {
  id: string
  title: string
  description: string
  details: string[]
}

export interface ResearchType {
  id: string
  title: string
  description: string
  characteristics: string[]
  icon: string
  color: string
}

export interface ProblématiqueItem {
  id: string
  question: string
  description: string
  example: string
}

export interface OperalisationExample {
  concept: string
  dimensions: { label: string; indicateurs: string[] }[]
}

export interface CollectTool {
  id: string
  title: string
  description: string
  avantages: string[]
  limites: string[]
  conseils: string[]
  icon: string
}

export interface DocumentSource {
  id: string
  name: string
  type: string
  url?: string
  description: string
}

// ─── Cycle de la recherche ────────────────────────────────────────
export const researchCycle: MethodoStep[] = [
  {
    id: 'question',
    title: 'Formulation de la question de recherche',
    description: 'Question claire et précise, justification de l\'importance, identification des lacunes dans les connaissances existantes.',
    details: [
      'Identifier un sujet pertinent et original',
      'Délimiter le cadre spatial et temporel',
      'Montrer l\'intérêt scientifique et pratique',
      'Obtenir l\'aval du directeur de recherche',
    ],
  },
  {
    id: 'hypotheses',
    title: 'Formulation d\'hypothèses testables',
    description: 'Propositions testables déduites à partir de théories ou d\'observations préalables.',
    details: [
      'L\'hypothèse doit partir d\'une observation empirique',
      'Elle doit être vérifiable dans la réalité',
      'Elle doit être cohérente avec les connaissances existantes',
    ],
  },
  {
    id: 'bibliography',
    title: 'Recherche approfondie des travaux existants',
    description: 'Synthèse des connaissances actuelles et identification des théories et concepts.',
    details: [
      'Consultation des bases de données (ScienceDirect, JSTOR, HAL, Persée…)',
      'Recherche dans les catalogues (SUDOC, WorldCat, BNF, SNDL)',
      'Utilisation de Google Scholar et Theses.fr',
      'Constitution du corpus d\'étude',
    ],
  },
  {
    id: 'methodology',
    title: 'Choix de la méthodologie',
    description: 'Définition de l\'échantillon, choix des outils d\'analyse, sélection des méthodes de collecte.',
    details: [
      'Définir la population étudiée et l\'échantillon',
      'Choisir entre approche quantitative, qualitative ou mixte',
      'Sélectionner les outils de collecte (questionnaire, entretien, observation…)',
      'Assurer la fiabilité et la validité des données',
    ],
  },
  {
    id: 'collect',
    title: 'Collecte des données',
    description: 'Mise en œuvre des méthodes de collecte sur le terrain.',
    details: [
      'Préparer les instruments de collecte',
      'Réaliser les entretiens ou administrer les questionnaires',
      'Effectuer les observations de terrain',
      'Organiser et stocker les données collectées',
    ],
  },
  {
    id: 'analyse',
    title: 'Analyse des données',
    description: 'Traitement et organisation des données, utilisation d\'outils statistiques ou autres techniques d\'analyse.',
    details: [
      'Coder et nettoyer les données',
      'Appliquer les outils d\'analyse appropriés',
      'Interpréter les résultats',
      'Comparer les résultats avec les hypothèses',
    ],
  },
  {
    id: 'discussion',
    title: 'Discussion et interprétation',
    description: 'Discussion des implications des résultats, identification des limites de l\'étude.',
    details: [
      'Mettre en relation les résultats avec la littérature',
      'Discuter des implications théoriques et pratiques',
      'Identifier les limites de l\'étude',
      'Proposer des recommandations',
    ],
  },
  {
    id: 'publication',
    title: 'Publication des résultats',
    description: 'Rédaction, présentation lors de conférences, synthèse des principaux résultats.',
    details: [
      'Rédiger selon les normes scientifiques (IMRaD)',
      'Présenter lors de conférences ou séminaires',
      'Formuler des conclusions claires et concises',
      'Suggérer des pistes pour de futures recherches',
    ],
  },
]

// ─── Types de recherche ──────────────────────────────────────────
export const researchTypes: ResearchType[] = [
  {
    id: 'quantitative',
    title: 'Recherche quantitative',
    description: 'Mesure et quantification des phénomènes à l\'aide d\'outils statistiques. Vise l\'objectivité et la reproductibilité.',
    characteristics: [
      'Données chiffrées et mesurables',
      'Échantillons représentatifs de grande taille',
      'Questionnaires à questions fermées',
      'Analyses statistiques (descriptive, inférentielle)',
      'Hypothèses testées par des méthodes formelles',
      'Objectivité et reproductibilité',
    ],
    icon: 'BarChart3',
    color: 'sky',
  },
  {
    id: 'qualitative',
    title: 'Recherche qualitative',
    description: 'Compréhension en profondeur des phénomènes à travers les expériences vécues et les significations.',
    characteristics: [
      'Données textuelles, narratives ou visuelles',
      'Échantillons restreints et ciblés',
      'Entretiens semi-directifs, observations participantes',
      'Analyses thématiques et de contenu',
      'Émergence de catégories et de théories',
      'Subjectivité assumée comme richesse',
    ],
    icon: 'MessageSquare',
    color: 'amber',
  },
  {
    id: 'mixte',
    title: 'Recherche mixte (mixte)',
    description: 'Combinaison des approches quantitative et qualitative pour une compréhension complète du phénomène.',
    characteristics: [
      'Triangulation des données (quantitatives + qualitatives)',
      'Design séquentiel ou concurrent',
      'Complémentarité des résultats',
      'Validation croisée des findings',
      'Richesse et profondeur de l\'analyse',
      'Adaptée aux problématiques complexes',
    ],
    icon: 'FlaskConical',
    color: 'emerald',
  },
]

// ─── Démarches inductive / déductive ──────────────────────────────
export const reasoningApproaches = {
  inductive: {
    title: 'Démarche inductive',
    subtitle: 'Du particulier au général',
    description: 'À partir d\'observations empiriques répétées, le chercheur formule une règle générale ou une théorie.',
    example: 'Adam est mortel + Socrate est mortel + … = Tous les hommes sont mortels.',
    steps: ['Observation de cas particuliers', 'Identification de régularités', 'Formulation d\'une généralisation', 'Élaboration d\'une théorie'],
  },
  deductive: {
    title: 'Démarche déductive',
    subtitle: 'Du général au particulier',
    description: 'À partir d\'une théorie ou d\'un énoncé général, le chercheur déduit des conséquences applicables à des cas spécifiques.',
    example: 'SI condition (théorie) ALORS conclusion (prédiction testable)',
    steps: ['Partir d\'une théorie établie', 'Formuler une hypothèse dérivable', 'Observer ou expérimenter', 'Confirmer ou infirmer la prédiction'],
  },
}

// ─── Types de disciplinarité ──────────────────────────────────────
export const disciplinarities = [
  { term: 'Pluridisciplinarité', definition: 'Juxtaposition de disciplines sans intégration.', color: 'slate' },
  { term: 'Multidisciplinarité', definition: 'Utilisation de plusieurs disciplines en parallèle.', color: 'slate' },
  { term: 'Interdisciplinarité', definition: 'Mettre en relation des disciplines pour créer des représentations originales.', color: 'sky' },
  { term: 'Transdisciplinarité', definition: 'Application d\'une méthode commune à travers les disciplines.', color: 'emerald' },
]

// ─── Problématique ────────────────────────────────────────────────
export const problematiqueGuide: ProblématiqueItem[] = [
  {
    id: 'quoi',
    question: 'QUOI ?',
    description: 'Définition de l\'objet — De quoi s\'agit-il exactement ? Quels sont les concepts clés ?',
    example: 'Identifier et définir les variables X et Y du sujet de recherche.',
  },
  {
    id: 'comment',
    question: 'COMMENT ?',
    description: 'Explication du processus — Par quels mécanismes X influence-t-il Y ?',
    example: 'Décrire les liens causaux et les relations entre les variables étudiées.',
  },
  {
    id: 'pourquoi',
    question: 'POURQUOI ?',
    description: 'Exposé de la finalité — Quel est l\'intérêt scientifique et pratique de cette recherche ?',
    example: 'Justifier la pertinence et l\'originalité de la démarche dans le contexte actuel.',
  },
]

export const problematiqueConseils = [
  'La problématique doit être centrale par rapport au sujet — pas un point secondaire.',
  'Elle doit tenir compte du facteur TEMPS, ESPACE et de la nature des INTERVENANTS.',
  'Elle doit annoncer une idée directrice pour la suite du travail.',
  'Elle doit esquisser une démarche démonstrative suivie tout au long de la rédaction.',
  'Elle doit recevoir l\'aval du directeur de recherche.',
  'Le titre de recherche prend généralement la forme d\'une AFFIRMATION (X influence Y chez Z), et non d\'une question.',
]

// ─── Opérationnalisation ──────────────────────────────────────────
export const operationalisationConcept: {
  title: string
  description: string
  steps: string[]
} = {
  title: 'L\'opérationnalisation',
  description: 'Processus de transformation de concepts abstraits en observations mesurables. Définir comment un concept peut être mesuré, observé ou manipulé.',
  steps: [
    'Identifier les CONCEPTS clés de la recherche (ex : "utilisation des médias sociaux", "dépression")',
    'Définir les VARIABLES : variable indépendante (X = cause) et variable dépendante (Y = effet)',
    'Sélectionner les DIMENSIONS de chaque concept (ex : fréquence, type, durée…)',
    'Choisir des INDICATEURS mesurables pour chaque dimension (ex : nombre de connexions/jour)',
    'Construire les instruments de mesure adaptés',
  ],
}

export const operationalisationExample: OperalisationExample = {
  concept: 'Ressources d\'une ville',
  dimensions: [
    { label: 'Ressources financières', indicateurs: ['Budget communal', 'Dotations de l\'État', 'Recettes fiscales', 'Investissements privés'] },
    { label: 'Ressources patrimoniales', indicateurs: ['Patrimoine immobilier', 'Patrimoine mobilier', 'Espaces publics', 'Infrastructures'] },
    { label: 'Ressources sociales', indicateurs: ['Niveau d\'emploi', 'Taux d\'activité', 'Diplômés supérieurs', 'Associations'] },
    { label: 'Ressources d\'équipement', indicateurs: ['Services publics', 'Équipements sportifs', 'Établissements scolaires', 'Infrastructures de transport'] },
  ],
}

// ─── Hypothèses ───────────────────────────────────────────────────
export const hypothesesConditions = [
  'L\'hypothèse doit se faire à partir d\'une observation empirique ou d\'une étude préalable.',
  'L\'hypothèse doit pouvoir être vérifiable dans la réalité.',
  'L\'hypothèse doit être cohérente avec les connaissances existantes.',
]

export const hypothesesVerification = [
  'Par l\'expérience : vérification empirique directe sur le terrain.',
  'Par l\'enquête : collecte de données auprès de la population étudiée.',
  'Par la contre-épreuve : apporter un exemple ou fait qui contredise l\'hypothèse (un seul contre-exemple suffit à invalider).',
  'Par la variation de la preuve : vérifier l\'hypothèse sur des parties différentes d\'un même ensemble.',
]

// ─── Outils de collecte ───────────────────────────────────────────
export const collectTools: CollectTool[] = [
  {
    id: 'entretien',
    title: 'L\'entretien de recherche (semi-directif)',
    description: 'Technique d\'investigation scientifique utilisée auprès d\'individus, permettant de les interroger de façon semi-directive pour connaître en profondeur les informations.',
    avantages: [
      'Permet d\'explorer en profondeur les représentations et les expériences',
      'Flexibilité : adaptation aux réponses de l\'interviewé',
      'Fait émerger des éléments imprévus et de nouvelles hypothèses',
      'Recueil de données riches et nuancées',
    ],
    limites: [
      'Temps de réalisation long',
      'Difficulté d\'analyse et de codage',
      'Subjectivité de l\'enquêteur',
      'Échantillons restreints (≤ 100)',
    ],
    conseils: [
      'Préparer les questions, thèmes et hypothèses en amont',
      'Poser des questions courtes, directes et ciblées',
      'Se focaliser sur la compréhension d\'un phénomène précis, sans divaguer',
      'Poser de nouvelles questions pour faire émerger de nouvelles hypothèses',
      'Entretiens à réponses libres : questions générales sur le sujet au sens large',
      'Entretiens centrés/ciblés : interrogations sur un aspect spécifique',
    ],
    icon: 'MessageSquare',
  },
  {
    id: 'questionnaire',
    title: 'Le questionnaire',
    description: 'Outil de collecte structuré touchant plusieurs sujets, administré à une population restreinte (≤ 100 personnes). Peut comporter des questions fermées ou ouvertes.',
    avantages: [
      'Processus rapide de passation',
      'Facilité de traitement et d\'analyse statistique',
      'Standardisation des réponses',
      'Possibilité de questions fermées et ouvertes',
    ],
    limites: [
      'Profondeur limitée des réponses',
      'Risque de réponses peu réfléchies',
      'Difficulté à capter les nuances',
      'Taux de non-réponse possible',
    ],
    conseils: [
      'Prévoir des questions fermées (gamme de réponses préétablies) ET ouvertes',
      'Tester le questionnaire au préalable (pré-enquête)',
      'Limiter le nombre de questions pour éviter la fatigue',
      'Assurer l\'anonymat pour encourager la sincérité',
    ],
    icon: 'ClipboardList',
  },
  {
    id: 'sondage',
    title: 'Le sondage',
    description: 'Enquête d\'opinion menée sur une large population (des milliers). Processus plus prenant de temps que le questionnaire.',
    avantages: [
      'Représentativité statistique',
      'Généralisation des résultats',
      'Mesure quantitative fiable',
      'Comparaison possible entre groupes',
    ],
    limites: [
      'Mise en œuvre lourde et coûteuse',
      'Réduit la complexité à des chiffres',
      'Ne capte pas les explications profondes',
      'Processus prenant du temps',
    ],
    conseils: [
      'Définir un échantillon représentatif',
      'Utiliser des méthodes d\'échantillonnage rigoureuses',
      'Privilégier les questions fermées à réponse unique',
      'Assurer la fiabilité statistique des résultats',
    ],
    icon: 'BarChart3',
  },
  {
    id: 'observation',
    title: 'L\'observation de terrain',
    description: 'Observation systématique et structurée d\'un phénomène dans son contexte naturel. Utilise une grille d\'observation avec thèmes, sous-thèmes et notes.',
    avantages: [
      'Accès direct au contexte réel',
      'Capture de comportements spontanés',
      'Complémentarité avec les autres outils',
      'Richesse des données contextuelles',
    ],
    limites: [
      'Subjectivité de l\'observateur',
      'Effet d\'observation (modification du comportement)',
      'Difficulté de reproduction',
      'Temps d\'immersion important',
    ],
    conseils: [
      'Préparer une grille d\'observation structurée (thèmes, sous-thèmes, notes)',
      'Observer l\'ambiance, les éléments temporels, l\'espace, le mobilier',
      'Notez les horaires, la météo, les conditions d\'observation',
      'Répéter les observations à différents moments pour valider',
    ],
    icon: 'Eye',
  },
]

// ─── Recherche documentaire ───────────────────────────────────────
export const documentTypes = [
  { type: 'Dictionnaires & Encyclopédies', usage: 'Comprendre le sujet et le préciser, surtout pour les concepts nouveaux' },
  { type: 'Livres / Monographies', usage: 'Approfondir la recherche sur un thème donné' },
  { type: 'Manuels', usage: 'Faire le point sur une question' },
  { type: 'Mémentos', usage: 'Se faire une idée rapide sur un sujet' },
  { type: 'Précis', usage: 'Approfondir un aspect spécifique de la question' },
  { type: 'Actes de colloques', usage: 'Comptes-rendus de congrès et de journées scientifiques' },
  { type: 'Périodiques', usage: 'Articles de revues scientifiques récents' },
  { type: 'Thèses & Mémoires', usage: 'Littérature grise, travaux de recherche universitaires' },
  { type: 'Documents spécifiques', usage: 'Cartes, brevets, images, données statistiques' },
  { type: 'Documentation officielle', usage: 'Lois, règlements, plans, rapports institutionnels' },
]

export const databases: DocumentSource[] = [
  { id: 'sd', name: 'ScienceDirect', type: 'Base pluridisciplinaire', url: 'https://www.sciencedirect.com', description: 'Accès à des milliers de revues scientifiques et d\'articles en texte intégral.' },
  { id: 'jstor', name: 'JSTOR', type: 'Base pluridisciplinaire', url: 'https://www.jstor.org', description: 'Archives de revues académiques, livres et sources primaires.' },
  { id: 'hal', name: 'HAL', type: 'Archive ouverte française', url: 'https://hal.science', description: 'Archive ouverte pluridisciplinaire française — accès gratuit aux publications.' },
  { id: 'persee', name: 'Persée', type: 'Base francophone', url: 'https://www.persee.fr', description: 'Portail de revues scientifiques en sciences humaines et sociales.' },
  { id: 'doaj', name: 'DOAJ', type: 'Base pluridisciplinaire', url: 'https://doaj.org', description: 'Directory of Open Access Journals — revues en accès libre.' },
  { id: 'wok', name: 'Web of Knowledge', type: 'Base pluridisciplinaire', url: 'https://www.webofknowledge.com', description: 'Indexation et citation des publications scientifiques mondiales.' },
  { id: 'cairn', name: 'Cairn', type: 'Bouquet de revues', url: 'https://www.cairn.info', description: 'Revues et ouvrages en sciences humaines et sociales en français.' },
]

export const catalogs: DocumentSource[] = [
  { id: 'sudoc', name: 'SUDOC', type: 'Catalogue collectif', url: 'http://www.sudoc.abes.fr', description: 'Catalogue collectif des universités françaises.' },
  { id: 'worldcat', name: 'WorldCat', type: 'Catalogue mondial', url: 'http://www.worldcat.org', description: 'Catalogue mondial des bibliothèques — trouver des ouvrages partout.' },
  { id: 'bnf', name: 'BnF', type: 'Catalogue national', url: 'http://catalogue.bnf.fr', description: 'Catalogue de la Bibliothèque nationale de France.' },
  { id: 'sndl', name: 'SNDL', type: 'Documentation algérienne', url: 'https://www.sndl.cerist.dz', description: 'Système National de Documentation en Ligne — Algérie.' },
]

export const webResources: DocumentSource[] = [
  { id: 'scholar', name: 'Google Scholar', type: 'Moteur de recherche', url: 'http://scholar.google.fr', description: 'Moteur de recherche spécialisé en littérature académique.' },
  { id: 'books', name: 'Google Books', type: 'Moteur de recherche', url: 'http://books.google.fr', description: 'Recherche dans le contenu des livres numérisés.' },
  { id: 'theses', name: 'Theses.fr', type: 'Portail', url: 'http://www.theses.fr', description: 'Annuaire des thèses soutenues en France.' },
  { id: 'worldwidescience', name: 'WorldWideScience', type: 'Portail scientifique', url: 'http://worldwidescience.org', description: 'Portail mondial de la science ouverte.' },
  { id: 'cirs', name: 'CIRS', type: 'Centre de recherche', url: 'http://www.cirs.fr', description: 'Centre international de recherche scientifique.' },
]

// ─── Les 15 étapes de la recherche qualitative ─────────────────
export const qualitativeResearchSteps: MethodoStep[] = [
  {
    id: 'qr-question',
    title: 'Définir la question de recherche',
    description: 'Formuler une question claire et ciblée qui explore un phénomène en profondeur.',
    details: [
      'La question doit être ouverte et exploratoire',
      'Éviter les questions qui se répondent par oui/non',
      'Centrer sur l\'expérience vécue et les significations',
      'Assurer la faisabilité dans le temps et les ressources disponibles',
    ],
  },
  {
    id: 'qr-litterature',
    title: 'Revue de la littérature',
    description: 'Explorer les études existantes pour comprendre ce qui est connu et identifier les lacunes.',
    details: [
      'Consulter les bases de données académiques (HAL, Persée, JSTOR…)',
      'Identifier les théories pertinentes et les débats en cours',
      'Repérer les lacunes (gaps) dans la littérature existante',
      'Construire un cadre théorique solide pour guider l\'analyse',
    ],
  },
  {
    id: 'qr-design',
    title: 'Choisir le design de recherche approprié',
    description: "Sélectionner un design adapté à la question : étude de cas, phénoménologie, théorie enracinée, ethnographie…",
    details: [
      'Étude de cas : analyse approfondie d\'un cas spécifique',
      'Phénoménologie : comprendre l\'expérience vécue',
      'Théorie enracinée (Grounded Theory) : construire une théorie à partir des données',
      'Ethnographie : immersion dans le contexte culturel',
      'Recherche-action : intervenir pour transformer une situation',
    ],
  },
  {
    id: 'qr-participants',
    title: 'Sélectionner les participants',
    description: 'Utiliser un échantillonnage raisonné (purposive) pour choisir des participants capables de fournir des données riches.',
    details: [
      'Échantillonnage raisonné : sélectionner des informateurs clés',
      'Échantillonnage en boule de neige : un participant en réfère un autre',
      'Taille d\'échantillon déterminée par saturation théorique',
      'Diversifier les profils pour enrichir la perspective',
    ],
  },
  {
    id: 'qr-acces',
    title: "Obtenir l'accès et établir la confiance",
    description: 'Établir une relation de confiance avec les participants, expliquer clairement l\'étude et créer un cadre confortable.',
    details: [
      'Obtenir les autorisations institutionnelles nécessaires',
      'Présenter l\'étude de manière transparente et honnête',
      'Garantir la confidentialité et l\'anonymat',
      'Obtenir le consentement éclairé de chaque participant',
    ],
  },
  {
    id: 'qr-collecte',
    title: 'Collecter les données',
    description: "Utiliser des entretiens, des observations ou des focus groups. Être ouvert et attentif aux données émergentes.",
    details: [
      'Entretiens semi-directifs ou non directifs',
      'Observation participante ou non participante',
      'Focus groups pour recueillir des perspectives collectives',
      'Journaux de terrain et notes de terrain',
      'Enregistrement audio (avec autorisation) et retranscription',
    ],
  },
  {
    id: 'qr-notes',
    title: 'Prendre des notes de terrain',
    description: 'Enregistrer les observations, les pensées et les indices non verbaux pendant et après la collecte.',
    details: [
      'Noter les observations immédiatement après chaque session',
      'Inclure le contexte, l\'ambiance, les comportements non verbaux',
      'Séparer les observations des interprétations personnelles',
      'Utiliser un carnet de terrain structuré',
    ],
  },
  {
    id: 'qr-organisation',
    title: 'Gérer et organiser les données',
    description: "Retranscrire les entretiens et organiser systématiquement les données pour faciliter l'analyse.",
    details: [
      'Retranscrire intégralement les entretiens',
      'Utiliser un logiciel d\'analyse qualitative (NVivo, Atlas.ti, MAXQDA)',
      'Créer un système de codage cohérent',
      'Sauvegarder régulièrement les données brutes et traitées',
    ],
  },
  {
    id: 'qr-analyse',
    title: 'Analyser les données',
    description: 'Coder les données, identifier les thèmes et explorer les significations.',
    details: [
      'Codage ouvert : fragmenter les données en unités de sens',
      'Codage axial : relier les catégories entre elles',
      'Codage sélectif : intégrer les catégories autour d\'un thème central',
      'Utiliser l\'analyse thématique ou l\'analyse de contenu',
      'Vérifier la cohérence interne des interprétations',
    ],
  },
  {
    id: 'qr-fiabilite',
    title: "Assurer la rigueur scientifique (trustworthiness)",
    description: "Utiliser la crédibilité, la transférabilité, la dépendance et la confirmabilité pour garantir la rigueur.",
    details: [
      'Crédibilité : triangulation des sources et des méthodes',
      'Transférabilité : descriptions épaisses pour permettre la généralisation',
      'Dépendance : traçabilité des décisions analytiques',
      'Confirmabilité : audit trail et vérification par des pairs',
    ],
  },
  {
    id: 'qr-interpretation',
    title: 'Interpréter les résultats',
    description: 'Relier les thèmes identifiés à la question de recherche et à la littérature existante.',
    details: [
      'Mettre en dialogue les résultats avec le cadre théorique',
      'Expliquer les convergences et divergences avec la littérature',
      'Identifier les résultats inattendus et les surprises analytiques',
      'Formuler des interprétations nuancées et argumentées',
    ],
  },
  {
    id: 'qr-presentation',
    title: 'Présenter les résultats',
    description: "Utiliser des citations riches et des récits clairs pour présenter les résultats de manière significative.",
    details: [
      'Citer directement les participants pour donner de la voix aux données',
      'Utiliser des tableaux thématiques pour organiser les résultats',
      'Équilibrer la description et l\'interprétation',
      'Illustrer avec des exemples concrets et des verbatim',
    ],
  },
  {
    id: 'qr-reflexivite',
    title: 'Exercer la réflexivité',
    description: "Reconnaître les biais du chercheur et comment sa présence a influencé la recherche.",
    details: [
      'Tenir un journal de recherche (research diary)',
      'Identifier ses propres préconceptions et a priori',
      'Documenter comment la relation avec les participants a évolué',
      'Être transparent sur le positionnement épistémologique',
    ],
  },
  {
    id: 'qr-ethique',
    title: 'Considérer les pratiques éthiques',
    description: "Protéger les droits des participants, assurer la confidentialité et obtenir le consentement éclairé.",
    details: [
      'Obtenir l\'avis d\'un comité d\'éthique si nécessaire',
      'Garantir l\'anonymat et la confidentialité des données',
      'Respecter le droit de retrait à tout moment',
      'Sécuriser le stockage des données sensibles',
    ],
  },
  {
    id: 'qr-conclusions',
    title: 'Tirer des conclusions et suggérer des implications',
    description: "Résumer les enseignements clés et suggérer des implications pour la pratique, les politiques ou les futures recherches.",
    details: [
      'Synthétiser les contributions théoriques de l\'étude',
      'Formuler des recommandations pratiques et opérationnelles',
      'Identifier les limites de l\'étude de manière honnête',
      'Proposer des pistes pour de futures recherches',
    ],
  },
]

// ─── Structure de l'introduction ──────────────────────────────────
export const introductionStructure = [
  { step: 'Amener le sujet (Y)', detail: 'Présenter le contexte général, amener progressivement le lecteur vers le sujet.' },
  { step: 'Poser le sujet (X → Y : Z)', detail: 'Formuler la relation entre les variables : X (cause) influence Y (effet) chez Z (population/territoire).' },
  { step: 'Diviser le sujet', detail: 'Délimiter le cadre de l\'étude et l\'optique dans laquelle sera traitée la question.' },
  { step: 'Problématique', detail: 'Reformulation interrogative de l\'intitulé initial (QUOI ? COMMENT ? POURQUOI ?).' },
  { step: 'État de la question', detail: 'Synthétiser "ce que l\'on sait" sur le sujet ou la question choisie.' },
  { step: 'Corpus d\'étude', detail: 'Présenter le support de l\'étude et justifier son choix.' },
  { step: 'Objectifs & Hypothèses', detail: 'Annoncer les grandes lignes du travail et les axes d\'analyse retenus.' },
]

// ─── Le titre ─────────────────────────────────────────────────────
export const titreConseils = [
  'Un bon titre doit contenir la ou les variable(s) à l\'étude (X et Y) ou CONCEPTS.',
  'Il doit indiquer la nature de la relation qui unit ces variables (effet, incidence, influence de X sur Y).',
  'Il doit mentionner le territoire et/ou la population Z à l\'étude (X influence Y chez Z).',
  'Le titre doit être à la fois BREF et PRÉCIS.',
  'Il prend généralement la forme d\'une AFFIRMATION, et non d\'une QUESTION.',
  'La variable Y = thème/sujet étudié ; la variable X = cause possible = problème de recherche.',
]

// ─── Types de variables en recherche ─────────────────────────────────────
export interface VariableType {
  name: string
  definition: string
  example: string
  category: 'cause-effet' | 'contrôle' | 'relation' | 'mesure' | 'modèle'
  color: string
}

export const researchVariables: VariableType[] = [
  {
    name: 'Variable Indépendante (VI)',
    definition: 'La variable manipulée ou modifiée par le chercheur pour observer son effet sur la variable dépendante.',
    example: 'Méthode d\'enseignement (Conventionnelle, En ligne, Hybride)',
    category: 'cause-effet',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    name: 'Variable Dépendante (VD)',
    definition: 'La variable mesurée ou observée pour déterminer l\'effet de la variable indépendante.',
    example: 'Performance des étudiants (Score à l\'examen)',
    category: 'cause-effet',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    name: 'Variable de Contrôle',
    definition: 'Variables maintenues constantes pour empêcher qu\'elles n\'affectent les résultats.',
    example: 'Durée du cours, Même enseignant, Température de la salle',
    category: 'contrôle',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  {
    name: 'Variable Parasite',
    definition: 'Variables autres que la VI qui peuvent influencer la VD. Il faut les identifier et les contrôler.',
    example: 'Motivation de l\'étudiant, Environnement familial',
    category: 'contrôle',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  {
    name: 'Variable Confondante',
    definition: 'Variable parasite corrélée à la fois avec la VI et la VD, créant une fausse relation de causalité.',
    example: "L'intelligence affectant à la fois le temps d'étude et la performance à l'examen",
    category: 'contrôle',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    name: 'Variable Modératrice',
    definition: "Variable qui affecte la force ou la direction de la relation entre la VI et la VD.",
    example: "Le genre modérant l'effet de la méthode d'enseignement sur la performance",
    category: 'relation',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    name: 'Variable Médiatrice',
    definition: "Variable qui explique le mécanisme par lequel la VI affecte la VD. C'est le « pourquoi » de la relation.",
    example: "La motivation médiatisant l'effet de la méthode d'enseignement sur la performance",
    category: 'relation',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    name: 'Variable Intermédiaire',
    definition: "Variable qui se situe entre la VI et la VD mais n'est pas sur le chemin causal direct.",
    example: "Le stress entre la pression au travail (VI) et la satisfaction au travail (VD)",
    category: 'relation',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    name: 'Variable Dichotomique',
    definition: 'Variable avec seulement deux catégories ou résultats possibles.',
    example: 'Genre (Homme/Femme), Réussite (Oui/Non)',
    category: 'mesure',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    name: 'Variable Polythomique',
    definition: 'Variable avec plus de deux catégories sans ordre inhérent.',
    example: 'Groupe sanguin (A, B, AB, O), Statut marital (Célibataire, Marié, Divorcé)',
    category: 'mesure',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    name: 'Variable Continue',
    definition: 'Variable quantitative pouvant prendre toute valeur dans un intervalle (y compris les décimales).',
    example: 'Taille, Poids, Temps, Température',
    category: 'mesure',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    name: 'Variable Discrète',
    definition: 'Variable quantitative prenant des valeurs dénombrables, séparées (généralement des entiers).',
    example: "Nombre d'étudiants, Nombre d'erreurs, Nombre de visites",
    category: 'mesure',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    name: 'Variable Observée',
    definition: 'Variable pouvant être mesurée ou observée directement.',
    example: 'Âge, Salaire, Score au test',
    category: 'mesure',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    name: 'Variable Latente',
    definition: 'Variable non observable directement, déduite à partir d\'autres variables indicatrices.',
    example: 'Intelligence, Attitude, Satisfaction, Image de marque',
    category: 'mesure',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    name: 'Variable Exogène',
    definition: 'Variable qui n\'est influencée par aucune autre variable dans le modèle. Elle agit comme cause.',
    example: "Méthode d'enseignement dans un modèle prédisant la performance",
    category: 'modèle',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    name: 'Variable Endogène',
    definition: "Variable qui est expliquée ou influencée par une ou plusieurs autres variables du modèle.",
    example: "Performance de l'étudiant influencée par la motivation, le temps d'étude, la méthode",
    category: 'modèle',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
]

export const variableCategories = [
  { id: 'cause-effet', label: 'Cause & Effet', color: 'text-blue-700' },
  { id: 'contrôle', label: 'Contrôle & Biais', color: 'text-gray-700' },
  { id: 'relation', label: 'Relations', color: 'text-purple-700' },
  { id: 'mesure', label: 'Types de mesure', color: 'text-green-700' },
  { id: 'modèle', label: 'Modèle causal', color: 'text-orange-700' },
]

// ─── Analyse bibliométrique ─────────────────────────────────────────────
export interface BiblioMethod {
  name: string
  description: string
}

export interface BiblioMetric {
  name: string
  description: string
}

export interface BiblioTool {
  name: string
  description: string
  color: string
}

export const biblioFeatures = [
  'Approche quantitative et statistique',
  'Utilise les données de publications et de citations',
  'Identifie les motifs et les relations',
  'Soutient la prise de décision et la stratégie',
  'Visualise la structure des connaissances',
]

export const biblioPurposes = [
  'Comprendre la croissance et le développement d\'un champ de recherche',
  'Identifier les auteurs, articles, revues et institutions influents',
  'Découvrir les lacunes de recherche et les tendances émergentes',
  'Évaluer la performance et l\'impact de la recherche',
  'Soutenir les revues de littérature et la planification de recherche',
]

export const biblioMethods: BiblioMethod[] = [
  { name: 'Analyse de performance', description: 'Auteurs, revues, pays, institutions' },
  { name: 'Cartographie scientifique (Science Mapping)', description: 'Co-citation, couplage bibliographique, co-auteur' },
  { name: 'Analyse de citations', description: 'Nombre de citations, h-index, facteur d\'impact' },
  { name: 'Analyse de co-mots', description: 'Co-occurrence de mots-clés, cartographie thématique' },
]

export const biblioMetrics: BiblioMetric[] = [
  { name: 'Publications totales', description: 'Nombre total de publications dans un champ ou par un auteur/institution.' },
  { name: 'Citations totales', description: 'Nombre total de fois que les publications ont été citées.' },
  { name: 'h-index', description: 'Métrique qui mesure à la fois la productivité et l\'impact des citations.' },
  { name: 'Citations par article', description: 'Nombre moyen de citations reçues par publication.' },
  { name: 'Facteur d\'impact (Impact Factor)', description: 'Mesure les citations moyennes des articles d\'une revue.' },
  { name: 'Co-auteur', description: 'Indique les motifs de collaboration entre auteurs/pays.' },
  { name: 'Co-citation', description: 'Mesure la fréquence à laquelle deux documents sont cités ensemble.' },
]

export const biblioTools: BiblioTool[] = [
  { name: 'VOSviewer', description: 'Création et visualisation de réseaux bibliométriques', color: 'bg-blue-100 text-blue-800' },
  { name: 'Bibliometrix (R)', description: 'Analyse bibliométrique complète en R', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'CiteSpace', description: 'Détection des tendances émergentes et des sujets en éruption', color: 'bg-amber-100 text-amber-800' },
  { name: 'Scopus / Web of Science', description: 'Extraction de données bibliographiques de haute qualité', color: 'bg-emerald-100 text-emerald-800' },
]

export const biblioProcess = [
  { step: 1, title: 'Collecte des données', detail: 'Récupérer les données depuis les bases (Scopus, Web of Science, Dimensions, etc.)' },
  { step: 2, title: 'Traitement des données', detail: 'Nettoyer et exporter les données dans des formats adaptés (CSV, RIS, BibTeX)' },
  { step: 3, title: 'Analyse', detail: 'Appliquer les méthodes et métriques bibliométriques pour analyser les données.' },
  { step: 4, title: 'Visualisation', detail: 'Créer des cartes, graphiques et réseaux pour visualiser les motifs et tendances.' },
  { step: 5, title: 'Interprétation', detail: 'Interpréter les résultats, tirer des enseignements et identifier les implications.' },
]
// ─── Ressources PDF (pages 1-6) ──────────────────────────────────

export interface LitReviewStage {
  id: string
  stage: string
  question: string
  func: string
  proceduralDifferences: string[]
  sourcesOfInvalidity: string[]
}

export const literatureReviewStages: LitReviewStage[] = [
  {
    id: 'formation',
    stage: 'Formation du problème',
    question: 'Quelles preuves doivent être incluses dans la revue ?',
    func: 'Construire des définitions qui distinguent les études pertinentes des non pertinentes.',
    proceduralDifferences: [
      'Différences dans les définitions opérationnelles incluses.',
      'Différences dans le détail opérationnel.',
    ],
    sourcesOfInvalidity: [
      'Des concepts étroits peuvent rendre les conclusions moins définitives et robustes.',
      'Un détail opérationnel superficiel peut masquer les variables d\'interaction.',
    ],
  },
  {
    id: 'collection',
    stage: 'Collecte des données',
    question: 'Quelles procédures doivent être utilisées pour trouver les preuves pertinentes ?',
    func: 'Déterminer quelles sources de preuves potentiellement pertinentes examiner.',
    proceduralDifferences: [
      'Différences dans la recherche contenue dans les sources d\'information.',
    ],
    sourcesOfInvalidity: [
      'Les études accessibles peuvent être qualitativement différentes de la population cible.',
      'Les personnes échantillonnées dans les études accessibles peuvent différer de la population cible.',
    ],
  },
  {
    id: 'evaluation',
    stage: 'Évaluation des données',
    question: 'Quelles preuves récupérées doivent être incluses dans la revue ?',
    func: 'Appliquer des critères pour séparer les études « valides » des « invalides ».',
    proceduralDifferences: [
      'Différences dans les critères de qualité.',
      'Différences dans l\'influence des critères non-qualitatifs.',
    ],
    sourcesOfInvalidity: [
      'Des facteurs non-qualitatifs peuvent causer une pondération inappropriée.',
      'Des omissions dans les rapports d\'étude peuvent rendre les conclusions non fiables.',
    ],
  },
  {
    id: 'analysis',
    stage: 'Analyse et interprétation',
    question: 'Quelles procédures pour faire des inférences sur la littérature dans son ensemble ?',
    func: 'Synthétiser les études valides récupérées.',
    proceduralDifferences: [
      'Différences dans les règles d\'inférence.',
    ],
    sourcesOfInvalidity: [
      'Les règles pour distinguer les motifs du bruit peuvent être inappropriées.',
      'Les preuves basées sur la revue peuvent être utilisées pour inférer la causalité.',
    ],
  },
  {
    id: 'presentation',
    stage: 'Présentation publique',
    question: 'Quelles informations doivent être incluses dans le rapport de revue ?',
    func: 'Appliquer des critères éditoriaux pour séparer les informations importantes des non importantes.',
    proceduralDifferences: [
      'Différences dans les lignes directrices pour le jugement éditorial.',
    ],
    sourcesOfInvalidity: [
      'L\'omission des procédures de revue peut rendre les conclusions non reproductibles.',
      'L\'omission des résultats de revue et des procédures d\'étude peut rendre les conclusions obsolètes.',
    ],
  },
]

export const literatureReviewSource = 'Randolph, J. (2009). A Guide to Writing the Dissertation Literature Review. Practical Assessment, Research & Evaluation, 14(13), 1-13.'

export interface ResearchGap {
  id: string
  name: string
  nameEn: string
  description: string
  strategies: string[]
  color: string
}

export const researchGaps: ResearchGap[] = [
  { id: 'methodological', name: 'Lacune méthodologique', nameEn: 'Methodological Gap', description: 'Inadéquation ou absence de méthodes de recherche adaptées.', strategies: ['Développer de nouvelles méthodologies', 'Adapter des méthodes d\'autres champs disciplinaires', 'Combiner des méthodes existantes de manière innovante'], color: 'border-red-200 bg-red-50/50' },
  { id: 'data', name: 'Lacune de données', nameEn: 'Data Gap', description: 'Données insuffisantes pour répondre à la question de recherche.', strategies: ['Mener une collecte de données primaires', 'Accéder à des bases de données existantes', 'Collaborer avec d\'autres chercheurs ou institutions'], color: 'border-amber-200 bg-amber-50/50' },
  { id: 'empirical', name: 'Lacune empirique', nameEn: 'Empirical Gap', description: 'Absence de données ou d\'études sur un sujet particulier.', strategies: ['Mener des études exploratoires', 'Effectuer des revues de littérature systématiques', 'Identifier les aspects sous-étudiés du sujet'], color: 'border-orange-200 bg-orange-50/50' },
  { id: 'contextual', name: 'Lacune contextuelle', nameEn: 'Contextual Gap', description: 'Impossibilité de généraliser les résultats en raison de différences de contextes.', strategies: ['Mener des études comparatives', 'Explorer les implications interculturelles', 'Identifier les facteurs contextuels influençant les résultats'], color: 'border-sky-200 bg-sky-50/50' },
  { id: 'implementation', name: 'Lacune de mise en œuvre', nameEn: 'Implementation Gap', description: 'Déconnexion entre les résultats de recherche et l\'application pratique.', strategies: ['S\'engager avec les praticiens', 'Développer des projets de recherche-action', 'Créer des lignes directrices ou cadres pratiques'], color: 'border-emerald-200 bg-emerald-50/50' },
  { id: 'population', name: 'Lacune populationnelle', nameEn: 'Population Gap', description: 'Sous-représentation ou exclusion de certains groupes dans la recherche.', strategies: ['Diversifier les échantillons d\'étude', 'Mener des recherches ciblées sur les groupes sous-représentés', 'Analyser les données existantes en ciblant les populations exclues'], color: 'border-violet-200 bg-violet-50/50' },
  { id: 'practical', name: 'Lacune de connaissance pratique', nameEn: 'Practical Knowledge Gap', description: 'Incapacité à appliquer les connaissances théoriques aux problèmes réels.', strategies: ['Mener des études de cas', 'Développer des projets de recherche appliquée', 'Collaborer avec des partenaires industriels'], color: 'border-pink-200 bg-pink-50/50' },
  { id: 'evidence', name: 'Lacune de preuves', nameEn: 'Evidence Gap', description: 'Preuves insuffisantes ou contradictoires pour étayer une conclusion.', strategies: ['Mener des méta-analyses', 'Effectuer des études de réplication', 'Concevoir des études avec une puissance statistique accrue'], color: 'border-gray-200 bg-gray-50/50' },
  { id: 'knowledge', name: 'Lacune de connaissances', nameEn: 'Knowledge Gap', description: 'Manque de compréhension ou d\'information sur un sujet spécifique.', strategies: ['Mener des revues de littérature approfondies', 'Identifier les questions de recherche clés', 'Développer des cadres conceptuels'], color: 'border-cyan-200 bg-cyan-50/50' },
  { id: 'theoretical', name: 'Lacune théorique', nameEn: 'Theoretical Gap', description: 'Cadres théoriques insuffisants pour expliquer un phénomène.', strategies: ['Développer de nouvelles théories', 'Intégrer des théories existantes', 'Appliquer des théories d\'autres disciplines'], color: 'border-indigo-200 bg-indigo-50/50' },
]

export const researchGapsSource = 'Miles, D. A. (2017). A taxonomy of research gaps. Doctoral student workshop, Dallas, Texas. Mindmap par Lennart Nacke.'

export const problemStatementQuestions = [
  { question: 'Quoi ?', detail: 'Quel est le problème ?' },
  { question: 'Où ?', detail: 'Où se situe le problème ?' },
  { question: 'Comment ?', detail: 'Comment le problème peut-il être résolu ?' },
  { question: 'Pourquoi ?', detail: 'Pourquoi voulez-vous résoudre le problème ?' },
  { question: 'Actualité ?', detail: 'Le problème est-il un enjeu actuel ?' },
  { question: 'Persistance ?', detail: 'Le problème persistera-t-il s\'il n\'est pas résolu ?' },
  { question: 'Qui ?', detail: 'Qui est affecté négativement par le problème ?' },
  { question: 'Contribution ?', detail: 'Ce problème prouvera-t-il ou infirmera-t-il les connaissances existantes ?' },
]

export const problemStatementSource = 'Faryadi, Q. (2018). PhD Thesis Writing Process: A Systematic Approach. Creative Education, 9, 2534-2545.'

// ─── Évaluer un article de recherche (5 critères) ──────────────
// Source : Askpstudyinaustralia — « How to Effectively Review a Research Paper »
export interface PaperReviewCriterion {
  id: string
  number: number
  title: string
  titleEn: string
  question: string
  subQuestions: string[]
  color: string
}

export const paperReviewCriteria: PaperReviewCriterion[] = [
  {
    id: 'importance',
    number: 1,
    title: 'Importance',
    titleEn: 'Importance',
    question: 'Pourquoi cette recherche compte-t-elle ?',
    subQuestions: [
      'Quel problème ou besoin cette recherche adresse-t-elle ?',
      'Qui est le public cible ou le bénéficiaire ?',
      'Comment cette recherche contribue-t-elle aux connaissances ou à la pratique dans le domaine ?',
    ],
    color: 'border-emerald-200 bg-emerald-50/50',
  },
  {
    id: 'originality',
    number: 2,
    title: 'Originalité',
    titleEn: 'Originality',
    question: 'Qu\'est-ce qui rend cette recherche différente ?',
    subQuestions: [
      'En quoi diffère-t-elle des études existantes ?',
      'La nouveauté ou la contribution unique est-elle clairement énoncée ?',
      'La lacune de recherche est-elle bien définie et justifiée ?',
    ],
    color: 'border-amber-200 bg-amber-50/50',
  },
  {
    id: 'methodological',
    number: 3,
    title: 'Rigueur méthodologique',
    titleEn: 'Methodological Soundness',
    question: 'La recherche est-elle rigoureuse et fiable ?',
    subQuestions: [
      'Le design de recherche est-il approprié pour les objectifs ?',
      'Les méthodes et procédures sont-elles clairement expliquées et justifiées ?',
      'Le processus de collecte et d\'analyse des données est-il valide et fiable ?',
    ],
    color: 'border-sky-200 bg-sky-50/50',
  },
  {
    id: 'reproducibility',
    number: 4,
    title: 'Reproductibilité',
    titleEn: 'Reproducibility',
    question: 'Les résultats peuvent-ils être vérifiés ou répliqués ?',
    subQuestions: [
      'Y a-t-il suffisamment d\'informations pour que d\'autres puissent répliquer l\'étude ?',
      'Les données, méthodes et résultats sont-ils présentés de manière transparente ?',
      'Les limites de l\'étude sont-elles reconnues ?',
    ],
    color: 'border-violet-200 bg-violet-50/50',
  },
  {
    id: 'clarity',
    number: 5,
    title: 'Clarté et qualité de la présentation',
    titleEn: 'Clarity & Quality of Presentation',
    question: 'L\'article est-il bien rédigé et facile à suivre ?',
    subQuestions: [
      'L\'article est-il bien organisé et logiquement structuré ?',
      'Les figures, tableaux et références sont-ils exacts et pertinents ?',
      'La rédaction est-elle claire, concise et exempte d\'erreurs grammaticales ?',
    ],
    color: 'border-rose-200 bg-rose-50/50',
  },
]

export const paperReviewSource = 'Askpstudyinaustralia — « How to Effectively Review a Research Paper ». #1GradSchoolResourceHub'

// ─── Les 4 éléments essentiels d\'une problématique ─────────────
// Source : Askpstudyinaustralia — « How to Write a Research Problem Statement »
export interface ProblemStatementElement {
  id: string
  number: number
  title: string
  titleEn: string
  description: string
  keyQuestion: string
  color: string
}

export const problemStatementElements: ProblemStatementElement[] = [
  {
    id: 'context',
    number: 1,
    title: 'Contexte',
    titleEn: 'Context',
    description: 'Fournir le contexte et les informations de base pour aider les lecteurs à comprendre la situation générale.',
    keyQuestion: 'Que savons-nous déjà ?',
    color: 'border-emerald-200 bg-emerald-50/50',
  },
  {
    id: 'issue',
    number: 2,
    title: 'Problème',
    titleEn: 'Issue',
    description: 'Décrire clairement le problème ou l\'enjeu spécifique que votre recherche entend adresser.',
    keyQuestion: 'Que devons-nous encore savoir ?',
    color: 'border-amber-200 bg-amber-50/50',
  },
  {
    id: 'significance',
    number: 3,
    title: 'Signification',
    titleEn: 'Significance',
    description: 'Expliquer pourquoi ce problème compte et pourquoi une investigation supplémentaire est nécessaire.',
    keyQuestion: 'Pourquoi devons-nous en savoir plus ?',
    color: 'border-sky-200 bg-sky-50/50',
  },
  {
    id: 'objectives',
    number: 4,
    title: 'Objectifs',
    titleEn: 'Objectives',
    description: 'Énoncer le but de votre recherche et ce que vous espérez accomplir ou découvrir.',
    keyQuestion: 'Que ferez-vous pour en savoir plus ?',
    color: 'border-violet-200 bg-violet-50/50',
  },
]

export const problemStatementCharacteristics = [
  { name: 'Spécifique', nameEn: 'Specific', description: 'Se concentrer sur un problème clair. Éviter d\'être trop vaste ou vague.' },
  { name: 'Concis', nameEn: 'Concise', description: 'Utiliser un langage clair et direct. Chaque mot doit apporter de la valeur.' },
  { name: 'Mesurable', nameEn: 'Measurable', description: 'S\'assurer que le problème peut être étudié et que les résultats peuvent être évalués.' },
]

export const problemStatementElementsSource = 'Askpstudyinaustralia — « How to Write a Research Problem Statement ». #1GradSchoolResourceHub'

export const introductionWritingTips = [
  'Énoncez le problème ou le phénomène à étudier.',
  'Identifiez la partie affectée par le problème.',
  'Expliquez comment vous comptez résoudre le problème.',
  'Convainquez le lecteur que vous êtes qualifié et équipé des bonnes méthodes.',
  'Mettez en évidence les bénéfices de la résolution du problème.',
  'Indiquez au lecteur les résultats que vous anticipez.',
]

export const introductionWritingAdvice = [
  'Commencez par des déclarations générales pertinentes avant de resserrer progressivement vers les questions de recherche.',
  'Votre introduction est préparée pour des lecteurs ayant des connaissances adéquates de votre discipline.',
  'Si c\'est votre propre découverte scientifique, expliquez clairement comment les résultats s\'ajouteront aux connaissances existantes.',
  'Discutez les obstacles rencontrés et les limites de votre recherche, le cas échéant.',
  'L\'introduction doit être motivante et captivante pour donner envie au lecteur de continuer.',
]

export interface AbstractStructureStep {
  id: string
  label: string
  labelEn: string
  description: string
  example: string
  color: string
}

export const abstractStructure: AbstractStructureStep[] = [
  { id: 'background', label: 'Contexte général', labelEn: 'General background', description: 'Présentez le domaine de recherche de manière large et accessible.', example: 'Le transfert horizontal de gènes (HGT), l\'acquisition de matériel génétique de lignées non parentales, est connu pour être important dans l\'évolution bactérienne.', color: 'bg-sky-100 text-sky-800' },
  { id: 'specific-bg', label: 'Contexte spécifique', labelEn: 'Specific background', description: 'Resserrez vers votre domaine précis en citant les travaux clés.', example: 'En particulier, le HGT fournit un accès rapide aux innovations génétiques, permettant à des traits tels que la virulence, la résistance aux antibiotiques et le métabolisme des xénobiotiques de se propager.', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'gap', label: 'Lacune de connaissances', labelEn: 'Knowledge gap', description: 'Identifiez ce qui manque dans la littérature existante.', example: 'Il est nécessaire de déterminer la fréquence de tels transferts récents et les forces qui régissent ces événements.', color: 'bg-amber-100 text-amber-800' },
  { id: 'here-we-show', label: 'Notre contribution', labelEn: 'Here we show...', description: 'Annoncez clairement ce que votre étude apporte.', example: 'Nous rapportons la découverte et la caractérisation d\'un vaste réseau humain d\'échange de gènes.', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'results', label: 'Résultats clés', labelEn: 'Results with key values', description: 'Présentez vos résultats avec des valeurs concrètes et statistiquement significatives.', example: 'Ce réseau de 10 770 gènes uniques récemment transférés dans 2 235 génomes bactériens complets est façonné principalement par l\'écologie plutôt que par la géographie ou la phylogénie.', color: 'bg-violet-100 text-violet-800' },
  { id: 'meaning', label: 'Signification des résultats', labelEn: 'Meaning of results', description: 'Expliquez l\'impact et les implications de vos résultats.', example: 'Cette structure offre une fenêtre sur les traits moléculaires qui définissent les niches écologiques, insight que nous utilisons pour uncover les sources de résistance aux antibiotiques.', color: 'bg-rose-100 text-rose-800' },
]

export const abstractSource = 'Abstract annoté d\'un article de microbiologie publié dans Nature. Reproduit à des fins éducatives uniquement.'

export interface ThesisWebsite {
  id: string
  name: string
  url: string
  description: string
  type: string
}

export const thesisWebsites: ThesisWebsite[] = [
  { id: 'oatd', name: 'Open Access Theses and Dissertations', url: 'https://oatd.org/', description: 'Le plus grand index mondial de thèses en accès libre.', type: 'Multidisciplinaire' },
  { id: 'openthesis', name: 'Open Thesis', url: 'http://www.openthesis.org/', description: 'Base collaborative de thèses et mémoires en libre accès.', type: 'Multidisciplinaire' },
  { id: 'dart-europe', name: 'DART-Europe E-theses Portal', url: 'https://www.dart-europe.org/', description: 'Portail européen de thèses électroniques.', type: 'Europe' },
  { id: 'proquest', name: 'ProQuest Dissertations & Theses', url: 'https://www.proquest.com/', description: 'Plus grande base de thèses au monde (accès partiel gratuit).', type: 'Multidisciplinaire' },
  { id: 'mit', name: 'MIT Theses', url: 'https://dspace.mit.edu/handle/1721.1/7582', description: 'Toutes les thèses du MIT en accès libre.', type: 'Sciences & Ingénierie' },
  { id: 'ndltd', name: 'NDLTD', url: 'http://www.ndltd.org/', description: 'Réseau international de bibliothèques numériques de thèses.', type: 'Multidisciplinaire' },
  { id: 'caltech', name: 'Caltech Thesis', url: 'https://thesis.library.caltech.edu/', description: 'Thèses du California Institute of Technology.', type: 'Sciences & Ingénierie' },
  { id: 'ethos', name: 'British Library EThOS', url: 'https://www.bl.uk/', description: 'Service de thèses de la British Library (Royaume-Uni).', type: 'Europe' },
  { id: 'harvard', name: 'Harvard DASH', url: 'https://dash.harvard.edu/', description: 'Dépôt d\'accès scholarique de Harvard.', type: 'Multidisciplinaire' },
  { id: 'canada', name: 'Theses Canada Portal', url: 'https://canadagtd.ca/', description: 'Portail des thèses canadiennes.', type: 'Amérique du Nord' },
  { id: 'repec', name: 'RePEc', url: 'https://repec.org/', description: 'Papiers de recherche en économie.', type: 'Économie' },
  { id: 'ssrn', name: 'SSRN eLibrary', url: 'https://www.ssrn.com/', description: 'Réseau de recherche en sciences sociales.', type: 'Sciences Sociales' },
  { id: 'europe-pmc', name: 'Europe PMC', url: 'https://europepmc.org/', description: 'Archive ouverte de biomedical et sciences de la vie.', type: 'Biomedical' },
  { id: 'worldcat', name: 'WorldCat Dissertations & Theses', url: 'https://www.worldcat.org/', description: 'Catalogue mondial des bibliothèques, incluant les thèses.', type: 'Multidisciplinaire' },
  { id: 'etd', name: 'Electronic Theses & Dissertation Centre', url: 'https://etd.ohiolink.edu/', description: 'Centre de thèses électroniques (OhioLink).', type: 'Amérique du Nord' },
]

// ─── Opérationnalisation (Baripedia) ──────────────────────────────

export interface LazarsfeldStep {
  id: string
  title: string
  description: string
  details: string[]
  examples?: string[]
  warning?: string
}

export const operationalisationBaripedia = {
  definition: 'L\'opérationnalisation consiste à rendre les concepts mesurables. Il s\'agit de passer d\'un haut niveau d\'abstraction conceptuelle à des indicateurs concrets adaptés à la recherche empirique. Cette étape constitue le point de relais entre la théorie et l\'empirie.',
  keyIdea: 'Dans les méthodes quantitatives, il faut toujours faire passer les concepts du statut de mots au statut de chiffres. Les concepts théoriques n\'existent pas dans la réalité sociale — ils doivent être concrétisés pour être mesurés.',
  quote: {
    text: 'Les sociologues utilisent souvent des concepts qui sont formulés à un niveau plutôt haut d\'abstraction. Le problème lié au fossé entre la théorie et la recherche est celui de l\'erreur de mesure.',
    author: 'Blalock',
  },
  stakes: [
    'L\'opérationnalisation doit permettre de tester les hypothèses en descendant dans l\'échelle de l\'abstraction.',
    'Les choix effectués tout au long de la recherche visent à conférer une validité interne.',
    'Aucun résultat n\'est accepté unanimement, à cause des choix potentiellement discutables.',
    'Les données secondaires doivent être utilisées avec précaution — l\'indicateur doit parfaitement convenir à l\'item étudié.',
  ],
  lazarsfeldSteps: [
    {
      id: 'conceptual',
      title: '1. Étape conceptuelle',
      description: 'Partir d\'un concept abstrait, non directement mesurable. Souvent polysémique, le concept doit être défini précisément et de manière univoque.',
      details: [
        'S\'aider de la littérature pour combler les lacunes théoriques',
        'Vérifier qu\'un travail similaire n\'a pas déjà été effectué',
        'La définition du concept de base est cruciale pour obtenir des mesures fiables',
      ],
      examples: [
        'Compétence politique (Dahl) : autonomie du citoyen autour de la connaissance du champ politique et de la verbalisation de préférences claires',
        'Compétence politique (Kriessi) : intérêt subjectif et objectif porté à la politique',
        'Compétence politique (Gaxie) : capacité à se situer dans l\'univers politique',
      ],
    },
    {
      id: 'dimensions',
      title: '2. Spécifier les dimensions et sous-dimensions',
      description: 'Un concept est toujours multidimensionnel. Il s\'agit d\'identifier chaque facette et d\'en extraire le sens. Chaque composante doit être définie de manière univoque.',
      details: [
        'Pour les concepts simples : décomposer en dimensions (âge, sexe, lieu de résidence…)',
        'Pour les concepts complexes : décomposer en dimensions ET sous-dimensions',
        'Cette étape permet de descendre sur l\'échelle de l\'abstraction',
      ],
    },
    {
      id: 'indicators',
      title: '3. Sélection des indicateurs pertinents',
      description: 'Chaque dimension peut être représentée par un ou plusieurs indicateurs. Un indicateur = une variable = une mesure = une question.',
      details: [
        'Un indicateur mesure directement une dimension ou sous-dimension d\'un concept abstrait',
        'Mesurer un concept avec PLUSIEURS indicateurs pour minimiser les risques d\'erreur',
        'L\'agencement des indicateurs doit ensemble reconstruire le concept',
        'Le nombre d\'indicateurs ne doit pas être trop petit pour couvrir tout effet discriminant',
      ],
      warning: 'Le chercheur doit sélectionner des indicateurs présentant une bonne discrimination, validité et cohérence interne.',
    },
    {
      id: 'indices',
      title: '4. Formation des indices (après collecte)',
      description: 'Reconstruire les dimensions des concepts après la récolte des données. Cette étape fait le chemin inverse des trois précédentes.',
      details: [
        'Se déroule APRÈS la récolte des données, au moment de l\'analyse',
        'Construire une mesure unique à partir de plusieurs informations numériques',
        'Permet de tester les relations causales entre concepts',
        'Techniques possibles : additionneur, échelles d\'indices, analyse factorielle',
      ],
      warning: 'Si les indicateurs mesurent exactement la même chose, on peut en prendre un seul. Cette étape n\'est pas toujours nécessaire.',
    },
  ] as LazarsfeldStep[],
  indicatorSelection: {
    title: 'Sélection des indicateurs',
    rules: [
      'Processus circulaire (et non linéaire) avec des allers-retours entre étapes',
      'Si le sens d\'une dimension reste ambigu → retourner à l\'étape 2',
      'Deux voies : utiliser son inventivité OU reprendre des mesures élaborées par d\'autres chercheurs',
      'Règle de base : plus d\'indicateurs c\'est mieux, mais pas trop',
      'Moins il y a d\'indicateurs, plus on a d\'effet discriminant',
    ],
    simpleVsComplex: {
      simple: { label: 'Concepts simples/périphériques', rule: 'Un indicateur suffit', example: 'L\'âge (si ce n\'est pas le concept clé)' },
      complex: { label: 'Concepts complexes/centraux', rule: 'Plusieurs indicateurs nécessaires', example: 'La compétence politique, l\'islamophobie' },
    },
    vdWarning: 'Attention à la variable dépendante ! On prend rarement le risque d\'avoir un seul indicateur pour la VD.',
    examples: [
      { concept: 'Islamophobie', indicators: ['Autoriser les pratiques religieuses en Suisse', 'Le port du voile'], problem: 'Concept très complexe saisi par seulement 2 indicateurs. La 2e question tend à graduer l\'influence du répondant masculin.' },
      { concept: 'Participation conventionnelle', indicators: ['Fréquence de participation aux votations', 'Fréquence de participation aux élections'], problem: 'Bon exemple de mesure valide.' },
      { concept: 'Bien-être individuel', indicators: ['Salaire de l\'individu'], problem: 'Mauvais exemple : le salaire ne mesure pas le bien-être.' },
    ],
  },
  measurementErrors: {
    title: 'Validité et fiabilité : deux erreurs de mesure',
    validity: {
      title: 'Validité',
      definition: 'Juge l\'opérationnalisation d\'un point de vue théorique. Une mesure non valide ne mesure pas le concept qu\'on voulait mesurer.',
      location: 'Au niveau de l\'opérationnalisation (processus qui lie les concepts aux indicateurs)',
      causes: [
        'Concepts mal définis',
        'Indicateurs non pertinents',
        'Concepts complexes mesurés par trop peu d\'indicateurs',
      ],
    },
    reliability: {
      title: 'Fiabilité',
      definition: 'Liée à la formulation et l\'élaboration des questions. Regarde le lien entre les indicateurs et la question.',
      location: 'Au niveau empirique (formulation des questions, reproductibilité)',
      causes: [
        'Double stimuli (inputs) — questions ambiguës',
        'Imprécision — jamais de question avec un « ou »',
        'Supposer les pratiques au lieu de les demander directement',
      ],
    },
    relationship: 'Pour avoir une mesure valide, elle doit être fiable. Mais le contraire n\'est pas forcément le cas. La fiabilité est une condition nécessaire mais non suffisante.',
    biases: 'Les biais systématiques ont une structure et ne sont pas distribués au hasard. Ils ne sont pas intégrés dans les analyses en termes d\'erreur et impliquent souvent un problème de validité.',
  },
  source: 'Baripedia — Des concepts aux mesures, un travail d\'opérationnalisation. Consulté le 20/11/2021.',
}

// ─── Guide du jeune chercheur (Mathieu Guidère) ─────────────────────

export const guidereGuide = {
  title: 'Méthodologie de la recherche — Guide du jeune chercheur',
  author: 'Mathieu Guidère',
  source: 'Guidère, M. Méthodologie de la recherche — Guide du jeune chercheur.',
  definition: 'La méthode désigne l\'ensemble des démarches que suit l\'esprit humain pour découvrir et démontrer la vérité.',
  keyQuote: 'La recherche ne peut être une simple compilation d\'informations, une synthèse de l\'existant. Elle se doit d\'être une investigation…',
  projectPhases: [
    { title: 'Phase préparatoire', details: ['Circonscrire l\'objet (domaine, sujet, époque)', 'Évaluer la faisabilité', 'Trouver un directeur de recherche'] },
    { title: 'Phase de réalisation', details: ['Élaboration d\'un plan détaillé', 'Collecte de données', 'Rédaction progressive'] },
    { title: 'Phase finale', details: ['Relecture et correction', 'Préparation de la soutenance', 'Soutenance devant le jury'] },
  ],
  planning: {
    master: { duration: '6-12 mois', steps: ['Choix du directeur (juin)', 'Recherche documentaire', 'Rédaction du mémoire (50-100 pages)', 'Soutenance (fin juin / septembre)'] },
    doctorat: { duration: '3-4 ans', steps: ['Choix du sujet / Inscription en 1ère année', 'Réalisation de la recherche en 2ème année', 'Rédaction et finition en 3ème/4ème année', 'Soutenance'] },
  },
  researchSteps: [
    { step: '1. Investigation', desc: 'Recherche documentaire objective', tools: ['Manuels', 'Encyclopédies', 'Ouvrages de référence'] },
    { step: '2. Exploration', desc: 'Bibliographie générale et spécialisée, définition du champ', tools: ['Bases de données', 'Catalogues', 'Réseaux scientifiques'] },
    { step: '3. Documentation', desc: 'Collecte et classement des éléments utiles', tools: ['Fiches de lecture', 'Fiches bibliographiques', 'Fiches méthodologiques'] },
    { step: '4. Rédaction', desc: 'Mise en forme logique et démonstrative', tools: ['Plan détaillé', 'Rédaction progressive', 'Relecture'] },
  ],
  researchWeb: {
    physical: ['Encyclopédies', 'Catalogue général de la BnF', 'Francis', 'Electre', 'MLA Bibliography', 'Historical Abstracts'],
    digital: ['Google Scholar', 'Persee', 'Erudit', 'Cairn', 'HAL'],
    goldenRule: 'Toujours recouper les sources web avec des sources papier fiables.',
  },
  fiches: [
    { type: 'Fiche bibliographique', content: ['Référence complète', 'Auteur, Titre, Ville, Éditeur, Date, Pages', 'Format A5 recommandé'] },
    { type: 'Fiche de lecture', content: ['Résumé de l\'ouvrage', 'Idées clés', 'Citation exacte (avec page)', 'Commentaire critique personnel'] },
    { type: 'Fiche méthodologique', content: ['Statistiques', 'Définitions', 'Concepts clés', 'Cadres théoriques'] },
  ],
  corpus: {
    definition: 'Ensemble des documents étudiés (textes, images, statistiques).',
    criteria: ['Pertinent : en lien direct avec le sujet', 'Cohérent : logique interne entre les documents', 'Consistant : taille gérable pour l\'analyse'],
  },
  problematique: {
    definition: 'Question centrale qui oriente tout le travail. Elle transforme un sujet général en une interrogation précise.',
    formulation: 'Dans quelle mesure / Comment / Pourquoi [Sujet] [Verbe d\'action] [Objet] ?',
    warning: 'Ne pas confondre le thème (général) avec la problématique (spécifique).',
    quote: 'C\'est l\'axe autour duquel s\'articule toute la démonstration… C\'est poser une question centrale concernant le sujet traité.',
  },
  planTypes: [
    { type: 'Thématique', desc: 'Parties = thèmes distincts', note: 'Le plus courant en sciences humaines' },
    { type: 'Chronologique', desc: 'Parties = périodes', note: 'Souvent trop descriptif, déconseillé en SHS pures' },
    { type: 'Critique / Dialectique', desc: 'Thèse / Antithèse / Synthèse', note: 'Idéal pour montrer une opposition' },
    { type: 'Progressif', desc: 'Observation → Analyse → Interprétation', note: 'Démarche scientifique classique' },
  ],
  titleRules: ['Doivent être accrocheurs', 'Précis et informatifs', 'Annoncer l\'idée directrice de la partie/chapitre'],
  redaction: {
    intro: { proportion: '10% du texte', mustInclude: ['Présenter le sujet', 'La problématique', 'L\'état de l\'art', 'Le plan annoncé', 'Les limites de l\'étude'] },
    conclusion: { mustInclude: ['Synthèse (pas répétition)', 'Réponse à la problématique', 'Ouverture vers d\'autres perspectives'] },
    citations: [
      { rule: 'Courtes (< 3 lignes)', format: 'Entre guillemets dans le texte' },
      { rule: 'Longues (> 3 lignes)', format: 'Alinéa décalé (retrait), sans guillemets, police plus petite possible' },
    ],
    citationRule: 'Toujours citer la source (Auteur, Titre, Page).',
    footnotes: 'Pour les références, les développements secondaires ou les commentaires personnels qui alourdiraient le texte.',
  },
  aspectsTechniques: {
    typo: ['Police : Times New Roman ou Arial', 'Corps : taille 12', 'Notes : taille 10', 'Interligne : 1,5'],
    ponctuation: ['Espaces insécables avant : ; ? !', 'Espaces normales après . ,'],
    outils: ['Table des matières automatisée', 'Index alphabétique des noms propres et concepts (optionnel mais valorisant)'],
  },
  approaches: [
    { name: 'Empirique (Inductive)', desc: 'Particulier → Général (observation → loi)', icon: 'TrendingUp' },
    { name: 'Déductive', desc: 'Général → Particulier (Théorie → Vérification)', icon: 'ArrowDown' },
    { name: 'Analytique', desc: 'Décomposer le sujet en éléments constitutifs', icon: 'ScanSearch' },
    { name: 'Synthétique', desc: 'Recomposer les éléments analysés en un tout cohérent', icon: 'Layers' },
  ],
  procedures: [
    { name: 'Déduction', desc: 'Raisonnement du général au particulier' },
    { name: 'Induction', desc: 'Raisonnement du particulier au général' },
    { name: 'Analogie', desc: 'Comparer deux faits différents pour expliquer l\'un par l\'autre' },
    { name: 'Classification', desc: 'Regrouper les faits par catégories (typologie)' },
  ],
  methods: [
    { name: 'Méthode expérimentale', desc: 'Vérifier une hypothèse par l\'expérience ou l\'observation rigoureuse. Nécessite des variables clairement définies (VI vs VD).' },
    { name: 'Méthode historique', desc: 'Critique des sources (authenticité, localisation). Critique externe (support matériel) et critique interne (contenu, style, intention). Objectif : reconstruire le passé.' },
    { name: 'Méthode sociologique', desc: 'Étude des faits sociaux comme des « choses » (Durkheim). Statistiques, enquêtes de terrain, objectivation du chercheur.' },
  ],
  institutionnel: {
    doctorat: { duree: '3 ans après Master (inscription renouvelable)', encadrement: 'Direction par un professeur HDR', convention: 'Charte des thèses (droits/devoirs du doctorant et du directeur)', soutenance: 'Devant un jury. Manuscrit remis au moins 1 mois avant.' },
    master: { finalite: 'Formation à la recherche', volume: '300h de formation + stage/mémoire', memoire: '50-100 pages généralement' },
  },
  evaluationCriteria: [
    { category: 'Forme', items: ['Présentation générale', 'Orthographe et grammaire', 'Clarté du style', 'Qualité des outils (bibliographie, index)'] },
    { category: 'Fond', items: ['Originalité du sujet', 'Maîtrise de la littérature (state of the art)', 'Pertinence de la méthode', 'Solidité de l\'argumentation', 'Rigueur scientifique'] },
    { category: 'Valeur ajoutée', items: ['Apport nouveau à la discipline', 'Qualités pédagogiques (clarté)'] },
  ],
  quotes: [
    { text: 'La méthode désigne l\'ensemble des démarches que suit l\'esprit humain pour découvrir et démontrer la vérité.', page: 'p. 5' },
    { text: 'La recherche ne peut être une simple compilation d\'informations, une synthèse de l\'existant. Elle se doit d\'être une investigation…', page: 'p. 9' },
    { text: 'C\'est l\'axe autour duquel s\'articule toute la démonstration… C\'est poser une question centrale concernant le sujet traité.', page: 'p. 19' },
    { text: 'Il faut avoir préparé intelligemment un certain nombre de fiches qui vont servir de base à la rédaction.', page: 'p. 25' },
  ],
}

// ─── 10 Types de revue de littérature ───────────────────────────
export interface LitReviewType {
  id: string
  number: number
  title: string
  titleEn: string
  description: string
  quandUtiliser: string
  forces: string[]
  limites: string[]
  color: string
}

export const litReviewTypes: LitReviewType[] = [
  {
    id: 'narrative',
    number: 1,
    title: 'Revue narrative',
    titleEn: 'Narrative Review',
    description: 'Fournit une vue d\'ensemble large des études existantes sur un sujet, en mettant en évidence les tendances et les perspectives clés.',
    quandUtiliser: 'Pour contextualiser un domaine de recherche ou donner une perspective historique. Idéale pour les chapitres d\'introduction et de cadre théorique.',
    forces: ['Couverture large du sujet', 'Accessible et lisible', 'Favorise la compréhension du domaine', 'Flexible dans la structure'],
    limites: ['Pas de méthodologie systématique', 'Sujette aux biais de sélection', 'Difficilement reproductible'],
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'systematic',
    number: 2,
    title: 'Revue systématique',
    titleEn: 'Systematic Review',
    description: 'Utilise une méthodologie rigoureuse et préétablie pour identifier, évaluer et synthétiser toutes les études pertinentes répondant à une question de recherche spécifique.',
    quandUtiliser: 'Pour répondre à une question de recherche précise avec un haut niveau de rigueur. Standard en sciences de la santé, de plus en plus adoptée dans d\'autres disciplines.',
    forces: ['Reproductible et transparente', 'Minimise les biais de sélection', 'Protocole PRISMA standardisé', 'Haute crédibilité scientifique'],
    limites: ['Très chronophage', 'Peut exclure des études pertinentes', 'Exige une expertise en méthodologie', 'Résultats parfois trop restrictifs'],
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  {
    id: 'meta-analysis',
    number: 3,
    title: 'Méta-analyse',
    titleEn: 'Meta-Analysis',
    description: 'Combine statistiquement les résultats de plusieurs études quantitatives pour dériver des conclusions plus robustes et généralisables.',
    quandUtiliser: 'Quand plusieurs études quantitatives mesurent le même effet et que l\'on souhaite estimer la taille de l\'effet global avec plus de puissance statistique.',
    forces: ['Augmente la puissance statistique', 'Quantifie l\'effet global', 'Identifie les sources d\'hétérogénéité', 'Résultats plus généralisables'],
    limites: ['Nécessite des données quantitatives homogènes', 'Biais de publication possible', 'Sensible aux études de mauvaise qualité', 'Complexité statistique'],
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  {
    id: 'scoping',
    number: 4,
    title: 'Revue exploratoire (Scoping)',
    titleEn: 'Scoping Review',
    description: 'Cartographie la littérature existante pour identifier les concepts clés, les types de preuves et les lacunes de connaissances dans un domaine large.',
    quandUtiliser: 'En début de projet pour cartographier un champ de recherche, quand la question est encore large et que les concepts sont flous.',
    forces: ['Cartographie complète d\'un domaine', 'Identifie les lacunes de recherche', 'Flexibilité méthodologique', 'Utile en phase exploratoire'],
    limites: ['Pas d\'évaluation qualité systématique', 'Ne répond pas à une question précise', 'Peut être trop vaste', 'Moins rigoureuse que la revue systématique'],
    color: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    id: 'integrative',
    number: 5,
    title: 'Revue intégrative',
    titleEn: 'Integrative Review',
    description: 'Synthétise des études utilisant des méthodologies diverses (qualitatives, quantitatives, théoriques) pour générer de nouveaux cadres et approfondir la compréhension d\'un sujet complexe.',
    quandUtiliser: 'Pour des sujets complexes nécessitant de croiser des approches méthodologiques différentes et construire de nouveaux cadres conceptuels.',
    forces: ['Intègre des paradigmes multiples', 'Génère de nouvelles perspectives', 'Adaptée aux sujets complexes', 'Enrichit le cadre théorique'],
    limites: ['Difficile à conduire rigoureusement', 'Risque de synthèse superficielle', 'Manque de guidelines standardisées', 'Biais potentiels dans la sélection'],
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'critical',
    number: 6,
    title: 'Revue critique',
    titleEn: 'Critical Review',
    description: 'Évalue de manière critique la qualité, les forces et les limites de la littérature existante, tout en identifiant les biais et les incohérences.',
    quandUtiliser: 'Pour évaluer l\'état de l\'art de manière argumentée, identifier les contradictions entre études et les biais méthodologiques récurrents.',
    forces: ['Évaluation rigoureuse de la qualité', 'Identifie les biais et incohérences', 'Développe l\'esprit critique', 'Renforce la crédibilité de la revue'],
    limites: ['Subjectivité dans l\'évaluation', 'Pas de cadre méthodologique standard', 'Risque d\'être trop négatif', 'Difficile de rester exhaustif'],
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'theoretical',
    number: 7,
    title: 'Revue théorique',
    titleEn: 'Theoretical Review',
    description: 'Examine et critique les théories et modèles conceptuels pour construire une base théorique solide pour l\'étude.',
    quandUtiliser: 'Pour fonder un cadre théorique, confronter des théories concurrentes, ou proposer un nouveau modèle conceptuel.',
    forces: ['Fonde le cadre théorique', 'Confronte les modèles existants', 'Identifie les lacunes théoriques', 'Propose de nouvelles pistes conceptuelles'],
    limites: ['Peut manquer d\'ancrage empirique', 'Abstrait et difficile à valider', 'Risque de sur-théorisation', 'Nécessite une forte expertise conceptuelle'],
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'methodological',
    number: 8,
    title: 'Revue méthodologique',
    titleEn: 'Methodological Review',
    description: 'Se concentre sur les méthodes de recherche utilisées dans les études précédentes pour identifier les avancées et les limites méthodologiques.',
    quandUtiliser: 'Pour justifier le choix de méthode, identifier les meilleures pratiques, et positionner son design de recherche par rapport à l\'existant.',
    forces: ['Justifie les choix méthodologiques', 'Identifie les meilleures pratiques', 'Détecte les biais méthodologiques', 'Améliore la rigueur de l\'étude'],
    limites: ['Domaine d\'application restreint', 'Peut négliger les résultats', 'Demande une expertise méthodologique avancée', 'Moins accessible aux non-spécialistes'],
    color: 'bg-lime-100 text-lime-800 border-lime-300',
  },
  {
    id: 'empirical',
    number: 9,
    title: 'Revue empirique',
    titleEn: 'Empirical Review',
    description: 'Se concentre sur l\'évaluation et la synthèse des preuves empiriques liées à la question de recherche ou au problème étudié.',
    quandUtiliser: 'Pour établir l\'état des connaissances factuelles sur un sujet, en s\'appuyant exclusivement sur les résultats d\'études empiriques.',
    forces: ['Basée sur des faits concrets', 'Résultats tangibles et mesurables', 'Facilite la comparaison entre études', 'Forte objectivité'],
    limites: ['Ignore la dimension théorique', 'Dépendante de la qualité des données', 'Peut manquer de contexte qualitatif', 'Biais liés aux données disponibles'],
    color: 'bg-violet-100 text-violet-800 border-violet-300',
  },
  {
    id: 'realist',
    number: 10,
    title: 'Revue réaliste',
    titleEn: 'Realist Review',
    description: 'Explore comment et pourquoi les interventions fonctionnent, pour qui et dans quelles circonstances, en examinant le contexte, les mécanismes et les résultats.',
    quandUtiliser: 'Pour comprendre les mécanismes sous-jacents d\'interventions complexes dans des contextes réels, typiquement en sciences sociales et politiques publiques.',
    forces: ['Comprend les mécanismes d\'impact', 'Tient compte du contexte', 'Adaptée aux interventions complexes', 'Résultats applicables en pratique'],
    limites: ['Cadre théorique complexe', 'Difficile à mettre en œuvre', 'Peu de guidelines standardisées', 'Résultats difficiles à généraliser'],
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
]


// ─── Paradoxes de l'écriture académique (Murray & Moore, 2006) ──────

export interface WritingParadox {
  id: string
  title: string
  description: string
  implications: string[]
  strategies: string[]
}

export const writingParadoxes: WritingParadox[] = [
  {
    id: 'wp-start-finish',
    title: 'Le paradoxe du démarrage vs. l\'achèvement',
    description: 'Démarrer un projet d\'écriture requiert créativité, ouverture d\'esprit et tolérance au chaos, alors que l\'achèvement exige discipline, rigueur et sens du détail. Ces deux phases mobilisent des compétences qualitativement différentes et souvent opposées. Beaucoup de projets académiques sont abandonnés non pas faute d\'idées initiales, mais parce que le rédacteur n\'a pas su passer du mode créatif au mode d\'achèvement. Murray et Moore soulignent que de nombreux articles prometteurs ne sont jamais publiés faute d\'avoir franchi cette transition.',
    implications: ['Le début d\'un projet génère de l\'enthousiasme qui peut s\'évaporer face aux difficultés de l\'achèvement', 'Les critiques et les retours négatifs peuvent bloquer le processus à un stade crucial', 'L\'exposition prématurée de travaux imparfaits peut décourager le rédacteur', 'La maîtrise des conventions de genre est nécessaire pour finir mais peut inhiber le démarrage'],
    strategies: ['Séparez explicitement les phases de création et d\'édition dans votre emploi du temps', 'Commencez par du freewriting (écriture libre) sans jugement ni auto-censure', 'Fixez-vous des micro-objectifs quotidiens mesurables (nombre de mots, de paragraphes)', 'Protégez vos brouillons précoces du regard critique des autres', 'Créez un "safety mechanism" : une liste de rappels positifs pour les moments de doute'],
  },
  {
    id: 'wp-originality-convention',
    title: 'Originalité vs. Convention',
    description: 'L\'écriture académique exige de trouver sa propre voix tout en respectant les conventions disciplinaires établies. Le rédacteur doit naviguer entre la nécessité de s\'insérer dans un dialogue scientifique existant et l\'impératif d\'apporter une contribution originale. Murray et Moore citent Becker (1986) : il faut se laisser informer par la littérature, mais ne pas s\'y laisser asservir. Ce paradoxe est particulièrement intense pour les jeunes chercheurs qui découvrent l\'immensité de la littérature existante.',
    implications: ['Le sentiment de ne rien avoir de nouveau à dire peut paralyser le rédacteur', 'Une conformité excessive rend le texte banal et sans intérêt', 'Un rejet total des conventions rend le texte inacceptable pour la communauté académique', 'Le dialogue avec la littérature existante est indispensable mais peut éclipser la voix du chercheur'],
    strategies: ['Lisez la littérature pour vous informer, pas pour vous terroriser', 'Identifiez explicitement le "gap" que votre travail comble', 'Rédigez d\'abord vos idées propres, puis insérez-les dans le cadre conventionnel', 'Adoptez les conventions de forme (structure, style) tout en gardant votre originalité de fond', 'Trouvez des modèles dans votre discipline et analysez comment les auteurs établis naviguent ce paradoxe'],
  },
  {
    id: 'wp-logic-emotion',
    title: 'Logique vs. Émotion',
    description: 'L\'écriture académique requiert une approche logique et objective, mais le processus d\'écriture est profondément émotionnel. Murray et Moore observent que la culpabilité, la peur, l\'anxiété et la honte sont des émotions courantes chez les universitaires face à l\'écriture. Ignorer cette dimension émotionnelle revient à ignorer un facteur déterminant de la productivité. L\'intelligence émotionnelle doit accompagner la rigueur intellectuelle pour produire un travail de qualité.',
    implications: ['Les retours des pairs sont souvent perçus comme des attaques personnelles plutôt que comme des contributions intellectuelles', 'Le perfectionnisme peut conduire au blocage de l\'écrivain', 'La pression institutionnelle ("publish or perish") amplifie l\'anxiété liée à l\'écriture', 'Les émotions négatives sont intensifiées par l\'isolement fréquent de l\'écriture académique'],
    strategies: ['Reconnaissez et nommez vos émotions sans les juger : culpabilité, peur, anxiété sont normales', 'Séparez le moment de la rédaction (créativité) du moment de la révision (critique)', 'Développez des mécanismes de régulation émotionnelle : pauses, activité physique, dialogue avec des pairs', 'Adoptez une posture de curiosity plutôt que de défense face aux retours', 'Célébrez les petites victoires (une section terminée, un objectif quotidien atteint)'],
  },
  {
    id: 'wp-easy-difficult',
    title: 'Facile vs. Difficile',
    description: 'L\'écriture peut être à la fois la chose la plus facile et la plus difficile du travail académique. Murray et Moore notent que personne ne voit ce que vous écrivez si vous ne le souhaitez pas, et que vous avez un contrôle total sur vos mots — contrairement à une conversation ou une conférence. Pourtant, l\'exigence de qualité et de rigueur rend l\'écriture académique extrêmement exigeante. La clé est de savoir quand rendre l\'écriture facile (freewriting, brouillons) et quand la rendre difficile (révision, argumentation).',
    implications: ['Le désir de bien faire dès le premier jet peut bloquer complètement le rédacteur', 'L\'écriture facile (freewriting) peut sembler une perte de temps mais est essentielle pour la créativité', 'L\'écriture difficile (révision approfondie) ne peut pas être évitée si l\'on vise la qualité', 'L\'alternance entre phases faciles et difficiles est naturelle et nécessaire'],
    strategies: ['Utilisez le freewriting (5-10 minutes) pour amorcer le processus sans pression de qualité', 'Acceptez que les premiers jets soient imparfaits — la perfection vient dans la révision', 'Identifiez consciemment dans quelle phase vous êtes : création (facile) ou craft (difficile)', 'Quand vous êtes bloqué, revenez à une écriture "facile" pour retrouver votre élan', 'Définissez des sessions courtes et régulières plutôt que de longues sessions intenables'],
  },
  {
    id: 'wp-public-private',
    title: 'Public vs. Privé',
    description: 'L\'écriture académique oscille entre des moments privés (notes, brouillons, freewriting) et des moments publics (soumission à un comité, publication). Gérer cette transition est crucial : exposer un travail trop tôt peut ébranler la confiance du rédacteur, tandis que le garder trop longtemps privé empêche le feedback nécessaire à son amélioration. Murray et Moore s\'appuient sur Boyer (1990) pour affirmer que la scholarship exige par nature la scrutiny publique, mais que le rédacteur garde le contrôle du moment où il "devient public".',
    implications: ['Les brouillons précoces sont vulnérables et doivent être protégés', 'Le feedback est nécessaire mais le moment de le solliciter est stratégique', 'La publication transforme un travail privé en contribution publique au savoir', 'La peur du jugement public peut conduire à un perfectionnisme paralysant'],
    strategies: ['Utilisez le freewriting comme espace privé de production d\'idées', 'Identifiez des lecteurs de confiance (writing group) pour des retours intermédiaires', 'Exposez votre travail publiquement seulement quand vous vous sentez suffisamment confiant', 'Préparez-vous mentalement à la critique publique comme partie intégrante du processus', 'Commencez par des contextes à bas risque (séminaires internes) avant les publications formelles'],
  },
]

// ─── Guide de retraites d'écriture (Murray & Moore, Ch.5-7) ───────

export interface WritingRetreatSession {
  id: string
  phase: 'preparation' | 'day-structure' | 'follow-up'
  title: string
  description: string
  activities: string[]
  duration: string
}

export const writingRetreatGuide: WritingRetreatSession[] = [
  // Preparation
  { id: 'wr-goal-setting', phase: 'preparation', title: 'Définir des objectifs d\'écriture réalistes', description: 'Avant toute session d\'écriture productive, il est essentiel de fixer des objectifs clairs, mesurables et réalistes. Murray et Moore insistent sur le fait que des objectifs trop ambitieux génèrent de la frustration, tandis que des objectifs trop modestes ne produisent pas de résultats significatifs. La clé est de viser des "bouts de texte" concrets plutôt que des abstractions vagues comme "écrire un bon chapitre".', activities: ['Définir 1-3 objectifs spécifiques pour la session (ex: "rédiger 500 mots de la section 3.2")', 'Évaluer le temps disponible et le diviser en blocs de 25-45 minutes (technique Pomodoro)', 'Identifier les matériaux nécessaires (articles, notes, données) et les préparer à l\'avance', 'Noter les obstacles potentiels et prévoir des stratégies pour les surmonter'], duration: '30 minutes' },
  { id: 'wr-space-prep', phase: 'preparation', title: 'Préparer un espace d\'écriture dédié', description: 'L\'environnement physique influence considérablement la productivité d\'écriture. Un espace dédié, organisé et exempt de distractions signale au cerveau qu\'il est temps d\'écrire. Murray et Moore soulignent l\'importance de créer un rituel spatial qui favorise la concentration et la créativité, que ce soit dans un bureau, une bibliothèque ou un espace de retraité d\'écriture.', activities: ['Choisir un espace calme avec une surface de travail dégagée', 'Désactiver les notifications numériques (téléphone en mode avion, bloqueur de sites)', 'Préparer de l\'eau, du thé ou du café — les pauses doivent être intentionnelles', 'Afficher vos objectifs et votre plan de la journée à portée de vue'], duration: '15 minutes' },
  { id: 'wr-materials', phase: 'preparation', title: 'Rassembler les matériaux nécessaires', description: 'L\'interruption de l\'écriture pour chercher un document ou une référence brise le flux créatif et réduit considérablement la productivité. Murray recommandent de préparer tous les matériaux avant de commencer à écrire : articles annotés, notes de lecture, plan détaillé, références bibliographiques. Cette préparation méthodique transforme la session d\'écriture en une expérience fluide et concentrée.', activities: ['Ouvrir tous les documents et onglets nécessaires avant de commencer', 'Imprimer les articles clés si vous préférez le format papier', 'Préparer votre plan détaillé avec les sections à rédiger clairement identifiées', 'Vérifier les références bibliographiques et les avoir à portée de main'], duration: '20 minutes' },
  // Day structure
  { id: 'wr-morning-block', phase: 'day-structure', title: 'Bloc d\'écriture du matin (créativité)', description: 'Le matin est souvent le moment le plus propice à l\'écriture créative car l\'esprit est frais et les distractions sont moindres. Murray et Moore recommandent de consacrer le premier bloc de la journée à la production de texte nouveau, avant de passer à la révision ou aux tâches administratives. Ce bloc doit être protégé farouchement : pas de courriels, pas de réunions, pas d\'interruptions.', activities: ['Écrire sans interruption pendant 60-90 minutes sur du contenu nouveau', 'Ne pas corriger, ne pas relire, ne pas vérifier les références pendant ce bloc', 'Si le blocage survient, faire 5 minutes de freewriting puis reprendre', 'Viser la quantité plutôt que la qualité : les mots imparfaits sont mieux que l\'absence de mots'], duration: '60-90 minutes' },
  { id: 'wr-freewriting', phase: 'day-structure', title: 'Séance de freewriting (débloquer)', description: 'Le freewriting, popularisé par Elbow et Belanoff, consiste à écrire de manière continue pendant 5 à 10 minutes sans s\'arrêter, sans se soucier de la grammaire, de la structure ou de la qualité. Cette technique ignore délibérément les conventions pour libérer la créativité et surmonter le blocage de l\'écrivain. Murray et Moore la recommandent comme outil de transition entre les phases privées et publiques de l\'écriture.', activities: ['Choisir un prompt lié à votre sujet (une question, un concept, un argument)', 'Écrire sans arrêter pendant 5-10 minutes, même si vous écrivez "je ne sais pas quoi écrire"', 'Ne pas corriger un seul mot pendant la séance', 'Relire après la séance et surligner les idées utilisables pour votre texte'], duration: '5-10 minutes' },
  { id: 'wr-peer-review', phase: 'day-structure', title: 'Retour entre pairs', description: 'Le retour entre pairs est l\'un des piliers des retraites d\'écriture de Murray et Moore. Partager son travail avec des collègues de confiance offre des perspectives nouvelles, identifie les problèmes de clarté ou de logique invisibles pour l\'auteur, et crée une communauté de soutien. Le format idéal est un échange structuré où chaque participant reçoit et donne du feedback sur un texte en cours.', activities: ['Échanger des textes (2-5 pages maximum) avec un ou deux pairs de confiance', 'Lire le texte du pair en notant : points forts, passages obscurs, suggestions', 'Fournir un feedback oral structuré (positif d\'abord, puis suggestions)', 'Recevoir le feedback sans se justifier — écouter et noter'], duration: '30-45 minutes' },
  { id: 'wr-afternoon-edit', phase: 'day-structure', title: 'Séance de révision de l\'après-midi', description: 'L\'après-midi est propice à la révision et à l\'édition, activités qui requièrent un esprit analytique plutôt que créatif. Murray et Moore distinguent la révision de fond (logique, argumentation, progression) de la révision de forme (style, grammaire, ponctuation). Chaque type de révision doit être mené séparément pour être efficace.', activities: ['Relire le texte produit le matin pour vérifier la cohérence globale', 'Vérifier que chaque paragraphe développe une seule idée et est bien articulé au suivant', 'Améliorer les transitions entre sections et renforcer les liens logiques', 'Corriger le style, la grammaire et la ponctuation en dernier'], duration: '45-60 minutes' },
  { id: 'wr-reflective', phase: 'day-structure', title: 'Journal réflexif', description: 'Tenir un journal réflexif sur sa pratique d\'écriture permet de prendre conscience de ses habitudes, de ses blocages et de ses stratégies efficaces. Murray et Moore recommandent de consacrer quelques minutes en fin de journée à noter : ce qui a fonctionné, ce qui a été difficile, les émotions ressenties et les leçons apprises. Cette métacognition améliore progressivement la productivité et le bien-être du rédacteur.', activities: ['Noter les objectifs du jour et ce qui a été accompli (même partiellement)', 'Identifier les moments de blocage et les stratégies qui ont fonctionné pour les surmonter', 'Prendre note des émotions ressenties pendant la session d\'écriture', 'Formuler une ou deux leçons pour la prochaine session'], duration: '10-15 minutes' },
  { id: 'wr-closing', phase: 'day-structure', title: 'Clôture de la journée d\'écriture', description: 'Clôturer formellement la journée d\'écriture est une pratique recommandée par Murray et Moore pour créer une frontière nette entre le temps d\'écriture et le temps de repos. Cette clôture rituelle aide à prévenir la rumination mentale et permet de reprendre le lendemain avec un esprit frais. Elle inclut la sauvegarde du travail, la note des points d\'arrêt et la préparation de la prochaine session.', activities: ['Sauvegarder le travail et noter précisément où vous vous êtes arrêté', 'Rédiger une courte note (1-2 phrases) sur ce qu\'il faut faire en priorité le lendemain', 'Fermer tous les documents liés à l\'écriture', 'Prendre une pause consciente avant de passer à d\'autres activités'], duration: '10 minutes' },
  // Follow-up
  { id: 'wr-review-progress', phase: 'follow-up', title: 'Réviser les progrès hebdomadaires', description: 'Une fois par semaine, prenez du recul pour évaluer vos progrès globaux. Murray et Moore recommandent de comparer les objectifs fixés en début de semaine avec ce qui a été accompli, d\'identifier les patterns de productivité et de blocage, et d\'ajuster vos stratégies en conséquence. Cette évaluation hebdomadaire permet de maintenir le momentum et d\'éviter l\'accumulation de retard.', activities: ['Comparer les objectifs hebdomadaires avec les accomplissements réels', 'Calculer le nombre total de mots produits et le temps d\'écriture effectif', 'Identifier les jours et les moments les plus productifs', 'Détecter les patterns récurrents de blocage et anticiper les obstacles'], duration: '30 minutes' },
  { id: 'wr-plan-next', phase: 'follow-up', title: 'Planifier la prochaine session', description: 'La planification de la prochaine session d\'écriture doit se faire immédiatement après l\'évaluation des progrès. Murray et Moore soulignent que la continuité entre les sessions est un facteur clé de productivité. En terminant chaque session en sachant exactement par où reprendre la suivante, on élimine le temps de "mise en route" et on réduit le risque de blocage au démarrage.', activities: ['Définir les objectifs de la prochaine session en fonction de ce qui reste à faire', 'Préparer les matériaux nécessaires à l\'avance', 'Bloquer les créneaux horaires dans votre agenda', 'Rédiger une phrase d\'amorçage pour faciliter le démarrage'], duration: '15 minutes' },
  { id: 'wr-celebrate', phase: 'follow-up', title: 'Célébrer les accomplissements', description: 'Murray et Moore accordent une importance particulière à la célébration des petites victoires dans le processus d\'écriture. La reconnaissance positive renforce la motivation et contrebalance les émotions négatives (culpabilité, anxiété) qui accompagnent souvent l\'écriture académique. Célébrer n\'implique pas nécessairement quelque chose de grandiose : il peut s\'agir d\'une pause agréable, d\'un café spécial ou simplement de prendre conscience de ses progrès.', activities: ['Reconnaître explicitement ce qui a été accompli cette semaine', 'Partager vos progrès avec un pair ou un groupe d\'écriture', 'Accorder une récompense symbolique (pause, activité plaisir, café spécial)', 'Remercier-vous pour l\'effort fourni, même si les résultats sont en deçà des attentes'], duration: '10 minutes' },
]

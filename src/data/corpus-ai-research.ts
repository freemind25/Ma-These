// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ThesisFrame — Corpus « Recherche assistée par l'IA »
// Distillé de 4 ouvrages : Zhou & Al-Samarraie, Bagheri, Johannesson, Belleville & Jackson
// Aucune reproduction de texte protégé — savoir reformulé
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

// ─── Module 1 : Principes éthiques institutionnels (Zhou & Al-Samarraie) ───

/** 6 domaines où l'IA générative améliore les fonctions académiques */
export const DOMAINES_IA_RECHERCHE = [
  {
    domaine: "générationIdées",
    description: "Brainstorming de questions de recherche, identification de lacunes, alternatives méthodologiques",
    outils: ["ChatGPT", "Claude", "Jasper", "IdeaFlow"],
    compétencesDéveloppées: ["Pensée critique", "Recherche d'information", "Adaptabilité"],
  },
  {
    domaine: "planificationLittérature",
    description: "Stratégie de recherche, mots-clés, filtrage, connexions inter-études, identification de lacunes",
    outils: ["Elicit", "Iris.ai", "Connected Papers", "Semantic Scholar", "Research Rabbit"],
    compétencesDéveloppées: ["Lecture analytique", "Synthèse de résumés"],
  },
  {
    domaine: "méthodesRecherche",
    description: "Sélection d'échantillon, méthodes de recueil, protocole, simulation de résultats",
    outils: ["ChatGPT", "SciNote", "DALL-E"],
    compétencesDéveloppées: ["Méthodologie de recherche", "Analyse critique"],
  },
  {
    domaine: "analyseDonnées",
    description: "Sélection de tests statistiques, nettoyage de données, visualisation, interprétation",
    outils: ["OpenAI Codex", "R + IA", "Python + IA", "WriteSonic", "Grammarly"],
    compétencesDéveloppées: ["Littératie statistique", "Raisonnement statistique"],
  },
  {
    domaine: "rédactionAcadémique",
    description: "Amélioration du style, clarté, concision, cohérence, argumentation, vérification des citations",
    outils: ["Grammarly", "WriteSonic", "ChatGPT", "Claude"],
    compétencesDéveloppées: ["Argumentation", "Analyse critique du texte"],
  },
  {
    domaine: "conformitééthique",
    description: "Vérification de l'intégrité, déclaration d'usage, transparence méthodologique",
    outils: ["ChatGPT (audit)", "Outils institutionnels"],
    compétencesDéveloppées: ["Sens éthique", "Responsabilité académique"],
  },
] as const;

/** Principes éthiques fondamentaux pour l'usage de l'IA en recherche */
export const PRINCIPES_ETHIQUES_IA = [
  {
    principe: "Transparence et explicabilité",
    description: "Documenter l'usage de l'IA (modèles, techniques de prompting, limites). Rendre le raisonnement de l'IA aussi explicite que possible, surtout en chaîne-de-pensée.",
    actionConcrète: "Tenir un registre d'interactions avec l'IA (prompts, sorties, modifications). Inclure une déclaration dans la section méthodes ou les remerciements.",
  },
  {
    principe: "Responsabilité et imputabilité",
    description: "Le chercheur reste ultimement responsable de l'intégrité et de la qualité de son travail, même avec l'IA. L'IA est un collaborateur, pas un remplaçant.",
    actionConcrète: "Toujours vérifier les informations générées par l'IA avec des sources fiables. Ne jamais accepter aveuglément un résultat généré par l'IA.",
  },
  {
    principe: "Détection et atténuation des biais",
    description: "Les LLM reproduisent les biais de leurs données d'entraînement. Le chercheur doit identifier et atténuer ces biais, surtout dans les recherches impliquant l'équité sociale.",
    actionConcrète: "Utiliser des prompts variés et représentatifs. Demander à l'IA de critiquer ses propres sorties. Faire relire par des collègues aux perspectives diverses.",
  },
  {
    principe: "Confidentialité et sécurité des données",
    description: "Protéger la vie privée des données sensibles. Anonymiser avant utilisation. Choisir des plateformes sécurisées. Se conformer au RGPD et aux lignes directrices institutionnelles.",
    actionConcrète: "Anonymiser toutes les données avant de les soumettre à l'IA. N'utiliser que la quantité minimale de données nécessaire.",
  },
  {
    principe: "Équité d'accès et fracture numérique",
    description: "L'accès inégal aux outils IA avancés peut creuser les inégalités entre institutions et pays. Démocratiser l'accès pour éviter une concentration de la capacité de recherche.",
    actionConcrète: "Privilégier les outils open source quand possible. Plaider pour un accès institutionnel aux outils IA.",
  },
  {
    principe: "Équilibre IA / expertise humaine",
    description: "L'IA manque de compréhension nuancée, de créativité et de jugement éthique. La sur-dépendance prive les jeunes chercheurs d'expériences d'apprentissage essentielles.",
    actionConcrète: "Utiliser l'IA pour augmenter (pas remplacer) les capacités humaines. Maintenir la supervision humaine à chaque étape du processus.",
  },
] as const;

/** Risques spécifiques de l'IA en recherche */
export const RISQUES_IA_RECHERCHE = [
  "Hallucination : génération de références, citations ou résultats fictifs qui semblent plausibles",
  "Perte d'originalité : le contenu généré par l'IA manque de perspective personnelle et de contribution novatrice",
  "Biais algorithmique : reproduction et amplification de biais présents dans les données d'entraînement",
  "Dépendance excessive : atrophie des compétences de pensée critique et d'analyse indépendante",
  "Non-reproductibilité : les sorties d'IA ne sont pas déterministes, ce qui compromet la reproductibilité",
  "Fuite de données : soumission involontaire de données confidentielles à des serveurs externes",
  "Conformité stylistique : textes uniformes et prévisibles qui érodent la voix de l'auteur",
  "Fausse impression de compétence : l'étudiant croît maîtriser un sujet parce que l'IA a produit un texte fluide",
] as const;

// ─── Module 2 : Taxonomie des outils IA (Bagheri) ───

/** Outils IA organisés par catégorie de tâche académique */
export const OUTILS_IA = {
  rédaction: [
    { nom: "ChatGPT", usage: "Rédaction, reformulation, feedback stylistique, brainstorming idées" },
    { nom: "Claude", usage: "Rédaction longue, analyse de documents, raisonnement approfondi" },
    { nom: "Grammarly", usage: "Correction grammaticale, amélioration du style, suggestions de vocabulaire" },
    { nom: "WriteSonic", usage: "Génération de brouillons, paraphrase, optimisation SEO académique" },
    { nom: "Jenni AI", usage: "Assistance à la rédaction académique, complétion de texte" },
  ],
  recherche: [
    { nom: "Elicit", usage: "Recherche sémantique, résumé d'articles, extraction de données" },
    { nom: "Connected Papers", usage: "Cartographie visuelle des relations entre articles" },
    { nom: "Research Rabbit", usage: "Découverte de littérature connexe, graphes de citation" },
    { nom: "Semantic Scholar", usage: "Recherche académique avec IA, TLDR automatique" },
    { nom: "Consensus", usage: "Synthèse de preuves depuis la littérature, réponses fondées sur la recherche" },
    { nom: "SciSpace / Typeset.io", usage: "Lecture assistée, explication de formules, surligneur IA" },
    { nom: "Iris.ai", usage: "Cartographie de la littérature, extraction de concepts clés" },
  ],
  analyse: [
    { nom: "OpenAI Codex / ChatGPT Code", usage: "Génération de code d'analyse statistique (R, Python)" },
    { nom: "Julius AI", usage: "Analyse de données en langage naturel, visualisation automatique" },
    { nom: "SciNote", usage: "Gestion de données de laboratoire, protocoles expérimentaux" },
    { nom: "ATLAS.ti (avec IA)", usage: "Analyse qualitative, codage thématique assisté" },
  ],
  communication: [
    { nom: "Beautiful.ai", usage: "Présentations académiques, diapositives de soutenance" },
    { nom: "Tome", usage: "Mise en page académique, formatage de manuscrits" },
    { nom: "Zotero + IA plugins", usage: "Gestion de références avec suggestions de citations" },
  ],
} as const;

/** Techniques avancées de prompting pour la recherche */
export const TECHNIQUES_PROMPTING = [
  {
    technique: "Apprentissage en contexte (Few-Shot ICL)",
    description: "Fournir des exemples du format attendu avant de demander la tâche",
    exempleRecherche: "Voici 3 résumés d'articles [exemples]. Résume cet article en suivant le même format.",
  },
  {
    technique: "Chaîne de prompts interactive",
    description: "Décomposer une tâche complexe en étapes séquentielles avec feedback",
    exempleRecherche: "Étape 1 : identifie les thèmes principaux. Attends ma validation. Étape 2 : pour chaque thème validé, trouve 5 articles clés.",
  },
  {
    technique: "Prompting itératif",
    description: "Affiner progressivement les sorties par révisions successives ciblées",
    exempleRecherche: "Révise cette section en ajoutant une discussion sur les biais potentiels. Corrige ensuite le ton pour le rendre plus nuancé.",
  },
  {
    technique: "Auto-cohérence (Self-Consistency)",
    description: "Générer plusieurs réponses et comparer la cohérence pour identifier les biais",
    exempleRecherche: "Propose 3 formulations différentes de cette hypothèse. Compare-les et identifie les points de convergence et divergence.",
  },
  {
    technique: "Prompting récursif (Step-Back)",
    description: "Demander à l'IA de prendre du recul pour considérer le contexte plus large",
    exempleRecherche: "Avant de répondre, prends du recul : quelles sont les hypothèses fondamentales de ma question de recherche ?",
  },
  {
    technique: "Rôle + Auditoire + Modificateur",
    description: "Combiner rôle, public cible et modificateur tonal pour cibler la réponse",
    exempleRecherche: "En tant que méthodologue expérimenté, explique la différence entre analyse thématique et analyse de contenu, pour un doctorant en SHS, de façon nuancée.",
  },
] as const;

// ─── Module 3 : Bonnes pratiques ChatGPT pour la thèse (Johannesson) ───

/** Rôles de ChatGPT dans le processus de thèse */
export const ROLES_CHATGPT_THESE = [
  {
    rôle: "Chercheur",
    tâches: [
      "Affiner les questions de recherche",
      "Générer des hypothèses",
      "Recommander des méthodes de recherche",
      "Guider les considérations éthiques",
      "Concevoir des protocoles d'entretien",
      "Créer et justifier des grilles d'entretien",
      "Proposer des codes et thèmes pour l'analyse qualitative",
    ],
  },
  {
    rôle: "Érudit",
    tâches: [
      "Identifier les lacunes de connaissance et de recherche",
      "Suggérer de la littérature pertinente",
      "Résumer et analyser des articles",
      "Clarifier des concepts académiques",
      "Fournir le contexte historique",
      "Offrir des contre-arguments aux idées de l'étudiant",
      "Dégager les implications éthiques et sociétales",
    ],
  },
  {
    rôle: "Rédacteur académique",
    tâches: [
      "Rédiger et éditer du contenu",
      "Rendre le texte clair, concis, cohérent et confiant",
      "Rendre le texte engageant pour le lecteur",
      "Aider à la formulation d'arguments",
      "Rédiger des titres et résumés percutants",
      "Suggérer des visualisations de résultats",
      "Améliorer la fluidité des transitions entre sections",
    ],
  },
] as const;

/** Directives de prompting itératif pour la thèse */
export const DIRECTIVES_PROMPTING_THESE = [
  "Être patient et itératif : ne pas se limiter à un prompt unique. Utiliser des questions de suivi pour affiner.",
  "Être ouvert à l'exploration : permettre à l'IA de proposer des réponses originales. Utiliser des questions ouvertes (comment, pourquoi).",
  "Reformuler et affiner : expérimenter différentes formulations. Ajouter du contexte (discipline, public cible, contraintes).",
  "Guider le format de réponse : spécifier la longueur, la structure (paragraphes, listes, tableau).",
  "Être orienté objectif : distinguer prompts de brainstorming (créatifs) et prompts d'évaluation (critiques).",
  "Combiner les formes de prompts : rôle + instruction + contexte + modificateur = prompt précis",
  "Différencier les 3 rôles : chercheur (méthodes), érudit (littérature), rédacteur (style)",
  "Toujours vérifier les références citées par l'IA : elles sont souvent fictives",
] as const;

/** Les 7 C du style académique (Johannesson) */
export const SEPT_C_STYLE_ACADEMIQUE = [
  { lettre: "C", qualité: "Clear", traduction: "Clair", description: "Idées compréhensibles sans ambiguïté" },
  { lettre: "C", qualité: "Concise", traduction: "Concis", description: "Exprimer le maximum en un minimum de mots" },
  { lettre: "C", qualité: "Coherent", traduction: "Cohérent", description: "Logique interne et liens explicites entre idées" },
  { lettre: "C", qualité: "Correct", traduction: "Correct", description: "Grammaire, terminologie et citations exactes" },
  { lettre: "C", qualité: "Credible", traduction: "Crédible", description: "Arguments étayés par des preuves et des sources" },
  { lettre: "C", qualité: "Complete", traduction: "Complet", description: "Tous les aspects nécessaires traités sans omission" },
  { lettre: "C", qualité: "Compelling", traduction: "Convaincant", description: "Texte engageant qui maintient l'attention du lecteur" },
] as const;

// ─── Module 4 : Persévérance et stratégies cognitives de rédaction (Belleville & Jackson) ───

/** 4 types d'objectifs pour structurer la rédaction d'une thèse */
export const TYPES_OBJECTIFS_REDACTION = [
  {
    type: "À long terme",
    description: "Lignes d'arrivée ultimes (ex. : finir le contexte théorique d'ici la fin de session)",
    avantage: "Forte motivation par accomplissement, représente la progression",
    piège: "Peut générer du découragement face à l'ampleur, feedback trop vague du directeur",
  },
  {
    type: "Spécifiques (SMART)",
    description: "Objectifs précis, concrets, réalisables à court terme (hebdomadaires)",
    avantage: "Permet un état des lieux réaliste, teste la faisabilité",
    piège: "Tendance à les sous-estimer, surtout pour les doctorants inexpérimentés",
  },
  {
    type: "De temps",
    description: "Plages horaires régulières dédiées à la rédaction (ex. : 3 × 2h par semaine)",
    avantage: "Crée une habitude, rend la production écriture prévisible et régulière",
    piège: "Qualité vs quantité : écrire beaucoup n'est pas écrire bien",
  },
  {
    type: "De projet",
    description: "Étapes jalonnées avec livrables concrets (plan détaillé, première version, révision)",
    avantage: "Structure le travail de rédaction non linéaire, permet le suivi de progression",
    piège: "Risque de rigidité si les objectifs changent en cours de route",
  },
] as const;

/** Stratégies cognitives pour surmonter les blocages de rédaction */
export const STRATEGIES_SURMONTER_BLOCAGES = [
  {
    blocage: "Syndrome de l'imposteur",
    signaux: ["Comparaison excessive avec les pairs", "Minimisation de ses propres réalisations", "Peur d'être découvert comme incompétent"],
    stratégie: "Se comparer à soi-même (passé vs présent), pas aux autres. Valoriser la progression personnelle. L'excellence est un moyen, pas une fin.",
  },
  {
    blocage: "Procrastination cyclique",
    signaux: ["Évitement répété", "Objectifs grandioses suivis de culpabilité", "Binge-writing (rédaction compulsive)"],
    stratégie: "Remplacer les grands objectifs par des micro-tâches SMART. Programmer des plages régulières courtes plutôt que de longues sessions épisodiques.",
  },
  {
    blocage: "Perfectionnisme paralysant",
    signaux: ["Refus de soumettre un texte imparfait", "Révisions infinies sans progression", "Attente d'inspiration plutôt que de discipline"],
    stratégie: "Séparer rédaction et révision. Produire d'abord (qualité acceptable), parfaire ensuite. Le texte parfait n'existe pas au premier jet.",
  },
  {
    blocage: "Anxiété de performance",
    signaux: ["Pression de la compétition universitaire", "Culture du publie ou péris", "Peur de l'échec face au directeur"],
    stratégie: "Distinguer compétition saine (motivation, créativité) de compétition toxique (anxiété, autoflagellation). On vaut plus que le total de ses subventions.",
  },
  {
    blocage: "Blocage créatif",
    signaux: ["Incapacité à commencer", "Page blanche prolongée", "Difficulté à organiser ses idées"],
    stratégie: "Commencer par un plan détaillé ou une carte conceptuelle. Écrire la section la plus facile en premier pour gagner de l'élan. Utiliser le freewriting (écriture libre sans censure).",
  },
  {
    blocage: "Désengagement progressif",
    signaux: ["Absence aux rendez-vous de supervision", "Retards répétés", "Évitement de la rétroaction"],
    stratégie: "Rappeler que la rédaction de thèse est un casse-tête de 10 000 pièces sans image finale — avancer un morceau à la fois. L'entente écrite de supervision prévient les malentendus.",
  },
] as const;

/** Règles d'or pour la relation de supervision et la rédaction (Belleville & Jackson) */
export const REGLES_RELATION_SUPERVISION = [
  "Clarifier les attentes mutuelles dès le début : utiliser un exercice structuré (type Échelle des PERDUS)",
  "Consigner l'entente par écrit : rôles, responsabilités, échéances, modalités de feedback",
  "Le directeur présente un miroir bienveillant mais honnête, pas dicte les objectifs",
  "L'étudiant est l'auteur de la thèse : développer son autonomie, pas créer une dépendance",
  "La rétroaction entre pairs développe l'ouverture et l'humilité — initier tôt la révision par les pairs",
  "Attention aux contrats implicites : les règles non écrites sont un terreau fertile pour les conflits",
  "Éviter le binge-writing : privilégier des sessions régulières et courtes",
  "La compétition peut être saine (motivation, créativité) mais devient toxique quand elle mène à l'autoflagellation",
] as const;

// ─── Agrégat pour import global ───

export const AI_RESEARCH_CORPUS = {
  principesEthiquesIA: PRINCIPES_ETHIQUES_IA,
  risquesIA: RISQUES_IA_RECHERCHE,
  domainesIA: DOMAINES_IA_RECHERCHE,
  outilsIA: OUTILS_IA,
  techniquesPrompting: TECHNIQUES_PROMPTING,
  rolesChatGPT: ROLES_CHATGPT_THESE,
  directivesPrompting: DIRECTIVES_PROMPTING_THESE,
  septCStyle: SEPT_C_STYLE_ACADEMIQUE,
  typesObjectifs: TYPES_OBJECTIFS_REDACTION,
  strategiesBlocages: STRATEGIES_SURMONTER_BLOCAGES,
  reglesSupervision: REGLES_RELATION_SUPERVISION,
} as const;

// ─── Module 9 : 27 Outils IA pour la recherche (Priyo Das) + workflow 8 étapes ──────────────────────────────

export interface OutilRecherche {
  nom: string;
  categorie: string;
  usage: string;
  quandUtiliser: string;
}

export interface EtapeWorkflow {
  etape: number;
  titre: string;
  description: string;
  outilsRecommandes: string[];
}

export interface CategorieOutils {
  categorie: string;
  description: string;
  outils: OutilRecherche[];
}

export const OUTILS_IA_RECHERCHE: CategorieOutils[] = [
  {
    categorie: "recherche_litterature",
    description: "Recherche et découverte de littérature académique",
    outils: [
      { nom: "Semantic Scholar", categorie: "recherche_litterature", usage: "Recherche sémantique dans une vaste base de données académiques avec résumés automatiques", quandUtiliser: "Quand on souhaite identifier rapidement des articles pertinents par mot-clé ou par similarité sémantique" },
      { nom: "Search Smart", categorie: "recherche_litterature", usage: "Comparaison des bases de données académiques pour identifier la plus adaptée à un sujet donné", quandUtiliser: "Quand on débute un sujet et qu'on ne sait pas quelle base de données interroger en priorité" },
      { nom: "Consensus", categorie: "recherche_litterature", usage: "Synthèse de réponses fondées sur la littérature académique à une question de recherche", quandUtiliser: "Quand on cherche une réponse rapide étayée par des preuves issues d'articles évalués par les pairs" },
      { nom: "Scinapse", categorie: "recherche_litterature", usage: "Recherche et filtrage d'articles académiques avec classement par pertinence", quandUtiliser: "Quand on a besoin de filtrer et classer les résultats d'une recherche bibliographique" },
      { nom: "R Discovery", categorie: "recherche_litterature", usage: "Découverte de littérature pertinente avec recommandations personnalisées", quandUtiliser: "Quand on explore un domaine et souhaite des suggestions contextualisées" },
    ],
  },
  {
    categorie: "cartographie_litterature",
    description: "Cartographie visuelle des relations entre articles et auteurs",
    outils: [
      { nom: "ResearchRabbit", categorie: "cartographie_litterature", usage: "Découverte d'articles connexes et d'auteurs émergents via des connexions visuelles", quandUtiliser: "Quand on veut étendre sa revue de littérature en suivant les réseaux de citations et de co-auteurs" },
      { nom: "Inciteful", categorie: "cartographie_litterature", usage: "Exploration des relations entre articles académiques et visualisation de la littérature connectée", quandUtiliser: "Quand on cherche à identifier les articles les plus influents et leurs liens structurels" },
      { nom: "Open Knowledge Maps", categorie: "cartographie_litterature", usage: "Création de cartes visuelles de la littérature scientifique autour d'un sujet", quandUtiliser: "Quand on souhaite une vue d'ensemble topographique d'un champ de recherche" },
      { nom: "VOSviewer", categorie: "cartographie_litterature", usage: "Création et visualisation de réseaux bibliométriques (mots-clés, citations, co-auteurship)", quandUtiliser: "Quand on réalise une analyse bibliométrique ou scientométrique complète" },
      { nom: "Connected Papers", categorie: "cartographie_litterature", usage: "Construction de graphes visuels d'articles connexes à partir d'un article de départ", quandUtiliser: "Quand on a trouvé un article clé et veut identifier visuellement ses précurseurs et successeurs" },
    ],
  },
  {
    categorie: "prise_de_notes",
    description: "Organisation des notes et des findings de recherche",
    outils: [
      { nom: "NotebookLM", categorie: "prise_de_notes", usage: "Structuration thématique des findings de recherche avec organisation automatique", quandUtiliser: "Quand on a accumulé de nombreuses notes et souhaite les organiser par thématiques" },
      { nom: "Notion", categorie: "prise_de_notes", usage: "Base de données personnalisable pour organiser la recherche, les références et les tâches", quandUtiliser: "Quand on a besoin d'un système flexible combinant notes, suivi de tâches et gestion de projet" },
      { nom: "Glasp", categorie: "prise_de_notes", usage: "Surlignage et organisation d'informations depuis pages web, PDFs, YouTube et autres sources", quandUtiliser: "Quand on lit en ligne et souhaite capturer des passages clés avec annotation et catégorisation" },
    ],
  },
  {
    categorie: "analyse_donnees",
    description: "Analyse statistique et traitement des données de recherche",
    outils: [
      { nom: "JASP", categorie: "analyse_donnees", usage: "Analyse statistique via interface conviviale, incluant méthodes fréquentistes et bayésiennes", quandUtiliser: "Quand on réalise des analyses statistiques sans expertise approfondie en programmation R" },
      { nom: "Simple ML for Sheets", categorie: "analyse_donnees", usage: "Machine learning directement dans Google Sheets (prédiction, valeurs manquantes, détection d'anomalies, prévisions)", quandUtiliser: "Quand on dispose de données tabulaires et souhaite appliquer des modèles ML sans coder" },
      { nom: "R (R Project)", categorie: "analyse_donnees", usage: "Calcul statistique, analyse de données, visualisation et recherche quantitative avancée", quandUtiliser: "Quand on a besoin d'analyses statistiques avancées et personnalisées nécessitant un langage de programmation" },
    ],
  },
  {
    categorie: "figures_diagrammes",
    description: "Création de figures, diagrammes et visuels de recherche",
    outils: [
      { nom: "Draw.io / diagrams.net", categorie: "figures_diagrammes", usage: "Création de diagrammes de flux, cadres de recherche et structures visuelles", quandUtiliser: "Quand on construit un schéma méthodologique, un diagramme de processus ou un cadre conceptuel" },
      { nom: "Inkscape", categorie: "figures_diagrammes", usage: "Éditeur vectoriel libre pour la création et l'édition de figures de recherche", quandUtiliser: "Quand on a besoin de figures haute qualité pour publication (format SVG modifiable)" },
      { nom: "Meta AI", categorie: "figures_diagrammes", usage: "Génération et édition d'images à partir de descriptions textuelles", quandUtiliser: "Quand on souhaite créer des visuels exploratoires ou des concepts pour illustration" },
      { nom: "Bing Image Creator", categorie: "figures_diagrammes", usage: "Génération d'images à partir de descriptions textuelles", quandUtiliser: "Quand on a besoin d'illustrations conceptuelles pour des présentations ou des supports visuels" },
    ],
  },
  {
    categorie: "redaction_proofreading",
    description: "Édition, relecture et amélioration de la rédaction scientifique",
    outils: [
      { nom: "ChatGPT", categorie: "redaction_proofreading", usage: "Édition, reformulation, relecture, explication, restructuration et amélioration de la rédaction scientifique", quandUtiliser: "Quand on a besoin d'aide pour la formulation, la reformulation ou le feedback stylistique" },
      { nom: "Hemingway Editor", categorie: "redaction_proofreading", usage: "Amélioration de la lisibilité, identification des phrases complexes, rendre l'écriture plus concise", quandUtiliser: "Quand on veut simplifier un texte académique trop dense ou vérifier sa lisibilité" },
      { nom: "Paraphraser.io", categorie: "redaction_proofreading", usage: "Reformulation de phrases et paragraphes tout en conservant le sens", quandUtiliser: "Quand on doit reformuler un passage sans en modifier le sens pour éviter le plagiat" },
    ],
  },
  {
    categorie: "gestion_references",
    description: "Collecte, organisation et gestion des références bibliographiques",
    outils: [
      { nom: "Zotero", categorie: "gestion_references", usage: "Collecte, organisation, annotation, citation et gestion des articles de recherche", quandUtiliser: "Quand on construit une bibliothèque de références avec import automatique depuis bases de données" },
      { nom: "Mendeley", categorie: "gestion_references", usage: "Gestion des références, organisation des articles, génération de citations et bibliographies", quandUtiliser: "Quand on combine gestion de références et lecture annotée de PDFs dans un même outil" },
      { nom: "JabRef", categorie: "gestion_references", usage: "Organisation d'informations bibliographiques, particulièrement adapté aux workflows BibTeX", quandUtiliser: "Quand on travaille avec LaTeX et a besoin d'un gestionnaire natif BibTeX" },
    ],
  },
];

export const WORKFLOW_RECHERCHE_IA: EtapeWorkflow[] = [
  { etape: 1, titre: "Trouver les articles", description: "Interroger les bases de données académiques pour identifier la littérature pertinente. En choisir 2-3 outils maximum.", outilsRecommandes: ["Semantic Scholar", "Search Smart", "Consensus"] },
  { etape: 2, titre: "Étendre la littérature", description: "Utiliser la cartographie visuelle pour découvrir les articles connexes et les développements récents.", outilsRecommandes: ["ResearchRabbit", "Connected Papers"] },
  { etape: 3, titre: "Cartographier le champ", description: "Construire une vue d'ensemble topographique pour identifier clusters thématiques et auteurs centraux.", outilsRecommandes: ["VOSviewer", "Open Knowledge Maps"] },
  { etape: 4, titre: "Lire et extraire", description: "Capturer les passages et idées clés, organiser par thématique pour la synthèse.", outilsRecommandes: ["Glasp", "NotebookLM"] },
  { etape: 5, titre: "Analyser les données", description: "Traiter et analyser les données selon la méthodologie choisie.", outilsRecommandes: ["JASP", "R", "Simple ML for Sheets"] },
  { etape: 6, titre: "Créer les figures", description: "Concevoir diagrammes méthodologiques et figures de résultats. Formats vectoriels privilégiés.", outilsRecommandes: ["Draw.io / diagrams.net", "Inkscape"] },
  { etape: 7, titre: "Améliorer la rédaction", description: "Revoir style, clarté, concision. La rédaction reste la responsabilité du doctorant.", outilsRecommandes: ["ChatGPT", "Hemingway Editor"] },
  { etape: 8, titre: "Gérer les références", description: "Organiser les références, générer la bibliographie, vérifier la cohérence des citations.", outilsRecommandes: ["Zotero", "Mendeley", "JabRef"] },
];

export const REGLE_BON_USAGE_OUTILS: string =
  "Ne pas utiliser tous les outils simultanément — construire un workflow séquentiel avec 2-3 outils par étape maximum.";

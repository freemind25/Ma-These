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

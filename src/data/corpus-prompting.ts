// ═════════════════════════════════════════════════════════════════════════════════════════════════════════
// ThesisFrame — Corpus d'Ingénierie de Prompts
// Principes de qualité, modèles de prompts de recherche, anti-patterns,
// règles empiriques de rédaction d'articles scientifiques
// Basé sur les bonnes pratiques d'ingénierie de prompts — aucune reproduction de texte protégé
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────────────

/** Un principe fondamental d'ingénierie de prompts */
interface PrincipePrompt {
  id: string;
  titre: string;
  categorie: "structure" | "clarte" | "specificite" | "contraintes" | "iteration" | "contexte";
  description: string;
  exempleAvant: string;
  exempleApres: string;
}

/** Un modèle de prompt de recherche spécialisé */
interface ModelePromptRecherche {
  id: string;
  titre: string;
  contexte: string;
  structure: string[];
  variables: { nom: string; description: string; obligatoire: boolean }[];
  conseilExecution: string;
}

/** Un anti-pattern de prompting avec sa correction */
interface AntiPatternPrompt {
  id: string;
  erreur: string;
  consequence: string;
  correction: string;
  categorie: "vague" | "surcharge" | "absence_contexte" | "mauvais_role" | "absence_contraintes" | "iteration_unique";
}

/** Une règle empirique de rédaction d'articles de recherche */
interface RegleEmpirique {
  id: string;
  domaine: "problematique" | "methodologie" | "resultats" | "discussion" | "redaction" | "structure" | "submission";
  regle: string;
  justification: string;
}

// ═════════════════════════════════════════════════════════════════════════════════
// MODULE 1 — Principes de qualité des prompts
// ═════════════════════════════════════════════════════════════════════════════════

export const PRINCIPES_PROMPT_QUALITE: PrincipePrompt[] = [
  {
    id: "role-explicite",
    titre: "Assigner un rôle expert explicite",
    categorie: "role",
    description: "Spécifier l'identité, le domaine d'expertise et le niveau de spécialisation de l'IA. Plus le rôle est précis, plus la réponse sera adaptée au contexte académique.",
    exempleAvant: "Écris une introduction sur la méthodologie qualitative.",
    exempleApres: "Tu es un professeur agrégé en méthodologie de la recherche en sciences de l'éducation, spécialisé en approches qualitatives et en analyse phénoménologique. Rédige une introduction méthodologique pour un chapitre de thèse en SHS.",
  },
  {
    id: "structure-5C",
    titre: "Appliquer le modèle des 5 C (Contexte, Consigne, Critères, Contraintes, Compléments)",
    categorie: "structure",
    description: "Un prompt efficace contient toujours ces cinq composantes structurantes, dans cet ordre logique.",
    exempleAvant: "Fais une revue de littérature sur l'urbanisme participatif.",
    exempleApres: "[CONTEXTE] Je rédige une thèse en urbanisme sur la participation citoyenne dans les projets d'aménagement. [CONSIGNE] Rédige la Section 4 de ma revue de littérature : synthèse des travaux sur l'urbanisme participatif (2000-2024). [CRITÈRES] Organise par courant théorique, compare les approches, identifie les lacunes. [CONTRAINTES] 2000 mots max, style académique francophone, citations (Auteur, Année). [COMPLÉMENTS] Voici 5 références clés : ...",
  },
  {
    id: "specificite-observable",
    titre: "Formuler des critères d'évaluation observables",
    categorie: "specificite",
    description: "Définir précisément ce qui constitue une bonne réponse : format, longueur, niveau de détail, ton, éléments à inclure/exclure.",
    exempleAvant: "Résume cet article de façon claire.",
    exempleApres: "Résume cet article en 150-200 mots. Structure : 1) objectif de l'étude, 2) méthode, 3) résultat principal, 4) implication. Style académique. Ne pas inclure de données chiffrées secondaires.",
  },
  {
    id: "contraintes-format",
    titre: "Contraindre le format de sortie",
    categorie: "contraintes",
    description: "Spécifier le format attendu (paragraphe, liste, tableau, sections numérotées) et les règles de présentation pour éviter les réponses non exploitable directement.",
    exempleAvant: "Donne-moi des idées pour ma méthodologie.",
    exempleApres: "Propose 3 approches méthodologiques adaptées à ma recherche. Pour chaque approche, présente : 1) Nom de l'approche (1 ligne), 2) Description (3-4 lignes), 3) Avantages et limites (puce par point). Format tableau comparatif en fin de réponse.",
  },
  {
    id: "contexte-cadrage",
    titre: "Fournir un contexte riche et structuré",
    categorie: "contexte",
    description: "L'IA produit des réponses proportionnelles à la qualité du contexte fourni. Inclure la problématique, les hypothèses, le cadre théorique, et le public cible.",
    exempleAvant: "Aide-moi avec mes hypothèses de recherche.",
    exempleApres: "Voici ma problématique : [énoncé]. Mon cadre théorique mobilise [théorie A] et [théorie B]. Mes variables sont : VI = [liste], VD = [liste]. Formule 3 hypothèses testables reliant ces variables, en justifiant la dérivation théorique de chacune.",
  },
  {
    id: "iteration-refinage",
    titre: "Itérer par raffinements successifs",
    categorie: "iteration",
    description: "Un prompt unique rarement produit un résultat optimal. Prévoir 2-3 itérations en affinant progressivement les exigences.",
    exempleAvant: "Écris ma discussion (envoi unique, pas de suivi).",
    exempleApres: "Première itération : Rédige un plan détaillé de la discussion. - Deuxième itération : Développe le point 2 en approfondissant le lien avec la littérature. - Troisième itération : Renforce la section sur les limites en ajoutant les biais non mentionnés.",
  },
  {
    id: "demarche-etapee",
    titre: "Découper les tâches complexes en étapes",
    categorie: "structure",
    description: "Pour les tâches longues (chapitre entier, revue complète), découper en sous-tâches séquentielles avec des jalons clairs.",
    exempleAvant: "Écris mon chapitre de méthodologie complet.",
    exempleApres: "Étape 1 : Rédige l'introduction du chapitre méthodologique (problématique, paradigme, justification du choix). Attends ma validation avant de continuer à l'étape 2.",
  },
  {
    id: "exemples-fewshot",
    titre: "Fournir des exemples de sortie attendue (few-shot)",
    categorie: "specificite",
    description: "Montrer à l'IA un exemple du format, du ton et du niveau de détail attendu améliore considérablement la conformité de la réponse.",
    exempleAvant: "Analyse cet article comme une revue critique.",
    exempleApres: "Analyse cet article selon la grille suivante. Voici un exemple de la format attendu pour une analyse antérieure :\n- Force : L'échantillon est représentatif (n=450, stratifié).\nLimite : L'absence de groupe contrôle réduit la validité interne.-\nApplique ce même format à l'article suivant.",
  },
  {
    id: "verrouillage-negative",
    titre: "Utiliser des contraintes négatives explicites",
    categorie: "contraintes",
    description: "Lister ce que l'IA NE doit PAS faire est souvent plus efficace que de lister ce qu'elle doit faire.",
    exempleAvant: "Écris un résumé de ma thèse.",
    exempleApres: "Rédige un résumé de 200 mots. NE PAS : utiliser la première personne, inclure des références bibliographiques, mentionner des détails méthodologiques secondaires, employer un ton promotionnel.",
  },
  {
    id: "ancrage-theorique",
    titre: "Ancrer le prompt dans un cadre théorique identifié",
    categorie: "contexte",
    description: "Quand le prompt spécifie la théorie ou le cadre mobilisé, l'IA produit des réponses significativement plus cohérentes avec la démarche scientifique.",
    exempleAvant: "Parle-moi de la résilience urbaine.",
    exempleApres: "En t'appuyant sur le cadre théorique de la résilience urbaine (Holling, 1973 ; Folke, 2006), analyse comment la notion de panarchie s'applique aux systèmes de transport après un choc. Limite-toi à ce cadre.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════════
// MODULE 2 — Modèles de prompts de recherche
// ═════════════════════════════════════════════════════════════════════════════════

export const MODELES_PROMPTS_RECHERCHE = {
  // ── Revue de littérature ────────────────────────────────────────────
  revueLitterature: [
    {
      id: "rl-synthese-thematique",
      titre: "Synthèse thématique d'un corpus de lectures",
      contexte: "Pour organiser et synthétiser les lectures autour de thèmes identifiés dans la littérature.",
      structure: [
        "Rôle de l'IA : expert en synthèse académique dans [discipline]",
        "Contexte : thème de la revue, période couverte, nombre de sources",
        "Consigne : synthétiser les [n] sources selon [n] thèmes identifiés",
        "Pour chaque thème : constats convergents, divergents, lacunes",
        "Format : paragraphes thématiques avec citations intégrées (Auteur, Année)",
        "Contraintes : pas de catalogue d'abstracts, intégration croisée obligatoire",
      ],
      variables: [
        { nom: "discipline", description: "Champ disciplinaire de la thèse", obligatoire: true },
        { nom: "sources", description: "Liste des références à synthétiser", obligatoire: true },
        { nom: "themes", description: "Thèmes d'organisation identifiés", obligatoire: true },
        { nom: "motsCible", description: "Nombre de mots visé", obligatoire: false },
      ],
      conseilExecution: "Fournir les résumés des sources pour chaque référence, pas seulement les titres. Si possible, fournir les conclusions principales de chaque source.",
    },
    {
      id: "rl-identification-lacunes",
      titre: "Identification systématique des lacunes de recherche",
      contexte: "Pour cartographier les lacunes dans la littérature existante selon une taxonomie structurée.",
      structure: [
        "Rôle : chercheur senior spécialisé en épistémologie de [discipline]",
        "Contexte : objet de recherche, corpus déjà exploré, limites identifiées",
        "Consigne : identifier et classer les lacunes de recherche selon 7 types (preuve, méthode, population, contexte, théorique, empirique, pratique)",
        "Pour chaque lacune : type, preuve dans la littérature, question de recherche dérivée",
        "Hiérarchiser : lacune principale vs lacunes secondaires",
        "Format : tableau structuré avec colonnes [type, description, preuve, QDR dérivée]",
      ],
      variables: [
        { nom: "objetRecherche", description: "L'objet d'étude principal", obligatoire: true },
        { nom: "syntheseExistante", description: "Résumé de ce que la littérature couvre déjà", obligatoire: true },
        { nom: "sources", description: "Références clés du corpus", obligatoire: false },
      ],
      conseilExecution: "Préciser les méthodes déjà utilisées dans le domaine et les populations déjà étudiées pour permettre à l'IA de cibler les lacunes pertinentes.",
    },
    {
      id: "rl-cadrage-prisma",
      titre: "Cadrage protocolaire PRISMA pour revue systématique",
      contexte: "Pour initialiser le protocole d'une revue systématique ou scoping review selon les lignes directrices PRISMA.",
      structure: [
        "Rôle : méthodologue expert en revues systématiques, familier avec PRISMA 2020",
        "Contexte : type de revue (systématique, scoping, narrative), discipline",
        "Consigne : rédiger les sections du protocole : PICO/PECO, stratégie de recherche, critères d'inclusion/exclusion, diagramme PRISMA",
        "Inclure : bases de données, mots-clés, opérateurs booléens, stratégie de tri",
        "Format : sections numérotées, tableau de synthèse des critères",
      ],
      variables: [
        { nom: "typeRevue", description: "systématique | scoping | narrative", obligatoire: true },
        { nom: "questionRecherche", description: "La question de recherche principale", obligatoire: true },
        { nom: "bases", description: "Bases de données cibles (ex: Scopus, Web of Science)", obligatoire: false },
      ],
      conseilExecution: "Commencer par définir clairement la question PICO/PECO avant de demander le protocole complet.",
    },
  ],

  // ── Méthodologie ───────────────────────────────────────────────────
  methodologie: [
    {
      id: "meth-choix-design",
      titre: "Sélection justifiée d'un design de recherche",
      contexte: "Pour choisir et justifier le design méthodologique le plus adapté à la question de recherche.",
      structure: [
        "Rôle : méthodologue de recherche en [discipline]",
        "Contexte : question de recherche, paradigme épistémologique, contraintes pratiques",
        "Consigne : proposer 2-3 designs possibles, les comparer, et recommander le plus adapté",
        "Pour chaque design : description, forces, limites, conditions d'application",
        "Justification du choix recommandé aligné avec la question et le paradigme",
        "Format : tableau comparatif + paragraphe de justification",
      ],
      variables: [
        { nom: "questionRecherche", description: "La question de recherche formulée", obligatoire: true },
        { nom: "paradigme", description: "Paradigme épistémologique (positiviste, constructiviste, pragmatiste…)", obligatoire: true },
        { nom: "contraintes", description: "Contraintes (temps, accès terrain, budget)", obligatoire: false },
      ],
      conseilExecution: "Mentionner explicitement si la recherche vise la description, l'explication, la compréhension ou la prédiction.",
    },
    {
      id: "meth-selection-statistique",
      titre: "Sélection assistée de tests statistiques",
      contexte: "Pour identifier le test statistique approprié en fonction du type de données et de la question de recherche.",
      structure: [
        "Rôle : biostatisticien et méthodologue quantitatif",
        "Contexte : type de variables, distribution, taille d'échantillon, nombre de groupes",
        "Consigne : appliquer l'arbre de décision statistique pour recommander le test approprié",
        "Étapes : 1) Vérifier les préconditions (normalité, homoscédasticité), 2) Type de question (différence, association, prédiction), 3) Recommender le test + alternative non paramétrique",
        "Format : raisonnement pas-à-pas + recommandation finale encadrée",
      ],
      variables: [
        { nom: "variables", description: "Description des variables (type, nombre de modalités)", obligatoire: true },
        { nom: "question", description: "La question statistique à tester", obligatoire: true },
        { nom: "effectif", description: "Taille de l'échantillon", obligatoire: true },
      ],
      conseilExecution: "Fournir les statistiques descriptives de base (moyenne, écart-type, skewness) pour permettre la vérification des préconditions.",
    },
    {
      id: "meth-guide-entretien",
      titre: "Élaboration d'un guide d'entretien semi-directif",
      contexte: "Pour construire un guide d'entretien structuré pour la collecte de données qualitatives.",
      structure: [
        "Rôle : chercheur qualiticien expérimenté en [discipline]",
        "Contexte : objectifs de l'entretien, profil des répondants, cadre théorique",
        "Consigne : construire un guide de [n] questions organisées en [n] thèmes",
        "Pour chaque question : objectif, formulation ouverte, relance prévue",
        "Inclure : question d'ouverture, transition, question de clôture",
        "Considérations éthiques : consentement, anonymat, droit de retrait",
      ],
      variables: [
        { nom: "objectifs", description: "Ce que l'entretien vise à comprendre", obligatoire: true },
        { nom: "profil", description: "Profil des personnes interviewées", obligatoire: true },
        { nom: "cadre", description: "Cadre théorique mobilisé", obligatoire: false },
      ],
      conseilExecution: "Préciser la durée visée de l'entretien (30 min, 60 min, 90 min) pour calibrer le nombre de questions.",
    },
  ],

  // ── Analyse de données ─────────────────────────────────────────────
  analyseDonnees: [
    {
      id: "ad-codage-qualitatif",
      titre: "Stratégie de codage pour analyse qualitative",
      contexte: "Pour développer une grille de codage et une stratégie d'analyse thématique.",
      structure: [
        "Rôle : chercheur qualiticien expert en analyse thématique (Braun & Clarke)",
        "Contexte : données collectées (type, volume), question de recherche, cadre théorique",
        "Consigne : proposer une stratégie de codage en 6 phases (familiarisation, codage initial, recherche de thèmes, révision, définition, rédaction)",
        "Inclure : exemples de codes déductifs (issus du cadre) et inductifs (émergents des données)",
        "Format : tableau de codes (code, définition, exemple, thème rattaché)",
      ],
      variables: [
        { nom: "typeDonnees", description: "Entretiens, observations, documents…", obligatoire: true },
        { nom: "cadreTheorique", description: "Théorie mobilisée pour les codes déductifs", obligatoire: true },
        { nom: "volume", description: "Nombre approximatif de pages/transcriptions", obligatoire: false },
      ],
      conseilExecution: "Fournir 2-3 extraits de données brutes pour permettre à l'IA d'illustrer les exemples de codage.",
    },
    {
      id: "ad-interpretation-resultats",
      titre: "Interprétation et discussion des résultats",
      contexte: "Pour interpréter des résultats quantitatifs ou qualitatifs en lien avec la littérature et le cadre théorique.",
      structure: [
        "Rôle : chercheur senior en [discipline], expert en interprétation de résultats",
        "Contexte : résultats obtenus, hypothèses de recherche, cadre théorique, littérature de référence",
        "Consigne : interpréter chaque résultat en : 1) le résumant, 2) le comparant à la littérature, 3) l'expliquant par le cadre théorique, 4) identifiant les implications",
        "Distinguer : résultats confirmant les hypothèses vs résultats inattendus",
        "Inclure une section sur les résultats non significatifs ou contradictoires",
        "Format : sous-sections par hypothèse/résultat, avec transition logique entre chacune",
      ],
      variables: [
        { nom: "resultats", description: "Les résultats principaux à interpréter", obligatoire: true },
        { nom: "hypotheses", description: "Les hypothèses formulées", obligatoire: true },
        { nom: "litterature", description: "Résumé des résultats des études de référence", obligatoire: true },
      ],
      conseilExecution: "Préciser quels résultats sont statistiquement significatifs (avec les seuils) et quels résultats sont des tendances.",
    },
  ],

  // ── Rédaction scientifique ─────────────────────────────────────────
  redactionScientifique: [
    {
      id: "rs-introduction-funnel",
      titre: "Rédaction de l'introduction en entonnoir (funnel approach)",
      contexte: "Pour structurer l'introduction d'un article ou chapitre selon la logique de l'entonnoir (du général au spécifique).",
      structure: [
        "Rôle : rédacteur scientifique senior pour revues [discipline]",
        "Contexte : thème général, problématique spécifique, hypothèses",
        "Consigne : rédiger en 5 mouvements : 1) contexte large, 2) domaine spécifique, 3) lacune identifiée, 4) objectif de l'étude, 5) valeur ajoutée",
        "Chaque mouvement = 1 paragraphe avec connecteur de transition",
        "Contraintes : pas de titres de sous-sections dans l'intro, logique descendante",
      ],
      variables: [
        { nom: "contexteLarge", description: "Le contexte général du domaine", obligatoire: true },
        { nom: "lacune", description: "La lacune de recherche identifiée", obligatoire: true },
        { nom: "objectif", description: "L'objectif de l'étude", obligatoire: true },
      ],
      conseilExecution: "La dernière phrase de l'intro doit annoncer clairement la structure du reste de l'article/chapitre.",
    },
    {
      id: "rs-reformulation-paragraphe",
      titre: "Reformulation académique d'un paragraphe",
      contexte: "Pour améliorer la clarté, la concision et le style académique d'un paragraphe rédigé.",
      structure: [
        "Rôle : éditeur scientifique pour revues à comité de lecture en [discipline]",
        "Contexte : paragraphe à améliorer, section concernée (intro/méthode/résultat/discussion)",
        "Consigne : reformuler en respectant le sens intégral, en améliorant : 1) concision, 2) précision, 3) connecteurs logiques, 4) registre académique",
        "Fournir : version reformulée + liste des modifications justifiées",
        "Contrainte négative : ne pas ajouter d'information absente de l'original",
      ],
      variables: [
        { nom: "paragraphe", description: "Le texte à reformuler", obligatoire: true },
        { nom: "section", description: "Section d'où provient le paragraphe", obligatoire: true },
      ],
      conseilExecution: "Indiquer le problème principal du paragraphe (trop long, jargon, manque de transition, répétition) pour cibler la reformulation.",
    },
    {
      id: "rs-reponse-evaluateurs",
      titre: "Rédaction d'une réponse aux évaluateurs (rebuttal letter)",
      contexte: "Pour rédiger une réponse structurée et professionnelle aux commentaires des relecteurs d'une revue.",
      structure: [
        "Rôle : auteur senior avec expérience de la réponse aux évaluateurs",
        "Contexte : commentaires reçus, décision de l'éditeur (révision mineure/majeure), modifications effectuées",
        "Consigne : pour chaque commentaire : 1) remercier, 2) résumer le point, 3) répondre (accepter/argumenter/refuser avec justification), 4) indiquer la modification dans le manuscrit (numéro de ligne)",
        "Ton : respectueux, pas défensif, reconnaître les points valides",
        "Format : lettre de suivi + réponse point par point numérotée",
      ],
      variables: [
        { nom: "commentaires", description: "Les commentaires des évaluateurs", obligatoire: true },
        { nom: "decision", description: "Décision de l'éditeur", obligatoire: true },
      ],
      conseilExecution: "Toujours répondre à CHAQUE point, même les points mineurs. Ne jamais ignorer un commentaire.",
    },
  ],

  // ── Revue par les pairs ─────────────────────────────────────────────
  critiquePaire: [
    {
      id: "cp-evaluation-structuree",
      titre: "Évaluation structurée type peer review",
      contexte: "Pour réaliser une évaluation critique complète d'un manuscrit selon les standards de la revue par les pairs.",
      structure: [
        "Rôle : évaluateur expert pour une revue Q1 en [discipline]",
        "Contexte : manuscrit à évaluer, type d'article (original, revue, méthodologique)",
        "Consigne : évaluer selon 8 critères : 1) originalité, 2) pertinence, 3) rigueur méthodologique, 4) qualité de l'analyse, 5) clarté de la rédaction, 6) adéquation des conclusions, 7) qualité des figures/tableaux, 8) contribution au champ",
        "Pour chaque critère : appréciation + détails + suggestions concrètes",
        "Synthèse : forces, faiblesses majeures, recommandation (accepter/réviser mineurement/réviser majeurement/rejeter)",
      ],
      variables: [
        { nom: "manuscrit", description: "Le texte à évaluer", obligatoire: true },
        { nom: "typeArticle", description: "Type d'article pour adapter les critères", obligatoire: true },
      ],
      conseilExecution: "Préciser le type de design de recherche pour adapter la grille d'évaluation (expérimental, observationnel, qualitatif, mixte).",
    },
    {
      id: "cp-auto-evaluation-pre-soumission",
      titre: "Auto-évaluation pré-soumission d'un manuscrit",
      contexte: "Pour vérifier la qualité d'un manuscrit avant soumission à une revue.",
      structure: [
        "Rôle : éditeur en chef de revue scientifique en [discipline]",
        "Contexte : manuscrit quasi-final, revue cible identifiée",
        "Consigne : évaluer le manuscrit avec la grille de la revue cible et identifier les points faibles rédhibitoires (desk reject risks)",
        "Vérifier : adéquation au scope de la revue, respect des normes auteur, qualité du titre/résumé, structure IMRaD",
        "Prioriser : classer les problèmes par sévérité (bloquant / important / mineur)",
        "Format : liste priorisée de problèmes avec recommandations de correction",
      ],
      variables: [
        { nom: "manuscrit", description: "Le texte à auto-évaluer", obligatoire: true },
        { nom: "revueCible", description: "Nom et guidelines de la revue visée", obligatoire: true },
      ],
      conseilExecution: 'Fournir les guidelines "author instructions" de la revue cible pour une évaluation plus précise.',
    },
  ],

  // ── Spécifique thèse ───────────────────────────────────────────────
  these: [
    {
      id: "th-problematique",
      titre: "Formulation de la problématique de thèse",
      contexte: "Pour formuler et affiner la problématique d'une thèse à partir d'un thème de recherche initial.",
      structure: [
        "Rôle : directeur de thèse en [discipline] avec 20 ans d'expérience",
        "Contexte : thème initial, lectures exploratoires, discipline, niveau (master/doctorat)",
        "Consigne : formuler la problématique en 3 étapes : 1) contexte et enjeux, 2) tension/paradoxe/contradiction identifié(e), 3) question(s) de recherche principale(s) et secondaires",
        "Vérifier : la problématique est-elle assez large pour une thèse ? assez spécifique pour être traitable ?",
        "Critères : faisabilité, originalité, pertinence, rigueur",
      ],
      variables: [
        { nom: "theme", description: "Le thème initial de recherche", obligatoire: true },
        { nom: "lectures", description: "Résumé des lectures exploratoires", obligatoire: true },
        { nom: "discipline", description: "Discipline de la thèse", obligatoire: true },
      ],
      conseilExecution: "Fournir les 3-5 références fondatrices du domaine pour permettre à l'IA d'ancrer la problématique dans la littérature existante.",
    },
    {
      id: "th-plan-chapitre",
      titre: "Plan détaillé d'un chapitre de thèse",
      contexte: "Pour construire le plan détaillé d'un chapitre en cohérence avec la problématique et le plan général de la thèse.",
      structure: [
        "Rôle : directeur de thèse expert en structuration de manuscrits académiques",
        "Contexte : titre provisoire du chapitre, place dans la thèse, problématique, hypothèses pertinentes",
        "Consigne : élaborer un plan en 2-3 niveaux hiérarchiques avec pour chaque section : objectif, contenu attendu, nombre de pages estimé",
        "Vérifier la cohérence : chaque section contribue-t-elle à la problématique ?",
        "Inclure : transitions prévues entre sections, liens avec d'autres chapitres",
        "Format : plan numéroté (1., 1.1., 1.1.1.) avec annotations",
      ],
      variables: [
        { nom: "titreChapitre", description: "Titre provisoire du chapitre", obligatoire: true },
        { nom: "place", description: "Position du chapitre dans la thèse et rôle", obligatoire: true },
        { nom: "pagesCible", description: "Nombre de pages visé pour le chapitre", obligatoire: false },
      ],
      conseilExecution: "Préciser quelles hypothèses ou questions de recherche ce chapitre doit traiter.",
    },
    {
      id: "th-prepare-soutenance",
      titre: "Préparation aux questions du jury de soutenance",
      contexte: "Pour anticiper et préparer les questions probables du jury lors de la soutenance de thèse.",
      structure: [
        "Rôle : membre expérimenté de jurys de thèse en [discipline]",
        "Contexte : résumé de la thèse, hypothèses principales, résultats clés, limites identifiées",
        "Consigne : générer 15-20 questions probables classées en 5 catégories : 1) problématique et choix, 2) méthodologie et validité, 3) résultats et interprétation, 4) limites et perspectives, 5) ouverture et positionnement",
        "Pour chaque question : formulation + éléments de réponse suggérés",
        "Identifier les 3 questions les plus risquées (plus difficiles à répondre)",
      ],
      variables: [
        { nom: "resume", description: "Résumé de la thèse (200-300 mots)", obligatoire: true },
        { nom: "resultats", description: "Résultats principaux et leur signification", obligatoire: true },
        { nom: "limites", description: "Limites déjà identifiées par le candidat", obligatoire: false },
      ],
      conseilExecution: "Mentionner les critiques probables de la littérature pour que l'IA puisse formuler des questions pointues sur les choix théoriques.",
    },
    {
      id: "th-avis-directeur",
      titre: "Simulation de retour de directeur de thèse",
      contexte: "Pour obtenir un feedback réaliste sur un texte de thèse simulé par un directeur expérimenté.",
      structure: [
        "Rôle : directeur de thèse exigeant mais bienveillant, 25 ans d'expérience, spécialiste de [discipline]",
        "Contexte : texte soumis, chapitre concerné, stade d'avancement de la thèse",
        "Consigne : lire le texte et fournir un retour structuré : 1) points positifs (ce qui fonctionne), 2) problèmes majeurs (structure, argumentation, logique), 3) problèmes mineurs (style, formulation, précision), 4) questions pour guider la révision, 5) prochaines étapes concrètes",
        "Ton : direct, académique, constructif — ni complaisant ni décourageant",
        "Vérifier : cohérence avec la problématique, progression argumentaire, qualité des preuves",
      ],
      variables: [
        { nom: "texte", description: "Le texte de thèse à examiner", obligatoire: true },
        { nom: "chapitre", description: "Quel chapitre / section", obligatoire: true },
        { nom: "stade", description: "Stade (exploratoire, intermédiaire, final)", obligatoire: false },
      ],
      conseilExecution: "Préciser les retours précédents du vrai directeur pour que l'IA puisse vérifier s'ils ont été pris en compte.",
    },
  ],
} as const;

// ═════════════════════════════════════════════════════════════════════════════════
// MODULE 3 — Anti-patterns de prompting
// ═════════════════════════════════════════════════════════════════════════════════

export const ANTIPATTERNS_PROMPTING: AntiPatternPrompt[] = [
  {
    id: "ap-prompt-vague",
    erreur: "Prompt vague et non contraignant (ex: \"Écris quelque chose sur…\")",
    consequence: "L'IA produit un texte générique, non adapté au contexte académique, et souvent trop long ou hors sujet.",
    correction: "Utiliser le modèle 5C : Contexte + Consigne + Critères + Contraintes + Compléments. Spécifier le rôle, la longueur, le ton, le format, et le public cible.",
    categorie: "vague",
  },
  {
    id: "ap-surcharge-instructions",
    erreur: "Prompt surchargé avec trop d'instructions simultanées",
    consequence: "L'IA se perd dans les exigences contradictoires et produit une réponse incohérente ou incomplète.",
    correction: "Découper en sous-prompts séquentiels. Un prompt = une tâche principale. Utiliser la démarche par étapes pour les tâches complexes.",
    categorie: "surcharge",
  },
  {
    id: "ap-absence-contexte",
    erreur: "Absence de contexte de recherche (discipline, stade, public)",
    consequence: "L'IA adopte un ton inapproprié (trop vulgarisateur ou trop jargonné) et des références hors domaine.",
    correction: "Toujours inclure : discipline, type de document (article, chapitre, rapport), stade d'avancement, et public cible (experts, étudiants, grand public).",
    categorie: "absence_contexte",
  },
  {
    id: "ap-role-generique",
    erreur: "Rôle générique ou absent (ex: \"Tu es un assistant IA\")",
    consequence: "La réponse manque de profondeur disciplinaire et d'autorité académique.",
    correction: "Assigner un rôle expert spécifique : \"Tu es un professeur en [discipline] spécialisé en [sous-domaine], avec 15 ans d'expérience de recherche et de supervision doctorale.\"",
    categorie: "mauvais_role",
  },
  {
    id: "ap-zero-contrainte",
    erreur: "Aucune contrainte de format, longueur ou style",
    consequence: "La réponse est trop longue, mal structurée, ou dans un registre inapproprié.",
    correction: "Spécifier toujours : nombre de mots (ou fourchette), format de sortie (paragraphes, liste, tableau), style (académique, formel, concis).",
    categorie: "absence_contraintes",
  },
  {
    id: "ap-iteration-unique",
    erreur: "Attente d'un résultat parfait en un seul prompt",
    consequence: "Frustration, sous-exploitation du potentiel de l'IA, résultat médiocre utilisé tel quel.",
    correction: "Planifier 2-3 itérations. Première itération = brouillon structuré. Itérations suivantes = raffinement ciblé (renforcer un argument, améliorer une transition, approfondir une section).",
    categorie: "iteration_unique",
  },
  {
    id: "ap-copier-coller",
    erreur: "Copier-coller direct du résultat IA sans révision critique",
    consequence: "Propagation d'erreurs factuelles, hallucinations bibliographiques, incohérences avec le reste du manuscrit.",
    correction: "Toujours vérifier : 1) l'exactitude des références citées, 2) la cohérence avec le cadre théorique, 3) l'absence d'hallucinations, 4) l'adéquation avec les sections adjacentes.",
    categorie: "vague",
  },
  {
    id: "ap-absence-exemples",
    erreur: "Ne fournir aucun exemple de sortie attendue",
    consequence: "L'IA ne comprend pas le niveau de détail, le ton, ou le format souhaité.",
    correction: "Fournir au moins un exemple de la sortie attendue (few-shot prompting), surtout pour les formats spécifiques (grille d'évaluation, plan structuré, reformulation).",
    categorie: "absence_contraintes",
  },
  {
    id: "ap-confondre-revue-catalogue",
    erreur: "Demander une \"revue de littérature\" sans préciser qu'on veut une synthèse critique et non un catalogue",
    consequence: "L'IA produit une succession de résumés d'articles au lieu d'une intégration thématique.",
    correction: "Préciser explicitement : \"Synthèse critique et intégrée, PAS un catalogue d'abstracts. Organise par thèmes, PAS par article. Compare les résultats entre études.\"",
    categorie: "vague",
  },
  {
    id: "ap-prompt-sans-lien-problematique",
    erreur: "Demander de rédiger une section sans la connecter à la problématique",
    consequence: "La section produite est déconnectée du fil conducteur de la thèse.",
    correction: "Toujours inclure : \"Cette section doit contribuer à répondre à [la question de recherche / l'hypothèse X] en montrant comment [contribution spécifique].\"",
    categorie: "absence_contexte",
  },
];

// ═════════════════════════════════════════════════════════════════════════════════
// MODULE 4 — Règles empiriques de rédaction d'articles de recherche
// (Synthèse des bonnes pratiques de la littérature sur la rédaction scientifique)
// ═════════════════════════════════════════════════════════════════════════════════

export const REGLES_EMPIRIQUES_REDACTION: RegleEmpirique[] = [
  // ── Problématique ──────────────────────────────────────────────────
  {
    id: "re-prob-funnel",
    domaine: "problematique",
    regle: "L'introduction suit une structure en entonnoir : contexte large - domaine spécifique - lacune - objectif - apport. Chaque paragraphe rétrécit le focus.",
    justification: "Cette structure permet au lecteur de suivre la logique de la recherche et de comprendre pourquoi l'étude est nécessaire. Les évaluateurs vérifient systématiquement cette progression.",
  },
  {
    id: "re-prob-une-question",
    domaine: "problematique",
    regle: "Une seule question de recherche principale par article. Les sous-questions sont tolérées mais doivent toutes se rattacher à la question principale.",
    justification: "Un article qui poursuit plusieurs objectifs principaux perd en focale et en cohérence. Les évaluateurs critiquent systématiquement les articles \"fourre-tout\".",
  },
  {
    id: "re-prob-lacune-explicite",
    domaine: "problematique",
    regle: "La lacune de recherche doit être formulée de manière explicite, pas seulement suggérée. Utiliser des marqueurs linguistiques : \"Cependant\", \"Toutefois\", \"Malgré ces avancées\".",
    justification: "Les évaluateurs doivent identifier clairement ce que l'article apporte de nouveau. Une lacune implicite est souvent interprétée comme une absence de contribution.",
  },

  // ── Méthodologie ───────────────────────────────────────────────────
  {
    id: "re-meth-reproductibilite",
    domaine: "methodologie",
    regle: "La section méthodologique doit permettre la reproduction de l'étude par un autre chercheur. Chaque décision méthodologique doit être justifiée.",
    justification: "La reproductibilité est le critère central de la scientificité. Les évaluateurs évaluent la méthodologie avant même de lire les résultats.",
  },
  {
    id: "re-meth-echantillon",
    domaine: "methodologie",
    regle: "Toujours justifier la taille de l'échantillon (power analysis pour les études quantitatives, saturation pour les études qualitatives).",
    justification: "Un échantillon non justifié est la critique méthodologique la plus fréquente dans les rapports d'évaluation.",
  },
  {
    id: "re-meth-triangulation",
    domaine: "methodologie",
    regle: "Quand c'est possible, trianguler les sources de données ou les méthodes d'analyse pour renforcer la validité des conclusions.",
    justification: "La triangulation est un critère de qualité reconnu dans les approches qualitatives et mixtes. Elle réduit le risque de biais unique.",
  },

  // ── Résultats ──────────────────────────────────────────────────────
  {
    id: "re-res-presente-pas-interprete",
    domaine: "resultats",
    regle: "Dans la section Résultats, présenter les données sans les interpréter. L'interprétation appartient à la Discussion.",
    justification: "Confondre résultats et interprétation est une erreur fréquente qui affaiblit la structure IMRaD et irrite les évaluateurs.",
  },
  {
    id: "re-res-tableaux-coherence",
    domaine: "resultats",
    regle: "Chaque tableau et figure doit être référencé dans le texte et pouvoir être compris sans lire le texte. Les données dans le texte ne doivent pas répéter celles des tableaux.",
    justification: "Un tableau/figure non référencé ou redondant avec le texte est un signe de mauvaise rédaction scientifique.",
  },
  {
    id: "re-res-resultats-negatifs",
    domaine: "resultats",
    regle: "Rapporter les résultats non significatifs avec la même rigueur que les résultats significatifs. Ne pas les cacher ni les minimiser.",
    justification: "Les résultats négatifs sont scientifiquement précieux. Leur omission constitue un biais de publication.",
  },

  // ── Discussion ─────────────────────────────────────────────────────
  {
    id: "re-dis-repond-intro",
    domaine: "discussion",
    regle: "La Discussion doit répondre explicitement à la question posée dans l'Introduction. C'est la boucle IMRaD : Intro - Méthodes - Résultats - Discussion (retour à l'Intro).",
    justification: "Une Discussion qui ne répond pas à l'Introduction est la critique la plus fréquente des évaluateurs. La cohérence argumentaire est le critère n°1.",
  },
  {
    id: "re-dis-limites-honnetes",
    domaine: "discussion",
    regle: "Présenter les limites de manière honnête et spécifique. Mieux vaut identifier soi-même ses limites que de laisser les évaluateurs le faire.",
    justification: "Les évaluateurs qui identifient des limites non mentionnées par l'auteur perçoivent un manque de rigueur. Les limites honnêtement discutées renforcent la crédibilité.",
  },
  {
    id: "re-dis-pas-resultats-nouveaux",
    domaine: "discussion",
    regle: "Ne jamais introduire de nouveaux résultats dans la Discussion. Les résultats rapportés doivent tous figurer dans la section Résultats.",
    justification: "Introduire des résultats nouveaux en Discussion est perçu comme une tentative de manipulation ou un manque de rigueur.",
  },

  // ── Rédaction ──────────────────────────────────────────────────────
  {
    id: "re-red-paragraphe-acm",
    domaine: "redaction",
    regle: "Un paragraphe = une idée principale. La première phrase est le topic sentence. Les phrases suivantes développent. La dernière phrase fait la transition ou conclut.",
    justification: "La structure paragraphe-acm est universelle dans la rédaction académique anglophone et francophone. Les évaluateurs lisent en diagonale et s'appuient sur les topic sentences.",
  },
  {
    id: "re-red-phrases-courtes",
    domaine: "redaction",
    regle: "Privilégier des phrases de 20-30 mots. Éviter les phrases de plus de 40 mots. Découper les phrases complexes en deux.",
    justification: "Les phrases longues diminuent la lisibilité et augmentent le risque d'ambiguïté. La clarté est la première qualité de la rédaction scientifique.",
  },
  {
    id: "re-red-voix-active",
    domaine: "redaction",
    regle: "Privilégier la voix active. Utiliser le \"nous\" de modestie pour les actions de recherche. Réserver la voix passive aux cas où l'agent est évident ou non pertinent.",
    justification: "La voix active est plus directe, plus claire et plus engageante. L'excès de voix passive alourdit le texte et masque la responsabilité de l'auteur.",
  },

  // ── Structure ──────────────────────────────────────────────────────
  {
    id: "re-str-titre-informatif",
    domaine: "structure",
    regle: "Le titre doit être informatif et concis (10-15 mots). Il doit contenir les éléments clés : sujet, méthode ou population. Éviter les formulations vagues.",
    justification: "Le titre est l'élément le plus lu d'un article (lu 500 fois plus que le texte complet). Un titre vague réduit la visibilité et la citabilité.",
  },
  {
    id: "re-str-resume-auto-suffisant",
    domaine: "structure",
    regle: "Le résumé doit être auto-suffisant : compréhensible sans lire l'article. Contenir les 4 éléments IMRaD en 150-250 mots.",
    justification: "Le résumé est le deuxième élément le plus lu. S'il ne permet pas de comprendre l'étude, le lecteur passe à un autre article.",
  },
  {
    id: "re-str-conclusion-pas-resume",
    domaine: "structure",
    regle: "La conclusion ne doit pas répéter le résumé ni les résultats. Elle apporte une valeur ajoutée : implications pratiques, contributions théoriques, perspectives de recherche.",
    justification: "Une conclusion qui se contente de répéter est perçue comme un remplissage. Les évaluateurs attendent une réflexion synthétique.",
  },

  // ── Soumission ─────────────────────────────────────────────────────
  {
    id: "re-sou-revue-adaptee",
    domaine: "submission",
    regle: "Choisir la revue en fonction de : 1) l'adéquation du scope, 2) le public cible, 3) le facteur d'impact, 4) les délais de traitement. Ne pas viser trop haut ni trop bas.",
    justification: "Soumettre à une revue inappropriée garantit un rejet rapide (desk reject) et retarde la publication de 6-12 mois.",
  },
  {
    id: "re-sou-reponse-evaluateurs",
    domaine: "submission",
    regle: "Répondre à TOUS les commentaires des évaluateurs, sans exception. Même les commentaires erronés méritent une réponse argumentée et respectueuse.",
    justification: "Ignorer un commentaire est perçu comme un manque de professionnalisme et réduit les chances d'acceptation après révision.",
  },
  {
    id: "re-sou-lettre-accompagnement",
    domaine: "submission",
    regle: "La lettre d'accompagnement (cover letter) doit : 1) présenter le manuscrit, 2) expliquer l'originalité, 3) justifier le choix de la revue, 4) déclarer les conflits d'intérêts.",
    justification: "La cover letter est le premier contact avec l'éditeur. Une lettre bien rédigée augmente les chances que le manuscrit passe l'étape du desk review.",
  },
];

// ═════════════════════════════════════════════════════════════════════════════════
// EXPORT AGRÉGÉ
// ═════════════════════════════════════════════════════════════════════════════════

export const PROMPTING_CORPUS = {
  principesPromptQualite: PRINCIPES_PROMPT_QUALITE,
  modelesPromptsRecherche: MODELES_PROMPTS_RECHERCHE,
  antipatternsPrompting: ANTIPATTERNS_PROMPTING,
  reglesEmpiriquesRedaction: REGLES_EMPIRIQUES_REDACTION,
} as const;

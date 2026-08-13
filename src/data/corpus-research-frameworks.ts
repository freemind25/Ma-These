// ═══════════════════════════════════════════════════════════════════
// ThesisFrame — Corpus de Cadres de Recherche
// Modules structurés extraits des infographies académiques RB et protocoles PRISMA/GRADE
// Reformulé en règles actionnables — aucune reproduction de texte protégé
// ═══════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────────────

/** Un type de lacune de recherche (taxonomie à 7 types, RB-3) */
interface TypeLacune {
  id: string;
  label: string;
  categorie: "épistémologique" | "procédurale" | "conceptuelle-contextuelle";
  definitionCourte: string;
  critereDiagnostic: string;
  questionGuide: string;
}

/** Un test statistique avec ses critères de sélection (RB-4) */
interface TestStatistique {
  id: string;
  label: string;
  typeDonnees: ("continue" | "catégorielle" | "ordinale")[];
  parametrique: boolean;
  quandUtiliser: string;
  groupeNombre: "0" | "2" | "2-apparié" | "3+";
  typeAnalyse: "description" | "comparaison" | "association" | "prédiction" | "réduction";
  alternativeNonParametrique?: string;
  conditionSpeciale?: string;
}

/** Un aspect de comparaison cadre théorique vs conceptuel (RB-5) */
interface AspectComparaisonCadre {
  aspect: string;
  theorique: string;
  conceptuel: string;
  cleDecision: string;
}

/** Une section de la structure du chapitre revue de littérature (RB-2) */
interface SectionRevueLitterature {
  numero: number;
  label: string;
  fonction: string;
  elementsCles: string[];
  inviteGeneration: string;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 1 — Taxonomie des 7 lacunes de recherche (RB-3)
// ═══════════════════════════════════════════════════════════════════

export const TYPES_LACUNES: TypeLacune[] = [
  {
    id: "evidence",
    label: "Lacune de preuve",
    categorie: "épistémologique",
    definitionCourte: "Résultats incohérents ou contradictoires entre études comparables",
    critereDiagnostic: "Vérifier la cohérence des conclusions sur un même objet d'au moins 3 études",
    questionGuide: "Quelles contradictions majeures existent entre les résultats disponibles ?",
  },
  {
    id: "knowledge",
    label: "Lacune de connaissance",
    categorie: "épistémologique",
    definitionCourte: "Absence totale de recherche ou de preuve sur un aspect du sujet",
    critereDiagnostic: "Analyser la couverture documentaire pour détecter les zones blanches",
    questionGuide: "Quels aspects du sujet n'ont fait l'objet d'aucune étude ?",
  },
  {
    id: "practice",
    label: "Lacune pratique-connaissance",
    categorie: "épistémologique",
    definitionCourte: "Écart entre les recommandations de la recherche et les pratiques réelles",
    critereDiagnostic: "Confronter recommandations théoriques et pratiques observées sur le terrain",
    questionGuide: "Quelles recommandations de la recherche ne sont pas appliquées, et pourquoi ?",
  },
  {
    id: "methodological",
    label: "Lacune méthodologique",
    categorie: "procédurale",
    definitionCourte: "Les méthodes existantes sont insuffisantes ou biaisées pour le problème étudié",
    critereDiagnostic: "Évaluer la rigueur méthodologique récurrente des études du domaine",
    questionGuide: "Quelles limites méthodologiques fragilisent les conclusions actuelles ?",
  },
  {
    id: "empirical",
    label: "Lacune empirique",
    definitionCourte: "Résultats existants nécessitant une validation empirique complémentaire",
    categorie: "procédurale",
    critereDiagnostic: "Vérifier si les résultats ont été répliqués dans des contextes différents",
    questionGuide: "Quels résultats n'ont pas encore été répliqués ou validés ?",
  },
  {
    id: "theoretical",
    label: "Lacune théorique",
    categorie: "conceptuelle-contextuelle",
    definitionCourte: "Absence de cadre théorique adapté au problème de recherche",
    critereDiagnostic: "Vérifier si le problème dispose d'un ancrage théorique explicite",
    questionGuide: "Quelle théorie existante pourrait éclairer ce problème mais n'est pas mobilisée ?",
  },
  {
    id: "population",
    label: "Lacune populationnelle",
    categorie: "conceptuelle-contextuelle",
    definitionCourte: "Populations ou contextes sous-représentés dans la littérature",
    critereDiagnostic: "Analyser la représentativité démographique et géographique des échantillons",
    questionGuide: "Quelles populations ou régions sont absentes de la littérature ?",
  },
];

/** Règles d'identification systématique par type de lacune */
export const REGLES_IDENTIFICATION_LACUNES: {
  lacune: string;
  regle: string;
}[] = [
  { lacune: "evidence", regle: "Comparer les conclusions d'au moins 3 études sur le même objet — signaler toute inversion de résultat ou divergence non expliquée" },
  { lacune: "knowledge", regle: "Cartographier les sous-thèmes du domaine et identifier les zones sans publication identifiée" },
  { lacune: "practice", regle: "Confronter explicitement les recommandations des auteurs aux pratiques décrites dans les études de terrain" },
  { lacune: "methodological", regle: "Auditer les designs, tailles d'échantillon et méthodes d'analyse des études principales du domaine" },
  { lacune: "empirical", regle: "Vérifier si les résultats clés ont été reproduits dans au moins un autre contexte ou par une autre équipe" },
  { lacune: "theoretical", regle: "Lister les théories disponibles dans le champ et vérifier laquelle n'a pas été appliquée au problème" },
  { lacune: "population", regle: "Recenser les populations/contexts étudiés et identifier les silences démographiques ou géographiques" },
];

/** Modèles de formulation de lacunes pour énoncés de problème */
export const MODELES_FORMULATION_LACUNES: {
  type: string;
  modele: string;
}[] = [
  { type: "evidence", modele: "Malgré des études antérieures sur [sujet], les résultats restent contradictoires quant à [variable/aspect], ce qui rend nécessaire une investigation approfondie de [facteur explicatif]." },
  { type: "knowledge", modele: "À ce jour, aucun travail n'a examiné [aspect/variable] dans le contexte de [population/terrain], laissant un vide documentaire sur [dimension précise]." },
  { type: "practice", modele: "Bien que la littérature recommande [action/approche], les pratiques observées dans [secteur/terrain] divergent significativement, suggérant un écart entre savoir académique et application réelle." },
  { type: "methodological", modele: "Les études existantes sur [sujet] présentent des limites méthodologiques récurrentes (taille d'échantillon, biais de sélection, absence de groupe contrôle), ce qui appelle un design [qualitatif/quantitatif/mixte] plus rigoureux." },
  { type: "empirical", modele: "Les conclusions de [Auteur, Année] concernant [relation/effet] n'ont pas encore été validées empiriquement dans [contexte/population], ce qui limite la généralisabilité des résultats." },
  { type: "theoretical", modele: "Le champ de [domaine] dispose de cadres théoriques établis (ex. [théorie 1], [théorie 2]) mais aucun n'a été mobilisé pour expliquer [phénomène étudié]." },
  { type: "population", modele: "La littérature sur [sujet] se concentre principalement sur [population dominante], alors que [population cible] reste largement sous-étudiée malgré [raison de pertinence]." },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 2 — Cadre théorique vs conceptuel (RB-5)
// ═══════════════════════════════════════════════════════════════════

export const COMPARAISON_CADRES: AspectComparaisonCadre[] = [
  {
    aspect: "Définition",
    theorique: "Ensemble large de principes offrant une perspective générale sur un domaine",
    conceptuel: "Concepts spécifiques appliqués directement au contexte de l'étude",
    cleDecision: "Si l'objectif est de situer la recherche dans un champ établi → théorique ; si l'objectif est de définir les variables étudiées → conceptuel",
  },
  {
    aspect: "Fondement",
    theorique: "Théories existantes validées par la communauté académique",
    conceptuel: "Concepts clés représentant les variables et leurs relations dans l'étude",
    cleDecision: "Si on mobilise des théories préexistantes citées → théorique ; si on construit un modèle de variables → conceptuel",
  },
  {
    aspect: "Nature",
    theorique: "Modèle guidant l'étude, ses hypothèses et l'interprétation des résultats",
    conceptuel: "Modèle développé par le chercheur pour expliquer les interactions entre concepts",
    cleDecision: "Si le modèle est déductif (test d'hypothèses) → théorique ; si le modèle est inductif/construit → conceptuel",
  },
  {
    aspect: "Développement",
    theorique: "Établi, reconnu et accepté dans la communauté académique",
    conceptuel: "Développé spécifiquement pour l'étude par le chercheur",
    cleDecision: "Si le cadre existe dans la littérature avant l'étude → théorique ; s'il est créé pour l'étude → conceptuel",
  },
  {
    aspect: "Finalité",
    theorique: "Positionner la recherche dans le corps de connaissances existant",
    conceptuel: "Montrer la logique d'enquête et comment les concepts seront examinés",
    cleDecision: "Si le but est le positionnement épistémologique → théorique ; si le but est l'articulation opérationnelle → conceptuel",
  },
  {
    aspect: "Composantes",
    theorique: "Théories, construits et propositions dérivés de la recherche antérieure",
    conceptuel: "Concepts centraux et leurs connexions illustrant les relations étudiées",
    cleDecision: "Si les éléments sont des théories/construits abstraits → théorique ; si ce sont des variables opérationnalisées → conceptuel",
  },
  {
    aspect: "Usage",
    theorique: "Tester des théories, formuler des prédictions, situer la recherche globalement",
    conceptuel: "Construire ou affiner une théorie, fournir des insights pratiques au contexte étudié",
    cleDecision: "Si la démarche vise la validation → théorique ; si elle vise la construction/exploration → conceptuel",
  },
];

/** Règles de sélection automatique du type de cadre */
export const REGLES_SELECTION_CADRE: {
  condition: string;
  cadre: "théorique" | "conceptuel";
  justification: string;
}[] = [
  { condition: "Domaine de recherche mature avec théories bien établies", cadre: "théorique", justification: "Un champ bien balisé permet un ancrage théorique solide et reconnu" },
  { condition: "Domaine exploratoire ou émergent sans théorie dominante", cadre: "conceptuel", justification: "L'absence de cadre établi rend nécessaire la construction d'un modèle spécifique" },
  { condition: "Démarche déductive (test d'hypothèses contre une vérité établie)", cadre: "théorique", justification: "Le raisonnement déductif s'appuie sur des théories existantes à valider" },
  { condition: "Démarche inductive (construction de modèle à partir d'observations)", cadre: "conceptuel", justification: "Le raisonnement inductif construit un cadre à partir des données terrain" },
  { condition: "Besoin de positionnement épistémologique global", cadre: "théorique", justification: "Le cadre théorique situe la recherche dans le champ disciplinaire" },
  { condition: "Besoin de définir des variables et leurs relations opérationnelles", cadre: "conceptuel", justification: "Le cadre conceptuel opérationnalise les variables de l'étude" },
];

/** Critères de validation d'un cadre (utilisé dans le mode hypothèse) */
export const CRITERES_VALIDATION_CADRE = [
  "Le cadre est-il cohérent avec la question de recherche ?",
  "Chaque concept clé dispose-t-il d'une définition opérationnelle claire ?",
  "Les relations entre concepts sont-elles explicitement formulées (causalité, corrélation, médiation) ?",
  "Le cadre permet-il de dériver des hypothèses testables ?",
  "Le cadre est-il ancré dans des références académiques (théorique) ou justifié par le terrain (conceptuel) ?",
  "Le diagramme du cadre (le cas échéant) reflète-t-il fidèlement le texte descriptif ?",
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 3 — Arbres de décision pour tests statistiques (RB-4)
// ═══════════════════════════════════════════════════════════════════

export const TESTS_STATISTIQUES: TestStatistique[] = [
  {
    id: "descriptive",
    label: "Statistiques descriptives",
    typeDonnees: ["continue", "catégorielle", "ordinale"],
    parametrique: true,
    quandUtiliser: "Résumer les caractéristiques d'un jeu de données (tendance centrale, dispersion)",
    groupeNombre: "0",
    typeAnalyse: "description",
  },
  {
    id: "z-test",
    label: "Test Z",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Grand échantillon (n > 30) avec variance populationnelle connue, comparaison à une moyenne de référence",
    groupeNombre: "2",
    typeAnalyse: "comparaison",
    conditionSpeciale: "n > 30 et variance σ connue",
  },
  {
    id: "student-t",
    label: "Test t de Student",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Petit échantillon (n < 30), variance populationnelle inconnue, comparaison de deux moyennes indépendantes",
    groupeNombre: "2",
    typeAnalyse: "comparaison",
    alternativeNonParametrique: "mann-whitney",
  },
  {
    id: "paired-t",
    label: "Test t apparié",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Mesures répétées sur les mêmes sujets (avant/après, pré/post)",
    groupeNombre: "2-apparié",
    typeAnalyse: "comparaison",
    alternativeNonParametrique: "wilcoxon",
  },
  {
    id: "welch-t",
    label: "Test t de Welch",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Variances inégales et/ou tailles d'échantillon différentes entre groupes",
    groupeNombre: "2",
    typeAnalyse: "comparaison",
    conditionSpeciale: "Différence de taille > 20 % entre groupes → préférer Welch au Student classique",
  },
  {
    id: "chi-squared",
    label: "Test du Chi-carré",
    typeDonnees: ["catégorielle"],
    parametrique: false,
    quandUtiliser: "Tester l'association entre deux variables catégorielles",
    groupeNombre: "0",
    typeAnalyse: "association",
    conditionSpeciale: "Effectifs théoriques ≥ 5 dans chaque cellule",
  },
  {
    id: "fisher-exact",
    label: "Test exact de Fisher",
    typeDonnees: ["catégorielle"],
    parametrique: false,
    quandUtiliser: "Petits échantillons, tableaux de contingence 2×2, effectifs faibles",
    groupeNombre: "0",
    typeAnalyse: "association",
    conditionSpeciale: "n < 20 en tableau de contingence → Fisher plutôt que Chi-carré",
  },
  {
    id: "mann-whitney",
    label: "Test de Mann-Whitney",
    typeDonnees: ["ordinale", "continue"],
    parametrique: false,
    quandUtiliser: "Alternative non paramétrique au test t pour comparer deux groupes indépendants",
    groupeNombre: "2",
    typeAnalyse: "comparaison",
  },
  {
    id: "anova",
    label: "ANOVA",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Comparer les moyennes de trois groupes ou plus",
    groupeNombre: "3+",
    typeAnalyse: "comparaison",
    alternativeNonParametrique: "kruskal-wallis",
  },
  {
    id: "kruskal-wallis",
    label: "Test de Kruskal-Wallis",
    typeDonnees: ["ordinale", "continue"],
    parametrique: false,
    quandUtiliser: "Alternative non paramétrique à l'ANOVA pour 3+ groupes indépendants",
    groupeNombre: "3+",
    typeAnalyse: "comparaison",
  },
  {
    id: "pearson",
    label: "Corrélation de Pearson",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Mesurer la force et la direction d'une relation linéaire entre deux variables continues",
    groupeNombre: "0",
    typeAnalyse: "association",
    alternativeNonParametrique: "spearman",
  },
  {
    id: "spearman",
    label: "Corrélation de Spearman",
    typeDonnees: ["ordinale"],
    parametrique: false,
    quandUtiliser: "Mesurer la force d'une relation monotone entre variables ordinales ou non normales",
    groupeNombre: "0",
    typeAnalyse: "association",
  },
  {
    id: "regression-lineaire",
    label: "Régression linéaire simple",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Modéliser la relation linéaire entre une variable dépendante et une variable indépendante",
    groupeNombre: "0",
    typeAnalyse: "prédiction",
  },
  {
    id: "regression-multiple",
    label: "Régression multiple",
    typeDonnees: ["continue"],
    parametrique: true,
    quandUtiliser: "Prédire une variable dépendante continue à partir de plusieurs prédicteurs",
    groupeNombre: "0",
    typeAnalyse: "prédiction",
  },
  {
    id: "regression-logistique",
    label: "Régression logistique",
    typeDonnees: ["continue", "catégorielle"],
    parametrique: true,
    quandUtiliser: "Prédire la probabilité d'un résultat binaire (oui/non) à partir de prédicteurs",
    groupeNombre: "0",
    typeAnalyse: "prédiction",
  },
  {
    id: "analyse-factorielle",
    label: "Analyse factorielle",
    typeDonnees: ["continue", "ordinale"],
    parametrique: true,
    quandUtiliser: "Réduire un grand nombre de variables à un ensemble plus restreint de facteurs latents",
    groupeNombre: "0",
    typeAnalyse: "réduction",
  },
];

/** Arbre de décision pour sélectionner un test statistique */
export const ARBRE_DECISION_STATISTIQUE = {
  etape1_typeQuestion: [
    { question: "Différence entre groupes ?", destination: "etape2_groupes" as const },
    { question: "Association entre variables ?", destination: "etape3_typeDonnees" as const },
    { question: "Prédiction d'une variable ?", destination: "etape4_regression" as const },
    { question: "Réduction dimensionnelle ?", destination: "etape5_reduction" as const },
  ],
  etape2_groupes: [
    { condition: "2 groupes indépendants, données continues, normalité respectée", test: "student-t" },
    { condition: "2 groupes indépendants, normalité NON respectée ou données ordinales", test: "mann-whitney" },
    { condition: "2 groupes appariés (mesures répétées), normalité respectée", test: "paired-t" },
    { condition: "2 groupes appariés, normalité NON respectée", test: "wilcoxon" },
    { condition: "2 groupes, variances inégales ou tailles très différentes", test: "welch-t" },
    { condition: "3+ groupes, données continues, normalité respectée", test: "anova" },
    { condition: "3+ groupes, données ordinales ou normalité NON respectée", test: "kruskal-wallis" },
    { condition: "2 variables catégorielles", test: "chi-squared" },
    { condition: "2 variables catégorielles, petits effectifs (n < 20)", test: "fisher-exact" },
  ],
  etape3_typeDonnees: [
    { condition: "Deux variables continues, relation linéaire, normalité", test: "pearson" },
    { condition: "Variables ordinales ou normalité non respectée", test: "spearman" },
  ],
  etape4_regression: [
    { condition: "Variable dépendante continue, 1 prédicteur", test: "regression-lineaire" },
    { condition: "Variable dépendante continue, plusieurs prédicteurs", test: "regression-multiple" },
    { condition: "Variable dépendante binaire", test: "regression-logistique" },
  ],
  etape5_reduction: [
    { condition: "Réduire de nombreuses variables à quelques facteurs latents", test: "analyse-factorielle" },
  ],
} as const;

/** Règles de vérification pré-analyse */
export const REGLES_PRE_ANALYSE = [
  "Toujours vérifier la normalité des données avant de choisir un test paramétrique",
  "Si n > 30 et σ connu → Test Z ; si n < 30 et σ inconnu → Test t",
  "Si les tailles de groupe diffèrent de plus de 20 %, utiliser le test de Welch plutôt que le Student classique",
  "Pour les tableaux de contingence avec effectifs théoriques < 5, préférer le test exact de Fisher",
  "Spécifier explicitement si les groupes sont indépendants ou appariés avant de choisir le test",
  "Variable dépendante continue → régression linéaire ; variable dépendante binaire → régression logistique",
  "Construits latents non observables → analyse factorielle pour réduction dimensionnelle",
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 4 — Structure du chapitre revue de littérature (RB-2)
// ═══════════════════════════════════════════════════════════════════

export const SECTIONS_REVUE_LITTERATURE: SectionRevueLitterature[] = [
  {
    numero: 1,
    label: "Introduction",
    fonction: "Rappeler la problématique, les objectifs et annoncer le plan du chapitre",
    elementsCles: ["Reformulation du problème de recherche", "Objectifs du chapitre", "Annonce de la structure (les 5 sections suivantes)"],
    inviteGeneration: "Rédige l'introduction du chapitre de revue de littérature sur [sujet]. Rappelle la problématique, énonce les objectifs de la revue et annonce le plan en 6 sections.",
  },
  {
    numero: 2,
    label: "Cadre théorique",
    fonction: "Présenter et justifier les théories mobilisées pour encadrer la recherche",
    elementsCles: ["Théories principales (noms, auteurs, postulats)", "Justification du choix de chaque théorie", "Lien avec le problème de recherche"],
    inviteGeneration: "Rédige la section du cadre théorique en mobilisant [théorie(s)]. Justifie pourquoi ce(s) cadre(s) est/sont adapté(s) pour expliquer [phénomène].",
  },
  {
    numero: 3,
    label: "Cadre conceptuel",
    fonction: "Définir les concepts clés et leurs relations, souvent illustré par un diagramme",
    elementsCles: ["Définitions opérationnelles des concepts", "Relations entre concepts (causalité, corrélation, médiation)", "Diagramme conceptuel"],
    inviteGeneration: "Construis le cadre conceptuel en définissant les concepts clés ([liste]) et leurs relations. Inclus une description textuelle du diagramme conceptuel.",
  },
  {
    numero: 4,
    label: "Revue de la littérature connexe",
    fonction: "Organiser les études antérieures selon une logique structurée et les analyser de manière critique",
    elementsCles: ["Sous-sections thématiques, chronologiques ou méthodologiques", "Études empiriques locales et internationales", "Tendances actuelles et débats", "Insights méthodologiques"],
    inviteGeneration: "Produis une revue structurée sur [sujet] en organisant les études selon une logique [thématique/chronologique/méthodologique]. Crée des sous-sections pour [thèmes].",
  },
  {
    numero: 5,
    label: "Revue critique et synthèse",
    fonction: "Comparer, confronter et évaluer les études ; identifier les forces, faiblesses et lacunes",
    elementsCles: ["Comparaison et contraste des résultats", "Identification des contradictions", "Évaluation des forces et faiblesses méthodologiques", "Positionnement de l'étude par rapport aux lacunes"],
    inviteGeneration: "Rédige une synthèse critique en comparant les forces et faiblesses des études. Identifie les contradictions concernant [variable] et explique comment cette étude se positionne.",
  },
  {
    numero: 6,
    label: "Résumé de la revue de littérature",
    fonction: "Consolider les enseignements clés, mettre en évidence la lacune et préparer la transition vers la méthodologie",
    elementsCles: ["Synthèse des principaux enseignements", "Mise en évidence de la lacune de recherche", "Transition vers le chapitre méthodologique"],
    inviteGeneration: "Rédige le résumé conclusif en consolidant les enseignements clés, en soulignant la lacune identifiée et en expliquant comment celle-ci dicte les choix méthodologiques du chapitre suivant.",
  },
];

/** Les trois logiques d'organisation pour la Section 4 */
export const LOGIQUES_ORGANISATION_SECTION4 = [
  {
    id: "thematique",
    label: "Thématique",
    description: "Regroupement par sujet ou thème de recherche",
    quandUtiliser: "Lorsque le champ est riche et diversifié avec plusieurs dimensions clés",
  },
  {
    id: "chronologique",
    label: "Chronologique",
    description: "Classement par date de publication pour montrer l'évolution",
    quandUtiliser: "Lorsqu'il faut retracer l'évolution historique d'un concept ou d'un débat",
  },
  {
    id: "methodologique",
    label: "Méthodologique",
    description: "Regroupement par type d'approche (qualitative vs quantitative)",
    quandUtiliser: "Lorsque les approches méthodologiques constituent un enjeu central du champ",
  },
];

/** Critères qualité d'une revue de littérature */
export const CRITERES_QUALITE_REVUE = [
  "Distinction claire entre revue descriptive (listing) et synthèse critique (évaluation)",
  "Identification explicite d'au moins une lacune de recherche (voir taxonomie des 7 lacunes)",
  "Présence de comparaisons et contrastes entre études (pas un simple catalogue)",
  "Transition logique vers le chapitre méthodologique",
  "Pondération des conclusions par la qualité méthodologique des études citées",
  "Absence d'affirmations non étayées par des références",
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 5 — Protocoles PRISMA/GRADE et grilles d'appréciation (SKILL.md)
// ═══════════════════════════════════════════════════════════════════

/** Types de revues avec niveau d'exigence associé */
export const TYPES_REVUE = [
  { id: "systematique", label: "Revue systématique", protocole: "PRISMA 2020", exigence: "maximale" as const },
  { id: "scoping", label: "Revue scoping", protocole: "PRISMA-ScR", exigence: "élevée" as const },
  { id: "narrative", label: "Revue narrative structurée", protocole: "SANRA", exigence: "modérée" as const },
  { id: "integrative", label: "Revue intégrative", protocole: "Sans protocole standardisé", exigence: "modérée" as const },
];

/** Les 12 protocoles d'analyse documentaire */
export const PROTOCOLES_ANALYSE = [
  { id: "P01", label: "Tableau structurant + clusters", description: "Base de structuration du corpus en thématiques" },
  { id: "P02", label: "Détecteur de contradictions", description: "Identification des divergences entre études" },
  { id: "P03", label: "Chaîne de citations (historiographie)", description: "Traçage de l'évolution des concepts à travers les citations" },
  { id: "P04", label: "Scanner de lacunes", description: "Identification systématique des lacunes (7 types)" },
  { id: "P05", label: "Audit méthodologique", description: "Typologie, échantillon et limites de chaque étude" },
  { id: "P05bis", label: "Grille d'appréciation critique", description: "Évaluation de la qualité par design (CASP, MMAT, RoB2 adaptés)" },
  { id: "P06", label: "Synthèse maîtresse", description: "Synthèse pondérée par la qualité des preuves (400 mots)" },
  { id: "P07", label: "Tueur d'hypothèses tacites", description: "Détection des postulats non explicités" },
  { id: "P08", label: "Carte de connaissances", description: "Visualisation des piliers de soutien pondérés" },
  { id: "P09", label: "Test 'Et alors ?'", description: "Évaluation de la pertinence et de l'impact" },
  { id: "P09bis", label: "Certitude des preuves (GRADE)", description: "Attribution d'un niveau de certitude par affirmation clé" },
  { id: "P10", label: "Limites et réflexivité", description: "Limites du corpus, de la méthode et déclaration IA" },
];

/** Niveaux de certitude des preuves (approche GRADE) */
export const NIVEAUX_CERTITUDE_PREUVES = [
  { niveau: "Élevée", description: "Preuves solides issues d'études de haute qualité, résultats convergents" },
  { niveau: "Modérée", description: "Preuves acceptables mais avec quelques réserves méthodologiques" },
  { niveau: "Faible", description: "Preuves limitées, résultats fragiles ou issus d'une seule étude" },
  { niveau: "Très faible", description: "Preuves très insuffisantes, conclusions hautement spéculatives" },
];

/** Règle de dégradation de la certitude */
export const REGLE_DEGRADATION_CERTITUDE = [
  "Risque de biais sérieux dominant → descendre d'un niveau",
  "Forte hétérogénéité non expliquée entre études → descendre d'un niveau",
  "Une seule étude porte l'affirmation → certitude maximale 'Faible'",
  "La convergence d'études biaisées de la même manière ne constitue PAS une preuve solide",
];

/** Niveaux de risque de biais pour l'appréciation critique */
export const NIVEAUX_RISQUE_BIAIS = [
  { niveau: "Faible", signification: "Peu de préoccupations identifiées ; conclusions globalement fiables" },
  { niveau: "Modéré", signification: "Quelques préoccupations ; conclusions à interpréter avec prudence" },
  { niveau: "Sérieux", signification: "Préoccupations multiples ou majeures ; conclusions fragiles" },
  { niveau: "Critique", signification: "Failles méthodologiques compromettant la validité des conclusions" },
  { niveau: "Non évaluable", signification: "Informations insuffisantes — signaler comme limite, jamais combler par supposition" },
];

/** Dimensions d'évaluation par type de design (grilles type CASP/MMAT, reformulées) */
export const DIMENSIONS_APPRECIATION_PAR_DESIGN = [
  {
    typeDesign: "quantitatif-experimental",
    dimensions: [
      "La méthode d'allocation des groupes évite-t-elle un biais de sélection ?",
      "L'échantillon est-il suffisamment grand et bien décrit ?",
      "Les mesures de résultat sont-elles cohérentes entre groupes ?",
      "Les analyses statistiques sont-elles adaptées au design et transparentes ?",
      "Les pertes de suivi sont-elles documentées et leur impact discuté ?",
    ],
  },
  {
    typeDesign: "observationnel",
    dimensions: [
      "La sélection des participants introduit-elle un biais identifiable ?",
      "Les facteurs de confusion principaux sont-ils mesurés et contrôlés ?",
      "La mesure de l'exposition et du résultat est-elle fiable et comparable ?",
      "La durée de suivi est-elle suffisante pour observer l'effet étudié ?",
    ],
  },
  {
    typeDesign: "qualitatif",
    dimensions: [
      "Le cadre conceptuel est-il cohérent avec la méthode de collecte ?",
      "L'échantillonnage est-il justifié (saturation, diversité) ?",
      "Le processus d'analyse est-il suffisamment transparent pour être audité ?",
      "Les auteurs font-ils preuve de réflexivité sur leur position ?",
    ],
  },
  {
    typeDesign: "revue-meta-analyse",
    dimensions: [
      "La stratégie de recherche est-elle reproductible ?",
      "Les critères d'inclusion/exclusion sont-ils explicites et appliqués de façon cohérente ?",
      "Le biais de publication est-il discuté ?",
      "L'hétérogénéité entre études est-elle évaluée et expliquée ?",
    ],
  },
];

/** Éléments du cadrage protocolaire (Phase 0 PRISMA) */
export const CADRAGE_PROTOCOLAIRE = [
  { element: "Type de revue", options: "Systématique / Scoping / Narrative / Intégrative" },
  { element: "Question de recherche", format: "PICO ou PICO(S) : Population, Intervention, Comparateur, Outcome, Setting" },
  { element: "Critères d'inclusion/exclusion", precision: "Période, langue, type de document, méthodologie minimale" },
  { element: "Stratégie de recherche", precision: "Bases de données, équations, date de recherche" },
];

// ═══════════════════════════════════════════════════════════════════
// EXPORT PRINCIPAL — Regroupement en objet unique
// ═══════════════════════════════════════════════════════════════════

export const RESEARCH_FRAMEWORKS = {
  /** Taxonomie des 7 lacunes de recherche (RB-3) */
  lacunesDeRecherche: {
    taxonomie: TYPES_LACUNES,
    reglesIdentification: REGLES_IDENTIFICATION_LACUNES,
    modelesFormulation: MODELES_FORMULATION_LACUNES,
  },

  /** Cadre théorique vs conceptuel (RB-5) */
  cadres: {
    comparaison: COMPARAISON_CADRES,
    reglesSelection: REGLES_SELECTION_CADRE,
    criteresValidation: CRITERES_VALIDATION_CADRE,
  },

  /** Tests statistiques (RB-4) */
  testsStatistiques: {
    tests: TESTS_STATISTIQUES,
    arbreDecision: ARBRE_DECISION_STATISTIQUE,
    reglesPreAnalyse: REGLES_PRE_ANALYSE,
  },

  /** Structure de la revue de littérature (RB-2) */
  revueLitterature: {
    sections: SECTIONS_REVUE_LITTERATURE,
    logiquesOrganisation: LOGIQUES_ORGANISATION_SECTION4,
    criteresQualite: CRITERES_QUALITE_REVUE,
  },

  /** Protocoles PRISMA/GRADE et grilles d'appréciation */
  evaluationQualite: {
    typesRevue: TYPES_REVUE,
    protocoles: PROTOCOLES_ANALYSE,
    niveauxCertitude: NIVEAUX_CERTITUDE_PREUVES,
    regleDegradation: REGLE_DEGRADATION_CERTITUDE,
    niveauxRisqueBiais: NIVEAUX_RISQUE_BIAIS,
    dimensionsParDesign: DIMENSIONS_APPRECIATION_PAR_DESIGN,
    cadrageProtocolaire: CADRAGE_PROTOCOLAIRE,
  },
} as const;

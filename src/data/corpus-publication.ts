// ═══════════════════════════════════════════════════════════════════
// ThesisFrame — Corpus Publication & Relecture par les pairs
// Base de connaissances structurée issue de :
//   - Belcher, W.L. "Writing Your Journal Article in Twelve Weeks"
//   - Pyrczak, F. "Evaluating Research in Academic Journals"
//   - Epstein, D., Kenway, J., Boden, R. "Writing for Publication"
//   - RMIT "Research and Writing Skills"
//   - Roda, J., Saunders, D., Anderson, K. "PhDone"
//   - Sonneveld, H. "The Art of Writing a PhD Proposal"
//   - Holtom, D., Fisher, E. "Enjoy Writing Your Science Thesis"
//   - Graustein, A. "How to Write an Exceptional Thesis"
// Reformulé en règles actionnables — aucune reproduction de texte protégé
// ═══════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────────────

/** Étape hebdomadaire du programme de Belcher */
interface EtapeHebdomadaire {
  semaine: number;
  titre: string;
  objectif: string;
  livrables: string[];
  pieges: string[];
}

/** Critère de qualité pour la publication (Belcher) */
interface CritereQualitePublication {
  id: string;
  domaine: string;
  critere: string;
  indicateur: string;
}

/** Question d'évaluation critique (Pyrczak) */
interface QuestionEvaluation {
  id: string;
  categorie: string;
  question: string;
  ceChercher: string;
}

/** Niveau de qualité d'une recherche (Pyrczak) */
interface NiveauQualite {
  niveau: string;
  description: string;
  signesDistinctifs: string[];
}

/** Règle d'édition professionnelle (PhDone) */
interface RegleEdition {
  id: string;
  categorie: string;
  regle: string;
  exempleAvant: string;
  exempleApres: string;
}

/** Étape de la proposition de thèse (Sonneveld) */
interface EtapeProposition {
  id: string;
  section: string;
  objectif: string;
  elementsAttendus: string[];
  erreursFrequentes: string[];
}

/** Critère d'acceptation d'une proposition (Sonneveld) */
interface CritereAcceptation {
  id: string;
  critere: string;
  poids: "éliminatoire"|"majeur"|"mineur";
  description: string;
}

/** Stratégie de motivation pour la rédaction (Holtom & Fisher) */
interface StrategieMotivation {
  id: string;
  phase: string;
  strategie: string;
  miseEnPratique: string;
}

/** Étape du guide complet de thèse (Graustein) */
interface EtapeThese {
  id: string;
  phase: string;
  titre: string;
  objectif: string;
  produitsLivables: string[];
  delaiEstime: string;
}

/** Critère d'excellence d'une thèse (Graustein) */
interface CritereExcellence {
  id: string;
  domaine: string;
  critere: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 1 — Programme de publication en 12 semaines (Belcher)
// Stratégie hebdomadaire pour transformer un manuscrit en article publiable
// ═══════════════════════════════════════════════════════════════════

export const SEMAINES_PROGRAMME_PUBLICATION: EtapeHebdomadaire[] = [
  {
    semaine: 1,
    titre: "Direction de l'article",
    objectif: "Choisir une revue cible et analyser ses exigences",
    livrables: [
      "Identification de 3 revues cibles classées par ordre de préférence",
      "Analyse des guidelines de la revue prioritaire",
      "Cartographie des exigences de format et de structure",
    ],
    pieges: [
      "Viser trop haut sans évaluer la faisabilité (journal factor d'impact disproportionné au stade du chercheur)",
      "Ignorer les normes spécifiques de la revue (longueur, sections, style bibliographique)",
      "Choisir une revue sans lire ses derniers numéros pour comprendre le profil éditorial",
    ],
  },
  {
    semaine: 2,
    titre: "Résumé structuré",
    objectif: "Rédiger un résumé qui guide toute la structure de l'article",
    livrables: [
      "Résumé de 150-250 mots respectant la structure de la revue",
      "Mots-clés (5-7 termes)",
      "Vérification de la concordance résumé/conclusion du manuscrit",
    ],
    pieges: [
      "Rédiger le résumé en dernier (Belcher recommande de le faire en premier comme plan)",
      "Inclure des références ou des résultats non présents dans le corps du texte",
      "Dépasser la limite de mots de la revue cible",
    ],
  },
  {
    semaine: 3,
    titre: "Accroche et littérature",
    objectif: "Structurer l'introduction avec une progression logique",
    livrables: [
      "Paragraphe d'accroche (contexte large)",
      "Cadrage vers la problématique spécifique",
      "Revue ciblée de la littérature (seulement ce qui est pertinent)",
      "Énoncé de la question de recherche ou de l'objectif",
    ],
    pieges: [
      "Faire une revue encyclopédique au lieu d'une revue argumentative",
      "Oublier de signaler la lacune de recherche que l'article comble",
      "Entamer la rédaction sans avoir lu les travaux fondateurs du domaine",
    ],
  },
  {
    semaine: 4,
    titre: "Argumentation et cadre",
    objectif: "Finaliser l'introduction avec la justification méthodologique",
    livrables: [
      "Justification de l'approche retenue par rapport aux alternatives",
      "Positionnement clair de la contribution",
      "Transition vers la section méthodes",
    ],
    pieges: [
      "Affirmer une contribution sans la démontrer par rapport à l'existant",
      "Ne pas justifier pourquoi cette méthodologie et pas une autre",
      "Introduction trop longue (> 30% de l'article)",
    ],
  },
  {
    semaine: 5,
    titre: "Méthodes — Approche",
    objectif: "Rédiger la section méthodologique de manière reproductible",
    livrables: [
      "Description du design de recherche",
      "Présentation de l'échantillon/population",
      "Description des instruments de collecte",
    ],
    pieges: [
      "Manquer de détails pour permettre la reproductibilité",
      "Confondre protocole (ce qu'on a fait) et justification (pourquoi)",
      "Omettre les considérations éthiques",
    ],
  },
  {
    semaine: 6,
    titre: "Méthodes — Procédure et analyse",
    objectif: "Compléter les procédures de collecte et d'analyse",
    livrables: [
      "Procédure de collecte de données détaillée",
      "Méthodes d'analyse (statistiques ou qualitatives)",
      "Justification des choix analytiques",
    ],
    pieges: [
      "Séparer la collecte et l'analyse au point de perdre la cohérence du protocole",
      "Ne pas préciser les logiciels ou versions utilisés pour l'analyse",
      "Oublier de mentionner les critères d'inclusion/exclusion",
    ],
  },
  {
    semaine: 7,
    titre: "Résultats — Présentation",
    objectif: "Organiser les résultats selon la logique des questions de recherche",
    livrables: [
      "Tableaux et figures avec titres descriptifs (auto-suffisants)",
      "Texte narratif accompagnant chaque tableau/figure",
      "Ordre logique des résultats (du général au spécifique)",
    ],
    pieges: [
      "Répéter dans le texte tout ce qui est dans les tableaux (le texte doit synthétiser, pas dupliquer)",
      "Présenter des résultats bruts sans analyse ni mise en contexte",
      "Intercaler de l'interprétation dans la section résultats",
    ],
  },
  {
    semaine: 8,
    titre: "Résultats — Vérification",
    objectif: "Vérifier la cohérence entre résultats, résumé et objectifs",
    livrables: [
      "Vérification : chaque objectif → résultats correspondants",
      "Vérification : chaque tableau/figure → référencé dans le texte",
      "Vérification : cohérence des chiffres entre résumé, texte et tableaux",
    ],
    pieges: [
      "Résultats qui ne répondent à aucun objectif déclaré",
      "Incohérence numérique entre le texte et les tableaux",
      "Tableaux/figures jamais cités dans le corps du texte",
    ],
  },
  {
    semaine: 9,
    titre: "Discussion — Interprétation",
    objectif: "Interpréter les résultats en lien avec la littérature existante",
    livrables: [
      "Rappel de l'objectif principal et des principaux résultats",
      "Comparaison avec les résultats des études antérieures",
      "Interprétation des convergences et divergences",
    ],
    pieges: [
      "Répéter les résultats au lieu de les interpréter",
      "Ne pas confronter les résultats à la littérature existante",
      "Ignorer les résultats contraires aux hypothèses",
    ],
  },
  {
    semaine: 10,
    titre: "Discussion — Limites et implications",
    objectif: "Formuler les limites, contributions et perspectives",
    livrables: [
      "Limites méthodologiques identifiées et justifiées",
      "Contributions théoriques et/ou pratiques",
      "Pistes de recherche future",
    ],
    pieges: [
      "Formuler des limites génériques non liées au protocole réel",
      "Surévaluer la portée des contributions",
      "Proposer des pistes de recherche sans lien avec les limites identifiées",
    ],
  },
  {
    semaine: 11,
    titre: "Révision et cohérence globale",
    objectif: "Réviser l'article dans sa globalité pour la cohérence et le style",
    livrables: [
      "Vérification de la progression argumentaire introduction → conclusion",
      "Harmonisation du style et du registre linguistique",
      "Vérification des références (complètes et conformes au style de la revue)",
    ],
    pieges: [
      "Réviser uniquement la forme et non le fond",
      "Ignorer les guidelines de la revue cible lors de la mise en forme",
      "Ne pas faire relire par un pair avant soumission",
    ],
  },
  {
    semaine: 12,
    titre: "Finalisation et soumission",
    objectif: "Préparer la lettre d'accompagnement et soumettre",
    livrables: [
      "Lettre d'accompagnement (cover letter) adaptée à la revue",
      "Vérification finale de la conformité aux exigences de soumission",
      "Soumission et enregistrement du suivi",
    ],
    pieges: [
      "Lettre d'accompagnement générique non personnalisée pour la revue",
      "Oublier les formulaires obligatoires (déclaration de conflit d'intérêts, consentement éthique)",
      "Ne pas conserver une copie du manuscrit tel que soumis (version tracking)",
    ],
  },
];

// ─── Critères de qualité pour la publication (Belcher) ─────────

export const CRITERES_QUALITE_PUBLICATION: CritereQualitePublication[] = [
  {
    id: "belcher-coherence",
    domaine: "Structure",
    critere: "Cohérence argumentaire globale",
    indicateur: "Chaque section renvoie à la précédente et prépare la suivante",
  },
  {
    id: "belcher-lacune",
    domaine: "Introduction",
    critere: "Identification explicite de la lacune",
    indicateur: "Le lecteur comprend en fin d'introduction ce que l'article apporte de nouveau",
  },
  {
    id: "belcher-reproductibilite",
    domaine: "Méthodes",
    critere: "Reproductibilité du protocole",
    indicateur: "Un chercheur pourrait reproduire l'étude à partir de la seule description des méthodes",
  },
  {
    id: "belcher-resultats-non-redondants",
    domaine: "Résultats",
    critere: "Non-redondance texte/tableaux",
    indicateur: "Le texte commente les tableaux sans en dupliquer les données",
  },
  {
    id: "belcher-discussion-litterature",
    domaine: "Discussion",
    critere: "Confrontation systématique avec la littérature",
    indicateur: "Chaque résultat principal est discuté en référence à au moins une étude antérieure",
  },
  {
    id: "belcher-limites-specifiques",
    domaine: "Discussion",
    critere: "Limites spécifiques au protocole",
    indicateur: "Les limites mentionnées sont directement liées aux choix méthodologiques de l'étude",
  },
  {
    id: "belcher-contribution-originale",
    domaine: "Contribution",
    critere: "Originalité de la contribution",
    indicateur: "La contribution est clairement distinguée des travaux existants",
  },
  {
    id: "belcher-conformite-revue",
    domaine: "Forme",
    critere: "Conformité aux exigences de la revue cible",
    indicateur: "Longueur, style bibliographique, sections — tout correspond aux guidelines",
  },
  {
    id: "belcher-couverture-letter",
    domaine: "Soumission",
    critere: "Lettre d'accompagnement personnalisée",
    indicateur: "La cover letter explique pourquoi cet article est pertinent pour CETTE revue",
  },
  {
    id: "belcher-revision-reponse",
    domaine: "Révision",
    critere: "Réponse constructive aux évaluateurs",
    indicateur: "Chaque commentaire est adressé point par point, même si non suivi",
  },
];

// ─── Pièges à fuir en publication (Belcher) ───────────────────

export const PIEGES_PUBLICATION: string[] = [
  "Attendre d'avoir un manuscrit parfait avant de choisir une revue cible",
  "Rédiger l'article avant d'avoir identifié la revue et ses exigences",
  "Ignorer le profil éditorial de la revue (types d'articles récents, thématiques privilégiées)",
  "Soumettre simultanément à plusieurs revues (soumission multiple = faute professionnelle)",
  "Ne pas répondre aux évaluateurs dans le délai imparti",
  "Répondre de manière défensive ou agressive aux commentaires des évaluateurs",
  "Ignorer les commentaires des évaluateurs et soumettre sans modification substantielle",
  "Confondre révision mineure (corrections formelles) et révision majeure (restructuration)",
  "Ne pas conserver une trace des versions successives du manuscrit",
  "Attendre la fin de la thèse pour publier (publier au fur et à mesure est stratégique)",
  "Ne pas demander à des collègues de relire avant soumission",
  "Sous-estimer l'importance de la lettre d'accompagnement (cover letter)",
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 2 — Évaluation de la qualité de recherche (Pyrczak)
// Grille d'évaluation critique pour évaluer des articles de revues académiques
// ═══════════════════════════════════════════════════════════════════

export const QUESTIONS_EVALUATION_RECHERCHE: QuestionEvaluation[] = [
  // --- Problématique et objectives ---
  {
    id: "pyrczak-obj1",
    categorie: "Problématique",
    question: "La question de recherche est-elle clairement formulée ?",
    ceChercher: "Un énoncé interrogatif ou déclaratif identifiant la variable dépendante et les variables indépendantes, avec une délimitation du champ d'étude",
  },
  {
    id: "pyrczak-obj2",
    categorie: "Problématique",
    question: "L'importance du problème est-elle justifiée ?",
    ceChercher: "Des données (statistiques, citations, contexte) démontrant pourquoi ce problème mérite une investigation",
  },
  {
    id: "pyrczak-obj3",
    categorie: "Problématique",
    question: "La revue de littérature est-elle pertinente et à jour ?",
    ceChercher: "Des références récentes (dernières 5 ans majoritairement), des travaux fondateurs, et une synthèse critique plutôt qu'un catalogue",
  },
  {
    id: "pyrczak-obj4",
    categorie: "Problématique",
    question: "Les hypothèses sont-elles dérivées de la théorie ou de la littérature ?",
    ceChercher: "Un lien explicite entre le cadre théorique/conceptuel et chaque hypothèse formulée",
  },
  // --- Méthodologie ---
  {
    id: "pyrczak-meth1",
    categorie: "Méthodologie",
    question: "Le design de recherche est-il approprié pour la question posée ?",
    ceChercher: "Cohérence entre le type de question (causale, descriptive, exploratoire) et le design choisi (expérimental, quasi-expérimental, corrélationnel, qualitatif)",
  },
  {
    id: "pyrczak-meth2",
    categorie: "Méthodologie",
    question: "L'échantillon est-il représentatif et de taille adéquate ?",
    ceChercher: "Description de la méthode d'échantillonnage, calcul de puissance statistique si applicable, critères d'inclusion/exclusion",
  },
  {
    id: "pyrczak-meth3",
    categorie: "Méthodologie",
    question: "Les instruments de mesure sont-ils valides et fiables ?",
    ceChercher: "Indication de la validité (construct, critère, contenu) et de la fiabilité (cohérence interne, test-retest) des instruments",
  },
  {
    id: "pyrczak-meth4",
    categorie: "Méthodologie",
    question: "Les variables sont-elles opérationnalisées de manière claire ?",
    ceChercher: "Pour chaque variable : définition opérationnelle, échelle de mesure, procédure de collecte",
  },
  {
    id: "pyrczak-meth5",
    categorie: "Méthodologie",
    question: "Les biais potentiels sont-ils identifiés et contrôlés ?",
    ceChercher: "Discussion des biais de sélection, de mesure, de confusion, et des stratégies de contrôle (appariement, randomisation, stratification)",
  },
  // --- Résultats ---
  {
    id: "pyrczak-res1",
    categorie: "Résultats",
    question: "Les méthodes statistiques sont-elles appropriées ?",
    ceChercher: "Adéquation entre le type de données et le test choisi, vérification des préconditions (normalité, homoscédasticité), mention des tailles d'effet",
  },
  {
    id: "pyrczak-res2",
    categorie: "Résultats",
    question: "Les résultats sont-ils présentés de manière claire et honnête ?",
    ceChercher: "Tableaux/figures lisibles, absence de sélection biaisée des résultats (no p-hacking), reporting complet des résultats négatifs",
  },
  {
    id: "pyrczak-res3",
    categorie: "Résultats",
    question: "L'importance pratique (taille d'effet) est-elle rapportée en plus de la signification statistique ?",
    ceChercher: "Mentions de d de Cohen, r², odds ratio ou autres mesures d'effet, pas seulement les valeurs p",
  },
  // --- Discussion ---
  {
    id: "pyrczak-disc1",
    categorie: "Discussion",
    question: "Les résultats sont-ils interprétés correctement ?",
    ceChercher: "Interprétation proportionnelle aux preuves, pas de généralisation au-delà des limites de l'étude",
  },
  {
    id: "pyrczak-disc2",
    categorie: "Discussion",
    question: "Les résultats sont-ils comparés à la littérature antérieure ?",
    ceChercher: "Confrontation explicite avec les études clés du domaine, explication des convergences et divergences",
  },
  {
    id: "pyrczak-disc3",
    categorie: "Discussion",
    question: "Les limites de l'étude sont-elles discutées de manière spécifique ?",
    ceChercher: "Limites liées au design, à l'échantillon, aux mesures — et implications pour l'interprétation",
  },
  {
    id: "pyrczak-disc4",
    categorie: "Discussion",
    question: "Les conclusions sont-elles justifiées par les données ?",
    ceChercher: "Pas de conclusions allant au-delà des résultats présentés, distinction entre résultats directs et implications spéculatives",
  },
  // --- Forme et éthique ---
  {
    id: "pyrczak-form1",
    categorie: "Forme et éthique",
    question: "L'article est-il bien organisé et clairement écrit ?",
    ceChercher: "Structure logique, paragraphes thématiques, transitions explicites, style concis sans jargon inutile",
  },
  {
    id: "pyrczak-form2",
    categorie: "Forme et éthique",
    question: "Les références sont-elles complètes et à jour ?",
    ceChercher: "Toutes les citations dans le texte ont une entrée bibliographique, et vice-versa ; style cohérent",
  },
  {
    id: "pyrczak-form3",
    categorie: "Forme et éthique",
    question: "Les considérations éthiques sont-elles respectées ?",
    ceChercher: "Approbation d'un comité d'éthique, consentement éclairé, déclaration de conflits d'intérêts",
  },
];

// ─── Niveaux de qualité d'une recherche (Pyrczak) ─────────────

export const NIVEAUX_QUALITE_RECHERCHE: NiveauQualite[] = [
  {
    niveau: "Excellent",
    description: "L'étude répond de manière convaincante à sa question de recherche avec une méthodologie rigoureuse et des conclusions justifiées",
    signesDistinctifs: [
      "Question de recherche précise et bien justifiée",
      "Design méthodologique optimal pour la question posée",
      "Échantillon représentatif avec justification de la taille",
      "Analyse statistique appropriée avec tailles d'effet",
      "Discussion nuancée intégrant la littérature pertinente",
      "Limites réalistes et spécifiques au protocole",
    ],
  },
  {
    niveau: "Bon",
    description: "L'étude est solide mais présente des limites méthodologiques mineures n'affectant pas la validité des conclusions",
    signesDistinctifs: [
      "Question claire mais justification parfois insuffisante",
      "Design approprié mais certains choix pourraient être mieux justifiés",
      "Échantillon adéquat mais sans calcul de puissance",
      "Analyse correcte mais taille d'effet non rapportée",
      "Discussion complète mais peu de confrontation avec la littérature",
    ],
  },
  {
    niveau: "Acceptable",
    description: "L'étude apporte une contribution malgré des faiblesses méthodologiques notables qui limitent la portée des conclusions",
    signesDistinctifs: [
      "Question identifiable mais formulation imprécise",
      "Design convenable mais biais non contrôlés",
      "Échantillon de convenance sans justification",
      "Analyse statistique basique sans vérification des préconditions",
      "Discussion descriptive sans interprétation approfondie",
    ],
  },
  {
    niveau: "Insuffisant",
    description: "Les faiblesses méthodologiques compromettent la validité des résultats et des conclusions",
    signesDistinctifs: [
      "Problématique vague ou absente",
      "Design inadéquat pour la question de recherche",
      "Échantillon trop petit ou non représentatif sans justification",
      "Analyses statistiques inappropriées ou mal rapportées",
      "Conclusions non justifiées par les données",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 3 — Règles d'édition professionnelle (PhDone — Roda, Saunders, Anderson)
// Principes pour transformer un manuscrit doctoral en texte publiable
// ═══════════════════════════════════════════════════════════════════

export const REGLES_EDITION_PROFESSIONNELLE: RegleEdition[] = [
  {
    id: "phdone-un-paragraphe-une-idee",
    categorie: "Structure",
    regle: "Un paragraphe = une idée principale",
    exempleAvant: "Les résultats montrent que X augmente avec Y. Z est également significatif. Les participants ont rapporté... La méthode utilisée était...",
    exempleApres: "Les résultats montrent une corrélation positive significative entre X et Y (r = 0.65, p < .01). Ce résultat est cohérent avec les travaux de [Auteur, Année].",
  },
  {
    id: "phdone-sujet-verbe",
    categorie: "Clarté",
    regle: "Rapprocher le sujet du verbe principal",
    exempleAvant: "Les résultats de l'analyse, qui ont été obtenus après avoir appliqué le modèle de régression multiple aux données recueillies auprès des 150 participants de l'étude, montrent que...",
    exempleApres: "L'analyse de régression multiple (n = 150) montre que...",
  },
  {
    id: "phdone-actif",
    categorie: "Style",
    regle: "Privilégier la voix active pour la clarté (le passif n'est pas interdit mais doit être justifié)",
    exempleAvant: "Il a été observé que les participants...",
    exempleApres: "Les participants ont montré...",
  },
  {
    id: "phdone-sigle-premiere-fois",
    categorie: "Forme",
    regle: "Toujours définir un sigle ou une abréviation à sa première occurrence",
    exempleAvant: "L'ANOVA révèle des différences significatives.",
    exempleApres: "L'analyse de variance (ANOVA) révèle des différences significatives.",
  },
  {
    id: "phdone-nom-chiffres",
    categorie: "Forme",
    regle: "Écrire les nombres en lettres jusqu'à neuf, en chiffres à partir de 10 (sauf exceptions : dates, pourcentages, unités)",
    exempleAvant: "3 groupes ont été comparés. Vingt-cinq participants...",
    exempleApres: "Trois groupes ont été comparés. 25 participants...",
  },
  {
    id: "phdone-transition",
    categorie: "Cohésion",
    regle: "Chaque paragraphe doit commencer par un connecteur logique ou un rappel du thème précédent",
    exempleAvant: "Les résultats confirment l'hypothèse H1. Le test de Student...",
    exempleApres: "En conformité avec l'hypothèse H1, les résultats confirment... Par ailleurs, le test de Student...",
  },
  {
    id: "phdone-coupe-phrases-longues",
    categorie: "Lisibilité",
    regle: "Découper les phrases de plus de 35 mots en unités plus courtes",
    exempleAvant: "Bien que les résultats préliminaires aient suggéré une relation entre les deux variables, il convient de noter que la taille réduite de l'échantillon limite la généralisabilité de ces findings qui nécessitent donc une réplication sur un échantillon plus large.",
    exempleApres: "Les résultats préliminaires suggèrent une relation entre les deux variables. Cependant, la taille réduite de l'échantillon limite la généralisabilité de ces résultats. Une réplication sur un échantillon plus large est nécessaire.",
  },
  {
    id: "phdone-elimine-redondances",
    categorie: "Concision",
    regle: "Supprimer les redondances verbales et les tournures alourdies",
    exempleAvant: "Il est important de prendre en considération le fait que...",
    exempleApres: "Il faut considérer que...",
  },
  {
    id: "phdone-temps-verbaux",
    categorie: "Cohérence",
    regle: "Maintenir la cohérence des temps verbaux : passé pour les méthodes/résultats, présent pour la littérature établie et les conclusions",
    exempleAvant: "Les participants ont complété le questionnaire (passé). La littérature a montré que... (passé au lieu de présent). Nous recommandons que... (présent correct).",
    exempleApres: "Les participants ont complété le questionnaire. La littérature montre que... Nous recommandons que...",
  },
  {
    id: "phdone-parallelisme",
    categorie: "Structure",
    regle: "Assurer le parallélisme grammatical dans les listes et énumérations",
    exempleAvant: "L'étude vise à : 1) analyser les données, 2) la comparaison des groupes, 3) interpréter les résultats.",
    exempleApres: "L'étude vise à : 1) analyser les données, 2) comparer les groupes, 3) interpréter les résultats.",
  },
  {
    id: "phdone-precision-quantitative",
    categorie: "Rigueur",
    regle: "Toujours accompagner les résultats statistiques de la taille d'effet et de l'intervalle de confiance",
    exempleAvant: "La différence est significative (p < .05).",
    exempleApres: "La différence est significative, d = 0.72 (IC 95% [0.41, 1.03]), p < .001.",
  },
  {
    id: "phdone-non-sexisme",
    categorie: "Inclusivité",
    regle: "Utiliser un langage inclusif (doubler les termes ou utiliser le point médian si conforme aux normes de la revue)",
    exempleAvant: "Le chercheur doit toujours vérifier ses hypothèses.",
    exempleApres: "Les chercheurs et chercheuses doivent toujours vérifier leurs hypothèses.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 4 — Rédaction de la proposition de thèse (Sonneveld)
// Structure, critères d'acceptation et erreurs fréquentes
// ═══════════════════════════════════════════════════════════════════

export const STRUCTURE_PROPOSITION_THESE: EtapeProposition[] = [
  {
    id: "sonneveld-titre",
    section: "Titre provisoire",
    objectif: "Formuler un titre qui indique le domaine, l'objet et l'angle d'approche",
    elementsAttendus: [
      "Domaine disciplinaire identifiable",
      "Objet d'étude clairement délimité",
      "Perspective ou angle d'approche suggéré",
      "Longueur raisonnable (10-15 mots)",
    ],
    erreursFrequentes: [
      ' Titre trop vague (ex. : "Étude de..." sans plus de précision) ',
      "Titre trop long ou contenant une question complète",
      "Titre qui promet plus que ce que la recherche peut livrer",
    ],
  },
  {
    id: "sonneveld-contexte",
    section: "Contexte et justification",
    objectif: "Établir la pertinence sociale, scientifique et académique du sujet",
    elementsAttendus: [
      "Cadrage du domaine de recherche",
      "Données factuelles justifiant l'intérêt du sujet",
      "Références aux débats contemporains dans le champ",
      "Transition vers la problématique spécifique",
    ],
    erreursFrequentes: [
      "Contexte trop large ou encyclopédique",
      "Absence de données chiffrées ou de faits étayant la pertinence",
      "Justification purement personnelle (ce sujet m'intéresse) sans ancrage scientifique",
    ],
  },
  {
    id: "sonneveld-problematique",
    section: "Problématique et questions de recherche",
    objectif: "Formuler la question centrale et les sous-questions dérivées",
    elementsAttendus: [
      "Question de recherche principale claire et focalisée",
      "Sous-questions opérationnelles dérivées de la question principale",
      "Hypothèses provisoires si applicable",
      "Définitions provisoires des concepts clés",
    ],
    erreursFrequentes: [
      "Question trop large ou trop vague pour une thèse",
      "Questions qui ne sont pas reliées entre elles de manière logique",
      "Confusion entre question de recherche et hypothèse",
    ],
  },
  {
    id: "sonneveld-revue",
    section: "Revue de littérature préliminaire",
    objectif: "Démontrer la maîtrise de l'état de l'art et identifier la lacune",
    elementsAttendus: [
      "Synthèse des travaux majeurs sur le sujet",
      "Identification des courants théoriques pertinents",
      "Mise en évidence de la lacune de recherche",
      "Positionnement du projet par rapport à l'existant",
    ],
    erreursFrequentes: [
      "Succession de résumés d'articles au lieu d'une synthèse intégrée",
      "Revue exhaustive non sélective (tout citer au lieu de citer ce qui est pertinent)",
      "Absence de mise en perspective critique des travaux cités",
    ],
  },
  {
    id: "sonneveld-cadre-theorique",
    section: "Cadre théorique ou conceptuel",
    objectif: "Présenter les théories ou concepts qui guideront l'analyse",
    elementsAttendus: [
      "Théories principales mobilisées avec auteurs de référence",
      "Définitions opérationnelles des concepts clés",
      "Modèle conceptuel/analytique proposé (si applicable)",
      "Justification du choix de ce cadre (pourquoi celui-ci et pas un autre)",
    ],
    erreursFrequentes: [
      "Cadre purement descriptif sans liens entre les concepts",
      "Théories citées sans être réellement mobilisées dans l'analyse",
      "Absence de justification du choix du cadre",
    ],
  },
  {
    id: "sonneveld-methodologie",
    section: "Méthodologie proposée",
    objectif: "Décrire le design de recherche et les méthodes de collecte et d'analyse",
    elementsAttendus: [
      "Design de recherche justifié (qualitatif, quantitatif, mixte)",
      "Population cible et stratégie d'échantillonnage",
      "Techniques de collecte de données",
      "Méthodes d'analyse prévues",
      "Considérations éthiques",
      "Calendrier prévisionnel",
    ],
    erreursFrequentes: [
      "Description vague sans détails opérationnels",
      "Échantillonnage non justifié",
      "Absence de mention des outils d'analyse (logiciels, grilles)",
      "Méthodologie non cohérente avec les questions de recherche",
    ],
  },
  {
    id: "sonneveld-plan-previsionnel",
    section: "Plan provisoire de la thèse",
    objectif: "Présenter la structure prévue des chapitres",
    elementsAttendus: [
      "Titre provisoire de chaque chapitre",
      "Contenu prévu pour chaque chapitre (3-5 lignes)",
      "Progression logique entre les chapitres",
      "Estimation du volume (pages) par chapitre",
    ],
    erreursFrequentes: [
      "Plan trop détaillé (illusoire à ce stade) ou trop vague",
      "Absence de logique entre les chapitres",
      "Plan non cohérent avec les questions de recherche",
    ],
  },
  {
    id: "sonneveld-bibliographie",
    section: "Bibliographie préliminaire",
    objectif: "Présenter les références principales qui fondent le projet",
    elementsAttendus: [
      "20-40 références minimum couvrant les principaux axes",
      "Équilibre entre sources récentes et travaux fondateurs",
      "Respect d'un style bibliographique cohérent",
    ],
    erreursFrequentes: [
      "Trop peu de références pour le niveau doctoral",
      "Sources obsolètes (majorité > 10 ans sans justification)",
      "Style bibliographique incohérent ou incomplet",
    ],
  },
];

// ─── Critères d'acceptation d'une proposition de thèse (Sonneveld) ──

export const CRITERES_ACCEPTATION_PROPOSITION: CritereAcceptation[] = [
  {
    id: "sonneveld-ca-feasabilite",
    critere: "Faisabilité",
    poids: "éliminatoire",
    description: "Le projet peut-il être réalisé dans le temps imparti (3-4 ans) avec les ressources disponibles ? La question n'est ni trop vaste ni trop étroite.",
  },
  {
    id: "sonneveld-ca-originalite",
    critere: "Originalité",
    poids: "majeur",
    description: "La contribution est-elle nouvelle ou apporte-t-elle un angle nouveau sur un sujet existant ? Le positionnement par rapport à la littérature est clair.",
  },
  {
    id: "sonneveld-ca-coherence",
    critere: "Cohérence interne",
    poids: "majeur",
    description: "Les questions de recherche, le cadre théorique et la méthodologie forment-ils un ensemble cohérent ? Chaque élément justifie les autres.",
  },
  {
    id: "sonneveld-ca-rigueur",
    critere: "Rigueur méthodologique",
    poids: "majeur",
    description: "Le design de recherche est-il approprié pour les questions posées ? Les méthodes sont-elles décrites avec suffisamment de détails ?",
  },
  {
    id: "sonneveld-ca-maitrise",
    critere: "Maîtrise de la littérature",
    poids: "majeur",
    description: "Le candidat démontre-t-il une connaissance solide de l'état de l'art ? La revue préliminaire est-elle sélective et critique ?",
  },
  {
    id: "sonneveld-ca-pertinence",
    critere: "Pertinence disciplinaire",
    poids: "mineur",
    description: "Le projet s'inscrit-il dans les thématiques de recherche du laboratoire ou de l'équipe d'accueil ?",
  },
  {
    id: "sonneveld-ca-qualite-redaction",
    critere: "Qualité de la rédaction",
    poids: "mineur",
    description: "La proposition est-elle bien structurée, claire et sans fautes ? Le style est-il académique et professionnel ?",
  },
  {
    id: "sonneveld-ca-ethique",
    critere: "Considérations éthiques",
    poids: "éliminatoire",
    description: "Les questions éthiques sont-elles identifiées et un protocole d'approbation est-il prévu ?",
  },
];

// ─── Erreurs fréquentes dans les propositions de thèse (Sonneveld) ──

export const ERREURS_FREQUENTES_PROPOSITION: string[] = [
  "Problématique trop large — impossibilité de la traiter en une thèse",
  "Absence de question de recherche clairement formulée",
  "Revue de littérature descriptive au lieu de critique et intégrative",
  "Cadre théorique absent ou juxtaposé sans articulation",
  "Méthodologie vaguement esquissée sans détails opérationnels",
  "Inadéquation entre les questions de recherche et les méthodes proposées",
  "Bibliographie insuffisante ou déséquilibrée",
  "Plan de thèse non cohérent avec la problématique",
  "Absence de considérations éthiques",
  "Langage non académique ou trop informel",
  "Promettre plus que ce qui est réaliste (projet surdimensionné)",
  "Ne pas situer le projet par rapport aux travaux existants (manque de positionnement)",
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 5 — Stratégies de motivation pour la rédaction (Holtom & Fisher)
// Principes psychologiques et pratiques pour apprécier la rédaction de la thèse
// ═══════════════════════════════════════════════════════════════════

export const STRATEGIES_MOTIVATION_REDACTION: StrategieMotivation[] = [
  {
    id: "holtom-bloc-temps",
    phase: "Planification",
    strategie: "Bloquer des créneaux de rédaction réguliers et non négociables",
    miseEnPratique: "Réserver 2-3 heures par jour (matin de préférence) dédiées exclusivement à l'écriture. Traiter ce créneau comme un rendez-vous clinique — ni mails, ni téléphone, ni réseaux.",
  },
  {
    id: "holtom-objectifs-quotidiens",
    phase: "Planification",
    strategie: "Se fixer des objectifs d'écriture quotidiens mesurables",
    miseEnPratique: "Définir un nombre de mots (ex. : 500 mots/jour) ou un sous-objectif (ex. : rédiger un paragraphe). Ne pas quitter le créneau sans avoir atteint l'objectif.",
  },
  {
    id: "holtom-ecrire-pour-comprendre",
    phase: "Processus",
    strategie: "Écrire pour comprendre, pas seulement pour communiquer",
    miseEnPratique: "Accepter que les premiers brouillons soient imparfaits. L'acte d'écrire aide à structurer la pensée. Séparer le moment de la création (rédaction) du moment de la correction (révision).",
  },
  {
    id: "holtom-pomodoro",
    phase: "Processus",
    strategie: "Utiliser des sessions de rédaction courtes et intenses",
    miseEnPratique: "Travailler par blocs de 25-45 minutes avec des pauses de 5-10 minutes. Cette technique maintient la concentration et évite l'épuisement cognitif.",
  },
  {
    id: "holtom-debuter-facile",
    phase: "Démarrage",
    strategie: "Commencer par la section la plus facile, pas la plus difficile",
    miseEnPratique: "Pour la thèse scientifique, les méthodes et les résultats sont souvent les sections les plus faciles à rédiger (données déjà disponibles). Commencer par là construit l'élan.",
  },
  {
    id: "holtom-skeleton",
    phase: "Démarrage",
    strategie: "Rédiger d'abord le squelette, puis remplir chaque section",
    miseEnPratique: "Créer un document avec les titres et sous-titres de chaque section, les figures/tableaux à insérer, et les références clés. Puis remplir progressivement chaque section.",
  },
  {
    id: "holtom-feedback-precoce",
    phase: "Itération",
    strategie: "Obtenir des retours le plus tôt possible",
    miseEnPratique: "Partager des sections complétées (pas l'ensemble) avec le directeur ou des collègues dès qu'elles sont dans un état lisible. Les retours précoces évitent les réécritures massives.",
  },
  {
    id: "holtom-celebrer",
    phase: "Motivation",
    strategie: "Célébrer les petites victoires",
    miseEnPratique: "Marquer l'achèvement de chaque section, chapitre ou étape importante. La thèse est un marathon — les étapes intermédiaires méritent d'être reconnues.",
  },
  {
    id: "holtom-groupe-ecriture",
    phase: "Environnement",
    strategie: "Rejoindre ou créer un groupe d'écriture (writing group)",
    miseEnPratique: "Séances d'écriture collectives (en personne ou en ligne) avec des pairs. L'engagement social et la pression bienveillante du groupe maintiennent la régularité.",
  },
  {
    id: "holtom-separer-redaction-revision",
    phase: "Processus",
    strategie: "Ne jamais réviser en même temps qu'on rédige",
    miseEnPratique: "Pendant la session d'écriture : avancer sans se soucier du style. Pendant la session de révision : corriger sans chercher à produire du nouveau contenu. Les deux activités sollicitent des processus cognitifs différents.",
  },
  {
    id: "holtom-visualiser-progres",
    phase: "Motivation",
    strategie: "Visualiser la progression avec des indicateurs tangibles",
    miseEnPratique: "Suivre le nombre de mots, de pages, de sections complétées. Un tableau de progression visible quotidiennement renforce le sentiment d'avancement.",
  },
  {
    id: "holtom-routine",
    phase: "Environnement",
    strategie: "Créer une routine d'écritureritualisée",
    miseEnPratique: "Même lieu, même heure, même rituel de démarrage (café, musique, 5 minutes de lecture). Le cerveau associe ces signaux à l'état d'écriture et bascule plus facilement en mode concentration.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 6 — Guide complet de la thèse (Graustein)
// De la proposition à la soutenance : étapes et critères d'excellence
// ═══════════════════════════════════════════════════════════════════

export const ETAPES_GUIDE_THESE: EtapeThese[] = [
  {
    id: "graustein-exploration",
    phase: "Phase exploratoire (mois 1-6)",
    titre: "Exploration et orientation",
    objectif: "Délimiter le sujet, explorer la littérature et affiner la problématique",
    produitsLivables: [
      "État de l'art préliminaire (15-20 pages)",
      "Question de recherche affinée",
      "Liste de lectures prioritaires",
      "Premier jet du cadre théorique provisoire",
    ],
    delaiEstime: "6 mois",
  },
  {
    id: "graustein-proposition",
    phase: "Phase de proposition (mois 6-9)",
    titre: "Rédaction et défense de la proposition",
    objectif: "Formaliser le projet de recherche et obtenir l'approbation du comité",
    produitsLivables: [
      "Proposition de thèse complète (30-50 pages)",
      "Présentation de la proposition (diapositives)",
      "Réponses aux questions du comité",
      "Plan révisé de la thèse",
    ],
    delaiEstime: "3 mois",
  },
  {
    id: "graustein-collecte",
    phase: "Phase de collecte (mois 9-18)",
    titre: "Collecte de données et premiers résultats",
    objectif: "Mettre en œuvre le protocole de recherche et collecter les données",
    produitsLivables: [
      "Base de données constituée",
      "Résultats préliminaires",
      "Journal de bord de la recherche",
      "Ajustements méthodologiques documentés",
    ],
    delaiEstime: "9 mois",
  },
  {
    id: "graustein-analyse",
    phase: "Phase d'analyse (mois 18-24)",
    titre: "Analyse et interprétation",
    objectif: "Analyser les données et produire les résultats interprétés",
    produitsLivables: [
      "Résultats d'analyse complets",
      "Tableaux et figures définitifs",
      "Interprétations préliminaires",
      "Au moins un article soumis ou en préparation",
    ],
    delaiEstime: "6 mois",
  },
  {
    id: "graustein-redaction",
    phase: "Phase de rédaction (mois 24-36)",
    titre: "Rédaction des chapitres",
    objectif: "Rédiger l'ensemble de la thèse chapitre par chapitre",
    produitsLivables: [
      "Chapitre 1 : Introduction et problématique",
      "Chapitre 2 : Revue de littérature",
      "Chapitre 3 : Cadre théorique",
      "Chapitre 4 : Méthodologie",
      "Chapitres 5+ : Résultats et discussion",
      "Chapitre final : Conclusion et perspectives",
    ],
    delaiEstime: "12 mois",
  },
  {
    id: "graustein-revision",
    phase: "Phase de révision (mois 36-42)",
    titre: "Révision globale et mise en forme",
    objectif: "Réviser l'ensemble pour la cohérence, le style et la conformité",
    produitsLivables: [
      "Version révisée après retours du directeur",
      "Cohérence inter-chapitres vérifiée",
      "Bibliographie complète et vérifiée",
      "Annexes organisées",
    ],
    delaiEstime: "3 mois",
  },
  {
    id: "graustein-soutenance",
    phase: "Phase de soutenance (mois 42-48)",
    titre: "Préparation et soutenance",
    objectif: "Préparer la présentation et répondre aux questions du jury",
    produitsLivables: [
      "Présentation de soutenance (20-30 minutes)",
      "Liste de questions anticipées avec réponses préparées",
      "Version finale de la thèse",
    ],
    delaiEstime: "2 mois",
  },
];

// ─── Critères d'excellence d'une thèse (Graustein) ────────────────

export const CRITERES_EXCELLENCE_THESE: CritereExcellence[] = [
  {
    id: "graustein-originalite",
    domaine: "Contribution",
    critere: "Originalité de la contribution",
    description: "La thèse apporte une contribution nouvelle au champ — nouvelle théorie, nouvelles données, nouvelle méthode, ou nouvelle synthèse. L'originalité est démontrée, pas seulement affirmée.",
  },
  {
    id: "graustein-coherence",
    domaine: "Structure",
    critere: "Cohérence de l'argumentation",
    description: "Chaque chapitre contribue à la démonstration globale. La progression logique est claire et le lecteur ne perd jamais le fil de l'argument.",
  },
  {
    id: "graustein-rigueur-methode",
    domaine: "Méthodologie",
    critere: "Rigueur méthodologique exemplaire",
    description: "Le design est justifié, les procédures sont reproductibles, les biais sont identifiés et contrôlés, et les analyses sont appropriées.",
  },
  {
    id: "graustein-litterature-maitrise",
    domaine: "Littérature",
    critere: "Maîtrise de la littérature",
    description: "La revue est exhaustive mais sélective, critique et intégrative. Les travaux sont comparés et synthétisés, pas simplement catalogués.",
  },
  {
    id: "graustein-cadre-solide",
    domaine: "Théorie",
    critere: "Cadre théorique/conceptuel solide",
    description: "Les concepts sont clairement définis, les relations sont explicitées, et le cadre guide effectivement l'analyse des données.",
  },
  {
    id: "graustein-discussion-nuancee",
    domaine: "Discussion",
    critere: "Discussion nuancée et honnête",
    description: "Les résultats sont interprétés avec prudence, confrontés à la littérature, et les limites sont discutées de manière spécifique et honnête.",
  },
  {
    id: "graustein-redaction-soignee",
    domaine: "Rédaction",
    critere: "Qualité de la rédaction",
    description: "Le style est clair, concis et académique. Les phrases sont bien construites, les transitions sont explicites, et le texte est exempt de fautes.",
  },
  {
    id: "graustein-presentation",
    domaine: "Forme",
    critere: "Présentation soignée",
    description: "La mise en page est professionnelle, les tableaux et figures sont de qualité, les références sont complètes et conformes, et les annexes sont utiles.",
  },
  {
    id: "graustein-publications",
    domaine: "Rayonnement",
    critere: "Publications dérivées de la thèse",
    description: "Au moins un article accepté dans une revue à comité de lecture, ou des soumissions en cours démontrant la capacité à publier.",
  },
  {
    id: "graustein-perspectives",
    domaine: "Ouverture",
    critere: "Perspectives de recherche pertinentes",
    description: "Les pistes de recherche future sont réalistes, spécifiques, et en lien direct avec les limites identifiées et les résultats obtenus.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 7 — Règles de rédaction pour publication (Epstein, Kenway, Boden)
// Principes spécifiques au processus de rédaction académique pour publication
// ═══════════════════════════════════════════════════════════════════

export const REGLES_REDACTION_PUBLICATION: string[] = [
  "Identifier l'audience cible AVANT de commencer à rédiger — le style et le niveau de détail dépendent du lectorat de la revue",
  "Adopter le style de la revue cible en analysant 3-5 articles récents publiés dans cette même revue",
  "Structurer le premier paragraphe de chaque section pour capter l'attention — c'est le critère de lecture/saut du lecteur",
  "Rédiger le résumé en premier pour clarifier le message central, puis le réviser en dernier pour cohérence",
  "Éviter la métaphore filée et les figures de style littéraires — la clarté prime sur l'élégance",
  "Chaque phrase doit apporter une information nouvelle — éliminer les phrases qui ne font que répéter ou paraphraser",
  "Les transitions entre sections doivent être explicites — ne pas supposer que le lecteur fera le lien seul",
  "Utiliser le présent pour les vérités établies et la littérature, le passé pour les méthodes et résultats de l'étude",
  "Les sigles sont définis à la première occurrence, même si le lecteur cible est spécialisé",
  "Citer les sources pertinentes, pas toutes les sources disponibles — la bibliographie est sélective, pas exhaustive",
  "Vérifier que chaque référence citée dans le texte figure dans la bibliographie, et réciproquement",
  "Préparer une réponse-type aux évaluateurs : remerciement, réponse point par point, justification des choix non modifiés",
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 8 — Compétences en recherche et rédaction (RMIT)
// Compétences transversales pour la recherche doctorale
// ═══════════════════════════════════════════════════════════════════

export const COMPETENCES_RECHERCHE_REDACTION: string[] = [
  "Savoir formuler une question de recherche testable et falsifiable",
  "Maîtriser les techniques de recherche documentaire avancées (bases de données, mots-clés, opérateurs booléens)",
  "Évaluer de manière critique la qualité méthodologique d'une étude (validité interne, validité externe, fiabilité)",
  "Synthétiser les résultats de plusieurs études de manière intégrative (pas cumulative)",
  "Communiquer les résultats de recherche de manière claire et adaptée à l'audience",
  "Gérer le temps de rédaction de manière réaliste en tenant compte des itérations inévitables",
  "Accepter et intégrer les retours critiques de manière constructive",
  "Respecter les normes éthiques de la recherche et de la publication",
  "Développer une identité de chercheur par la pratique régulière de l'écriture académique",
  "Comprendre le processus de publication (soumission, évaluation, révision, acceptation) pour s'y préparer stratégiquement",
];

// ═══════════════════════════════════════════════════════════════════
// EXPORT UNIFIÉ
// ═══════════════════════════════════════════════════════════════════

export const PUBLICATION_CORPUS = {
  // Module 1 — Belcher
  programmePublication12Semaines: {
    semaines: SEMAINES_PROGRAMME_PUBLICATION,
    criteresQualite: CRITERES_QUALITE_PUBLICATION,
    piegesAFuir: PIEGES_PUBLICATION,
  },

  // Module 2 — Pyrczak
  evaluationQualiteRecherche: {
    criteresEvaluation: QUESTIONS_EVALUATION_RECHERCHE,
    niveauxQualite: NIVEAUX_QUALITE_RECHERCHE,
  },

  // Module 3 — PhDone
  reglesEditionProfessionnelle: REGLES_EDITION_PROFESSIONNELLE,

  // Module 4 — Sonneveld
  redactionPropositionThese: {
    structureProposition: STRUCTURE_PROPOSITION_THESE,
    criteresAcceptation: CRITERES_ACCEPTATION_PROPOSITION,
    erreursFrequentes: ERREURS_FREQUENTES_PROPOSITION,
  },

  // Module 5 — Holtom & Fisher
  strategiesMotivationRedaction: STRATEGIES_MOTIVATION_REDACTION,

  // Module 6 — Graustein
  guideCompletThese: {
    etapes: ETAPES_GUIDE_THESE,
    criteresExcellence: CRITERES_EXCELLENCE_THESE,
  },

  // Module 7 — Epstein, Kenway, Boden
  reglesRedactionPublication: REGLES_REDACTION_PUBLICATION,

  // Module 8 — RMIT
  competencesRechercheRedaction: COMPETENCES_RECHERCHE_REDACTION,
};

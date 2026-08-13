// ═══════════════════════════════════════
// ThesisFrame — Corpus de connaissances en supervision doctorale
// Synthèse reformulée de 4 ouvrages de référence :
//   • Wisker, The Good Supervisor
//   • Taylor & Kiley, Handbook for Doctoral Supervisors
//   • Phillips & Pugh, How to Get a PhD
//   • Turabian, A Manual for Writers (normes de rédaction)
//
// IMPORTANT : Ce fichier ne reproduit aucun texte protégé.
// Il reformule en principes, critères, questions et checklists.
// ═══════════════════════════════════════

// --- Principes fondamentaux de la supervision ---

export const PRINCIPES_SUPERVISION: string[] = [
  // P1 — Négociation des attentes
  "Principe : La supervision efficace repose sur la négociation explicite des attentes mutuelles dès le premier contact, puis régulièrement à chaque transition de phase.",
  // P2 — Autonomie progressive
  "Principe : Le superviseur doit accompagner le doctorant vers une autonomie croissante en réduisant progressivement la dépendance — du guidage directif au rôle de consultant.",
  // P3 — Feedback différencié
  "Principe : Le feedback doit être à la fois bienveillant et exigeant — valoriser les forces, cibler 2-3 axes d'amélioration prioritaires, poser des questions ouvertes, proposer des pistes concrètes.",
  // P4 — Respect et éthique relationnelle
  "Principe : La relation de supervision exige un respect mutuel explicite, la reconnaissance de la diversité du doctorant, et une attention constante au bien-être psychologique.",
  // P5 — Gestion du processus
  "Principe : Le superviseur est responsable de la gestion du processus de recherche — fixer des jalons, maintenir la dynamique, identifier les signaux d'alerte (ralentissement, isolement, blocage).",
  // P6 — Adaptation au profil du doctorant
  "Principe : Il n'existe pas de modèle universel — le superviseur doit adapter son style (directif ↔ non-directif) au stade d'avancement, au profil d'apprentissage et au contexte du doctorant.",
  // P7 — Communication ouverte et régulière
  "Principe : Des rencontres régulières (au minimum bimensuelles) avec un ordre du jour clair et un suivi écrit sont la base d'une supervision productive.",
  // P8 — Intégration dans la communauté de recherche
  "Principe : Le superviseur doit faciliter l'intégration du doctorant dans la communauté académique (séminaires, conférences, publications, réseaux).",
  // P9 — Contractualisation psychologique
  "Principe : Un 'contrat psychologique' clair — explicite ou implicite — entre superviseur et doctorant définit les engagements mutuels et prévient les malentendus.",
  // P10 — Évaluation formative continue
  "Principe : L'évaluation du travail du doctorant doit être formative et continue, non seulement sommative lors des jalons institutionnels.",
];

// --- Critères de qualité applicables à chaque étape ---

export const CRITERES_QUALITE = {
  projetRecherche: [
    "Critère : La problématique doit formuler un écart de connaissance identifié et justifié par un argumentaire fondé sur les données existantes.",
    "Critère : Les questions de recherche doivent être claires, faisables, et délimitées — ni trop larges ni trop étroites.",
    "Critère : Le cadre théorique doit articuler de manière cohérente les concepts clés et montrer la pertinence épistémologique du positionnement.",
    "Critère : Le choix méthodologique doit être justifié en lien avec les questions de recherche et la nature des données attendues.",
    "Critère : La proposition de recherche doit démontrer une contribution originale potentielle au champ disciplinaire.",
  ],
  revueLitterature: [
    "Critère : La revue de littérature doit couvrir de manière systématique les travaux pertinents, sans omettre les courants contradictoires.",
    "Critère : Elle doit organiser les sources thématiquement ou chronologiquement, et non simplement les lister.",
    "Critère : Chaque source citée doit être évaluée critiqueent — ses forces, ses limites, sa pertinence pour la problématique.",
    "Critère : La revue doit identifier clairement le 'gap' (lacune) que la recherche proposée entend combler.",
    "Critère : La synthèse doit mener logiquement aux questions de recherche et au cadre conceptuel.",
  ],
  methodologie: [
    "Critère : Le design de recherche doit adresser toutes les variables identifiées dans les questions de recherche.",
    "Critère : Les outils de collecte de données doivent être validés ou en cours de validation, avec des considérations éthiques explicites.",
    "Critère : L'échantillon ou le terrain doit être justifié en termes de représentativité, d'accessibilité et de pertinence.",
    "Critère : La stratégie d'analyse doit être décrite avec suffisamment de détails pour être reproductible.",
    "Critère : Les limites méthodologiques doivent être anticipées et discutées de manière proactive.",
  ],
  redactionThese: [
    "Critère : Chaque chapitre doit avoir une cohérence interne — introduction, développement, conclusion partielle, transitions.",
    "Critère : L'argumentation doit progresser logiquement du général au particulier, puis du particulier au général (contribution).",
    "Critère : Les citations doivent être exactes, référencées selon les normes en vigueur, et intégrées au flux du texte (pas de 'dump' de citations).",
    "Critère : Le style doit être académique mais lisible — phrases claires, paragraphes structurés, jargon maîtrisé.",
    "Critère : La thèse doit démontrer une maîtrise systématique du champ et une capacité de synthèse critique et créative.",
  ],
  soutenance: [
    "Critère : La soutenance doit montrer que le doctorant maîtrise son sujet en profondeur et peut défendre ses choix face à des objections.",
    "Critère : Le discours de soutenance ne doit pas être une simple lecture de la thèse — il doit mettre en valeur la contribution et les implications.",
    "Critère : Le doctorant doit pouvoir situer son travail dans le champ plus large et articuler les perspectives de recherche futures.",
  ],
};

// --- Étapes de la supervision doctorale ---

export const ETAPES_SUPERVISION = [
  {
    nom: "Phase 1 — Immersion et cadrage",
    description: "Définir le sujet, les questions de recherche, le cadre théorique, et la proposition de recherche.",
    jalons: [
      "Constitution du comité de thèse (directeur + co-directeur)",
      "État de l'art exploratoire (20-30 références clés)",
      "Formulation provisoire de la problématique",
      "Rédaction du projet/proposition de recherche",
      "Validation institutionnelle (inscription doctorale / confirmation)",
    ],
    questionsDiagnostic: [
      "Le doctorant a-t-il clairement identifié l'écart de connaissance qu'il souhaite combler ?",
      "Les questions de recherche sont-elles assez précises pour guider un plan de travail ?",
      "Le cadre théorique est-il cohérent et pertinent pour les questions posées ?",
      "La proposition est-elle réaliste dans le temps et les ressources disponibles ?",
    ],
    pieges: [
      "Problème : Problématique trop large ou trop floue — le doctorant se perd dans l'immensité du sujet.",
      "Problème : Confusion entre le sujet d'intérêt personnel et une question de recherche académiquement valide.",
      "Problème : Tentative de tout lire avant d'écrire — le perfectionnisme paralyse l'avancement.",
    ],
  },
  {
    nom: "Phase 2 — Exploration et collecte",
    description: "Conduire la revue de littérature systématique, développer le design méthodologique, et collecter les données.",
    jalons: [
      "Revue de littérature systématique achevée",
      "Design méthodologique validé (protocole, outils, échantillon)",
      "Collecte de données terminée (ou avancée significative)",
      "Premiers résultats préliminaires analysés",
      "Présentation en séminaire interne ou conférence",
    ],
    questionsDiagnostic: [
      "La revue de littérature couvre-t-elle les principaux courants et les travaux récents ?",
      "Le design méthodologique est-il cohérent avec les questions de recherche ?",
      "Des problèmes éthiques ont-ils été identifiés et traités ?",
      "Le doctorant montre-t-il une autonomie croissante dans la conduite de sa recherche ?",
    ],
    pieges: [
      "Problème : Le doctorant accumule des données sans cadre d'analyse — collecte compulsive.",
      "Problème : Isolement croissant — le doctorant ne partage pas ses avancées et perd le contact avec la communauté.",
      "Problème : Rigidité méthodologique — refus d'adapter le design face aux réalités du terrain.",
    ],
  },
  {
    nom: "Phase 3 — Analyse et rédaction",
    description: "Analyser les résultats, structurer l'argumentation, et rédiger les chapitres de la thèse.",
    jalons: [
      "Analyse des données achevée avec résultats interprétés",
      "Plan détaillé de la thèse validé",
      "Rédaction d'au moins 2-3 chapitres en version avancée",
      "Retours du directeur sur les versions successives",
      "Communication en conférence (article soumis ou en préparation)",
    ],
    questionsDiagnostic: [
      "Les résultats répondent-ils aux questions de recherche initiales ?",
      "L'argumentation est-elle logique et cohérente d'un chapitre à l'autre ?",
      "Le doctorant parvient-il à synthétiser et interpréter, pas seulement décrire ?",
      "Le rythme de rédaction est-il soutenu et régulier ?",
    ],
    pieges: [
      "Problème : Le syndrome du 'dernier chapitre' — le doctorant ne termine jamais la rédaction.",
      "Problème : Difficulté à passer de la description à l'interprétation — les données parlent mais le doctorant ne les fait pas 'parler'.",
      "Problème : Anxiété de la page blanche — le doctorant se sent incapable de produire un texte 'assez bon'.",
    ],
  },
  {
    nom: "Phase 4 — Finalisation et soutenance",
    description: "Terminer la rédaction, réviser, préparer la soutenance, et gérer les corrections post-soutenance.",
    jalons: [
      "Manuscrit complet soumis pour examen",
      "Rapports d'évaluateurs reçus et intégrés",
      "Préparation du discours de soutenance",
      "Soutenance réussie",
      "Corrections post-soutenance et dépôt final",
    ],
    questionsDiagnostic: [
      "La thèse répond-elle aux critères d'originalité et de contribution exigés ?",
      "La présentation formelle (normes, bibliographie, annexes) est-elle conforme ?",
      "Le doctorant est-il prêt à défendre ses choix méthodologiques et théoriques ?",
      "Les corrections mineures/majeures ont-elles été planifiées dans un calendrier réaliste ?",
    ],
    pieges: [
      "Problème : Soumission prématurée — la thèse n'est pas encore au niveau doctoral.",
      "Problème : Retards dans la correction post-soutenance — le doctorant perd la motivation.",
      "Problème : Le doctorant n'arrive pas à se détacher de la thèse pour la soutenir avec du recul.",
    ],
  },
];

// --- Problèmes fréquents et interventions ---

export const PROBLEMES_FREQUENTS = [
  {
    probleme: "Ralentissement / blocage de l'avancement",
    signaux: [
      "Absence prolongée de production écrite",
      "Reports répétés des rendez-vous de supervision",
      "Détachement émotionnel du sujet de recherche",
      "Activités de substitution (enseignement, autres projets)",
    ],
    interventions: [
      "Reprendre contact avec bienveillance — ne pas culpabiliser",
      "Identifier la cause : doute intellectuel, problèmes personnels, surcharge, perfectionnisme",
      "Définir un micro-objectif réaliste pour la semaine suivante (par ex. : rédiger un paragraphe, lire un article)",
      "Revenir au 'pourquoi' : raviver le sens et la motivation initiale",
      "Envisager un calendrier de reprise progressif avec des jalons très courts",
    ],
  },
  {
    probleme: "Conflit dans la relation de supervision",
    signaux: [
      "Communication réduite au minimum",
      "Désaccord persistant sur la direction de la recherche",
      "Non-respect des engagements mutuels",
      "Évitement des réunions",
    ],
    interventions: [
      "Aborder le problème directement mais avec tact — faire un point honnête sur le fonctionnement",
      "Clarifier les attentes mutuelles et redéfinir le contrat psychologique",
      "Si nécessaire, impliquer un tiers (co-directeur, responsable doctoral) comme médiateur",
      "Ne pas laisser la situation se dégrader — les conflits non traités sont la première cause d'abandon",
    ],
  },
  {
    probleme: "Difficultés liées à la langue (L2)",
    signaux: [
      "Textes riches en contenu mais difficiles à lire",
      "Erreurs récurrentes de syntaxe ou de style académique",
      "Le doctorant hésite à écrire par peur du jugement linguistique",
      "Temps de rédaction excessivement long",
    ],
    interventions: [
      "Séparer le fond de la forme dans les retours — ne pas corriger toutes les erreurs grammaticales",
      "Encourager la rédaction comme processus itératif — 'écrire pour penser', pas 'penser pour écrire'",
      "Suggérer des ressources d'aide à la rédaction académique en français",
      "Valoriser les idées et le raisonnement avant la perfection linguistique",
      "Recommander un groupe de pairs pour la relecture mutuelle",
    ],
  },
  {
    probleme: "Problèmes de santé mentale / bien-être",
    signaux: [
      "Baisse significative de la motivation et de l'estime de soi",
      "Isolement social et professionnel",
      "Signes de stress chronique, anxiété ou dépression",
      "Absentéisme répété sans explication",
    ],
    interventions: [
      "Créer un espace de confiance pour que le doctorant puisse exprimer ses difficultés",
      "Orienter vers les services de soutien institutionnels (santé mentale, accompagnement)",
      "Adapter temporairement les objectifs et les délais",
      "Rappeler que le bien-être du doctorant prime sur le calendrier de la thèse",
      "Ne pas diagnostiquer ni traiter — orienter vers des professionnels",
    ],
  },
  {
    probleme: "Dérive du périmètre de recherche",
    signaux: [
      "Le sujet s'élargit constamment sans se recentrer",
      "Accumulation de données non exploitées",
      "Le doctorant explore des pistes séduisantes mais éloignées de la problématique",
      "Difficulté à 'tuer ses chéris' — refus d'abandonner des pistes non productives",
    ],
    interventions: [
      "Rappeler les questions de recherche initiales et évaluer si les nouvelles pistes y répondent",
      "Aider à prioriser : distinguer l'essentiel de l'accessoire",
      "Proposer de 'garder pour plus tard' les pistes intéressantes mais hors sujet",
      "Utiliser l'image du 'entonnoir' : du large vers le ciblé",
    ],
  },
  {
    probleme: "Syndrome de l'imposteur",
    signaux: [
      "Le doctorant minimise la valeur de ses propres résultats",
      "Comparaison défavorable systématique avec d'autres chercheurs",
      "Peur constante d'être 'démasqué' comme incompétent",
      "Reluctance à présenter ou publier ses travaux",
    ],
    interventions: [
      "Normaliser le sentiment — la plupart des doctorants l'éprouvent à un moment ou un autre",
      "Rappeler objectivement les réussites et les progrès accomplis",
      "Encourager la présentation en séminaire ou conférence pour confronter le travail au regard des pairs",
      "Faire valoir que la thèse n'est pas un chef-d'œuvre final mais un apprentissage de la recherche",
    ],
  },
];

// --- Questions diagnostiques par dimension ---

export const QUESTIONS_DIAGNOSTIC = {
  autonomie: [
    "Le doctorant prend-il des initiatives dans la recherche bibliographique et le choix de pistes ?",
    "Propose-t-il ses propres solutions face aux obstacles, ou attend-il que le superviseur lui dise quoi faire ?",
    "Est-il capable de critiquer la littérature existante de manière autonome ?",
    "Rédige-t-il sans demander systématiquement l'aval du superviseur sur chaque formulation ?",
  ],
  progressMethodologique: [
    "Le design de recherche est-il cohérent avec les questions posées ?",
    "Les outils de collecte sont-ils appropriés et validés ?",
    "La stratégie d'analyse est-elle claire et reproductible ?",
    "Les limites sont-elles identifiées et discutées de manière proactive ?",
  ],
  qualiteRedaction: [
    "L'argumentation est-elle logique et progressive d'un chapitre à l'autre ?",
    "Le style est-il académique, clair, et cohérent ?",
    "Les sources sont-elles bien intégrées au flux argumentatif ?",
    "La structure de chaque chapitre est-elle cohérente (intro, développement, conclusion partielle) ?",
  ],
  engagementPsychologique: [
    "Le doctorant manifeste-t-il de l'enthousiasme pour son sujet ?",
    "Se sent-il soutenu et entendu dans ses difficultés ?",
    "Le rythme de travail est-il régulier et durable ?",
    "Le doctorant a-t-il un équilibre raisonnable entre vie de recherche et vie personnelle ?",
  ],
};

// --- Checklists pour le superviseur ---

export const CHECKLIST_SUPERVISEUR = {
  debutDeThèse: [
    "Établir un accord écrit sur les attentes mutuelles (fréquence des rencontres, délais, modes de communication)",
    "Clarifier les rôles respectifs (directeur, co-directeur, doctorant)",
    "Vérifier que le sujet est suffisamment délimité et documenté",
    "S'assurer que le doctorant comprend les exigences institutionnelles de son programme",
    "Identifier les ressources disponibles (bibliothèque, soutien linguistique, services de santé)",
  ],
  rencontresRegulieres: [
    "Préparer un ordre du jour pour chaque rencontre",
    "Faire un point sur les actions depuis la dernière rencontre",
    "Donner un feedback écrit (ou au minimum résumé) des retours",
    "Définir des objectifs concrets pour la période suivante",
    "Vérifier le bien-être du doctorant — ne pas se limiter à l'aspect académique",
  ],
  phaseRedaction: [
    "Exiger des versions successives, pas un texte parfait du premier coup",
    "Séparer le feedback sur le fond (argumentation) et la forme (style, langue)",
    "Vérifier la cohérence d'ensemble du manuscrit, pas seulement les chapitres isolés",
    "Encourager la rédaction continue pendant la phase de recherche, pas seulement à la fin",
    "S'assurer que la bibliographie est complète et conforme aux normes",
  ],
  preparationSoutenance: [
    "S'assurer que le manuscrit est complet et conforme aux exigences institutionnelles",
    "Aider le doctorant à identifier les questions probables des rapporteurs",
    "Faire une simulation de soutenance si possible",
    "Préparer le doctorant à recevoir des critiques constructives",
    "Planifier le calendrier de corrections post-soutenance dès avant la soutenance",
  ],
};

// --- Questions à poser au doctorant selon le contexte ---

export const QUESTIONS_FACILITATRICES = {
  cadrage: [
    "Quel est précisément l'écart de connaissance que votre recherche entend combler ?",
    "Si vous deviez formuler votre contribution en une seule phrase, que diriez-vous ?",
    "Quels sont les 3-5 travaux les plus importants qui fondent votre cadre théorique, et pourquoi ?",
    "Comment votre problématique se distingue-t-elle de ce qui a déjà été fait dans le champ ?",
  ],
  methode: [
    "Pourquoi cette méthode plutôt qu'une autre pour répondre à vos questions ?",
    "Quels sont les risques principaux liés à votre design de recherche, et comment les atténuez-vous ?",
    "Comment avez-vousvalidé vos outils de collecte ?",
    "Que feriez-vous si vos hypothèses initiales n'étaient pas confirmées par les données ?",
  ],
  redaction: [
    "L'enchaînement logique de votre argumentation est-il clair pour vous ? Pouvez-vous le résumer oralement ?",
    "Chaque chapitre contribue-t-il de manière essentielle à votre démonstration globale ?",
    "Où se situe la contribution originale dans chaque chapitre ?",
    "Un lecteur non spécialiste de votre sous-domaine comprendrait-il votre introduction ?",
  ],
  motivation: [
    "Qu'est-ce qui vous passionne le plus dans votre recherche en ce moment ?",
    "Quels obstacles rencontrez-vous, et comment puis-je vous aider à les surmonter ?",
      "Comment gérez-vous votre temps entre recherche, enseignement et vie personnelle ?",
    "Vous sentez-vous intégré(e) dans la communauté de votre laboratoire ou département ?",
  ],
};

// --- Normes de rédaction académique (issues de Turabian, reformulées) ---

export const NORMES_REDACTION = {
  structureArgument: [
    "Règle : Chaque section doit répondre à une question que le lecteur se pose naturellement après la section précédente.",
    "Règle : L'introduction doit présenter le problème, la question, la démarche, et annoncer la structure — pas seulement le sujet.",
    "Règle : La conclusion doit répondre explicitement aux questions de recherche et ouvrir des perspectives — pas seulement résumer.",
  ],
  citationEtSources: [
    "Règle : Citer systématiquement toute idée empruntée — plagier même involontairement est une faute professionnelle.",
    "Règle : Privilégier les sources primaires et les publications récentes (sauf classique fondateur).",
    "Règle : Intégrer chaque citation dans l'argumentation — ne pas laisser les citations parler seules.",
    "Règle : Vérifier chaque référence bibliographique : une erreur de référence discrédite l'ensemble du travail.",
  ],
  styleAcademique: [
    "Règle : Privilégier la clarté à la complexité apparente — un style simple et précis est plus valorisé qu'un jargon opaque.",
    "Règle : Chaque paragraphe doit développer une seule idée principale, annoncée dans sa première phrase.",
    "Règle : Éviter les formulations trop absolues ('prouve', 'démontre') au profit de formulations nuancées ('suggère', 'tend à indiquer').",
    "Règle : Réviser en plusieurs passes — contenu, structure, style, puis forme (normes).",
  ],
};

// --- Rassemblement complet du corpus ---

export const SUPERVISION_CORPUS = {
  principes: PRINCIPES_SUPERVISION,
  criteres: CRITERES_QUALITE,
  etapes: ETAPES_SUPERVISION,
  problemes: PROBLEMES_FREQUENTS,
  questionsDiagnostic: QUESTIONS_DIAGNOSTIC,
  checklist: CHECKLIST_SUPERVISEUR,
  questionsFacilitatrices: QUESTIONS_FACILITATRICES,
  normesRedaction: NORMES_REDACTION,
};

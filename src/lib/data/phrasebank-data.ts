// ══════════════════════════════════════════════════════════════════════════════════
// Phrasier Académique — Base de données de phrases françaises pour la thèse
// Inspiré du Manchester Academic Phrasebank, adapté au contexte francophone
// ══════════════════════════════════════════════════════════════════════════════════

export type ThesisSection =
  | "introduction"
  | "revue-litterature"
  | "problematique"
  | "methodologie"
  | "resultats"
  | "discussion"
  | "conclusion";

export type PhraseFunction =
  | "ouvrir"          // Ouvrir une section ou un paragraphe
  | "argumenter"      // Présenter un argument ou une affirmation
  | "citer"           // Introduire une citation ou une référence
  | "nuancer"         // Exprimer des réserves, des limites
  | "transitionner"  // Enchaîner entre idées ou paragraphes
  | "conclure"        // Conclure une section ou résumer
  | "comparer"        // Comparer, contraster, opposer
  | "definir"         // Définir un concept ou un terme
  | "exemplifier"     // Donner un exemple
  | "structurer";     // Annoncer le plan ou l'organisation

export interface Phrase {
  id: string;
  text: string;
  section: ThesisSection;
  functions: PhraseFunction[];
  variant?: string;     // Ex : "formel", "neutre", "direct"
  example?: string;     // Contexte d'utilisation en une phrase
}

export const SECTION_LABELS: Record<ThesisSection, string> = {
  "introduction": "Introduction",
  "revue-litterature": "Revue de littérature",
  "problematique": "Problématique",
  "methodologie": "Méthodologie",
  "resultats": "Résultats",
  "discussion": "Discussion",
  "conclusion": "Conclusion",
};

export const FUNCTION_LABELS: Record<PhraseFunction, string> = {
  "ouvrir": "Ouvrir",
  "argumenter": "Argumenter",
  "citer": "Citer",
  "nuancer": "Nuancer",
  "transitionner": "Transitionner",
  "conclure": "Conclure",
  "comparer": "Comparer",
  "definir": "Définir",
  "exemplifier": "Exemplifier",
  "structurer": "Structurer",
};

export const FUNCTION_COLORS: Record<PhraseFunction, string> = {
  "ouvrir": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "argumenter": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "citer": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "nuancer": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "transitionner": "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  "conclure": "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  "comparer": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "definir": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  "exemplifier": "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  "structurer": "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
};

// ══════════════════════════════════════════════════════════════════════════════════
// PHRASES
// ══════════════════════════════════════════════════════════════════════════════════

export const PHRASES: Phrase[] = [
  // ────────────────────────────────────────────────────────────────────────
  // INTRODUCTION
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "int-ouvrir-1",
    text: "Ces dernières années, le domaine de {X} a connu un intérêt croissant de la part de la communauté scientifique.",
    section: "introduction",
    functions: ["ouvrir"],
    variant: "classique",
    example: "Ces dernières années, le domaine de l'urbanisme participatif a connu un intérêt croissant...",
  },
  {
    id: "int-ouvrir-2",
    text: "La question de {X} constitue un enjeu majeur dans le champ de {Y}.",
    section: "introduction",
    functions: ["ouvrir"],
    variant: "formel",
    example: "La question de la résilience urbaine constitue un enjeu majeur dans le champ de l'aménagement.",
  },
  {
    id: "int-ouvrir-3",
    text: "Malgré les avancées récentes, {X} demeure un problème insuffisamment exploré dans la littérature.",
    section: "introduction",
    functions: ["ouvrir"],
    variant: "classique",
  },
  {
    id: "int-ouvrir-4",
    text: "Le présent travail s'inscrit dans le prolongement des recherches menées par {Auteur(s)} sur {X}.",
    section: "introduction",
    functions: ["ouvrir", "citer"],
    variant: "formel",
  },
  {
    id: "int-structurer-1",
    text: "La présente thèse se propose d'examiner {X} à travers trois axes complémentaires : {A}, {B} et {C}.",
    section: "introduction",
    functions: ["structurer"],
    variant: "formel",
  },
  {
    id: "int-structurer-2",
    text: "L'objectif de cette recherche est double : d'une part {A}, d'autre part {B}.",
    section: "introduction",
    functions: ["structurer", "argumenter"],
    variant: "neutre",
  },
  {
    id: "int-argumenter-1",
    text: "L'importance de {X} est aujourd'hui largement reconnue, tant sur le plan théorique que pratique.",
    section: "introduction",
    functions: ["argumenter"],
    variant: "classique",
  },
  {
    id: "int-argumenter-2",
    text: "Si la question de {X} a fait l'objet de nombreuses études, elle n'a jamais été abordée sous l'angle de {Y}.",
    section: "introduction",
    functions: ["argumenter", "nuancer"],
    variant: "classique",
  },
  {
    id: "int-nuancer-1",
    text: "Toutefois, les résultats de ces travaux restent partiels et appellent une investigation plus approfondie.",
    section: "introduction",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "int-definir-1",
    text: "Dans le cadre de cette recherche, nous entendons par {X} l'ensemble des processus par lesquels {définition}.",
    section: "introduction",
    functions: ["definir"],
    variant: "formel",
  },
  {
    id: "int-exemplifier-1",
    text: "À titre illustratif, le cas de {X} permet de mettre en évidence les dynamiques à l'œuvre dans {Y}.",
    section: "introduction",
    functions: ["exemplifier"],
    variant: "neutre",
  },
  {
    id: "int-conclure-1",
    text: "En somme, cette recherche vise à combler une lacune identifiée dans la littérature concernant {X}.",
    section: "introduction",
    functions: ["conclure"],
    variant: "formel",
  },

  // ────────────────────────────────────────────────────────────────────────
  // REVUE DE LITTÉRATURE
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "rl-ouvrir-1",
    text: "Un nombre croissant d'auteurs se sont penchés sur la question de {X}.",
    section: "revue-litterature",
    functions: ["ouvrir"],
    variant: "neutre",
  },
  {
    id: "rl-ouvrir-2",
    text: "La littérature existante sur {X} peut être organisée autour de trois courants principaux.",
    section: "revue-litterature",
    functions: ["ouvrir", "structurer"],
    variant: "formel",
  },
  {
    id: "rl-ouvrir-3",
    text: "L'état de l'art en matière de {X} révèle une tension entre deux perspectives : {A} et {B}.",
    section: "revue-litterature",
    functions: ["ouvrir", "comparer"],
    variant: "classique",
  },
  {
    id: "rl-citer-1",
    text: "Comme le souligne {Auteur} ({année}), {X} constitue un facteur déterminant de {Y}.",
    section: "revue-litterature",
    functions: ["citer"],
    variant: "neutre",
  },
  {
    id: "rl-citer-2",
    text: "Dans leur étude pionnière, {Auteur(s)} ont démontré que {X}.",
    section: "revue-litterature",
    functions: ["citer"],
    variant: "neutre",
  },
  {
    id: "rl-citer-3",
    text: "Les travaux de {Auteur} ({année}) ont mis en évidence une corrélation significative entre {X} et {Y}.",
    section: "revue-litterature",
    functions: ["citer", "argumenter"],
    variant: "neutre",
  },
  {
    id: "rl-citer-4",
    text: "S'appuyant sur un cadre théorique élaboré par {Auteur}, {Auteur2} ({année}) montre que {X}.",
    section: "revue-litterature",
    functions: ["citer"],
    variant: "formel",
  },
  {
    id: "rl-citer-5",
    text: "Plusieurs études convergent vers l'idée selon laquelle {X} (voir notamment {Auteur1, année} ; {Auteur2, année}).",
    section: "revue-litterature",
    functions: ["citer", "argumenter"],
    variant: "formel",
  },
  {
    id: "rl-argumenter-1",
    text: "L'apport principal de ces travaux réside dans la mise en évidence de {X}.",
    section: "revue-litterature",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "rl-argumenter-2",
    text: "Ces résultats suggèrent fortement que {X} joue un rôle central dans {Y}.",
    section: "revue-litterature",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "rl-comparer-1",
    text: "À l'inverse de {Auteur}, qui défend la thèse de {X}, {Auteur2} avance que {Y}.",
    section: "revue-litterature",
    functions: ["comparer", "citer"],
    variant: "neutre",
  },
  {
    id: "rl-comparer-2",
    text: "Alors que les premières études insistaient sur {X}, les travaux plus récents mettent l'accent sur {Y}.",
    section: "revue-litterature",
    functions: ["comparer"],
    variant: "classique",
  },
  {
    id: "rl-comparer-3",
    text: "Contrairement à l'approche proposée par {Auteur}, notre cadre théorique se fonde sur {X}.",
    section: "revue-litterature",
    functions: ["comparer"],
    variant: "formel",
  },
  {
    id: "rl-nuancer-1",
    text: "Il convient toutefois de nuancer ces résultats, dans la mesure où {limitation}.",
    section: "revue-litterature",
    functions: ["nuancer"],
    variant: "formel",
  },
  {
    id: "rl-nuancer-2",
    text: "Ces travaux, bien que fondateurs, présentent certaines limites, notamment {X}.",
    section: "revue-litterature",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "rl-nuancer-3",
    text: "Si ces résultats sont encourageants, ils doivent être interprétés avec prudence en raison de {X}.",
    section: "revue-litterature",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "rl-transitionner-1",
    text: "Au-delà de ces contributions, il apparaît nécessaire de considérer {X} sous un angle complémentaire.",
    section: "revue-litterature",
    functions: ["transitionner"],
    variant: "formel",
  },
  {
    id: "rl-transitionner-2",
    text: "Fort de ce constat, nous examinons à présent la manière dont {X} a été appréhendé dans la littérature récente.",
    section: "revue-litterature",
    functions: ["transitionner"],
    variant: "formel",
  },
  {
    id: "rl-definir-1",
    text: "Le concept de {X}, tel que défini par {Auteur} ({année}), renvoie à {définition}.",
    section: "revue-litterature",
    functions: ["definir", "citer"],
    variant: "neutre",
  },
  {
    id: "rl-definir-2",
    text: "La notion de {X} a fait l'objet de multiples définitions. Nous retiendrons ici celle proposée par {Auteur} ({année}) : {définition}.",
    section: "revue-litterature",
    functions: ["definir", "citer"],
    variant: "formel",
  },
  {
    id: "rl-conclure-1",
    text: "En définitive, ce tour d'horizon met en évidence un manque de connaissances sur {X}, que la présente recherche se propose d'explorer.",
    section: "revue-litterature",
    functions: ["conclure"],
    variant: "formel",
  },
  {
    id: "rl-exemplifier-1",
    text: "Pour illustrer ce propos, on peut se référer à l'étude de {Auteur} ({année}), qui a analysé {X} dans le contexte de {Y}.",
    section: "revue-litterature",
    functions: ["exemplifier", "citer"],
    variant: "neutre",
  },

  // ────────────────────────────────────────────────────────────────────────
  // PROBLÉMATIQUE
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "pb-ouvrir-1",
    text: "La problématique qui sous-tend cette recherche peut être formulée ainsi : dans quelle mesure {question de recherche} ?",
    section: "problematique",
    functions: ["ouvrir"],
    variant: "formel",
  },
  {
    id: "pb-ouvrir-2",
    text: "Partant du constat établi précédemment, la question centrale qui se pose est la suivante : {question} ?",
    section: "problematique",
    functions: ["ouvrir"],
    variant: "formel",
  },
  {
    id: "pb-argumenter-1",
    text: "Cette interrogation est d'autant plus pertinente que {justification}.",
    section: "problematique",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "pb-argumenter-2",
    text: "L'hypothèse principale de cette recherche postule que {hypothèse}.",
    section: "problematique",
    functions: ["argumenter"],
    variant: "formel",
  },
  {
    id: "pb-argumenter-3",
    text: "Nous émettons l'hypothèse selon laquelle {X} aurait un effet {positif/négatif/significatif} sur {Y}.",
    section: "problematique",
    functions: ["argumenter"],
    variant: "formel",
  },
  {
    id: "pb-nuancer-1",
    text: "Cette hypothèse nécessite toutefois d'être mise à l'épreuve, en tenant compte des variables confondantes potentielles liées à {X}.",
    section: "problematique",
    functions: ["nuancer"],
    variant: "formel",
  },
  {
    id: "pb-structurer-1",
    text: "Pour répondre à cette question, nous avons décomposé la problématique en trois sous-questions : {A}, {B} et {C}.",
    section: "problematique",
    functions: ["structurer"],
    variant: "formel",
  },
  {
    id: "pb-definir-1",
    text: "On distingue ici entre {concept A}, qui renvoie à {définition A}, et {concept B}, qui désigne {définition B}.",
    section: "problematique",
    functions: ["definir", "comparer"],
    variant: "formel",
  },
  {
    id: "pb-conclure-1",
    text: "L'originalité de notre approche réside dans la combinaison inédite de {A} et {B} pour appréhender {X}.",
    section: "problematique",
    functions: ["conclure", "argumenter"],
    variant: "formel",
  },

  // ────────────────────────────────────────────────────────────────────────
  // MÉTHODOLOGIE
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "meth-ouvrir-1",
    text: "La méthodologie adoptée dans cette recherche s'inscrit dans une approche {qualitative/quantitative/mixte}.",
    section: "methodologie",
    functions: ["ouvrir"],
    variant: "neutre",
  },
  {
    id: "meth-ouvrir-2",
    text: "Le choix d'une démarche {qualitative/quantitative} se justifie par {justification}.",
    section: "methodologie",
    functions: ["ouvrir", "argumenter"],
    variant: "neutre",
  },
  {
    id: "meth-structurer-1",
    text: "Le dispositif méthodologique se décompose en trois étapes : {A}, {B} et {C}.",
    section: "methodologie",
    functions: ["structurer"],
    variant: "neutre",
  },
  {
    id: "meth-structurer-2",
    text: "La collecte de données a été conduite en deux phases : une phase exploratoire ({A}) suivie d'une phase confirmatoire ({B}).",
    section: "methodologie",
    functions: ["structurer"],
    variant: "formel",
  },
  {
    id: "meth-citer-1",
    text: "Nous avons repris le protocole proposé par {Auteur} ({année}), en l'adaptant au contexte de {X}.",
    section: "methodologie",
    functions: ["citer"],
    variant: "neutre",
  },
  {
    id: "meth-argumenter-1",
    text: "L'échantillon de {N} participants a été constitué selon une procédure d'échantillonnage {aléatoire/par convenance/théorique}.",
    section: "methodologie",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "meth-argumenter-2",
    text: "Les données ont été recueillies au moyen de {instrument} (voir Annexe {X}).",
    section: "methodologie",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "meth-argumenter-3",
    text: "L'analyse thématique a été conduite selon les six phases décrites par {Auteur} ({année}) : familiarisation, codage, génération de thèmes, révision, définition et rédaction.",
    section: "methodologie",
    functions: ["argumenter", "citer", "structurer"],
    variant: "formel",
  },
  {
    id: "meth-nuancer-1",
    text: "Il est important de noter que cette méthodologie comporte certaines limites, notamment {X}.",
    section: "methodologie",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "meth-nuancer-2",
    text: "Bien que le choix de {X} puisse être discuté, il se justifie par la nécessité de {justification}.",
    section: "methodologie",
    functions: ["nuancer"],
    variant: "formel",
  },
  {
    id: "meth-definir-1",
    text: "L'unité d'analyse retenue est {X}, définie comme {définition}.",
    section: "methodologie",
    functions: ["definir"],
    variant: "neutre",
  },
  {
    id: "meth-exemplifier-1",
    text: "À titre d'exemple, l'entretien semi-directif a été structuré autour de {N} thématiques principales (voir guide d'entretien en Annexe {X}).",
    section: "methodologie",
    functions: ["exemplifier"],
    variant: "neutre",
  },
  {
    id: "meth-transitionner-1",
    text: "Une fois les données collectées, nous avons procédé à {étape suivante}.",
    section: "methodologie",
    functions: ["transitionner"],
    variant: "neutre",
  },
  {
    id: "meth-conclure-1",
    text: "L'ensemble de ce dispositif méthodologique vise à garantir la validité et la fiabilité des résultats présentés ci-après.",
    section: "methodologie",
    functions: ["conclure"],
    variant: "formel",
  },

  // ────────────────────────────────────────────────────────────────────────
  // RÉSULTATS
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "res-ouvrir-1",
    text: "Les résultats de cette analyse mettent en évidence {X} tendances principales.",
    section: "resultats",
    functions: ["ouvrir", "structurer"],
    variant: "neutre",
  },
  {
    id: "res-ouvrir-2",
    text: "L'analyse des données recueillies permet de dégager trois constats majeurs.",
    section: "resultats",
    functions: ["ouvrir", "structurer"],
    variant: "classique",
  },
  {
    id: "res-argumenter-1",
    text: "Les données indiquent que {X} est significativement associé à {Y} (p < {valeur}).",
    section: "resultats",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "res-argumenter-2",
    text: "Comme l'illustre la figure {X}, on observe une {augmentation/diminution} de {Y} en fonction de {Z}.",
    section: "resultats",
    functions: ["argumenter", "exemplifier"],
    variant: "neutre",
  },
  {
    id: "res-argumenter-3",
    text: "Il ressort de cette analyse que {constat principal}.",
    section: "resultats",
    functions: ["argumenter"],
    variant: "classique",
  },
  {
    id: "res-argumenter-4",
    text: "Les entretiens révèlent que les participants perçoivent {X} comme {perception}.",
    section: "resultats",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "res-argumenter-5",
    text: "La régression linéaire montre que {X} explique {pourcentage}% de la variance de {Y} (R² = {valeur}).",
    section: "resultats",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "res-comparer-1",
    text: "En comparant les deux groupes, on constate que {différence}.",
    section: "resultats",
    functions: ["comparer"],
    variant: "neutre",
  },
  {
    id: "res-comparer-2",
    text: "Contrairement à nos attentes, les résultats ne montrent pas de différence significative entre {A} et {B}.",
    section: "resultats",
    functions: ["comparer", "nuancer"],
    variant: "neutre",
  },
  {
    id: "res-nuancer-1",
    text: "Ces résultats doivent être interprétés avec prudence, compte tenu de {limitation}.",
    section: "resultats",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "res-nuancer-2",
    text: "Il est à noter que {X} participants n'ont pas répondu à cette question, ce qui peut introduire un biais de non-réponse.",
    section: "resultats",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "res-transitionner-1",
    text: "Si l'on examine maintenant {deuxième aspect}, les données révèlent que {X}.",
    section: "resultats",
    functions: ["transitionner"],
    variant: "neutre",
  },
  {
    id: "res-transitionner-2",
    text: "Au-delà de ce premier constat, il convient de souligner que {X}.",
    section: "resultats",
    functions: ["transitionner"],
    variant: "classique",
  },
  {
    id: "res-exemplifier-1",
    text: "Le tableau {X} synthétise les principaux résultats obtenus pour chaque variable.",
    section: "resultats",
    functions: ["exemplifier"],
    variant: "neutre",
  },
  {
    id: "res-conclure-1",
    text: "En résumé, les résultats obtenus confirment partiellement l'hypothèse selon laquelle {X}.",
    section: "resultats",
    functions: ["conclure"],
    variant: "neutre",
  },

  // ────────────────────────────────────────────────────────────────────────
  // DISCUSSION
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "disc-ouvrir-1",
    text: "L'interprétation de ces résultats appelle plusieurs remarques.",
    section: "discussion",
    functions: ["ouvrir"],
    variant: "neutre",
  },
  {
    id: "disc-ouvrir-2",
    text: "Ces résultats sont cohérents avec ceux obtenus par {Auteur} ({année}), qui avait également observé {X}.",
    section: "discussion",
    functions: ["ouvrir", "citer"],
    variant: "neutre",
  },
  {
    id: "disc-citer-1",
    text: "Nos résultats corroborent ceux de {Auteur} ({année}) et viennent renforcer l'idée que {X}.",
    section: "discussion",
    functions: ["citer", "argumenter"],
    variant: "formel",
  },
  {
    id: "disc-citer-2",
    text: "À la différence de {Auteur} ({année}), qui ne trouvait aucun effet de {X}, nos données montrent que {Y}.",
    section: "discussion",
    functions: ["citer", "comparer"],
    variant: "neutre",
  },
  {
    id: "disc-argumenter-1",
    text: "Ces résultats suggèrent que {X} pourrait jouer un rôle médiateur dans la relation entre {A} et {B}.",
    section: "discussion",
    functions: ["argumenter"],
    variant: "formel",
  },
  {
    id: "disc-argumenter-2",
    text: "L'une des explications possibles de ce résultat réside dans {explication}.",
    section: "discussion",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "disc-argumenter-3",
    text: "Il est probable que {X} soit en partie imputable à {Y}, ce qui serait cohérent avec le cadre théorique de {Auteur}.",
    section: "discussion",
    functions: ["argumenter", "citer"],
    variant: "formel",
  },
  {
    id: "disc-comparer-1",
    text: "En mettant en perspective nos résultats avec ceux de la littérature, on observe une convergence autour de {X}.",
    section: "discussion",
    functions: ["comparer"],
    variant: "formel",
  },
  {
    id: "disc-comparer-2",
    text: "Toutefois, là où {Auteur} ({année}) observe {X}, nos données révèlent plutôt {Y}, ce qui pourrait s'expliquer par {raison}.",
    section: "discussion",
    functions: ["comparer", "nuancer"],
    variant: "formel",
  },
  {
    id: "disc-nuancer-1",
    text: "Ces résultats doivent être considérés à la lumière de certaines limites méthodologiques.",
    section: "discussion",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "disc-nuancer-2",
    text: "L'une des limites de cette étude réside dans {X}, ce qui restreint la généralisabilité des résultats.",
    section: "discussion",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "disc-nuancer-3",
    text: "Il n'est pas exclu que ces résultats soient influencés par {biais}, bien que nous ayons pris soin de {mesure de contrôle}.",
    section: "discussion",
    functions: ["nuancer"],
    variant: "formel",
  },
  {
    id: "disc-nuancer-4",
    text: "La taille de l'échantillon ({N}) constitue une limite à prendre en compte dans l'interprétation de ces résultats.",
    section: "discussion",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "disc-transitionner-1",
    text: "S'il est indéniable que {X}, il convient également de considérer {Y}.",
    section: "discussion",
    functions: ["transitionner"],
    variant: "formel",
  },
  {
    id: "disc-conclure-1",
    text: "Au total, les résultats de cette étude apportent un éclairage nouveau sur {X} et ouvrent des pistes de recherche prometteuses.",
    section: "discussion",
    functions: ["conclure"],
    variant: "formel",
  },
  {
    id: "disc-exemplifier-1",
    text: "Le cas de {X} illustre parfaitement la tension entre {A} et {B} mise en évidence dans nos résultats.",
    section: "discussion",
    functions: ["exemplifier"],
    variant: "neutre",
  },

  // ────────────────────────────────────────────────────────────────────────
  // CONCLUSION
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "conc-ouvrir-1",
    text: "En conclusion, cette recherche a permis de mettre en lumière {X}.",
    section: "conclusion",
    functions: ["ouvrir", "conclure"],
    variant: "classique",
  },
  {
    id: "conc-ouvrir-2",
    text: "Pour rappel, l'objectif de cette thèse était de {objectif}. Les résultats obtenus permettent de répondre à cette question.",
    section: "conclusion",
    functions: ["ouvrir", "conclure"],
    variant: "formel",
  },
  {
    id: "conc-argumenter-1",
    text: "Les principaux apports de cette recherche sont les suivants : {A}, {B} et {C}.",
    section: "conclusion",
    functions: ["argumenter", "structurer"],
    variant: "formel",
  },
  {
    id: "conc-argumenter-2",
    text: "Sur le plan théorique, cette thèse contribue à enrichir la compréhension de {X} en proposant {apport}.",
    section: "conclusion",
    functions: ["argumenter"],
    variant: "formel",
  },
  {
    id: "conc-argumenter-3",
    text: "Sur le plan pratique, les résultats de cette recherche offrent des pistes d'action pour {acteur/cible}.",
    section: "conclusion",
    functions: ["argumenter"],
    variant: "neutre",
  },
  {
    id: "conc-nuancer-1",
    text: "Néanmoins, cette recherche n'est pas exempte de limites, parmi lesquelles {X}.",
    section: "conclusion",
    functions: ["nuancer"],
    variant: "neutre",
  },
  {
    id: "conc-nuancer-2",
    text: "Certaines questions demeurent ouvertes et appellent des investigations complémentaires, notamment {X}.",
    section: "conclusion",
    functions: ["nuancer"],
    variant: "formel",
  },
  {
    id: "conc-structurer-1",
    text: "Les perspectives de recherche qui découlent de ce travail pourraient porter sur {A}, {B} et {C}.",
    section: "conclusion",
    functions: ["structurer"],
    variant: "formel",
  },
  {
    id: "conc-transitionner-1",
    text: "Au-delà des contributions immédiates, ce travail ouvre la voie à de nouvelles interrogations quant à {X}.",
    section: "conclusion",
    functions: ["transitionner"],
    variant: "formel",
  },
  {
    id: "conc-conclure-1",
    text: "En définitive, cette thèse montre que {X} et souligne la nécessité de {Y}.",
    section: "conclusion",
    functions: ["conclure"],
    variant: "formel",
  },
  {
    id: "conc-conclure-2",
    text: "Cette recherche, en abordant {X} sous un angle original, apporte une contribution significative au champ de {Y}.",
    section: "conclusion",
    functions: ["conclure", "argumenter"],
    variant: "formel",
  },
  {
    id: "conc-exemplifier-1",
    text: "À titre d'illustration des implications pratiques, on peut citer le cas de {X}, où {application}.",
    section: "conclusion",
    functions: ["exemplifier"],
    variant: "neutre",
  },
  {
    id: "conc-comparer-1",
    text: "Par rapport aux travaux antérieurs, notre approche se distingue par {différence principale}.",
    section: "conclusion",
    functions: ["comparer"],
    variant: "formel",
  },
];

// ══════════════════════════════════════════════════════════════════════════════════
// HELPER
// ══════════════════════════════════════════════════════════════════════════════════

export function getPhrasesForSection(section: ThesisSection): Phrase[] {
  return PHRASES.filter((p) => p.section === section);
}

export function getPhrasesForFunction(fn: PhraseFunction): Phrase[] {
  return PHRASES.filter((p) => p.functions.includes(fn));
}

export function searchPhrases(query: string): Phrase[] {
  const q = query.toLowerCase().trim();
  if (!q) return PHRASES;
  return PHRASES.filter(
    (p) =>
      p.text.toLowerCase().includes(q) ||
      (p.example && p.example.toLowerCase().includes(q))
  );
}

export function getPhraseStats() {
  const bySection: Record<string, number> = {};
  const byFunction: Record<string, number> = {};
  for (const p of PHRASES) {
    bySection[p.section] = (bySection[p.section] || 0) + 1;
    for (const fn of p.functions) {
      byFunction[fn] = (byFunction[fn] || 0) + 1;
    }
  }
  return { total: PHRASES.length, bySection, byFunction };
}

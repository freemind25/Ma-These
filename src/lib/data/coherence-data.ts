// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Coherence Check Data
// Truthmark-inspired coherence verification categories
// ═══════════════════════════════════════════════════════════════

export interface CoherenceCheck {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  example: string;
  severity: "critical" | "major" | "minor";
}

export interface CoherenceCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const COHERENCE_CATEGORIES: CoherenceCategory[] = [
  {
    id: "terminologique",
    label: "Coh\u00e9rence terminologique",
    description: "Un m\u00eame concept est d\u00e9sign\u00e9 par le m\u00eame terme dans toute la th\u00e8se",
    icon: "Type",
    color: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "argumentative",
    label: "Coh\u00e9rence argumentative",
    description: "Les affirmations sont soutenues par des preuves et ne se contredisent pas",
    icon: "Scale",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "numerique",
    label: "Coh\u00e9rence num\u00e9rique",
    description: "Les chiffres, pourcentages et donn\u00e9es statistiques sont coh\u00e9rents entre sections",
    icon: "Hash",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "intro-discussion",
    label: "Introduction \u2194 Discussion",
    description: "Chaque question/hypoth\u00e8se de l\u2019introduction re\u00e7oit une r\u00e9ponse dans la discussion",
    icon: "ArrowLeftRight",
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "referentielle",
    label: "Coh\u00e9rence r\u00e9f\u00e9rentielle",
    description: "Les r\u00e9f\u00e9rences bibliographiques sont interpr\u00e9t\u00e9es de mani\u00e8re coh\u00e9rente",
    icon: "BookMarked",
    color: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "structurelle",
    label: "Coh\u00e9rence structurelle",
    description: "L\u2019encha\u00eenement des chapitres suit une progression logique avec des transitions",
    icon: "Workflow",
    color: "text-orange-600 dark:text-orange-400",
  },
];

export const COHERENCE_CHECKS: CoherenceCheck[] = [
  // \u2500\u2500 Terminologique \u2500\u2500
  {
    id: "term-synonyme",
    label: "Synonymes non signal\u00e9s",
    description: "Un m\u00eame concept est appel\u00e9 par des noms diff\u00e9rents sans que la synonymie ne soit explicit\u00e9e",
    category: "terminologique",
    icon: "Type",
    example: "Utiliser \u00ab bien-\u00eatre au travail \u00bb puis \u00ab qualit\u00e9 de vie professionnelle \u00bb sans pr\u00e9ciser qu\u2019il s\u2019agit du m\u00eame concept",
    severity: "major",
  },
  {
    id: "term-definition",
    label: "D\u00e9finitions contradictoires",
    description: "Un terme est d\u00e9fini diff\u00e9remment selon les chapitres",
    category: "terminologique",
    icon: "Type",
    example: "D\u00e9finir \u00ab innovation \u00bb comme \u00ab cr\u00e9ation de produit neuf \u00bb au chap. 1, puis comme \u00ab am\u00e9lioration de processus \u00bb au chap. 3",
    severity: "critical",
  },
  {
    id: "term-abreviation",
    label: "Abr\u00e9viations non expliqu\u00e9es",
    description: "Une abr\u00e9viation est utilis\u00e9e sans avoir \u00e9t\u00e9 d\u00e9finie au pr\u00e9alable",
    category: "terminologique",
    icon: "Type",
    example: "Utiliser \u00ab RGPD \u00bb au chapitre 4 sans l\u2019avoir d\u00e9fini au chapitre 1",
    severity: "minor",
  },
  {
    id: "term-cadrage",
    label: "Glissement s\u00e9mantique",
    description: "Le sens d\u2019un terme \u00e9volue subtilement au fil de la th\u00e8se sans \u00eatre justifi\u00e9",
    category: "terminologique",
    icon: "Type",
    example: "\u00ab Participation \u00bb \u00e9volue de \u00ab prise de d\u00e9cision collective \u00bb vers \u00ab simple consultation \u00bb sans le signaler",
    severity: "major",
  },

  // \u2500\u2500 Argumentative \u2500\u2500
  {
    id: "arg-contradiction",
    label: "Contradiction interne",
    description: "Deux passages affirment des choses oppos\u00e9es sans que la nuance ne soit expliqu\u00e9e",
    category: "argumentative",
    icon: "Scale",
    example: "Affirmer que \u00ab l\u2019\u00e9chantillon est repr\u00e9sentatif \u00bb au chap. 2, puis admettre \u00ab les biais de s\u00e9lection limitent la g\u00e9n\u00e9ralisabilit\u00e9 \u00bb au chap. 5 sans concilier les deux",
    severity: "critical",
  },
  {
    id: "arg-preuve",
    label: "Affirmation non \u00e9tay\u00e9e",
    description: "Une assertion importante est pr\u00e9sent\u00e9e comme un fait sans r\u00e9f\u00e9rence ou preuve",
    category: "argumentative",
    icon: "Scale",
    example: "\u00ab La plupart des entreprises adoptent cette pratique \u00bb sans citer de source ni donn\u00e9e statistique",
    severity: "major",
  },
  {
    id: "arg-cause",
    label: "Confusion corr\u00e9lation/causalit\u00e9",
    description: "Une corr\u00e9lation observ\u00e9e est pr\u00e9sent\u00e9e comme une relation causale",
    category: "argumentative",
    icon: "Scale",
    example: "\u00ab L\u2019augmentation du CA est due \u00e0 la formation \u00bb alors que seule une corr\u00e9lation a \u00e9t\u00e9 mesur\u00e9e",
    severity: "critical",
  },
  {
    id: "arg-generalisation",
    label: "Sur-g\u00e9n\u00e9ralisation",
    description: "Une conclusion est \u00e9tendue au-del\u00e0 de ce que les donn\u00e9es permettent",
    category: "argumentative",
    icon: "Scale",
    example: "Conclusion tir\u00e9e d\u2019un \u00e9chantillon de 30 PME \u00e9tendue \u00e0 \u00ab l\u2019ensemble des organisations \u00bb",
    severity: "major",
  },

  // \u2500\u2500 Num\u00e9rique \u2500\u2500
  {
    id: "num-ecart",
    label: "Chiffres incoh\u00e9rents",
    description: "Le m\u00eame chiffre appara\u00eet avec des valeurs diff\u00e9rentes entre deux sections",
    category: "numerique",
    icon: "Hash",
    example: "\u00ab 250 r\u00e9pondants \u00bb dans la m\u00e9thodologie, \u00ab 248 \u00bb dans les r\u00e9sultats, \u00ab 252 \u00bb dans la discussion",
    severity: "critical",
  },
  {
    id: "num-pourcentage",
    label: "Pourcentages incompatibles",
    description: "Les pourcentages ne correspondent pas aux nombres absolus d\u00e9clar\u00e9s",
    category: "numerique",
    icon: "Hash",
    example: "\u00ab 60% des 200 r\u00e9pondants \u00bb (soit 120) mais le tableau indique 135",
    severity: "critical",
  },
  {
    id: "num-arrondi",
    label: "Erreurs d\u2019arrondi",
    description: "La somme des pourcentages ne fait pas 100% sans explication",
    category: "numerique",
    icon: "Hash",
    example: "\u00ab 35% + 40% + 20% = 95% \u00bb sans mention des non-r\u00e9ponses ou arrondis",
    severity: "minor",
  },
  {
    id: "num-temporel",
    label: "Incoh\u00e9rence temporelle",
    description: "Les dates ou p\u00e9riodes mentionn\u00e9es sont incompatibles",
    category: "numerique",
    icon: "Hash",
    example: "\u00ab L\u2019enqu\u00eate s\u2019est d\u00e9roul\u00e9e de janvier \u00e0 mars 2023 \u00bb mais un tableau mentionne des donn\u00e9es d\u2019avril 2023",
    severity: "major",
  },

  // \u2500\u2500 Introduction \u2194 Discussion \u2500\u2500
  {
    id: "id-question-orpheline",
    label: "Question de recherche orpheline",
    description: "Une question formul\u00e9e dans l\u2019introduction n\u2019est pas trait\u00e9e dans la discussion",
    category: "intro-discussion",
    icon: "ArrowLeftRight",
    example: "La question Q3 sur les freins institutionnels n\u2019est jamais abord\u00e9e dans les r\u00e9sultats ni la discussion",
    severity: "critical",
  },
  {
    id: "id-hypothese-non-testee",
    label: "Hypoth\u00e8se non test\u00e9e",
    description: "Une hypoth\u00e8se formul\u00e9e n\u2019est pas v\u00e9rifi\u00e9e empiriquement",
    category: "intro-discussion",
    icon: "ArrowLeftRight",
    example: "H2 pr\u00e9dit un effet mod\u00e9rateur mais aucun test d\u2019interaction n\u2019est rapport\u00e9",
    severity: "critical",
  },
  {
    id: "id-resultat-orphelin",
    label: "R\u00e9sultat orphelin",
    description: "Un r\u00e9sultat discut\u00e9 ne correspond \u00e0 aucune question/hypoth\u00e8se de l\u2019introduction",
    category: "intro-discussion",
    icon: "ArrowLeftRight",
    example: "La discussion mentionne un effet inattendu sur la variable X qui ne figure pas dans le cadrage initial",
    severity: "minor",
  },
  {
    id: "id-entonnoir",
    label: "Structure en entonnoir invers\u00e9",
    description: "La discussion doit aller du sp\u00e9cifique vers le g\u00e9n\u00e9ral, pas l\u2019inverse",
    category: "intro-discussion",
    icon: "ArrowLeftRight",
    example: "Commencer la discussion par les implications th\u00e9oriques avant d\u2019avoir pr\u00e9sent\u00e9 les r\u00e9sultats",
    severity: "major",
  },

  // \u2500\u2500 R\u00e9f\u00e9rentielle \u2500\u2500
  {
    id: "ref-interpretation",
    label: "Interpr\u00e9tation contradictoire d\u2019une r\u00e9f\u00e9rence",
    description: "Un m\u00eame auteur ou article est cit\u00e9 avec des interpr\u00e9tations oppos\u00e9es",
    category: "referentielle",
    icon: "BookMarked",
    example: "Smith (2019) est pr\u00e9sent\u00e9 comme favorable \u00e0 X au chap. 1, mais comme critique de X au chap. 4",
    severity: "critical",
  },
  {
    id: "ref-citation-fantome",
    label: "Citation fant\u00f4me",
    description: "Une id\u00e9e est attribu\u00e9e \u00e0 un auteur sans que la r\u00e9f\u00e9rence ne figure dans la bibliographie",
    category: "referentielle",
    icon: "BookMarked",
    example: "\u00ab Selon Durand (2021)... \u00bb mais Durand (2021) n\u2019est pas dans la liste de r\u00e9f\u00e9rences",
    severity: "major",
  },
  {
    id: "ref-contexte",
    label: "Hors contexte",
    description: "Une r\u00e9f\u00e9rence est utilis\u00e9e dans un contexte qui ne correspond pas \u00e0 son contenu r\u00e9el",
    category: "referentielle",
    icon: "BookMarked",
    example: "Citer une \u00e9tude sur le secteur industriel pour appuyer une conclusion sur le secteur des services",
    severity: "major",
  },

  // \u2500\u2500 Structurelle \u2500\u2500
  {
    id: "struct-transition",
    label: "Transitions absentes",
    description: "Un chapitre commence sans lien avec le pr\u00e9c\u00e9dent, cr\u00e9ant une rupture logique",
    category: "structurelle",
    icon: "Workflow",
    example: "Le chapitre 3 passe de la revue de litt\u00e9rature aux r\u00e9sultats sans transition ni annonce de plan",
    severity: "major",
  },
  {
    id: "struct-annonce",
    label: "Annonces non tenues",
    description: "Le plan annonc\u00e9 dans l\u2019introduction ne correspond pas au plan r\u00e9el de la th\u00e8se",
    category: "structurelle",
    icon: "Workflow",
    example: "\u00ab Nous aborderons en trois parties : X, Y, Z \u00bb mais la th\u00e8se a 4 parties : X, Y, Z, W",
    severity: "critical",
  },
  {
    id: "struct-repetition",
    label: "Redondance inter-chapitres",
    description: "Un m\u00eame contenu est repris quasiment \u00e0 l\u2019identique dans deux chapitres diff\u00e9rents",
    category: "structurelle",
    icon: "Workflow",
    example: "Le cadre th\u00e9orique de Dubois est pr\u00e9sent\u00e9 en d\u00e9tail au chap. 1 ET au chap. 2 avec les m\u00eames citations",
    severity: "major",
  },
  {
    id: "struct-conclusion-boucle",
    label: "Conclusion non boucl\u00e9e",
    description: "La conclusion ne reprend pas les questions de recherche et n\u2019y r\u00e9pond pas explicitement",
    category: "structurelle",
    icon: "Workflow",
    example: "La conclusion pr\u00e9sente des perspectives sans rappeler les r\u00e9sultats ni r\u00e9pondre aux hypoth\u00e8ses",
    severity: "major",
  },
];

export function getChecksByCategory(categoryId: string): CoherenceCheck[] {
  return COHERENCE_CHECKS.filter((c) => c.category === categoryId);
}

export function getCategoryById(id: string): CoherenceCategory | undefined {
  return COHERENCE_CATEGORIES.find((c) => c.id === id);
}

export function getSeverityWeight(severity: CoherenceCheck["severity"]): number {
  switch (severity) {
    case "critical": return 3;
    case "major": return 2;
    case "minor": return 1;
  }
}

export interface CoherencePairSection {
  id: string;
  label: string;
  placeholder: string;
  description: string;
}

export const PAIR_SECTIONS: CoherencePairSection[] = [
  {
    id: "introduction",
    label: "Introduction",
    placeholder: "Collez le texte de votre introduction (questions de recherche, hypoth\u00e8ses, annonce du plan)...",
    description: "Les questions de recherche, hypoth\u00e8ses et l\u2019annonce du plan",
  },
  {
    id: "discussion",
    label: "Discussion",
    placeholder: "Collez le texte de votre discussion (r\u00e9ponses aux hypoth\u00e8ses, interpr\u00e9tation)...",
    description: "Les r\u00e9ponses aux questions, l\u2019interpr\u00e9tation des r\u00e9sultats, les implications",
  },
  {
    id: "conclusion",
    label: "Conclusion",
    placeholder: "Collez le texte de votre conclusion (rappel des r\u00e9sultats, perspectives)...",
    description: "Le rappel synth\u00e9tique, les r\u00e9ponses finales et les ouvertures",
  },
  {
    id: "methodologie",
    label: "M\u00e9thodologie",
    placeholder: "Collez le texte de votre m\u00e9thodologie (design, \u00e9chantillon, outils)...",
    description: "Le design de recherche, l\u2019\u00e9chantillon, les instruments de collecte",
  },
  {
    id: "resultats",
    label: "R\u00e9sultats",
    placeholder: "Collez le texte de vos r\u00e9sultats (analyses, tableaux, statistiques)...",
    description: "Les analyses statistiques, les tableaux de r\u00e9sultats, les effets observ\u00e9s",
  },
];

export const ANALYSIS_MODES = [
  {
    id: "global",
    label: "Analyse globale",
    description: "V\u00e9rifie la coh\u00e9rence de l\u2019ensemble du texte soumis en une seule passe",
    icon: "ScanSearch",
    minSections: 1,
    requiredSections: [],
  },
  {
    id: "intro-discussion",
    label: "Introduction \u2194 Discussion",
    description: "V\u00e9rifie que chaque question/hypoth\u00e8se de l\u2019intro est trait\u00e9e dans la discussion",
    icon: "ArrowLeftRight",
    minSections: 2,
    requiredSections: ["introduction", "discussion"],
  },
  {
    id: "methodo-resultats",
    label: "M\u00e9thodologie \u2194 R\u00e9sultats",
    description: "V\u00e9rifie l\u2019alignement entre les m\u00e9thodes annonc\u00e9es et les r\u00e9sultats pr\u00e9sent\u00e9s",
    icon: "GitCompareArrows",
    minSections: 2,
    requiredSections: ["methodologie", "resultats"],
  },
  {
    id: "trio-complet",
    label: "Analyse trio (Intro + R\u00e9sultats + Discussion)",
    description: "V\u00e9rification crois\u00e9e entre les trois sections cl\u00e9s de la th\u00e8se",
    icon: "TriangleAlert",
    minSections: 3,
    requiredSections: ["introduction", "resultats", "discussion"],
  },
];

// ════════════════════════════════════════════════════════════════════════════════════════════
// Cadrage préalable du projet de thèse — Field Definitions (§4.1–§4.13)
// MaTh-se · ThesisFrame
// ════════════════════════════════════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────────────────────────────────

export type CadrageFieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "json"
  | "system";

export interface CadrageSubField {
  key: string;
  label: string;
  type: CadrageFieldType;
  required: boolean;
  description: string;
  placeholder: string;
  promptAmorce: string;
  options?: string[];
  gardeFou?: string;
}

export interface CadrageField {
  key: string;
  label: string;
  section: number;
  type: CadrageFieldType;
  required: boolean;
  description: string;
  placeholder: string;
  promptAmorce: string;
  options?: string[];
  subFields?: CadrageSubField[];
  gardeFou?: string;
}

// ── Option labels (for UI display) ─────────────────────────────────────────────────────────

export const TYPE_RECHERCHE_LABELS: Record<string, string> = {
  quantitative: "Quantitative",
  qualitative: "Qualitative",
  mixte: "Mixte (quali-quanti)",
  recherche_projet: "Recherche-projet / Recherche-action",
};

export const TYPE_REVUE_LABELS: Record<string, string> = {
  narrative: "Narrative",
  systematique: "Systématique",
  scoping: "Scoping review",
  thematique: "Thématique",
  meta_synthese: "Méta-synthèse",
};

export const TYPE_THESE_LABELS: Record<string, string> = {
  classique: "Classique (monographie)",
  par_articles: "Par articles",
  par_theme: "Par thèmes",
  format_specifique: "Format spécifique",
};

export const METHODES_COLLECTE_LABELS: Record<string, string> = {
  entretiens: "Entretiens (semi-directifs, directifs, non directifs)",
  corpus_documentaire: "Corpus documentaire",
  releves_terrain: "Relevés de terrain",
  enquete: "Enquête",
  etude_de_cas: "Étude de cas",
  analyse_morphologique: "Analyse morphologique",
  SIG: "SIG (Système d'information géographique)",
  observation_participante: "Observation participante",
  questionnaire: "Questionnaire",
  analyse_de_donnees_existantes: "Analyse de données existantes",
};

export const STATUT_VALIDATION_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  en_revision: "En révision",
  valide: "Validé",
  rejete: "Rejeté",
};

// ── Field Definitions ─────────────────────────────────────────────────────────────────────

export const CADRAGE_FIELDS: CadrageField[] = [
  // ── §4.1 Thématique générale ──────────────────────────────────────────────────────────
  {
    key: "thematique_generale",
    label: "Thématique générale",
    section: 4.1,
    type: "textarea",
    required: true,
    description:
      "Le domaine large dans lequel s'inscrit la thèse (ex. : patrimoine architectural, mobilité urbaine, paysage et aménagement).",
    placeholder:
      "Ex. : La transformation des centres-villes historiques face aux enjeux de mobilité durable en Europe.",
    promptAmorce:
      "Quel est le grand domaine ou la thématique principale de votre projet de thèse ?",
    gardeFou:
      "Restreindre la thématique à un domaine disciplinaire identifié (architecture, urbanisme, patrimoine, paysage, mobilité, etc.). Ne pas émettre de jugement de valeur.",
  },

  // ── §4.2 Problématique ───────────────────────────────────────────────────────────────
  {
    key: "problematique",
    label: "Problématique",
    section: 4.2,
    type: "textarea",
    required: true,
    description:
      "L'énoncé du problème scientifique, social ou professionnel qui justifie la recherche, formulé en une ou deux phrases.",
    placeholder:
      "Ex. : Comment les villes intermédiaires peuvent-elles concilier préservation du patrimoine bâti et adaptation aux nouvelles mobilités ?",
    promptAmorce:
      "Quel problème scientifique ou pratique votre thèse cherche-t-elle à résoudre ? Formulez-le en une question ouverte.",
    gardeFou:
      "La problématique doit être distincte des questions de recherche. Elle exprime une TENSION ou un PARADOXE, pas une simple liste de thèmes. Utiliser un ton hypothétique : 'Une problématique possible serait…'",
  },

  // ── §4.3 Question(s) de recherche ───────────────────────────────────────────────────
  {
    key: "questions_recherche",
    label: "Question(s) de recherche",
    section: 4.3,
    type: "json",
    required: true,
    description:
      "La ou les questions opérationnelles que la thèse se propose de répondre. JSON : { principal: string, secondaires: string[] }.",
    placeholder: '{"principal": "…", "secondaires": ["…", "…"]}',
    promptAmorce:
      "Quelle est la question principale de votre recherche, et quelles sous-questions opérationnelles en découlent ?",
    gardeFou:
      "Distinguer impérativement la problématique (le problème) des questions de recherche (les questions opérationnelles). Chaque question doit être ouverte, vérifiable et délimitée. Maximum 1 question principale + 3–5 secondaires. Ton hypothétique obligatoire.",
  },

  // ── §4.4 Objectifs ──────────────────────────────────────────────────────────────────
  {
    key: "objectifs",
    label: "Objectifs",
    section: 4.4,
    type: "json",
    required: true,
    description:
      "Objectif général et objectifs spécifiques de la thèse. JSON : { general: string, specifiques: string[] }.",
    placeholder: '{"general": "…", "specifiques": ["…", "…", "…"]}',
    promptAmorce:
      "Quel est l'objectif principal de votre thèse, et quels sous-objectifs spécifiques permettent de l'atteindre ?",
    gardeFou:
      "Les objectifs doivent être COHÉRENTS avec les questions de recherche : chaque question devrait trouver un objectif correspondant. Formuler avec des verbes d'action (analyser, évaluer, caractériser, proposer…). Maximum 1 général + 3–6 spécifiques. Ton hypothétique.",
  },

  // ── §4.5 Hypothèses ─────────────────────────────────────────────────────────────────
  {
    key: "hypotheses",
    label: "Hypothèses",
    section: 4.5,
    type: "json",
    required: false,
    description:
      "Hypothèses de recherche formulées comme réponses anticipées aux questions. Tableau de strings. Optionnel pour les recherches purement qualitatives ou exploratoires.",
    placeholder: '["Hypothèse 1 : …", "Hypothèse 2 : …"]',
    promptAmorce:
      "Quelles hypothèses de recherche pouvez-vous formuler ? Si votre approche est exploratoire, indiquez-le explicitement.",
    gardeFou:
      "Les hypothèses doivent être VÉRIFIABLES et en lien direct avec les questions de recherche. Ne pas formuler d'hypothèses si la démarche est purement exploratoire ou inductive (qualitative). Dans ce cas, retourner un tableau vide [] et l'expliquer en remarque. Ton hypothétique obligatoire ('Il pourrait être supposé que…').",
  },

  // ── §4.6 Type de recherche ──────────────────────────────────────────────────────────
  {
    key: "type_recherche",
    label: "Type de recherche",
    section: 4.6,
    type: "select",
    required: true,
    description:
      "Le paradigme épistémologique dominant de la thèse : quantitative, qualitative, mixte ou recherche-projet.",
    placeholder: "Sélectionnez le type de recherche…",
    promptAmorce:
      "Votre démarche s'inscrit-elle dans un paradigme quantitatif, qualitatif, mixte ou de type recherche-projet ?",
    options: ["quantitative", "qualitative", "mixte", "recherche_projet"],
    subFields: [
      {
        key: "justification_type_recherche",
        label: "Justification du type de recherche",
        type: "textarea",
        required: true,
        description:
          "Pourquoi ce type de recherche est-il le plus adapté à votre objet d'étude ?",
        placeholder:
          "Ex. : Le paradigme qualitatif est privilégié car l'objet d'étude porte sur des représentations et des pratiques sociales qui nécessitent une approche compréhensive…",
        promptAmorce:
          "Pourquoi avez-vous choisi ce type de recherche plutôt qu'un autre ? Qu'est-ce qui justifie ce choix au regard de votre objet ?",
        gardeFou:
          "La justification doit être en lien avec l'objet d'étude et la problématique, pas avec les préférences personnelles du candidat. Éviter les justifications génériques.",
      },
    ],
    gardeFou:
      "Ne pas présupposer le type de recherche : le déduire des indices contenus dans le pitch (vocabulaire, objets mentionnés, méthodes évoquées). Si ambiguïté, proposer le type le plus probable avec réserve.",
  },

  // ── §4.7 Méthodologie envisagée ─────────────────────────────────────────────────────
  {
    key: "methodologie",
    label: "Méthodologie envisagée",
    section: 4.7,
    type: "json",
    required: true,
    description:
      "Ensemble des choix méthodologiques : méthodes de collecte, unité d'analyse, terrain/corpus, et limites anticipées.",
    placeholder:
      '{"methodes_collecte": ["…"], "unite_analyse": "…", "justification_unite_analyse": "…", "terrain_corpus": "…", "limites_anticipees": "…"}',
    promptAmorce:
      "Quelles méthodes de collecte envisagez-vous ? Quelle est votre unité d'analyse et sur quel terrain ou corpus travaillerez-vous ?",
    subFields: [
      {
        key: "methodes_collecte",
        label: "Méthodes de collecte",
        type: "multiselect",
        required: true,
        description:
          "Les méthodes de collecte de données prévues. Plusieurs choix possibles.",
        placeholder: "Sélectionnez une ou plusieurs méthodes…",
        promptAmorce:
          "Quelles sont les méthodes de collecte de données que vous prévoyez d'utiliser ?",
        options: [
          "entretiens",
          "corpus_documentaire",
          "releves_terrain",
          "enquete",
          "etude_de_cas",
          "analyse_morphologique",
          "SIG",
          "observation_participante",
          "questionnaire",
          "analyse_de_donnees_existantes",
        ],
        gardeFou:
          "Les méthodes de collecte doivent être cohérentes avec le type de recherche (§4.6) et les objectifs (§4.4). Ne pas proposer de méthode qui nécessiterait des ressources irréalistes pour un doctorat.",
      },
      {
        key: "unite_analyse",
        label: "Unité d'analyse",
        type: "textarea",
        required: true,
        description:
          "L'entité ou le phénomène élémentaire qui sera analysé (ex. : un bâtiment, un quartier, un plan d'urbanisme, un discours d'acteur).",
        placeholder:
          "Ex. : Les plans d'occupation et d'utilisation des sols (POS/PLU) de villes moyennes françaises entre 2000 et 2020.",
        promptAmorce:
          "Quelle est l'unité d'analyse principale de votre recherche — c'est-à-dire ce que vous allez concrètement analyser ?",
        gardeFou:
          "L'unité d'analyse doit être précise et observable. Éviter les unités trop larges ('la ville') ou trop vagues ('le patrimoine'). Privilégier une formulation délimitée dans l'espace et/ou le temps.",
      },
      {
        key: "justification_unite_analyse",
        label: "Justification de l'unité d'analyse",
        type: "textarea",
        required: true,
        description:
          "Pourquoi cette unité d'analyse est-elle pertinente au regard de la problématique et des objectifs ?",
        placeholder:
          "Ex. : Les PLU constituent un terrain d'analyse pertinent car ils matérialisent les choix politiques d'aménagement et permettent une comparaison inter-ville…",
        promptAmorce:
          "Pourquoi avoir choisi cette unité d'analyse plutôt qu'une autre ? Quel lien avec votre problématique ?",
        gardeFou:
          "La justification doit faire le pont entre l'unité d'analyse et la problématique. Pas de justification circulaire (ex. 'on analyse les PLU parce qu'on étudie les PLU').",
      },
      {
        key: "terrain_corpus",
        label: "Terrain ou corpus",
        type: "textarea",
        required: true,
        description:
          "Description du terrain d'étude ou du corpus de données (localisation, période, périmètre, taille estimée).",
        placeholder:
          "Ex. : Corpus de 15 PLU de villes de 20 000 à 50 000 habitants dans les régions Auvergne-Rhône-Alpes et Provence-Alpes-Côte d'Azur.",
        promptAmorce:
          "Sur quel terrain géographique ou quel corpus documentaire précis portera votre analyse ?",
        gardeFou:
          "Le terrain ou le corpus doit être délimité avec suffisamment de précision pour être opérationnel. Ne pas rester au niveau d'un pays ou d'un continent sans plus de détail.",
      },
      {
        key: "limites_anticipees",
        label: "Limites anticipées",
        type: "textarea",
        required: true,
        description:
          "Les limites méthodologiques, temporelles ou matérielles prévisibles de la recherche.",
        placeholder:
          "Ex. : La taille du corpus restreinte à 15 PLU ne permet pas une généralisation statistique. La période étudiée (2000-2020) exclut les réformes les plus récentes…",
        promptAmorce:
          "Quelles sont les limites principales que vous anticipez pour votre recherche (méthodologiques, temporelles, matérielles) ?",
        gardeFou:
          "Les limites doivent être honnêtes et réalistes. Ne pas transformer des faiblesses en forces. Ne pas omettre de mentionner les limites évidentes (taille d'échantillon, accessibilité des données, etc.).",
      },
    ],
    gardeFou:
      "La méthodologie doit être COHÉRENTE avec le type de recherche (§4.6) et les objectifs (§4.4). Ne pas proposer une méthodologie quantitative pour une recherche qualitative et inversement.",
  },

  // ── §4.8 Type de revue de littérature ───────────────────────────────────────────────
  {
    key: "type_revue_litterature",
    label: "Type de revue de littérature",
    section: 4.8,
    type: "select",
    required: true,
    description:
      "La forme de la revue de littérature prévue : narrative, systématique, scoping, thématique ou méta-synthèse.",
    placeholder: "Sélectionnez le type de revue…",
    promptAmorce:
      "Sous quelle forme envisagez-vous de conduire votre revue de littérature ?",
    options: ["narrative", "systematique", "scoping", "thematique", "meta_synthese"],
    subFields: [
      {
        key: "justification_type_revue",
        label: "Justification du type de revue",
        type: "textarea",
        required: true,
        description:
          "Pourquoi ce type de revue de littérature est-il le plus pertinent pour votre sujet ?",
        placeholder:
          "Ex. : Une revue systématique est privilégiée car le champ est bien délimité et bénéficie d'une littérature abondante permettant une sélection selon des critères explicites…",
        promptAmorce:
          "Pourquoi avoir choisi ce type de revue de littérature plutôt qu'un autre ?",
        gardeFou:
          "La justification doit reposer sur la nature du champ littéraire (mature vs émergent) et les objectifs de la revue (cartographier vs évaluer vs synthétiser). Éviter les justifications vagues.",
      },
    ],
    gardeFou:
      "Le type de revue doit être cohérent avec le stade de maturité du champ (émergent → narrative/scoping ; mature → systématique). Ne pas proposer une revue systématique pour un champ sans littérature suffisante.",
  },

  // ── §4.9 Cadre théorique / conceptuel ───────────────────────────────────────────────
  {
    key: "cadre_theorique",
    label: "Cadre théorique / conceptuel",
    section: 4.9,
    type: "textarea",
    required: false,
    description:
      "Les cadres théoriques ou conceptuels mobilisés. Seuls les cadres EXPLICITEMENT mentionnés par le candidat dans le pitch peuvent être repris.",
    placeholder:
      "Ex. : La théorie de la production du cadre bâti de Jean-Paul Bord (1998) et les concepts de résilience urbaine et de transition.",
    promptAmorce:
      "Quels cadres théoriques ou concepts clés mobilisez-vous pour structurer votre réflexion ?",
    gardeFou:
      "Ne JAMAIS inventer de noms d'auteurs, de théories ou de références bibliographiques précises. Ne citer que ce que le candidat a explicitement mentionné. Si le pitch ne mentionne aucun cadre, proposer des FAMILLES de cadres (ex. 'les approches en termes de résilience') sans nommer d'auteur spécifique. Ton hypothétique.",
  },

  // ── §4.10 Mots-clés ─────────────────────────────────────────────────────────────────
  {
    key: "mots_cles",
    label: "Mots-clés",
    section: 4.10,
    type: "json",
    required: false,
    description:
      "Mots-clés disciplinaires (termes académiques reconnus) et mots-clés spécifiques au projet. JSON : { disciplinaires: string[], specifiques_projet: string[] }.",
    placeholder:
      '{"disciplinaires": ["urbanisme", "patrimoine"], "specifiques_projet": ["ville intermédiaire", "mobilité douce"]}',
    promptAmorce:
      "Quels mots-clés disciplinaires et mots-clés spécifiques à votre projet utiliseriez-vous pour une recherche bibliographique ?",
    gardeFou:
      "Les mots-clés disciplinaires doivent être des termes académiques reconnus dans le domaine. Les mots-clés spécifiques doivent être des combinaisons ou néologismes propres au projet. Maximum 5–8 disciplinaires + 5–8 spécifiques.",
  },

  // ── §4.11 Contribution attendue / originalité ───────────────────────────────────────
  {
    key: "contribution_originalite",
    label: "Contribution attendue / originalité",
    section: 4.11,
    type: "textarea",
    required: true,
    description:
      "L'apport original attendu de la thèse par rapport à l'état de l'art : gap identifié, nouveauté méthodologique, terrain inédit, etc.",
    placeholder:
      "Ex. : Cette thèse contribuerait à combler le manque d'études comparées sur l'adaptation du patrimoine bâti aux enjeux de mobilité dans les villes intermédiaires françaises.",
    promptAmorce:
      "En quoi votre recherche serait-elle originale par rapport à ce qui existe déjà dans le domaine ?",
    gardeFou:
      "L'originalité doit être ARGUMENTÉE, pas simplement affirmée. Identifier un gap précis (lacune théorique, terrain non étudié, méthode non appliquée, etc.). Ne pas exagérer l'originalité. Ton hypothétique ('Une contribution possible serait…').",
  },

  // ── §4.12 Type de thèse ─────────────────────────────────────────────────────────────
  {
    key: "type_these",
    label: "Type de thèse",
    section: 4.12,
    type: "select",
    required: false,
    description:
      "Le format de la thèse : classique (monographie), par articles, par thèmes, ou format spécifique.",
    placeholder: "Sélectionnez le format de thèse…",
    promptAmorce:
      "Sous quel format envisagez-vous de rédiger votre thèse ?",
    options: ["classique", "par_articles", "par_theme", "format_specifique"],
    gardeFou:
      "Le type de thèse dépend souvent des règles de l'école doctorale et du laboratoire. Ne pas présupposer. Si le pitch ne mentionne rien, laisser vide et poser la question d'amorce.",
  },

  // ── §4.13 Statut de validation ──────────────────────────────────────────────────────
  {
    key: "statut_validation",
    label: "Statut de validation",
    section: 4.13,
    type: "system",
    required: false,
    description:
      "Statut de validation du cadrage (brouillon, en révision, validé, rejeté). Ce champ est géré automatiquement par le système et n'est pas éditable directement par l'utilisateur.",
    placeholder: "",
    promptAmorce: "",
    options: ["brouillon", "en_revision", "valide", "rejete"],
    gardeFou:
      "Ce champ est géré automatiquement. Ne jamais le générer via l'IA. Il est mis à jour par les actions utilisateur (soumettre, valider, rejeter).",
  },
];

// ── Convenience maps ───────────────────────────────────────────────────────────────────────

export const CADRAGE_FIELDS_MAP: Record<string, CadrageField> =
  CADRAGE_FIELDS.reduce<Record<string, CadrageField>>((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {});

// ── Sections (ordered) ─────────────────────────────────────────────────────────────────────

export const CADRAGE_SECTIONS = [
  { number: 4.1, title: "Thématique générale", fieldKey: "thematique_generale" },
  { number: 4.2, title: "Problématique", fieldKey: "problematique" },
  { number: 4.3, title: "Question(s) de recherche", fieldKey: "questions_recherche" },
  { number: 4.4, title: "Objectifs", fieldKey: "objectifs" },
  { number: 4.5, title: "Hypothèses", fieldKey: "hypotheses" },
  { number: 4.6, title: "Type de recherche", fieldKey: "type_recherche" },
  { number: 4.7, title: "Méthodologie envisagée", fieldKey: "methodologie" },
  { number: 4.8, title: "Type de revue de littérature", fieldKey: "type_revue_litterature" },
  { number: 4.9, title: "Cadre théorique / conceptuel", fieldKey: "cadre_theorique" },
  { number: 4.10, title: "Mots-clés", fieldKey: "mots_cles" },
  { number: 4.11, title: "Contribution attendue / originalité", fieldKey: "contribution_originalite" },
  { number: 4.12, title: "Type de thèse", fieldKey: "type_these" },
  { number: 4.13, title: "Statut de validation", fieldKey: "statut_validation" },
] as const;

// ── Helper: user-editable fields (excludes system fields) ─────────────────────────────────

export const CADRAGE_USER_FIELDS = CADRAGE_FIELDS.filter(
  (f) => f.type !== "system"
);

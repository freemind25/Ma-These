/**
 * Guide complet de rédaction de thèse
 * Conseils pratiques et actionnables extraits de 5 ouvrages de référence en rédaction académique.
 *
 * Sources :
 *   1. Turabian, K.L. (2018). A Manual for Writers of Research Papers, Theses, and Dissertations (9e éd.). University of Chicago Press.
 *   2. Murray, R. (2017). Writing for Academic Success (2e éd.). SAGE Publications.
 *   3. Graustein, G. (1930). The Fundamentals of Academic Writing. Harvard University Press.
 *   4. Paltridge, B. & Starfield, S. (2020). Thesis and Dissertation Writing in a Second Language (2e éd.). Routledge.
 *   5. Brause, D. (2000). Write Your Dissertation in Fifteen Minutes a Day. Owl Books.
 *
 * Convention : tout le contenu textuel est en français ; les noms d'interface,
 * clés et structure de code sont en anglais.
 */

// ─── Interfaces ───────────────────────────────────────────────────

/** Métadonnées d'une source bibliographique */
export interface WritingSource {
  id: string
  author: string
  year: number
  title: string
  publisher: string
  focusAreas: string[]
}

/** Conseil par phase de rédaction */
export interface WritingPhase {
  id: string
  phase: string
  icon: string
  description: string
  tips: string[]
  checkpoints: string[]
  sourceIds: string[]
}

/** Conseil de structuration (macro-organisation) */
export interface StructureTip {
  id: string
  topic: string
  icon: string
  principle: string
  actionableSteps: string[]
  example: string
  sourceIds: string[]
}

/** Conseil d'argumentation et de persuasion */
export interface ArgumentationTip {
  id: string
  strategy: string
  icon: string
  description: string
  howTo: string[]
  trap: string
  sourceIds: string[]
}

/** Conseil de style académique et mécanique du texte */
export interface StyleTip {
  id: string
  domain: string
  icon: string
  principle: string
  rules: string[]
  wrongRight: { wrong: string; right: string }[]
  sourceIds: string[]
}

/** Conseil de révision et d'amélioration */
export interface RevisionTip {
  id: string
  stage: string
  icon: string
  description: string
  actions: string[]
  tool: string
  sourceIds: string[]
}

/** Conseil de productivité et gestion du processus */
export interface ProductivityTip {
  id: string
  theme: string
  icon: string
  principle: string
  steps: string[]
  frequency: string
  sourceIds: string[]
}

/** Erreur fréquente à éviter */
export interface PitfallEntry {
  id: string
  pitfall: string
  icon: string
  consequence: string
  fix: string
  sourceIds: string[]
}

/** Conseil spécifique à la revue de littérature */
export interface LiteratureTip {
  id: string
  topic: string
  icon: string
  principle: string
  steps: string[]
  avoid: string[]
  sourceIds: string[]
}

/** Patron rhétorique (moves) pour les sections clés */
export interface RhetoricalMove {
  id: string
  section: string
  icon: string
  move: string
  function: string
  linguisticMarkers: string[]
  example: string
  sourceIds: string[]
}

/** Conseil de présentation visuelle et mise en page */
export interface PresentationTip {
  id: string
  topic: string
  icon: string
  principle: string
  rules: string[]
  sourceIds: string[]
}

// ─── Sources bibliographiques ────────────────────────────────────
export const writingSources: WritingSource[] = [
  {
    id: 'turabian',
    author: 'Kate L. Turabian',
    year: 2018,
    title: 'A Manual for Writers of Research Papers, Theses, and Dissertations',
    publisher: 'University of Chicago Press',
    focusAreas: [
      'Structure et organisation du manuscrit',
      'Citations et références',
      'Normes de présentation',
      'Argumentation logique',
      'Méthodologie de recherche',
    ],
  },
  {
    id: 'murray',
    author: 'Rowena Murray',
    year: 2017,
    title: 'Writing for Academic Success',
    publisher: 'SAGE Publications',
    focusAreas: [
      'Gestion du temps d\'écriture',
      'Stratégies de rédaction productive',
      'Surmonter le syndrome de la page blanche',
      'Feedback et révision',
      'Habitudes d\'écriture',
    ],
  },
  {
    id: 'graustein',
    author: 'Carl Graustein',
    year: 1930,
    title: 'The Fundamentals of Academic Writing',
    publisher: 'Harvard University Press',
    focusAreas: [
      'Clarté et simplicité du style',
      'Structure du paragraphe',
      'Logique de l\'argumentation',
      'Économie de langage',
      'Transition entre les idées',
    ],
  },
  {
    id: 'paltridge-starfield',
    author: 'Brian Paltridge & Sue Starfield',
    year: 2020,
    title: 'Thesis and Dissertation Writing in a Second Language',
    publisher: 'Routledge',
    focusAreas: [
      'Analyse des genres académiques',
      'Structures rhétoriques (moves)',
      'Langage académique (phraséologie)',
      'Voix et positionnement de l\'auteur',
      'Écriture en L2',
    ],
  },
  {
    id: 'brause',
    author: 'Diana Brause',
    year: 2000,
    title: 'Write Your Dissertation in Fifteen Minutes a Day',
    publisher: 'Owl Books',
    focusAreas: [
      'Micro-sessions d\'écriture quotidienne',
      'Psychologie de l\'écrivain',
      'Gestion de l\'angoisse de la page blanche',
      'Routines d\'écriture',
      'Fragmentation des tâches',
    ],
  },
]

// ─── Phases de rédaction ──────────────────────────────────────────
export const writingPhases: WritingPhase[] = [
  {
    id: 'exploration',
    phase: 'Phase d\'exploration',
    icon: 'Compass',
    description: 'Lecture extensive, prise de notes, repérage des thématiques et construction du cadre conceptuel avant d\'écrire le premier mot.',
    tips: [
      'Lisez 15 articles clés de votre domaine et résumez chacun en 3 phrases (contexte, méthode, apport)',
      'Créez un tableau comparatif des principaux auteurs : théorie, méthodes, résultats, limites',
      'Notez chaque idée ou citation pertinente avec la référence complète immédiatement — ne comptez pas sur votre mémoire',
      'Identifiez les « research gaps » en notant systématiquement ce que chaque article ne couvre pas',
      'Construisez votre cadre conceptuel sous forme de schéma (concepts reliés par des flèches) avant de rédiger',
      'Rédigez un « one-pager » de votre thèse en 200 mots : sujet, question, méthode, apport attendu',
    ],
    checkpoints: [
      'Question de recherche formulée en une seule phrase claire',
      'Cadre théorique identifié avec 5-10 concepts clés définis',
      'Au moins 20 références pertinentes répertoriées dans le gestionnaire',
      'Research gap explicité et justifié',
      'Design de recherche choisi et justifié',
    ],
    sourceIds: ['turabian', 'murray', 'paltridge-starfield'],
  },
  {
    id: 'planning',
    phase: 'Phase de planification',
    icon: 'ListTree',
    description: 'Architecture détaillée du manuscrit : plan par chapitre, par section, par paragraphe avec estimation de mots.',
    tips: [
      'Faites un plan hiérarchique à 3 niveaux : chapitre → section → sous-section avec titres provisoires pour chaque niveau',
      'Attribuez un nombre cible de mots à chaque chapitre (ex. : Intro 5 000, Revue 25 000, Méthodo 10 000, Résultats 20 000, Discussion 10 000, Conclusion 3 000)',
      'Pour chaque section, écrivez en une phrase le message clé que le lecteur doit retenir',
      'Identifiez les figures et tableaux nécessaires par chapitre et créez des emplacements « [FIGURE X] » dans le plan',
      'Vérifiez la cohérence logique : chaque chapitre doit permettre le suivant (cause → effet, ou question → réponse)',
      'Partagez le plan détaillé avec votre directeur AVANT de rédiger — une révision de plan coûte 1 heure, une révision de texte coûte 10 jours',
    ],
    checkpoints: [
      'Plan détaillé approuvé par le directeur de thèse',
      'Nombre de mots cible total défini (200-300 pages typiquement)',
      'Enchaînement logique vérifié entre les chapitres',
      'Liste des figures/tableaux établie',
    ],
    sourceIds: ['turabian', 'murray'],
  },
  {
    id: 'drafting',
    phase: 'Phase de rédaction du premier jet',
    icon: 'PenLine',
    description: 'Production du premier jet sans autocensure : l\'objectif est d\'avoir du texte, pas du texte parfait.',
    tips: [
      'Rédigez les chapitres méthodologiques et résultats EN PREMIER — ce sont les plus factuels et les plus faciles à démarrer',
      'Laissez l\'introduction et la conclusion pour la FIN — elles nécessitent de connaître tout le contenu',
      'Appliquez la règle « le premier jet n\'est jamais pour le lecteur » : écrivez vite, corrigez plus tard',
      'Commencez chaque session de rédaction par un paragraphe sur lequel vous vous êtes arrêté la veille — cela relance le flux',
      'Si vous bloquez sur une section, écrivez « [À COMPLÉTER : expliquer X] » et passez à la section suivante — revenez-y plus tard',
      'Gardez un document « brouillons et notes » séparé pour y jeter vos idées informelles sans polluer le manuscrit',
    ],
    checkpoints: [
      'Premier jet complet (même imparfait) de chaque chapitre',
      'Aucune section ne reste vide ou en « TODO »',
      'Toutes les données et analyses sont intégrées dans le texte',
    ],
    sourceIds: ['brause', 'murray', 'graustein'],
  },
  {
    id: 'revision',
    phase: 'Phase de révision et de raffinement',
    icon: 'Eraser',
    description: 'Rework systématique du texte : clarification, suppression du superflu, renforcement de l\'argumentation.',
    tips: [
      'Révisez en 3 passes distinctes : (1) structure et logique, (2) style et clarté, (3) orthographe et format — jamais en même temps',
      'Lisez votre texte à voix haute — les phrases trop longues ou mal rythmées sautent immédiatement aux oreilles',
      'Pour chaque paragraphe, vérifiez qu\'une seule idée principale est traitée — sinon, scindez-le',
      'Supprimez 10-15 % du texte du premier jet : les répétitions, les transitions inutiles, les phrases décoratives',
      'Vérifiez que chaque affirmation non évidente est suivie d\'une référence ou d\'une preuve — « selon X (2020)… »',
      'Faites relire par un pair (pas nécessairement de votre domaine) pour tester la lisibilité générale',
    ],
    checkpoints: [
      'Révision structurelle terminée (enchaînement logique vérifié)',
      'Révision stylistique terminée (clarté, concision)',
      'Relecture externe effectuée et retours intégrés',
      'Format et normes respectés (citations, marges, police)',
    ],
    sourceIds: ['turabian', 'murray', 'paltridge-starfield'],
  },
  {
    id: 'finalization',
    phase: 'Phase de finalisation',
    icon: 'CheckCircle2',
    description: 'Derniers ajustements, vérification des normes institutionnelles, préparation de la soumission.',
    tips: [
      'Vérifiez le respect des normes de l\'école doctorale (format, marges, police, interligne, pagination)',
      'Relisez systématiquement la page de titre, le résumé et les mots-clés — ce sont les éléments les plus consultés',
      'Assurez-vous que la bibliographie est complète : chaque citation dans le texte a une entrée biblio, et vice-versa',
      'Testez tous les liens hypertextiques (si version numérique), toutes les renvois de figures/tableaux',
      'Vérifiez la cohérence de la numérotation (chapitres, figures, tableaux, équations)',
      'Préparez les annexes, l\'index des termes (si requis) et les remerciements en dernier',
    ],
    checkpoints: [
      'Normes institutionnelles respectées point par point',
      'Bibliographie cohérente et complète',
      'Tous les renvois internes vérifiés (fig., tab., §)',
      'Version finale sauvegardée en 3 formats (PDF, DOCX, cloud)',
    ],
    sourceIds: ['turabian'],
  },
]

// ─── Conseils de structuration ────────────────────────────────────
export const structureTips: StructureTip[] = [
  {
    id: 'str-skeleton',
    topic: 'Le squelette de la thèse',
    icon: 'LayoutGrid',
    principle: 'Une thèse se construit comme une argumentation progressive : chaque chapitre pose une question que le suivant répond.',
    actionableSteps: [
      'Dessinez le « story arc » de votre thèse en 6 blocs : contexte → théorie → méthode → résultats → interprétation → conclusion',
      'Vérifiez que chaque chapitre commence par un « chapitre précédent a montré X, ce chapitre va montrer Y »',
      'Assurez-vous que le chapitre de conclusion revient sur CHAQUE objectif formulé dans l\'introduction',
      'Limitez-vous à 4-6 chapitres hors front/back matter — au-delà, le fil conducteur se perd',
    ],
    example: 'Chap. 1 (Contexte) pose la question. Chap. 2 (Théorie) donne les outils conceptuels. Chap. 3 (Méthodo) explique comment répondre. Chap. 4-5 (Résultats+Discussion) apportent la réponse. Chap. 6 (Conclusion) synthétise.',
    sourceIds: ['turabian', 'paltridge-starfield'],
  },
  {
    id: 'str-paragraph',
    topic: 'L\'art du paragraphe',
    icon: 'AlignLeft',
    principle: 'Un paragraphe = une idée. Il suit une structure microscopique : affirmer → démontrer → conclure.',
    actionableSteps: [
      'Commencez chaque paragraphe par une phrase-topic qui résume l\'idée principale en une seule phrase',
      'Développez avec 3-5 phrases d\'explication, preuve ou exemple',
      'Terminez par une phrase de transition vers le paragraphe suivant ou une sous-conclusion',
      'Si un paragraphe dépasse 250 mots, demandez-vous s\'il contient deux idées — scindez-le',
      'Supprimez les phrases-topic vides (« Dans cette section, nous allons discuter de… ») — entrez directement dans le vif du sujet',
    ],
    example: 'Topic sentence : « L\'approche mixte offre une triangulation des résultats (Creswell, 2018). » → Preuves : données quantitatives croisées avec entretiens. → Conclusion/transition : « Cette triangulation renforce la validité des résultats, ce qui justifie son emploi dans notre étude. »',
    sourceIds: ['graustein', 'turabian'],
  },
  {
    id: 'str-chapter-arc',
    topic: 'L\'arc narratif du chapitre',
    icon: 'GitBranch',
    principle: 'Chaque chapitre est un mini-ouvrage avec sa propre introduction, son développement et sa conclusion partielle.',
    actionableSteps: [
      'Ouvrez chaque chapitre par un court paragraphe qui annonce ce que le chapitre va traiter et pourquoi',
      'Fermez chaque chapitre par un paragraphe de synthèse qui résume l\'apport et annonce le chapitre suivant',
      'Utilisez des sous-titres explicites (pas « Analyse » mais « Analyse des déterminants socio-économiques »)',
      'Vérifiez que le lecteur peut comprendre un chapitre isolément sans avoir lu les précédents en détail',
      'Placez un « fil d\'Ariane » en début de chapitre : un rappel en 2-3 phrases de où on en est dans la thèse',
    ],
    example: 'Début de chapitre : « Le chapitre précédent a établi le cadre théorique de l\'analyse institutionnelle. Ce chapitre présente la méthodologie adoptée pour tester les hypothèses formulées. »',
    sourceIds: ['turabian', 'paltridge-starfield'],
  },
  {
    id: 'str-intro-funnel',
    topic: 'L\'entonnoir de l\'introduction',
    icon: 'Funnel',
    principle: 'L\'introduction va du général au spécifique en 4 étapes : contexte → problématique → objectifs → plan.',
    actionableSteps: [
      'Paragraphe 1-2 : amenez le contexte large (le domaine, l\'importance du sujet) avec des données factuelles',
      'Paragraphe 3-4 : resserrez vers la problématique spécifique en identifiant le research gap',
      'Paragraphe 5 : formulez les objectifs et hypothèses de recherche clairement (bulletpoints possibles)',
      'Dernier paragraphe : annoncez l\'organisation du manuscrit, chapitre par chapitre',
      'Longueur cible : 10-15 pages (3 000-5 000 mots) — pas plus, sinon c\'est une revue de littérature déguisée',
    ],
    example: '« La transition énergétique est un défi majeur du XXIe siècle [contexte large]. Toutefois, les mécanismes d\'adoption des technologies renouvelables par les PME restent mal compris [gap]. Cette thèse vise à… [objectifs]. Le manuscrit s\'organise en six chapitres… [plan]. »',
    sourceIds: ['turabian', 'paltridge-starfield'],
  },
  {
    id: 'str-conclusion-mirror',
    topic: 'Le miroir de la conclusion',
    icon: 'Copy',
    principle: 'La conclusion est le reflet inversé de l\'introduction : elle part du spécifique (résultats) pour revenir au général (implications).',
    actionableSteps: [
      'Rappelez la problématique et les objectifs en 2-3 phrases (sans répéter l\'intro mot à mot)',
      'Résumez les principaux résultats chapitre par chapitre — pas de nouveaux chiffres',
      'Répondez explicitement à la question de recherche formulée en introduction',
      'Dégagez la contribution scientifique en 2-3 phrases percutantes',
      'Ouvrez sur des perspectives de recherche future (1 paragraphe max)',
      'Longueur cible : 5-8 pages (1 500-3 000 mots) — plus court que l\'introduction',
    ],
    example: '« Cette thèse avait pour objectif de [rappel]. Les résultats montrent que [synthèse]. En réponse à la problématique, [réponse directe]. La contribution principale est [apport]. Des pistes futures incluent [ouverture]. »',
    sourceIds: ['turabian', 'graustein'],
  },
  {
    id: 'str-balance',
    topic: 'L\'équilibre des chapitres',
    icon: 'Scale',
    principle: 'Une thèse déséquilibrée signale un manque de maturité — la revue de littérature ne doit pas écraser les résultats.',
    actionableSteps: [
      'Viser cette répartition indicative : Intro 8 %, Revue 25 %, Méthodo 12 %, Résultats 30 %, Discussion 18 %, Conclusion 7 %',
      'Si votre revue de littérature dépasse 35 % du manuscrit, c\'est un signe que vous n\'avez pas assez de résultats',
      'Si vos résultats occupent moins de 25 %, vérifiez que vous n\'êtes pas en train de rédiger un « essai théorique » au lieu d\'une thèse empirique',
      'Demandez à votre directeur de valider la répartition en pages avant la rédaction finale',
      'Utilisez un tableur pour suivre le nombre de mots par chapitre en temps réel',
    ],
    example: 'Pour une thèse de 80 000 mots : Intro ≈ 6 400, Revue ≈ 20 000, Méthodo ≈ 9 600, Résultats ≈ 24 000, Discussion ≈ 14 400, Conclusion ≈ 5 600.',
    sourceIds: ['turabian', 'murray'],
  },
]

// ─── Conseils d'argumentation ─────────────────────────────────────
export const argumentationTips: ArgumentationTip[] = [
  {
    id: 'arg-claim-evidence',
    strategy: 'Affirmation soutenue par preuve',
    icon: 'ShieldCheck',
    description: 'Chaque affirmation non triviale doit être immédiatement suivie d\'une preuve empirique, d\'une référence ou d\'un raisonnement logique.',
    howTo: [
      'Rédigez un premier jet où vous affichez toutes vos affirmations',
      'Relisez et pour chaque affirmation, posez la question : « Qu\'est-ce qui justifie cela ? »',
      'Insérez la preuve (citation, donnée, exemple) immédiatement après l\'affirmation',
      'Si aucune preuve n\'est disponible, reformulez en opinion prudente (« Il semble que… », « On peut supposer que… »)',
    ],
    trap: 'Enchaîner les affirmations non justifiées — le jury perçoit cela comme un manque de rigueur scientifique.',
    sourceIds: ['turabian', 'graustein'],
  },
  {
    id: 'arg-counterarguments',
    strategy: 'Anticiper et réfuter les objections',
    icon: 'Swords',
    description: 'Un argument fort n\'ignore pas les objections — il les reconnaît et y répond de manière convaincante.',
    howTo: [
      'Pour chaque argument principal, listez mentalement 2 objections possibles',
      'Accordez 1-2 phrases à l\'objection : « Certains auteurs soutiennent que… (Dupont, 2019) »',
      'Réfutez immédiatement : « Toutefois, cette position néglige le fait que… » ou « Si cette objection est recevable dans le cas X, elle ne s\'applique pas ici car… »',
      'Intégrez cette technique surtout dans la Discussion et dans la revue de littérature',
    ],
    trap: 'Présenter uniquement les arguments favorables à votre hypothèse — cela signale un biais de confirmation.',
    sourceIds: ['turabian', 'graustein'],
  },
  {
    id: 'arg-signposting',
    strategy: 'Signalisation du cheminement argumentatif',
    icon: 'SignpostBig',
    description: 'Guider le lecteur explicitement à travers votre raisonnement avec des marqueurs de progression.',
    howTo: [
      'En début de section : « Cette section examine… dans le but de… »',
      'Entre les étapes : « Après avoir analysé X, il convient désormais d\'aborder Y »',
      'En fin de section : « Comme nous venons de le montrer, … ce qui nous amène à… »',
      'Évitez cependant les formulations trop lourdes : « Il est important de noter que… » → supprimez et entrez directement dans le contenu',
      'Utilisez un registre de modulation : « d\'une part… d\'autre part… », « non seulement… mais aussi… », « en revanche… »',
    ],
    trap: 'Abuser des marqueurs au point de rendre le texte artificiel — alternez entre signalisation explicite et transitions naturelles.',
    sourceIds: ['paltridge-starfield', 'turabian'],
  },
  {
    id: 'arg-hedging',
    strategy: 'L\'art de la nuance (hedging)',
    icon: 'Feather',
    description: 'Moduler vos affirmations selon le niveau de certitude — ne jamais présenter une interprétation comme un fait établi.',
    howTo: [
      'Certitude forte : « Les résultats montrent clairement que… », « Il est établi que… »',
      'Certitude modérée : « Ces données suggèrent que… », « Il semble que… », « Les résultats tendent à indiquer… »',
      'Certitude faible : « Une hypothèse plausible est que… », « On peut supposer que… »',
      'N\'utilisez JAMAIS de termes absolus (« prouve », « démontre », « toujours ») sauf si les preuves sont irréfutables',
      'Préférez « contribue à expliquer » à « explique » ; « est associé à » à « cause de »',
    ],
    trap: 'Être trop timide (« on pourrait peut-être éventuellement penser que… ») — le jury doutera de votre confiance dans vos résultats.',
    sourceIds: ['paltridge-starfield', 'graustein'],
  },
  {
    id: 'arg-synthesis',
    strategy: 'Synthétiser plutôt que juxtaposer',
    icon: 'Layers',
    description: 'La revue de littérature ne doit pas être une succession de résumés d\'articles — elle doit créer un dialogue entre les sources.',
    howTo: [
      'Regroupez les articles par thème, pas par auteur — « Trois courants s\'opposent sur cette question… »',
      'Mettez les auteurs en dialogue : « Alors que X (2018) soutient…, Y (2020) avance au contraire que… »',
      'Identifiez les convergences et les contradictions entre les études',
      'Concluez chaque sous-thème par un bilan : « En somme, la littérature met en évidence… mais laisse ouverte la question de… »',
      'Terminez la revue par un tableau de synthèse qui croise auteurs, méthodes et résultats principaux',
    ],
    trap: 'Faire un catalogue « Auteur A dit ceci. Auteur B dit cela. Auteur C a aussi dit quelque chose. » — c\'est un résumé, pas une synthèse.',
    sourceIds: ['turabian', 'paltridge-starfield', 'murray'],
  },
]

// ─── Conseils de style académique ─────────────────────────────────
export const styleTips: StyleTip[] = [
  {
    id: 'sty-clarity',
    domain: 'Clarté et lisibilité',
    icon: 'Eye',
    principle: 'Le style académique ne signifie pas style obscur. Un texte clair est un texte intelligent ; un texte confus est un texte qui se cache derrière son jargon.',
    rules: [
      'Limitez les phrases à 25-35 mots maximum — au-delà, scindez',
      'Une idée par phrase, une phrase par idée',
      'Évitez la voix passive when possible : « Les résultats ont montré que… » plutôt que « Il a été montré que… »',
      'Préférez les verbes d\'action aux nominalisations : « analyser les données » plutôt que « l\'analyse des données a été effectuée »',
      'Définissez chaque terme technique à sa première occurrence — même si votre jury le connaît',
    ],
    wrongRight: [
      { wrong: 'Il a été constaté par les auteurs de l\'étude que les résultats obtenus étaient significatifs d\'un point de vue statistique.', right: 'Notre analyse montre des résultats statistiquement significatifs.' },
      { wrong: 'L\'effectuation de l\'analyse a permis la mise en évidence d\'un effet significatif.', right: 'L\'analyse révèle un effet significatif.' },
      { wrong: 'Il est important de noter qu\'il convient de souligner que les résultats sont en adéquation avec nos attentes.', right: 'Les résultats confirment nos attentes.' },
      { wrong: 'En ce qui concerne la question de la méthodologie, il est à noter que nous avons opté pour une approche qualitative.', right: 'Nous avons adopté une approche qualitative.' },
    ],
    sourceIds: ['graustein', 'turabian'],
  },
  {
    id: 'sty-concision',
    domain: 'Économie de mots',
    icon: 'Scissors',
    principle: 'Chaque mot doit travailler. Si un mot peut être supprimé sans perte de sens, il doit l\'être.',
    rules: [
      'Supprimez les formules vides : « Il est à noter que », « Il convient de mentionner », « Il va sans dire que »',
      'Supprimez les adverbes redondants : « tout à fait nouveau » → « nouveau » ; « complètement unique » → « unique »',
      'Remplacez « en ce qui concerne » par « concernant » ou « quant à »',
      'Remplacez « dans le cadre de » par « dans » ou « dans le cadre »',
      'Évitez les répétitions dans la même phrase : « L\'analyse des analyses a révélé… » → « L\'analyse a révélé… »',
      'Supprimez les propositions relatives redondantes : « Les participants qui étaient âgés de plus de 18 ans » → « Les participants de plus de 18 ans »',
    ],
    wrongRight: [
      { wrong: 'Dans le but de répondre à la question de recherche qui a été formulée précédemment, une analyse a été réalisée.', right: 'Pour répondre à notre question de recherche, nous avons mené une analyse.' },
      { wrong: 'Il est important de prendre en considération le fait que les résultats obtenus sont limités.', right: 'Ces résultats sont limités.' },
    ],
    sourceIds: ['graustein', 'murray'],
  },
  {
    id: 'sty-academic-voice',
    domain: 'Voix académique et positionnement',
    icon: 'UserCheck',
    principle: 'Trouvez l\'équilibre entre objectivité et engagement — vous ne rapportez pas les faits, vous contribuez au débat scientifique.',
    rules: [
      'Utilisez « nous » (ou « je » si autorisé par votre institution) pour les décisions de recherche : « Nous avons choisi cette méthode parce que… »',
      'Utilisez le présent pour les vérités générales et le passé pour vos actions : « Bandura (1977) soutient que… Nous avons testé cette hypothèse en… »',
      'Prenez position : « Nous soutenons que… » est préférable à « Il pourrait être soutenu que… »',
      'Signalez explicitement votre contribution : « À notre connaissance, cette étude est la première à… »',
      'Distinguez clairement ce qui vient de la littérature de ce qui est votre analyse : marqueurs de source systématiques',
    ],
    wrongRight: [
      { wrong: 'Il pourrait être avancé que les résultats sont intéressants.', right: 'Ces résultats apportent un éclairage nouveau sur…' },
      { wrong: 'Des recherches antérieures ont montré (Smith, 2018; Jones, 2019). Notre étude a obtenu des résultats similaires.', right: 'En accord avec Smith (2018) et Jones (2019), nos résultats confirment…' },
    ],
    sourceIds: ['paltridge-starfield', 'turabian'],
  },
  {
    id: 'sty-transitions',
    domain: 'Transitions entre les idées',
    icon: 'ArrowRightLeft',
    principle: 'Les transitions créent la fluidité du texte — sans elles, le lecteur navigue à l\'aveuglette entre des idées déconnectées.',
    rules: [
      'En début de paragraphe : résumez le lien avec le paragraphe précédent (« Sur la base de ces résultats… »)',
      'Entre les sections : utilisez une phrase-charnière en fin de section qui annonce la suivante',
      'Variez les connecteurs : ne commencez pas 3 paragraphes consécutifs par « En outre… »',
      'Catégories de connecteurs à maîtriser : addition (en outre, de plus), opposition (toutefois, en revanche), cause (par conséquent, ainsi), illustration (par exemple, en l\'occurrence)',
      'Quand une transition naturelle n\'existe pas, créez un sous-titre — c\'est aussi un moyen de transition',
    ],
    wrongRight: [
      { wrong: 'Les résultats sont significatifs. Les limites doivent être discutées. Les perspectives sont nombreuses.', right: 'Si ces résultats sont significatifs, l\'étude présente certaines limites. Néanmoins, ils ouvrent des perspectives prometteuses.' },
    ],
    sourceIds: ['graustein', 'turabian'],
  },
  {
    id: 'sty-figures-tables',
    domain: 'Légendes de figures et tableaux',
    icon: 'Image',
    principle: 'Une figure ou un tableau doit être autonome — le lecteur doit le comprendre sans lire le texte.',
    rules: [
      'La légende se place AU-DESSUS d\'un tableau et EN-DESSOUS d\'une figure',
      'La légende doit contenir : ce qui est présenté, les variables, l\'échantillon, et tout symbole non évident',
      'Numérotez en continu (Figure 1, Figure 2… ou Tab. 1, Tab. 2…) dans l\'ordre d\'apparition',
      'Dans le texte, renvoyez systématiquement à la figure/tableau : « La Figure 3 illustre… » ou « (voir Figure 3) »',
      'Ne répétez pas dans le texte toutes les valeurs d\'un tableau — résumez la tendance principale',
      'Assurez-vous que la police dans les figures est lisible et cohérente avec le reste du manuscrit',
    ],
    wrongRight: [
      { wrong: '(voir figure ci-dessus)', right: 'La Figure 2 présente l\'évolution du taux de réponse selon les modalités expérimentales.' },
      { wrong: 'Comme le montre le tableau, les valeurs sont 12, 34, 56, 78 et 90.', right: 'Le Tableau 3 montre une progression régulière de 12 à 90 (voir Tableau 3).' },
    ],
    sourceIds: ['turabian'],
  },
]

// ─── Conseils de révision ─────────────────────────────────────────
export const revisionTips: RevisionTip[] = [
  {
    id: 'rev-structure',
    stage: 'Révision structurelle (macro)',
    icon: 'Workflow',
    description: 'Vérifier la logique globale, l\'enchaînement des idées et la cohérence argumentative du manuscrit entier.',
    actions: [
      'Lisez uniquement les titres et sous-titres de tous les chapitres — l\'arc narratif est-il clair sans lire le contenu ?',
      'Vérifiez que chaque chapitre contient un paragraphe d\'ouverture et de clôture',
      'Lisez la première phrase de chaque paragraphe d\'un chapitre — ces phrases seules doivent former un résumé cohérent',
      'Identifiez les « trous logiques » : un concept utilisé sans avoir été défini, un résultat mentionné sans analyse',
      'Vérifiez que les objectifs de l\'introduction trouvent tous une réponse dans la conclusion',
      'Assurez-vous que les transitions entre chapitres existent (même implicites)',
    ],
    tool: 'Plan révisé sur papier ou tableau blanc — visualisez l\'architecture avant de retoucher le texte',
    sourceIds: ['turabian', 'murray'],
  },
  {
    id: 'rev-style',
    stage: 'Révision stylistique (micro)',
    icon: 'Sparkles',
    description: 'Améliorer la clarté, la concision et la fluidité phrase par phrase, paragraphe par paragraphe.',
    actions: [
      'Lisez le texte à voix haute — tout ce qui sonne mal DOIT être réécrit',
      'Recherchez et supprimez : « il est important de noter que », « il convient de souligner », « dans le cadre de »',
      'Vérifiez que chaque phrase a un sujet, un verbe et un complément clairs — pas de phrases nominales flottantes',
      'Remplacez les mots faibles (« chose », « fait », « aspect », « élément ») par des termes précis',
      'Éliminez les répétitions de mots proches dans une même phrase (« analyser l\'analyse »)',
      'Vérifiez la longueur des phrases : si 3 phrases consécutives dépassent 30 mots, scindez-en au moins une',
    ],
    tool: 'Correcteur grammatical + recherche de mots-clés « il est », « il convient », « dans le cadre » dans votre éditeur',
    sourceIds: ['graustein', 'murray'],
  },
  {
    id: 'rev-references',
    stage: 'Révision des références',
    icon: 'BookOpenCheck',
    description: 'Vérifier l\'exactitude, la cohérence et la complétude de toutes les citations et de la bibliographie.',
    actions: [
      'Vérifiez que chaque citation dans le texte (Auteur, Année) a une entrée correspondante dans la bibliographie',
      'Vérifiez l\'inverse : chaque entrée bibliographique est citée au moins une fois dans le texte',
      'Confirmez les DOI et les URL des références récentes — les liens cassés sont un signal négatif',
      'Assurez-vous que le style bibliographique est homogène (APA, Vancouver, Chicago…) sur TOUTE la bibliographie',
      'Vérifiez les majuscules, italiques et ponctuation dans chaque entrée bibliographique',
      'Utilisez un gestionnaire de références pour automatiser le formatage — ne le faites jamais à la main',
    ],
    tool: 'Zotero / Mendeley / EndNote + vérification manuelle d\'un échantillon de 10 % des références',
    sourceIds: ['turabian'],
  },
  {
    id: 'rev-feedback',
    stage: 'Intégration du feedback',
    icon: 'MessageCircle',
    description: 'Recevoir, interpréter et intégrer les commentaires de votre directeur et des relecteurs de manière systématique.',
    actions: [
      'Créez un tableau à 3 colonnes : Commentaire reçu | Action prévue | Statut (fait / en cours / reporté)',
      'Ne modifiez JAMAIS votre texte sans avoir compris le problème soulevé — discutez avec le commentateur si nécessaire',
      'Traitez les commentaires en priorité : critiques structurelles d\'abord, détails stylistiques ensuite',
      'Quand un commentaire est ambigu, reformulez-le dans vos propres mots pour vérifier votre compréhension',
      'Documentez les décisions que vous ne suivez pas et justifiez-les — préparez une réponse argumentée',
      'Après intégration, relisez les sections modifiées pour vérifier la cohérence avec le reste du texte',
    ],
    tool: 'Tableur de suivi des commentaires (Google Sheets ou Excel) avec colonnes : Source | Citation | Problème | Action | Date | Statut',
    sourceIds: ['murray', 'brause'],
  },
]

// ─── Conseils de productivité ──────────────────────────────────────
export const productivityTips: ProductivityTip[] = [
  {
    id: 'prod-daily-writing',
    theme: 'Micro-sessions d\'écriture quotidienne',
    icon: 'Timer',
    principle: 'Écrire 15-30 minutes par jour est infiniment plus productif qu\'écrire 8 heures le dimanche. La régularité bat l\'intensité.',
    steps: [
      'Bloquez un créneau quotidien de 25 minutes (méthode Pomodoro) — même 15 minutes suffisent',
      'Définissez AVANT la session ce que vous allez écrire : une section, un paragraphe, une analyse — pas « travailler sur la thèse »',
      'Fermez TOUS les onglets, notifications et distractions pendant la session',
      'Si vous êtes bloqué, écrivez n\'importe quoi — même « je ne sais pas quoi écrire ici, mais il faut parler de… » — le flux viendra',
      'À la fin de chaque session, notez en une phrase où vous en êtes pour la session suivante',
      'Augmentez progressivement : après 2 semaines à 25 min, passez à 45 min',
    ],
    frequency: 'Quotidien — sans exception. Même 15 minutes comptent.',
    sourceIds: ['brause', 'murray'],
  },
  {
    id: 'prod-snack-writing',
    theme: 'Rédaction par « snacks »',
    icon: 'Cookie',
    principle: 'Fragmenter les tâches d\'écriture en unités réalisables en 15-30 minutes pour éliminer la procrastination.',
    steps: [
      'Listez toutes les micro-tâches d\'écriture de votre chapitre : « rédiger l\'intro de la section 3.2 », « décrire le Tableau 5 », « écrire la transition §2.3 → §2.4 »',
      'Attribuez une durée estimée à chaque micro-tâche (15, 30 ou 45 min)',
      'Choisissez la tâche la plus simple possible pour démarrer — la momentum viendra naturellement',
      'Cochez chaque tâche accomplie — la progression visuelle est un moteur psychologique puissant',
      'Conservez une « liste d\'attente » de tâches rapides (< 15 min) pour les jours où vous manquez de temps',
    ],
    frequency: 'Chaque session d\'écriture commence par le choix d\'une micro-tâche spécifique.',
    sourceIds: ['brause'],
  },
  {
    id: 'prod-writing-group',
    theme: 'Groupes d\'écriture (Shut Up & Write)',
    icon: 'Users',
    principle: 'L\'engagement social crée une pression positive qui maintient la régularité de l\'écriture.',
    steps: [
      'Formez un groupe de 3-5 doctorants — idéalement de disciplines différentes pour éviter les comparaisons',
      'Rencontrez-vous 1-2 fois par semaine pour une session de 2 heures (25 min écriture / 5 min pause × 4 cycles)',
      'Commencez chaque session par un tour de table : « Je vais travailler sur… »',
      'Terminez par un second tour : « J\'ai écrit X mots / terminé Y section »',
      'Utilisez un outil de suivi partagé (tableur ou application) pour visualiser la progression collective',
      'Si le groupe se démotivre, changez le format : session en ligne, changement de lieu, challenges hebdomadaires',
    ],
    frequency: '1-2 sessions par semaine de 2 heures, en complément de l\'écriture quotidienne individuelle.',
    sourceIds: ['murray', 'brause'],
  },
  {
    id: 'prod-perfectionism',
    theme: 'Combattre le perfectionnisme paralysant',
    icon: 'Ban',
    principle: 'Le perfectionnisme en rédaction est un mécanisme de procrastination déguisé. « Je veux bien faire » devient « Je ne fais rien ».',
    steps: [
      'Adoptez ce mantra : « Un texte mauvais que je peux réviser vaut infiniment mieux qu\'une page blanche parfaite »',
      'Fixez-vous pour objectif d\'écrire 300 mots imparfaits plutôt que 50 mots polis',
      'Quand vous relisez et corrigez pendant que vous écrivez : arrêtez. Séparez explicitement rédaction et correction',
      'Utilisez un écran sombre ou une police inhabituelle pour le premier jet — cela désactive le « correcteur intérieur »',
      'Accordez-vous le droit d\'écrire des paragraphes « placeholder » : « [INSÉRER : analyse détaillée des résultats du modèle 3] »',
      'Rappelez-vous : votre directeur s\'attend à un brouillon, pas à un manuscrit publié',
    ],
    frequency: 'À appliquer à CHAQUE session de rédaction du premier jet.',
    sourceIds: ['brause', 'murray'],
  },
  {
    id: 'prod-tracking',
    theme: 'Suivi de la progression',
    icon: 'TrendingUp',
    principle: 'Ce qui se mesure s\'améliore. Suivre ses mots écrits crée une boucle de rétroaction positive.',
    steps: [
      'Enregistrez le nombre de mots écrits par session dans un tableur ou une application (ex. : WritersSQ)',
      'Calculez votre moyenne hebdomadaire — l\'objectif n\'est pas un chiffre élevé mais une régularité',
      'Visualisez la progression par chapitre : nombre de mots actuels / nombre cible → pourcentage de complétion',
      'Célébrez les jalons : chaque 5 000 mots, chaque chapitre terminé, chaque révision intégrée',
      'Revue hebdomadaire : 10 minutes le dimanche pour planifier la semaine suivante en fonction de la progression',
      'Si la courbe stagne pendant 2 semaines, changez de stratégie : nouvelles horaires, nouveau lieu, nouveau groupe',
    ],
    frequency: 'Quotidien (enregistrement) + hebdomadaire (analyse) + mensuel (révision des objectifs).',
    sourceIds: ['brause', 'murray'],
  },
]

// ─── Erreurs fréquentes ───────────────────────────────────────────
export const commonPitfalls: PitfallEntry[] = [
  {
    id: 'pit-perfection',
    pitfall: 'Écrire et réviser en même temps',
    icon: 'PencilRuler',
    consequence: 'Ralentissement drastique (5-10x plus lent), frustration, blocage prolongé, syndrome de la page blanche.',
    fix: 'Séparez explicitement les deux activités. Le matin : rédiger sans relire. L\'après-midi (ou le lendemain) : réviser ce qui a été écrit.',
    sourceIds: ['brause', 'murray'],
  },
  {
    id: 'pit-bibliocoverage',
    pitfall: 'Revue de littérature en catalogue (auteur par auteur)',
    icon: 'Library',
    consequence: 'Le jury perçoit un manque de synthèse et de pensée critique — signe d\'immaturité académique.',
    fix: 'Organisez par thème et problématique. Mettez les auteurs en dialogue : convergences, contradictions et limites de chaque courant.',
    sourceIds: ['turabian', 'paltridge-starfield'],
  },
  {
    id: 'pit-intro-length',
    pitfall: 'Introduction trop longue (type revue de littérature)',
    icon: 'TextSearch',
    consequence: 'Le lecteur perd le fil, l\'introduction noie la problématique sous les détails, le plan annoncé arrive trop tard.',
    fix: 'Limitez l\'introduction à 10-15 pages max. Contexte (2-3 pages) → Problématique (3-4 pages) → Objectifs (2 pages) → Plan (1 page).',
    sourceIds: ['turabian'],
  },
  {
    id: 'pit-no-gap',
    pitfall: 'Absence de research gap clair dans la revue de littérature',
    icon: 'CircleDot',
    consequence: 'Le jury ne comprend pas pourquoi cette thèse était nécessaire — le « pourquoi » de la recherche manque.',
    fix: 'Formulez explicitement le gap en une ou deux phrases : « Si les travaux de X (2019) ont montré…, aucun n\'a encore examiné… » — mettez cette formulation en évidence.',
    sourceIds: ['turabian', 'paltridge-starfield'],
  },
  {
    id: 'pit-results-discussion',
    pitfall: 'Mélanger résultats et discussion',
    icon: 'Blend',
    consequence: 'Le lecteur ne distingue pas les faits de vos interprétations — cela fragilise la crédibilité scientifique.',
    fix: 'Séparez strictement : les résultats décrivent les faits (« Les données montrent… »), la discussion les interprète (« Ces résultats suggèrent que… »).',
    sourceIds: ['turabian'],
  },
  {
    id: 'pit-no-limits',
    pitfall: 'Omettre les limites de l\'étude',
    icon: 'ShieldOff',
    consequence: 'Le jury perçoit un manque de recul critique — cela peut être fatal lors de la soutenance.',
    fix: 'Dédiez systématiquement un sous-chapitre aux limites : taille de l\'échantillon, choix méthodologiques, biais possibles. Soyez honnête et précis.',
    sourceIds: ['turabian', 'murray'],
  },
  {
    id: 'pit-jargon',
    pitfall: 'Abus de jargon technique sans définition',
    icon: 'BookX',
    consequence: 'Même les experts de votre domaine perdent le fil — le jargon n\'est pas un marqueur de compétence, c\'est une barrière.',
    fix: 'Définissez chaque terme technique à sa première occurrence. Si votre grand-mère ne comprend pas la phrase, simplifiez.',
    sourceIds: ['graustein', 'paltridge-starfield'],
  },
  {
    id: 'pit-plagiarism',
    pitfall: 'Paraphrase trop proche du texte source',
    icon: 'AlertTriangle',
    consequence: 'Accusation de plagiat, rejet du manuscrit, sanctions disciplinaires — même involontaire.',
    fix: 'Lisez la source, fermez-la, et reformulez avec vos propres mots. Citez systématiquement. Utilisez des guillemets pour toute citation exacte de plus de 3 mots.',
    sourceIds: ['turabian', 'murray'],
  },
  {
    id: 'pit-no-direction',
    pitfall: 'Ne pas consulter son directeur régulièrement',
    icon: 'UserX',
    consequence: 'Le premier jet dérive progressivement de la direction approuvée — des mois de réécriture sont nécessaires.',
    fix: 'Envoyez un brouillon de chaque chapitre à votre directeur au fur et à mesure — pas tout à la fin. Fixez une réunion toutes les 3-4 semaines minimum.',
    sourceIds: ['murray'],
  },
  {
    id: 'pit-emergency',
    pitfall: 'Tout écrire dans les 3 derniers mois',
    icon: 'Clock',
    consequence: 'Qualité médiocre, stress intense, erreurs multiples, fatigue du jury à la lecture — et potentiel échec à la soutenance.',
    fix: 'Commencez la rédaction dès le 2e année. Fixez des échéances internes : chapitre 1 au mois 4, chapitre 2 au mois 6, etc.',
    sourceIds: ['brause', 'murray'],
  },
  {
    id: 'pit-repetition',
    pitfall: 'Répéter les mêmes résultats dans les sections Résultats et Discussion',
    icon: 'Copy',
    consequence: 'Article/manuscrit trop long, lecteur agacé, jury qui doute de votre capacité à synthétiser.',
    fix: 'Dans les Résultats : décrivez les faits avec les chiffres. Dans la Discussion : interprétez la signification sans répéter les données numériques.',
    sourceIds: ['turabian'],
  },
  {
    id: 'pit-bad-titles',
    pitfall: 'Titres de sections vagues ou non informatifs',
    icon: 'Heading',
    consequence: 'Le lecteur ne peut pas naviguer efficacement — il doit tout lire pour comprendre la structure.',
    fix: 'Rendez chaque titre auto-suffisant : « Analyse des déterminants » → « Analyse des déterminants socio-économiques de l\'adoption technologique en PME ».',
    sourceIds: ['turabian', 'graustein'],
  },
]

// ─── Conseils spécifiques à la revue de littérature ────────────────
export const literatureTips: LiteratureTip[] = [
  {
    id: 'lit-sourcing',
    topic: 'Stratégie de recherche documentaire',
    icon: 'Search',
    principle: 'Une revue de littérature solide repose sur une stratégie de recherche systématique, pas sur le hasard des découvertes.',
    steps: [
      'Commencez par les revues de littérature récentes (5 dernières années) dans votre domaine — elles cartographient déjà le terrain',
      'Utilisez les articles fondateurs (highly cited) comme pierres angulaires de votre cadre théorique',
      'Consultez les bibliographies des articles clés pour identifier d\'autres références pertinentes (technique du « snowballing »)',
      'Ciblez au moins 3 bases de données complémentaires (Web of Science, Scopus, Google Scholar)',
      'Enregistrez systématiquement votre stratégie de recherche (mots-clés, filtres, dates, bases) — vous devrez la décrire dans votre thèse',
      'Prévoyez un système de tri : lire en profondeur (10-15 articles), lire en diagonale (30-50), archiver (100+)',
    ],
    avoid: [
      'Limiter votre recherche à Google Scholar uniquement',
      'Ignorer les articles antérieurs à 2010 sans justification',
      'Citer un article que vous n\'avez pas lu en entier',
      'Sélectionner uniquement les articles qui soutiennent votre hypothèse',
    ],
    sourceIds: ['turabian', 'murray'],
  },
  {
    id: 'lit-synthesis',
    topic: 'Synthèse vs catalogue',
    icon: 'GitMerge',
    principle: 'Une bonne revue de littérature crée un dialogue entre les sources, pas une liste de résumés.',
    steps: [
      'Identifiez les thèmes récurrents dans la littérature — ils deviendront vos sous-sections',
      'Pour chaque thème, positionnez les auteurs sur un spectre : convergences, nuances, contradictions',
      'Utilisez des verbes de positionnement : « X soutient… », « Y remet en question… », « Z nuance cette perspective en… »',
      'Concluez chaque sous-thème par un bilan qui mène naturellement à votre gap de recherche',
      'Créez un tableau de synthèse (auteurs en colonnes, thèmes en lignes, résultats dans les cellules) — incluez-le en annexe',
      'Rédigez la conclusion de la revue de littérature en dernier — elle doit aboutir à votre problématique comme une évidence',
    ],
    avoid: [
      'Organiser par auteur (« Smith (2018) dit X. Jones (2019) dit Y. »)',
      'Présenter chaque article isolément sans le mettre en relation avec les autres',
      'Ne pas conclure la revue par un bilan et un gap explicite',
      'Citer des sources sans les discuter (mentionner sans analyser)',
    ],
    sourceIds: ['turabian', 'paltridge-starfield'],
  },
  {
    id: 'lit-note-taking',
    topic: 'Prise de notes efficace',
    icon: 'StickyNote',
    principle: 'La qualité de votre revue de littérature dépend directement de la qualité de vos notes de lecture.',
    steps: [
      'Pour chaque article lu, notez : (1) question de recherche, (2) méthode, (3) résultat principal, (4) limites identifiées par l\'auteur, (5) pertinence pour votre thèse',
      'Utilisez un tableau ou un outil structuré (Notion, Obsidian, OneNote) — pas des post-its dispersés',
      'Rédigez le résumé de chaque article dans vos propres mots IMMÉDIATEMENT après la lecture — jamais « plus tard »',
      'Codez les articles par thème avec des tags ou des couleurs pour faciliter le regroupement ultérieur',
      'Notez les citations exactes (avec numéros de page) au moment de la lecture — vous ne les retrouverez pas ensuite',
      'Relisez vos notes de lecture avant de commencer à rédiger — elles sont votre matière première',
    ],
    avoid: [
      'Surligner le PDF sans prendre de notes structurées',
      'Compter sur votre mémoire pour retrouver une citation précise',
      'Lire sans noter la pertinence pour votre propre recherche',
      'Stocker les PDFs sans organiser les métadonnées associées',
    ],
    sourceIds: ['murray', 'turabian'],
  },
  {
    id: 'lit-gap-articulation',
    topic: 'Formuler le research gap',
    icon: 'Puzzle',
    principle: 'Le research gap est le pivot de toute la thèse — il justifie votre recherche et donne son sens à votre contribution.',
    steps: [
      'Identifiez au moins 3 types de gaps possibles : gap empirique (manque de données), gap théorique (cadre incomplet), gap méthodologique (approche non testée)',
      'Formulez le gap en une ou deux phrases maximum : « Si les études précédentes ont montré X, aucune n\'a encore examiné Y dans le contexte Z »',
      'Testez la formulation : un collègue non-spécialiste comprend-il pourquoi ce gap est important ?',
      'Assurez-vous que le gap est ni trop large (« personne n\'a étudié ce sujet ») ni trop étroit (« personne n\'a testé cette variable en 2023 dans cette ville »)',
      'Reliez explicitement le gap à votre question de recherche : « Ce gap justifie la question suivante : … »',
      'Placez la formulation du gap à un endroit stratégique : fin de la revue de littérature ou début de l\'introduction — avec renvoi entre les deux',
    ],
    avoid: [
      'Prétendre que personne n\'a travaillé sur votre sujet (presque jamais vrai)',
      'Formuler un gap si vague que n\'importe quelle recherche pourrait y répondre',
      'Ne pas justifier pourquoi ce gap mérite d\'être comblé',
      'Oublier de relier le gap à votre question de recherche',
    ],
    sourceIds: ['turabian', 'paltridge-starfield'],
  },
  {
    id: 'lit-citation-integration',
    topic: 'Intégration fluide des citations',
    icon: 'Quote',
    principle: 'Les citations doivent se fondre naturellement dans votre argumentation — jamais plaquées comme des preuves externes.',
    steps: [
      'Intégrez la citation dans votre phrase : « La théorie de l\'autodétermination (Deci & Ryan, 2000) postule que… » plutôt que « Deci et Ryan (2000) disent que… »',
      'Utilisez le verbe de citation adapté au contenu : « montrent » (résultats empiriques), « soutiennent » (arguments), « suggèrent » (hypothèses), « nuancent » (limites)',
      'Regroupez les citations concordantes : « Plusieurs études confirment ce résultat (Smith, 2019; Dupont, 2020; Lee, 2021) »',
      'Pour les divergences, explicitez : « Contrairement à Smith (2019), Dupont (2020) observe… »',
      'Limitez les citations textuelles (< 5 % du texte) — préférez la paraphrase avec citation',
      'Chaque fois que vous citez, expliquez immédiatement la pertinence pour votre argument : « Cette observation corrobore notre hypothèse selon laquelle… »',
    ],
    avoid: [
      'Placer les citations entre parenthèses à la fin de la phrase sans les intégrer au discours',
      'Enchaîner les citations sans commentaire ni analyse',
      'Utiliser les mêmes verbes de citation en boucle (« montre », « montre », « montre »)',
      'Citer sans expliquer pourquoi cette citation est pertinente pour votre argument',
    ],
    sourceIds: ['turabian', 'paltridge-starfield', 'graustein'],
  },
]

// ─── Patrons rhétoriques (moves) ───────────────────────────────────
export const rhetoricalMoves: RhetoricalMove[] = [
  {
    id: 'move-intro-1',
    section: 'Introduction',
    icon: 'Waypoints',
    move: 'Établir le territoire (Establishing a Territory)',
    function: 'Délimiter le domaine de recherche et montrer son importance.',
    linguisticMarkers: [
      'Au cours des dernières décennies…',
      'De nombreuses études ont examiné…',
      'La question de X occupe une place centrale dans…',
      'X est un enjeu majeur de…',
      'Il est aujourd\'hui admis que…',
    ],
    example: 'Au cours des dernières décennies, la transition numérique a profondément transformé les pratiques managériales (Smith, 2018; Jones, 2020). Cette transformation soulève des questions fondamentales quant à…',
    sourceIds: ['paltridge-starfield'],
  },
  {
    id: 'move-intro-2',
    section: 'Introduction',
    icon: 'TriangleAlert',
    move: 'Établir la niche (Establishing a Niche)',
    function: 'Identifier ce qui manque dans la littérature existante — le research gap.',
    linguisticMarkers: [
      'Toutefois, peu d\'études ont porté sur…',
      'À ce jour, aucun travail n\'a examiné…',
      'Si les recherches précédentes ont montré X, elles n\'ont pas encore abordé Y.',
      'Une lacune persiste dans la littérature concernant…',
      'Ces résultats nécessitent une investigation plus approfondie de…',
    ],
    example: 'Si ces travaux ont largement documenté l\'impact des outils numériques sur la productivité individuelle, peu d\'études ont examiné leurs effets sur la dynamique collective au sein des équipes.',
    sourceIds: ['paltridge-starfield'],
  },
  {
    id: 'move-intro-3',
    section: 'Introduction',
    icon: 'Bullseye',
    move: 'Occuper la niche (Occupying the Niche)',
    function: 'Annoncer la recherche que vous allez mener pour combler le gap.',
    linguisticMarkers: [
      'Cette thèse vise à…',
      'L\'objectif de cette recherche est de…',
      'Pour combler cette lacune, nous proposons d\'examiner…',
      'La présente étude se propose de…',
      'Nous cherchons à déterminer dans quelle mesure…',
    ],
    example: 'Pour combler cette lacune, la présente thèse vise à analyser l\'impact des outils collaboratifs numériques sur la cohésion d\'équipe dans les PME de moins de 50 employés.',
    sourceIds: ['paltridge-starfield'],
  },
  {
    id: 'move-method-1',
    section: 'Méthodologie',
    icon: 'ListChecks',
    move: 'Décrire et justifier le design',
    function: 'Expliquer le choix méthodologique et pourquoi il est adapté à la question de recherche.',
    linguisticMarkers: [
      'Nous avons adopté une approche…',
      'Cette méthode a été retenue car…',
      'Le design de recherche s\'appuie sur…',
      'Afin de répondre à notre question, nous avons…',
      'Cette technique est particulièrement adaptée pour…',
    ],
    example: 'Nous avons adopté une approche mixte combinant une analyse quantitative (enquête par questionnaire, n=200) et une analyse qualitative (entretiens semi-directifs, n=15). Ce design mixte a été retenu car il permet de trianguler les résultats et de saisir à la fois les tendances statistiques et les significations subjectives.',
    sourceIds: ['paltridge-starfield', 'turabian'],
  },
  {
    id: 'move-results-1',
    section: 'Résultats',
    icon: 'BarChart3',
    move: 'Rapporter les résultats factuels',
    function: 'Présenter les données de manière neutre et séquentielle, sans interprétation.',
    linguisticMarkers: [
      'Les résultats montrent que…',
      'L\'analyse révèle que…',
      'Comme l\'illustre la Figure X…',
      'Les données présentées dans le Tableau Y indiquent…',
      'Une corrélation significative a été observée entre…',
    ],
    example: 'Les résultats montrent que 67 % des participants (n=134) ont adopté l\'outil dans les trois premiers mois (voir Tableau 3). L\'analyse de régression logistique révèle que la taille de l\'équipe (OR=1.4, p<0.01) est le principal facteur prédictif.',
    sourceIds: ['paltridge-starfield', 'turabian'],
  },
  {
    id: 'move-discussion-1',
    section: 'Discussion',
    icon: 'MessageSquareText',
    move: 'Interpréter et mettre en perspective',
    function: 'Donner du sens aux résultats en les comparant à la littérature et en les interprétant.',
    linguisticMarkers: [
      'Ces résultats suggèrent que…',
      'Notre interprétation est que…',
      'Ce résultat est cohérent avec les travaux de X, qui…',
      'Contrairement à Y (2019), nous observons…',
      'Cette différence pourrait s\'expliquer par…',
    ],
    example: 'Ces résultats suggèrent que la taille de l\'équipe joue un rôle modérateur dans l\'adoption technologique, ce qui est cohérent avec les travaux de Lee (2020) sur les organisations de petite taille. Toutefois, contrairement à Martin (2018), nous n\'observons pas d\'effet significatif du secteur d\'activité.',
    sourceIds: ['paltridge-starfield', 'turabian'],
  },
  {
    id: 'move-discussion-2',
    section: 'Discussion',
    icon: 'ShieldQuestion',
    move: 'Annoncer les limites',
    function: 'Demontrer l\'honnêteté intellectuelle en identifiant les faiblesses de l\'étude.',
    linguisticMarkers: [
      'Cette étude présente certaines limites…',
      'Il convient de noter que…',
      'Ces résultats doivent être interprétés avec prudence car…',
      'Notre échantillon ne permet pas de généraliser à…',
      'Une limite supplémentaire concerne…',
    ],
    example: 'Cette étude présente certaines limites. Premièrement, la taille de l\'échantillon (n=200) restreint la puissance statistique pour détecter des effets de petite taille. Deuxièmement, le caractère transversal de l\'enquête ne permet pas d\'établir de relations causales.',
    sourceIds: ['paltridge-starfield', 'turabian'],
  },
  {
    id: 'move-conclusion-1',
    section: 'Conclusion',
    icon: 'Target',
    move: 'Rappel de la problématique et réponse',
    function: 'Refermer la boucle ouverte dans l\'introduction en répondant explicitement à la question de recherche.',
    linguisticMarkers: [
      'Cette thèse avait pour objectif de…',
      'En réponse à notre question de recherche…',
      'Les résultats de cette recherche montrent que…',
      'La contribution principale de ce travail est…',
      'En définitive, cette étude démontre que…',
    ],
    example: 'Cette thèse avait pour objectif d\'analyser les facteurs d\'adoption des outils collaboratifs dans les PME. En réponse à notre question de recherche, les résultats montrent que la taille de l\'équipe, le soutien managérial et la culture numérique sont les trois déterminants principaux. La contribution principale de ce travail est un modèle prédictif de l\'adoption expliquant 72 % de la variance.',
    sourceIds: ['paltridge-starfield', 'turabian'],
  },
]

// ─── Conseils de présentation visuelle ────────────────────────────
export const presentationTips: PresentationTip[] = [
  {
    id: 'pres-formatting',
    topic: 'Mise en page et format',
    icon: 'Ruler',
    principle: 'La forme reflète le professionnalisme — une mise en page soignée facilite la lecture et signale le soin apporté au travail.',
    rules: [
      'Respectez les normes de votre institution (marges, police, interligne, pagination) dès le premier jour — pas à la fin',
      'Police recommandée : Times New Roman 12, Garamond 12 ou Arial 11 — conformément aux exigences doctorales',
      'Interligne : 1.5 minimum pour le corps du texte, simple pour les notes de bas de page et la bibliographie',
      'Marges : 2.5 cm (ou 1 inch) de chaque côté sauf indication contraire',
      'Titres hiérarchisés clairement (taille/gras/italique différents pour chaque niveau)',
      'Numéroter les pages en continu — y compris les annexes (mais avec une numérotation distincte)',
    ],
    sourceIds: ['turabian'],
  },
  {
    id: 'pres-headings',
    topic: 'Système de titres',
    icon: 'Heading1',
    principle: 'Le système de titres doit permettre au lecteur de naviguer intuitivement dans le manuscrit.',
    rules: [
      'Utilisez au maximum 3-4 niveaux hiérarchiques : Chapitre → Section (1.1) → Sous-section (1.1.1) → Sous-sous-section (1.1.1.1)',
      'Chaque titre doit être informatif : « Présentation de l\'échantillon » plutôt que « Présentation »',
      'Évitez les titres interrogatifs (sauf dans certains domaines) — préférez les titres déclaratifs',
      'Assurez-vous qu\'au moins deux titres existent à chaque niveau (pas de « 1.1 » sans « 1.2 »)',
      'Générez automatiquement la table des matières à partir des styles de titre — ne la tapez jamais manuellement',
    ],
    sourceIds: ['turabian', 'graustein'],
  },
  {
    id: 'pres-consistency',
    topic: 'Cohérence visuelle',
    icon: 'Palette',
    principle: 'Un document cohérent dans ses choix visuels projette une image professionnelle et facilite la lecture.',
    rules: [
      'Choisissez UN style de citation et tenez-vous-y sur tout le manuscrit — pas d\'alternance APA/Vancouver',
      'Normalisez les abréviations : définissez chaque abréviation à sa première occurrence et utilisez-la ensuite uniformément',
      'Standardisez les formats de nombres : « cinq » pour 0-10 en début de phrase, « 15 » pour les chiffres au-delà',
      'Utilisez un seul type de guillemets (« » en français, "" en anglais) — pas de mélange',
      'Vérifiez la cohérence de la ponctuation avant et après les citations : en français, la ponctuation précède la parenthèse de citation',
      'Uniformisez le vocabulaire : choisissez un terme et tenez-vous-y (ex. : « participants » ou « sujets » — pas les deux)',
    ],
    sourceIds: ['turabian'],
  },
  {
    id: 'pres-front-back',
    topic: 'Pages préliminaires et annexes',
    icon: 'BookCover',
    principle: 'Les pages préliminaires (front matter) et les annexes (back matter) encadrent votre travail et doivent être impeccables.',
    rules: [
      'Page de titre : titre de la thèse, votre nom, institution, année, nom du directeur — conformément au modèle officiel',
      'Remerciements : personnels mais professionnels — remerciez votre directeur, les membres du jury, les collaborateurs',
      'Résumé (abstract) : 200-300 mots en français + 200-300 mots en anglais (si requis) — contenu identique, pas traduction littérale',
      'Table des matières : générée automatiquement avec les numéros de page corrects',
      'Liste des figures et tableaux : générée automatiquement avec les légendes et numéros de page',
      'Annexes : numérotées (Annexe A, Annexe B…) avec des titres clairs et un renvoi dans le corps du texte',
    ],
    sourceIds: ['turabian'],
  },
]

// ─── Helper : récupérer les conseils par source ────────────────────
export function getTipsBySource(sourceId: string): {
  phases: WritingPhase[]
  structure: StructureTip[]
  argumentation: ArgumentationTip[]
  style: StyleTip[]
  revision: RevisionTip[]
  productivity: ProductivityTip[]
  pitfalls: PitfallEntry[]
  literature: LiteratureTip[]
  moves: RhetoricalMove[]
  presentation: PresentationTip[]
} {
  return {
    phases: writingPhases.filter(p => p.sourceIds.includes(sourceId)),
    structure: structureTips.filter(s => s.sourceIds.includes(sourceId)),
    argumentation: argumentationTips.filter(a => a.sourceIds.includes(sourceId)),
    style: styleTips.filter(s => s.sourceIds.includes(sourceId)),
    revision: revisionTips.filter(r => r.sourceIds.includes(sourceId)),
    productivity: productivityTips.filter(p => p.sourceIds.includes(sourceId)),
    pitfalls: commonPitfalls.filter(p => p.sourceIds.includes(sourceId)),
    literature: literatureTips.filter(l => l.sourceIds.includes(sourceId)),
    moves: rhetoricalMoves.filter(m => m.sourceIds.includes(sourceId)),
    presentation: presentationTips.filter(p => p.sourceIds.includes(sourceId)),
  }
}

// ─── Helper : récupérer les noms des sources ───────────────────────
export function getSourceLabel(sourceId: string): string {
  const source = writingSources.find(s => s.id === sourceId)
  if (!source) return sourceId
  const shortTitle = source.title.split(':')[0].split('(')[0].trim()
  return `${source.author} (${source.year})`
}

// ─── Phases du processus de recherche (Turabian, Part I) ──────────

/** Phase du processus de recherche selon Turabian (8e éd.), Part I */
export interface ResearchPhase {
  id: string
  title: string
  description: string
  keyActivities: string[]
  deliverables: string[]
  commonPitfalls: string[]
}

export const turabianResearchProcess: ResearchPhase[] = [
  {
    id: 'rp-question',
    title: 'Formuler une question de recherche',
    description: 'Toute recherche sérieuse commence par une question bien posée qui donne une direction claire à l\'ensemble du travail. Turabian insiste sur le fait qu\'une bonne question de recherche doit être significative, c\'est-à-dire qu\'elle doit mériter une réponse et apporter une contribution au champ disciplinaire. La question doit être suffisamment ciblée pour être traitée de manière approfondie dans le cadre d\'une thèse, mais aussi assez ouverte pour permettre une exploration riche et nuancée.',
    keyActivities: [
      'Identifier un domaine d\'intérêt général lié à votre discipline et à vos lectures antérieures',
      'Narrow ce domaine en lisant des revues de littérature récentes pour repérer les controverses et les lacunes',
      'Formuler une question provisoire, puis la raffiner en itérant entre lecture et reformulation',
      'Vérifier que la question est significative : pourquoi la réponse importe-t-elle pour d\'autres chercheurs ?',
      'S\'assurer que la question est faisable compte tenu des ressources, du temps et des données disponibles',
      'Tester la question en rédigeant un court paragraphe exploratoire de 200 à 300 mots',
    ],
    deliverables: [
      'Une question de recherche clairement formulée en une ou deux phrases',
      'Un court paragraphe justifiant la pertinence et la faisabilité de la question',
      'Une liste préliminaire de mots-clés et de concepts associés pour guider la recherche documentaire',
    ],
    commonPitfalls: [
      'Choisir une question trop vaste (par exemple « l\'impact d\'Internet sur la société ») qui ne peut être traitée en une seule thèse',
      'Formuler une question dont la réponse est déjà connue ou trivialement évidente',
      'Ignorer la signification de la question : se demander « et alors ? » pour vérifier que la réponse apporte une vraie contribution',
    ],
  },
  {
    id: 'rp-sources',
    title: 'Identifier et évaluer les sources',
    description: 'La qualité d\'une thèse dépend directement de la qualité de ses sources. Turabian consacre un chapitre entier à l\'évaluation critique des sources, en distinguant les sources primaires (données brutes, textes originaux, archives) des sources secondaires (analyses, synthèses, commentaires). Chaque source doit être évaluée selon trois critères fondamentaux : sa fiabilité (l\'auteur est-il crédible, le texte a-t-il été revu par des pairs ?), sa pertinence (la source traite-t-elle directement de votre question ?) et sa actualité (les informations sont-elles à jour ?).',
    keyActivities: [
      'Construire une stratégie de recherche documentaire en utilisant les bases de données spécialisées de votre discipline',
      'Distinguer systématiquement les sources primaires des sources secondaires et les équilibrer dans votre corpus',
      'Évaluer chaque source selon les critères de fiabilité, pertinence et actualité',
      'Constituer un système de classement des sources (par thème, par approche méthodologique, par chronologie)',
      'Documenter systématiquement les références complètes dès le premier contact avec la source',
      'Identifier les sources clés (citations incontournables) et les sources de support (illustrations, exemples)',
      'Repérer les contradicteurs : les auteurs qui défendent des positions opposées aux vôtres',
    ],
    deliverables: [
      'Un corpus de sources organisé et classé selon vos thèmes de recherche',
      'Une fiche d\'évaluation pour chaque source principale (fiabilité, pertinence, notes de lecture)',
      'Une bibliographie provisoire structurée selon le style de citation requis',
      'Un tableau de synthèse comparant les principales sources sur les dimensions clés de votre question',
    ],
    commonPitfalls: [
      'Se limiter aux trois premières pages de résultats de recherche Google Scholar sans creuser plus profondément',
      'Confondre popularité et fiabilité : un article beaucoup cité n\'est pas nécessairement irréprochable méthodologiquement',
      'Négliger les sources contradictoires, ce qui affaiblit la solidité de l\'argumentation finale',
    ],
  },
  {
    id: 'rp-reading',
    title: 'Lire de manière active',
    description: 'Lire pour une thèse n\'est pas comme lire pour le plaisir ou pour se renseigner. Turabian souligne que la lecture active implique un engagement critique constant avec le texte : on ne se contente pas d\'absorber l\'information, on la questionne, on la compare avec d\'autres lectures, on l\'évalue à l\'aune de sa propre question de recherche. La prise de notes structurée est essentielle pour éviter de devoir relire les mêmes textes et pour construire progressivement sa propre argumentation.',
    keyActivities: [
      'Lire avec un objectif précis en tête : que cherchez-vous dans ce texte par rapport à votre question ?',
      'Prendre des notes structurées en distinguant les idées de l\'auteur de vos propres commentaires et interprétations',
      'Annoter directement les textes (surlignement, marges) en utilisant un code couleur cohérent pour les concepts clés',
      'Rédiger un bref résumé de chaque texte lu, en indiquant sa contribution spécifique à votre recherche',
      'Construire des tableaux comparatifs pour mettre en parallèle les positions de différents auteurs sur un même enjeu',
      'Garder un journal de lecture où vous notez vos réactions, questions et idées émergentes au fil de vos lectures',
    ],
    deliverables: [
      'Des fiches de lecture complètes pour chaque source majeure, avec résumé, critique et liens vers votre question',
      'Un tableau comparatif des principales positions théoriques et résultats empiriques dans votre champ',
      'Un journal de lecture documentant votre évolution intellectuelle au fil de la recherche',
      'Une carte conceptuelle reliant les auteurs, concepts et résultats entre eux',
    ],
    commonPitfalls: [
      'Surligner tout le texte sans distinction, ce qui revient à ne pas annoter du tout',
      'Recopier des passages entiers sans les paraphraser, ce qui risque de conduire au plagiat involontaire',
      'Lire de façon linéaire et passive sans jamais s\'arrêter pour questionner ou synthétiser',
    ],
  },
  {
    id: 'rp-thesis',
    title: 'Formuler une thèse (claim)',
    description: 'Le « claim » ou thèse, au sens de Turabian, est l\'affirmation centrale que vous défendez dans votre travail. Ce n\'est pas un simple constat ou un résumé de votre sujet, mais une proposition argumentée qui mérite d\'être prouvée. Turabian insiste sur la distinction cruciale entre le sujet (ce dont vous parlez) et la thèse (ce que vous affirmez à propos de ce sujet). Une bonne thèse est spécifique, défendable, non triviale et capable de générer un débat raisonnable.',
    keyActivities: [
      'Transformer votre question de recherche en une affirmation claire et testable qui répond à cette question',
      'Vérifier que votre thèse n\'est ni trop évidente (personne ne la contesterait) ni trop radicale (impossible à prouver)',
      'Identifier les raisons principales qui soutiennent votre thèse et les hiérarchiser par ordre d\'importance',
      'Anticiper les objections les plus sérieuses à votre thèse et préparer des réponses argumentées',
      'Rédiger votre thèse en une seule phrase claire que vous pourrez utiliser comme fil conducteur de tout le manuscrit',
      'Tester votre thèse auprès de votre directeur et de collègues pour vérifier sa clarté et sa pertinence',
    ],
    deliverables: [
      'Une phrase de thèse claire, spécifique et défendable qui résume votre position centrale',
      'Une liste des trois à cinq raisons principales qui soutiennent cette thèse',
      'Un court texte (500 mots) justifiant pourquoi cette thèse est significative et originale',
    ],
    commonPitfalls: [
      'Formuler une thèse vague ou trop générale qui ne permet pas de guider la structure de l\'argumentation',
      'Confondre la thèse avec le sujet : « Cette thèse porte sur X » n\'est pas une thèse mais un constat thématique',
      'Modifier sa thèse au fil de la recherche sans le reconnaître, créant une incohérence entre introduction et conclusion',
    ],
  },
  {
    id: 'rp-arguments',
    title: 'Construire des arguments solides',
    description: 'Turabian détaille la structure de l\'argumentation académique en s\'appuyant sur la logique du warrant (le lien entre la raison et la thèse). Chaque argument doit reposer sur des raisons clairement articulées, elles-mêmes étayées par des preuves tangibles (données, citations, exemples). Un argument solide reconnaît également les objections légitimes et y répond de manière constructive, ce qui renforce plutôt qu\'affaiblit la position défendue. La clé est de construire une chaîne logique transparente que le lecteur peut suivre et évaluer.',
    keyActivities: [
      'Pour chaque raison soutenant votre thèse, identifier le warrant (le principe général qui relie la raison à la thèse)',
      'Assembler des preuves variées pour chaque raison : données quantitatives, citations d\'experts, exemples concrets, analogies',
      'Énumérer les objections les plus sérieuses à votre argumentation et rédiger des réponses nuancées',
      'Structurer chaque section argumentative selon le schéma : raison → preuve → warrant → réponse aux objections',
      'Utiliser des connecteurs logiques explicites pour rendre la structure argumentative visible au lecteur',
      'Éviter les sophismes courants : généralisation hâtive, homme de paille, appel à l\'autorité sans justification',
      'Vérifier que chaque paragraphe contribue directement à soutenir la thèse et n\'introduit pas d\'arguments non pertinents',
    ],
    deliverables: [
      'Un schéma argumentaire complet montrant thèse, raisons, preuves, warrants et réponses aux objections',
      'Des paragraphes argumentatifs rédigés suivant la structure raison-preuve-warrant',
      'Une section dédiée aux objections et limites, montrant la rigueur intellectuelle de la démarche',
    ],
    commonPitfalls: [
      'Empiler des preuves sans expliquer comment elles soutiennent la thèse, laissant au lecteur le soin de faire le lien',
      'Ignorer les objections par peur d\'affaiblir son argumentation, alors que les reconnaître renforce la crédibilité',
      'Présenter des raisons qui se répètent sous des formulations différentes sans apporter de perspectives véritablement nouvelles',
    ],
  },
  {
    id: 'rp-outline',
    title: 'Élaborer un plan détaillé',
    description: 'Le plan détaillé est la carte routière de votre thèse. Turabian y consacre un chapitre entier car elle considère que la qualité du plan détermine en grande partie la qualité du texte final. Un bon plan n\'est pas rigide : il évolue au fil de la recherche et de la rédaction, mais il offre à tout moment une vision claire de la structure globale et de la progression logique du raisonnement. Le plan doit montrer comment chaque section contribue à la démonstration de la thèse.',
    keyActivities: [
      'Commencer par un plan grossier (les grands chapitres) puis le raffiner progressivement jusqu\'au niveau des paragraphes',
      'Vérifier que chaque chapitre a un rôle spécifique dans la démonstration globale et qu\'il n\'y a pas de redondance',
      'S\'assurer que la progression logique est claire : chaque chapitre doit s\'appuyer sur les précédents et préparer les suivants',
      'Intégrer les résultats de votre revue de littérature dans le plan : où chaque source sera-elle mobilisée ?',
      'Inclure les transitions prévues entre les sections pour assurer la fluidité de la lecture',
      'Faire valider le plan détaillé par votre directeur avant de commencer la rédaction proprement dite',
    ],
    deliverables: [
      'Un plan hiérarchique complet allant des chapitres jusqu\'aux sous-sections avec des descriptions de contenu',
      'Un schéma de la progression logique montrant comment chaque chapitre s\'articule avec les autres',
      'Une estimation du nombre de pages prévu pour chaque section afin de gérer l\'équilibre du manuscrit',
    ],
    commonPitfalls: [
      'Rédiger sans plan, ce qui conduit à un texte désorganisé avec des répétitions et des ruptures logiques',
      'Être trop rigide : un plan doit évoluer au fil de la recherche et de la rédaction, pas être gravé dans le marbre',
      'Négliger les transitions entre les chapitres, ce qui donne l\'impression d\'une succession d\'essais déconnectés',
    ],
  },
  {
    id: 'rp-drafting',
    title: 'Rédiger la première ébauche',
    description: 'La rédaction de la première ébauche est souvent le moment le plus intimidant du processus, mais Turabian insiste sur un point crucial : la perfection est l\'ennemi de la production. L\'objectif de l\'ébauche est de mettre des mots sur le papier, pas de produire un texte final. Il vaut mieux rédiger un texte imparfait que de rester paralysé par l\'exigence de perfection. Les blocages d\'écriture sont normaux et gérables : ils signalent souvent que l\'on a besoin de clarifier sa pensée avant de continuer.',
    keyActivities: [
      'Se fixer un objectif d\'écriture quotidien réaliste (par exemple 500 mots par jour) et le respecter',
      'Commencer par la section qui vous semble la plus facile ou la plus claire dans votre esprit, pas forcément l\'introduction',
      'Rédiger sans se soucier du style ni des citations exactes : insérez des repères comme [CITER ICI] que vous complèterez plus tard',
      'En cas de blocage, changer de section, rédiger une liste à puces, ou dicter vos idées à voix haute avant de les écrire',
      'Maintenir un élan d\'écriture en terminant chaque session sur une note facile à reprendre la fois suivante',
      'Résister à la tentation de réviser au fur et à mesure : la révision est une étape distincte qui vient après l\'ébauche',
    ],
    deliverables: [
      'Une première ébauche complète, même imparfaite, couvrant l\'ensemble de la structure prévue',
      'Des notes sur les sections qui nécessitent des recherches ou réflexions supplémentaires',
      'Un suivi de votre rythme d\'écriture quotidien pour identifier vos moments de productivité',
    ],
    commonPitfalls: [
      'Réviser chaque phrase au fur et à mesure, ce qui ralentit considérablement la production et brise l\'élan',
      'Reporter le début de la rédaction indéfiniment en attendant de « tout comprendre », ce qui est rarement atteignable',
      'Viser la perfection dès la première ébauche, ce qui génère de l\'anxiété et des blocages d\'écriture prolongés',
    ],
  },
  {
    id: 'rp-citations',
    title: 'Maîtriser les citations',
    description: 'La maîtrise du système de citation est un aspect non négociable de la rédaction académique. Turabian, éditrice du Manuel de Chicago, présente en détail les deux styles principaux : le système notes-bibliographie (notes de bas de page ou de fin avec bibliographie) et le système auteur-date (citations dans le texte avec bibliographie). Le choix du système dépend de votre discipline et des exigences de votre institution. Dans tous les cas, chaque emprunt textuel, idée ou donnée emprunté à un autre auteur doit être rigoureusement cité.',
    keyActivities: [
      'Identifier le système de citation requis par votre institution et votre discipline dès le début du projet',
      'Maîtriser les règles de citation pour chaque type de source : livre, article, site web, communication orale, archive',
      'Utiliser un gestionnaire de références bibliographiques (Zotero, Mendeley, EndNote) pour automatiser le formatage',
      'Vérifier que chaque citation dans le texte correspond bien à une entrée dans la bibliographie et réciproquement',
      'Connaître les règles spécifiques : quand citer un résumé, quand citer mot à mot, comment gérer les citations imbriquées',
      'Prêter une attention particulière aux citations de sources secondaires : toujours privilégier la source primaire quand c\'est possible',
    ],
    deliverables: [
      'Une bibliographie complète et correctement formatée selon le style requis',
      'Des notes de bas de page ou des citations dans le texte cohérentes avec la bibliographie',
      'Un fichier de gestion de références organisé et à jour avec toutes les sources consultées',
    ],
    commonPitfalls: [
      'Mélanger plusieurs styles de citation au sein d\'un même manuscrit, ce qui signale un manque de rigueur',
      'Oublier de citer des paraphrases ou des idées empruntées, ce qui constitue du plagiat même sans citation textuelle',
      'Se fier uniquement au générateur automatique sans vérifier manuellement le formatage, car les erreurs sont fréquentes',
    ],
  },
  {
    id: 'rp-revising',
    title: 'Réviser et éditer',
    description: 'Turabian consacre deux chapitres à la révision, soulignant qu\'elle est au moins aussi importante que la rédaction elle-même. La révision opère à trois niveaux : le niveau global (la structure et l\'argumentation), le niveau du paragraphe (la cohérence et la progression) et le niveau de la phrase (la clarté, le style, la grammaire). Il est crucial de réviser dans cet ordre, du global vers le détaillé, car modifier la structure d\'un chapitre rend inutile la révision phrase par phrase de ce même chapitre.',
    keyActivities: [
      'Commencer par une révision structurelle : chaque chapitre contribue-t-il à la thèse ? L\'ordre est-il logique ?',
      'Procéder ensuite à la révision paragraphique : chaque paragraphe a-t-il un topic sentence clair ? La progression est-elle cohérente ?',
      'Enfin, réviser au niveau de la phrase : clarté, concision, précision du vocabulaire, correction grammaticale',
      'Faire relire le manuscrit par au moins deux personnes : une pour le fond, une pour la forme',
      'Lire le texte à voix haute pour détecter les phrases trop longues, les répétitions et les ruptures de rythme',
      'Utiliser les retours de votre directeur de manière systématique en créant un plan de révision priorisé',
    ],
    deliverables: [
      'Une version révisée du manuscrit avec des modifications structurelles, argumentatives et stylistiques',
      'Une liste des corrections apportées et des justifications pour chaque modification majeure',
      'Un texte final relu et corrigé, sans fautes d\'orthographe ni de grammaire',
    ],
    commonPitfalls: [
      'Se limiter à la correction orthographique et négliger la révision structurelle et argumentative',
      'Réviser immédiatement après la rédaction, sans prendre de distance, ce qui empêche de voir les défauts',
      'Ignorer les retours du directeur ou les prendre personnellement au lieu de les traiter comme des contributions à la qualité du texte',
    ],
  },
  {
    id: 'rp-formatting',
    title: 'Formater et présenter',
    description: 'La troisième partie de l\'ouvrage de Turabian traite des normes de présentation qui, bien que souvent perçues comme secondaires, sont en réalité essentielles à la crédibilité professionnelle du manuscrit. L\'orthographe, la ponctuation, l\'usage des nombres, les abréviations, la présentation des tableaux et des figures suivent des conventions précises qui varient selon le style adopté. Une thèse bien formatée signale au lecteur que l\'auteur maîtrise non seulement le contenu mais aussi les codes formels de la communication académique.',
    keyActivities: [
      'Appliquer les règles de formatage de votre institution (marges, police, interligne, pagination) dès le premier jour et non à la fin',
      'Normaliser l\'usage des nombres : écrire en lettres les nombres de zéro à dix en début de phrase, en chiffres au-delà',
      'Vérifier la cohérence de la ponctuation, des abréviations et des symboles dans tout le manuscrit',
      'Formater les tableaux et figures selon les normes : titre au-dessus du tableau, légende en dessous de la figure',
      'Générer automatiquement la table des matières, la liste des figures et la liste des tableaux à partir des styles',
      'Effectuer une vérification finale de la cohérence globale : un seul style de citation, un seul format de date, une seule police',
    ],
    deliverables: [
      'Un manuscrit entièrement formaté selon les normes de votre institution et du style de citation choisi',
      'Des tableaux et figures numérotés, titrés et référencés correctement dans le corps du texte',
      'Une table des matières, une liste des figures et une liste des tableaux générées automatiquement et à jour',
    ],
    commonPitfalls: [
      'Laisser le formatage pour la fin et découvrir qu\'il faut refaire des dizaines de pages, perdant un temps précieux',
      'Mélanger les conventions de formatage (par exemple, abréviations anglaises et françaises dans un même texte)',
      'Négliger les pages préliminaires (page de titre, résumé, remerciements) qui doivent être impeccables car elles donnent la première impression',
    ],
  },
]

// ─── Règles invisibles de la thèse (Brause, 2000) ─────────────────

/** Règle invisible pour réussir sa thèse, d\'après Brause (2000) */
export interface InvisibleRule {
  id: string
  title: string
  description: string
  practicalAdvice: string[]
  metaphor: string
}

export const brauseInvisibleRules: InvisibleRule[] = [
  {
    id: 'ir-dissertation-vs-paper',
    title: 'La thèse n\'est pas un long mémoire',
    description: 'Brause ouvre son ouvrage en déconstruisant l\'idée reçue selon laquelle une thèse serait simplement un mémoire de master rallongé. En réalité, la thèse exige un niveau d\'originalité, de rigueur et de contribution intellectuelle fondamentalement différent. Le mémoire démontre que l\'on maîtrise un champ ; la thèse démontre que l\'on est capable de faire avancer ce champ. Cette distinction a des implications concrètes sur l\'ampleur de la recherche, la profondeur de l\'analyse et la nature du public auquel on s\'adresse.',
    practicalAdvice: [
      'Dès le départ, clarifiez en quoi votre travail apporte une contribution originale et non une simple synthèse de connaissances existantes',
      'Concevez chaque chapitre comme une étape d\'un argumentaire global, et non comme un essai autonome',
      'Adoptez le ton et le niveau d\'exigence d\'un chercheur qui s\'adresse à ses pairs, pas d\'un étudiant qui rend un devoir',
      'Évaluez régulièrement si votre travail pourrait être publié sous forme d\'articles — c\'est un bon indicateur du niveau de thèse',
      'Acceptez que la thèse est un projet public (évalué par un jury) et non un exercice privé entre vous et votre directeur',
    ],
    metaphor: 'La thèse n\'est pas une montagne plus haute que les autres, mais un sommet différent qu\'il faut atteindre par un chemin que personne n\'a encore tracé.',
  },
  {
    id: 'ir-metaphors-matter',
    title: 'Les métaphores guident l\'expérience',
    description: 'Brause consacre un chapitre entier aux métaphores que les doctorants utilisent pour décrire leur expérience, car ces métaphores ne sont pas de simples figures de style : elles façonnent réellement la façon dont on vit le processus doctoral. Celui qui voit la thèse comme un voyage se prépare différemment de celui qui la voit comme un labyrinthe. Les métaphores révèlent des attitudes profondes face à l\'incertitude, à l\'effort et à la durée, et choisir consciemment une métaphore productive peut transformer l\'expérience.',
    practicalAdvice: [
      'Identifiez la métaphore dominante que vous utilisez inconsciemment pour penser votre thèse et évaluez si elle est aidante ou paralysante',
      'Si votre métaphore est le labyrinthe (perdu, bloqué), essayez consciemment de la remplacer par celle du voyage (progression, découverte)',
      'Partagez vos métaphores avec d\'autres doctorants pour prendre conscience de leur influence et découvrir des alternatives',
      'Utilisez la métaphore de la danse pour penser les révisions : un mouvement créatif et ajusté, pas une correction punitive',
      'Évitez la métaphore du marathon si elle vous pousse à l\'épuisement ; préférez celle de la marche à rythme régulier',
      'Notez vos métaphores dans votre journal de bord pour suivre leur évolution au fil du processus doctoral',
    ],
    metaphor: 'La métaphore du labyrinthe vous fait voir chaque impasse comme un échec, tandis que celle du voyage vous fait voir chaque détour comme une découverte.',
  },
  {
    id: 'ir-dependency',
    title: 'Dépendre des autres sans se perdre',
    description: 'Le doctorat est paradoxal : c\'est un travail profondément individuel qui dépend pourtant de nombreux autres acteurs. Brause analyse en détail les relations de dépendance avec le directeur de thèse, le comité de thèse, l\'institution et les pairs. La clé est de comprendre que cette dépendance n\'est pas une faiblesse mais une caractéristique structurelle du doctorat. Le défi est de construire ces relations de manière à ce qu\'elles soutiennent votre autonomie croissante plutôt qu\'elles ne la freinent.',
    practicalAdvice: [
      'Cartographiez dès le début toutes les personnes dont dépend votre avancement et identifiez leurs attentes respectives',
      'Comprenez que le comité de thèse a un rôle de gardien (gate-keeping) institutionnel : ne le prenez pas personnellement',
      'Anticipez les délais institutionnels (approbations éthiques, signatures administratives) car ils sont souvent plus longs que prévu',
      'Cultivez des relations avec d\'autres doctorants qui comprennent vos défis — le soutien par les pairs est irremplaçable',
      'Apprenez à demander de l\'aide de manière spécifique et proactive plutôt que d\'attendre que les problèmes s\'aggravent',
    ],
    metaphor: 'Le doctorant est comme un grimpeur de cordée : il dépend de ses partenaires de cordée, mais c\'est précisément cette dépendance qui lui permet d\'atteindre des sommets inaccessibles en solo.',
  },
  {
    id: 'ir-choose-director',
    title: 'Choisir et gérer la relation avec le directeur',
    description: 'Le choix du directeur de thèse est, selon Brause, l\'une des décisions les plus importantes du doctorat, bien plus déterminante que le choix du sujet lui-même. La relation avec le directeur est une partenariat qui nécessite une communication ouverte, des attentes mutuelles claires et une capacité à naviguer les désaccords constructivement. Brause insiste sur le fait que cette relation évolue au fil du doctorat : le directeur passe progressivement du rôle de guide expert à celui de collègue qui commente le travail d\'un chercheur autonome.',
    practicalAdvice: [
      'Avant de vous engager, rencontrez plusieurs directeurs potentiels pour évaluer la compatibilité de vos styles de travail et de vos visions',
      'Établissez dès le début un accord explicite sur la fréquence des rencontres, le mode de feedback et les délais de réponse',
      'Préparez chaque rendez-vous avec un ordre du jour précis et des questions spécifiques pour maximiser la valeur de l\'échange',
      'Apprenez à interpréter les retours de votre directeur : comprendre ce qu\'il veut dire, pas seulement ce qu\'il dit',
      'Si la relation devient dysfonctionnelle, ne restez pas passif : cherchez des médiations institutionnelles avant qu\'il ne soit trop tard',
    ],
    metaphor: 'Le directeur de thèse est un coach d\'alpinisme : il connaît la montagne, il vous indique les voies possibles, mais c\'est vous qui devez grimper chaque mètre.',
  },
  {
    id: 'ir-topic-ownership',
    title: 'Devenir l\'expert de son sujet',
    description: 'Un moment charnière du doctorat, selon Brause, est celui où le doctorant cesse d\'être un apprenant qui absorbe les connaissances d\'autrui et devient l\'expert de son propre sujet. Ce passage est progressif mais fondamental : il implique de prendre confiance dans sa propre capacité à évaluer les sources, à formuler des jugements et à identifier ce que les experts établis n\'ont pas encore vu. L\'appropriation du sujet n\'est pas de l\'arrogance mais une nécessité méthodologique pour produire une contribution originale.',
    practicalAdvice: [
      'Fixez-vous l\'objectif de devenir LA personne la plus informée au monde sur votre sujet précis — c\'est atteignable et nécessaire',
      'Quand vous lisez un article, pratiquez la lecture critique active : qu\'est-ce que l\'auteur aurait pu faire différemment ?',
      'Identifiez les points aveugles de la littérature existante : les questions que personne ne pose encore dans votre champ',
      'Tenez un carnet où vous enregistrez vos propres idées et hypothèses au même titre que celles des auteurs que vous lisez',
      'Présentez votre travail dans des séminaires et conférences pour tester votre expertise et recevoir des retours extérieurs',
    ],
    metaphor: 'Au début, vous êtes un visiteur dans la maison de la littérature ; à la fin, vous en êtes l\'architecte qui connaît chaque pièce et sait laquelle ajouter.',
  },
  {
    id: 'ir-literate-review',
    title: 'Maîtriser la littérature existante',
    description: 'La revue de littérature n\'est pas un simple inventaire des travaux passés, mais un acte argumentatif qui établit la légitimité de votre propre recherche. Brause souligne que maîtriser la littérature, c\'est être capable de la cartographier, d\'en identifier les zones d\'ombre et de positionner son propre travail par rapport aux courants existants. Une revue de littérature réussie ne se contente pas de résumer : elle organise, évalue et critique pour faire émerger l\'espace intellectuel que votre thèse vient occuper.',
    practicalAdvice: [
      'Construisez une carte conceptuelle de votre champ de recherche identifiant les principaux courants théoriques et leurs relations',
      'Pour chaque source clé, rédigez une note critique qui identifie ses forces, ses limites et sa relation avec votre question',
      'Organisez votre revue de littérature thématiquement et non chronologiquement — la chronologie n\'est pas un argument',
      'Identifiez explicitement les lacunes (gaps) dans la littérature que votre thèse se propose de combler',
      'Lisez les revues de littérature de thèses récentes dans votre domaine pour vous inspirer des meilleures pratiques',
    ],
    metaphor: 'La revue de littérature est comme un portrait de famille : on ne se contente pas de lister les membres, on montre les ressemblances, les différences et les branches encore à explorer.',
  },
  {
    id: 'ir-proposal-to-dissertation',
    title: 'Du projet à la thèse',
    description: 'La proposition de recherche (prospectus) est un point de départ essentiel, mais Brause avertit que la thèse finale différera presque toujours du projet initial, et c\'est une bonne chose. Le processus de recherche transforme la compréhension du doctorant, et cette transformation doit se refléter dans le manuscrit. La flexibilité n\'est pas un manque de rigueur mais une adaptation nécessaire aux découvertes faites en cours de route. Le projet fixe une direction, pas un itinéraire immuable.',
    practicalAdvice: [
      'Rédigez votre proposition de recherche avec soin, mais ne la considérez pas comme un contrat intangible avec votre comité',
      'Documentez les écarts entre votre projet initial et votre travail final — ils sont souvent la marque d\'une maturation intellectuelle',
      'Quand vous découvrez que vos hypothèses initiales sont fausses, ne paniquez pas : c\'est un résultat de recherche valide et précieux',
      'Informez votre directeur des changements importants dans votre orientation au fur et à mesure, pas à la fin',
      'Conservez votre proposition initiale comme point de comparaison pour rédiger la section « limites et perspectives » de votre conclusion',
      'Prévoyez des jalons intermédiaires qui vous permettent de réévaluer la direction de votre recherche à intervalles réguliers',
    ],
    metaphor: 'Le projet de recherche est la boussole, pas le GPS : il vous indique le nord, mais le chemin exact se découvre en marchant.',
  },
  {
    id: 'ir-writing-habits',
    title: 'Écrire régulièrement et en quantité',
    description: 'Brause consacre deux chapitres entiers aux habitudes d\'écriture, car elle considère que l\'écriture est le moteur même de la pensée doctorale, pas sa simple traduction. Écrire régulièrement et en quantité suffisante n\'est pas une question de discipline morale mais de stratégie intellectuelle : c\'est en écrivant qu\'on découvre ce qu\'on pense vraiment. Les blocages d\'écriture sont souvent le symptôme d\'un problème de pensée (une idée pas assez claire) plutôt que d\'un problème d\'expression.',
    practicalAdvice: [
      'Bloquez des créneaux d\'écriture fixes dans votre emploi du temps comme vous bloqueriez un rendez-vous médical — et respectez-les',
      'Visez la régularité avant la quantité : 300 mots par jour tous les jours valent mieux que 3000 mots une fois par mois',
      'Séparez radicalement le moment de la production (rédiger sans juger) du moment de la révision (juger sans rédiger)',
      'Quand vous êtes bloqué, écrivez n\'importe quoi : une lettre à votre mère expliquant votre recherche, une liste de frustrations, un résumé en trois phrases — le blocage se dissipe par l\'action, pas par l\'attente',
      'Tenez un registre de votre production quotidienne pour visualiser votre progression et maintenir votre motivation',
    ],
    metaphor: 'Écrire une thèse, c\'est comme construire un mur de pierres : chaque mot est une pierre, chaque jour ajoute une rangée, et la régularité compte plus que la vitesse.',
  },
  {
    id: 'ir-emotional-journey',
    title: 'Gérer la dimension émotionnelle',
    description: 'Le doctorat est autant une épreuve émotionnelle qu\'intellectuelle, et Brause est l\'un des rares auteurs à aborder cette dimension ouvertement. Le syndrome de l\'imposteur, l\'anxiété de ne pas être à la hauteur, les doutes sur la pertinence de sa recherche et les phases de découragement sont des expériences universelles parmi les doctorants — pas des signaux de faiblesse personnelle. Reconnaître et normaliser ces émotions est la première étape pour les gérer efficacement et les transformer en moteur plutôt qu\'en frein.',
    practicalAdvice: [
      'Normalisez le syndrome de l\'imposteur : la quasi-totalité des doctorants l\'éprouvent, y compris ceux qui réussissent brillamment',
      'Célébrez les petites victoires : un chapitre terminé, un retour positif, une citation acceptée dans une conférence',
      'Créez un groupe de soutien avec d\'autres doctorants qui partagent les mêmes défis émotionnels',
      'Quand le doute vous envahit, relisez vos notes de lecture et vos écrits antérieurs pour vous rappeler le chemin parcouru',
      'Distinguez les doutes légitimes (qui appellent un travail supplémentaire) des peurs irrationnelles (qui appellent de la perspective)',
      'Prenez soin de votre santé physique et mentale : le doctorat est un marathon, pas un sprint',
    ],
    metaphor: 'Le doctorant est un plongeur en haute mer : il y a des moments de panique à la surface et de calme dans les profondeurs, mais il ne faut jamais oublier que l\'on respire.',
  },
  {
    id: 'ir-feedback-cycle',
    title: 'Le cycle des retours et révisions',
    description: 'Le processus de révision est au cœur du travail doctoral, et Brause décrit comment apprendre à recevoir et intégrer les retours est une compétence qui s\'acquiert avec le temps. Les retours du directeur et du comité ne sont pas des jugements personnels mais des contributions à l\'amélioration du texte. Savoir distinguer les retours essentiels (qui touchent à la structure et à l\'argumentation) des retours secondaires (qui concernent le style et la forme) permet de prioriser les révisions et de ne pas se sentir submergé.',
    practicalAdvice: [
      'Quand vous recevez un retour, prenez un jour pour le digérer avant de commencer à réviser — les réactions émotionnelles initiales faussent le jugement',
      'Classez les retours en trois catégories : structurels (à traiter en priorité), argumentatifs (à traiter ensuite), stylistiques (à traiter en dernier)',
      'Demandez des clarifications quand un retour est ambigu — ne devinez pas ce que votre directeur voulait dire',
      'Ne prenez pas les retours personnellement : ils concernent le texte, pas vous en tant que personne ni en tant que chercheur',
      'Gardez une trace de toutes les révisions effectuées et des raisons de vos choix quand vous ne suivez pas un retour',
    ],
    metaphor: 'Les retours sont comme les outils du sculpteur : ils enlèvent ce qui est superflu pour révéler la forme qui était cachée dans le marbre brut.',
  },
  {
    id: 'ir-defense-prep',
    title: 'Préparer la soutenance',
    description: 'La soutenance est la dernière étape mais certainement pas la moins importante. Brause décrit la préparation de la soutenance comme un processus spécifique qui demande des compétences différentes de la rédaction. Il ne suffit pas de connaître son texte par cœur : il faut être capable de le présenter oralement de manière claire et convaincante, de répondre aux questions imprévues avec assurance et de montrer que l\'on maîtrise l\'ensemble du champ de recherche, pas seulement les aspects traités dans la thèse.',
    practicalAdvice: [
      'Préparez une présentation de 20 à 30 minutes qui met en évidence votre contribution originale, pas un résumé exhaustif de chaque chapitre',
      'Anticipez les questions possibles en vous mettant à la place de chaque membre du jury et en identifiant les points faibles de votre travail',
      'Pratiquez votre présentation devant un public test (collègues, amis, famille) et demandez-leur de poser des questions difficiles',
      'Préparez des réponses courtes et précises pour les questions courantes : « Pourquoi cette méthodologie ? », « Quelle est votre contribution ? », « Quelles sont les limites ? »',
      'Le jour de la soutenance, écoutez attentivement chaque question avant de répondre — ne vous précipitez pas, prenez quelques secondes pour réfléchir',
    ],
    metaphor: 'La soutenance est comme une représentation théâtrale : les répétitions déterminent la qualité de la prestation, mais l\'improvisation habile face à l\'imprévu est ce qui distingue les grands interprètes.',
  },
  {
    id: 'ir-completion',
    title: 'Passer de doctorant à docteur',
    description: 'La dernière règle de Brause concerne la transformation identitaire que représente l\'obtention du doctorat. Devenir docteur n\'est pas seulement obtenir un diplôme mais changer de statut intellectuel et professionnel. Cette transition peut être déconcertante : après des années à se définir comme « doctorant », il faut se réinventer en tant que « docteur » et « chercheur ». Brause souligne l\'importance de planifier cette transition et de ne pas la subir passivement, car la période post-thèse est souvent vécue comme un vide aussi difficile que la thèse elle-même.',
    practicalAdvice: [
      'Commencez à planifier votre post-doctorat (emploi, post-doc, publications) au moins six mois avant la soutenance',
      'Transformez votre thèse en articles publiables dès que possible pour capitaliser sur votre travail pendant qu\'il est encore frais',
      'Réfléchissez à votre identité professionnelle post-thèse : quel chercheur voulez-vous devenir ? Dans quel domaine ? Avec quels collègues ?',
      'Acceptez que la fin de la thèse est une perte (celle d\'un projet qui a structuré votre vie pendant des années) et donnez-vous le droit de la vivre',
      'Célébrez votre accomplissement : vous avez mené à bien un projet intellectuel majeur, et cela mérite d\'être reconnu',
      'Maintenez les liens avec votre réseau doctoral — vos collègues de promotion seront vos collègues professionnels pour les décennies à venir',
    ],
    metaphor: 'Le doctorant est une chenille qui a tissé son cocon pendant des années ; le docteur est le papillon qui doit apprendre à voler dans un ciel qu\'il n\'a pas encore exploré.',
  },
]

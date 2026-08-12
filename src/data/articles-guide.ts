/**
 * Données structurées extraites des articles fournis sur la rédaction
 * d'articles scientifiques — guide pratique pour doctorants.
 *
 * Sources principales :
 * - Ecarnot et al. (2015) « Writing a scientific article: A step-by-step guide for beginners »
 *   European Geriatric Medicine 6, 573-579
 * - Autres articles joints (format OCR)
 */

export interface GuideStep {
  id: string;
  title: string;
  icon: string;
  shortDesc: string;
  tips: string[];
  pitfalls: string[];
}

export interface SectionGuide {
  id: string;
  label: string;
  icon: string;
  description: string;
  structure: string[];
  tips: string[];
  example?: string;
  wordCount?: string;
}

export interface Article {
  id: string;
  title: string;
  authors: string;
  source: string;
  year: number;
  doi?: string;
  keyPoints: string[];
}

// ─── Étapes de rédaction ─────────────────────────────────────────
export const writingSteps: GuideStep[] = [
  {
    id: 'prep',
    title: 'Préparation avant la rédaction',
    icon: 'ClipboardList',
    shortDesc: 'Littérature, résultats, journal cible — tout doit être prêt avant d\'écrire.',
    tips: [
      'Finaliser l\'analyse statistique avant de commencer',
      'Choisir le journal cible pour adapter le style et le format',
      'Prendre des notes pendant la revue de littérature avec les références',
      'Utiliser un logiciel de gestion de références (Zotero, Mendeley, EndNote)',
      'Identifier les figures et tableaux clés à l\'avance',
    ],
    pitfalls: [
      'Commencer à écrire sans résultats finaux',
      'Ignorer les guidelines du journal cible',
      'Ne pas organiser ses références dès le départ',
    ],
  },
  {
    id: 'imrad',
    title: 'Respecter la structure IMRaD',
    icon: 'Layout',
    shortDesc: 'Introduction, Methods, Results, and Discussion — le squelette universel.',
    tips: [
      'L\'Introduction répond à « pourquoi ? », les Methods à « comment ? », les Results à « qu\'a-t-on trouvé ? » et la Discussion à « que signifie-t-il ? »',
      'Rédiger les Methods et Results en premier (plus factuels)',
      'L\'Introduction et la Discussion se rédigent en dernier (plus réflexives)',
      'Chaque section doit être autonome et compréhensible séparément',
    ],
    pitfalls: [
      'Mélanger Results et Discussion',
      'Répéter dans la Discussion ce qui est déjà dans les Results',
      'Oublier que chaque section a un rôle précis',
    ],
  },
  {
    id: 'title',
    title: 'Titre et résumé (Abstract)',
    icon: 'Type',
    shortDesc: 'Première impression — ils déterminent si l\'article sera lu.',
    tips: [
      'Le titre doit être concis, informatif et contenir les mots-clés',
      'L\'abstract résume : contexte + objectif + méthode + résultats + conclusion',
      'Rédiger l\'abstract en dernier, quand tout est clair',
      'Respecter strictement le nombre de mots imposé (150-300 mots)',
      'Éviter les abréviations dans le titre et l\'abstract',
    ],
    pitfalls: [
      'Titre trop vague ou trop long',
      'Abstract qui ne correspond pas au contenu',
      'Mettre des références dans l\'abstract',
    ],
  },
  {
    id: 'intro',
    title: 'Rédiger l\'Introduction',
    icon: 'BookOpen',
    shortDesc: 'Contexte → Lacune → Objectif — l\'entonnoir de l\'article.',
    tips: [
      'Commencer par le contexte général du domaine',
      'Réduire progressivement vers la problématique spécifique',
      'Identifier clairement le « gap » dans la littérature',
      'Formuler l\'objectif/hypothèse en fin d\'introduction',
      'Citer les références les plus pertinentes (pas une liste exhaustive)',
      'Éviter de mettre des résultats dans l\'introduction',
    ],
    pitfalls: [
      'Faire un « review » complet au lieu d\'une introduction ciblée',
      'Ne pas identifier clairement la lacune de connaissance',
      'Oublier de formuler l\'objectif de l\'étude',
    ],
  },
  {
    id: 'methods',
    title: 'Rédiger les Methods (Matériel et Méthodes)',
    icon: 'FlaskConical',
    shortDesc: 'Réplicabilité — le lecteur doit pouvoir reproduire l\'étude.',
    tips: [
      'Décrire suffisamment pour permettre la réplication',
      'Organiser en sous-sections : population, protocole, mesures, analyse',
      'Préciser les critères d\'inclusion/exclusion',
      'Nommer les tests statistiques utilisés et le seuil de signification',
      'Mentionner l\'approbation éthique et le consentement',
      'Utiliser le passé composé ou passé simple',
    ],
    pitfalls: [
      'Trop de détails non pertinents',
      'Oublier des éléments essentiels à la reproduction',
      'Ne pas mentionner les approbations éthiques',
    ],
  },
  {
    id: 'results',
    title: 'Rédiger les Results (Résultats)',
    icon: 'BarChart3',
    shortDesc: 'Présentation neutre et factuelle des données — pas d\'interprétation.',
    tips: [
      'Présenter les résultats de manière logique et séquentielle',
      'Utiliser des tableaux et figures pour les données complexes',
      'Ne pas répéter dans le texte ce qui est déjà dans un tableau/figure',
      'Rapporter les résultats négatifs aussi',
      'Inclure les mesures de dispersion (écart-type, IC)',
      'Ne pas interpréter — juste décrire',
    ],
    pitfalls: [
      'Commencer à interpréter les résultats',
      'Répéter intégralement le contenu des tableaux dans le texte',
      'Omettre les résultats non significatifs',
    ],
  },
  {
    id: 'discussion',
    title: 'Rédiger la Discussion',
    icon: 'MessageSquare',
    shortDesc: 'Interprétation, mise en contexte et implications — la valeur ajoutée.',
    tips: [
      'Commencer par un résumé des principaux résultats (sans chiffres)',
      'Comparer avec la littérature existante (concordances et divergences)',
      'Discuter les forces et limites de l\'étude',
      'Proposer des implications cliniques/pratiques',
      'Suggérer des pistes de recherche future',
      'Être honnête sur les limites sans les minimiser',
    ],
    pitfalls: [
      'Répéter les résultats en détail',
      'Ignorer les études contradictoires',
      'Être dogmatique ou trop défensif',
    ],
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    icon: 'CheckCircle2',
    shortDesc: 'Synthèse finale — brève, claire, sans nouveau contenu.',
    tips: [
      'Résumer en 2-3 phrases la contribution principale',
      'Répondre explicitement à l\'objectif formulé dans l\'introduction',
      'Ne pas introduire de nouvelles données ou références',
      'Éviter les conclusions non supportées par les résultats',
    ],
    pitfalls: [
      'Répéter l\'abstract mot pour mot',
      'Ajouter de nouveaux arguments',
      'Être trop long (max 1 paragraphe)',
    ],
  },
  {
    id: 'references',
    title: 'Gérer les références bibliographiques',
    icon: 'BookMarked',
    shortDesc: 'Crédibilité et traçabilité — chaque affirmation doit être sourcée.',
    tips: [
      'Utiliser un gestionnaire de références (Zotero est gratuit)',
      'Vérifier chaque référence contre l\'original',
      'Respecter le style de citation du journal (Vancouver, APA, Harvard…)',
      'Citer les articles originaux plutôt que les revues de revue',
      'Éviter les auto-citations excessives',
      'Limites typiques : 20-40 références pour un article original',
    ],
    pitfalls: [
      'Citations inexistantes ou incorrectes',
      'Trop de références obsolètes (> 10 ans sans justification)',
      'Ne pas respecter le format demandé par le journal',
    ],
  },
  {
    id: 'submission',
    title: 'Soumission et processus de review',
    icon: 'Send',
    shortDesc: 'Cover letter, réponse aux reviewers, révisions — la dernière ligne droite.',
    tips: [
      'Rédiger une cover letter personnalisée (pas un modèle générique)',
      'Vérifier que le manuscrit respecte TOUTES les guidelines du journal',
      'Répondre point par point aux commentaires des reviewers',
      'Être respectueux même en désaccord avec un reviewer',
      'Prévoir des délais (le processus peut prendre 3-12 mois)',
      'Vérifier les droits d\'auteur et les conflits d\'intérêts',
    ],
    pitfalls: [
      'Soumettre sans relire les guidelines du journal',
      'Ignorer des commentaires de reviewers',
      'Répondre de manière agressive aux critiques',
    ],
  },
];

// ─── Guide par section IMRaD ─────────────────────────────────────
export const sectionGuides: SectionGuide[] = [
  {
    id: 'title-section',
    label: 'Titre',
    icon: 'Type',
    description: 'Premier élément lu — doit capter l\'attention et refléter le contenu.',
    structure: [
      'Concis (10-15 mots idéalement)',
      'Informatif — indique le sujet et le type d\'étude',
      'Contient les mots-clés principaux',
      'Évite les abréviations',
    ],
    tips: [
      'Testez : est-ce que le lecteur comprend le sujet en lisant le titre seul ?',
      'Formule interrogative acceptable si le journal l\'accepte',
      'Les « deux points » peuvent aider : « Effet de X sur Y : une étude de cohorte »',
    ],
    wordCount: '10-15 mots',
  },
  {
    id: 'abstract-section',
    label: 'Résumé (Abstract)',
    icon: 'FileText',
    description: 'Souvent le seul texte accessible gratuitement — doit être autonome et complet.',
    structure: [
      'Contexte (1-2 phrases)',
      'Objectif (1 phrase)',
      'Méthode (2-3 phrases)',
      'Résultats principaux (3-5 phrases avec chiffres)',
      'Conclusion (1-2 phrases)',
    ],
    tips: [
      'Ne citez pas de références',
      'Rédigez-le en tout dernier',
      'Mots-clés en fin d\'abstract (4-6 termes)',
    ],
    wordCount: '150-300 mots',
    example: 'Contexte : La réhabilitation du centre-ville nécessite… Objectif : Cette étude vise à évaluer… Méthode : Nous avons analysé 200 projets de… Résultats : 67% des projets ont montré… Conclusion : Ces résultats suggèrent que…',
  },
  {
    id: 'intro-section',
    label: 'Introduction',
    icon: 'BookOpen',
    description: 'Structure en entonnoir : du général vers le spécifique. Se termine par l\'objectif.',
    structure: [
      '§1 : Contexte général du domaine',
      '§2 : État de l\'art (ce qui est connu)',
      '§3 : Lacune identifiée (ce qui manque)',
      '§4 : Objectif et hypothèses de l\'étude',
    ],
    tips: [
      '4-6 paragraphes suffisent',
      'Chaque paragraphe a un rôle précis',
      'La dernière phrase de l\'introduction formule l\'objectif',
      'Ne pas présenter les résultats',
    ],
    wordCount: '300-500 mots',
  },
  {
    id: 'methods-section',
    label: 'Matériel et Méthodes',
    icon: 'FlaskConical',
    description: 'Doit permettre la réplication exacte de l\'étude par un autre chercheur.',
    structure: [
      'Cadre de l\'étude (type, lieu, période)',
      'Population / Échantillon (critères d\'inclusion/exclusion)',
      'Variables étudiées',
      'Protocole / Instruments de mesure',
      'Méthodes d\'analyse statistique',
      'Considérations éthiques',
    ],
    tips: [
      'Sous-titres recommandés pour la clarté',
      'Verbe au passé (nous avons mesuré…)',
      'Citer les méthodes validées déjà publiées',
    ],
    wordCount: '500-1500 mots',
  },
  {
    id: 'results-section',
    label: 'Résultats',
    icon: 'BarChart3',
    description: 'Présentation factuelle et neutre. Aucune interprétation ici.',
    structure: [
      'Description de l\'échantillon (caractéristiques)',
      'Résultats principaux (dans l\'ordre logique)',
      'Résultats secondaires',
      'Résultats de sensibilité / analyses complémentaires',
    ],
    tips: [
      'Les tableaux et figures portent les détails — le texte résume',
      'Nombre dans le texte → renvoi au tableau/figure correspondant',
      'Présenter les résultats négatifs avec la même rigueur',
      'Ordre logique = ordre des hypothèses ou chronologique',
    ],
    wordCount: '500-1500 mots',
  },
  {
    id: 'discussion-section',
    label: 'Discussion',
    icon: 'MessageSquare',
    description: 'Interprétation, mise en perspective et implications — la section la plus difficile.',
    structure: [
      'Résumé des principaux résultats (sans chiffres)',
      'Comparaison avec la littérature',
      'Interprétation et explications',
      'Forces de l\'étude',
      'Limites',
      'Implications et perspectives',
    ],
    tips: [
      'Ne pas répéter les résultats numériques',
      'Être équilibré : discuter les résultats positifs ET négatifs',
      'Les limites montrent la rigueur scientifique, pas la faiblesse',
      'La dernière phrase peut suggérer une application pratique',
    ],
    wordCount: '500-1500 mots',
  },
  {
    id: 'conclusion-section',
    label: 'Conclusion',
    icon: 'CheckCircle2',
    description: 'Dernière impression — brève, percutante, en lien avec l\'objectif.',
    structure: [
      'Réponse à la question de recherche',
      'Synthèse de la contribution principale',
      'Ouverture (1 phrase max, si pertinent)',
    ],
    tips: [
      '1 paragraphe maximum',
      'Pas de nouveaux arguments ou données',
      'Doit faire écho à l\'objectif de l\'introduction',
    ],
    wordCount: '50-150 mots',
  },
];

// ─── Articles de référence ───────────────────────────────────────
export const referenceArticles: Article[] = [
  {
    id: 'ecarnot-2015',
    title: 'Writing a scientific article: A step-by-step guide for beginners',
    authors: 'F. Ecarnot, M.-F. Seronde, R. Chopard, F. Schiele, N. Meneveau',
    source: 'European Geriatric Medicine',
    year: 2015,
    doi: '10.1016/j.eurger.2015.08.005',
    keyPoints: [
      'Guide pas-à-pas pour la rédaction scientifique',
      'Approche systématique IMRaD',
      'Conseils pratiques pour chaque section',
      'Erreurs fréquentes à éviter',
    ],
  },
];

// ─── Checklist de soumission ─────────────────────────────────────
export const submissionChecklist: { category: string; items: string[] }[] = [
  {
    category: 'Avant la rédaction',
    items: [
      'Résultats statistiques finalisés',
      'Journal cible identifié et guidelines consultées',
      'Gestionnaire de références configuré',
      'Figures et tableaux préparés',
    ],
  },
  {
    category: 'Rédaction',
    items: [
      'Methods et Results rédigés en premier',
      'Introduction et Discussion rédigés en dernier',
      'Abstract rédigé en tout dernier',
      'Titre vérifié (concis, informatif)',
      'Toutes les sections relues pour cohérence',
    ],
  },
  {
    category: 'Relecture',
    items: [
      'Relecture par un pair / directeur',
      'Vérification des références (format + exactitude)',
      'Vérification orthographe/grammaire',
      'Tableaux et figures cohérents avec le texte',
      'Nombre de mots respecté pour chaque section',
    ],
  },
  {
    category: 'Soumission',
    items: [
      'Cover letter rédigée et personnalisée',
      'Tous les formulaires du journal remplis',
      'Fichiers dans le bon format (PDF, Word, images)',
      'Droits d\'auteur et conflits d\'intérêts déclarés',
      'Tous les co-auteurs ont lu et approuvé',
    ],
  },
];

// ─── Erreurs fréquentes globales ─────────────────────────────────
export const commonMistakes: {
  mistake: string;
  consequence: string;
  fix: string;
}[] = [
  {
    mistake: 'Mélanger Résultats et Discussion',
    consequence: 'Le lecteur ne distingue pas les faits des interprétations',
    fix: 'Maintenir une séparation stricte : les Results décrivent, la Discussion interprète',
  },
  {
    mistake: 'Introduction trop longue (type revue de littérature)',
    consequence: 'Perte de focus, lecteur noyé dans les détails',
    fix: 'Cibler : contexte → lacune → objectif en 4-6 paragraphes max',
  },
  {
    mistake: 'Abstract rédigé avant le reste',
    consequence: 'Incohérence avec le contenu final',
    fix: 'Rédiger l\'abstract en tout dernier',
  },
  {
    mistake: 'Ne pas vérifier les guidelines du journal',
    consequence: 'Rejet immédiat sans review (desk rejection)',
    fix: 'Consulter les « Instructions to Authors » AVANT de rédiger',
  },
  {
    mistake: 'Répéter les résultats dans la Discussion',
    consequence: 'Redondance, article trop long, agacement du reviewer',
    fix: 'Résumer les résultats en 2-3 phrases dans la Discussion, sans chiffres détaillés',
  },
  {
    mistake: 'Ignorer les résultats négatifs',
    consequence: 'Biais de publication, manque de crédibilité',
    fix: 'Rapporter tous les résultats, même non significatifs',
  },
  {
    mistake: 'Références incomplètes ou incorrectes',
    consequence: 'Perte de crédibilité, rejet possible',
    fix: 'Utiliser un gestionnaire de références et vérifier chaque entrée',
  },
  {
    mistake: 'Ne pas mentionner les limites',
    consequence: 'Apparaît comme un manque de rigueur scientifique',
    fix: 'Toujours inclure un paragraphe sur les forces et limites',
  },
];
/**
 * Guide complet du protocole de revue systématique de la littérature (SLR)
 * Basé sur le template PRISMA-P (Shamseer et al., 2015) et la forme généralisée
 * d'enregistrement de revue systématique (van den Akker et al., 2020).
 *
 * Source : SLR-Protocol-template_08-2024_v2.docx (University of Twente / Maastricht University)
 *
 * Ce fichier complète lr-typology.ts (qui contient la checklist PRISMA 2020)
 * en fournissant le guide structuré complet pour rédiger un protocole.
 */

export interface ProtocolSection {
  id: string
  title: string
  description: string
  fields: ProtocolField[]
}

export interface ProtocolField {
  id: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'list' | 'select'
  options?: string[]
  required?: boolean
  helpText?: string
}

export const SLR_PROTOCOL_SECTIONS: ProtocolSection[] = [
  {
    id: 'identification',
    title: 'Identification du protocole',
    description: 'Métadonnées de base du protocole de revue.',
    fields: [
      { id: 'title', label: 'Titre de la revue', placeholder: 'Ex. : The role of self-regulation in AI-assisted learning: a systematic review', type: 'text', required: true },
      { id: 'authors', label: 'Auteurs et affiliations', placeholder: 'Nom Prénom (Institution), …', type: 'text', required: true },
      { id: 'registration', label: 'Enregistrement du protocole', placeholder: 'Ex. : PROSPERO CRD42025000000 — ou « Non enregistré »', type: 'text' },
      { id: 'type', label: 'Type de revue', type: 'select', options: ['Revue systématique narrative', 'Méta-analyse', 'Carte des preuves (evidence map)', 'Revue de portée (scoping review)'], required: true },
      { id: 'guidelines', label: 'Lignes directrices suivies', placeholder: 'PRISMA 2020, PRISMA-P, Cochrane, …', type: 'text' },
    ],
  },
  {
    id: 'background',
    title: 'Contexte et justification',
    description: 'Introduction du sujet, état des connaissances et justification de la revue.',
    fields: [
      { id: 'topic-intro', label: 'Présentation du sujet', placeholder: 'Décrivez le thème général de la revue et son importance dans le champ disciplinaire.', type: 'textarea', required: true, helpText: 'Contextualisez : pourquoi ce sujet est-il pertinent maintenant ?' },
      { id: 'known-literature', label: 'État des connaissances actuelles', placeholder: 'Résumez les principales conclusions déjà établies dans la littérature.', type: 'textarea', helpText: 'Citez les revues systématiques antérieures le cas échéant.' },
      { id: 'justification', label: 'Justification de la revue', placeholder: 'Pourquoi cette revue est-elle nécessaire ? Quelle lacune comble-t-elle ?', type: 'textarea', required: true, helpText: 'Identifiez ce qui manque : absence de synthèse récente, périmètre géographique non couvert, etc.' },
      { id: 'previous-reviews', label: 'Revues systématiques antérieures', placeholder: 'Listez les revues existantes et expliquez en quoi la vôtre est différente ou mise à jour.', type: 'textarea' },
    ],
  },
  {
    id: 'research-questions',
    title: 'Questions de recherche',
    description: 'Formulez les questions principale(s) et secondaire(s) de la revue.',
    fields: [
      { id: 'primary-questions', label: 'Question(s) de recherche principale(s)', placeholder: 'Ex. : Quel est l\'effet de X sur Y chez la population Z ?', type: 'list', required: true, helpText: 'Utilisez un cadre comme PICO (Population, Intervention, Comparaison, Résultat) ou SPIDER.' },
      { id: 'secondary-questions', label: 'Question(s) secondaire(s)', placeholder: 'Questions exploratoires ou complémentaires.', type: 'list', helpText: 'Ces questions influencent moins le design mais seront incluses dans le rapport final.' },
      { id: 'framework', label: 'Cadre de formulation utilisé', type: 'select', options: ['PICO (Population, Intervention, Comparison, Outcome)', 'SPIDER (Sample, Phenomenon of Interest, Design, Evaluation, Research type)', 'PICo (Population, Interest, Context)', 'COSMIN (pour les mesures)', 'Autre / Aucun'] },
    ],
  },
  {
    id: 'team',
    title: 'Équipe de revue',
    description: 'Membres de l\'équipe et rôles.',
    fields: [
      { id: 'members', label: 'Membres de l\'équipe', placeholder: 'Nom — Affiliation — Rôle (ex. : screening, extraction, analyse)', type: 'list', required: true, helpText: 'Utilisez la taxonomie CRediT pour les rôles si possible.' },
      { id: 'conflict-resolution', label: 'Résolution des conflits', placeholder: 'Ex. : En cas de désaccord au screening, un troisième évaluateur tranche.', type: 'textarea' },
    ],
  },
  {
    id: 'search-strategy',
    title: 'Stratégie de recherche',
    description: 'Bases de données, requêtes, littérature grise et autres méthodes de recherche.',
    fields: [
      { id: 'databases', label: 'Bases de données', placeholder: 'Ex. : Scopus, Web of Science, PsycINFO, PubMed, ERIC', type: 'list', required: true, helpText: 'Justifiez chaque base : que type de littérature couvre-t-elle ?' },
      { id: 'search-strings', label: 'Chaînes de recherche', placeholder: 'Collez vos requêtes Booléennes pour chaque base (ex. : (\"self-regulation\" OR \"self regulation\") AND (\"AI\" OR \"artificial intelligence\"))', type: 'textarea', required: true, helpText: 'Identifiez d\'abord les concepts clés mutuellement exclusifs, puis les synonymes pour chaque.' },
      { id: 'grey-literature', label: 'Littérature grise', placeholder: 'Ex. : ProQuest Dissertations, PsyArXiv, Google Scholar (100 premiers résultats), Google Patents', type: 'list', helpText: 'Thèses, preprints, rapports gouvernementaux, actes de conférence.' },
      { id: 'other-strategies', label: 'Autres stratégies', placeholder: 'Ex. : Citation arrière (références des articles inclus), citation avant (articles citant les inclus), contact avec auteurs', type: 'textarea' },
      { id: 'dates-limits', label: 'Restrictions temporelles et linguistiques', placeholder: 'Ex. : 2015-2025, articles en anglais et français uniquement', type: 'text' },
    ],
  },
  {
    id: 'eligibility',
    title: 'Critères d\'éligibilité',
    description: 'Critères d\'inclusion et d\'exclusion appliqués lors du screening.',
    fields: [
      { id: 'inclusion', label: 'Critères d\'inclusion', placeholder: 'Ex. : Études empiriques quantitatives publiées dans des revues à comité de lecture', type: 'list', required: true, helpText: 'Ce sont les « must-have » — ils guident la conception de la requête.' },
      { id: 'exclusion', label: 'Critères d\'exclusion', placeholder: 'Ex. : Études de cas uniques, articles de opinion, sans données empiriques', type: 'list', required: true, helpText: 'Appliqués pendant le screening — dès qu\'un critère est rempli, l\'article est exclu.' },
      { id: 'population', label: 'Population cible', placeholder: 'Ex. : Étudiants de l\'enseignement supérieur (18+ ans)', type: 'text' },
      { id: 'study-designs', label: 'Designs d\'étude acceptés', placeholder: 'Ex. : RCT, quasi-expérimental, transversal, longitudinal', type: 'list' },
    ],
  },
  {
    id: 'screening',
    title: 'Processus de sélection (screening)',
    description: 'Étapes, outils et instructions pour le criblage des articles.',
    fields: [
      { id: 'stages', label: 'Étapes de screening', placeholder: 'Ex. : 1) Titres seuls → 2) Titres + résumés → 3) Texte intégral', type: 'textarea', required: true, helpText: 'Décrivez chaque round : quels champs sont visibles, quels champs sont masqués ?' },
      { id: 'deduplication', label: 'Procédure de déduplication', placeholder: 'Ex. : Export dans Zotero → déduplication automatique → vérification manuelle', type: 'text', required: true },
      { id: 'pilot-screening', label: 'Screening pilote', placeholder: 'Ex. : 50 articles testés par 2 évaluateurs, calcul de concordance (Cohen\'s κ ≥ 0.80)', type: 'textarea', helpText: 'Un pilote permet d\'affiner les critères avant le screening complet.' },
      { id: 'screening-tool', label: 'Outil de screening', placeholder: 'Ex. : Covidence, Rayyan, ASReview, Excel', type: 'text' },
      { id: 'screener-instructions', label: 'Instructions aux évaluateurs', placeholder: 'Consignes spécifiques données aux personnes qui effectuent le screening.', type: 'textarea' },
    ],
  },
  {
    id: 'data-extraction',
    title: 'Extraction des données',
    description: 'Items à extraire, étapes et outils.',
    fields: [
      { id: 'data-items', label: 'Données à extraire', placeholder: 'Ex. : Auteurs, année, pays, design, N, variables IV/DV, tailles d\'effet, principaux résultats', type: 'list', required: true, helpText: 'Listez les variables, estimations et métadonnées à extraire de chaque source.' },
      { id: 'extraction-stages', label: 'Étapes d\'extraction', placeholder: 'Ex. : 1) Formation → 2) Test de fiabilité (10% double extraction) → 3) Extraction finale', type: 'textarea', required: true },
      { id: 'extraction-tool', label: 'Outil d\'extraction', placeholder: 'Ex. : Formulaire Excel personnalisé, Covidence, extraction assistée par NLP', type: 'text' },
      { id: 'missing-data', label: 'Gestion des données manquantes', placeholder: 'Ex. : Contact par courriel des auteurs (2 relances, 3 semaines d\'attente)', type: 'textarea' },
    ],
  },
  {
    id: 'quality-assessment',
    title: 'Évaluation de la qualité (risk of bias)',
    description: 'Outils et procédures d\'évaluation du risque de biais.',
    fields: [
      { id: 'tool', label: 'Outil d\'évaluation', placeholder: 'Ex. : Cochrane Risk of Bias (RoB 2), CASP, Newcastle-Ottawa Scale, MMAT', type: 'text', required: true, helpText: 'Choisissez l\'outil adapté au design d\'étude majoritaire.' },
      { id: 'criteria', label: 'Critères évalués', placeholder: 'Ex. : Randomisation, allocation dissimulée, aveugle, données incomplètes, rapport sélectif', type: 'list' },
      { id: 'impact', label: 'Impact sur la synthèse', placeholder: 'Ex. : Les études à haut risque de biais ne sont pas exclues mais pondérées différemment.', type: 'textarea', helpText: 'Précisez si les études de faible qualité sont exclues ou pondérées.' },
    ],
  },
  {
    id: 'synthesis',
    title: 'Synthèse des résultats',
    description: 'Méthode de synthèse et analyse prévue.',
    fields: [
      { id: 'method', label: 'Méthode de synthèse', type: 'select', options: ['Synthèse narrative thématique', 'Synthèse narrative structurée', 'Méta-analyse (effets aléatoires)', 'Méta-analyse (effets fixes)', 'Analyse de thème (thematic analysis)', 'Synthèse de cadre (framework synthesis)', 'Autre'], required: true },
      { id: 'transformations', label: 'Transformations de données', placeholder: 'Ex. : Conversion de toutes les tailles d\'effet en r de Pearson, aggregation par échantillon', type: 'textarea' },
      { id: 'subgroup-analysis', label: 'Analyses en sous-groupes prévues', placeholder: 'Ex. : Par niveau éducatif, par région géographique, par type d\'intervention', type: 'list' },
      { id: 'publication-bias', label: 'Évaluation du biais de publication', placeholder: 'Ex. : Funnel plot, test d\'Egger, trim-and-fill', type: 'text' },
      { id: 'confidence-evidence', label: 'Évaluation de la confiance (GRADE)', placeholder: 'Ex. : Évaluation GRADE pour chaque critère de résultat', type: 'textarea' },
    ],
  },
  {
    id: 'additional',
    title: 'Informations complémentaires',
    description: 'Financement, conflits d\'intérêts, déclarations.',
    fields: [
      { id: 'funding', label: 'Sources de financement', placeholder: 'Ex. : Cette revue n\'a reçu aucun financement spécifique.', type: 'text' },
      { id: 'conflicts', label: 'Déclaration de conflits d\'intérêts', placeholder: 'Ex. : Aucun conflit d\'intérêts déclaré.', type: 'text' },
      { id: 'timeline', label: 'Calendrier prévisionnel', placeholder: 'Ex. : Recherche : janv-fév 2026 | Screening : mars-avril | Extraction : mai | Synthèse : juin-juillet', type: 'text' },
    ],
  },
]

/**
 * Références clés citées dans le protocole.
 */
export const SLR_KEY_REFERENCES = [
  {
    id: 'shamseer-2015',
    citation: 'Shamseer, L., Moher, D., Clarke, M., et al. (2015).',
    title: 'Preferred reporting items for systematic review and meta-analysis protocols (PRISMA-P) 2015.',
    journal: 'BMJ, 350, g7647.',
  },
  {
    id: 'vandenakker-2020',
    citation: 'van den Akker, O., Peters, G.-J., et al. (2020).',
    title: 'Generalized Systematic Review Registration Form.',
    journal: 'OSF Preprint, doi:10.31222/osf.io/3nbea',
  },
  {
    id: 'booth-2019',
    citation: 'Booth, A., Noyes, J., Flemming, K., et al. (2019).',
    title: 'Formulating questions to explore complex interventions within qualitative evidence synthesis.',
    journal: 'BMJ Global Health, 4(Suppl 1), e001107.',
  },
  {
    id: 'sutton-2019',
    citation: 'Sutton, A., Clowes, M., Preston, L., & Booth, A. (2019).',
    title: 'Meeting the review family: exploring review types and associated information retrieval requirements.',
    journal: 'Health Information & Libraries Journal, 36(3), 202-222.',
  },
]

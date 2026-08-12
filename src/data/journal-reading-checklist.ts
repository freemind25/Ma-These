/**
 * Checklist interactive pour la lecture d'articles scientifiques
 * 9 étapes structurées — adapté de Proofreadingepic (Proofreadingepic.com)
 * Traduit et adapté pour le contexte francophone doctoral.
 *
 * Chaque étape contient des champs à remplir (checkboxes + champs texte)
 * pour extraire systématiquement l'information utile d'un article.
 */

export interface ChecklistField {
  id: string
  label: string
  type: 'checkbox' | 'text' | 'textarea'
  placeholder?: string
}

export interface ChecklistStep {
  id: string
  number: number
  title: string
  icon: string
  description: string
  fields: ChecklistField[]
}

export const READING_CHECKLIST: ChecklistStep[] = [
  {
    id: 'basic-info',
    number: 1,
    title: 'Informations de base',
    icon: 'FileText',
    description: 'Identifiez les métadonnées essentielles de l\'article.',
    fields: [
      { id: 'title', label: 'Titre de l\'article', type: 'text', placeholder: 'Copiez le titre complet' },
      { id: 'authors', label: 'Auteur(s)', type: 'text', placeholder: 'Nom, Initiale. (ex. : Ahmad, A., Lim, B. & Tan, C.)' },
      { id: 'year', label: 'Année de publication', type: 'text', placeholder: '2024' },
      { id: 'journal', label: 'Nom de la revue', type: 'text', placeholder: 'Computers in Human Behavior' },
      { id: 'doi', label: 'DOI / URL', type: 'text', placeholder: 'https://doi.org/...' },
      { id: 'country', label: 'Pays', type: 'text', placeholder: 'Malaisie, France, …' },
      { id: 'field', label: 'Champ de recherche', type: 'text', placeholder: 'Psychologie de l\'éducation, marketing, …' },
    ],
  },
  {
    id: 'background',
    number: 2,
    title: 'Contexte de la recherche',
    icon: 'Search',
    description: 'Quel problème cet article tente-t-il de résoudre ?',
    fields: [
      { id: 'problem', label: 'Quel problème cette étude tente-t-elle de résoudre ?', type: 'textarea', placeholder: 'Décrivez en 2-3 phrases le problème identifié par les auteurs.' },
      { id: 'importance', label: 'Pourquoi cette étude est-elle importante ?', type: 'textarea', placeholder: 'Quelle est la pertinence scientifique ou pratique ?' },
    ],
  },
  {
    id: 'objectives',
    number: 3,
    title: 'Objectifs et questions de recherche',
    icon: 'Target',
    description: 'Quel est l\'objectif principal et les questions posées ?',
    fields: [
      { id: 'main-objective', label: 'Objectif principal', type: 'textarea', placeholder: 'L\'objectif principal de cette étude est de…' },
      { id: 'research-questions', label: 'Questions de recherche', type: 'textarea', placeholder: 'Listez les questions de recherche (une par ligne)' },
    ],
  },
  {
    id: 'theory',
    number: 4,
    title: 'Cadre théorique',
    icon: 'BookOpen',
    description: 'Quelle théorie ou quel cadre est utilisé ?',
    fields: [
      { id: 'framework', label: 'Théorie / cadre théorique utilisé', type: 'text', placeholder: 'Ex. : Théorie de l\'autodétermination, TAM, …' },
      { id: 'framework-justification', label: 'Pourquoi ce cadre a-t-il été choisi ?', type: 'textarea', placeholder: 'Justification des auteurs pour le choix de cette théorie.' },
    ],
  },
  {
    id: 'methodology',
    number: 5,
    title: 'Méthodologie',
    icon: 'FlaskConical',
    description: 'Design, échantillon et outils de collecte.',
    fields: [
      { id: 'design', label: 'Design de recherche', type: 'text', placeholder: 'Quantitatif, qualitatif, mixte' },
      { id: 'sample-size', label: 'Taille de l\'échantillon (N)', type: 'text', placeholder: '350' },
      { id: 'sampling', label: 'Méthode d\'échantillonnage', type: 'text', placeholder: 'Échantillonnage stratifié, convenance, …' },
      { id: 'instrument', label: 'Instrument de collecte', type: 'text', placeholder: 'Questionnaire, entretiens semi-directifs, …' },
      { id: 'analysis', label: 'Méthode d\'analyse', type: 'text', placeholder: 'Régression multiple, SEM, analyse thématique, …' },
    ],
  },
  {
    id: 'findings',
    number: 6,
    title: 'Résultats principaux',
    icon: 'BarChart3',
    description: 'Les 3 principaux résultats de l\'étude.',
    fields: [
      { id: 'finding-1', label: 'Résultat principal 1', type: 'textarea', placeholder: 'Ex. : X a un effet positif significatif sur Y (β = 0.42, p < .001)' },
      { id: 'finding-2', label: 'Résultat principal 2', type: 'textarea', placeholder: 'Deuxième résultat marquant.' },
      { id: 'finding-3', label: 'Résultat principal 3', type: 'textarea', placeholder: 'Troisième résultat notable.' },
    ],
  },
  {
    id: 'gap',
    number: 7,
    title: 'Lacune de recherche',
    icon: 'Puzzle',
    description: 'Limites identifiées et pistes de recherche future.',
    fields: [
      { id: 'limitations', label: 'Limites mentionnées par les auteurs', type: 'textarea', placeholder: 'Quelles limites les auteurs ont-ils eux-mêmes identifiées ?' },
      { id: 'future-research', label: 'Recherches futures suggérées', type: 'textarea', placeholder: 'Quelles pistes de recherche les auteurs recommandent-ils ?' },
      { id: 'reusable-gap', label: 'Cette lacune est-elle exploitable dans votre étude ?', type: 'text', placeholder: 'Oui — pour… / Non — car…' },
    ],
  },
  {
    id: 'critical-analysis',
    number: 8,
    title: 'Analyse critique',
    icon: 'Scale',
    description: 'Forces, faiblesses et votre position.',
    fields: [
      { id: 'strengths', label: 'Forces de l\'étude', type: 'textarea', placeholder: 'Ex. : Échantillon important, méthode rigoureuse, …' },
      { id: 'weaknesses', label: 'Faiblesses de l\'étude', type: 'textarea', placeholder: 'Ex. : Biais de sélection, auto-déclaration, …' },
      { id: 'agreement', label: 'Êtes-vous en accord avec les conclusions ?', type: 'textarea', placeholder: 'Expliquez pourquoi vous êtes d\'accord ou non.' },
    ],
  },
  {
    id: 'reusability',
    number: 9,
    title: 'Réutilisabilité dans votre travail',
    icon: 'Bookmark',
    description: 'Comment cet article peut-il servir dans votre thèse ?',
    fields: [
      { id: 'use-lr', label: 'Revue de littérature', type: 'checkbox' },
      { id: 'use-theory', label: 'Cadre théorique', type: 'checkbox' },
      { id: 'use-questionnaire', label: 'Questionnaire / Instrument', type: 'checkbox' },
      { id: 'use-methodology', label: 'Méthodologie', type: 'checkbox' },
      { id: 'use-discussion', label: 'Discussion', type: 'checkbox' },
      { id: 'use-references', label: 'Références (citations secondaires)', type: 'checkbox' },
      { id: 'summary', label: 'Résumé en 5 phrases', type: 'textarea', placeholder: 'Rédigez un résumé synthétique de cet article en 5 phrases maximum.' },
    ],
  },
]

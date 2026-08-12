// ─── Six conseils pour réussir la publication académique ───
// Source : Maithe Enriquez, APRN, Ph.D., FAAN – Hispanic Health Care International, Vol. 20(1), 2022

export interface PublicationTip {
  id: string
  number: string
  title: string
  titleEn: string
  description: string
  details: string[]
  severity: 'critical' | 'important' | 'recommended'
  icon: string
}

export const PUBLICATION_TIPS: PublicationTip[] = [
  {
    id: 'tip1',
    number: '01',
    title: 'Transformez vos travaux de cours en publications',
    titleEn: 'That paper from your graduate course…',
    description: 'Les travaux de qualité rédigés pendant vos études de troisième cycle sont d\'excellentes bases pour des articles publiables.',
    details: [
      'Identifiez les travaux les plus solides de vos cours et séminaires',
      'Adaptez le format au style d\'une revue ciblée',
      'Ajoutez une revue de littérature plus approfondie',
      'Relisez avec un regard critique et améliorez l\'analyse',
    ],
    severity: 'recommended',
    icon: '🎓',
  },
  {
    id: 'tip2',
    number: '02',
    title: 'Le rejet fait partie du processus',
    titleEn: 'Rejection is just part of the publication process',
    description: 'Ne prenez pas les rejets personnellement. Chaque rejet est une opportunité d\'amélioration. Même les chercheurs les plus renommés ont été rejetés.',
    details: [
      'Le taux de rejet moyen en sciences est de 60-80%',
      'Lisez attentivement les commentaires des évaluateurs',
      'Utilisez les critiques pour améliorer votre manuscrit',
      'Gardez un « tiroir plein de rejets » — c\'est normal et sain',
      'Resoumettez à une autre revue après amélioration',
    ],
    severity: 'critical',
    icon: '💪',
  },
  {
    id: 'tip3',
    number: '03',
    title: 'Votre manuscrit doit « correspondre » à la revue',
    titleEn: 'Your manuscript must be a \'fit\' the journal',
    description: 'Choisissez judicieusement votre revue cible. Un bon article dans la mauvaise revue sera rejeté immédiatement.',
    details: [
      'Lisez les articles récents de la revue pour comprendre son style',
      'Vérifiez que votre sujet correspond au « aims and scope »',
      'Consultez le comité éditorial et les statistiques de la revue',
      'Adaptez votre titre, résumé et références au format exigé',
      'Visez des revues dont le facteur d\'impact est réaliste pour vous',
    ],
    severity: 'critical',
    icon: '🎯',
  },
  {
    id: 'tip4',
    number: '04',
    title: 'Ne prenez pas les commentaires des évaluateurs personnellement',
    titleEn: 'Reviewers\' comments should not be taken personally',
    description: 'Les critiques visent votre travail, pas votre personne. Les évaluateurs veulent améliorer la qualité de la publication.',
    details: [
      'Séparez votre ego de votre manuscrit',
      'Répondez à chaque commentaire, même ceux qui semblent injustes',
      'Soyez poli et constructif dans vos réponses',
      'Si vous refusez une suggestion, expliquez pourquoi',
    ],
    severity: 'important',
    icon: '🤝',
  },
  {
    id: 'tip5',
    number: '05',
    title: 'Utilisez les ressources disponibles (beaucoup sont gratuites !)',
    titleEn: 'Use the resources available to you—many of them are free!',
    description: 'De nombreuses ressources gratuites existent pour améliorer vos compétences en rédaction académique.',
    details: [
      'Livres : « Anatomy of Writing for Publication for Nurses » (Cynthia Saver)',
      'Workshops d\'écriture offerts par votre université',
      'Groupes de rédaction entre doctorants',
      'Bibliothécaires spécialisés en recherche',
      'Ressources en ligne : guides APA, LaTeX, BibTeX',
    ],
    severity: 'recommended',
    icon: '📚',
  },
  {
    id: 'tip6',
    number: '06',
    title: 'La persévérance est la clé',
    titleEn: 'Persistence is key',
    description: 'La publication est un marathon, pas un sprint. Les chercheurs qui publient le plus sont ceux qui ne baissent pas les bras.',
    details: [
      'Fixez-vous des objectifs réalistes de soumission',
      'Travaillez sur plusieurs articles en parallèle',
      'Celebrez chaque petite victoire (soumission, révision, acceptation)',
      'Trouvez un mentor ou un groupe de soutien',
      'Rappelez-vous : chaque publication commence par un premier brouillon imparfait',
    ],
    severity: 'critical',
    icon: '🔑',
  },
]

export const SEVERITY_STYLES = {
  critical: { label: 'Crucial', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  important: { label: 'Important', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  recommended: { label: 'Recommandé', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
}

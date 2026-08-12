// ─── 8 cadres puissants pour structurer un article de recherche ───
// Source : Askpstudyinaustralia infographic

export interface ResearchFramework {
  id: string
  number: string
  name: string
  fullName: string
  description: string
  stages: string[]
  whenToUse: string
  tip: string
  color: string
}

export const RESEARCH_FRAMEWORKS: ResearchFramework[] = [
  {
    id: 'imrad',
    number: '01',
    name: 'IMRaD',
    fullName: 'Introduction – Methods – Results – and – Discussion',
    description: 'Le cadre le plus universellement utilisé pour les articles scientifiques. Structure claire en quatre sections qui guide le lecteur de la question à la réponse.',
    stages: [
      'Introduction : Présenter le contexte et la problématique',
      'Methods : Décrire la méthodologie et le protocole',
      'Results : Exposer les données collectées',
      'Discussion : Interpréter et discuter les résultats',
    ],
    whenToUse: 'Articles originaux, rapports de recherche, publications dans les revues scientifiques standards',
    tip: 'Chaque section doit pouvoir se lire indépendamment. L\'introduction répond à « pourquoi ? », les méthodes à « comment ? », les résultats à « qu\'est-ce qu\'on a trouvé ? », la discussion à « que signifie-t-il ? ».',
    color: 'emerald',
  },
  {
    id: 'card',
    number: '02',
    name: 'CARD',
    fullName: 'Clarifier – Argumenter – Résoudre – Développer',
    description: 'Un cadre progressif qui part de la clarification du problème jusqu\'au développement complet de la solution argumentée.',
    stages: [
      'Clarifier : Identifier et définir précisément le problème de recherche',
      'Argumenter : Construire les arguments et poser les hypothèses',
      'Résoudre : Proposer et tester des solutions',
      'Développer : Approfondir et généraliser les conclusions',
    ],
    whenToUse: 'Recherche appliquée, résolution de problèmes complexes, articles en sciences de l\'ingénieur',
    tip: 'La phase « Clarifier » est cruciale — ne la négligez pas. Un problème bien posé est à moitié résolu.',
    color: 'blue',
  },
  {
    id: 'claim',
    number: '03',
    name: 'C.L.A.I.M',
    fullName: 'Clarify the Research Gap – Lay the Foundation – Argue – Identify Limitations – Move Forward',
    description: 'Un cadre complet pour les articles de revue de littérature qui garantit la couverture systématique de tous les éléments essentiels.',
    stages: [
      'Clarify the Research Gap : Clarifier le vide de recherche',
      'Lay the Foundation : Établir les fondements théoriques',
      'Argue : Argumenter avec les preuves disponibles',
      'Identify Limitations : Identifier les limites actuelles',
      'Move Forward : Proposer des pistes de recherche futures',
    ],
    whenToUse: 'Revues de littérature systématiques, articles de synthèse, state-of-the-art',
    tip: 'Utilisez ce cadre pour vous assurer que votre revue de littérature ne se contente pas de résumer, mais qu\'elle identifie clairement les lacunes et propose des directions.',
    color: 'violet',
  },
  {
    id: 'paste',
    number: '04',
    name: 'P.A.S.T.E',
    fullName: 'Point – Argument – Structure – Transitions – Evidence',
    description: 'Un cadre centré sur la qualité argumentative et la fluidité du discours scientifique. Met l\'accent sur la cohérence logique entre les paragraphes.',
    stages: [
      'Point : Chaque paragraphe commence par un point principal',
      'Argument : Développer l\'argument avec des explications',
      'Structure : Organiser les paragraphes en séquence logique',
      'Transitions : Assurer la fluidité entre les sections',
      'Evidence : Étayer chaque argument avec des preuves',
    ],
    whenToUse: 'Rédaction de sections argumentatives, discussion, revue de littérature narrative',
    tip: 'Le « Point » de chaque paragraphe doit être une phrase-clé résumant l\'idée. Testez en lisant seulement la première phrase de chaque paragraphe.',
    color: 'amber',
  },
  {
    id: 'sirf',
    number: '05',
    name: 'S.I.R.F',
    fullName: 'State – Illustrate – Relate – Frame',
    description: 'Un cadre orienté vers la présentation claire des résultats et leur contextualisation dans le domaine de recherche.',
    stages: [
      'State : Énoncer clairement chaque résultat',
      'Illustrate : Illustrer avec des données, tableaux, figures',
      'Relate : Relier aux résultats antérieurs et à la littérature',
      'Frame : Cadreer dans le contexte global de la recherche',
    ],
    whenToUse: 'Section Résultats, présentation de données, articles quantitatifs',
    tip: 'La phase « Relate » distingue un bon article d\'un excellent article — connectez systématiquement vos résultats à la littérature existante.',
    color: 'rose',
  },
  {
    id: 'risc',
    number: '06',
    name: 'R.I.S.C',
    fullName: 'Research Question – Investigation – Synthesis – Conclusion',
    description: 'Un cadre cyclique qui part de la question de recherche et revient à la conclusion, en passant par l\'investigation et la synthèse.',
    stages: [
      'Research Question : Formuler une question de recherche précise',
      'Investigation : Mener l\'investigation méthodique',
      'Synthesis : Synthétiser les résultats de l\'investigation',
      'Conclusion : Tirer des conclusions et ouvrir de nouvelles questions',
    ],
    whenToUse: 'Recherche exploratoire, études de cas, articles qualitatifs',
    tip: 'La question de recherche guide tout le reste. Revoyez-la régulièrement pendant la rédaction pour vous assurer que chaque section y répond.',
    color: 'cyan',
  },
  {
    id: 'rrc',
    number: '07',
    name: 'RRC Framework',
    fullName: 'Read – Relate – Create',
    description: 'Un cadre en trois étapes pour la recherche créative qui va de la lecture à la création de nouvelles connaissances.',
    stages: [
      'Read : Lire et comprendre la littérature existante',
      'Relate : Relier les lectures entre elles et à votre sujet',
      'Create : Créer de nouvelles connaissances ou perspectives',
    ],
    whenToUse: 'Recherche créative, études doctorales, phase d\'exploration bibliographique',
    tip: 'La phase « Relate » est souvent négligée — prenez le temps de créer des cartes conceptuelles reliant les sources entre elles.',
    color: 'orange',
  },
  {
    id: 'scoa',
    number: '08',
    name: 'SCOA Framework',
    fullName: 'Situate – Contextualize – Organize – Analyze',
    description: 'Un cadre structuré pour l\'organisation et l\'analyse approfondie de la littérature scientifique.',
    stages: [
      'Situate : Situer votre travail dans le paysage scientifique',
      'Contextualize : Contextualiser avec les travaux antérieurs',
      'Organize : Organiser les sources de manière logique',
      'Analyze : Analyser critiquement chaque source',
    ],
    whenToUse: 'Revue de littérature approfondie, chapitre bibliographique de thèse, méta-analyse',
    tip: 'Utilisez un tableau de synthèse pour la phase « Organize » : colonnes = auteurs, lignes = thèmes, cellules = conclusions clés.',
    color: 'teal',
  },
]

export const FRAMEWORK_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-700', border: 'border-violet-200', light: 'bg-violet-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50' },
  cyan: { bg: 'bg-cyan-600', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-50' },
  orange: { bg: 'bg-orange-600', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-700', border: 'border-teal-200', light: 'bg-teal-50' },
}

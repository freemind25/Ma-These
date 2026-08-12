// ─── Outils recommandés pour chaque étape du parcours doctoral ───
// Source : Askpstudyinaustralia infographic

export interface PhDTool {
  name: string
  url: string
  description: string
  color: string
}

export interface PhDStage {
  id: string
  number: string
  title: string
  titleEn: string
  description: string
  tools: PhDTool[]
  color: string
}

export const PHD_STAGES: PhDStage[] = [
  {
    id: 'explore',
    number: '01',
    title: 'Explorer les idées',
    titleEn: 'Explore Ideas',
    description: 'Trouver et affiner votre sujet de recherche grâce à l\'IA et aux outils d\'exploration.',
    tools: [
      { name: 'AnswerThis', url: 'https://www.answerthis.io', description: 'Recherche IA pour questions de recherche', color: 'text-blue-500' },
      { name: 'NOAH AI', url: 'https://www.noah.ai', description: 'Assistant IA pour la recherche', color: 'text-violet-500' },
      { name: 'Elicit', url: 'https://elicit.com', description: 'Trouver des articles par question', color: 'text-emerald-500' },
      { name: 'Connected Papers', url: 'https://www.connectedpapers.com', description: 'Visualiser les liens entre articles', color: 'text-amber-500' },
    ],
    color: 'emerald',
  },
  {
    id: 'literature',
    number: '02',
    title: 'Revue de littérature',
    titleEn: 'Literature Review',
    description: 'Conduire une revue systématique et approfondie de la littérature scientifique.',
    tools: [
      { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org', description: 'Moteur de recherche académique IA', color: 'text-blue-500' },
      { name: 'Scite AI', url: 'https://scite.ai', description: 'Citations intelligentes avec contexte', color: 'text-emerald-500' },
      { name: 'Google Scholar', url: 'https://scholar.google.com', description: 'Base académique universelle', color: 'text-blue-600' },
      { name: 'Research Rabbit', url: 'https://www.researchrabbit.ai', description: 'Découverte de littérature connexe', color: 'text-rose-500' },
    ],
    color: 'blue',
  },
  {
    id: 'data-collection',
    number: '03',
    title: 'Collecte de données',
    titleEn: 'Data Collection',
    description: 'Collecter et annoter vos données de recherche efficacement.',
    tools: [
      { name: 'Eureka', url: 'https://www.eureka.io', description: 'Collecte de données assistée', color: 'text-violet-500' },
      { name: 'Moara', url: 'https://moara.io', description: 'Annotation et analyse de données', color: 'text-cyan-500' },
      { name: 'Liner', url: 'https://liner.ai', description: 'Surlignage et annotation IA', color: 'text-amber-500' },
      { name: 'SciSpace', url: 'https://typeset.io', description: 'Lecture et compréhension d\'articles', color: 'text-emerald-500' },
    ],
    color: 'violet',
  },
  {
    id: 'data-analysis',
    number: '04',
    title: 'Analyse de données',
    titleEn: 'Data Analysis',
    description: 'Analyser vos données avec les outils statistiques et de visualisation adaptés.',
    tools: [
      { name: 'JASP', url: 'https://jasp-stats.org', description: 'Statistiques bayésiennes, interface graphique', color: 'text-blue-500' },
      { name: 'R', url: 'https://www.r-project.org', description: 'Langage statistique de référence', color: 'text-sky-500' },
      { name: 'SPSS', url: 'https://www.ibm.com/spss', description: 'Logiciel statistique professionnel', color: 'text-blue-600' },
      { name: 'Python', url: 'https://www.python.org', description: 'Analyse de données et ML', color: 'text-amber-600' },
    ],
    color: 'amber',
  },
  {
    id: 'writing',
    number: '05',
    title: 'Rédaction',
    titleEn: 'Writing / Drafting',
    description: 'Rédiger et structurer votre manuscrit avec l\'assistance IA.',
    tools: [
      { name: 'SciClaw', url: 'https://sciclaw.com', description: 'Rédaction académique IA', color: 'text-emerald-500' },
      { name: 'WisPaper', url: 'https://wisepaper.ai', description: 'Amélioration de textes', color: 'text-violet-500' },
      { name: 'Grammarly', url: 'https://www.grammarly.com', description: 'Correction grammaticale', color: 'text-green-500' },
      { name: 'QuillBot', url: 'https://quillbot.com', description: 'Paraphrase et reformulation', color: 'text-blue-500' },
    ],
    color: 'rose',
  },
  {
    id: 'review',
    number: '06',
    title: 'Révision',
    titleEn: 'Review / Refinement',
    description: 'Réviser, améliorer et préparer votre manuscrit pour la soumission.',
    tools: [
      { name: 'Thesify', url: 'https://thesify.com', description: 'Vérification de thèse IA', color: 'text-emerald-500' },
      { name: 'Review-it', url: 'https://www.review-it.io', description: 'Revue par les pairs IA', color: 'text-rose-500' },
      { name: 'Zotero', url: 'https://www.zotero.org', description: 'Gestion de références', color: 'text-red-500' },
      { name: 'Mendeley', url: 'https://www.mendeley.com', description: 'Gestion de références + PDF', color: 'text-blue-500' },
    ],
    color: 'cyan',
  },
  {
    id: 'references',
    number: '07',
    title: 'Gestion des références',
    titleEn: 'Reference Management',
    description: 'Organiser et formater votre bibliographie automatiquement.',
    tools: [
      { name: 'Zotero', url: 'https://www.zotero.org', description: 'Gratuit, open-source, très complet', color: 'text-red-500' },
      { name: 'Mendeley', url: 'https://www.mendeley.com', description: 'Intégration Word/LaTeX', color: 'text-blue-500' },
      { name: 'EndNote', url: 'https://endnote.com', description: 'Standard industriel, payant', color: 'text-emerald-600' },
      { name: 'Paperpile', url: 'https://paperpile.com', description: 'Simple et Google-intégré', color: 'text-amber-500' },
    ],
    color: 'orange',
  },
  {
    id: 'publish',
    number: '08',
    title: 'Publication',
    titleEn: 'Publish / Share',
    description: 'Préparer, soumettre et partager vos travaux publiés.',
    tools: [
      { name: 'Overleaf', url: 'https://www.overleaf.com', description: 'Éditeur LaTeX collaboratif', color: 'text-green-600' },
      { name: 'Authorea', url: 'https://www.authorea.com', description: 'Écriture collaborative', color: 'text-blue-500' },
      { name: 'ResearchGate', url: 'https://www.researchgate.net', description: 'Réseau social chercheurs', color: 'text-emerald-500' },
      { name: 'ORCID', url: 'https://orcid.org', description: 'Identifiant chercheur unique', color: 'text-amber-600' },
    ],
    color: 'teal',
  },
]

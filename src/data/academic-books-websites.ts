// ─── 12 meilleurs sites pour télécharger des livres académiques gratuits ───
// Source : Askpstudyinaustralia infographic

export interface AcademicBookSite {
  id: string
  number: string
  name: string
  url: string
  description: string
  icon: string
  tags: string[]
}

export const ACADEMIC_BOOK_SITES: AcademicBookSite[] = [
  {
    id: 'openstax',
    number: '01',
    name: 'OpenStax',
    url: 'https://openstax.org',
    description: 'Manuels universitaires gratuits et peer-reviewed couvrant maths, sciences, sciences sociales et humanités. soutenu par Rice University.',
    icon: '📖',
    tags: ['Manuels', 'Gratuit', 'Peer-reviewed', 'Multidisciplinaire'],
  },
  {
    id: 'open-textbook-library',
    number: '02',
    name: 'Open Textbook Library',
    url: 'https://open.umn.edu/opentextbooks',
    description: 'Bibliothèque de manuels ouverts avec revue par les pairs, hébergée par l\'Université du Minnesota. Plus de 1200 ouvrages.',
    icon: '📚',
    tags: ['Manuels', 'Revus par les pairs', 'Universitaire'],
  },
  {
    id: 'doab',
    number: '03',
    name: 'DOAB',
    url: 'https://www.doabooks.org',
    description: 'Directory of Open Access Books. Accès aux livres académiques en accès ouvert publiés par des éditeurs vérifiés.',
    icon: '📗',
    tags: ['Accès ouvert', 'Livres académiques', 'Éditeurs vérifiés'],
  },
  {
    id: 'oapen',
    number: '04',
    name: 'OAPEN',
    url: 'https://www.oapen.org',
    description: 'Bibliothèque européenne de livres académiques en accès ouvert. Spécialisé en sciences humaines et sociales.',
    icon: '📘',
    tags: ['Europe', 'SHS', 'Accès ouvert'],
  },
  {
    id: 'ucl-press',
    number: '05',
    name: 'UCL Press',
    url: 'https://www.uclpress.co.uk',
    description: 'Maison d\'édition universitaire 100% open access. Publie des monographies et manuels en sciences humaines.',
    icon: '🎓',
    tags: ['Université', 'Open access', 'Monographies'],
  },
  {
    id: 'edinburgh-press',
    number: '06',
    name: 'Edinburgh University Press',
    url: 'https://www.euppublishing.com',
    description: 'Publications universitaires ouvertes en littérature, histoire et cultures. Collection Open Books disponible gratuitement.',
    icon: '🏰',
    tags: ['Écosse', 'Littérature', 'Histoire'],
  },
  {
    id: 'oxford-open',
    number: '07',
    name: 'Oxford Open Access',
    url: 'https://academic.oup.com/journals/pages/open_access',
    description: 'Programme d\'accès ouvert d\'Oxford University Press. Accès à des milliers de livres et articles académiques.',
    icon: '🎓',
    tags: ['Prestigieux', 'Multidisciplinaire', 'Oxford'],
  },
  {
    id: 'cambridge-open',
    number: '08',
    name: 'Cambridge Open Access',
    url: 'https://www.cambridge.org/openaccess',
    description: 'Accès ouvert aux publications de Cambridge University Press. Large catalogue en sciences, humanités et sociales.',
    icon: '🏛️',
    tags: ['Prestigieux', 'Multidisciplinaire', 'Cambridge'],
  },
  {
    id: 'mit-press',
    number: '09',
    name: 'MIT Press Direct',
    url: 'https://direct.mit.edu',
    description: 'Publications du MIT en accès ouvert. Sciences, technologie, design, arts et sciences humaines.',
    icon: '🔬',
    tags: ['Technologie', 'Sciences', 'MIT'],
  },
  {
    id: 'uc-press',
    number: '10',
    name: 'UC Press / Luminos',
    url: 'https://www.ucpress.edu',
    description: 'Plateforme de livres ouverts de l\'Université de Californie. Monographies en sciences humaines et sociales.',
    icon: '☀️',
    tags: ['Californie', 'SHS', 'Monographies'],
  },
  {
    id: 'internet-archive',
    number: '11',
    name: 'Internet Archive',
    url: 'https://archive.org',
    description: 'Bibliothèque numérique géante avec millions de livres, articles et thèses numérisés. Prêt numérique gratuit.',
    icon: '🌐',
    tags: ['Numérisation', 'Thèses', 'Géant', 'Prêt numérique'],
  },
  {
    id: 'project-gutenberg',
    number: '12',
    name: 'Project Gutenberg',
    url: 'https://www.gutenberg.org',
    description: 'Plus de 70 000 livres électroniques gratuits. Œuvres classiques de la littérature mondiale tombées dans le domaine public.',
    icon: '📜',
    tags: ['Domaine public', 'Classiques', 'Gratuit', '70k+ livres'],
  },
]

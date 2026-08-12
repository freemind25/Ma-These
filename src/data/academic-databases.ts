/**
 * Bases de données académiques gratuites
 * Configuration pour les sources de recherche intégrées dans ThesisFrame
 */

export interface AcademicDB {
  id: string
  label: string
  description: string
  url: string
  color: string
  homepage?: string
  searchUrl?: string // URL pattern for searching (with {query} placeholder)
  searchMethod?: 'url' | 'api' // 'url' = append query to URL, 'api' = use a POST endpoint apiBaseUrl + endpoint
}

export const academicDatabases: AcademicDB[] = [
  {
    id: 'zlibrary',
    label: 'Z-Library',
    description:
      "La plus grande bibliothèque numérique au monde avec plus de 14 millions de livres et 84 millions d'articles. Permet de télécharger des livres, articles scientifiques et ouvrages académiques en PDF/EPUB.",
    url: 'https://z-lib.org/',
    color: '#16A34A',
    searchUrl: 'https://z-lib.org/s/{query}',
    searchMethod: 'url',
    homepage: 'https://z-lib.org/',
  },
  {
    id: 'annas-archive',
    label: "Anna's Archive",
    description:
      "Méta-moteur de recherche qui agrège Z-Library, LibGen et d'autres sources. Plus de 18 millions de livres et 100 millions d'articles. Interface simple et recherche rapide.",
    url: 'https://annas-archive.org/',
    color: '#8B4513',
    searchUrl: 'https://annas-archive.org/search?q={query}',
    searchMethod: 'url',
    homepage: 'https://annas-archive.org/',
  },
  {
    id: 'welib-st',
    label: 'Welib',
    description:
      "Bibliothèque numérique avec plus de 700 000 livres numérisés. Interface claire et rapide pour rechercher des ouvrages et accéder aux textes complets.",
    url: 'https://welib.st/',
    color: '#2563EB',
    searchUrl: 'https://welib.st/search?q={query}',
    searchMethod: 'url',
    homepage: 'https://welib.st/',
  },
  {
    id: 'libgen-im',
    label: 'Library Genesis',
    description:
      "Base de données massive de livres et articles scientifiques en accès libre. Plus de 2,7 millions de livres et 58 millions d'articles. Particulièrement utile pour les ouvrages académiques.",
    url: 'https://libgen.im/',
    color: '#7C3AED',
    searchUrl: 'https://libgen.im/search.php?req={query}',
    searchMethod: 'url',
    homepage: 'https://libgen.im/',
  },
  {
    id: 'hal-science',
    label: 'HAL (HAL Science)',
    description:
      "Archive ouverte de publications scientifiques françaises. Accès libre aux textes complets de millions d'articles, thèses et rapports. Ressource majeure pour la recherche francophone.",
    url: 'https://hal.science/',
    color: '#DC2626',
    searchUrl: 'https://hal.science/search/?q={query}',
    searchMethod: 'url',
    homepage: 'https://hal.science/',
  },
  {
    id: 'libguides',
    label: 'LibGuides (Rechercheurs IA)',
    description:
      "Répertoire de chercheurs d'IA avec des liens vers des outils et ressources. Inclut des outils de recherche, des frameworks et des guides pratiques.",
    url: 'https://libguides.library.arizona.edu/ai-researchers/scispace/',
    color: '#9333EA',
    searchUrl: 'https://libguides.library.arizona.edu/ai-researchers/scispace/',
    searchMethod: 'url',
    homepage: 'https://libguides.library.arizona.edu/ai-researchers/scispace/',
  },
  {
    id: 'shadowlibs',
    label: 'ShadowLibraries',
    description:
      "Collection de bibliothèques numériques et ressources open source. Utile pour découvrir des alternatives d'accès aux publications scientifiques.",
    url: 'https://shadowlibraries.github.io/',
    color: '#4F46E5',
    searchUrl: 'https://shadowlibraries.github.io/',
    searchMethod: 'url',
    homepage: 'https://shadowlibraries.github.io/',
  },
];

// ─── Référentiels de thèses ─────────────────────────────

export interface ThesisRepository {
  id: string
  name: string
  description: string
  url: string
  searchUrl: string
  language: string // e.g. 'Multilingual', 'English', 'French', 'International'
  coverage: string // e.g. 'Global', 'Europe', 'USA', 'Canada', 'UK'
  color: string
}

export const thesisRepositories: ThesisRepository[] = [
  {
    id: 'oatd',
    name: 'OATD (Open Access Theses & Dissertations)',
    description: 'Index mondial de méta-données de thèses en accès ouvert. 6 millions+ de thèses provenant de 1 100+ institutions.',
    url: 'https://oatd.org/',
    searchUrl: 'https://oatd.org/oatd/search?q={query}',
    language: 'Multilingual',
    coverage: 'Global',
    color: '#059669',
  },
  {
    id: 'openthesis',
    name: 'OpenThesis',
    description: 'Plateforme collaborative pour partager et trouver des thèses, mémoires et rapports de recherche gratuits.',
    url: 'http://www.openthesis.org/',
    searchUrl: 'http://www.openthesis.org/search?query={query}',
    language: 'English',
    coverage: 'Global',
    color: '#2563EB',
  },
  {
    id: 'dart-europe',
    name: 'DART-Europe',
    description: 'Portail européen de thèses électroniques. Accès aux thèses de 500+ universités européennes.',
    url: 'https://www.dart-europe.eu/',
    searchUrl: 'https://www.dart-europe.eu/basic-search.php',
    language: 'Multilingual',
    coverage: 'Europe',
    color: '#7C3AED',
  },
  {
    id: 'proquest',
    name: 'ProQuest Dissertations & Theses',
    description: 'Plus grande base de thèses au monde avec 5 millions+ de travaux. Accès partiel gratuit via PQDT Open.',
    url: 'https://www.proquest.com/',
    searchUrl: 'https://www.proquest.com/search?query={query}',
    language: 'Multilingual',
    coverage: 'Global',
    color: '#DC2626',
  },
  {
    id: 'mit-theses',
    name: 'MIT Theses',
    description: 'Toutes les thèses du MIT en accès ouvert. Couvre sciences, ingénierie, sciences sociales et humanités.',
    url: 'https://dspace.mit.edu/',
    searchUrl: 'https://dspace.mit.edu/search?query={query}',
    language: 'English',
    coverage: 'USA',
    color: '#9333EA',
  },
  {
    id: 'ndltd',
    name: 'NDLTD (Networked Digital Library of Theses & Dissertations)',
    description: 'Réseau international de bibliothèques numériques de thèses. Accès à des millions de thèses de 100+ pays.',
    url: 'http://www.ndltd.org/',
    searchUrl: 'http://www.ndltd.org/find',
    language: 'Multilingual',
    coverage: 'Global',
    color: '#0369A1',
  },
  {
    id: 'caltech-thesis',
    name: 'CaltechTHESIS',
    description: 'Archive des thèses de Caltech en accès ouvert. Sciences physiques, ingénierie et mathématiques.',
    url: 'https://thesis.library.caltech.edu/',
    searchUrl: 'https://thesis.library.caltech.edu/search?q={query}',
    language: 'English',
    coverage: 'USA',
    color: '#EA580C',
  },
  {
    id: 'ethos-bl',
    name: 'British Library EThOS',
    description: 'Bibliothèque nationale du Royaume-Uni. 500 000+ thèses britanniques, la plupart en accès ouvert.',
    url: 'https://ethos.bl.uk/',
    searchUrl: 'https://ethos.bl.uk/SearchResults.do?query={query}',
    language: 'English',
    coverage: 'UK',
    color: '#B91C1C',
  },
  {
    id: 'etd-ohiolink',
    name: 'ETD Center (OhioLink)',
    description: 'Centre de thèses électroniques de l\'OhioLink. Thèses de 30+ universités de l\'Ohio.',
    url: 'https://etd.ohiolink.edu/',
    searchUrl: 'https://etd.ohiolink.edu/apexprod/rws_etd/r/etd/search',
    language: 'English',
    coverage: 'USA',
    color: '#4F46E5',
  },
  {
    id: 'harvard-dash',
    name: 'Harvard DASH',
    description: 'Accès ouvert aux travaux académiques de Harvard, incluant les thèses et mémoires.',
    url: 'https://dash.harvard.edu/',
    searchUrl: 'https://dash.harvard.edu/handle/1/search?query={query}',
    language: 'English',
    coverage: 'USA',
    color: '#6D28D9',
  },
  {
    id: 'theses-canada',
    name: 'Theses Canada Portal',
    description: 'Portail national des thèses canadiennes. Accès aux thèses de toutes les universités canadiennes.',
    url: 'https://canadagtd.ca/',
    searchUrl: 'https://canadagtd.ca/rwt/search?query={query}',
    language: 'English/French',
    coverage: 'Canada',
    color: '#BE123C',
  },
  {
    id: 'repec',
    name: 'RePEc (Research Papers in Economics)',
    description: 'Réseau d\'économie avec 400 000+ articles et thèses en économie et finance.',
    url: 'https://repec.org/',
    searchUrl: 'https://ideas.repec.org/cgi-bin/htsearch?q={query}',
    language: 'Multilingual',
    coverage: 'Global',
    color: '#065F46',
  },
  {
    id: 'ssrn',
    name: 'SSRN eLibrary',
    description: 'Social Science Research Network. 1 million+ de papiers en sciences sociales, commerce et droit.',
    url: 'https://www.ssrn.com/',
    searchUrl: 'https://www.ssrn.com/search?q={query}',
    language: 'Multilingual',
    coverage: 'Global',
    color: '#C2410C',
  },
  {
    id: 'europe-pmc',
    name: 'Europe PMC',
    description: 'Archive européenne de publications biomédicales et sciences de la vie. Inclut des thèses.',
    url: 'https://europepmc.org/',
    searchUrl: 'https://europepmc.org/search?query={query}',
    language: 'Multilingual',
    coverage: 'Europe',
    color: '#0E7490',
  },
  {
    id: 'worldcat-dissertations',
    name: 'WorldCat Dissertations',
    description: 'Catalogue mondial des bibliothèques. Trouver des thèses dans les bibliothèques du monde entier.',
    url: 'https://www.worldcat.org/',
    searchUrl: 'https://www.worldcat.org/search?q={query}&qt=adv',
    language: 'Multilingual',
    coverage: 'Global',
    color: '#78350F',
  },
];

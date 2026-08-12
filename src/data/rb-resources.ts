/**
 * RB — Ressources visuelles académiques (infographies)
 * Deux collections : Méthodologie de recherche + Approches de l'urbanisme
 */

export interface ResourceImage {
  id: string
  fileName: string
  src: string
  title: string
  description: string
  category: 'methodologie' | 'urbanisme'
}

export const RB_RESOURCES: ResourceImage[] = [
  // ── MÉTHODOLOGIE DE RECHERCHE ──
  {
    id: 'rb-1',
    fileName: 'RB-1.jpg',
    src: '/resources/rb/RB-1.jpg',
    title: 'Comment identifier un Research Gap en quelques secondes',
    description:
      'Tutoriel visuel en 5 étapes pour utiliser un outil IA afin d\'identifier rapidement les lacunes de recherche dans un domaine. Montre la formulation de la requête, l\'analyse automatisée et l\'exploration des sources académiques.',
    category: 'methodologie',
  },
  {
    id: 'rb-2',
    fileName: 'RB-2.jpg',
    src: '/resources/rb/RB-2.jpg',
    title: 'Éléments clés du Chapitre 2 — Revue de littérature',
    description:
      'Guide structuré des 6 composantes essentielles d\'une revue de littérature : introduction, cadre théorique, cadre conceptuel, revue connexe, revue critique/synthèse, et résumé. Chaque section inclut un exemple concret.',
    category: 'methodologie',
  },
  {
    id: 'rb-3',
    fileName: 'RB-3.jpg',
    src: '/resources/rb/RB-3.jpg',
    title: 'Types de Research Gaps — Classification complète',
    description:
      'Infographie présentant les 7 types de lacunes de recherche : Evidence Gap, Knowledge Gap, Practice-Knowledge Gap, Methodological Gap, Empirical Gap, Theoretical Gap, et Population Gap. Avec icônes et descriptions pour chaque type.',
    category: 'methodologie',
  },
  {
    id: 'rb-4',
    fileName: 'RB-4.jpg',
    src: '/resources/rb/RB-4.jpg',
    title: 'Tests statistiques essentiels — Guide de référence',
    description:
      'Tableau de référence détaillant 17 tests statistiques (descriptifs, paramétriques et non-paramétriques) avec leurs conditions d\'utilisation, descriptions et exemples concrets pour l\'analyse de données de recherche.',
    category: 'methodologie',
  },
  {
    id: 'rb-5',
    fileName: 'RB-5.jpg',
    src: '/resources/rb/RB-5.jpg',
    title: 'Cadre théorique vs Cadre conceptuel',
    description:
      'Comparaison entre le cadre théorique (perspective générale fondée sur des théories établies) et le cadre conceptuel (concepts spécifiques développés par le chercheur pour répondre à son problème de recherche).',
    category: 'methodologie',
  },
  {
    id: 'rb-15',
    fileName: 'RB-15.jpg',
    src: '/resources/rb/RB-15.jpg',
    title: 'Types de Research Gaps — Vue d\'ensemble',
    description:
      'Présentation synthétique des sept types de lacunes de recherche mettant en évidence ce qui est inconnu, peu clair ou nécessite une investigation supplémentaire dans la littérature scientifique.',
    category: 'methodologie',
  },

  // ── APPROCHES DE L'URBANISME ──
  {
    id: 'rb-14',
    fileName: 'RB-14.jpg',
    src: '/resources/rb/RB-14.jpg',
    title: 'Les approches les plus importantes de l\'urbanisme — Vue d\'ensemble',
    description:
      'Panorama de l\'évolution des concepts d\'urbanisme, de la Cité-jardin du XIXe siècle à la Ville intelligente du XXIe siècle, en passant par la ville moderniste, la ville centrée sur l\'humain et la ville durable.',
    category: 'urbanisme',
  },
  {
    id: 'rb-13',
    fileName: 'RB-13.jpg',
    src: '/resources/rb/RB-13.jpg',
    title: 'Cité-jardin — Garden City Approach (1898)',
    description:
      'Le concept de la ville-jardin d\'Ebenezer Howard : créer des communautés autosuffisantes et saines en équilibrant la vie urbaine et les bénéfices de la nature. Fondement de l\'urbanisme moderne.',
    category: 'urbanisme',
  },
  {
    id: 'rb-12',
    fileName: 'RB-12.jpg',
    src: '/resources/rb/RB-12.jpg',
    title: 'Urbanisme moderniste — The City as a Machine (1920s–1960s)',
    description:
      'L\'approche moderniste (Le Corbusier, CIAM) visant à créer des villes efficaces et hygiéniques en les organisant comme des machines fonctionnelles. Séparation stricte des fonctions : habiter, travailler, circuler, se récréer.',
    category: 'urbanisme',
  },
  {
    id: 'rb-11',
    fileName: 'RB-11.jpg',
    src: '/resources/rb/RB-11.jpg',
    title: 'Planification urbaine globale — Comprehensive Planning (Mid-20th Century)',
    description:
      'La planification urbaine globale considère la ville comme un système interconnecté et utilise des données, une analyse et une vision à long terme pour guider le développement de manière équilibrée et organisée.',
    category: 'urbanisme',
  },
  {
    id: 'rb-7',
    fileName: 'RB-7.jpg',
    src: '/resources/rb/RB-7.jpg',
    title: 'Urbanisme plaidoyer et équité — Advocacy Planning (1960s–1970s)',
    description:
      'Mouvement remettant en cause la planification descendante pour privilégier la justice sociale, les droits des citoyens et la participation communautaire. Donner une voix aux populations souvent ignorées.',
    category: 'urbanisme',
  },
  {
    id: 'rb-9',
    fileName: 'RB-9.jpg',
    src: '/resources/rb/RB-9.jpg',
    title: 'Nouvel urbanisme — New Urbanism (1980s – aujourd\'hui)',
    description:
      'Retour aux villes à échelle humaine : quartiers piétonniers, rues mixtes, espaces publics de qualité. Le Nouvel urbanisme promeut la densité modérée, la diversité des usages et la marche comme mode de déplacement principal.',
    category: 'urbanisme',
  },
  {
    id: 'rb-10',
    fileName: 'RB-10.jpg',
    src: '/resources/rb/RB-10.jpg',
    title: 'Urbanisme durable — Sustainable Planning (1990s – aujourd\'hui)',
    description:
      'Principes et stratégies pour créer des villes résilientes et équitables pour les générations futures. Intègre les enjeux environnementaux, sociaux et économiques dans la planification urbaine.',
    category: 'urbanisme',
  },
  {
    id: 'rb-6',
    fileName: 'RB-6.jpg',
    src: '/resources/rb/RB-6.jpg',
    title: 'Synthèse — Planning Better Cities, Together',
    description:
      'Conclusion de la série : des villes réussies équilibrent données et empathie, innovation et équité, croissance et durabilité. L\'avenir de la planification urbaine est collaboratif et centré sur les personnes.',
    category: 'urbanisme',
  },
  {
    id: 'rb-8',
    fileName: 'RB-8.jpg',
    src: '/resources/rb/RB-8.jpg',
    title: 'Ville intelligente — Smart City Approach (21st Century)',
    description:
      'La technologie, les données et l\'innovation transforment la planification, la gestion et l\'expérience des villes. Les villes intelligentes utilisent des systèmes numériques pour améliorer les services, l\'efficacité et la qualité de vie.',
    category: 'urbanisme',
  },
]

export const RESOURCE_CATEGORIES = [
  { id: 'all', label: 'Toutes les ressources', icon: 'Layers' as const },
  { id: 'methodologie', label: 'Méthodologie de recherche', icon: 'Microscope' as const },
  { id: 'urbanisme', label: 'Approches de l\'urbanisme', icon: 'Building2' as const },
] as const

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]['id']

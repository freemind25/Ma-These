export interface TemplateChapter {
  title: string
  description: string
}

export interface ThesisTemplate {
  id: string
  name: string
  description: string
  icon: string
  structureMode: 'chapters' | 'parts'
  /** For 'parts' mode: chapters grouped under parts */
  parts?: { title: string; chapters: TemplateChapter[] }[]
  /** For 'chapters' mode: flat list */
  chapters?: TemplateChapter[]
}

export const THESIS_TEMPLATES: ThesisTemplate[] = [
  {
    id: 'imrad',
    name: 'IMRaD classique',
    description: 'Introduction, Méthodologie, Résultats, Discussion — la structure la plus courante en sciences expérimentales.',
    icon: 'FlaskConical',
    structureMode: 'chapters',
    chapters: [
      { title: 'Introduction générale', description: 'Contexte, problématique, objectifs et plan.' },
      { title: 'Revue de littérature et cadre théorique', description: 'État de l\'art, concepts clés, positionnement.' },
      { title: 'Cadre méthodologique', description: 'Design de recherche, outils, échantillon.' },
      { title: 'Résultats', description: 'Analyses et principaux résultats.' },
      { title: 'Discussion', description: 'Interprétation, limites, perspectives.' },
      { title: 'Conclusion générale', description: 'Synthèse, contribution, ouverture.' },
    ],
  },
  {
    id: 'thematic',
    name: 'Thématique (en parties)',
    description: 'Structure en 3 parties avec chapitres thématiques — idéal pour les SHS et lettres.',
    icon: 'BookOpen',
    structureMode: 'parts',
    parts: [
      {
        title: 'Partie I — Fondements théoriques',
        chapters: [
          { title: 'Introduction générale', description: 'Contexte, problématique, hypothèses.' },
          { title: 'Cadre conceptuel et théorique', description: 'Concepts, modèles, revue de littérature.' },
          { title: 'Positionnement épistémologique', description: 'Ancrage théorique et choix de posture.' },
        ],
      },
      {
        title: 'Partie II — Terrain et analyse',
        chapters: [
          { title: 'Cadre méthodologique', description: 'Approche, terrain, outils.' },
          { title: 'Présentation et analyse des données', description: 'Résultats et interprétation.' },
        ],
      },
      {
        title: 'Partie III — Synthèse et ouverture',
        chapters: [
          { title: 'Discussion croisée', description: 'Mise en perspective des résultats.' },
          { title: 'Conclusion générale', description: 'Synthèse, apports, limites, perspectives.' },
        ],
      },
    ],
  },
  {
    id: 'articles',
    name: 'Par articles',
    description: 'Structure composée d\'articles de recherche — format courant en sciences dures et médecine.',
    icon: 'FileText',
    structureMode: 'chapters',
    chapters: [
      { title: 'Introduction générale', description: 'Problématique globale, objectifs de la thèse.' },
      { title: 'Article 1 — Titre', description: 'Premier article de recherche.' },
      { title: 'Article 2 — Titre', description: 'Deuxième article de recherche.' },
      { title: 'Article 3 — Titre', description: 'Troisième article de recherche.' },
      { title: 'Synthèse et discussion', description: 'Discussion transversale des articles.' },
      { title: 'Conclusion générale', description: 'Contributions, perspectives, ouverture.' },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal (vide)',
    description: 'Structure minimale avec seulement introduction et conclusion — vous construisez le reste.',
    icon: 'FileText',
    structureMode: 'chapters',
    chapters: [
      { title: 'Introduction', description: 'Définir votre problématique et vos objectifs.' },
      { title: 'Conclusion', description: 'Synthétiser vos contributions.' },
    ],
  },
]

/**
 * Référentiels méthodologiques pour la vérification d'analyse urbaine.
 * Module A (règles) + Module B (questionnement).
 */

// ─── Types ──────────────────────────────────────────────────────

export interface ReferentialElement {
  typeElement: string
  natureElement: 'spatial' | 'donnee_enquete' | 'document'
  sousAnalyse: string
  label: string
}

export interface PhaseConfig {
  phase: string
  label: string
  elements: ReferentialElement[]
}

export interface ReferentialConfig {
  prealable: string[]
  phases: PhaseConfig[]
}

// ─── Labels ─────────────────────────────────────────────────────

export const TYPE_ELEMENT_LABELS: Record<string, string> = {
  situation_generale: 'Situation générale',
  perimetre_urbain: 'Périmètre urbain',
  perimetre_administratif: 'Périmètre administratif',
  perimetre_etude: 'Périmètre d\'étude',
  // Zonage
  zonage_administratif: 'Zonage administratif',
  zonage_foncier: 'Zonage foncier',
  zonage_morphologique: 'Zonage morphologique',
  zonage_functionnel: 'Zonage fonctionnel',
  zonage_ecologique: 'Zonage écologique',
  zonage_patrimonial: 'Zonage patrimonial',
  // Anatomie — Morphologie
  parcelaire: 'Parcellaire',
  voirie_reseau: 'Voirie et réseau',
  tissu_bati: 'Tissu bâti',
  typologie_batiments: 'Typologie des bâtiments',
  morphologie_parcellaire: 'Morphologie parcellaire',
  gabarit_hauteur: 'Gabarit et hauteur',
  occupation_sol: 'Occupation du sol',
  densite_batie: 'Densité bâtie',
  // Anatomie — Occupation
  occupation_fonctionnelle: 'Occupation fonctionnelle',
  mixite_fonctionnelle: 'Mixité fonctionnelle',
  activites_economiques: 'Activités économiques',
  equipements_publics: 'Équipements publics',
  espaces_verts: 'Espaces verts',
  parking_transport: 'Parking et transport',
  vacance_occupation: 'Vacance et occupation',
  // Physiologie — Dynamiques
  dynamique_demographique: 'Dynamique démographique',
  dynamique_immobiliere: 'Dynamique immobilière',
  dynamique_economique: 'Dynamique économique',
  dynamique_mobilite: 'Dynamique de mobilité',
  dynamique_sociale: 'Dynamique sociale',
  dynamique_environnementale: 'Dynamique environnementale',
  // Physiologie — Fonctionnement
  flux_circulation: 'Flux et circulation',
  centralite_polarite: 'Centralité et polarité',
  usage_espaces: 'Usage des espaces',
  pratiques_habitants: 'Pratiques des habitants',
  tensions_conflits: 'Tensions et conflits d\'usage',
  reseaux_sociaux: 'Réseaux sociaux locaux',
  // Transversal
  plan_urbanisme: 'Plan d\'urbanisme (SDAU/POS)',
  documents_urbanisme: 'Documents d\'urbanisme',
  donnees_statistiques: 'Données statistiques',
  enquete_terrain: 'Enquête de terrain',
  cartographie_existante: 'Cartographie existante',
  donnees_satellitaires: 'Données satellitaires / SIG',
  diagnostic_aggregation: 'Diagnostic agrégé',
}

export const NATURE_ELEMENT_LABELS: Record<string, string> = {
  spatial: 'Donnée spatiale',
  donnee_enquete: 'Donnée d\'enquête',
  document: 'Document',
}

export const SOUS_ANALYSE_LABELS: Record<string, string> = {
  prealable: 'Préalable',
  zonage: 'Zonage',
  morphologie: 'Morphologie',
  occupation: 'Occupation',
  dynamiques: 'Dynamiques',
  fonctionnement: 'Fonctionnement',
  transversal: 'Transversal',
}

// ─── Référentiel principal ─────────────────────────────────────

export const REFERENTIAL_ANALYSE_URBAINE: ReferentialConfig = {
  prealable: [
    'situation_generale',
    'perimetre_urbain',
    'perimetre_administratif',
    'perimetre_etude',
  ],
  phases: [
    // ─── Phase 1 : Zonage ────────────────────────────────────
    {
      phase: 'zonage',
      label: 'Zonage',
      elements: [
        { typeElement: 'zonage_administratif', natureElement: 'document', sousAnalyse: 'zonage', label: 'Zonage administratif' },
        { typeElement: 'zonage_foncier', natureElement: 'spatial', sousAnalyse: 'zonage', label: 'Zonage foncier' },
        { typeElement: 'zonage_morphologique', natureElement: 'spatial', sousAnalyse: 'zonage', label: 'Zonage morphologique' },
        { typeElement: 'zonage_functionnel', natureElement: 'spatial', sousAnalyse: 'zonage', label: 'Zonage fonctionnel' },
        { typeElement: 'zonage_ecologique', natureElement: 'spatial', sousAnalyse: 'zonage', label: 'Zonage écologique' },
        { typeElement: 'zonage_patrimonial', natureElement: 'spatial', sousAnalyse: 'zonage', label: 'Zonage patrimonial' },
      ],
    },
    // ─── Phase 2 : Anatomie ───────────────────────────────────
    {
      phase: 'anatomie',
      label: 'Anatomie urbaine',
      elements: [
        // Sous-analyse morphologie
        { typeElement: 'parcelaire', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Parcellaire' },
        { typeElement: 'voirie_reseau', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Voirie et réseau' },
        { typeElement: 'tissu_bati', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Tissu bâti' },
        { typeElement: 'typologie_batiments', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Typologie des bâtiments' },
        { typeElement: 'morphologie_parcellaire', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Morphologie parcellaire' },
        { typeElement: 'gabarit_hauteur', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Gabarit et hauteur' },
        { typeElement: 'occupation_sol', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Occupation du sol' },
        { typeElement: 'densite_batie', natureElement: 'spatial', sousAnalyse: 'morphologie', label: 'Densité bâtie' },
        // Sous-analyse occupation
        { typeElement: 'occupation_fonctionnelle', natureElement: 'donnee_enquete', sousAnalyse: 'occupation', label: 'Occupation fonctionnelle' },
        { typeElement: 'mixite_fonctionnelle', natureElement: 'donnee_enquete', sousAnalyse: 'occupation', label: 'Mixité fonctionnelle' },
        { typeElement: 'activites_economiques', natureElement: 'donnee_enquete', sousAnalyse: 'occupation', label: 'Activités économiques' },
        { typeElement: 'equipements_publics', natureElement: 'spatial', sousAnalyse: 'occupation', label: 'Équipements publics' },
        { typeElement: 'espaces_verts', natureElement: 'spatial', sousAnalyse: 'occupation', label: 'Espaces verts' },
        { typeElement: 'parking_transport', natureElement: 'spatial', sousAnalyse: 'occupation', label: 'Parking et transport' },
        { typeElement: 'vacance_occupation', natureElement: 'donnee_enquete', sousAnalyse: 'occupation', label: 'Vacance et occupation' },
      ],
    },
    // ─── Phase 3 : Physiologie ──────────────────────────────
    {
      phase: 'physiologie',
      label: 'Physiologie urbaine',
      elements: [
        // Sous-analyse dynamiques
        { typeElement: 'dynamique_demographique', natureElement: 'document', sousAnalyse: 'dynamiques', label: 'Dynamique démographique' },
        { typeElement: 'dynamique_immobiliere', natureElement: 'document', sousAnalyse: 'dynamiques', label: 'Dynamique immobilière' },
        { typeElement: 'dynamique_economique', natureElement: 'donnee_enquete', sousAnalyse: 'dynamiques', label: 'Dynamique économique' },
        { typeElement: 'dynamique_mobilite', natureElement: 'donnee_enquete', sousAnalyse: 'dynamiques', label: 'Dynamique de mobilité' },
        { typeElement: 'dynamique_sociale', natureElement: 'donnee_enquete', sousAnalyse: 'dynamiques', label: 'Dynamique sociale' },
        { typeElement: 'dynamique_environnementale', natureElement: 'document', sousAnalyse: 'dynamiques', label: 'Dynamique environnementale' },
        // Sous-analyse fonctionnement
        { typeElement: 'flux_circulation', natureElement: 'spatial', sousAnalyse: 'fonctionnement', label: 'Flux et circulation' },
        { typeElement: 'centralite_polarite', natureElement: 'spatial', sousAnalyse: 'fonctionnement', label: 'Centralité et polarité' },
        { typeElement: 'usage_espaces', natureElement: 'donnee_enquete', sousAnalyse: 'fonctionnement', label: 'Usage des espaces' },
        { typeElement: 'pratiques_habitants', natureElement: 'donnee_enquete', sousAnalyse: 'fonctionnement', label: 'Pratiques des habitants' },
        { typeElement: 'tensions_conflits', natureElement: 'donnee_enquete', sousAnalyse: 'fonctionnement', label: 'Tensions et conflits d\'usage' },
        { typeElement: 'reseaux_sociaux', natureElement: 'donnee_enquete', sousAnalyse: 'fonctionnement', label: 'Réseaux sociaux locaux' },
      ],
    },
    // ─── Phase 4 : Transversal ───────────────────────────────
    {
      phase: 'transversal',
      label: 'Transversal',
      elements: [
        { typeElement: 'plan_urbanisme', natureElement: 'document', sousAnalyse: 'transversal', label: 'Plan d\'urbanisme (SDAU/POS)' },
        { typeElement: 'documents_urbanisme', natureElement: 'document', sousAnalyse: 'transversal', label: 'Documents d\'urbanisme' },
        { typeElement: 'donnees_statistiques', natureElement: 'document', sousAnalyse: 'transversal', label: 'Données statistiques' },
        { typeElement: 'enquete_terrain', natureElement: 'donnee_enquete', sousAnalyse: 'transversal', label: 'Enquête de terrain' },
        { typeElement: 'cartographie_existante', natureElement: 'spatial', sousAnalyse: 'transversal', label: 'Cartographie existante' },
        { typeElement: 'donnees_satellitaires', natureElement: 'spatial', sousAnalyse: 'transversal', label: 'Données satellitaires / SIG' },
        { typeElement: 'diagnostic_aggregation', natureElement: 'document', sousAnalyse: 'transversal', label: 'Diagnostic agrégé' },
      ],
    },
  ],
}

// ─── Prompts Module B ──────────────────────────────────────────

export const PROMPT_QUESTIONNEUR_ANALYSE_URBAINE = `Tu es un assistant méthodologique spécialisé en analyse urbaine. Ton rôle est de poser des questions pertinentes au chercheur pour vérifier la rigueur et la complétude de son analyse urbaine.

Contexte : Le chercheur réalise une analyse urbaine méthodique couvrant 4 phases (Zonage, Anatomie, Physiologie, Transversal) avec des préalables.

Règles :
1. Pose des questions METHODOLOGIQUES (pas des questions de contenu thématique)
2. Cible les angles morts potentiels de l'analyse
3. Questionne la cohérence entre phases
4. Vérifie la triangulation des sources (spatial + enquête + document)
5. Formule des suggestions concrètes d'amélioration
6. Réponds en français, de manière concise et professionnelle
7. Ne dépasse pas 3 paragraphes

Les questions doivent porter sur :
- La pertinence du périmètre d'étude
- La couverture des sous-analyses
- La diversité des natures de données (spatial, enquête, document)
- Les liens entre morphologie et fonctionnement
- Les dynamiques temporelles prises en compte
- La validité des sources et leur fiabilité`

export const PROMPT_QUESTIONNEUR_GENERIQUE = `Tu es un assistant méthodologique expert. Ton rôle est d'aider le chercheur à questionner la rigueur de sa démarche analytique.

Règles :
1. Pose des questions méthodologiques ciblées
2. Identifie les lacunes potentielles dans la démarche
3. Suggère des améliorations concrètes
4. Réponds en français, de manière concise
5. Ne dépasse pas 3 paragraphes

Formule 2-3 questions méthodologiques pertinentes en fonction du contexte fourni par le chercheur.`

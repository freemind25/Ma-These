// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Types theses.fr API
// Correspond à l'API de recherche : https://theses.fr/api/v1/recherche/
// ═══════════════════════════════════════════════════════════════

/** Personne liée à une thèse (auteur, directeur, rapporteur, etc.) */
export interface ThesePerson {
  ppn: string | null;
  nom: string;
  prenom: string;
}

/** Structure liée (établissement, école doctorale, labo) */
export interface TheseStructure {
  ppn: string;
  nom: string;
  type: string | null;
}

/** Sujet / mot-clé */
export interface TheseSujet {
  langue: string;
  libelle: string;
}

/** Thèse « lite » (résultats de recherche) */
export interface TheseLite {
  id: string;
  nnt: string | null;
  titrePrincipal: string;
  titreEN: string | null;
  auteurs: ThesePerson[];
  directeurs: ThesePerson[];
  rapporteurs: ThesePerson[];
  examinateurs: ThesePerson[];
  president: ThesePerson | null;
  etabSoutenanceN: string;
  etabSoutenancePpn: string;
  dateSoutenance: string | null;
  datePremiereInscriptionDoctorat: string | null;
  discipline: string;
  status: "soutenue" | "enCours" | null;
  ecolesDoctorale: TheseStructure[];
  partenairesDeRecherche: TheseStructure[];
  sujets: TheseSujet[];
  sujetsRameau: TheseSujet[];
  doi: string | null;
}

/** Réponse de recherche */
export interface TheseSearchResponse {
  totalHits: number;
  took: number;
  theses: TheseLite[];
}

/** Options de tri */
export type TheseSortOption =
  | "dateDesc"
  | "dateAsc"
  | "auteursAsc"
  | "auteursDesc"
  | "disciplineAsc"
  | "disciplineDesc";

/** Paramètres de recherche */
export interface TheseSearchParams {
  q: string;
  debut?: number;
  nombre?: number;
  tri?: TheseSortOption;
  filtres?: TheseFilters;
}

/** Filtres de recherche */
export interface TheseFilters {
 disciplines?: string[];
 langues?: string[];
 etablissements?: string[];
 statut?: ("soutenue" | "enCours")[];
 anneesMin?: number;
  anneesMax?: number;
}

/** Bouton d'accès (API diffusion) */
export interface TheseBouton {
  libelle: string;
  url: string;
  dateFin: string | null;
  typeAcces:
    | "ACCES_LIGNE"
    | "ACCES_ESR"
    | "EMBARGO"
    | "CONFIDENTIALITE"
    | "SUDOC";
}

/** Réponse boutons d'accès */
export interface BoutonsResponse {
  categories: {
    libelle: string;
    sousCategories?: {
      libelle: string;
      boutons: TheseBouton[];
    }[];
    boutons?: TheseBouton[];
  }[];
}

/** Personne dans la recherche personnes */
export interface PersonneResult {
  id: string;
  nom: string;
  prenom: string;
  ppn: string | null;
  role: string;
  theseCount?: number;
}

/** Réponse recherche personnes */
export interface PersonneSearchResponse {
  totalHits: number;
  personnes: PersonneResult[];
}

// ── Constantes ──

export const THESES_FR_BASE = "https://theses.fr";
export const THESES_FR_SEARCH = `${THESES_FR_BASE}/api/v1/theses/recherche/`;
export const THESES_FR_DETAIL = `${THESES_FR_BASE}/api/v1/theses/these/`;
export const THESES_FR_STATS = `${THESES_FR_BASE}/api/v1/theses/statsTheses`;
export const THESES_FR_BUTTONS = `${THESES_FR_BASE}/api/v1/button/`;
export const THESES_FR_PERSONS = `${THESES_FR_BASE}/api/v1/personnes/recherche/`;

export const SORT_OPTIONS: { value: TheseSortOption; label: string }[] = [
  { value: "dateDesc", label: "Date (récent → ancien)" },
  { value: "dateAsc", label: "Date (ancien → récent)" },
  { value: "auteursAsc", label: "Auteur (A → Z)" },
  { value: "auteursDesc", label: "Auteur (Z → A)" },
  { value: "disciplineAsc", label: "Discipline (A → Z)" },
  { value: "disciplineDesc", label: "Discipline (Z → A)" },
];

/** Mappe le filtre objet vers la syntaxe theses.fr */
export function buildFilterString(f: TheseFilters): string {
  const parts: string[] = [];
  if (f.disciplines?.length) {
    f.disciplines.forEach((d) => parts.push(`discipline="${d}"`));
  }
  if (f.langues?.length) {
    f.langues.forEach((l) => parts.push(`langues="${l}"`));
  }
  if (f.etablissements?.length) {
    f.etablissements.forEach((e) => parts.push(`etabSoutenanceN="${e}"`));
  }
  if (f.statut?.length) {
    f.statut.forEach((s) => parts.push(`status="${s === "soutenue" ? "soutenue" : "enCours"}"`));
  }
  if (f.anneesMin) {
    parts.push(`dateSoutenanceMin="${f.anneesMin}"`);
  }
  if (f.anneesMax) {
    parts.push(`dateSoutenanceMax="${f.anneesMax}"`);
  }
  return parts.join("&");
}

/** Formate le nom complet d'une personne */
export function formatPersonName(p: ThesePerson): string {
  return `${p.prenom} ${p.nom}`.trim();
}

/** Retourne l'URL de la page theses.fr pour une thèse */
export function getTheseUrl(id: string): string {
  return `${THESES_FR_BASE}/${id}`;
}

/** Retourne le type d'accès en français */
export function formatAccessType(type: TheseBouton["typeAcces"]): string {
  const map: Record<TheseBouton["typeAcces"], string> = {
    ACCES_LIGNE: "Accès libre",
    ACCES_ESR: "Accès ESR",
    EMBARGO: "Sous embargo",
    CONFIDENTIALITE: "Confidentiel",
    SUDOC: "Via Sudoc",
  };
  return map[type] ?? type;
}

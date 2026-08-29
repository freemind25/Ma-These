// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Curation pré-rapport déterministe
// Inspiration : source curation pré-rapport de gpt-researcher (Apache 2.0)
// Amélioration sur leur pattern : criblage DÉTERMINISTE (pas d'appel LLM)
// OpenAlex donne citation_count, venue, type — filtrable sans LLM
// Règle #11 : ressource externe = inspiration format/pattern, pas contenu
// ═══════════════════════════════════════════════════════════════

import type {
  CuratedWork,
  CurationDetails,
} from './openalex';
import {
  openAlexWorkToFormatted,
  type OpenAlexWork,
} from './openalex';

// ── Poids de curation (configurables, comme HYBRID_WEIGHTS) ────────

export const CURATION_WEIGHTS = {
  /** DOI présent = source identifiable et traçable */
  doi: 0.15,
  /** Venue identifiée (journal/actes) = publié dans un support reconnu */
  venue: 0.15,
  /** Type = journal-article > proceedings > preprint > autre */
  type: 0.10,
  /** Citations normalisées par âge (0-1) */
  citationAge: 0.30,
  /** Open access = vérifiable par le lecteur */
  openAccess: 0.15,
  /** Récence (0-1, déclin linéaire sur 15 ans) */
  recency: 0.15,
} as const;

export const CURATION_THRESHOLD_GOOD = 0.55;
export const CURATION_THRESHOLD_ACCEPTABLE = 0.35;

// ── Scores individuels ────────────────────────────────────────────

/**
 * Score DOI : 1 si présent, 0 sinon
 */
function scoreDoi(doi: string | undefined): number {
  return doi && doi.length > 0 ? 1 : 0;
}

/**
 * Score venue : 1 si venue identifiée, 0.5 si partiel, 0 sinon
 */
function scoreVenue(venue: string): number {
  if (!venue || venue.length === 0) return 0;
  // Venue identifiée et non générique
  const genericTerms = [/^unknown/i, /^n\/a$/i, /^s\.?d\.?$/i];
  if (genericTerms.some((re) => re.test(venue))) return 0.3;
  return 1;
}

/**
 * Score type : journal-article=1, proceedings-article=0.8, book-chapter=0.7, preprint=0.4, autre=0.3
 */
function scoreType(type: string): number {
  const typeScores: Record<string, number> = {
    'journal-article': 1.0,
    'proceedings-article': 0.8,
    'book-chapter': 0.7,
    'dissertation': 0.6,
    'preprint': 0.4,
    'working-paper': 0.3,
    'dataset': 0.2,
    'other': 0.2,
  };
  return typeScores[type] || 0.3;
}

/**
 * Score citation normalisé par âge.
 * Un article de 2020 avec 50 citations ≠ un article de 2010 avec 50 citations.
 * Formule : log10(1 + citations) / log10(1 + maxExpectedCitations(age))
 * où maxExpectedCitations = age * 5 (5 citations/an est un bon seuil pour un papier solide)
 */
function scoreCitationByAge(
  citedByCount: number,
  year: number,
  currentYear: number,
): number {
  if (year <= 0) return citedByCount > 0 ? 0.3 : 0;
  const age = currentYear - year;
  if (age < 0) return 0;
  if (age === 0) {
    // Article de l'année en cours : toute citation est positive
    return Math.min(1, Math.log10(1 + citedByCount) / Math.log10(6));
  }
  const maxExpected = age * 5;
  return Math.min(
    1,
    Math.log10(1 + citedByCount) / Math.log10(1 + maxExpected),
  );
}

/**
 * Score open access : gold=1, green=0.8, bronze=0.6, closed=0.2
 */
function scoreOpenAccess(oaStatus: string): number {
  const oaScores: Record<string, number> = {
    gold: 1.0,
    green: 0.8,
    hybrid: 0.7,
    bronze: 0.5,
    closed: 0.2,
  };
  return oaScores[oaStatus] || 0.2;
}

/**
 * Score récence : déclin linéaire sur 15 ans.
 * Article de l'année = 1, article de 15+ ans = 0.1
 */
function scoreRecency(year: number, currentYear: number): number {
  if (year <= 0) return 0.3;
  const age = currentYear - year;
  if (age < 0) return 1;
  if (age >= 15) return 0.1;
  return Math.max(0.1, 1 - (age / 15) * 0.9);
}

// ── Fonctions principales ─────────────────────────────────────────

/**
 * Calcule le score de crédibilité d'un travail formaté.
 * 100% déterministe — aucun appel LLM.
 */
export function computeCurationScore(
  work: {
    doi: string;
    venue: string;
    type: string;
    citedByCount: number;
    year: number;
    oaStatus: string;
  },
  currentYear = new Date().getFullYear(),
): { score: number; details: CurationDetails } {
  const doiScore = scoreDoi(work.doi);
  const venueScore = scoreVenue(work.venue);
  const typeScore = scoreType(work.type);
  const citScore = scoreCitationByAge(work.citedByCount, work.year, currentYear);
  const oaScore = scoreOpenAccess(work.oaStatus);
  const recencyScore = scoreRecency(work.year, currentYear);

  const W = CURATION_WEIGHTS;
  const total =
    doiScore * W.doi +
    venueScore * W.venue +
    typeScore * W.type +
    citScore * W.citationAge +
    oaScore * W.openAccess +
    recencyScore * W.recency;

  return {
    score: Math.round(total * 100) / 100,
    details: {
      hasDoi: work.doi.length > 0,
      isPeerReviewed: work.type === 'journal-article' || work.type === 'proceedings-article',
      venueIdentified: work.venue.length > 0,
      citationScore: Math.round(citScore * 100) / 100,
      recencyScore: Math.round(recencyScore * 100) / 100,
      oaScore: Math.round(oaScore * 100) / 100,
      typeScore: Math.round(typeScore * 100) / 100,
    },
  };
}

/**
 * Applique la curation à une liste de travaux OpenAlex.
 * Trie par score de curation décroissant.
 *
 * @param works - Travaux bruts OpenAlex
 * @param maxResults - Nombre max de résultats à retourner
 * @param minScore - Score minimum pour inclure un travail (défaut = seuil acceptable)
 * @returns Liste de travaux curés, triés par score
 */
export function curateWorks(
  works: OpenAlexWork[],
  options?: {
    maxResults?: number;
    minScore?: number;
  },
): CuratedWork[] {
  const { maxResults = 15, minScore = CURATION_THRESHOLD_ACCEPTABLE } = options || {};

  const curated: CuratedWork[] = [];

  for (const work of works) {
    // Ignorer les rétractés
    if (work.is_retracted) continue;

    const formatted = openAlexWorkToFormatted(work);
    const { score, details } = computeCurationScore(formatted);

    if (score >= minScore) {
      curated.push({
        ...formatted,
        curationScore: score,
        curationDetails: details,
      });
    }
  }

  // Tri par score décroissant, puis par citations
  curated.sort((a, b) =>
    b.curationScore !== a.curationScore
      ? b.curationScore - a.curationScore
      : b.citedByCount - a.citedByCount,
  );

  return curated.slice(0, maxResults);
}

/**
 * Classement des travaux : BON / ACCEPTABLE / FAIBLE
 */
export function classifyWork(score: number): 'BON' | 'ACCEPTABLE' | 'FAIBLE' {
  if (score >= CURATION_THRESHOLD_GOOD) return 'BON';
  if (score >= CURATION_THRESHOLD_ACCEPTABLE) return 'ACCEPTABLE';
  return 'FAIBLE';
}

/**
 * Génère un résumé de la curation pour le log / debug.
 */
export function curationSummary(works: CuratedWork[]): {
  total: number;
  bons: number;
  acceptables: number;
  faibles: number;
  avgScore: number;
} {
  let bons = 0, acceptables = 0, faibles = 0;
  let totalScore = 0;

  for (const w of works) {
    totalScore += w.curationScore;
    const cls = classifyWork(w.curationScore);
    if (cls === 'BON') bons++;
    else if (cls === 'ACCEPTABLE') acceptables++;
    else faibles++;
  }

  return {
    total: works.length,
    bons,
    acceptables,
    faibles,
    avgScore: works.length > 0
      ? Math.round((totalScore / works.length) * 100) / 100
      : 0,
  };
}

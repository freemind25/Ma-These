// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Unpaywall (v1.10.16)
// Statut d'accès ouvert et lien plein-texte légal par DOI.
// API : https://unpaywall.org/products/api — sans clé MAIS paramètre
// `email` OBLIGATOIRE (email de contact réel ; l'API renvoie 422 sinon).
// Email par défaut validé auprès de l'API le 2026-10-31 ; surcharge via
// la variable d'environnement UNPAYWALL_EMAIL.
// ═══════════════════════════════════════════════════════════════

import { normalizeDoi, scholarlyJsonFetch } from "./http";

const UNPAYWALL_BASE = "https://api.unpaywall.org/v2";
const DEFAULT_EMAIL = "contact@mathese.app";

export interface UnpaywallStatus {
  isOa: boolean;
  /** gold | green | hybrid | bronze | closed */
  oaStatus?: string;
  /** Meilleur lien plein-texte légal (PDF si disponible) */
  bestOaUrl?: string;
  bestOaUrlForPdf?: string;
  title?: string;
  journal?: string;
  publisher?: string;
  year?: number;
  /** Article, dataset, thèse… selon Unpaywall (genre) */
  genre?: string;
}

/** Email de contact utilisé pour l'API Unpaywall (surchargeable côté serveur) */
export function getUnpaywallEmail(): string {
  const fromEnv = process.env.UNPAYWALL_EMAIL?.trim();
  return fromEnv && fromEnv.includes("@") ? fromEnv : DEFAULT_EMAIL;
}

// ── Réponse API ──

interface UnpaywallResponse {
  doi?: string;
  is_oa?: boolean;
  oa_status?: string;
  title?: string;
  journal_name?: string;
  publisher?: string;
  year?: number;
  genre?: string;
  best_oa_location?: {
    url?: string | null;
    url_for_pdf?: string | null;
  } | null;
}

/** Statut d'accès ouvert pour un DOI — null si DOI absent d'Unpaywall ou réseau indisponible */
export async function getOpenAccessStatus(doi: string): Promise<UnpaywallStatus | null> {
  const d = normalizeDoi(doi);
  if (!/^10\.\d{4,}\//.test(d)) return null;
  const data = await scholarlyJsonFetch<UnpaywallResponse>(
    `${UNPAYWALL_BASE}/${encodeURIComponent(d)}?email=${encodeURIComponent(getUnpaywallEmail())}`
  );
  if (!data || data.is_oa === undefined) return null;
  return {
    isOa: Boolean(data.is_oa),
    oaStatus: data.oa_status,
    bestOaUrl: data.best_oa_location?.url ?? undefined,
    bestOaUrlForPdf: data.best_oa_location?.url_for_pdf ?? undefined,
    title: data.title,
    journal: data.journal_name,
    publisher: data.publisher,
    year: data.year,
    genre: data.genre,
  };
}

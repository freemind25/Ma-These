// ═══════════════════════════════════════════════════════════════
// Veille académique — noyau de diff (fonctions PURES)
// specs/veille-academique — T2
//
// Contraintes : zéro db, zéro fetch — uniquement des entrées/sorties
// typées, testables hors réseau (T11 : check-core.test.ts).
// ═══════════════════════════════════════════════════════════════

/** Résultat normalisé renvoyé par une route de source (HAL ou arXiv). */
export interface FetchedItem {
  externalId: string; // docid HAL ou arxivId — identifiant stable
  title: string;
  authors: string; // séparés « ; »
  year: number | null;
  url: string;
  abstract: string | null;
}

/** Résultat déjà stocké en base (lecture minimale pour le diff). */
export interface StoredItem {
  externalId: string;
  seen: boolean;
}

export interface DiffResult {
  /** true si la base stockée est vide → premier contrôle (CA-2.1). */
  isFirstCheck: boolean;
  /** Résultats inconnus à insérer comme « nouveaux » (CA-2.2). */
  newItems: FetchedItem[];
}

/**
 * Diff entre les résultats stockés et ceux fraîchement récupérés.
 *
 * - CA-2.1 : premier contrôle (base vide) → la base de référence est
 *   construite sans aucun « nouveau » (newItems vide) ; l'appelant
 *   insère alors l'intégralité des résultats avec seen = true.
 * - CA-2.2 : contrôles suivants → un résultat dont l'externalId est
 *   inconnu est marqué nouveau. Les résultats déjà connus ne sont
 *   JAMAIS re-marqués (seen conservé tel quel).
 */
export function diffResults(stored: StoredItem[], fetched: FetchedItem[]): DiffResult {
  const isFirstCheck = stored.length === 0;
  if (isFirstCheck) {
    return { isFirstCheck, newItems: [] };
  }
  const known = new Set(stored.map((item) => item.externalId));
  const newItems = fetched.filter(
    (item) => item.externalId.trim() !== "" && !known.has(item.externalId)
  );
  return { isFirstCheck, newItems };
}

export interface RetainableItem {
  id: string;
  firstSeenAt: Date | string;
}

export interface RetentionResult<T extends RetainableItem> {
  /** Résultats conservés (fenêtre glissante). */
  kept: T[];
  /** Résultats à supprimer (au-delà de la limite). */
  removed: T[];
}

/**
 * Rétention — fenêtre glissante : ne conserve que les `limit` résultats
 * les plus récents (tri par firstSeenAt desc). Décision de clarification
 * n°4 : 200 résultats maximum par veille.
 */
export function applyRetention<T extends RetainableItem>(
  items: T[],
  limit = 200
): RetentionResult<T> {
  if (items.length <= limit) {
    return { kept: [...items], removed: [] };
  }
  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime()
  );
  return { kept: sorted.slice(0, limit), removed: sorted.slice(limit) };
}

/**
 * Petit assistant pur : parse la colonne `filters` (JSON-dans-String,
 * patron du dépôt) en objet exploitable. Valeur invalide → objet vide,
 * jamais d'exception.
 */
export function parseFiltersJson(filters: string): Record<string, string> {
  if (!filters) return {};
  try {
    const parsed: unknown = JSON.parse(filters);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.trim() !== "") {
        out[key] = value.trim();
      }
    }
    return out;
  } catch {
    return {};
  }
}

// ═══════════════════════════════════════════════════════════════
// Vérification automatique (specs/veille-check-auto)
// Constante + éligibilité pures — testables sans db ni réseau.
// ═══════════════════════════════════════════════════════════════

/** Intervalle fixe entre deux vérifications automatiques (décision n°2 : 6 h, non configurable). */
export const AUTO_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Éligibilité d'une veille à une vérification automatique :
 * opt-in actif ET (jamais vérifiée OU dernière vérification plus ancienne que l'intervalle).
 * Premier relevé auto autorisé (décision n°3) — il crée la base de référence (CA-2.1).
 */
export function isDueForAutoCheck(
  autoCheck: boolean,
  lastCheckedAt: Date | string | null,
  now: Date,
  intervalMs: number = AUTO_CHECK_INTERVAL_MS
): boolean {
  if (!autoCheck) return false;
  if (!lastCheckedAt) return true;
  const last = new Date(lastCheckedAt).getTime();
  if (!Number.isFinite(last)) return true;
  return now.getTime() - last >= intervalMs;
}

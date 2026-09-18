// Veille académique — cœur de vérification, fonctions pures.
// Zéro accès base, zéro fetch : ces comportements sont épinglés sans réseau
// ni base par src/lib/veille/check-core.test.ts (Groupe E).

export interface FetchedItem {
  externalId: string;
  title: string;
  authors: string;
  year: number | null;
  url: string;
  abstract: string | null;
}

export interface DiffResult {
  isFirstCheck: boolean;
  newItems: FetchedItem[];
}

/**
 * Diff entre les identifiants déjà stockés pour une veille et les résultats
 * fraîchement récupérés de la source.
 * - CA-2.1 — première vérification (aucun identifiant stocké) : tous les
 *   résultats actuels constituent la base de référence ; aucun n'est marqué
 *   « nouveau » (isFirstCheck = true, newItems vide — la base est insérée « vue »).
 * - CA-2.2 — vérifications suivantes : seuls les identifiants absents du stock
 *   sont nouveaux ; les résultats connus ne sont jamais re-marqués.
 */
export function diffResults(
  storedExternalIds: string[],
  fetched: FetchedItem[]
): DiffResult {
  if (storedExternalIds.length === 0) {
    return { isFirstCheck: true, newItems: [] };
  }
  const known = new Set(storedExternalIds);
  const newItems = fetched.filter(
    (item) => item.externalId && !known.has(item.externalId)
  );
  return { isFirstCheck: false, newItems };
}

/**
 * Rétention (décision de clarification n°4 de la spec) : fenêtre glissante —
 * on conserve les `limit` résultats les plus récents, triés par firstSeenAt
 * décroissant. Retourne les éléments à CONSERVER ; le surplus s'en déduit.
 */
export function applyRetention<T extends { firstSeenAt: Date }>(
  items: T[],
  limit = 200
): T[] {
  if (items.length <= limit) return items;
  return [...items]
    .sort((a, b) => b.firstSeenAt.getTime() - a.firstSeenAt.getTime())
    .slice(0, limit);
}

/**
 * Déduplique une liste de résultats récupérés par identifiant source
 * (garde la première occurrence) — protège createMany contre les doublons
 * intra-lot avant l'unicité [savedSearchId, externalId].
 */
export function dedupeByExternalId(items: FetchedItem[]): FetchedItem[] {
  const seen = new Set<string>();
  const out: FetchedItem[] = [];
  for (const item of items) {
    if (!item.externalId || seen.has(item.externalId)) continue;
    seen.add(item.externalId);
    out.push(item);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Client HTTP commun aux registres académiques (v1.10.16)
// Serveur uniquement — jamais importer côté client.
// ═══════════════════════════════════════════════════════════════

/** UA de l'application — identifie Ma Thèse auprès des registres (polite pool) */
export const SCHOLARLY_UA = "MaThese/1.10 (mailto:contact@mathese.app)";

/**
 * GET JSON avec timeout — null si HTTP != 2xx, réseau indisponible ou erreur de parsing.
 * Les registres académiques (DataCite, ORCID, Unpaywall) sont sondés et répondent
 * correctement à Node fetch (undici) — pas besoin de gatewayFetch (contrairement
 * à codecraftapi, cf. src/lib/ai/gateway-fetch.ts).
 */
export async function scholarlyJsonFetch<T>(
  url: string,
  options: { timeoutMs?: number; accept?: string } = {}
): Promise<T | null> {
  const { timeoutMs = 15_000, accept = "application/json" } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": SCHOLARLY_UA,
        Accept: accept,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Normalise un DOI : retire le préfixe https://doi.org/, la casse est conservée */
export function normalizeDoi(doi: string): string {
  return doi.replace(/^https?:\/\/doi\.org\//i, "").trim();
}

/** Heuristique : la chaîne ressemble-t-elle à un ORCID iD (0000-0002-1825-0097) ? */
export function looksLikeOrcidId(value: string): boolean {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(value.trim().toUpperCase());
}

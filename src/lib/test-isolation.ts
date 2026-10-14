/**
 * Filet technique d'isolation des tests Vitest — bases de données protégées.
 *
 * Objectif (décision propriétaire 2026-10-14) : AUCUN test ne doit pouvoir se
 * connecter — donc écrire — à une base de données réelle. Ce module complète
 * l'isolation « par convention » existante (les fichiers de test mockent
 * @/lib/db) par une garantie technique appliquée AVANT le chargement des tests.
 *
 * Politique retenue : liste blanche. Seules les cibles jetables sont autorisées :
 *   - file:/tmp/thesisframe-vitest-isolation/<fichier>.db (base jetable dédiée)
 *   - :memory: (SQLite en mémoire)
 * Toute autre valeur — dont db/custom.db et db/urbanisme-test.db (protégées),
 * les sauvegardes d'audit et tout chemin sous /home/sync — est REMPLACÉE par
 * l'URL jetable par défaut. La valeur d'origine n'est jamais affichée en clair
 * (uniquement le nom de fichier final, masqué).
 *
 * Ce module n'a d'effet QUE dans le processus de test (setupFiles vitest) ;
 * il n'est importé par aucun code applicatif.
 */

/** URL jetable par défaut : hors du projet, hors des espaces préservés. */
export const SAFE_TEST_DATABASE_URL = 'file:/tmp/thesisframe-vitest-isolation/test.db'

const ALLOWED_PREFIXES = ['file:/tmp/thesisframe-vitest-isolation/']

const FORBIDDEN_PATTERNS: ReadonlyArray<{ label: string; regex: RegExp }> = [
  { label: 'base protégée custom.db', regex: /custom\.db/i },
  { label: 'base protégée urbanisme-test.db', regex: /urbanisme-test\.db/i },
  {
    label: 'sauvegardes de référence (audit/baseline/evidence/backups)',
    regex: /audit[/\\]baseline[/\\]evidence[/\\]backups/i,
  },
  { label: 'dossier db/ du projet', regex: /(^|[/\\])db[/\\]/i },
  { label: 'espace de préservation /home/sync', regex: /[/\\]home[/\\]sync/i },
]

/** Partie « chemin » d'une URL (avant tout ?query ou #fragment). */
function extractPathPart(url: string): string {
  let out = url
  const queryIndex = out.indexOf('?')
  if (queryIndex !== -1) out = out.slice(0, queryIndex)
  const fragmentIndex = out.indexOf('#')
  if (fragmentIndex !== -1) out = out.slice(0, fragmentIndex)
  return out
}

/**
 * Détecte toute traversée de chemin (segment '..') dans l'URL brute comme
 * dans ses formes décodées (ex. %2e%2e). Encodage malformé = suspect par
 * défaut (échec fermé) — une URL illisible ne doit jamais être autorisée.
 */
function hasPathTraversal(url: string): boolean {
  const forms = new Set<string>([url])
  try {
    forms.add(decodeURIComponent(url))
  } catch {
    return true
  }
  for (const form of forms) {
    if (form.split(/[/\\]/).some((segment) => segment === '..')) return true
  }
  return false
}

/** true si l'URL est explicitement autorisée comme cible jetable de test. */
export function isAllowedTestDatabaseUrl(url: string): boolean {
  const trimmed = url.trim()
  if (trimmed === '') return false

  // SQLite en mémoire : uniquement si le chemin (hors ?query/#fragment) est
  // exactement ':memory:' ou 'file::memory:'. Un ':memory:' placé dans un
  // paramètre de requête d'une URL de fichier réel n'est PAS une base en
  // mémoire et ne doit pas passer la liste blanche.
  const pathPart = extractPathPart(trimmed)
  if (pathPart === ':memory:' || pathPart === 'file::memory:') return true

  // Liste blanche de préfixe, puis contrôles de robustesse (échec fermé) :
  // une URL commençant par le préfixe autorisé mais contenant une traversée
  // ('..', y compris encodée) ou un motif protégé est refusée.
  if (!ALLOWED_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return false
  if (hasPathTraversal(trimmed)) return false
  if (findForbiddenMatch(trimmed) !== null) return false
  return true
}

/** Retourne le libellé du premier motif protégé reconnu, sinon null. */
export function findForbiddenMatch(url: string): string | null {
  for (const { label, regex } of FORBIDDEN_PATTERNS) {
    if (regex.test(url)) return label
  }
  return null
}

/** Masque un chemin : ne conserve que le nom de fichier final. */
export function maskDatabaseUrl(url: string): string {
  const fileName = url.split(/[/\\]/).pop() ?? '<inconnu>'
  return `…/${fileName}`
}

export type IsolationResult = {
  /** Le filet a été appliqué (toujours true en sortie de fonction). */
  enforced: boolean
  /** true si la valeur d'origine a été remplacée par l'URL jetable. */
  replaced: boolean
  /** Motif du remplacement (libellé lisible), sinon null. */
  reason: string | null
  /** Valeur d'origine masquée (nom de fichier seul), sinon null. */
  originalMasked: string | null
}

/**
 * Applique le filet : si DATABASE_URL est absente, vide, ou ne figure pas sur
 * la liste blanche, elle est remplacée par SAFE_TEST_DATABASE_URL. La fonction
 * ne lève pas d'exception — garantir la protection prime sur l'interruption ;
 * le remplacement est tracé par le setup pour rester visible dans la sortie.
 */
export function enforceTestDatabaseIsolation(
  env: Record<string, string | undefined> = process.env
): IsolationResult {
  const raw = env.DATABASE_URL

  if (raw !== undefined && isAllowedTestDatabaseUrl(raw)) {
    return { enforced: true, replaced: false, reason: null, originalMasked: null }
  }

  const reason =
    raw === undefined || raw.trim() === ''
      ? 'DATABASE_URL absente : base jetable appliquée par précaution'
      : (findForbiddenMatch(raw) ?? 'cible hors liste blanche des tests')

  const originalMasked = raw ? maskDatabaseUrl(raw) : null
  env.DATABASE_URL = SAFE_TEST_DATABASE_URL

  return { enforced: true, replaced: true, reason, originalMasked }
}

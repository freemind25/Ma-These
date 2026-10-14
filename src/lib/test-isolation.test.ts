import { afterEach, describe, expect, it } from 'vitest'
import {
  SAFE_TEST_DATABASE_URL,
  enforceTestDatabaseIsolation,
  findForbiddenMatch,
  isAllowedTestDatabaseUrl,
  maskDatabaseUrl,
} from './test-isolation'

/**
 * Tests du filet d'isolation : preuve permanente que la garde neutralise toute
 * DATABASE_URL non autorisée (dont les bases protégées) avant les tests.
 */
describe("filet d'isolation des bases de données protégées", () => {
  const original = process.env.DATABASE_URL

  afterEach(() => {
    if (original === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = original
    }
  })

  it('remplace une DATABASE_URL pointant vers la base protégée custom.db', () => {
    const env = { DATABASE_URL: 'file:/home/z/my-project/db/custom.db' }
    const result = enforceTestDatabaseIsolation(env)
    expect(result.replaced).toBe(true)
    expect(env.DATABASE_URL).toBe(SAFE_TEST_DATABASE_URL)
    expect(result.originalMasked).toBe('…/custom.db')
    expect(result.originalMasked).not.toContain('/home/z/my-project')
  })

  it('remplace une DATABASE_URL pointant vers la base protégée urbanisme-test.db', () => {
    const env = { DATABASE_URL: 'file:/home/z/my-project/db/urbanisme-test.db' }
    const result = enforceTestDatabaseIsolation(env)
    expect(result.replaced).toBe(true)
    expect(env.DATABASE_URL).toBe(SAFE_TEST_DATABASE_URL)
  })

  it('remplace une DATABASE_URL pointant vers les sauvegardes de référence', () => {
    const env = {
      DATABASE_URL:
        'file:/home/z/my-project/audit/baseline/evidence/backups/urbanisme-test-avant-resync.db',
    }
    const result = enforceTestDatabaseIsolation(env)
    expect(result.replaced).toBe(true)
    expect(env.DATABASE_URL).toBe(SAFE_TEST_DATABASE_URL)
  })

  it('applique la base jetable quand DATABASE_URL est absente', () => {
    const env: Record<string, string | undefined> = {}
    const result = enforceTestDatabaseIsolation(env)
    expect(result.replaced).toBe(true)
    expect(env.DATABASE_URL).toBe(SAFE_TEST_DATABASE_URL)
    expect(result.reason).toContain('absente')
  })

  it('ne remplace pas une base jetable déjà conforme', () => {
    const env = { DATABASE_URL: SAFE_TEST_DATABASE_URL }
    const result = enforceTestDatabaseIsolation(env)
    expect(result.replaced).toBe(false)
    expect(env.DATABASE_URL).toBe(SAFE_TEST_DATABASE_URL)
    expect(result.reason).toBeNull()
  })

  it('accepte SQLite en mémoire et refuse une cible hors liste blanche', () => {
    expect(isAllowedTestDatabaseUrl(':memory:')).toBe(true)
    expect(isAllowedTestDatabaseUrl('file:/tmp/autre/base.db')).toBe(false)
    expect(isAllowedTestDatabaseUrl('')).toBe(false)
  })

  it('détecte les motifs protégés et masque les chemins', () => {
    expect(findForbiddenMatch('file:./db/custom.db')).toBe('base protégée custom.db')
    expect(findForbiddenMatch('file:/home/z/my-project/db/urbanisme-test.db')).toBe(
      'base protégée urbanisme-test.db'
    )
    expect(findForbiddenMatch('/home/sync/upload/secours.tar.gz')).toContain('/home/sync')
    expect(maskDatabaseUrl('file:/home/z/my-project/db/custom.db')).toBe('…/custom.db')
  })

  it("l'URL jetable par défaut est hors du projet et non protégée", () => {
    expect(SAFE_TEST_DATABASE_URL.startsWith('file:/tmp/thesisframe-vitest-isolation/')).toBe(
      true
    )
    expect(findForbiddenMatch(SAFE_TEST_DATABASE_URL)).toBeNull()
    expect(isAllowedTestDatabaseUrl(SAFE_TEST_DATABASE_URL)).toBe(true)
  })
})

/**
 * Setup Vitest — filet d'isolation des bases de données protégées.
 *
 * Exécuté par vitest AVANT chaque module de test (test.setupFiles), donc avant
 * tout import de code applicatif par les tests. Voir src/lib/test-isolation.ts.
 */
import { enforceTestDatabaseIsolation } from '../lib/test-isolation'

const result = enforceTestDatabaseIsolation()

if (result.replaced) {
  // Le nom de fichier seul est affiché, jamais le chemin complet.
  console.warn(
    `[ISOLATION-TESTS] DATABASE_URL remplacée par la base jetable — motif : ${result.reason} ; origine (masquée) : ${result.originalMasked ?? 'non définie'}.`
  )
}

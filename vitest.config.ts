import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'mini-services', 'examples'],
    // Filet d'isolation des bases protégées : s'exécute avant chaque module
    // de test (voir src/tests/setup-isolation.ts et src/lib/test-isolation.ts).
    setupFiles: ['src/tests/setup-isolation.ts'],
    // Cible jetable imposée au processus de test — ne remplace jamais la
    // valeur de l'environnement applicatif (.env / shell), uniquement les tests.
    env: {
      DATABASE_URL: 'file:/tmp/thesisframe-vitest-isolation/test.db',
    },
  },
})

# Voie rapide — ai-types-provider-count

## Demande

Échec préexistant à la suite vitest : `src/lib/ai/ai-types.test.ts > DYNAMIC_MODEL_PROVIDERS > has exactly 18 providers` (attendu 18, réel 20). Commande du propriétaire (2026-09-18) : nouvelle tâche, voie rapide (1 fichier, changement de chiffre attendu 18 → 20, aucun impact transverse), sous condition de vérification préalable que **20 est bien le compte voulu et non lui-même un symptôme** (doublon ou reliquat de test), l'hypothèse nommée étant « routesme et apinex, fournisseurs légitimement ajoutés au catalogue ».

## Vérification préalable (condition de la commande)

- **Compte réel** : `DYNAMIC_MODEL_PROVIDERS` (`src/lib/ai/ai-types.ts` l.201-206) = **20 entrées, 20 uniques, 0 inconnu du catalogue** (exécution bun, sortie dans `preuves.md`). Aucun doublon, aucun reliquat.
- **Cohérence d'ensemble** : `ALL_PROVIDER_IDS` = 26 providers, couverture catégories = 26, 0 orphelin ; hors dynamique : `zai`, `openai`, `anthropic`, `pollinations`, `kilo`, `kiraai` (listes statiques / SDK natif) — 26 − 6 = 20, cohérent.
- **`routesme`** : fournisseur légitime et pleinement câblé — union de types (`ai-types.ts` l.14), base URL l.76, catégorie premium l.230, label l.263, `ALL_PROVIDER_IDS` l.325, clé env `ROUTESME_API_KEY` (`src/lib/ai/hardcoded-keys.ts` l.32), branchement client (`src/lib/ai/zai-client.ts` l.852), page dédiée (`src/modules/routesme/routesme-page.tsx`). **Mais** il faisait déjà partie du catalogue à sa création — il n'explique pas le delta.
- **`apinex`** : **absent du catalogue** — `git log -S 'apinex' -- src/lib/ai/ai-types.ts` ne renvoie aucun commit ; jamais présent. C'est une intégration gateway distincte et légitime hors catalogue (`src/lib/apinex/apinex-client.ts`, base `https://api.apinex.bond`, clé env `APINEX_API_KEY`, routes `/api/apinex/*`), mais elle ne compte pas dans `DYNAMIC_MODEL_PROVIDERS`. L'hypothèse « routesme + apinex » est donc **corrigée sur preuve**.
- **Attribution réelle du 18 vs 20** : le catalogue (20 entrées) et le test (assertion 18) sont arrivés **ensemble** dans le commit externe `1359333` (2026-09-15) — le test est né périmé, **jamais vert**. Second et dernier commit touchant le test : `6463078` (2026-09-16), changement de mode fichier uniquement (100644 → 100755), 0 ligne. Git ne permet pas d'attribuer le delta à deux noms précis (historique en un seul commit) ; ce qui est prouvé : le 18 était un chiffre périmé dès sa création, le 20 est le compte réel, sain et non symptomatique.

**Conclusion : condition satisfaite — 20 est le compte voulu. Correctif autorisé par la commande conditionnelle.**

## Correctif

`src/lib/ai/ai-types.test.ts` l.120-122 : libellé `has exactly 18 providers` → `has exactly 20 providers` et assertion `toHaveLength(18)` → `toHaveLength(20)`. 1 ligne de logique, 1 fichier, aucun impact transverse (constante de test uniquement, aucun schema, aucune route, aucun build, aucune variable d'environnement).

## Preuve attendue

`bun run test:run src/lib/ai/ai-types.test.ts` → 39/39 verts ; `bun run test:run` (suite complète) → 0 échec. Sorties réelles dans `preuves.md`.

## Preuve de recette

Recette du propriétaire obtenue par la commande conditionnelle elle-même (« Si confirmé, corrige le chiffre figé »), la confirmation étant apportée ci-dessus sur preuve. Compte rendu transmis à la clôture du cycle.

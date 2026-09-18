# Preuves — hal-search-encoding (test de non-régression)

Date : 2026-09-17 · Groupe A — Tests / non-régression · T1

## Vérification T1 — test ciblé (preuve attendue)

Commande : `bun run test:run src/app/api/theses-en-ligne/search/route.test.ts`

```
 RUN  v4.1.11 /home/z/my-project

 ✓ src/app/api/theses-en-ligne/search/route.test.ts (14 tests) 24ms

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  06:45:17
   Duration  258ms (transform 39ms, setup 0ms, import 103ms, tests 24ms, environment 0ms)
```

## Vérification complémentaire — lint ciblé

Commande : `bunx eslint src/app/api/theses-en-ligne/search/route.test.ts`

```
lint: OK (0 erreur)
```

## Vérification complémentaire — suite complète (état global)

Commande : `bun run test:run`

```
 Test Files  1 failed | 61 passed (62)
      Tests  1 failed | 1427 passed (1428)
   Duration  13.73s
```

Échec identifié — PRÉEXISTANT et hors périmètre :

```
 FAIL  src/lib/ai/ai-types.test.ts > DYNAMIC_MODEL_PROVIDERS > has exactly 18 providers
AssertionError: expected [ 'mistral', 'routesme', …(18) ] to have a length of 18 but got 20
```

Preuve d'indépendance avec le présent cycle (exécution seule de ce test, le fichier
nouveau n'étant pas chargé) :

```
bun run test:run src/lib/ai/ai-types.test.ts
 Test Files  1 failed (1)
      Tests  1 failed | 38 passed (39)
```

Cause apparente (constat, non corrigé — non annoncé) : le catalogue
`src/lib/ai/ai-types.ts` compte 20 providers (dont `routesme`, l.14 et l.76)
alors que le test fige 18. Signalement transmis au propriétaire dans le compte
rendu de groupe.

## Couverture des mécanismes épinglés (14 tests)

- **M1 — fq répétés** (4 tests) : un `fq` par filtre avec valeurs exactes ; aucune
  occurrence de `&`/`%26` dans un `fq` ni de `%26fq%3D` dans l'URL ; `docType_s:THESE`
  seul sans filtre optionnel ; valeur de domaine inconnue ignorée sans fq parasite.
- **M2 — normalisation du tri** (5 tests) : `%2B`, `+`, `%20` → `publicationDateY_i desc`
  upstream ; défaut sans `sort` ; `score+desc` → `score desc`.
- **M3 — encodage final** (4 tests) : aucun `+` littéral dans l'URL complète filtrée ;
  espaces du terme cherché en `%20` (`q=ville%20intelligente`) ; espaces des bornes
  Solr en `%20` (`fq=publicationDateY_i%3A%5B2020%20TO%20*%5D`) ; `+` littéral du terme
  cherché transporté en `%2B` sans conversion en espace (`q=C%2B%2B`).
- **Cohérence** (1 test) : mapping docs HAL → thèses (200, total, titre, année, source).

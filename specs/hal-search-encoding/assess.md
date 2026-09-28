# Bug — hal-search-encoding

> Cycle SDD n°1 — variante bug (`assess.md`). Statut : **verdict rendu, cycle arrêté à la reproduction** (protocole : « Si non reproductible : le dire, s'arrêter »).

## Symptôme

Allégation initiale du propriétaire : échec de la route `/api/theses-en-ligne/search` sur requêtes filtrées (domaine / tri), le `%2B` étant rejeté par Solr/HAL. L'allégation s'appuyait sur les commentaires de code documentant le mécanisme (`src/app/api/theses-en-ligne/search/route.ts` l.83-120), cités lors de l'audit factuel du 2026-09-17.

## Reproduction

Tentée réellement le 2026-09-17 contre le serveur de développement (`next dev` port 3000) et contre l'API HAL en direct. **Résultat : NON REPRODUCTIBLE.** Tous les scénarios retournent HTTP 200 avec filtres, tris et pagination opérationnels.

| # | Scénario | Requête (forme fil exacte) | Résultat |
|---|---|---|---|
| S1 | Baseline | `q=urbanisme` | 200 · numFound 905 · années triées desc |
| S2 | Filtre domaine | `q=urbanisme&domain=shs` | 200 · numFound **802** (< 905 → filtre appliqué) · tous résultats shs |
| S3 | Tri, forme navigateur `+` | `q=urbanisme&sort=publicationDateY_i+desc` | 200 · tri desc vérifié |
| S4 | Tri, forme historique `%2B` | `q=urbanisme&sort=publicationDateY_i%2Bdesc` | 200 · normalisation l.113-116 effective |
| S5 | Bornes d'années | `q=urbanisme&yearMin=2020&yearMax=2024` | 200 · numFound 274 · toutes années ∈ [2020, 2024] |
| S6 | Combiné | `q=urbanisme&domain=info&yearMin=2020&sort=…+desc&page=1` | 200 · numFound 9 · page 1 vide (9 < 15 rows : normal) |
| S6b | S6 page 0 | idem `page=0` | 200 · 9 titres réels (crowd simulation, human mobility…) |
| S6c | Pagination filtrée | idem `rows=5&page=1` | 200 · page 1/2 · 4 résultats reçus |
| S7 | Multi-mots | `q=ville+intelligente` | 200 · numFound 149 |

## Cause racine

**Il n'y a pas de cause racine actuelle dans le code : le bug décrit est celui de l'annexe A.1, corrigé à la racine avant ce cycle.** Constats sourcés :

- Le mécanisme historique est réel — prouvé en direct chez HAL (voir preuves ci-dessous) : `sort` avec `%2B` et `fq` avec `&` interne encodé produisent tous deux l'erreur Solr encapsulée `{"msg": "Error. See help : /docs"}`.
- Le code actuel neutralise les deux mécanismes :
  - `fq` répétés natifs : `params.append("fq", filter)` par filtre — `route.ts` l.105-107 ;
  - normalisation du tri (`%2B` et `+` → espace) : l.113-116 ;
  - encodage final espaces → `%20` : l.120.
- Le frontend est aligné : codes de domaine de la taxonomie HAL réelle (`src/modules/theses-en-ligne/theses-en-ligne-page.tsx` l.70-86), tris à séparateur espace (l.88-93).
- La correction est consignée : `public/RAPPORT-CORRECTIONS-ANNEXE-A1-A13.md` l.13 (« A.1 | Route HAL (construction d'URL) | ✅ corrigé à la racine — preuve 200 réel ») et l.33-36 (causes racines détaillées), mission datée 16/09/2026, ThesisFrame v1.10.7.

## Preuve de la cause

Sorties réelles, non reformulées (HAL en direct, même jour) :

```
── HAL DIRECT — forme historique buguée sort=%2B :
HTTP 200
   réponse: {"msg": "Error. See help : /docs"}

── HAL DIRECT — forme buguée fq (& interne encodé dans UN seul param) :
HTTP 200
   numFound: {'msg': 'Error. See help : /docs'}

── HAL DIRECT — forme corrigée actuelle (fq répétés + sort %20) :
HTTP 200
   numFound: 802
```

Le 802 upstream correspond exactement au 802 de S2 obtenu via la route locale : cohérence bout en bout prouvée.

## Correctif proposé

**Aucun.** Aucun fichier à modifier — le code actuel est correct et prouvé. Le cycle ne démarre pas (pas d'Étape 4).

## Test de non-régression

N/A à ce stade (aucun correctif). Option soumise au propriétaire, hors périmètre du présent cycle : figer le comportement par un test vitest (`route.test.ts` — la route n'en a pas) épinglant : `fq` répétés, normalisation `%2B`/`+` du tri, encodage `%20` final. Décision : [À DÉCIDER] — nouvelle tâche dédiée si retenu.

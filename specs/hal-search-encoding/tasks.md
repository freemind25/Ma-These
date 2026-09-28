# Tasks — hal-search-encoding (test de non-régression)

Contexte : commande du propriétaire suite à `assess.md` (verdict : bug déjà corrigé par l'annexe A.1 ; option « figer le comportement par un test vitest » retenue — décision consignée le 2026-09-17). Cycle n°1 clos sur la partie reproduction ; le présent fichier couvre la phase test, même slug.

Périmètre fermé (commande du propriétaire) : **ce test uniquement, aucune modification de `route.ts`**.

Feu vert préalable : le fichier `src/app/api/theses-en-ligne/search/route.test.ts` a été nommé explicitement par le propriétaire dans la commande (annonce = commande ; article 2 satisfait).

## Groupe A — Tests / non-régression

- [x] T1 — Écrire `src/app/api/theses-en-ligne/search/route.test.ts` (fichier nouveau) épinglant les trois mécanismes prouvés par l'assess : **M1** paramètres `fq` répétés natifs (jamais de `&` interne encodé `%26`), **M2** normalisation du tri `%2B`/`+` → espace, **M3** encodage final `%20` (aucun `+` littéral vers HAL) · mock `global.fetch` avec capture d'URL, zéro réseau réel, zéro modification de `route.ts` · preuve attendue : `bun run test:run src/app/api/theses-en-ligne/search/route.test.ts` → tous les tests verts, sortie collée dans `preuves.md`

Dépendances : aucune. Ce groupe n'est pas [BLOQUANT].

## Convergence — 2026-09-18

Critères d'acceptation satisfaits : 1/1 — T1 recetté par le propriétaire (« Groupe A recetté ») ; test 14/14 verts, preuves dans `preuves.md`. Aucun critère manquant.

Écarts au plan : aucun — périmètre fermé respecté (1 fichier nouveau, `route.ts` intacte, zéro réseau réel dans le test). Note de recette : l'échec préexistant `ai-types.test.ts` (18 figé vs 20 réels) signalé dans le compte rendu de groupe est traité séparément, slug `ai-types-provider-count` ; la mention « routesme+apinex » consignée à titre d'apparence dans `preuves.md` et le worklog est corrigée sur preuve par cette vérification (apinex absent du catalogue — `git log -S 'apinex'` vide ; test né périmé au commit 1359333 du 2026-09-15, jamais vert).

Dette introduite : aucune.

Verdict : CONVERGÉ
